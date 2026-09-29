# Infrastructure — marcomanduca.dev

Terraform-managed AWS infrastructure plus deployment scripts and the local
development stack.

## Architecture

```
                         ┌────────────────────────────────────────────┐
 Browser ──HTTPS──> CloudFront (marcomanduca.dev + www)               │
                         │  default ──OAC──> S3 frontend bucket (SPA) │
                         │  /media/images/* ──OAC──> S3 media bucket  │
                         │  /api/*  ──secret header──> API Gateway     │
                         └───────────────────────┬────────────────────┘
                                                 │
                                  API Gateway HTTP API ──> AWS Lambda
                                       (FastAPI container image)
                                                 │
                              DynamoDB · S3 media · Cognito · SES
```

Design decisions:

- **Single domain, single public certificate.** The API is served from the
  same CloudFront distribution under `/api/*` (origin = API Gateway HTTP API)
  instead of a dedicated `api.` subdomain: one certificate, one DNS name, no
  CORS between site and API.
- **Serverless backend.** The FastAPI container runs on Lambda (via the AWS
  Lambda Web Adapter), not on an always-on Fargate task behind an ALB. This
  removes the ALB (~17 USD/mo), the always-on task (~10 USD/mo) and the public
  IPv4 charges (~11 USD/mo), and scales to zero. The trade-off is an occasional
  ~1–2 s cold start, acceptable for a personal site.
- **API Gateway, not a Function URL.** This account blocks public (AuthType
  `NONE`) Lambda Function URLs, and an IAM-auth Function URL behind CloudFront
  OAC would sigv4-sign the `Authorization` header and clobber the Cognito
  Bearer token admin routes rely on. An HTTP API forwards `Authorization`
  untouched and needs no public Function URL.
- **Origin protection.** The HTTP API is public, but CloudFront injects a
  secret `X-Origin-Verify` header that the app checks
  (`backend/src/utils/origin_verify.py`); direct hits on the execute-api
  endpoint without it get a 403. Rotation is two applies with no downtime
  (the old value stays accepted meanwhile): see "Rotate origin secret" in
  Day-2 operations.
- **No VPC.** The function talks only to public AWS APIs (DynamoDB, S3, SES,
  Cognito JWKS), so it runs outside a VPC: no subnets, no NAT gateway, no
  public IP to pay for.
- **SPA routing at the edge.** A viewer-request CloudFront Function on the
  default behavior rewrites extension-less paths (`/projects/foo`, `/admin`)
  to the route's pre-rendered page (`/_routes/projects/foo.html`, written by
  `npm run build` with that page's meta tags, for link previews and crawlers
  that do not run JS) when the routes **key value store** lists the path, and
  to `/index.html` otherwise, so content published after the last frontend
  deploy (or a store error) still gets the SPA shell. The deploy script owns
  the store's keys, Terraform only the store. Paths with an extension go to
  S3 untouched. There is no distribution-wide `custom_error_response`, so
  real API statuses (401/403/404/429…) reach the SPA unchanged and a missing
  asset is a real 404. The same function 301-redirects `www.` to the apex and
  drops trailing slashes (one canonical URL per page).
- **Uploaded images.** The admin uploads to the private media bucket through
  presigned PUT URLs; `/media/images/*` serves `images/*` from it through an
  OAC (a function strips the `/media` prefix, since `/images/` belongs to the
  frontend bucket). The bucket policy only lets CloudFront read `images/*`:
  the CV under `cv/` stays behind short-lived presigned GET URLs.
- **Real client IP.** A viewer-request function on `/api/*` overwrites the
  `x-viewer-ip` header with the viewer IP (client-supplied values are
  discarded); the backend rate limiter keys on it.
- **Remote state.** Terraform state lives in a private, versioned,
  encrypted, TLS-only S3 bucket with S3-native locking. The state contains
  secrets (the origin-verify shared secret), hence the encryption.
- **Cost guardrails.** API Gateway stage throttling (and Lambda reserved
  concurrency, where the account quota allows one) caps the blast radius of a
  traffic flood; a monthly AWS Budget and CloudWatch alarms (Lambda
  errors/throttles, API 5xx/4xx spike, SES bounce/complaint rate) email the
  owner, as do CRITICAL/HIGH findings of the ECR scan of every pushed image. API Gateway access logs (no client IPs) record every request,
  including the 429s the stage answers itself.

