# Route 53 hosted zone for the apex domain.
#
# When the domain is registered through Route 53 the console creates the
# hosted zone automatically: keep create_hosted_zone = false and the zone is
# looked up with a data source. Set it to true only if the zone must be
# managed (and created) by Terraform.
#
# Note: the site alias records (apex/www -> CloudFront) live in the cdn
# module, the ACM validation records in the acm module and the SES records
# in the email module. Keeping each record next to the resource it validates
# avoids circular dependencies between modules.

resource "aws_route53_zone" "this" {
  count = var.create_hosted_zone ? 1 : 0

  name    = var.domain_name
  comment = "Managed by Terraform (${var.domain_name})"
}

data "aws_route53_zone" "existing" {
  count = var.create_hosted_zone ? 0 : 1

  name         = var.domain_name
  private_zone = false
}
