output "table_names" {
  description = "Map of logical name -> table name."
  value = {
    projects     = aws_dynamodb_table.simple["projects"].name
    technologies = aws_dynamodb_table.simple["technologies"].name
    learning     = aws_dynamodb_table.learning.name
  }
}

output "table_arns" {
  description = "ARNs of all tables (for IAM scoping)."
  value = [
    aws_dynamodb_table.simple["projects"].arn,
    aws_dynamodb_table.simple["technologies"].arn,
    aws_dynamodb_table.learning.arn,
  ]
}
