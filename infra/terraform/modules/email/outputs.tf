output "identity_arn" {
  description = "ARN of the SES domain identity (for IAM scoping of ses:SendEmail)."
  value       = aws_ses_domain_identity.this.arn
}
