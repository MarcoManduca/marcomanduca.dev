output "distribution_id" {
  description = "CloudFront distribution id (cache invalidations)."
  value       = aws_cloudfront_distribution.this.id
}

output "distribution_domain_name" {
  description = "CloudFront domain name (dxxxx.cloudfront.net)."
  value       = aws_cloudfront_distribution.this.domain_name
}

output "routes_kvs_arn" {
  description = "ARN of the key value store listing the pre-rendered routes (deploy-frontend.sh)."
  value       = aws_cloudfront_key_value_store.routes.arn
}
