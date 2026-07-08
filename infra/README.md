# Infrastructure — marcomanduca.dev

Terraform-managed AWS infrastructure plus deployment scripts and the local
development stack.

## Architecture

```
                         ┌────────────────────────────────────────────┐
 Browser ──HTTPS──> CloudFront (marcomanduca.dev + www)               │
                         │  default ──OAC──> S3 frontend bucket (SPA) │
                         │  /api/*  ──OAC/sigv4──> Lambda Function URL │
                         └───────────────────────┬────────────────────┘
                                                 │
                                  AWS Lambda (FastAPI container image)
                                                 │
                              DynamoDB · S3 media · Cognito · SES
```

Design decisions:

- **Single domain, single public certificate.** The API is served from the
  same CloudFront distribution under `/api/*` (origin = Lambda Function URL)
  instead of a dedicated `api.` subdomain: one certificate, one DNS name, no
  CORS between site and API.
- **Serverless backend.** The FastAPI container runs on Lambda (via the AWS
  Lambda Web Adapter), not on an always-on Fargate task behind an ALB. This
  removes the ALB (~17 USD/mo), the always-on task (~10 USD/mo) and the public
  IPv4 charges (~11 USD/mo), and scales to zero. The trade-off is an occasional
  ~1–2 s cold start, acceptable for a personal site.
- **Origin protection.** The Function URL uses IAM auth. CloudFront reaches it
  through an Origin Access Control that sigv4-signs every request, and a
  resource policy (in the `cdn` module) allows only this distribution to
  invoke it. Direct hits on the Function URL get a 403 — no secret header to
  manage or rotate.
- **No VPC.** The function talks only to public AWS APIs (DynamoDB, S3, SES,
  Cognito JWKS), so it runs outside a VPC: no subnets, no NAT gateway, no
  public IP to pay for.
- **SPA routing caveat.** CloudFront rewrites 403/404 responses to
  `/index.html` with status 200 so deep links work. This applies to `/api/*`
  too: the backend should convey "not found" inside response bodies the SPA
  inspects, or the frontend must treat an HTML body on an API call as an
  error.

## Layout

```
infra/
├── README.md                  # this runbook
├── scripts/
│   ├── create-local-tables.sh # DynamoDB Local table bootstrap
│   ├── deploy-frontend.sh     # build + s3 sync + CloudFront invalidation
│   └── deploy-backend.sh      # docker build/push + lambda update-function-code
└── terraform/
    ├── main.tf                # module wiring
    ├── providers.tf           # default region + us-east-1 alias (ACM/CloudFront)
    ├── variables.tf
    ├── outputs.tf
    ├── terraform.tfvars.example
    └── modules/
        ├── dns/               # Route 53 hosted zone (create or look up)
        ├── acm/               # us-east-1 certificate + DNS validation
        ├── storage/           # S3 frontend + media buckets
        ├── database/          # 4 DynamoDB tables (PAY_PER_REQUEST)
        ├── auth/              # Cognito user pool, SPA client, hosted UI, group
        ├── email/             # SES domain identity + DKIM records
        ├── backend/           # ECR, Lambda + Function URL, IAM, CloudWatch logs
        └── cdn/               # CloudFront distribution + aliases + OAC + invoke perm
```

---

## Deployment runbook

### 1. Register marcomanduca.dev on Route 53

The domain is **not yet purchased**. Register it manually:

1. AWS Console → **Route 53 → Registered domains → Register domain**.
2. Search `marcomanduca.dev`, add to cart, fill in contact details
   (enable privacy protection), complete the purchase.
3. Cost: `.dev` domains are **~14 USD/year**. Registration can take up to
   ~30 minutes; you will receive a confirmation email.
4. Route 53 automatically creates the **hosted zone** for the domain
   (~0.50 USD/month). Keep `create_hosted_zone = false` in `terraform.tfvars`
   so Terraform looks it up instead of creating a duplicate.

> `.dev` is on the HSTS preload list: browsers force HTTPS. CloudFront + ACM
> below handle this — nothing extra to do.

### 2. Bootstrap Terraform

Prerequisites: AWS account, AWS CLI v2 configured (`aws configure` or SSO),
Terraform >= 1.7, Docker, Node.js 20, Python 3.12.

Create the state bucket once (pick a globally unique name):

