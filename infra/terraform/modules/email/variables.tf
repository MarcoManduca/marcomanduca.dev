variable "domain_name" {
  description = "Domain to verify as an SES sending identity."
  type        = string
}

variable "zone_id" {
  description = "Route 53 hosted zone id for the verification and DKIM records."
  type        = string
}

variable "dmarc_policy" {
  description = "DMARC policy for mail that fails both SPF and DKIM alignment: none, quarantine or reject."
  type        = string
  default     = "quarantine"

  validation {
    condition     = contains(["none", "quarantine", "reject"], var.dmarc_policy)
    error_message = "dmarc_policy must be none, quarantine or reject."
  }
}

variable "dmarc_report_email" {
  description = <<-EOT
    Mailbox for DMARC aggregate reports (rua), or null for none. Receivers
    only send reports to another domain when that domain authorizes it, so
    use an inbox on this domain or one that publishes the authorization.
  EOT
  type        = string
  default     = null
}

