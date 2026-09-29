# ECR scan-on-push findings -> SNS alert email.
#
# ECR scans every pushed image (basic scanning, modules/backend/ecr.tf), but
# the result used to stay in the console. CI scans an amd64 rebuild with
# Trivy; this rule covers the arm64 image Lambda actually runs: any CRITICAL
# or HIGH finding on a completed scan of the backend repository is emailed
# through the alerts topic.

data "aws_caller_identity" "current" {}

resource "aws_cloudwatch_event_rule" "ecr_scan_findings" {
  name        = "${var.project_name}-ecr-scan-findings"
  description = "CRITICAL/HIGH findings in ECR scans of the backend image."

  event_pattern = jsonencode({
    source      = ["aws.ecr"]
    detail-type = ["ECR Image Scan"]
    detail = {
      repository-name = [var.ecr_repository_name]
      scan-status     = ["COMPLETE"]
      "$or" = [
        { finding-severity-counts = { CRITICAL = [{ numeric = [">", 0] }] } },
        { finding-severity-counts = { HIGH = [{ numeric = [">", 0] }] } },
      ]
    }
  })
}

resource "aws_cloudwatch_event_target" "ecr_scan_findings" {
  rule = aws_cloudwatch_event_rule.ecr_scan_findings.name
  arn  = aws_sns_topic.alerts.arn

  # A readable email instead of the raw event JSON. The counts object is
  # used whole: the event only lists the severities that were found, and a
  # placeholder for a missing one would render empty. Inside a string,
  # EventBridge prints objects and arrays without their quotes, e.g.
  # {HIGH:2,LOW:1} and [b6d691c2fb89]. Each quoted line is one line of text.
  input_transformer {
    input_paths = {
      repository = "$.detail.repository-name"
      tags       = "$.detail.image-tags"
      counts     = "$.detail.finding-severity-counts"
    }
    input_template = <<-EOT
      "ECR scan of <repository> <tags> found CRITICAL or HIGH vulnerabilities."
      "Findings by severity: <counts>"
      "Details: ECR console > <repository> > image scan results. Findings without a fix in the base image are expected until it ships one."
    EOT
  }
}

# Replacing the topic policy drops the default one, so its owner statement
# (which the CloudWatch alarms rely on) is restated, and EventBridge
# may publish only from the rule above.
data "aws_iam_policy_document" "alerts_topic" {
  statement {
    sid = "OwnerAccess"
    actions = [
      "SNS:GetTopicAttributes",
      "SNS:SetTopicAttributes",
      "SNS:AddPermission",
      "SNS:RemovePermission",
      "SNS:DeleteTopic",
      "SNS:Subscribe",
      "SNS:ListSubscriptionsByTopic",
      "SNS:Publish",
    ]
    resources = [aws_sns_topic.alerts.arn]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceOwner"
      values   = [data.aws_caller_identity.current.account_id]
    }
  }

  statement {
    sid       = "AllowEcrScanRule"
    actions   = ["SNS:Publish"]
    resources = [aws_sns_topic.alerts.arn]

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_cloudwatch_event_rule.ecr_scan_findings.arn]
    }
  }
}

resource "aws_sns_topic_policy" "alerts" {
  arn    = aws_sns_topic.alerts.arn
  policy = data.aws_iam_policy_document.alerts_topic.json
}
