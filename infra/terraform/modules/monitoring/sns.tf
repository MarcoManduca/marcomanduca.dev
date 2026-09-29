# Alarm notifications (CloudWatch alarms, ECR scan findings): one SNS topic,
# one email subscription.
#
# The subscription stays "PendingConfirmation" until the recipient clicks the
# link in the confirmation email AWS sends after apply — no alarm email is
# delivered before that.
#
# Not KMS-encrypted on purpose: CloudWatch alarms cannot publish to a topic
# encrypted with the AWS-managed aws/sns key, and a customer-managed key costs
# 1 USD/month for alarm metadata that is not sensitive.

#trivy:ignore:AVD-AWS-0095
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
