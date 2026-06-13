# Content seeding

Loads portfolio content (technologies, projects, learning articles) into
DynamoDB. Content is validated against the same Pydantic schemas the API uses,
so seeded items are shaped exactly like API writes.

## Layout

```
seed/
├── seed.py                       # the loader (python -m seed.seed)
└── data/
    ├── technologies.json         # YOUR data — array of technologies (starts empty)
    ├── _technologies.example.json# template (ignored unless --demo)
    ├── projects/
    │   ├── _example.json         # template (ignored unless --demo)
    │   └── <your-project>.json   # one file per project
    └── learning/
        ├── _example.json         # template (ignored unless --demo)
        └── <your-article>.json   # one file per article
```

**Convention:** files whose name starts with `_` are templates. They are
ignored by a normal run and only loaded with `--demo`. Add your real content
as `technologies.json` and one `*.json` per project/article.

## Content shapes

All user-facing text is bilingual: `{ "it": "...", "en": "..." }`.
`status` is one of `draft | published | archived` — **only `published`
content is visible to the public site** (drafts show only in the admin panel).

### Technologies — `data/technologies.json` (array)

```json
[{ "name": "FastAPI", "icon": "fastapi", "category": "backend" }]
```

The technology **id** is derived from the name (slugified): `"FastAPI"` →
`fastapi`. Reference these ids in a project's `technologies` array.

### Projects — one file per project under `data/projects/`

```json
{
  "title":       { "it": "...", "en": "..." },
  "description": { "it": "...", "en": "..." },
  "content_markdown": { "it": "# ...", "en": "# ..." },
  "technologies": ["python", "fastapi"],
  "category": "fullstack",
  "images": [],
  "github_url": "https://github.com/MarcoManduca/...",
  "demo_url": null,
  "status": "draft"
}
```

The **slug** (URL) is derived from `title.en`. `images` are S3 object keys
(upload via the admin Media page, then paste the returned keys here).

### Learning — one file per article under `data/learning/`

```json
{
  "title": { "it": "...", "en": "..." },
  "content_markdown": { "it": "# ...", "en": "# ..." },
  "category": "SWE",
  "tags": ["python"],
  "status": "draft"
}
```

`category` ∈ `CS | Data | SWE | Cloud | Math`. Markdown supports code
highlighting and LaTeX (`$E = mc^2$`). The slug is derived from `title.en`.
Articles are versioned: editing later via the admin panel creates a new
version with rollback support.

## Running

The seeder reads its configuration from the environment / `.env`, exactly like
the backend. Run it from the `backend/` directory.

### Against DynamoDB Local (with the dev stack running)

Make sure the stack is up (`docker compose up`) so the tables exist, then:

```bash
cd backend
source .venv/bin/activate
DYNAMODB_ENDPOINT_URL=http://localhost:8001 \
PROJECTS_TABLE_NAME=portfolio-projects \
LEARNING_TABLE_NAME=portfolio-learning \
TECHNOLOGIES_TABLE_NAME=portfolio-technologies \
AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local AWS_DEFAULT_REGION=eu-west-1 \
python -m seed.seed
```

Tip: put those variables in `backend/.env` (gitignored) once, then just run
`python -m seed.seed`.

Preview the site with sample content (loads the `_*.example` / `_*.json`
templates):

```bash
python -m seed.seed --demo
```

### Against AWS (production)

Use real AWS credentials/region and the deployed table names, and **do not**
set `DYNAMODB_ENDPOINT_URL`:

```bash
PROJECTS_TABLE_NAME=... LEARNING_TABLE_NAME=... \
TECHNOLOGIES_TABLE_NAME=... \
AWS_REGION=eu-west-1 python -m seed.seed
```

(The table names are Terraform outputs — see `infra/README.md` §7.)

## Idempotency

Re-running is safe. Projects, articles and technologies are created only if
their key does not already exist (otherwise skipped — edit those via the admin
panel).
