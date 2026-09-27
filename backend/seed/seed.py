"""Seed the DynamoDB tables with portfolio content.

The seeder reads JSON content from ``seed/data`` and writes it through the
application service layer, so every item is validated against the same
Pydantic schemas and shaped exactly as the API expects.

It is safe to re-run: existing projects, articles and technologies are left
untouched (skipped by primary key). ``--replace`` instead rewrites existing
projects from their files, keeping their creation time: that is how items
stored in an older project schema are migrated.

``--demo`` is for DynamoDB Local: development shows the same projects as
production, each copied with a title that starts with ``DEMO ·``, so every
project page can be tried before it goes live (learning articles still come
from the ``_`` templates). It refuses to run unless ``DYNAMODB_ENDPOINT_URL``
is set, so demo content never reaches AWS.

Configuration is read from the environment / ``.env`` exactly like the
backend (see ``src/config.py``). For DynamoDB Local, set
``DYNAMODB_ENDPOINT_URL`` and the ``*_TABLE_NAME`` variables.

Run from the ``backend`` directory::

    python -m seed.seed             # load real content from data/
    python -m seed.seed --demo      # DEMO copies of the real projects
    python -m seed.seed --replace   # also rewrite projects that exist

Learning files whose name starts with ``_`` are templates, loaded only with
``--demo``.
"""

import argparse
import json
from pathlib import Path
from typing import Any

from botocore.exceptions import ClientError
from pydantic import BaseModel, ValidationError

from src.config import get_settings
from src.schemas.learning import ArticleCreate
from src.schemas.project import ProjectCreate, ProjectUpdate
from src.schemas.technology import TechnologyCreate
from src.services.errors import ConflictError
from src.services.learning_service import get_learning_service
from src.services.project_service import get_project_service
from src.services.technology_service import get_technology_service
from src.utils.slugify import slugify

DATA_DIR = Path(__file__).parent / "data"

#: Title prefix of the development copies of the real projects.
DEMO_PREFIX = "DEMO · "


def _load_json(path: Path) -> Any:
    """Return the parsed JSON content of a file.

    Parameters
    ----------
    path : Path
        File to read.

    Returns
    -------
    Any
        Decoded JSON value.
    """
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def _validate[ModelT: BaseModel](
    model: type[ModelT], data: Any, source: Path
) -> ModelT:
    """Validate raw data against a schema, reporting the source file.

    Parameters
    ----------
    model : type[ModelT]
        Schema to validate against.
    data : Any
        Raw decoded JSON.
    source : Path
        File the data came from, used for error context.

    Returns
    -------
    ModelT
        The validated model instance.

    Raises
    ------
    SystemExit
        When validation fails, with a message naming the file.
    """
    try:
        return model.model_validate(data)
    except ValidationError as exc:
        raise SystemExit(f"Invalid content in {source}:\n{exc}") from exc


def _collection_files(directory: Path, *, demo: bool) -> list[Path]:
    """Return the content files to load from a collection directory.

    Parameters
    ----------
    directory : Path
        Directory holding one JSON file per item.
    demo : bool
        When ``True`` load the ``_``-prefixed templates instead of the
        real content files.

    Returns
    -------
    list[Path]
        Matching JSON files, sorted by name.
    """
    if not directory.is_dir():
        return []
    return sorted(
        path for path in directory.glob("*.json") if path.name.startswith("_") == demo
    )


def _as_demo(project: ProjectCreate, source: Path) -> ProjectCreate:
    """Return the development copy of a real project.

    Its title starts with ``DEMO ·`` in both languages, which also gives it
    a slug of its own (``demo-<slug>``).

    Parameters
    ----------
    project : ProjectCreate
        A validated real project.
    source : Path
        File the project came from, used for error context.

    Returns
    -------
    ProjectCreate
        The copy, validated again (the prefix counts towards the title length).
    """
    title = {
        language: f"{DEMO_PREFIX}{text}"
        for language, text in project.title.model_dump().items()
    }
    data = {**project.model_dump(mode="json"), "title": title}
    return _validate(ProjectCreate, data, source)


