#!/usr/bin/env bash
#
# Build the SPA and deploy it to S3 + CloudFront.
#
# Steps: npm ci -> npm run build (SPA + pre-rendered route pages + sitemap)
#        -> upload hashed assets/ (immutable, 1 year) + this deploy's manifest
#        -> upload everything else (index.html, _routes/, robots.txt, ...)
#           with no-cache
#        -> sync the pre-rendered route keys into the CloudFront key value
#           store -> delete stale root files -> prune old hashed assets
#        -> CloudFront invalidation.
#
# Order matters:
#   - New assets land before the new pages reference them.
#   - A route key is added only once its page is in the bucket, and a page is
#     deleted only once its key is gone, so the edge never rewrites a path to
#     a missing file.
#   - Old hashed assets are kept for browsers still running a previous build
#     (open tabs lazy-load their chunks). Each deploy uploads a manifest of
#     its assets (_deploys/<UTC timestamp>.txt); an asset is deleted only when
#     no kept manifest lists it (the current one, the previous one and every
#     one younger than ASSET_RETENTION_DAYS) and it was uploaded before that
#     window too. So the previous build survives however long ago it shipped.
#
# Configuration (override via environment, values come from terraform output):
#   FRONTEND_BUCKET       terraform output -raw frontend_bucket_name
#   DISTRIBUTION_ID       terraform output -raw cloudfront_distribution_id
#   ROUTES_KVS_ARN        terraform output -raw routes_kvs_arn
#   AWS_REGION            deployment region
#   ASSET_RETENTION_DAYS  how long superseded builds stay loadable (default 7)
#
# Build-time settings: Vite inlines the VITE_COGNITO_* values from the shell
# environment or frontend/.env.production (gitignored, template in
# frontend/.env.example). The script stops if any is missing: the bundle
# would otherwise ship with admin sign-in silently broken. The pre-render
# step reads the live API in strict mode: if it can't, the deploy stops
# instead of publishing a site without its project pages.
#
# Requires AWS CLI v2 (the key value store API is signed with SigV4A).
#
# Usage:
#   FRONTEND_BUCKET=marcomanduca-dev-frontend DISTRIBUTION_ID=E123... \
#   ROUTES_KVS_ARN=arn:aws:cloudfront::123:key-value-store/... ./deploy-frontend.sh

set -euo pipefail

# --- Configuration ---------------------------------------------------------
FRONTEND_BUCKET="${FRONTEND_BUCKET:?Set FRONTEND_BUCKET (terraform output -raw frontend_bucket_name)}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:?Set DISTRIBUTION_ID (terraform output -raw cloudfront_distribution_id)}"
ROUTES_KVS_ARN="${ROUTES_KVS_ARN:?Set ROUTES_KVS_ARN (terraform output -raw routes_kvs_arn)}"
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
# UpdateKeys accepts at most 50 keys per call.
KVS_BATCH_SIZE=50

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "${WORK_DIR}"' EXIT

# env_file_value <name>: the value .env.production assigns, unquoted (or "").
env_file_value() {
  [[ -f "${ENV_FILE}" ]] || return 0
  sed -n "s/^$1=//p" "${ENV_FILE}" | tail -n 1 | tr -d "\"' "
}

# days_ago <format>: UTC date ASSET_RETENTION_DAYS ago (BSD and GNU date).
days_ago() {
  date -u -v-"${ASSET_RETENTION_DAYS}"d "+$1" 2>/dev/null \
    || date -u -d "${ASSET_RETENTION_DAYS} days ago" "+$1"
}

# s3_keys <prefix> [jmespath filter]: object keys under a prefix, sorted.
s3_keys() {
  local filter="${2:-}"
  aws s3api list-objects-v2 \
    --bucket "${FRONTEND_BUCKET}" \
    --prefix "$1" \
    --region "${AWS_REGION}" \
    --query "Contents[${filter}].Key" \
    --output text \
    | tr '\t' '\n' | { grep -v -e '^None$' -e '^$' || true; } | LC_ALL=C sort -u
}

