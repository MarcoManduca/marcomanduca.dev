output "zone_id" {
  description = "Hosted zone id (created or looked up)."
  value       = var.create_hosted_zone ? aws_route53_zone.this[0].zone_id : data.aws_route53_zone.existing[0].zone_id
}

output "name_servers" {
  description = "Zone name servers (empty list when the zone pre-exists)."
  value       = var.create_hosted_zone ? aws_route53_zone.this[0].name_servers : []
}
