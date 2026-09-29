#!/usr/bin/env bash
#
# Build the backend image, push it to ECR and update the Lambda function.
#
# The ECR repository has IMMUTABLE tags: only the git SHA of HEAD is pushed
# (no moving "latest"), and the function is pointed at that exact tag, so
# each deploy is traceable and a rollback is re-pointing to an older SHA.
# The SHA is abbreviated to a fixed 12 characters: plain --short grows with
# the repository, and a rollback target copied from `git log` would then stop
# matching the tag in ECR. Images pushed before that keep their 7-character
# tags; roll back to one of them by passing that tag as IMAGE_TAG.
# If the tag already exists (redeploy of the same commit, rollback) the
# build/push is skipped and the function is simply pointed at it.
#
# Only the checked-out, committed code is ever built: with immutable tags a
# wrong image under a commit SHA would stay wrong forever. So the script
# refuses to build
#   - a tag naming another commit than HEAD (e.g. a rollback target the ECR
#     lifecycle rule already expired: it keeps the last 10 images), and
#   - a dirty backend/ (override with ALLOW_DIRTY=1, e.g. a throwaway tag).
#
# Configuration (override via environment, values come from terraform output):
#   ECR_REPOSITORY_URL  terraform output -raw ecr_repository_url
#   FUNCTION_NAME       terraform output -raw backend_function_name
#   AWS_REGION          deployment region
#   IMAGE_TAG           image tag to deploy (default: 12-char git SHA of HEAD)
#   SKIP_LAMBDA_UPDATE  1 = push only (bootstrap, before the function exists)
#   ALLOW_DIRTY         1 = build even with uncommitted changes in backend/
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
ALLOW_DIRTY="${ALLOW_DIRTY:-0}"
# ---------------------------------------------------------------------------

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ECR_REGISTRY="${ECR_REPOSITORY_URL%%/*}"
REPOSITORY_NAME="${ECR_REPOSITORY_URL#*/}"
HEAD_SHA="$(git -C "${REPO_ROOT}" rev-parse --short=12 HEAD)"
IMAGE_TAG="${IMAGE_TAG:-${HEAD_SHA}}"

# A tag that names a commit must name HEAD: the build packages the checkout,
# not that commit. Non-commit tags (e.g. "bootstrap") are free-form labels.
assert_tag_matches_head() {
  local tag_commit
  tag_commit="$(git -C "${REPO_ROOT}" rev-parse --verify --quiet "${IMAGE_TAG}^{commit}" || true)"
  if [[ -n "${tag_commit}" && "${tag_commit}" != "$(git -C "${REPO_ROOT}" rev-parse HEAD)" ]]; then
    echo "ERROR: image ${IMAGE_TAG} is not in ECR (never pushed, or expired by the" >&2
    echo "lifecycle rule) and HEAD is ${HEAD_SHA}. Building now would push HEAD's code" >&2
    echo "under ${IMAGE_TAG}. Check out ${IMAGE_TAG} and run again without IMAGE_TAG." >&2
    exit 1
  fi
}

assert_clean_backend() {
  if [[ -n "$(git -C "${REPO_ROOT}" status --porcelain -- backend)" && "${ALLOW_DIRTY}" != "1" ]]; then
    echo "ERROR: backend/ has uncommitted changes, so image ${IMAGE_TAG} would not" >&2
    echo "match its commit. Commit or stash them (or set ALLOW_DIRTY=1)." >&2
    exit 1
  fi
}

if aws ecr describe-images \
  --repository-name "${REPOSITORY_NAME}" \
  --image-ids imageTag="${IMAGE_TAG}" \
  --region "${AWS_REGION}" > /dev/null 2>&1; then
  echo "Image ${IMAGE_TAG} already in ECR (immutable tags), skipping build/push."
else
  assert_tag_matches_head
  assert_clean_backend

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
