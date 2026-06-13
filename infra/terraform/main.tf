# Module wiring. Each module owns a single concern (see modules/<name>).
#
# Dependency flow:
#   dns ──> acm (us-east-1 cert) ──> cdn
#   dns ──> email (SES DNS records)
#   dns ──> backend (origin certificate validation + origin record)
#   storage / database / auth ──> backend (IAM scoping + env vars)
#   storage + backend + acm ──> cdn (origins, certificate, aliases)

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

  project_name      = var.project_name
  aws_region        = var.aws_region
  zone_id           = module.dns.zone_id
  api_origin_domain = "api-origin.${var.domain_name}"

  image_tag         = var.backend_image_tag
  container_port    = var.backend_container_port
  cpu               = var.backend_cpu
  memory            = var.backend_memory
  desired_count     = var.backend_desired_count
  health_check_path = var.backend_health_check_path

  # Least-privilege IAM scoping for the task role.
  dynamodb_table_arns = module.database.table_arns
  media_bucket_arn    = module.storage.media_bucket_arn
  ses_identity_arn    = module.email.identity_arn

  # Environment variables injected into the FastAPI container.
  # Names MUST match the backend Settings fields in backend/src/config.py
  # (each attribute maps to its upper-case env var, e.g. cv_table_name → CV_TABLE_NAME).
  container_environment = {
    APP_ENV                 = var.environment
    AWS_REGION              = var.aws_region
    AWS_DEFAULT_REGION      = var.aws_region
    PROJECTS_TABLE_NAME     = module.database.table_names["projects"]
    LEARNING_TABLE_NAME     = module.database.table_names["learning"]
    TECHNOLOGIES_TABLE_NAME = module.database.table_names["technologies"]
    CV_TABLE_NAME           = module.database.table_names["cv"]
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

  # /api/* origin: ALB over HTTPS, guarded by a shared secret header.
  api_origin_domain          = module.backend.api_origin_domain
  origin_verify_secret_value = module.backend.origin_verify_secret_value
}
