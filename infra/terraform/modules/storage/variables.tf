variable "project_name" {
  description = "Prefix for bucket names (must yield globally unique names)."
  type        = string
}

variable "domain_name" {
  description = "Site domain, used in the media bucket CORS allowed origins."
  type        = string
}
