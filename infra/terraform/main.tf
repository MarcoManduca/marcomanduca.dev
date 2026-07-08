# Module wiring. Each module owns a single concern (see modules/<name>).
#
# Dependency flow:
#   dns ──> acm (us-east-1 cert) ──> cdn
#   dns ──> email (SES DNS records)
#   storage / database / auth ──> backend (IAM scoping + env vars)
#   storage + backend + acm ──> cdn (origins, certificate, aliases, invoke perm)

module "dns" {
  source = "./modules/dns"

  domain_name        = var.domain_name
  create_hosted_zone = var.create_hosted_zone
}

module "acm" {
  source = "./modules/acm"

  providers = {
    aws = aws.us_east_1
  }

  domain_name = var.domain_name
  zone_id     = module.dns.zone_id
}

module "storage" {
  source = "./modules/storage"

  project_name = var.project_name
  domain_name  = var.domain_name
}

module "database" {
  source = "./modules/database"

  project_name = var.project_name
}

module "auth" {
  source = "./modules/auth"

  project_name          = var.project_name
  domain_name           = var.domain_name
  cognito_domain_prefix = var.cognito_domain_prefix
}

module "email" {
  source = "./modules/email"

  domain_name = var.domain_name
  zone_id     = module.dns.zone_id
}

module "backend" {
  source = "./modules/backend"

  project_name = var.project_name

  image_tag = var.backend_image_tag
  memory_mb = var.backend_memory_mb
  timeout_s = var.backend_timeout_s

  # Least-privilege IAM scoping for the execution role.
  dynamodb_table_arns = module.database.table_arns
  media_bucket_arn    = module.storage.media_bucket_arn
  ses_identity_arn    = module.email.identity_arn

  # Environment variables injected into the FastAPI container.
  # Names MUST match the backend Settings fields in backend/src/config.py
  # (each attribute maps to its upper-case env var, e.g. projects_table_name → PROJECTS_TABLE_NAME).
  # AWS_REGION / AWS_DEFAULT_REGION are reserved on Lambda (the runtime injects
  # them automatically), so they must not appear here — boto3 and the app read
  # them from the runtime environment.
  container_environment = {
    APP_ENV                 = var.environment
    PROJECTS_TABLE_NAME     = module.database.table_names["projects"]
    LEARNING_TABLE_NAME     = module.database.table_names["learning"]
    TECHNOLOGIES_TABLE_NAME = module.database.table_names["technologies"]
    RATELIMIT_TABLE_NAME    = module.database.table_names["ratelimit"]
    MEDIA_BUCKET_NAME       = module.storage.media_bucket_name
    COGNITO_USER_POOL_ID    = module.auth.user_pool_id
    COGNITO_CLIENT_ID       = module.auth.client_id
    SES_SENDER_EMAIL        = "noreply@${var.domain_name}"
    SES_RECIPIENT_EMAIL     = var.contact_email
    CORS_ORIGINS            = "https://${var.domain_name}"
  }
}

module "cdn" {
  source = "./modules/cdn"

  project_name    = var.project_name
  domain_name     = var.domain_name
  zone_id         = module.dns.zone_id
  certificate_arn = module.acm.certificate_arn

  # Default origin: private frontend bucket via Origin Access Control.
  frontend_bucket_id              = module.storage.frontend_bucket_name
  frontend_bucket_arn             = module.storage.frontend_bucket_arn
  frontend_bucket_regional_domain = module.storage.frontend_bucket_regional_domain

  # /api/* origin: the backend API Gateway HTTP API, guarded by a secret header.
  backend_origin_host        = module.backend.api_origin_host
  origin_verify_secret_value = module.backend.origin_verify_secret_value
}
