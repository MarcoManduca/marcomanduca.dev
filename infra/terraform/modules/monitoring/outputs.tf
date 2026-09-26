output "alerts_topic_arn" {
  description = "SNS topic receiving the CloudWatch alarm notifications."
  value       = aws_sns_topic.alerts.arn
}

output "budget_name" {
  description = "Name of the monthly cost budget."
  value       = aws_budgets_budget.monthly.name
}
