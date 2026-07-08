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
  description = "Tag of the backend image in ECR used by the Lambda function. The deploy script pushes immutable git-sha tags and moves 'latest'."
  type        = string
  default     = "latest"
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
