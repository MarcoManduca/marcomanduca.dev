# Response headers policies applied at the edge.
#
#   security : SPA responses (default behavior). The SPA is served from S3,
#              so CloudFront is the only place that sees every response.
#   api      : /api/* JSON responses — a locked-down CSP since JSON is never
#              rendered as a document.

locals {
  # External origins the SPA really talks to (checked in frontend/src):
  #   - presigned S3 URLs: admin uploads (PUT); uploaded images are served
  #     same-origin under /media/images/*
  #   - Cognito: OIDC discovery/JWKS (cognito-idp) and the token endpoint
  #     on the hosted UI domain (fetch -> connect-src)
  media_origins = [for d in var.media_bucket_domains : "https://${d}"]

  site_csp = join("; ", [
    "default-src 'self'",
    # Project/article images are admin-authored URLs: uploads come from
    # /media/images/* ('self'), but external https images are allowed too.
    # Images can't execute code; script-src stays locked to 'self'.
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    # Inline styles are needed by KaTeX; scripts are hashed Vite bundles.
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self'",
    join(" ", concat(["connect-src 'self'"], var.cognito_origins, local.media_origins)),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ])

  permissions_policy = join(", ", [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "payment=()",
    "usb=()",
    "interest-cohort=()",
    "browsing-topics=()",
  ])
}

resource "aws_cloudfront_response_headers_policy" "security" {
  name = "${var.project_name}-security-headers"

  security_headers_config {
    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    strict_transport_security {
      access_control_max_age_sec = 63072000 # 2 years
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    content_security_policy {
      content_security_policy = local.site_csp
      override                = true
    }
  }

  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      value    = local.permissions_policy
      override = true
    }
  }
}

resource "aws_cloudfront_response_headers_policy" "api" {
  name = "${var.project_name}-api-security-headers"

  security_headers_config {
    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "no-referrer"
      override        = true
    }

    strict_transport_security {
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    content_security_policy {
      content_security_policy = "default-src 'none'; frame-ancestors 'none'"
      override                = true
    }
  }
}
