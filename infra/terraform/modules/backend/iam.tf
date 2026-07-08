# IAM role for the backend Lambda.
#
# One execution role, used by both the Lambda service (to ship logs) and the
# application code. Strictly scoped to the DynamoDB tables, the media bucket
# and SES sending. Container images are pulled by the Lambda service itself,
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

# CloudWatch Logs (CreateLogStream / PutLogEvents on the function's group).
resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.backend.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# --- Application permissions ----------------------------------------------

data "aws_iam_policy_document" "backend" {
  statement {
    sid = "DynamoDBCrud"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem",
    ]
    # Includes the rate-limit table (passed in dynamodb_table_arns).
    resources = var.dynamodb_table_arns
  }

  statement {
    sid = "MediaBucketObjects"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    # Object-level wildcard is required to address keys inside the bucket;
    # the bucket itself is fixed, so the scope stays a single bucket.
    resources = ["${var.media_bucket_arn}/*"]
  }

  statement {
    sid       = "MediaBucketList"
    actions   = ["s3:ListBucket"]
    resources = [var.media_bucket_arn]
  }

  statement {
    sid = "SesSend"
    actions = [
      "ses:SendEmail",
      "ses:SendRawEmail",
    ]
    # In the SES sandbox, SendEmail authorizes against BOTH the sender (the
    # verified domain) AND the verified recipient identity, so scoping to a
    # single identity ARN is insufficient. Limited to identity/* in this
    # account/region (not Resource "*"); the contact recipient can change
    # without touching IAM.
    resources = [replace(var.ses_identity_arn, "/identity/.+$/", "identity/*")]
  }
}

resource "aws_iam_role_policy" "backend" {
  name   = "${var.project_name}-backend"
  role   = aws_iam_role.backend.id
  policy = data.aws_iam_policy_document.backend.json
}
