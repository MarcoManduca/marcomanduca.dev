# DynamoDB tables, all on-demand (PAY_PER_REQUEST) — no capacity planning,
# pennies per month at personal-site traffic.
#
#   projects     : pk slug                  — one item per project
#   learning     : pk slug, sk version (N)  — versioned articles (rollback)
#   technologies : pk id                    — technology catalog
#
# Keys MUST match the backend access layer in backend/src/models/*.py.
#
#   ratelimit    : pk pk, TTL expires_at   — contact-form rate-limit counters
#
# Point-in-time recovery and deletion protection are enabled on the three
# content tables: PITR is the cheapest backup for tiny tables, and deletion
# protection blocks an accidental `terraform destroy` / console delete (turn
# it off explicitly before a deliberate teardown). Encryption at rest uses
# the AWS-owned key (free).

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

  deletion_protection_enabled = true

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

  deletion_protection_enabled = true

  point_in_time_recovery {
    enabled = true
  }
}

# Contact-form rate limiting. Holds one counter item per client+window; the
# backend reads/increments it atomically (see backend/src/utils/rate_limit.py).
# TTL lets DynamoDB purge expired windows for free, so the table stays tiny.
# No PITR and no deletion protection: the data is ephemeral and worthless.
resource "aws_dynamodb_table" "ratelimit" {
  name         = "${var.project_name}-ratelimit"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"

  attribute {
    name = "pk"
    type = "S"
  }

  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }
}
