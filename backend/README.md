# marcomanduca.dev — Backend

FastAPI backend for the personal portfolio website. It serves projects,
a versioned learning knowledge base, technologies and a contact form, plus
presigned S3 URLs for media (including the downloadable CV PDF). Public
endpoints are read-only; write endpoints require an AWS Cognito access token
belonging to the `Administrators` group.

## Architecture

- **API**: FastAPI under `/api/v1`, app factory in `src/main.py`. In
  production it runs on AWS Lambda (container image + Lambda Web Adapter); the
  same image runs locally via Uvicorn with no code changes.
- **Storage**: DynamoDB (on-demand) for content, S3 for media.
- **Auth**: Cognito JWT validation (JWKS, PyJWT) in `src/utils/auth.py`.
- **Email**: AWS SES for contact form delivery.
- **Anti-spam**: honeypot field + per-network fixed-window rate limit and a
  site-wide daily cap, backed by a DynamoDB TTL table
  (`src/utils/rate_limit.py`), so the limits are shared across Lambda
  invocations and survive cold starts. The per-network limit applies to
  every request; the daily cap is only spent by submissions that are really
  emailed, so honeypot hits and invalid payloads cannot exhaust it. The
  limiter fails closed (503) if DynamoDB is unavailable.
- **Client IP**: taken from the `x-viewer-ip` header, which a CloudFront
  viewer-request function on `/api/*` overwrites with the real viewer IP
  (`src/utils/client_ip.py`). `X-Forwarded-For` is never trusted. Locally
  (no CloudFront) the socket peer address is used. IPv6 callers are grouped
  by `/64`, the block a single subscriber usually holds.
- **Origin lock**: CloudFront adds an `X-Origin-Verify` secret; the API
  Gateway endpoint rejects requests without it (constant-time comparison).
- **Environments**: `APP_ENV=prod` (default, fail-secure) disables `/docs`,
  `/redoc` and `/openapi.json` and refuses to start without
  `ORIGIN_VERIFY_SECRET`. `APP_ENV=local` (docker-compose, tests) keeps the
  docs and allows an empty secret.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/health` | public | Liveness check |
| GET | `/api/v1/projects` | public* | List light project cards (`area`, `context`, `technology`, `search` filters) |
| GET | `/api/v1/projects/{slug}` | public* | Full project, as its page shows it |
| POST | `/api/v1/projects` | admin | Create project |
| PUT | `/api/v1/projects/{slug}` | admin | Replace project |
| DELETE | `/api/v1/projects/{slug}` | admin | Delete project |
| GET | `/api/v1/learning` | public* | List latest article versions (`category`, `tag` filters) |
| GET | `/api/v1/learning/{slug}` | public* | Latest article version |
| GET | `/api/v1/learning/{slug}/versions` | admin | Version history |
| POST | `/api/v1/learning/{slug}/rollback` | admin | Restore an old version as a new latest version |
| POST | `/api/v1/learning` | admin | Create article (version 1) |
| PUT | `/api/v1/learning/{slug}` | admin | Update article (new version) |
| DELETE | `/api/v1/learning/{slug}` | admin | Delete article and history |
| GET | `/api/v1/technologies` | public | List technologies |
| POST | `/api/v1/technologies` | admin | Register technology |
| DELETE | `/api/v1/technologies/{id}` | admin | Delete technology |
| POST | `/api/v1/contact` | public | Contact form (honeypot + rate limit) |
| POST | `/api/v1/media/presign` | admin | Presigned S3 PUT URL |
| GET | `/api/v1/media/url?key=...` | public | Presigned S3 GET URL (CV and generated image keys only) |

\* Authenticated administrators also see `draft`/`archived` content.

### Media uploads

`POST /media/presign` returns a presigned **PUT** URL. Allowed content types:
`image/png`, `image/jpeg`, `image/webp`, `image/gif` under the image prefixes,
and `application/pdf` under `cv/` (SVG is rejected). The object key is
generated server side (`<prefix><uuid>-<slug>.<ext>`, extension derived from
the content type; the CV is always `cv/cv.pdf`). The optional
`content_length` field (bytes, max 10 MB) is signed into the URL so S3
rejects any other body size; clients that omit it get no size enforcement,
so the admin UI should send `file.size`.

## Environment variables

See `.env.example` for the full annotated list.

| Variable | Description | Default |
|---|---|---|
| `AWS_REGION` | AWS region | `eu-west-1` |
| `PROJECTS_TABLE_NAME` | DynamoDB Projects table | `portfolio-projects` |
| `LEARNING_TABLE_NAME` | DynamoDB Learning table | `portfolio-learning` |
| `TECHNOLOGIES_TABLE_NAME` | DynamoDB Technologies table | `portfolio-technologies` |
| `RATELIMIT_TABLE_NAME` | DynamoDB contact rate-limit table | `portfolio-ratelimit` |
| `DYNAMODB_ENDPOINT_URL` | Optional DynamoDB Local endpoint | unset |
| `MEDIA_BUCKET_NAME` | S3 bucket for media | `marcomanduca-dev-media` |
| `PRESIGN_EXPIRATION_SECONDS` | Presigned URL validity | `900` |
| `COGNITO_USER_POOL_ID` | Cognito user pool id | empty |
| `COGNITO_CLIENT_ID` | Cognito app client id | empty |
| `SES_SENDER_EMAIL` | Verified SES sender | `noreply@marcomanduca.dev` |
| `SES_RECIPIENT_EMAIL` | Contact form recipient | `owner@marcomanduca.dev` |
| `CORS_ORIGINS` | Comma-separated origins | `http://localhost:5173` |
| `APP_ENV` | `local` or `prod` (see Architecture) | `prod` |
| `ORIGIN_VERIFY_SECRET` | CloudFront `X-Origin-Verify` secret (required in prod; empty disables the check locally) | empty |
| `CONTACT_RATE_LIMIT_MAX_REQUESTS` | Requests per window per IP (IPv6: per `/64`) | `5` |
| `CONTACT_RATE_LIMIT_WINDOW_SECONDS` | Window length | `900` |
| `CONTACT_RATE_LIMIT_DAILY_MAX` | Emailed contact submissions per UTC day, all IPs | `50` |

