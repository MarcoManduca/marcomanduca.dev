variable "project_name" {
  description = "Prefix for resource names."
  type        = string
}

variable "image_tag" {
  description = "ECR image tag the Lambda function points to."
  type        = string
  default     = "latest"
}

variable "architecture" {
  description = "Lambda instruction set. arm64 (Graviton) is cheaper and faster."
  type        = string
  default     = "arm64"
}

variable "memory_mb" {
  description = "Lambda memory in MiB (also scales CPU proportionally)."
  type        = number
  default     = 512
}

variable "timeout_s" {
  description = "Lambda timeout in seconds."
  type        = number
  default     = 30
}

variable "dynamodb_table_arns" {
  description = "ARNs of the DynamoDB tables the function may access."
  type        = list(string)
}

variable "media_bucket_arn" {
  description = "ARN of the media bucket the function may access."
  type        = string
}

variable "ses_identity_arn" {
  description = "ARN of the SES identity the function may send from."
  type        = string
}

variable "container_environment" {
  description = "Plain (non-secret) environment variables for the function."
  type        = map(string)
  default     = {}
}
