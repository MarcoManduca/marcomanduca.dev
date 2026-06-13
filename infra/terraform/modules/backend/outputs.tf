output "ecr_repository_url" {
  description = "ECR repository URL for docker push."
  value       = aws_ecr_repository.backend.repository_url
}

output "cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.this.name
}

output "service_name" {
  description = "ECS service name."
  value       = aws_ecs_service.backend.name
}

output "alb_dns_name" {
  description = "ALB DNS name."
  value       = aws_lb.this.dns_name
}

output "api_origin_domain" {
  description = "Hostname CloudFront must use as the /api/* origin."
  value       = aws_route53_record.api_origin.fqdn
}

output "origin_verify_secret_value" {
  description = "Shared secret CloudFront must send in the X-Origin-Verify header."
  value       = random_password.origin_verify.result
  sensitive   = true
}
