# Providers and Terraform settings.
#
# Two AWS providers are configured:
#   - default        : main region (var.aws_region) for most resources.
#   - aws.us_east_1  : CloudFront only accepts ACM certificates issued in
#                      us-east-1, so the acm module uses this alias.

terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state backend (recommended).
  #
  # 1. Create the state bucket once (see infra/README.md, step 2):
  #      aws s3api create-bucket --bucket <your-tf-state-bucket> \
  #        --region eu-west-1 --create-bucket-configuration LocationConstraint=eu-west-1
  # 2. Uncomment the block below, replace the bucket name, then run:
  #      terraform init -migrate-state
  #
  # backend "s3" {
  #   bucket       = "<your-tf-state-bucket>"
  #   key          = "marcomanduca.dev/terraform.tfstate"
  #   region       = "eu-west-1"
  #   encrypt      = true
  #   use_lockfile = true # S3-native state locking (Terraform >= 1.10)
  # }
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