```bash
aws s3api create-bucket \
  --bucket <your-tf-state-bucket> \
  --region eu-west-1 \
  --create-bucket-configuration LocationConstraint=eu-west-1
```

Then enable the backend and apply:

```bash
cd infra/terraform

# 1. Uncomment the backend "s3" block in providers.tf and set the bucket name.
# 2. Provide your variables:
cp terraform.tfvars.example terraform.tfvars   # then edit

terraform init
terraform plan      # review: ~50 resources
```

A container-image Lambda cannot be created before its (arm64) image exists in
ECR, so the very first apply is two-phase:

```bash
# 1. Create the ECR repository first...
terraform apply -target=module.backend.aws_ecr_repository.backend

# 2. ...build and push an arm64 image into it (the deploy script's final
#    update-function-code step can't run yet, so push directly here)...
ECR=$(terraform output -raw ecr_repository_url)
aws ecr get-login-password --region eu-west-1 \
  | docker login --username AWS --password-stdin "${ECR%%/*}"
docker build --platform linux/arm64 -t "$ECR:latest" ../../backend
docker push "$ECR:latest"

# 3. ...then apply everything else.
terraform apply
```

The full apply takes ~10–15 minutes (CloudFront is the slow part). On
subsequent deploys the Lambda already exists, so `deploy-backend.sh` alone
ships backend changes — no Terraform needed.

### 3. ACM certificate (automatic)

Nothing manual. Terraform:

1. Requests a certificate in **us-east-1** for `marcomanduca.dev` +
   `www.marcomanduca.dev` (CloudFront requirement). The backend needs no
   certificate of its own — the Lambda Function URL is HTTPS out of the box.
2. Writes the DNS validation CNAMEs into the hosted zone.
3. Waits until ACM validates them (usually < 5 minutes).

If `apply` stalls on certificate validation, verify the hosted zone is the
one actually attached to the registered domain (matching NS records).

### 4. First deploys

```bash
# Backend: build, push to ECR, update the Lambda function
ECR_REPOSITORY_URL=$(terraform -chdir=infra/terraform output -raw ecr_repository_url) \
FUNCTION_NAME=$(terraform -chdir=infra/terraform output -raw backend_function_name) \
./infra/scripts/deploy-backend.sh

# Frontend: build, sync to S3, invalidate CloudFront
FRONTEND_BUCKET=$(terraform -chdir=infra/terraform output -raw frontend_bucket_name) \
DISTRIBUTION_ID=$(terraform -chdir=infra/terraform output -raw cloudfront_distribution_id) \
./infra/scripts/deploy-frontend.sh
```

Smoke test: `https://marcomanduca.dev` (SPA) and
`https://marcomanduca.dev/api/v1/health` (backend).

### 5. Cognito admin user

Sign-up is disabled (admin-only creation). Create the single administrator:

```bash
USER_POOL_ID=$(terraform -chdir=infra/terraform output -raw cognito_user_pool_id)

aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username admin@marcomanduca.dev \
  --user-attributes Name=email,Value=admin@marcomanduca.dev Name=email_verified,Value=true

aws cognito-idp admin-add-user-to-group \
  --user-pool-id "$USER_POOL_ID" \
  --username admin@marcomanduca.dev \
  --group-name Administrators

# Optional: set a permanent password directly instead of the emailed temporary one
aws cognito-idp admin-set-user-password \
  --user-pool-id "$USER_POOL_ID" \
  --username admin@marcomanduca.dev \
  --password '<strong-password>' \
  --permanent
```

Only members of the `Administrators` group can use `/admin` — the backend
checks the `cognito:groups` claim in the JWT.

### 6. SES sandbox

Terraform verifies the **domain identity** (DKIM + TXT records) automatically,
but new AWS accounts start in the **SES sandbox**: you can only send **to**
verified addresses.

Option A — verify the destination address (fine for a personal contact form):

```bash
aws ses verify-email-identity --email-address marco.manduca95@gmail.com
# click the link in the verification email AWS sends
```

