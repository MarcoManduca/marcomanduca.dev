#!/usr/bin/env bash
#
# Build the SPA and deploy it to S3 + CloudFront.
#
# Steps: npm ci -> npm run build -> upload hashed assets/ (immutable, 1 year)
#        -> upload everything else (index.html, robots.txt, ...) with no-cache
#        -> prune hashed assets older than ASSET_RETENTION_DAYS
#        -> CloudFront invalidation.
#
# Order matters: new assets land before the new index.html references them,
# and old hashed assets are kept for a while so browsers still running the
# previous index.html keep loading their chunks (no --delete on assets/).
#
# Configuration (override via environment, values come from terraform output):
#   FRONTEND_BUCKET    terraform output -raw frontend_bucket_name
#   DISTRIBUTION_ID    terraform output -raw cloudfront_distribution_id
#   AWS_REGION         deployment region
#
# Build-time settings: Vite inlines the VITE_COGNITO_* values from the shell
# environment or frontend/.env.production (gitignored, template in
# frontend/.env.example). The script stops if any is missing: the bundle
# would otherwise ship with admin sign-in silently broken.
#
# Usage:
#   FRONTEND_BUCKET=marcomanduca-dev-frontend DISTRIBUTION_ID=E123... ./deploy-frontend.sh

set -euo pipefail

# --- Configuration ---------------------------------------------------------
FRONTEND_BUCKET="${FRONTEND_BUCKET:?Set FRONTEND_BUCKET (terraform output -raw frontend_bucket_name)}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:?Set DISTRIBUTION_ID (terraform output -raw cloudfront_distribution_id)}"
AWS_REGION="${AWS_REGION:-eu-west-1}"
ASSET_RETENTION_DAYS="${ASSET_RETENTION_DAYS:-7}"
# ---------------------------------------------------------------------------

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRONTEND_DIR="${REPO_ROOT}/frontend"
ENV_FILE="${FRONTEND_DIR}/.env.production"
REQUIRED_VITE_VARS=(
  VITE_COGNITO_AUTHORITY
  VITE_COGNITO_CLIENT_ID
  VITE_COGNITO_REDIRECT_URI
  VITE_COGNITO_DOMAIN
)

# env_file_value <name>: the value .env.production assigns, unquoted (or "").
env_file_value() {
  [[ -f "${ENV_FILE}" ]] || return 0
  sed -n "s/^$1=//p" "${ENV_FILE}" | tail -n 1 | tr -d "\"' "
}

missing=()
for name in "${REQUIRED_VITE_VARS[@]}"; do
  if [[ -z "${!name:-}" && -z "$(env_file_value "${name}")" ]]; then
    missing+=("${name}")
  fi
done
if (( ${#missing[@]} > 0 )); then
  echo "ERROR: not set in the environment nor in frontend/.env.production:" >&2
  echo "  ${missing[*]}" >&2
  echo "Copy frontend/.env.example to frontend/.env.production and fill it in." >&2
  exit 1
fi

echo "Building the SPA..."
cd "${FRONTEND_DIR}"
npm ci
npm run build

echo "Uploading hashed assets/ (immutable, 1 year)..."
# Vite content-hashes everything under assets/, so a given name never changes.
aws s3 sync dist/assets/ "s3://${FRONTEND_BUCKET}/assets/" \
  --region "${AWS_REGION}" \
  --cache-control "public,max-age=31536000,immutable"

echo "Uploading index.html and other root files (no-cache)..."
# no-cache forces revalidation on every load, so a new deploy is picked up
# immediately. --delete here only prunes stale non-asset files.
aws s3 sync dist/ "s3://${FRONTEND_BUCKET}/" \
  --region "${AWS_REGION}" \
  --cache-control "no-cache" \
  --exclude "assets/*" \
  --delete

echo "Pruning hashed assets older than ${ASSET_RETENTION_DAYS} days..."
# Only objects NOT part of the current build and older than the retention
# window are removed (S3 versioning still keeps a copy for 30 days).
CUTOFF="$(date -u -v-"${ASSET_RETENTION_DAYS}"d +%Y-%m-%dT%H:%M:%S 2>/dev/null \
  || date -u -d "${ASSET_RETENTION_DAYS} days ago" +%Y-%m-%dT%H:%M:%S)"
aws s3api list-objects-v2 \
  --bucket "${FRONTEND_BUCKET}" \
  --prefix "assets/" \
  --region "${AWS_REGION}" \
  --query "Contents[?LastModified<'${CUTOFF}'].Key" \
  --output text \
  | tr '\t' '\n' \
  | while read -r key; do
      [[ -z "${key}" || "${key}" == "None" ]] && continue
      [[ -f "dist/${key}" ]] && continue
      aws s3 rm "s3://${FRONTEND_BUCKET}/${key}" --region "${AWS_REGION}"
    done

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/*" > /dev/null

echo "Frontend deployed."
