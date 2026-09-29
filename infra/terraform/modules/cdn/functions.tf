# CloudFront Functions (viewer-request). Code lives in ./functions/*.js.

# Paths that have a pre-rendered page (key = path such as /projects/foo,
# value unused). The keys follow the published content, so they are owned by
# infra/scripts/deploy-frontend.sh, not by Terraform: an empty store (first
# apply) just serves the SPA shell everywhere, as before.
resource "aws_cloudfront_key_value_store" "routes" {
  name    = "${var.project_name}-routes"
  comment = "Pre-rendered routes (keys managed by deploy-frontend.sh)"
}

# Default behavior: www -> apex redirect, pre-rendered pages, SPA fallback.
resource "aws_cloudfront_function" "site_viewer_request" {
  name    = "${var.project_name}-site-viewer-request"
  runtime = "cloudfront-js-2.0"
  comment = "www redirect + pre-rendered pages + SPA fallback"
  publish = true

  code                         = file("${path.module}/functions/site_viewer_request.js")
  key_value_store_associations = [aws_cloudfront_key_value_store.routes.arn]
}

# /api/*: overwrite x-viewer-ip with the real client IP.
resource "aws_cloudfront_function" "api_viewer_request" {
  name    = "${var.project_name}-api-viewer-request"
  runtime = "cloudfront-js-2.0"
  comment = "Set x-viewer-ip from event.viewer.ip"
  publish = true

  code = file("${path.module}/functions/api_viewer_request.js")
}

# /media/images/*: strip the /media prefix to get the media bucket key.
resource "aws_cloudfront_function" "media_viewer_request" {
  name    = "${var.project_name}-media-viewer-request"
  runtime = "cloudfront-js-2.0"
  comment = "Map /media/images/* to the images/* media bucket keys"
  publish = true

  code = file("${path.module}/functions/media_viewer_request.js")
}
