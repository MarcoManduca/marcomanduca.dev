# marcomanduca.dev

Personal professional website: technical portfolio, an "About me" showcase (experience, skills, downloadable CV) and a technical knowledge base (Learning).

Public, bilingual (IT/EN), SEO-optimized, with a protected admin panel.

## Architecture

```
Browser → CloudFront → React (S3) ─┐
                                   ├→ FastAPI (Lambda) → DynamoDB / S3 / Cognito / SES
Browser → CloudFront → /api ───────┘
```

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React + Vite + TypeScript + Tailwind CSS         |
| State    | Redux Toolkit + RTK Query                        |
| Backend  | FastAPI (Python 3.12) on AWS Lambda (container image) |
| Database | AWS DynamoDB                                     |
| Storage  | AWS S3 (project/learning images, downloadable CV PDF) |
| Auth     | AWS Cognito (Administrators group)               |
| Hosting  | AWS Lambda + API Gateway (backend), S3 + CloudFront (SPA) |
| DNS/TLS  | Route 53 + ACM                                   |
| IaC      | Terraform (remote state in an encrypted, versioned S3 bucket) |
| Ops      | AWS Budgets + CloudWatch alarms (SNS email), Lambda/API Gateway cost caps |

## Repository structure

```
.
├── backend/     # FastAPI application (routers, services, schemas, models, utils); runs on Lambda
├── frontend/    # React SPA (components, pages, hooks, services, store, i18n)
├── infra/       # Terraform modules + deployment guide
└── docker-compose.yml
```

Each top-level directory has its own `README.md` with detailed instructions.

## Quickstart (local development)

Prerequisites: Docker, Node.js 20+, Python 3.12+.

```bash
# Full stack with Docker (backend + frontend + DynamoDB Local)
docker compose up --build

# Backend only
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
uvicorn src.main:app --reload

# Frontend only
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs
- DynamoDB Local: http://localhost:8001

## Testing

```bash
# Backend
cd backend && pytest --cov=src --cov-report=term-missing   # CI: tests/unit + tests/integration, combined gate

# Frontend
cd frontend && npx vitest run --coverage
```

Coverage threshold: 80% (enforced in CI).

## Deployment

See [infra/README.md](infra/README.md) for the full AWS deployment guide, including:

1. Registering `marcomanduca.dev` on Route 53
2. Bootstrapping the remote Terraform state bucket (`infra/terraform/bootstrap`)
   and migrating to the S3 backend
3. Issuing the ACM certificate (us-east-1 for CloudFront)
4. Provisioning all resources with Terraform, including the `monitoring`
   module (monthly budget, SNS alerts, CloudWatch alarms)
5. Deploying backend (Lambda) and frontend (S3 + CloudFront invalidation)

CI (`.github/workflows/ci.yml`) runs lint, tests with coverage gates,
Terraform fmt/validate, gitleaks, hadolint, and Trivy IaC + image scans.
Deploys are manual (scripts in `infra/scripts`).

## Documentation

- [backend/README.md](backend/README.md) — API reference, env vars, testing
- [frontend/README.md](frontend/README.md) — pages, i18n, theming
- [infra/README.md](infra/README.md) — Terraform modules, provisioning + day-2 deploy runbook

## License

The **source code** is released under the [MIT License](LICENSE) — feel free to
read, learn from and reuse it.

All **personal content** is **not** covered by that license and remains
© 2026 Marco Manduca, all rights reserved. This includes the written copy,
the CV, photos, the personal branding and the portfolio/Learning content.
Please do not republish the site as your own; reuse the code, not the persona.
