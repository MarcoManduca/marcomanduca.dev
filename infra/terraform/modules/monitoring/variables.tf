variable "project_name" {
  description = "Prefix for resource names."
  type        = string
}

variable "alert_email" {
  description = "Recipient of budget notifications and alarm emails (via SNS)."
  type        = string
}

variable "monthly_budget_usd" {
  description = "Monthly cost budget in USD."
  type        = number
  default     = 10
}

variable "function_name" {
  description = "Backend Lambda function name (alarm dimension)."
  type        = string
}

variable "api_id" {
  description = "API Gateway HTTP API id (alarm dimension)."
  type        = string
}

variable "lambda_errors_threshold" {
  description = "Lambda errors per 5 minutes that trigger the alarm."
  type        = number
  default     = 3
}

variable "lambda_throttles_threshold" {
  description = "Lambda throttles per 5 minutes that trigger the alarm."
  type        = number
  default     = 1
}

variable "api_5xx_threshold" {
  description = "API Gateway 5xx responses per 5 minutes that trigger the alarm."
  type        = number
  default     = 5
}

variable "api_4xx_threshold" {
  description = "API Gateway 4xx responses per 5 minutes that count as a spike."
  type        = number
  default     = 100
}