## Layout

```
infra/
├── README.md                  # this runbook
├── scripts/
│   ├── create-local-tables.sh # DynamoDB Local table bootstrap
│   ├── deploy-frontend.sh     # build + s3 sync + route keys + asset prune + invalidation
│   └── deploy-backend.sh      # docker build/push + lambda update-function-code
└── terraform/
    ├── bootstrap/             # separate root (local state): the remote-state S3 bucket
    ├── main.tf                # module wiring
    ├── providers.tf           # S3 backend (partial config) + region/us-east-1 providers
    ├── backend.hcl.example    # copy to backend.hcl (gitignored)
    ├── variables.tf
    ├── outputs.tf
    ├── terraform.tfvars.example
    └── modules/
        ├── dns/               # Route 53 hosted zone (create or look up)
        ├── acm/               # us-east-1 certificate + DNS validation
        ├── storage/           # S3 frontend + media buckets
        ├── database/          # 4 DynamoDB tables (PAY_PER_REQUEST)
        ├── auth/              # Cognito user pool (TOTP MFA), SPA client, optional dev client, hosted UI, group
        ├── email/             # SES domain identity, DKIM, MAIL FROM (SPF) and DMARC records
        ├── backend/           # ECR, Lambda + API Gateway HTTP API (throttled, access-logged), origin secret, IAM, logs
        ├── cdn/               # CloudFront distribution, edge functions + routes KVS, headers policies, OACs, bucket policies
        └── monitoring/        # monthly budget, SNS alert topic, CloudWatch alarms, ECR scan alerts
```

---

## Deployment runbook

### 1. Domain on Route 53

`marcomanduca.dev` is registered through Route 53 (for a new domain:
Console → **Route 53 → Registered domains → Register domain**, ~14 USD/year
for `.dev`). Route 53 automatically creates the **hosted zone**
(~0.50 USD/month), so keep `create_hosted_zone = false` in
`terraform.tfvars` and Terraform looks it up instead of creating a duplicate.

> `.dev` is on the HSTS preload list: browsers force HTTPS. CloudFront + ACM
> below handle this — nothing extra to do.

### 2. Bootstrap Terraform

Prerequisites: AWS account, AWS CLI v2 configured (`aws configure` or SSO),
Terraform >= 1.10 (S3-native state locking), Docker, Node.js 24, Python 3.12.

#### 2a. Remote state bucket (once)

The state bucket is created by a tiny separate root with **local** state
(`infra/terraform/bootstrap`): versioning, SSE, full public access block,
a deny-non-TLS bucket policy and `prevent_destroy`.

```bash
cd infra/terraform/bootstrap
terraform init
terraform apply            # optionally -var state_bucket_name=<unique-name>
```

Then point the main root at it:

```bash
cd ..                      # infra/terraform
cp backend.hcl.example backend.hcl   # set bucket/region from the bootstrap outputs
cp terraform.tfvars.example terraform.tfvars   # then edit
```

#### 2b. Migrating an existing local state (runbook)

If the stack was previously applied with local state (a `terraform.tfstate`
in `infra/terraform`):

```bash
cd infra/terraform
terraform init -backend-config=backend.hcl -migrate-state   # answer "yes"
terraform plan             # verify: must show only the intended changes, no mass re-create
aws s3 ls s3://<state-bucket>/marcomanduca.dev/            # terraform.tfstate is there
rm terraform.tfstate terraform.tfstate.*backup             # local copies (they contain secrets)
```

Delete the local files only after the plan against the remote state looks
right. From then on a fresh checkout only needs
`terraform init -backend-config=backend.hcl`. CI always runs
`terraform init -backend=false` and never touches the state.

Saved plan files (`terraform plan -out=<file>`) embed the full state, secrets
included, in plain text. They are gitignored (`*.tfplan`); delete them once
the apply is done.

#### 2c. First apply (fresh account)

```bash
terraform init -backend-config=backend.hcl
terraform plan      # review
```

A container-image Lambda cannot be created before its (arm64) image exists in
ECR, and ECR tags are **immutable** (no moving `latest`), so the very first
apply is two-phase. `backend_image_tag` defaults to `bootstrap`:

