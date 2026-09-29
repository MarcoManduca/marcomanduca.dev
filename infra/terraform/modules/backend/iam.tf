# IAM role for the backend Lambda.
#
# One execution role, used by both the Lambda service (to ship logs) and the
# application code. Scoped per DynamoDB table to the calls the code makes,
# to the media bucket objects and to SES sending as the site address. Container images are pulled by the Lambda service itself,
# so no ECR permissions are needed here.

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "backend" {
  name               = "${var.project_name}-backend"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

# CloudWatch Logs, scoped to the function's own log group. The group is
# created by Terraform (main.tf), so logs:CreateLogGroup is not needed —
# unlike the managed AWSLambdaBasicExecutionRole, which allows it on "*".
data "aws_iam_policy_document" "logs" {
  statement {
    sid = "WriteOwnLogGroup"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["${aws_cloudwatch_log_group.backend.arn}:*"]
  }
}

resource "aws_iam_role_policy" "logs" {
  name   = "${var.project_name}-backend-logs"
  role   = aws_iam_role.backend.id
  policy = data.aws_iam_policy_document.logs.json
}

# --- Application permissions ----------------------------------------------

data "aws_iam_policy_document" "backend" {
  # One statement per table, with only the calls its code makes.
  statement {
    sid = "ProjectsTable"
    actions = [
      "dynamodb:GetItem", # strongly consistent read before an update
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:Scan", # list
    ]
    resources = [var.dynamodb_table_arns.projects]
  }

  statement {
    sid = "TechnologiesTable"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:Scan", # list
    ]
    resources = [var.dynamodb_table_arns.technologies]
  }

  statement {
    sid = "LearningTable"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:Query", # versions of one article
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:Scan",               # list (latest version of each article)
      "dynamodb:BatchWriteItem",     # delete_all_versions() batch_writer
      "dynamodb:ConditionCheckItem", # version guards in TransactWriteItems
    ]
    resources = [var.dynamodb_table_arns.learning]
  }

  statement {
    sid       = "RateLimitTable"
    actions   = ["dynamodb:UpdateItem"] # atomic ADD counters
    resources = [var.dynamodb_table_arns.ratelimit]
  }

  # Presigned URLs are signed with the role's credentials, so the role needs
  # the actions they grant: GET (CV download) and PUT (admin uploads). Nothing
  # lists or deletes objects; without ListBucket a presigned GET for a missing
  # key returns 403 instead of 404.
  statement {
    sid = "MediaBucketObjects"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
    ]
    # Object-level wildcard is required to address keys inside the bucket;
    # the bucket itself is fixed, so the scope stays a single bucket.
    resources = ["${var.media_bucket_arn}/*"]
  }

  statement {
    sid     = "SesSend"
    actions = ["ses:SendEmail"]
    # In the SES sandbox, SendEmail authorizes against BOTH the sender (the
    # verified domain) AND the verified recipient identity, so scoping to a
    # single identity ARN is insufficient. Limited to identity/* in this
    # account/region (not Resource "*"); the contact recipient can change
    # without touching IAM.
    resources = [replace(var.ses_identity_arn, "/identity/.+$/", "identity/*")]

    # ...but the function may only send AS the configured sender address.
    condition {
      test     = "StringEquals"
      variable = "ses:FromAddress"
      values   = [var.ses_sender_email]
    }
  }
}

resource "aws_iam_role_policy" "backend" {
  name   = "${var.project_name}-backend"
  role   = aws_iam_role.backend.id
  policy = data.aws_iam_policy_document.backend.json
}
