# Root outputs. The infra/README.md env-var mapping table explains which
# output feeds which backend/.env or frontend/.env entry.

output "name_servers" {
  description = "Route 53 name servers (only relevant when the zone was created by Terraform)."
  value       = module.dns.name_servers
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain (d123.cloudfront.net)."
  value       = module.cdn.distribution_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution id, needed by deploy-frontend.sh for cache invalidation."
  value       = module.cdn.distribution_id
}

output "frontend_bucket_name" {
  description = "S3 bucket hosting the built SPA, target of deploy-frontend.sh."
  value       = module.storage.frontend_bucket_name
}

output "media_bucket_name" {
  description = "S3 bucket for project/learning images and CV exports (private, presigned URLs)."
  value       = module.storage.media_bucket_name
}

output "dynamodb_table_names" {
  description = "Map of logical name -> DynamoDB table name."
  value       = module.database.table_names
}

output "ecr_repository_url" {
  description = "ECR repository URL for the backend image, used by deploy-backend.sh."
  value       = module.backend.ecr_repository_url
}

output "backend_function_name" {
  description = "Backend Lambda function name, used by deploy-backend.sh."
  value       = module.backend.function_name
}

output "cognito_user_pool_id" {
  description = "Cognito user pool id (backend JWT validation + frontend OIDC config)."
  value       = module.auth.user_pool_id
}

output "cognito_client_id" {
  description = "Cognito app client id for the SPA."
  value       = module.auth.client_id
}

output "cognito_hosted_ui_domain" {
  description = "Full Cognito hosted UI domain for the OIDC code flow."
  value       = module.auth.hosted_ui_domain
}

output "ses_identity_arn" {
  description = "SES domain identity ARN."
  value       = module.email.identity_arn
}