```bash
# 1. Create the ECR repository first...
terraform apply -target=module.backend.aws_ecr_repository.backend

# 2. ...push an arm64 image tagged "bootstrap" (no Lambda update yet)...
IMAGE_TAG=bootstrap SKIP_LAMBDA_UPDATE=1 \
ECR_REPOSITORY_URL=$(terraform output -raw ecr_repository_url) \
../scripts/deploy-backend.sh

# 3. ...then apply everything else.
terraform apply
```

Terraform ignores `image_uri` after creation (`lifecycle.ignore_changes`):
`deploy-backend.sh` owns the running image and points the function at
git-SHA tags, so a later `terraform apply` never rolls the backend back.

The full apply takes ~10–15 minutes (CloudFront is the slow part). On
subsequent deploys the Lambda already exists, so `deploy-backend.sh` alone
ships backend changes — no Terraform needed.

#### 2d. After the first apply

- **Confirm the SNS subscription**: AWS emails the alert address
  (`alert_email`, default `contact_email`) a confirmation link. Alarm emails
  are not delivered until it is clicked. Budget emails need no confirmation.
- **Lambda concurrency quota**: `backend_reserved_concurrency` (default 5)
  reserves concurrency as a hard cost cap. New accounts often have an account
  concurrency quota of **10**, and Lambda keeps 10 unreserved executions, so
  any reservation makes the apply **fail**. Check it with
  `aws lambda get-account-settings` (`ConcurrentExecutions`); if it is 10,
  set `backend_reserved_concurrency = -1` or request a quota increase. With
  `-1` there is no concurrency cap: API Gateway stage throttling is the only
  hard limit left (see "Cost guardrails").

### 3. ACM certificate (automatic)

Nothing manual. Terraform:

1. Requests a certificate in **us-east-1** for `marcomanduca.dev` +
   `www.marcomanduca.dev` (CloudFront requirement). The backend needs no
   certificate of its own — the API Gateway HTTP API is HTTPS out of the box.
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

# Frontend: build + pre-render, sync to S3, sync the route keys, invalidate CloudFront
FRONTEND_BUCKET=$(terraform -chdir=infra/terraform output -raw frontend_bucket_name) \
DISTRIBUTION_ID=$(terraform -chdir=infra/terraform output -raw cloudfront_distribution_id) \
ROUTES_KVS_ARN=$(terraform -chdir=infra/terraform output -raw routes_kvs_arn) \
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

**MFA (TOTP) is required** (`cognito_mfa_configuration = "ON"`). After this is
applied, the admin is asked to enroll an authenticator app at the next hosted
UI login. If AWS refuses to switch an existing pool from `OFF` to `ON`, set
`cognito_mfa_configuration = "OPTIONAL"`, enroll TOTP, then switch back.

The user pool has **deletion protection** on. The production app client only
accepts `https://<domain>` redirects; for the Vite dev server set
`enable_dev_client = true` and use the `cognito_dev_client_id` output as
`VITE_COGNITO_CLIENT_ID` locally.

The app clients allow **no direct sign-in flow**: `explicit_auth_flows` is
only `ALLOW_REFRESH_TOKEN_AUTH`, because admins sign in through the hosted UI
(OAuth authorization code). Left unset, AWS enables `USER_SRP_AUTH` and
`CUSTOM_AUTH` by default, and anyone holding the public client id could try
passwords against `InitiateAuth` outside the hosted UI. To check a client:

```bash
aws cognito-idp describe-user-pool-client --user-pool-id "$USER_POOL_ID" \
  --client-id "$(terraform output -raw cognito_client_id)" \
  --query 'UserPoolClient.ExplicitAuthFlows'
```

### 6. SES sandbox

Terraform verifies the **domain identity** (DKIM + TXT records) automatically
and sets up sender authentication:

- a custom **MAIL FROM** domain `mail.<domain>` (MX + SPF records), so SPF
  passes aligned with the From domain, not only DKIM;
