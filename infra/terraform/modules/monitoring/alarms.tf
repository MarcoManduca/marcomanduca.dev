# CloudWatch alarms on the backend (Lambda + API Gateway HTTP API).
#
# All alarms use 5-minute windows and treat missing data as OK: with
# scale-to-zero there are no datapoints most of the time.

locals {
  alarms = {
    lambda-errors = {
      description = "Backend Lambda invocation errors (unhandled exceptions, timeouts)."
      namespace   = "AWS/Lambda"
      metric      = "Errors"
      dimensions  = { FunctionName = var.function_name }
      threshold   = var.lambda_errors_threshold
    }
    lambda-throttles = {
      description = "Backend Lambda throttled (reserved concurrency cap reached)."
      namespace   = "AWS/Lambda"
      metric      = "Throttles"
      dimensions  = { FunctionName = var.function_name }
      threshold   = var.lambda_throttles_threshold
    }
    api-5xx = {
      description = "API Gateway 5xx responses (backend failures)."
      namespace   = "AWS/ApiGateway"
      metric      = "5xx"
      dimensions  = { ApiId = var.api_id }
      threshold   = var.api_5xx_threshold
    }
    api-4xx-spike = {
      description = "API Gateway 4xx spike (scanning, abuse or throttling 429s)."
      namespace   = "AWS/ApiGateway"
      metric      = "4xx"
      dimensions  = { ApiId = var.api_id }
      threshold   = var.api_4xx_threshold
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "this" {
  for_each = local.alarms

  alarm_name          = "${var.project_name}-${each.key}"
  alarm_description   = each.value.description
  namespace           = each.value.namespace
  metric_name         = each.value.metric
  dimensions          = each.value.dimensions
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = each.value.threshold
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}
