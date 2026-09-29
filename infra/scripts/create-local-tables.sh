#!/usr/bin/env bash
#
# Create the four DynamoDB tables (projects, learning, technologies,
# ratelimit) against DynamoDB Local.
#
# Used by the docker-compose "dynamodb-init" service, but can also be run
# manually against a local endpoint:
#
#   DYNAMODB_ENDPOINT_URL=http://localhost:8001 ./create-local-tables.sh
#
# Table names default to the backend Settings defaults (portfolio-* locally;
# on AWS Terraform names them <project_name>-* and injects them as env vars).

set -euo pipefail

ENDPOINT_URL="${DYNAMODB_ENDPOINT_URL:-http://dynamodb-local:8000}"

# Table names mirror the backend Settings defaults (and may be overridden by
# the same environment variables the backend reads). DynamoDB requires names
# of at least 3 characters, so the project prefix keeps them valid.
PROJECTS_TABLE="${PROJECTS_TABLE_NAME:-portfolio-projects}"
LEARNING_TABLE="${LEARNING_TABLE_NAME:-portfolio-learning}"
TECHNOLOGIES_TABLE="${TECHNOLOGIES_TABLE_NAME:-portfolio-technologies}"
RATELIMIT_TABLE="${RATELIMIT_TABLE_NAME:-portfolio-ratelimit}"

# DynamoDB Local accepts any credentials, but the AWS CLI requires them.
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-local}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-local}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-eu-west-1}"

echo "Waiting for DynamoDB Local at ${ENDPOINT_URL}..."
ready=0
for _ in $(seq 1 30); do
  if aws dynamodb list-tables --endpoint-url "${ENDPOINT_URL}" > /dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done
if [[ "${ready}" != "1" ]]; then
  echo "ERROR: DynamoDB Local did not answer at ${ENDPOINT_URL} within 30s." >&2
  exit 1
fi

# create_table <name> <key-schema> <attribute-definitions>
# The last two are space-separated lists, split into one CLI argument each.
create_table() {
  local name="$1"
  local -a key_schema attributes
  read -r -a key_schema <<< "$2"
  read -r -a attributes <<< "$3"

  if aws dynamodb describe-table --table-name "${name}" \
    --endpoint-url "${ENDPOINT_URL}" > /dev/null 2>&1; then
    echo "Table '${name}' already exists, skipping."
    return
  fi

  echo "Creating table '${name}'..."
  aws dynamodb create-table \
    --table-name "${name}" \
    --key-schema "${key_schema[@]}" \
    --attribute-definitions "${attributes[@]}" \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url "${ENDPOINT_URL}" > /dev/null
}

create_table "${PROJECTS_TABLE}" \
  "AttributeName=slug,KeyType=HASH" \
  "AttributeName=slug,AttributeType=S"

# learning is versioned: composite key slug (pk) + version (sk, number).
create_table "${LEARNING_TABLE}" \
  "AttributeName=slug,KeyType=HASH AttributeName=version,KeyType=RANGE" \
  "AttributeName=slug,AttributeType=S AttributeName=version,AttributeType=N"

create_table "${TECHNOLOGIES_TABLE}" \
  "AttributeName=id,KeyType=HASH" \
  "AttributeName=id,AttributeType=S"

# contact-form rate limiting: one counter item per client+window (pk).
# TTL is a no-op on DynamoDB Local but the schema stays identical to AWS.
create_table "${RATELIMIT_TABLE}" \
  "AttributeName=pk,KeyType=HASH" \
  "AttributeName=pk,AttributeType=S"

echo "All local tables ready."
