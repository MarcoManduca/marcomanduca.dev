variable "project_name" {
  description = "Prefix for resource names."
  type        = string
}

variable "image_tag" {
  description = "ECR image tag used only when the function is first created (deploy-backend.sh owns it afterwards)."
  type        = string
  default     = "bootstrap"
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

variable "ses_sender_email" {
  description = "Sender address the function may use (ses:FromAddress condition)."
  type        = string
}

variable "reserved_concurrency" {
  description = "Reserved concurrent executions (cost cap). -1 = no reservation (required on accounts with a concurrency quota of 10)."
  type        = number
  default     = 5
}

variable "throttling_rate_limit" {
  description = "API Gateway stage steady-state request rate limit (requests/second)."
  type        = number
  default     = 20
}

variable "throttling_burst_limit" {
  description = "API Gateway stage burst limit (requests)."
  type        = number
  default     = 40
}