## Local development

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

cp .env.example .env  # adjust values

# Optional: DynamoDB Local
docker run -d -p 8001:8000 amazon/dynamodb-local
# then set DYNAMODB_ENDPOINT_URL=http://localhost:8001 in .env
# and create the tables (projects: slug / learning: slug+version / technologies: id / ratelimit: pk).

uvicorn src.main:app --reload --port 8000
```

OpenAPI docs (only with `APP_ENV=local`): `http://localhost:8000/docs`.

## Testing

```bash
# All tests with coverage (fails under 80%)
pytest --cov=src --cov-report=term-missing

# Only unit tests
pytest tests/unit/

# Only integration tests
pytest -m integration

# Lint and format (includes pydocstyle "D" with numpy convention and bandit "S")
ruff check .
ruff format .
```

AWS services are mocked with `moto`; no credentials or network access
are needed to run the suite.

## Docker

```bash
docker build -t marcomanduca-backend .
docker run --rm -p 8000:8000 --env-file .env marcomanduca-backend
```

Multi-stage build on `python:3.12.14-slim` pinned by digest, runs as a
non-root user, no secrets baked into the image. Dependencies are installed
from `requirements.lock` with `--require-hashes`.

## Dependency lockfile

`pyproject.toml` declares compatible ranges; `requirements.lock` pins the
exact runtime set (transitive dependencies included) with hashes, resolved
for the Lambda target (Python 3.12, Linux arm64). Regenerate it after
changing runtime dependencies, then sync your venv to it:

```bash
pip install uv  # once, inside the venv
uv pip compile pyproject.toml --generate-hashes --python-version 3.12 \
  --python-platform aarch64-manylinux_2_28 -o requirements.lock
uv pip install --require-hashes -r requirements.lock
```

## Dependency justification

Runtime (kept minimal on purpose):

- **fastapi** — the web framework; routing, validation, OpenAPI.
- **uvicorn[standard]** — ASGI server for local dev and the container.
- **pydantic** — typed request/response models (FastAPI requirement).
- **pydantic-settings** — typed, env-based configuration.
- **boto3** — AWS SDK for DynamoDB, S3 presigning and SES.
- **PyJWT[crypto]** — Cognito JWT verification with RS256 (the
  `crypto` extra pulls `cryptography` for signature checks).

Notably avoided: `email-validator` (a lightweight regex is enough for
a contact form; SES is the real gatekeeper) and any rate-limit library
(a small DynamoDB fixed-window counter with TTL covers the need and works
across Lambda invocations).

Dev only: **pytest**, **pytest-cov**, **pytest-asyncio**, **httpx**
(ASGI test client), **moto** (AWS mocks), **ruff** (format + lint).
