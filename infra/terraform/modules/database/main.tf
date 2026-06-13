# DynamoDB tables, all on-demand (PAY_PER_REQUEST) — no capacity planning,
# pennies per month at personal-site traffic.
#
#   projects     : pk slug                  — one item per project
#   learning     : pk slug, sk version (N)  — versioned articles (rollback)
#   technologies : pk id                    — technology catalog
#
# Keys MUST match the backend access layer in backend/src/models/*.py.
#
# Point-in-time recovery is enabled everywhere: it is the cheapest backup
# for tiny tables. Encryption at rest uses the AWS-owned key (free).

locals {
  simple_tables = {
    projects     = "slug"
    technologies = "id"
  }
}

resource "aws_dynamodb_table" "simple" {
  for_each = local.simple_tables

  name         = "${var.project_name}-${each.key}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = each.value

  attribute {
    name = each.value
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }
}

resource "aws_dynamodb_table" "learning" {
  name         = "${var.project_name}-learning"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "slug"
  range_key    = "version"

  attribute {
    name = "slug"
    type = "S"
  }

  attribute {
    name = "version"
    type = "N"
  }

  point_in_time_recovery {
    enabled = true
  }
}
