variable "domain_name" {
  description = "Apex domain covered by the certificate (www.<domain> is added as a SAN)."
  type        = string
}

variable "zone_id" {
  description = "Route 53 hosted zone id where DNS validation records are created."
  type        = string
}
