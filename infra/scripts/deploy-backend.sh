#!/usr/bin/env bash
#
# Build the backend image, push it to ECR and roll the ECS service.
#
# Tags pushed: the current git short SHA (immutable, for rollbacks) and
# "latest" (what the task definition points to).
#
# Configuration (override via environment, values come from terraform output):
#   ECR_REPOSITORY_URL  terraform output -raw ecr_repository_url
#   ECS_CLUSTER         terraform output -raw ecs_cluster_name
#   ECS_SERVICE         terraform output -raw ecs_service_name
#   AWS_REGION          deployment region
#
# Usage:
#   ECR_REPOSITORY_URL=123.dkr.ecr.eu-west-1.amazonaws.com/marcomanduca-dev-backend \
#   ECS_CLUSTER=marcomanduca-dev ECS_SERVICE=marcomanduca-dev-backend ./deploy-backend.sh

set -euo pipefail

# --- Configuration ---------------------------------------------------------
ECR_REPOSITORY_URL="${ECR_REPOSITORY_URL:?Set ECR_REPOSITORY_URL (terraform output -raw ecr_repository_url)}"
ECS_CLUSTER="${ECS_CLUSTER:?Set ECS_CLUSTER (terraform output -raw ecs_cluster_name)}"
ECS_SERVICE="${ECS_SERVICE:?Set ECS_SERVICE (terraform output -raw ecs_service_name)}"
AWS_REGION="${AWS_REGION:-eu-west-1}"
# ---------------------------------------------------------------------------

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ECR_REGISTRY="${ECR_REPOSITORY_URL%%/*}"
GIT_SHA="$(git -C "${REPO_ROOT}" rev-parse --short HEAD)"

echo "Logging in to ECR (${ECR_REGISTRY})..."
aws ecr get-login-password --region "${AWS_REGION}" \
  | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

echo "Building image (linux/amd64 for Fargate)..."
docker build \
  --platform linux/amd64 \
  --tag "${ECR_REPOSITORY_URL}:${GIT_SHA}" \
  --tag "${ECR_REPOSITORY_URL}:latest" \
  "${REPO_ROOT}/backend"

echo "Pushing tags ${GIT_SHA} and latest..."
docker push "${ECR_REPOSITORY_URL}:${GIT_SHA}"
docker push "${ECR_REPOSITORY_URL}:latest"

echo "Forcing a new ECS deployment..."
aws ecs update-service \
  --cluster "${ECS_CLUSTER}" \
  --service "${ECS_SERVICE}" \
  --force-new-deployment \
  --region "${AWS_REGION}" > /dev/null

echo "Backend deployed (image ${GIT_SHA}). Watch the rollout with:"
echo "  aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --query 'services[0].deployments'"
