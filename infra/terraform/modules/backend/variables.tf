variable "project_name" {
  description = "Prefix for resource names."
  type        = string
}

variable "aws_region" {
  description = "Region, needed by the awslogs driver configuration."
  type        = string
}

variable "zone_id" {
  description = "Route 53 hosted zone id (origin certificate validation + origin record)."
  type        = string
}

variable "api_origin_domain" {
  description = "Hostname CloudFront uses to reach the ALB (e.g. api-origin.marcomanduca.dev)."
  type        = string
}

variable "image_tag" {
  description = "ECR image tag used by the task definition."
  type        = string
  default     = "latest"
}

variable "container_port" {
  description = "Port the FastAPI container listens on."
  type        = number
  default     = 8000
}

variable "cpu" {
  description = "Fargate task CPU units."
  type        = number
  default     = 256
}

variable "memory" {
  description = "Fargate task memory in MiB."
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of running tasks."
  type        = number
  default     = 1
}

variable "health_check_path" {
  description = "ALB target group health check path."
  type        = string
  default     = "/api/health"
}

variable "dynamodb_table_arns" {
  description = "ARNs of the DynamoDB tables the task role may access."
  type        = list(string)
}

variable "media_bucket_arn" {
  description = "ARN of the media bucket the task role may access."
  type        = string
}

variable "ses_identity_arn" {
  description = "ARN of the SES identity the task role may send from."
  type        = string
}

variable "container_environment" {
  description = "Plain (non-secret) environment variables for the container."
  type        = map(string)
  default     = {}
}
