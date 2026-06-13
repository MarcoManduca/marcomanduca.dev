# marcomanduca.dev — Backend

FastAPI backend for the personal portfolio website. It serves projects,
a versioned learning knowledge base, a dynamic bilingual CV (with PDF
export) and a contact form. Public endpoints are read-only; write
endpoints require an AWS Cognito access token belonging to the
`Administrators` group.

## Architecture

- **API**: FastAPI under `/api/v1`, app factory in `src/main.py`.
- **Storage**: DynamoDB (on-demand) for content, S3 for media.
- **Auth**: Cognito JWT validation (JWKS, PyJWT) in `src/utils/auth.py`.
- **Email**: AWS SES for contact form delivery.
- **Anti-spam**: honeypot field + in-memory per-IP sliding-window rate
  limit (per instance; production can move this to API Gateway/WAF).

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/health` | public | Liveness check |
| GET | `/api/v1/projects` | public* | List projects (`category`, `technology`, `search` filters) |
| GET | `/api/v1/projects/{slug}` | public* | Project detail |
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
| GET | `/api/v1/cv?lang=it\|en` | public | Structured CV |
| GET | `/api/v1/cv/pdf?lang=it\|en` | public | Generated PDF |
| PUT | `/api/v1/cv/{section}` | admin | Replace CV section |
| POST | `/api/v1/contact` | public | Contact form (honeypot + rate limit) |
| POST | `/api/v1/media/presign` | admin | Presigned S3 PUT URL |
| GET | `/api/v1/media/url?key=...` | public | Presigned S3 GET URL |

\* Authenticated administrators also see `draft`/`archived` content.

## Environment variables

See `.env.example` for the full annotated list.

| Variable | Description | Default |
|---|---|---|
| `AWS_REGION` | AWS region | `eu-west-1` |
| `PROJECTS_TABLE_NAME` | DynamoDB Projects table | `portfolio-projects` |
| `LEARNING_TABLE_NAME` | DynamoDB Learning table | `portfolio-learning` |
| `TECHNOLOGIES_TABLE_NAME` | DynamoDB Technologies table | `portfolio-technologies` |
| `CV_TABLE_NAME` | DynamoDB CV table | `portfolio-cv` |
| `DYNAMODB_ENDPOINT_URL` | Optional DynamoDB Local endpoint | unset |
| `MEDIA_BUCKET_NAME` | S3 bucket for media | `marcomanduca-dev-media` |
| `PRESIGN_EXPIRATION_SECONDS` | Presigned URL validity | `900` |
| `COGNITO_USER_POOL_ID` | Cognito user pool id | empty |
| `COGNITO_CLIENT_ID` | Cognito app client id | empty |
| `SES_SENDER_EMAIL` | Verified SES sender | `noreply@marcomanduca.dev` |
| `SES_RECIPIENT_EMAIL` | Contact form recipient | `owner@marcomanduca.dev` |
| `CORS_ORIGINS` | Comma-separated origins | `http://localhost:5173` |
| `CONTACT_RATE_LIMIT_MAX_REQUESTS` | Requests per window per IP | `5` |
| `CONTACT_RATE_LIMIT_WINDOW_SECONDS` | Window length | `900` |

## Local development

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

cp .env.example .env  # adjust values

# Optional: DynamoDB Local
docker run -d -p 8001:8000 amazon/dynamodb-local
# then set DYNAMODB_ENDPOINT_URL=http://localhost:8001 in .env
# and create the four tables (slug / slug+version / id / section keys).

uvicorn src.main:app --reload --port 8000
```

OpenAPI docs: `http://localhost:8000/docs`.

## Testing

```bash
# All tests with coverage (fails under 80%)
pytest --cov=src --cov-report=term-missing

# Only unit tests
pytest tests/unit/

# Only integration tests
pytest -m integration

# Lint and format
ruff check src tests
ruff format src tests
```

AWS services are mocked with `moto`; no credentials or network access
are needed to run the suite.

## Docker

```bash
docker build -t marcomanduca-backend .
docker run --rm -p 8000:8000 --env-file .env marcomanduca-backend
```

Multi-stage build on `python:3.12-slim`, runs as a non-root user, no
secrets baked into the image.

## Dependency justification

Runtime (kept minimal on purpose):

- **fastapi** — the web framework; routing, validation, OpenAPI.
- **uvicorn[standard]** — ASGI server for local dev and the container.
- **pydantic** — typed request/response models (FastAPI requirement).
- **pydantic-settings** — typed, env-based configuration.
- **boto3** — AWS SDK for DynamoDB, S3 presigning and SES.
- **PyJWT[crypto]** — Cognito JWT verification with RS256 (the
  `crypto` extra pulls `cryptography` for signature checks).
- **reportlab** — pure-Python PDF generation for the CV export; no
  system binaries (unlike WeasyPrint/wkhtmltopdf), small surface.

Notably avoided: `email-validator` (a lightweight regex is enough for
a contact form; SES is the real gatekeeper) and any rate-limit library
(a ~40-line sliding window covers the need).

Dev only: **pytest**, **pytest-cov**, **pytest-asyncio**, **httpx**
(ASGI test client), **moto** (AWS mocks), **ruff** (format + lint).