def _project_payloads(*, demo: bool) -> list[ProjectCreate]:
    """Return the projects to load, validated.

    Parameters
    ----------
    demo : bool
        When ``True`` return the DEMO copies of the real projects.

    Returns
    -------
    list[ProjectCreate]
        One payload per project.
    """
    projects = [
        (path, _validate(ProjectCreate, _load_json(path), path))
        for path in _collection_files(DATA_DIR / "projects", demo=False)
    ]
    if demo:
        return [_as_demo(project, path) for path, project in projects]
    return [project for _, project in projects]


def seed_technologies() -> None:
    """Register technologies from the technologies data file.

    Development and production share the same registry, which the projects
    refer to.
    """
    path = DATA_DIR / "technologies.json"
    if not path.is_file():
        return
    service = get_technology_service()
    for raw in _load_json(path):
        payload = _validate(TechnologyCreate, raw, path)
        try:
            service.create_technology(payload)
            print(f"  + technology: {payload.name}")
        except ConflictError:
            print(f"  = technology exists, skipped: {payload.name}")


def seed_projects(*, demo: bool, replace: bool = False) -> None:
    """Create projects from one JSON file per project.

    Parameters
    ----------
    demo : bool
        Load the DEMO copies of the real projects instead of the projects.
    replace : bool
        Rewrite projects that already exist instead of skipping them.
    """
    service = get_project_service()
    for payload in _project_payloads(demo=demo):
        slug = slugify(payload.title.en)
        try:
            service.create_project(payload)
            print(f"  + project: {slug}")
        except ConflictError:
            if not replace:
                print(f"  = project exists, skipped: {slug}")
                continue
            service.update_project(slug, ProjectUpdate(**payload.model_dump()))
            print(f"  ~ project replaced: {slug}")


def seed_learning(*, demo: bool) -> None:
    """Create learning articles from one JSON file per article.

    Parameters
    ----------
    demo : bool
        Load the example templates instead of the real files.
    """
    service = get_learning_service()
    for path in _collection_files(DATA_DIR / "learning", demo=demo):
        payload = _validate(ArticleCreate, _load_json(path), path)
        try:
            item = service.create_article(payload)
            print(f"  + article: {item['slug']}")
        except ConflictError:
            print(f"  = article exists, skipped: {path.stem}")


def _seed_all(*, demo: bool, replace: bool) -> None:
    """Seed technologies, projects and learning articles in turn.

    Parameters
    ----------
    demo : bool
        Load the demo content instead of the real content.
    replace : bool
        Rewrite projects that already exist.
    """
    print("Technologies:")
    seed_technologies()
    print("Projects:")
    seed_projects(demo=demo, replace=replace)
    print("Learning articles:")
    seed_learning(demo=demo)


def main(argv: list[str] | None = None) -> None:
    """Run the full seeding pipeline.

    Parameters
    ----------
    argv : list[str] or None
        Command-line arguments (defaults to ``sys.argv``).

    Raises
    ------
    SystemExit
        When ``--demo`` would write to AWS, or when a table is missing.
    """
    parser = argparse.ArgumentParser(description="Seed portfolio content.")
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Load the DEMO copies of the real projects (DynamoDB Local).",
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Rewrite projects that already exist (migrates old items).",
    )
    args = parser.parse_args(argv)
    settings = get_settings()
    endpoint = settings.dynamodb_endpoint_url
    if args.demo and not endpoint:
        raise SystemExit(
            "--demo only runs against DynamoDB Local: set DYNAMODB_ENDPOINT_URL "
            "(http://localhost:8001 with the compose stack), e.g. in backend/.env."
        )
    target = f"DynamoDB Local {endpoint}" if endpoint else f"AWS {settings.aws_region}"
    print(f"Seeding {'demo' if args.demo else 'real'} content into {target}...")

    try:
        _seed_all(demo=args.demo, replace=args.replace)
    except ClientError as exc:
        if exc.response["Error"]["Code"] != "ResourceNotFoundException":
            raise
        raise SystemExit(
            f"A table is missing in {target}. Locally, start the whole stack "
            "(docker compose up) so dynamodb-init creates the tables; otherwise "
            "check the *_TABLE_NAME variables."
        ) from exc
    print("Done.")


if __name__ == "__main__":
    main()
