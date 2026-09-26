# CloudFront Functions (viewer-request). Code lives in ./functions/*.js.

# Default behavior: www -> apex redirect + SPA deep-link rewrite.
resource "aws_cloudfront_function" "site_viewer_request" {
  name    = "${var.project_name}-site-viewer-request"
  runtime = "cloudfront-js-2.0"
  comment = "www redirect + SPA fallback to /index.html"
  publish = true

  code = templatefile("${path.module}/functions/site_viewer_request.js", {
    domain_name = var.domain_name
  })
}

# /api/*: overwrite x-viewer-ip with the real client IP.
resource "aws_cloudfront_function" "api_viewer_request" {
  name    = "${var.project_name}-api-viewer-request"
  runtime = "cloudfront-js-2.0"
  comment = "Set x-viewer-ip from event.viewer.ip"
  publish = true

  code = file("${path.module}/functions/api_viewer_request.js")
}
