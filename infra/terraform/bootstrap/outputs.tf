output "state_bucket_name" {
  description = "State bucket name: copy it into ../backend.hcl (bucket = ...)."
  value       = aws_s3_bucket.state.id
}

output "state_bucket_region" {
  description = "State bucket region: copy it into ../backend.hcl (region = ...)."
  value       = var.aws_region
}
