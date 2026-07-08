output "ecr_repository_url" {
  description = "ECR repository URL for docker push."
  value       = aws_ecr_repository.backend.repository_url
}

output "function_name" {
  description = "Lambda function name, used by deploy-backend.sh and the CloudFront invoke permission."
  value       = aws_lambda_function.backend.function_name
}

output "function_url_host" {
  description = "Hostname of the Lambda Function URL, used as the CloudFront /api/* origin."
  value       = trimsuffix(trimprefix(aws_lambda_function_url.backend.function_url, "https://"), "/")
}

output "origin_verify_secret_value" {
  description = "Shared secret CloudFront must send in the X-Origin-Verify header."
  value       = random_password.origin_verify.result
  sensitive   = true
}
