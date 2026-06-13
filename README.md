# marcomanduca.dev

Personal professional website: technical portfolio, professional showcase (CV, experience, skills) and technical knowledge base (Learning).

Public, bilingual (IT/EN), SEO-optimized, with a protected admin panel.

## Architecture

```
Browser → CloudFront → React (S3) ─┐
                                   ├→ FastAPI (ECS Fargate) → DynamoDB / S3 / Cognito / SES
Browser → CloudFront → /api ───────┘
```

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React + Vite + TypeScript + Tailwind CSS         |
| State    | Redux Toolkit + RTK Query                        |
| Backend  | FastAPI (Python 3.12)                            |
| Database | AWS DynamoDB                                     |
| Storage  | AWS S3 (project/learning images, CV exports)     |
| Auth     | AWS Cognito (Administrators group)               |
| Hosting  | AWS ECS Fargate (backend), S3 + CloudFront (SPA) |
| DNS/TLS  | Route 53 + ACM                                   |
| IaC      | Terraform                                        |

## Repository structure

```
.
├── backend/     # FastAPI application (routers, services, schemas, models, utils)
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
4. Deploying backend (ECS) and frontend (S3 + CloudFront invalidation)

## Documentation

- [DEPLOY.md](DEPLOY.md) — step-by-step deploy guide (frontend, backend, infra, content)
- [backend/README.md](backend/README.md) — API reference, env vars, testing
- [frontend/README.md](frontend/README.md) — pages, i18n, theming
- [infra/README.md](infra/README.md) — Terraform modules, first-time provisioning runbook
