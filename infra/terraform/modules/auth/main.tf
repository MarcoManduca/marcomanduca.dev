# Cognito user pool for the admin panel.
#
# Sign-up is admin-only (this is a personal site: a single administrator is
# created manually, see infra/README.md step 5). The SPA authenticates with
# the OIDC authorization-code flow through the Cognito hosted UI, so the app
# client is public (no secret) and only the code flow is allowed.

data "aws_region" "current" {}

resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  password_policy {
    minimum_length    = 12
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}

resource "aws_cognito_user_pool_client" "spa" {
  name         = "${var.project_name}-spa"
  user_pool_id = aws_cognito_user_pool.this.id

  # Public client: a browser SPA cannot keep a secret.
  generate_secret = false

  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  supported_identity_providers         = ["COGNITO"]

  callback_urls = [
    "https://${var.domain_name}/admin/callback",
    "http://localhost:5173/admin/callback",
  ]
  logout_urls = [
    "https://${var.domain_name}/",
    "http://localhost:5173/",
  ]

  # Short-lived tokens, refresh capped at 30 days (no infinite sessions).
  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  prevent_user_existence_errors = "ENABLED"
}

resource "aws_cognito_user_pool_domain" "this" {
  domain       = var.cognito_domain_prefix
  user_pool_id = aws_cognito_user_pool.this.id
}

# Membership in this group is what grants access to /admin (the backend
# checks the cognito:groups claim in the JWT).
resource "aws_cognito_user_group" "administrators" {
  name         = "Administrators"
  user_pool_id = aws_cognito_user_pool.this.id
  description  = "Users allowed to access the admin panel."
}