- a **DMARC** record (`_dmarc.<domain>`) with `p=quarantine` by default
  (`dmarc_policy`): mail claiming to be from the domain that passes neither
  aligned SPF nor DKIM, i.e. spoofing, goes to spam. SES is the only sender
  for the domain (Cognito uses its own default sender), so legitimate mail
  always aligns. Aggregate reports are off unless `dmarc_report_email` is
  set; receivers only send them to another domain that authorizes it.

Check after the apply: `dig +short TXT _dmarc.<domain>` and, in the SES
console, the identity's custom MAIL FROM status "Success".

New AWS accounts start in the **SES sandbox**: you can only send **to**
verified addresses.

Option A — verify the destination address (fine for a personal contact form):

```bash
aws ses verify-email-identity --email-address you@example.com  # your contact_email
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
| `cognito_user_pool_id`                       | `COGNITO_USER_POOL_ID`        | `VITE_COGNITO_AUTHORITY` = `https://cognito-idp.<region>.amazonaws.com/<pool id>` |
| `cognito_client_id` (dev: `cognito_dev_client_id`) | `COGNITO_CLIENT_ID`     | `VITE_COGNITO_CLIENT_ID`      |
| `https://<domain>/admin/callback`            | —                             | `VITE_COGNITO_REDIRECT_URI`   |
| `cognito_hosted_ui_domain`                   | —                             | `VITE_COGNITO_DOMAIN` = `https://<hosted ui domain>` |
| `noreply@<domain>` (convention)              | `SES_SENDER_EMAIL`            | —                             |
| contact recipient (tfvars `contact_email`)   | `SES_RECIPIENT_EMAIL`         | —                             |
| `https://<domain>` (convention)              | `CORS_ORIGINS`                | —                             |
| `prod` (fixed on Lambda)                     | `APP_ENV`                     | —                             |
| generated by Terraform (`random_password`)   | `ORIGIN_VERIFY_SECRET`        | —                             |
| tfvars `origin_verify_secret_previous` (rotation only) | `ORIGIN_VERIFY_SECRET_PREVIOUS` | —               |
| tfvars `contact_rate_limit_daily_max` (50)   | `CONTACT_RATE_LIMIT_DAILY_MAX`| —                             |
| `/api/v1` (relative; CloudFront routes to API Gateway)| —                    | `VITE_API_BASE_URL`           |
| region (tfvars `aws_region`)                 | `AWS_REGION`                  | —                             |

### 8. Cost overview (low-traffic personal site, monthly)

| Service                  | Estimate (USD) | Notes                                   |
|--------------------------|---------------:|-----------------------------------------|
| Route 53                 | ~0.90          | hosted zone 0.50 + queries; +14/year domain |
| Lambda (backend)         | ~0             | free tier: 1M requests + 400k GB-s/mo   |
| API Gateway (HTTP API)   | ~0             | 1.00 per million requests; free tier 1M/mo first year |
| CloudFront               | ~0–1           | free tier covers personal traffic       |
| S3 (2 buckets)           | < 1            | a few GB of assets                      |
| DynamoDB (on-demand)     | < 1            | pennies at this scale (incl. rate-limit table) |
| Cognito                  | 0              | free tier: 10k MAU                      |
| SES                      | ~0             | 0.10 per 1 000 emails                   |
| ECR + CloudWatch logs    | < 1            | 10-image cap, 14-day log retention      |
| CloudWatch alarms + SNS  | ~0–0.60        | 6 alarms (10 free), email delivery free |
| AWS Budgets              | 0              | first 2 budgets are free                |
| **Total**                | **~1–2**       | dominated by the Route 53 hosted zone   |

The backend used to run on ECS Fargate behind an ALB (~30 USD/mo once the
always-on task, the ALB and public IPv4 charges are added up). Moving it to a
Lambda container image (same code, Lambda Web Adapter) cut that to roughly the
cost of the hosted zone. The trade-off is an occasional ~1–2 s cold start.

### 9. Cost guardrails

