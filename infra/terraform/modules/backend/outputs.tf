output "ecr_repository_url" {
  description = "ECR repository URL for docker push."
  value       = aws_ecr_repository.backend.repository_url
}

output "function_name" {
  description = "Lambda function name, used by deploy-backend.sh and the CloudFront invoke permission."
  value       = aws_lambda_function.backend.function_name
}

output "api_origin_host" {
  description = "Hostname of the API Gateway HTTP API, used as the CloudFront /api/* origin."
  value       = trimprefix(aws_apigatewayv2_api.backend.api_endpoint, "https://")
}

output "origin_verify_secret_value" {
  description = "Shared secret CloudFront must send in the X-Origin-Verify header."
  value       = random_password.origin_verify.result
  sensitive   = true
}

output "api_id" {
  description = "API Gateway HTTP API id (CloudWatch alarm dimension)."
  value       = aws_apigatewayv2_api.backend.id
}

output "ecr_repository_name" {
  description = "ECR repository name (scan-finding alerts)."
  value       = aws_ecr_repository.backend.name
}