# sync_root <extra aws s3 sync flags...>: everything but assets/ and the
# deploy manifests, revalidated on every load.
sync_root() {
  aws s3 sync dist/ "s3://${FRONTEND_BUCKET}/" \
    --region "${AWS_REGION}" \
    --cache-control "no-cache" \
    --exclude "assets/*" \
    --exclude "_deploys/*" \
    "$@"
}

# route_keys: the key value store keys of this build's pre-rendered pages
# (dist/_routes/projects/x.html -> /projects/x, dist/_routes/index.html -> /).
route_keys() {
  local file key
  find dist/_routes -type f -name '*.html' | while IFS= read -r file; do
    key="${file#dist/_routes}"
    key="${key%.html}"
    [[ "${key}" == "/index" ]] && key="/"
    # Keys are built into JSON below: only plain route characters allowed.
    if [[ ! "${key}" =~ ^/[a-z0-9/-]*$ ]]; then
      echo "ERROR: unexpected pre-rendered route ${key}" >&2
      exit 1
    fi
    printf '%s\n' "${key}"
  done | LC_ALL=C sort -u
}

# kvs_update <--puts|--deletes> <key>...: one UpdateKeys call (<= 50 keys),
# guarded by the store's current ETag.
kvs_update() {
  local flag="$1" json="" key etag
  shift
  for key in "$@"; do
    if [[ "${flag}" == "--puts" ]]; then
      json+="{\"Key\":\"${key}\",\"Value\":\"1\"},"
    else
      json+="{\"Key\":\"${key}\"},"
    fi
  done
  etag="$(aws cloudfront-keyvaluestore describe-key-value-store \
    --kvs-arn "${ROUTES_KVS_ARN}" --query ETag --output text)"
  aws cloudfront-keyvaluestore update-keys \
    --kvs-arn "${ROUTES_KVS_ARN}" \
    --if-match "${etag}" \
    "${flag}" "[${json%,}]" > /dev/null
}

