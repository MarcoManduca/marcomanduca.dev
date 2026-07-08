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

variable "backend_function_url_host" {
  description = "Hostname of the backend Lambda Function URL (origin for /api/*)."
  type        = string
}

variable "backend_function_name" {
  description = "Backend Lambda function name (for the CloudFront invoke permission)."
  type        = string
}