Option B — request production access (no destination restrictions):
Console → **SES → Account dashboard → Request production access**. Describe
the use case ("transactional contact-form emails from my personal portfolio,
low volume"). Approval usually takes ~24 h.

### 7. Environment variable mapping

The Lambda function already injects every backend variable below —
this table is for running the backend **outside** Docker or building the
frontend `.env.production`.

Backend variable names must match the `Settings` fields in
`backend/src/config.py` (each attribute maps to its upper-case env var).

| Terraform output / value                    | Backend `.env`                | Frontend `.env`               |
|---------------------------------------------|-------------------------------|-------------------------------|
| `dynamodb_table_names["projects"]`           | `PROJECTS_TABLE_NAME`         | —                             |
| `dynamodb_table_names["learning"]`           | `LEARNING_TABLE_NAME`         | —                             |
| `dynamodb_table_names["technologies"]`       | `TECHNOLOGIES_TABLE_NAME`     | —                             |
| `dynamodb_table_names["ratelimit"]`          | `RATELIMIT_TABLE_NAME`        | —                             |
| `media_bucket_name`                          | `MEDIA_BUCKET_NAME`           | —                             |
| `cognito_user_pool_id`                       | `COGNITO_USER_POOL_ID`        | `VITE_COGNITO_USER_POOL_ID`   |
| `cognito_client_id`                          | `COGNITO_CLIENT_ID`           | `VITE_COGNITO_CLIENT_ID`      |
| `cognito_hosted_ui_domain`                   | —                             | `VITE_COGNITO_DOMAIN`         |
| `noreply@<domain>` (convention)              | `SES_SENDER_EMAIL`            | —                             |
| contact recipient (tfvars `contact_email`)   | `SES_RECIPIENT_EMAIL`         | —                             |
| `https://<domain>` (convention)              | `CORS_ORIGINS`                | —                             |
| `/api/v1` (relative; CloudFront routes to Lambda)| —                         | `VITE_API_BASE_URL`           |
| region (tfvars `aws_region`)                 | `AWS_REGION`                  | —                             |

### 8. Cost overview (low-traffic personal site, monthly)

| Service                  | Estimate (USD) | Notes                                   |
|--------------------------|---------------:|-----------------------------------------|
| Route 53                 | ~0.90          | hosted zone 0.50 + queries; +14/year domain |
| Lambda (backend)         | ~0             | free tier: 1M requests + 400k GB-s/mo   |
| CloudFront               | ~0–1           | free tier covers personal traffic       |
| S3 (2 buckets)           | < 1            | a few GB of assets                      |
| DynamoDB (on-demand)     | < 1            | pennies at this scale (incl. rate-limit table) |
| Cognito                  | 0              | free tier: 10k MAU                      |
| SES                      | ~0             | 0.10 per 1 000 emails                   |
| ECR + CloudWatch logs    | < 1            | 10-image cap, 14-day log retention      |
| **Total**                | **~1–2**       | dominated by the Route 53 hosted zone   |

The backend used to run on ECS Fargate behind an ALB (~30 USD/mo once the
always-on task, the ALB and public IPv4 charges are added up). Moving it to a
Lambda container image (same code, Lambda Web Adapter) cut that to roughly the
cost of the hosted zone. The trade-off is an occasional ~1–2 s cold start.

### 9. Local development

```bash
# Full stack
docker compose up --build
```

| Service          | URL                          |
|------------------|------------------------------|
| Backend API docs | http://localhost:8000/docs   |
| Frontend (nginx) | http://localhost:5173        |
| DynamoDB Local   | http://localhost:8001        |

Notes:

- `dynamodb-init` runs once, creates the 3 tables (in-memory, recreated on
  every `up`) and exits — exit code 0 is normal.
- For frontend work prefer the Vite dev server (`cd frontend && npm run dev`)
  for hot reload; the compose `frontend` service builds the production
  nginx image.
- `backend/.env` is optional locally: compose already sets the DynamoDB
  endpoint and dummy AWS credentials. Real AWS credentials are never needed
  for local development.

## Day-2 operations

| Task                       | Command                                                            |
|----------------------------|--------------------------------------------------------------------|
| Deploy backend             | `./infra/scripts/deploy-backend.sh` (env vars from terraform output) |
| Deploy frontend            | `./infra/scripts/deploy-frontend.sh` (env vars from terraform output) |
| Tail backend logs          | `aws logs tail /aws/lambda/marcomanduca-dev-backend --follow`      |
| Infrastructure change      | edit Terraform → `terraform plan` → `terraform apply`              |
