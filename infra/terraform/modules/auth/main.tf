# Cognito user pool for the admin panel.
#
# Sign-up is admin-only (this is a personal site: a single administrator is
# created manually, see infra/README.md step 5). The SPA authenticates with
# the OIDC authorization-code flow through the Cognito hosted UI, so the app
# client is public (no secret) and only the code flow is allowed.
#
# MFA: TOTP (authenticator app) is required. After this is applied, the admin
# is asked to enroll a TOTP device at the next hosted UI login.
#
# Local development uses a separate app client (enable_dev_client) so the
# production client never accepts localhost redirect URLs.

locals {
  # Settings shared by the production and the dev SPA clients.
  client_token_validity = {
    access_token_hours = 1
    id_token_hours     = 1
    refresh_token_days = 30
  }
}

data "aws_region" "current" {}

resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # The pool holds the only admin identity: never delete it by accident.
  deletion_protection = "ACTIVE"

  mfa_configuration = var.mfa_configuration

  software_token_mfa_configuration {
    enabled = true
  }

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

  callback_urls = ["https://${var.domain_name}/admin/callback"]
  logout_urls   = ["https://${var.domain_name}/"]

  # Short-lived tokens, refresh capped at 30 days (no infinite sessions).
  access_token_validity  = local.client_token_validity.access_token_hours
  id_token_validity      = local.client_token_validity.id_token_hours
  refresh_token_validity = local.client_token_validity.refresh_token_days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  prevent_user_existence_errors = "ENABLED"
}

# Dev-only client for the Vite dev server (http://localhost:5173). Created
# only when enable_dev_client = true; keep it off in production.
resource "aws_cognito_user_pool_client" "dev" {
  count = var.enable_dev_client ? 1 : 0

  name         = "${var.project_name}-spa-dev"
  user_pool_id = aws_cognito_user_pool.this.id

  generate_secret = false

  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  supported_identity_providers         = ["COGNITO"]

  callback_urls = ["http://localhost:5173/admin/callback"]
  logout_urls   = ["http://localhost:5173/"]

  access_token_validity  = local.client_token_validity.access_token_hours
  id_token_validity      = local.client_token_validity.id_token_hours
  refresh_token_validity = local.client_token_validity.refresh_token_days

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
