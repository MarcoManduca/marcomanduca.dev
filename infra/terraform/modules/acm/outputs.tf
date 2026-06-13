output "certificate_arn" {
  description = "ARN of the validated certificate (waits for ISSUED status)."
  value       = aws_acm_certificate_validation.this.certificate_arn
}
