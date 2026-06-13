output "distribution_id" {
  description = "CloudFront distribution id (cache invalidations)."
  value       = aws_cloudfront_distribution.this.id
}

output "distribution_domain_name" {
  description = "CloudFront domain name (dxxxx.cloudfront.net)."
  value       = aws_cloudfront_distribution.this.domain_name
}
