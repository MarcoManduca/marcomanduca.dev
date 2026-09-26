output "frontend_bucket_name" {
  description = "Name of the frontend (SPA) bucket."
  value       = aws_s3_bucket.this["frontend"].id
}

output "frontend_bucket_arn" {
  description = "ARN of the frontend bucket."
  value       = aws_s3_bucket.this["frontend"].arn
}

output "frontend_bucket_regional_domain" {
  description = "Regional domain name of the frontend bucket (CloudFront origin)."
  value       = aws_s3_bucket.this["frontend"].bucket_regional_domain_name
}

output "media_bucket_name" {
  description = "Name of the media bucket."
  value       = aws_s3_bucket.this["media"].id
}

output "media_bucket_arn" {
  description = "ARN of the media bucket."
  value       = aws_s3_bucket.this["media"].arn
}

output "media_bucket_domains" {
  description = "Hostnames presigned media URLs may use (global and regional virtual-hosted style), for the CSP."
  value = [
    aws_s3_bucket.this["media"].bucket_domain_name,
    aws_s3_bucket.this["media"].bucket_regional_domain_name,
  ]
}