# kvs_apply <--puts|--deletes> <file>: apply the keys listed in a file, in
# batches of KVS_BATCH_SIZE.
kvs_apply() {
  local flag="$1" key
  local -a batch=()
  while IFS= read -r key; do
    batch+=("${key}")
    if (( ${#batch[@]} == KVS_BATCH_SIZE )); then
      kvs_update "${flag}" "${batch[@]}"
      batch=()
    fi
  done < "$2"
  if (( ${#batch[@]} > 0 )); then
    kvs_update "${flag}" "${batch[@]}"
  fi
}

# sync_route_keys: make the key value store list exactly this build's pages.
sync_route_keys() {
  route_keys > "${WORK_DIR}/routes-desired.txt"
  aws cloudfront-keyvaluestore list-keys \
    --kvs-arn "${ROUTES_KVS_ARN}" \
    --query 'Items[].Key' \
    --output text \
    | tr '\t' '\n' | { grep -v -e '^None$' -e '^$' || true; } \
    | LC_ALL=C sort -u > "${WORK_DIR}/routes-existing.txt"

  LC_ALL=C comm -13 "${WORK_DIR}/routes-existing.txt" "${WORK_DIR}/routes-desired.txt" \
    > "${WORK_DIR}/routes-put.txt"
  LC_ALL=C comm -23 "${WORK_DIR}/routes-existing.txt" "${WORK_DIR}/routes-desired.txt" \
    > "${WORK_DIR}/routes-delete.txt"
  echo "  $(wc -l < "${WORK_DIR}/routes-put.txt" | tr -d ' ') added," \
    "$(wc -l < "${WORK_DIR}/routes-delete.txt" | tr -d ' ') removed" \
    "($(wc -l < "${WORK_DIR}/routes-desired.txt" | tr -d ' ') pre-rendered routes)."

  kvs_apply --puts "${WORK_DIR}/routes-put.txt"
  kvs_apply --deletes "${WORK_DIR}/routes-delete.txt"
}

# prune_assets: delete hashed assets no kept manifest lists (see header).
prune_assets() {
  local cutoff_id cutoff_iso id count index=0 key
  local -a manifests=() kept=() dropped=()
  cutoff_id="$(days_ago %Y%m%dT%H%M%SZ)"
  cutoff_iso="$(days_ago %Y-%m-%dT%H:%M:%S)"

  while IFS= read -r key; do
    id="${key#_deploys/}"
    manifests+=("${id%.txt}")
  done < <(s3_keys "_deploys/")
  count="${#manifests[@]}"
  if (( count < 2 )); then
    echo "  No previous deploy manifest yet: nothing pruned."
    return
  fi

  # Timestamps sort as text: newest last.
  for id in "${manifests[@]}"; do
    index=$((index + 1))
    if (( index > count - 2 )) || [[ ! "${id}" < "${cutoff_id}" ]]; then
      kept+=("${id}")
    else
      dropped+=("${id}")
    fi
  done

  : > "${WORK_DIR}/keep.txt"
  for id in "${kept[@]}"; do
    aws s3 cp "s3://${FRONTEND_BUCKET}/_deploys/${id}.txt" - \
      --region "${AWS_REGION}" >> "${WORK_DIR}/keep.txt"
  done
  LC_ALL=C sort -u -o "${WORK_DIR}/keep.txt" "${WORK_DIR}/keep.txt"
  if [[ -n "$(LC_ALL=C comm -23 "${WORK_DIR}/current.txt" "${WORK_DIR}/keep.txt")" ]]; then
    echo "ERROR: the kept manifests miss assets of this build; not pruning." >&2
    exit 1
  fi

  s3_keys "assets/" "?LastModified<'${cutoff_iso}'" > "${WORK_DIR}/old-assets.txt"
  LC_ALL=C comm -23 "${WORK_DIR}/old-assets.txt" "${WORK_DIR}/keep.txt" \
    | while IFS= read -r key; do
        aws s3 rm "s3://${FRONTEND_BUCKET}/${key}" --region "${AWS_REGION}"
      done

  if (( ${#dropped[@]} > 0 )); then
    for id in "${dropped[@]}"; do
      aws s3 rm "s3://${FRONTEND_BUCKET}/_deploys/${id}.txt" --region "${AWS_REGION}"
    done
  fi
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

echo "Building the SPA and the pre-rendered pages..."
cd "${FRONTEND_DIR}"
npm ci
PRERENDER_STRICT=1 npm run build

echo "Uploading hashed assets/ (immutable, 1 year)..."
# Vite content-hashes everything under assets/, so a given name never changes:
# comparing sizes is enough, and unchanged assets are not re-uploaded.
aws s3 sync dist/assets/ "s3://${FRONTEND_BUCKET}/assets/" \
  --region "${AWS_REGION}" \
  --size-only \
  --cache-control "public,max-age=31536000,immutable"

echo "Recording this deploy's asset manifest..."
DEPLOY_ID="$(date -u +%Y%m%dT%H%M%SZ)"
(cd dist && find assets -type f) | LC_ALL=C sort -u > "${WORK_DIR}/current.txt"
aws s3 cp "${WORK_DIR}/current.txt" "s3://${FRONTEND_BUCKET}/_deploys/${DEPLOY_ID}.txt" \
  --region "${AWS_REGION}" \
  --content-type "text/plain" \
  --cache-control "no-cache"

echo "Uploading index.html, pre-rendered pages and other root files (no-cache)..."
# no-cache forces revalidation on every load, so a new deploy is picked up
# immediately. Nothing is deleted yet: pages of unpublished content still
# have their route keys until the next step.
sync_root

echo "Syncing the pre-rendered routes into the key value store..."
sync_route_keys

echo "Deleting stale root files..."
sync_root --delete

echo "Pruning hashed assets of builds older than ${ASSET_RETENTION_DAYS} days..."
prune_assets

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/*" > /dev/null

echo "Frontend deployed."
