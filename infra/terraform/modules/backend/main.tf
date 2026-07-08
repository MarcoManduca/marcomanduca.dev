# Backend runtime: the FastAPI container running on AWS Lambda.
#
# Traffic path:
#   CloudFront /api/*  ──(OAC, sigv4)──>  Lambda Function URL  ──>  handler
#
# Why Lambda instead of ECS Fargate + ALB:
#   - Scale-to-zero, pay-per-request. At personal-site traffic the compute
#     falls inside the perpetual Lambda free tier (~$0), versus an always-on
#     Fargate task + ALB + public IPv4 addresses (~$35/month combined).
#   - The same image runs unchanged: the AWS Lambda Web Adapter (baked into
#     the image, see backend/Dockerfile) bridges the Lambda runtime to the
#     Uvicorn server, so there is no ALB, no VPC, no NAT and no public IP.
#
# Security model:
#   - The Function URL is public (AuthType NONE) but CloudFront injects a
#     secret X-Origin-Verify header that the app checks (see
#     backend/src/utils/origin_verify.py); direct hits without the header get a
#     403. IAM auth is deliberately NOT used: it would sign the Authorization
#     header via sigv4 and clobber the Cognito Bearer token that admin routes
#     rely on. Rotating the secret is a plain apply after tainting:
#     terraform apply -replace=module.backend.random_password.origin_verify
#
# Files in this module:
#   main.tf   — Lambda function, Function URL, origin-verify secret, log group
#   ecr.tf    — container registry
#   iam.tf    — Lambda execution role (least-privilege)
#
# Bootstrap note: a container-image Lambda cannot be created until the image
# exists in ECR. On a fresh account, apply the repository first, push once,
# then apply the rest:
#   terraform apply -target=module.backend.aws_ecr_repository.backend
#   ./infra/scripts/deploy-backend.sh
#   terraform apply

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/aws/lambda/${var.project_name}-backend"
  retention_in_days = 14
}

# Shared secret between CloudFront and the app. Only CloudFront knows it and
# sends it in X-Origin-Verify; the function rejects requests without it.
resource "random_password" "origin_verify" {
  length  = 32
  special = false
}

resource "aws_lambda_function" "backend" {
  function_name = "${var.project_name}-backend"
  role          = aws_iam_role.backend.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.backend.repository_url}:${var.image_tag}"
  architectures = [var.architecture]
  memory_size   = var.memory_mb
  timeout       = var.timeout_s

  environment {
    # AWS_REGION / AWS_DEFAULT_REGION are reserved on Lambda, so they are not
    # set here — the runtime injects them and boto3/pydantic-settings read them.
    variables = merge(var.container_environment, {
      ORIGIN_VERIFY_SECRET = random_password.origin_verify.result
    })
  }

  logging_config {
    log_format = "Text"
    log_group  = aws_cloudwatch_log_group.backend.name
  }

  depends_on = [aws_iam_role_policy_attachment.logs]
}

resource "aws_lambda_function_url" "backend" {
  function_name      = aws_lambda_function.backend.function_name
  authorization_type = "NONE"
}

# AuthType NONE requires an explicit public-invoke permission.
resource "aws_lambda_permission" "public_url" {
  statement_id           = "AllowPublicFunctionUrl"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.backend.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}
