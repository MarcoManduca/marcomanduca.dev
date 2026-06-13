output "user_pool_id" {
  description = "Cognito user pool id."
  value       = aws_cognito_user_pool.this.id
}

output "user_pool_arn" {
  description = "Cognito user pool ARN."
  value       = aws_cognito_user_pool.this.arn
}

output "client_id" {
  description = "SPA app client id."
  value       = aws_cognito_user_pool_client.spa.id
}

output "hosted_ui_domain" {
  description = "Full hosted UI domain for the OIDC flow."
  value       = "${aws_cognito_user_pool_domain.this.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
}
