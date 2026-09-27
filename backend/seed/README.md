# Content seeding

Loads portfolio content (technologies, projects, learning articles) into
DynamoDB. Content is validated against the same Pydantic schemas the API uses,
so seeded items are shaped exactly like API writes.

## Layout

```
seed/
├── seed.py                       # the loader (python -m seed.seed)
└── data/
    ├── technologies.json         # the technology registry (name, icon, category)
    ├── projects/                 # one file per project shown on the site
    │   ├── child-well-being.json
    │   ├── deep-layers.json
    │   └── marcomanduca-dev.json
    └── learning/
        ├── _example.json         # template (ignored unless --demo)
        └── <your-article>.json   # one file per article
```

The project files are the real content, the same in development and
production. Their images live in the frontend, under
`frontend/public/images/projects/<slug>/`, and are referenced by path
(`/images/projects/deep-layers/cover.webp`). Learning files whose name starts
with `_` are templates, loaded only with `--demo`.

## Content shapes

All user-facing text is bilingual: `{ "it": "...", "en": "..." }`.
`status` is one of `draft | published | archived` — **only `published`
content is visible to the public site** (drafts show only in the admin panel).

### Technologies — `data/technologies.json` (array)

```json
[{ "name": "FastAPI", "icon": "fastapi", "category": "backend" }]
```

The technology **id** is derived from the name (slugified): `"FastAPI"` →
`fastapi`. Projects list technologies by **name** (`"FastAPI"`): the Projects
filter matches on it, and the project page groups the stack by `category`
(`language`, `data`, `ml`, `frontend`, `backend`, `cloud`, `testing`,
`tooling`; see `technologyCategories` in the frontend locales).

### Projects — one file per project under `data/projects/`

The site lists only finished projects, so a project has no progress, period
or team. Each classification answers one question:

| Field | Question | Values |
|---|---|---|
| `areas` | In which fields? (1–3, all shown; the first colours the card) | `frontend` `backend` `cloud` `data` `ml` `dl` `ai` |
| `context` | Where was it born? | `academic` `personal` `work` |
| `technologies` | With what? (in display order, cards show 5) | technology names |
| `topics` | About what? (0–5, bilingual) | free labels |

```json
{
  "title":       { "it": "...", "en": "..." },
  "description": { "it": "...", "en": "..." },
  "areas": ["ml", "dl"],
  "context": "academic",
  "cover": { "src": "https://...", "alt": { "it": "...", "en": "..." } },
  "metrics": [{ "value": "15", "label": { "it": "modelli", "en": "models" } }],
  "technologies": ["TensorFlow", "Python"],
  "brief": {
    "objective": { "it": "...", "en": "..." },
    "boss":      { "it": "...", "en": "..." },
    "rewards":   { "it": "...", "en": "..." }
  },
  "content_markdown": { "it": "# ...", "en": "# ..." },
  "topics": [{ "it": "beni culturali", "en": "cultural heritage" }],
  "media": [{ "src": "https://...", "alt": { "it": "...", "en": "..." }, "caption": null }],
  "links": [{ "kind": "repo", "url": "https://github.com/MarcoManduca/..." }],
  "license": "CC BY-NC-SA 4.0",
  "quest": "study-2025-09",
  "lab": null,
  "status": "draft"
}
```

The **slug** (URL) is derived from `title.en`. `cards` (the list endpoint)
carry `title`, `description`, `areas`, `context`, `cover`, up to four
`metrics` (cards show three) and `technologies`, plus the first `repo` link;
the project page gets everything. `brief` tells the project as a quest
(objective, final boss, rewards). `links[].kind` is one of `repo` `paper`
`docs` `live` `video` `dataset`. `license` is **required**: every project
states it on the opening of its page (a dual licence fits in one line, e.g.
`GPL-3.0 · CC BY-SA 4.0`). `quest` is the About page anchor of the CV entry
the project was born in (`work-2020-11`, `study-2025-09`).

`lab` is optional and the page shows it, when present, at the end, after the
gallery. Today it is an `image-compare` demo: up to six `samples`, each a
`base` image with one to four `layers` (id, label, image, alt text, how to
read it) that a divider dragged across the image reveals over it, plus an
optional `model` name.

Images (`cover`, `media`, lab images) are URLs or media-bucket keys (upload
via the admin Media page, then paste the returned keys here).

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

Make sure the stack is up (`docker compose up`; the backend waits for
`dynamodb-init` to create the tables). The database lives in memory, so seed
it again after every restart:

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
`python -m seed.seed`. Without `DYNAMODB_ENDPOINT_URL` the seeder writes to
**AWS**: it prints its target first, and `--demo` refuses to run there.

Development shows the same projects as production:

```bash
python -m seed.seed --demo
```

`--demo` loads a **DEMO copy of every real project**: the same content, with
the title prefixed `DEMO · ` in both languages (so `deep-layers` becomes
`demo-deep-layers`), to try each project page before it goes live. It also
registers the technologies and the learning templates. Run only `--demo`
locally: a plain run on top would add the real projects a second time,
without the prefix. Every demo title starts with "DEMO ·": `--demo` refuses to
run without `DYNAMODB_ENDPOINT_URL`, so it never reaches AWS.

### Against AWS (production)

Use real AWS credentials/region and the deployed table names, and **do not**
set `DYNAMODB_ENDPOINT_URL`:

```bash
PROJECTS_TABLE_NAME=... LEARNING_TABLE_NAME=... \
TECHNOLOGIES_TABLE_NAME=... \
AWS_REGION=eu-west-1 python -m seed.seed
```

(The table names are Terraform outputs — see `infra/README.md` §7.)

## Idempotency and migrations

Re-running is safe. Projects, articles and technologies are created only if
their key does not already exist (otherwise skipped — edit those via the admin
panel).

`--replace` rewrites projects that already exist from their files, keeping
their creation time. It is how items stored in an older project schema are
migrated: the API leaves those out of lists (and logs their slug) until they
are rewritten.

```bash
python -m seed.seed --replace          # real content
python -m seed.seed --demo --replace   # demo content, DynamoDB Local only
```
