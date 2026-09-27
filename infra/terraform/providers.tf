# Providers and Terraform settings.
#
# Two AWS providers are configured:
#   - default        : main region (var.aws_region) for most resources.
#   - aws.us_east_1  : CloudFront only accepts ACM certificates issued in
#                      us-east-1, so the acm module uses this alias.

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.66"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Remote state in S3 (partial configuration). The bucket is created by the
  # separate bootstrap root (infra/terraform/bootstrap); the concrete values
  # live in backend.hcl (gitignored, copy backend.hcl.example):
  #
  #   terraform init -backend-config=backend.hcl
  #
  # State contains secrets (the origin-verify shared secret), hence the
  # encrypted, TLS-only, private bucket. Locking is S3-native (use_lockfile),
  # which needs Terraform >= 1.10. CI runs `terraform init -backend=false`.
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
