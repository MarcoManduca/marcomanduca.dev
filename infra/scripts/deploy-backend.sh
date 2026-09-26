#!/usr/bin/env bash
#
# Build the backend image, push it to ECR and update the Lambda function.
#
# The ECR repository has IMMUTABLE tags: only the git short SHA is pushed
# (no moving "latest"), and the function is pointed at that exact tag, so
# each deploy is traceable and a rollback is re-pointing to an older SHA.
# If the tag already exists (redeploy of the same commit) the build/push is
# skipped and the function is simply pointed at it.
#
# Configuration (override via environment, values come from terraform output):
#   ECR_REPOSITORY_URL  terraform output -raw ecr_repository_url
#   FUNCTION_NAME       terraform output -raw backend_function_name
#   AWS_REGION          deployment region
#   IMAGE_TAG           image tag to push (default: git short SHA)
#   SKIP_LAMBDA_UPDATE  1 = push only (bootstrap, before the function exists)
#
# Usage:
#   ECR_REPOSITORY_URL=123.dkr.ecr.eu-west-1.amazonaws.com/marcomanduca-dev-backend \
#   FUNCTION_NAME=marcomanduca-dev-backend ./deploy-backend.sh
#
# Bootstrap (fresh account, see infra/README.md step 2):
#   IMAGE_TAG=bootstrap SKIP_LAMBDA_UPDATE=1 ECR_REPOSITORY_URL=... ./deploy-backend.sh

set -euo pipefail

# --- Configuration ---------------------------------------------------------
ECR_REPOSITORY_URL="${ECR_REPOSITORY_URL:?Set ECR_REPOSITORY_URL (terraform output -raw ecr_repository_url)}"
SKIP_LAMBDA_UPDATE="${SKIP_LAMBDA_UPDATE:-0}"
if [[ "${SKIP_LAMBDA_UPDATE}" != "1" ]]; then
  FUNCTION_NAME="${FUNCTION_NAME:?Set FUNCTION_NAME (terraform output -raw backend_function_name)}"
fi
AWS_REGION="${AWS_REGION:-eu-west-1}"
# ---------------------------------------------------------------------------

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ECR_REGISTRY="${ECR_REPOSITORY_URL%%/*}"
REPOSITORY_NAME="${ECR_REPOSITORY_URL#*/}"
IMAGE_TAG="${IMAGE_TAG:-$(git -C "${REPO_ROOT}" rev-parse --short HEAD)}"

if [[ -n "$(git -C "${REPO_ROOT}" status --porcelain -- backend)" ]]; then
  echo "WARNING: backend/ has uncommitted changes; tag ${IMAGE_TAG} will not match the commit." >&2
fi

if aws ecr describe-images \
  --repository-name "${REPOSITORY_NAME}" \
  --image-ids imageTag="${IMAGE_TAG}" \
  --region "${AWS_REGION}" > /dev/null 2>&1; then
  echo "Image ${IMAGE_TAG} already in ECR (immutable tags), skipping build/push."
else
  echo "Logging in to ECR (${ECR_REGISTRY})..."
  aws ecr get-login-password --region "${AWS_REGION}" \
    | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

  echo "Building image (linux/arm64 for Lambda Graviton)..."
  # --provenance/--sbom false: Lambda rejects the OCI image index + attestation
  # manifest buildx emits by default; it needs a single-platform image manifest.
  docker build \
    --platform linux/arm64 \
    --provenance=false \
    --sbom=false \
    --tag "${ECR_REPOSITORY_URL}:${IMAGE_TAG}" \
    "${REPO_ROOT}/backend"

  echo "Pushing tag ${IMAGE_TAG}..."
  docker push "${ECR_REPOSITORY_URL}:${IMAGE_TAG}"
fi

if [[ "${SKIP_LAMBDA_UPDATE}" == "1" ]]; then
  echo "Image ${IMAGE_TAG} pushed; Lambda update skipped (SKIP_LAMBDA_UPDATE=1)."
  exit 0
fi

echo "Updating Lambda function ${FUNCTION_NAME} to image ${IMAGE_TAG}..."
aws lambda update-function-code \
  --function-name "${FUNCTION_NAME}" \
  --image-uri "${ECR_REPOSITORY_URL}:${IMAGE_TAG}" \
  --region "${AWS_REGION}" > /dev/null

aws lambda wait function-updated \
  --function-name "${FUNCTION_NAME}" \
  --region "${AWS_REGION}"

echo "Backend deployed (image ${IMAGE_TAG})."
