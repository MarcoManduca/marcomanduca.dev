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
