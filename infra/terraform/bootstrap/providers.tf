# Bootstrap root: creates the S3 bucket that holds the main root's remote state.
#
# This root keeps its own state LOCAL on purpose (chicken-and-egg: the state
# bucket cannot store the state of its own creation). Its state holds nothing
# secret — only the bucket definition — and is gitignored.
#
#   cd infra/terraform/bootstrap
#   terraform init && terraform apply
#
# See infra/README.md, "Remote state" for the full migration runbook.

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.66"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "terraform-bootstrap"
    }
  }
}
