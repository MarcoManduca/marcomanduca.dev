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
#   - The Function URL uses IAM auth. CloudFront reaches it through an Origin
#     Access Control that sigv4-signs every request; the resource policy that
#     allows only this distribution to invoke lives in the cdn module (it owns
#     the distribution ARN). Direct hits on the Function URL get a 403.
#
# Files in this module:
#   main.tf   — Lambda function, Function URL, log group
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

resource "aws_lambda_function" "backend" {
  function_name = "${var.project_name}-backend"
  role          = aws_iam_role.backend.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.backend.repository_url}:${var.image_tag}"
  architectures = [var.architecture]
  memory_size   = var.memory_mb
  timeout       = var.timeout_s

  environment {
    variables = var.container_environment
  }

  logging_config {
    log_format = "Text"
    log_group  = aws_cloudwatch_log_group.backend.name
  }

  depends_on = [aws_iam_role_policy_attachment.logs]
}

resource "aws_lambda_function_url" "backend" {
  function_name      = aws_lambda_function.backend.function_name
  authorization_type = "AWS_IAM"
}
