# CloudFront distribution serving the whole site:
#
#   default behavior : SPA assets from the private frontend bucket (OAC)
#   /api/*           : FastAPI via the API Gateway HTTP API (secret header)
#   /media/images/*  : uploaded images from the private media bucket (OAC)
#
# Extras (see functions.tf / headers.tf):
#   - SPA deep links: a viewer-request CloudFront Function on the DEFAULT
#     behavior rewrites extension-less paths to the route's pre-rendered page
#     (listed in a key value store) or to /index.html. There is no
#     distribution-wide custom_error_response, so real API statuses
#     (401/403/404/429...) pass through untouched and a missing asset is a
#     real 404 (the OAC may ListBucket) instead of index.html with a 200.
#   - The same function 301-redirects www.<domain> to the apex.
#   - /api/*: a viewer-request function sets x-viewer-ip (real client IP).
#   - /media/images/*: a viewer-request function strips "/media" so the URI
#     is the bucket key. Only images/* is readable; cv/ stays behind
#     presigned URLs.

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer_except_host" {
  name = "Managed-AllViewerExceptHostHeader"
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.project_name}-frontend"
  description                       = "OAC for the private frontend bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_origin_access_control" "media" {
  name                              = "${var.project_name}-media"
  description                       = "OAC for the uploaded images in the private media bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# No WAF: a web ACL costs ~6+ USD/month, more than the whole stack. Abuse is
# capped by API Gateway throttling, Lambda reserved concurrency and the
# backend rate limiter instead.
#trivy:ignore:AVD-AWS-0011
resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = var.domain_name
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # EU + North America is enough
  aliases             = [var.domain_name, "www.${var.domain_name}"]

  origin {
    origin_id                = "frontend-s3"
    domain_name              = var.frontend_bucket_regional_domain
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  origin {
    origin_id                = "media-s3"
    domain_name              = var.media_bucket_regional_domain
    origin_access_control_id = aws_cloudfront_origin_access_control.media.id
  }

  origin {
    origin_id   = "backend-lambda"
    domain_name = var.backend_origin_host

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    # Proves to the app that the request came through CloudFront.
    custom_header {
      name  = "X-Origin-Verify"
      value = var.origin_verify_secret_value
    }
  }

  default_cache_behavior {
    target_origin_id           = "frontend-s3"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    compress                   = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.site_viewer_request.arn
    }
  }

  ordered_cache_behavior {
    path_pattern               = "/api/*"
    target_origin_id           = "backend-lambda"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods             = ["GET", "HEAD"]
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.api.id
    compress                   = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.api_viewer_request.arn
    }
  }

  # Uploaded images: keys carry a random UUID, so they never change and can
  # be cached like the hashed SPA assets.
  ordered_cache_behavior {
    path_pattern               = "/media/images/*"
    target_origin_id           = "media-s3"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    compress                   = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.media_viewer_request.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# Only this distribution may read the frontend bucket, and only over TLS.
data "aws_iam_policy_document" "frontend_bucket" {
  statement {
    sid       = "AllowCloudFrontOAC"
    actions   = ["s3:GetObject"]
    resources = ["${var.frontend_bucket_arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.this.arn]
    }
  }

  # ListBucket lets S3 answer 404 (instead of 403) for a missing asset, so
  # broken asset links surface as real "not found" responses.
  statement {
    sid       = "AllowCloudFrontOACList"
    actions   = ["s3:ListBucket"]
    resources = [var.frontend_bucket_arn]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.this.arn]
    }
  }

  statement {
    sid     = "DenyInsecureTransport"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      var.frontend_bucket_arn,
      "${var.frontend_bucket_arn}/*",
    ]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = var.frontend_bucket_id
  policy = data.aws_iam_policy_document.frontend_bucket.json
}

# The distribution may read the uploaded images (images/* only: the CV under
# cv/ stays private, reachable only through presigned URLs), and every request
# must use TLS. Without ListBucket a missing image is a 403, which is fine.
data "aws_iam_policy_document" "media_bucket" {
  statement {
    sid       = "AllowCloudFrontOACImages"
    actions   = ["s3:GetObject"]
    resources = ["${var.media_bucket_arn}/images/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.this.arn]
    }
  }

  statement {
    sid     = "DenyInsecureTransport"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      var.media_bucket_arn,
      "${var.media_bucket_arn}/*",
    ]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

# Moved here from the storage module (it needs the distribution ARN); see the
# moved block in the root main.tf.
resource "aws_s3_bucket_policy" "media" {
  bucket = var.media_bucket_id
  policy = data.aws_iam_policy_document.media_bucket.json
}

# Public DNS: apex + www -> CloudFront (A for IPv4, AAAA for IPv6).
resource "aws_route53_record" "site" {
  for_each = {
    apex-a    = { name = var.domain_name, type = "A" }
    apex-aaaa = { name = var.domain_name, type = "AAAA" }
    www-a     = { name = "www.${var.domain_name}", type = "A" }
    www-aaaa  = { name = "www.${var.domain_name}", type = "AAAA" }
  }

  zone_id = var.zone_id
  name    = each.value.name
  type    = each.value.type

  alias {
    name                   = aws_cloudfront_distribution.this.domain_name
    zone_id                = aws_cloudfront_distribution.this.hosted_zone_id
    evaluate_target_health = false
  }
}
