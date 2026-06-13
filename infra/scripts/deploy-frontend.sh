#!/usr/bin/env bash
#
# Build the SPA and deploy it to S3 + CloudFront.
#
# Steps: npm ci -> npm run build -> aws s3 sync -> CloudFront invalidation.
#
# Configuration (override via environment, values come from terraform output):
#   FRONTEND_BUCKET    terraform output -raw frontend_bucket_name
#   DISTRIBUTION_ID    terraform output -raw cloudfront_distribution_id
#   AWS_REGION         deployment region
#
# Usage:
#   FRONTEND_BUCKET=marcomanduca-dev-frontend DISTRIBUTION_ID=E123... ./deploy-frontend.sh

set -euo pipefail

# --- Configuration ---------------------------------------------------------
FRONTEND_BUCKET="${FRONTEND_BUCKET:?Set FRONTEND_BUCKET (terraform output -raw frontend_bucket_name)}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:?Set DISTRIBUTION_ID (terraform output -raw cloudfront_distribution_id)}"
AWS_REGION="${AWS_REGION:-eu-west-1}"
# ---------------------------------------------------------------------------

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRONTEND_DIR="${REPO_ROOT}/frontend"

echo "Building the SPA..."
cd "${FRONTEND_DIR}"
npm ci
npm run build

echo "Syncing dist/ to s3://${FRONTEND_BUCKET}..."
# --delete removes assets from previous deploys (S3 versioning keeps a copy).
aws s3 sync dist/ "s3://${FRONTEND_BUCKET}/" \
  --region "${AWS_REGION}" \
  --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/*" > /dev/null

echo "Frontend deployed."
