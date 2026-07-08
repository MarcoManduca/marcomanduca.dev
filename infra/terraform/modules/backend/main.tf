# Backend runtime: the FastAPI container running on AWS Lambda, fronted by an
# API Gateway HTTP API.
#
# Traffic path:
#   CloudFront /api/*  ──HTTPS──>  API Gateway HTTP API  ──proxy──>  Lambda
#
# Why Lambda instead of ECS Fargate + ALB:
#   - Scale-to-zero, pay-per-request. At personal-site traffic both the Lambda
#     and the HTTP API fall inside their free tiers (~$0), versus an always-on
#     Fargate task + ALB + public IPv4 addresses (~$35/month combined).
#   - The same image runs unchanged: the AWS Lambda Web Adapter (baked into
#     the image, see backend/Dockerfile) bridges the Lambda runtime to the
#     Uvicorn server, so there is no ALB, no VPC, no NAT and no public IP.
#
# Why API Gateway rather than a Lambda Function URL:
#   - This account blocks public (AuthType NONE) Function URLs, and an IAM-auth
#     Function URL behind CloudFront OAC would sigv4-sign the Authorization
#     header and clobber the Cognito Bearer token admin routes rely on. An HTTP
#     API forwards Authorization untouched and needs no public Function URL.
#
# Security model:
#   - The HTTP API is public, but CloudFront injects a secret X-Origin-Verify
#     header that the app checks (backend/src/utils/origin_verify.py); direct
#     hits on the execute-api endpoint without the header get a 403. Rotate the
#     secret with:
#     terraform apply -replace=module.backend.random_password.origin_verify
#
# Files in this module:
#   main.tf   — Lambda function, HTTP API, origin-verify secret, log group
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

# --- API Gateway HTTP API: the public entry point CloudFront forwards to -----

resource "aws_apigatewayv2_api" "backend" {
  name          = "${var.project_name}-backend"
  protocol_type = "HTTP"
}

# AWS_PROXY: pass the raw request to Lambda (LWA turns it back into HTTP).
resource "aws_apigatewayv2_integration" "backend" {
  api_id                 = aws_apigatewayv2_api.backend.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.backend.invoke_arn
  payload_format_version = "2.0"
}

# Catch-all: every method and path goes to the single FastAPI handler.
resource "aws_apigatewayv2_route" "backend" {
  api_id    = aws_apigatewayv2_api.backend.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.backend.id}"
}

# Default stage, auto-deployed, no path prefix (paths reach the app verbatim).
resource "aws_apigatewayv2_stage" "backend" {
  api_id      = aws_apigatewayv2_api.backend.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowApiGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.backend.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.backend.execution_arn}/*/*"
}
