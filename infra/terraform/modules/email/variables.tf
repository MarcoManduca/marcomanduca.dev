variable "domain_name" {
  description = "Domain to verify as an SES sending identity."
  type        = string
}

variable "zone_id" {
  description = "Route 53 hosted zone id for the verification and DKIM records."
  type        = string
}
