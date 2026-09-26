variable "project_name" {
  description = "Prefix for Cognito resource names."
  type        = string
}

variable "domain_name" {
  description = "Site domain used for OAuth callback/logout URLs."
  type        = string
}

variable "cognito_domain_prefix" {
  description = "Globally unique prefix for the hosted UI domain."
  type        = string
}

variable "mfa_configuration" {
  description = "MFA enforcement: ON (TOTP required for every user) or OPTIONAL."
  type        = string
  default     = "ON"
}

variable "enable_dev_client" {
  description = "Create a dev app client with localhost callback/logout URLs."
  type        = bool
  default     = false
}
