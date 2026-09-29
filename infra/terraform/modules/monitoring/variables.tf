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

variable "ses_bounce_rate_threshold" {
  description = "SES reputation bounce rate (0-1) that triggers the alarm; SES reviews accounts at 0.05."
  type        = number
  default     = 0.04
}

variable "ses_complaint_rate_threshold" {
  description = "SES reputation complaint rate (0-1) that triggers the alarm; SES reviews accounts at 0.001."
  type        = number
  default     = 0.0008
}


variable "ecr_repository_name" {
  description = "Backend ECR repository whose scan findings are alerted on."
  type        = string
}
