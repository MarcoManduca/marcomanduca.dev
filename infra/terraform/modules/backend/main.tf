# Backend runtime: FastAPI container on ECS Fargate behind an ALB.
#
# Traffic path:
#   CloudFront /api/*  ──HTTPS──>  ALB (api-origin.<domain>)  ──>  Fargate task
#
# Security model:
#   - The ALB only accepts traffic from CloudFront's origin-facing IP
#     ranges (AWS-managed prefix list) AND requires the X-Origin-Verify
#     header, whose random value only CloudFront knows. Direct hits on the
#     ALB get a 403.
#   - CloudFront -> ALB is HTTPS: a dedicated regional ACM certificate is
#     issued for api-origin.<domain> (TLS everywhere, no plaintext leg).
#   - Tasks run in the default-VPC public subnets with a public IP instead
#     of private subnets + NAT gateway: a NAT gateway alone costs ~32 USD a
#     month, far more than this whole site. The task security group accepts
#     ingress exclusively from the ALB security group.
#
# Files in this module:
#   main.tf  — networking data sources, origin-verify secret
#   ecr.tf   — container registry
#   alb.tf   — origin certificate, load balancer, listener, DNS record
#   ecs.tf   — cluster, task definition, service, logs
#   iam.tf   — execution role + least-privilege task role

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# CloudFront origin-facing IP ranges, maintained by AWS.
data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

# Shared secret between CloudFront and the ALB. Rotating it is a plain
# `terraform apply` after tainting: terraform apply -replace=module.backend.random_password.origin_verify
resource "random_password" "origin_verify" {
  length  = 32
  special = false
}
