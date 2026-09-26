variable "project_name" {
  description = "Prefix for resource names."
  type        = string
}

variable "domain_name" {
  description = "Apex domain served by the distribution (www is added automatically)."
  type        = string
}

variable "zone_id" {
  description = "Route 53 hosted zone id for the apex/www alias records."
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the us-east-1 ACM certificate (apex + www)."
  type        = string
}

variable "frontend_bucket_id" {
  description = "Name of the frontend bucket (for the bucket policy)."
  type        = string
}

variable "frontend_bucket_arn" {
  description = "ARN of the frontend bucket."
  type        = string
}

variable "frontend_bucket_regional_domain" {
  description = "Regional domain name of the frontend bucket (S3 origin)."
  type        = string
}

variable "backend_origin_host" {
  description = "Hostname of the backend API Gateway HTTP API (origin for /api/*)."
  type        = string
}

variable "origin_verify_secret_value" {
  description = "Shared secret sent to the API Gateway origin in the X-Origin-Verify header."
  type        = string
  sensitive   = true
}

variable "media_bucket_domains" {
  description = "Media bucket hostnames used by presigned URLs (CSP img-src/connect-src)."
  type        = list(string)
}

variable "cognito_origins" {
  description = "Cognito origins the SPA fetches from (CSP connect-src), e.g. https://<prefix>.auth.<region>.amazoncognito.com."
  type        = list(string)
}