| Guardrail                         | Variable (default)                                   | Effect |
|-----------------------------------|------------------------------------------------------|--------|
| Lambda reserved concurrency       | `backend_reserved_concurrency` (5; -1 = off)          | hard cap on parallel executions → throttles, not bills |
| API Gateway stage throttling      | `api_throttling_rate_limit` (20 rps), `api_throttling_burst_limit` (10) | excess requests get 429 before Lambda runs, as long as the burst stays at or below the Lambda concurrency (reserved, or the account quota with -1); beyond it they end as Lambda throttles (5xx + alarms) |
| Contact-form daily cap            | `contact_rate_limit_daily_max` (50)                  | global SES send cap in the backend |
| Monthly budget                    | `monthly_budget_usd` (10)                            | email at 80% actual and 100% forecasted |
| CloudWatch alarms → SNS email     | `alert_email` (null → `contact_email`)               | Lambda errors/throttles, API 5xx, API 4xx spike, SES bounce/complaint rate; ECR scan findings via EventBridge |

Budgets and alarms only notify; the first two rows are the actual caps.
With `backend_reserved_concurrency = -1` (accounts whose concurrency quota is
10) the first row is off and stage throttling is the only cap; request a
Lambda quota increase to get it back.

### 10. Local development

```bash
# Full stack
docker compose up --build
```

| Service          | URL                          |
|------------------|------------------------------|
| Backend API docs | http://localhost:8000/docs   |
| Frontend (nginx) | http://localhost:5173        |
| DynamoDB Local   | http://localhost:8001        |

All three ports are bound to `127.0.0.1` only: locally the API runs with
its docs on and the origin check off, so it must not be reachable from the
LAN.

Notes:

- `dynamodb-init` runs once, creates the 4 tables (in-memory, recreated on
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
| Roll back backend          | `IMAGE_TAG=<older-sha> ./infra/scripts/deploy-backend.sh` (no rebuild; the image must still be in ECR, which keeps the last 10; tags are 12-character SHAs, older images keep their 7-character tags) |
| Rotate origin secret       | two applies, see below                                             |

Backend deploys only ever build the committed checkout, because an image
pushed under the wrong immutable SHA tag cannot be fixed. The script refuses
a dirty `backend/` (override with `ALLOW_DIRTY=1`), and refuses an
`IMAGE_TAG` that names another commit when that image is no longer in ECR
(for example a rollback older than the last 10 images). In that case check
out the commit and deploy it without `IMAGE_TAG`.

Frontend deploys stop before building if a `VITE_COGNITO_*` value is missing
from both the environment and `frontend/.env.production`.

Frontend deploys build with `PRERENDER_STRICT=1` (an unreachable API stops
the deploy instead of publishing a site without its project pages), then:

1. upload hashed `assets/` with `Cache-Control: public,max-age=31536000,immutable`
   and this deploy's asset manifest (`_deploys/<UTC timestamp>.txt`);
2. upload `index.html`, the pre-rendered `_routes/` pages and the other root
   files with `no-cache`, deleting nothing yet;
3. make the routes key value store list exactly this build's pages (keys
   added only once their page is in the bucket);
4. delete stale root files (pages of unpublished content, now keyless);
5. prune old hashed assets: an asset goes only when no kept manifest lists it
   (the current one, the previous one, and every one younger than
   `ASSET_RETENTION_DAYS`, default 7) and it was uploaded before that window
   too. Open tabs of the previous build keep loading their lazy chunks however
   long ago it shipped (and a tab that still fails reloads once);
6. invalidate CloudFront.

The key value store API is signed with SigV4A: use AWS CLI v2.

### Rotate origin secret

CloudFront takes minutes to push a new `X-Origin-Verify` value to every edge,
while the Lambda switches in seconds. So the old value stays accepted
(`ORIGIN_VERIFY_SECRET_PREVIOUS`) until the distribution is deployed:

```bash
cd infra/terraform
# 1. New secret; the current one keeps working. The value only lives in
#    this shell (never in a tfvars file).
export TF_VAR_origin_verify_secret_previous="$(aws lambda get-function-configuration \
  --function-name marcomanduca-dev-backend \
  --query 'Environment.Variables.ORIGIN_VERIFY_SECRET' --output text)"
terraform apply -replace=module.backend.random_password.origin_verify

# 2. Once every edge sends the new value, stop accepting the old one.
aws cloudfront wait distribution-deployed --id "$(terraform output -raw cloudfront_distribution_id)"
unset TF_VAR_origin_verify_secret_previous
terraform apply
```

Follow-up (not implemented): deploy automation (GitHub Actions with OIDC
role assumption) — deploys are manual via the scripts today.
