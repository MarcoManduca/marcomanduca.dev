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
      description = "Backend Lambda throttled (reserved concurrency or account concurrency limit reached)."
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

# SES sender reputation (account-wide rates over recent sending). SES puts an
# account under review at 5% bounces / 0.1% complaints and can pause
# sending, which would silently stop contact-form emails: alert first.
locals {
  ses_reputation_alarms = {
    ses-bounce-rate = {
      description = "SES bounce rate high: the account risks review and a sending pause."
      metric      = "Reputation.BounceRate"
      threshold   = var.ses_bounce_rate_threshold
    }
    ses-complaint-rate = {
      description = "SES complaint rate high: the account risks review and a sending pause."
      metric      = "Reputation.ComplaintRate"
      threshold   = var.ses_complaint_rate_threshold
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "ses_reputation" {
  for_each = local.ses_reputation_alarms

  alarm_name          = "${var.project_name}-${each.key}"
  alarm_description   = each.value.description
  namespace           = "AWS/SES"
  metric_name         = each.value.metric
  statistic           = "Maximum"
  period              = 3600
  evaluation_periods  = 1
  threshold           = each.value.threshold
  comparison_operator = "GreaterThanOrEqualToThreshold"
  # No sending means no datapoints, which is fine.
  treat_missing_data = "notBreaching"

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}
