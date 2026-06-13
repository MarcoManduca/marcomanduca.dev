variable "domain_name" {
  description = "Apex domain of the hosted zone."
  type        = string
}

variable "create_hosted_zone" {
  description = "Create the hosted zone (true) or look up an existing one (false)."
  type        = bool
  default     = false
}
