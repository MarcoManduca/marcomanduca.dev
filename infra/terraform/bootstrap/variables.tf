variable "aws_region" {
  description = "Region of the state bucket (keep it equal to the main root's region)."
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Project identifier used for tagging."
  type        = string
  default     = "marcomanduca-dev"
}

variable "state_bucket_name" {
  description = "Globally unique name of the Terraform state bucket."
  type        = string
  default     = "marcomanduca-dev-tfstate"
}
