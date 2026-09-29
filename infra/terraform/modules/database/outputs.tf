output "table_names" {
  description = "Map of logical name -> table name."
  value = {
    projects     = aws_dynamodb_table.simple["projects"].name
    technologies = aws_dynamodb_table.simple["technologies"].name
    learning     = aws_dynamodb_table.learning.name
    ratelimit    = aws_dynamodb_table.ratelimit.name
  }
}

output "table_arns" {
  description = "Map of logical name -> table ARN (per-table IAM scoping)."
  value = {
    projects     = aws_dynamodb_table.simple["projects"].arn
    technologies = aws_dynamodb_table.simple["technologies"].arn
    learning     = aws_dynamodb_table.learning.arn
    ratelimit    = aws_dynamodb_table.ratelimit.arn
  }
}
