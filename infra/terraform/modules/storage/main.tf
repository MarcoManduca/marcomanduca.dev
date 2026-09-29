# S3 buckets.
#
#   frontend : built SPA assets, fully private. CloudFront reads it through
#              an Origin Access Control; the bucket policy that allows this
#              lives in the cdn module (it needs the distribution ARN).
#   media    : project/learning images and CV exports under the prefixes
#              images/projects/, images/learning/ and cv/. Private: the
#              admin uploads through presigned PUT URLs, CloudFront reads
#              images/* through an OAC (served as /media/images/*) and the
#              CV is only reachable through presigned GET URLs.
#
# Both buckets: SSE-S3 encryption, versioning, all public access blocked,
# TLS-only access (aws:SecureTransport deny). Both bucket policies live in
# the cdn module, since they need the distribution ARN (a bucket has one
# policy, so the TLS deny is merged into it).

locals {
  buckets = {
    frontend = "${var.project_name}-frontend"
    media    = "${var.project_name}-media"
  }
}

resource "aws_s3_bucket" "this" {
  for_each = local.buckets

  bucket = each.value
}

resource "aws_s3_bucket_versioning" "this" {
  for_each = aws_s3_bucket.this

  bucket = each.value.id

  versioning_configuration {
    status = "Enabled"
  }
}

# SSE-S3 (AES256) on purpose: public site assets and portfolio images do not
# justify a customer-managed KMS key (cost + per-request KMS charges).
#trivy:ignore:AVD-AWS-0132
resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  for_each = aws_s3_bucket.this

  bucket = each.value.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  for_each = aws_s3_bucket.this

  bucket = each.value.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# The admin uploads with a cross-origin fetch PUT to a presigned URL, so the
# media bucket needs CORS for the site origin. Nothing else is cross-origin:
# images are served same-origin (/media/images/*) and the CV opens by
# navigation. www always redirects to the apex, so it never uploads.
# localhost is only allowed alongside the dev Cognito client.
resource "aws_s3_bucket_cors_configuration" "media" {
  bucket = aws_s3_bucket.this["media"].id

  cors_rule {
    allowed_methods = ["PUT"]
    allowed_origins = concat(
      ["https://${var.domain_name}"],
      var.allow_dev_origin ? ["http://localhost:5173"] : [],
    )
    allowed_headers = ["*"]
    max_age_seconds = 3600
  }
}

# Keep storage costs flat: drop non-current object versions after 30 days
# (on the frontend bucket every deploy overwrites index.html & co.).
resource "aws_s3_bucket_lifecycle_configuration" "this" {
  for_each = aws_s3_bucket.this

  bucket = each.value.id

  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# The media lifecycle rule used to be a standalone resource; keep its state.
moved {
  from = aws_s3_bucket_lifecycle_configuration.media
  to   = aws_s3_bucket_lifecycle_configuration.this["media"]
}
