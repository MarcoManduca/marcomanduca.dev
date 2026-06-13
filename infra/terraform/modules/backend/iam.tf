# IAM roles for the Fargate task.
#
#   execution role : used by the ECS agent to pull the image and ship logs.
#   task role      : used by the application code. Strictly scoped to the
#                    four DynamoDB tables, the media bucket and SES sending.

data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# --- Execution role -------------------------------------------------------

resource "aws_iam_role" "execution" {
  name               = "${var.project_name}-backend-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "execution" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# --- Task role ------------------------------------------------------------

resource "aws_iam_role" "task" {
  name               = "${var.project_name}-backend-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

data "aws_iam_policy_document" "task" {
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
    resources = [var.ses_identity_arn]
  }
}

resource "aws_iam_role_policy" "task" {
  name   = "${var.project_name}-backend-task"
  role   = aws_iam_role.task.id
  policy = data.aws_iam_policy_document.task.json
}
