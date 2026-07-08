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
| IaC      | Terraform                                        |

## Repository structure

```
.
├── backend/     # FastAPI application (routers, services, schemas, models, utils); runs on Lambda
├── frontend/    # React SPA (components, pages, hooks, services, store, i18n)
├── infra/       # Terraform modules + deployment guide
├── docker-compose.yml
└── marcomanduca.dev.md   # Software Requirements Specification (SRS)
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
cd backend && pytest --cov=src --cov-report=term-missing

# Frontend
cd frontend && npx vitest run --coverage
```

Coverage threshold: 80% (enforced in CI).

## Deployment

See [infra/README.md](infra/README.md) for the full AWS deployment guide, including:

1. Registering `marcomanduca.dev` on Route 53
2. Issuing the ACM certificate (us-east-1 for CloudFront)
3. Provisioning all resources with Terraform
4. Deploying backend (Lambda) and frontend (S3 + CloudFront invalidation)

## Documentation

- [DEPLOY.md](DEPLOY.md) — step-by-step deploy guide (frontend, backend, infra, content)
- [backend/README.md](backend/README.md) — API reference, env vars, testing
- [frontend/README.md](frontend/README.md) — pages, i18n, theming
- [infra/README.md](infra/README.md) — Terraform modules, first-time provisioning runbook

## License

The **source code** is released under the [MIT License](LICENSE) — feel free to
read, learn from and reuse it.

All **personal content** is **not** covered by that license and remains
© 2026 Marco Manduca, all rights reserved. This includes the written copy,
the CV, photos, the personal branding and the portfolio/Learning content.
Please do not republish the site as your own; reuse the code, not the persona.
