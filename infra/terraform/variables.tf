# Root input variables. Copy terraform.tfvars.example to terraform.tfvars
# and adjust values before running terraform plan/apply.

variable "aws_region" {
  description = "Main AWS region for all resources except the CloudFront certificate."
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Short project identifier used to name and tag resources."
  type        = string
  default     = "marcomanduca-dev"
}

variable "environment" {
  description = "Deployment environment name (used in tags)."
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Apex domain of the site (registered in Route 53)."
  type        = string
  default     = "marcomanduca.dev"
}

variable "create_hosted_zone" {
  description = <<-EOT
    Whether Terraform should create the Route 53 hosted zone.
    Set to false if the zone already exists (e.g. created automatically
    when the domain was registered through Route 53) so the dns module
    looks it up with a data source instead.
  EOT
  type        = bool
  default     = false
}

variable "cognito_domain_prefix" {
  description = "Globally unique prefix for the Cognito hosted UI domain (<prefix>.auth.<region>.amazoncognito.com)."
  type        = string
  default     = "marcomanduca-dev-auth"
}

variable "backend_image_tag" {
  description = "ECR image tag used only when the Lambda function is first created (bootstrap). Afterwards deploy-backend.sh owns the image (git-sha tags) and Terraform ignores it."
  type        = string
  default     = "bootstrap"
}

variable "backend_memory_mb" {
  description = "Lambda memory in MiB (also scales CPU). 512 is plenty for this API."
  type        = number
  default     = 512
}

variable "backend_timeout_s" {
  description = "Lambda timeout in seconds."
  type        = number
  default     = 30
}

variable "contact_email" {
  description = "Address that receives contact-form emails. Set it in terraform.tfvars (no default: the infra is not tied to a personal address)."
  type        = string
}

variable "alert_email" {
  description = "Recipient of budget and alarm notifications. null = reuse contact_email."
  type        = string
  default     = null
}

variable "monthly_budget_usd" {
  description = "Monthly AWS cost budget in USD (email at 80% actual, 100% forecasted)."
  type        = number
  default     = 10
}

variable "backend_reserved_concurrency" {
  description = <<-EOT
    Reserved concurrent executions for the backend Lambda (hard cost cap).
    Accounts with a concurrency quota of 10 (typical for new accounts) cannot
    reserve any: the apply fails. Set -1 (no reservation) in that case.
  EOT
  type        = number
  default     = 5
}

variable "api_throttling_rate_limit" {
  description = "API Gateway steady-state rate limit (requests/second) for all routes."
  type        = number
  default     = 20
}

variable "api_throttling_burst_limit" {
  description = <<-EOT
    API Gateway burst limit (requests) for all routes. Keep it at or below the
    concurrency the backend Lambda can really get (its reserved concurrency,
    or the account quota when that is -1): a larger burst reaches Lambda and
    ends as throttles (5xx and alarms) instead of clean 429s at the gateway.
  EOT
  type        = number
  default     = 10
}

variable "contact_rate_limit_daily_max" {
  description = "Global daily cap on contact-form submissions (CONTACT_RATE_LIMIT_DAILY_MAX)."
  type        = number
  default     = 50
}

variable "cognito_mfa_configuration" {
  description = "Cognito MFA enforcement: ON (TOTP required) or OPTIONAL."
  type        = string
  default     = "ON"

  validation {
    condition     = contains(["ON", "OPTIONAL"], var.cognito_mfa_configuration)
    error_message = "cognito_mfa_configuration must be ON or OPTIONAL."
  }
}

variable "enable_dev_client" {
  description = "Create a second Cognito app client with localhost callback/logout URLs for local development."
  type        = bool
  default     = false
}

variable "dmarc_policy" {
  description = "DMARC policy for mail claiming to be from the domain that fails SPF and DKIM alignment: none, quarantine or reject."
  type        = string
  default     = "quarantine"
}

variable "dmarc_report_email" {
  description = "Mailbox for DMARC aggregate reports, or null for none (see modules/email)."
  type        = string
  default     = null
}

variable "origin_verify_secret_previous" {
  description = <<-EOT
    Former X-Origin-Verify secret, still accepted by the backend while a
    rotation propagates to every CloudFront edge. Pass it only for the
    rotation apply, via TF_VAR_origin_verify_secret_previous (never in a
    tfvars file); see infra/README.md, "Rotate origin secret".
  EOT
  type        = string
  default     = ""
  sensitive   = true
}
