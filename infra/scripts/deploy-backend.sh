#!/usr/bin/env bash
#
# Build the backend image, push it to ECR and update the Lambda function.
#
# Tags pushed: the current git short SHA (immutable, for rollbacks) and
# "latest". The function is then pointed at the immutable SHA tag so each
# deploy is traceable and rollbacks are a one-liner.
#
# Configuration (override via environment, values come from terraform output):
#   ECR_REPOSITORY_URL  terraform output -raw ecr_repository_url
#   FUNCTION_NAME       terraform output -raw backend_function_name
#   AWS_REGION          deployment region
#
# Usage:
#   ECR_REPOSITORY_URL=123.dkr.ecr.eu-west-1.amazonaws.com/marcomanduca-dev-backend \
#   FUNCTION_NAME=marcomanduca-dev-backend ./deploy-backend.sh

set -euo pipefail

# --- Configuration ---------------------------------------------------------
ECR_REPOSITORY_URL="${ECR_REPOSITORY_URL:?Set ECR_REPOSITORY_URL (terraform output -raw ecr_repository_url)}"
FUNCTION_NAME="${FUNCTION_NAME:?Set FUNCTION_NAME (terraform output -raw backend_function_name)}"
AWS_REGION="${AWS_REGION:-eu-west-1}"
# ---------------------------------------------------------------------------

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ECR_REGISTRY="${ECR_REPOSITORY_URL%%/*}"
GIT_SHA="$(git -C "${REPO_ROOT}" rev-parse --short HEAD)"

echo "Logging in to ECR (${ECR_REGISTRY})..."
aws ecr get-login-password --region "${AWS_REGION}" \
  | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

echo "Building image (linux/arm64 for Lambda Graviton)..."
docker build \
  --platform linux/arm64 \
  --tag "${ECR_REPOSITORY_URL}:${GIT_SHA}" \
  --tag "${ECR_REPOSITORY_URL}:latest" \
  "${REPO_ROOT}/backend"

echo "Pushing tags ${GIT_SHA} and latest..."
docker push "${ECR_REPOSITORY_URL}:${GIT_SHA}"
docker push "${ECR_REPOSITORY_URL}:latest"

echo "Updating Lambda function ${FUNCTION_NAME} to image ${GIT_SHA}..."
aws lambda update-function-code \
  --function-name "${FUNCTION_NAME}" \
  --image-uri "${ECR_REPOSITORY_URL}:${GIT_SHA}" \
  --region "${AWS_REGION}" > /dev/null

aws lambda wait function-updated \
  --function-name "${FUNCTION_NAME}" \
  --region "${AWS_REGION}"

echo "Backend deployed (image ${GIT_SHA})."
