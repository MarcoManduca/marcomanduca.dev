"""Seed the DynamoDB tables with portfolio content.

The seeder reads JSON content from ``seed/data`` and writes it through the
application service layer, so every item is validated against the same
Pydantic schemas and shaped exactly as the API expects.

It is safe to re-run: existing projects, articles and technologies are left
untouched (skipped by primary key).

Configuration is read from the environment / ``.env`` exactly like the
backend (see ``src/config.py``). For DynamoDB Local, set
``DYNAMODB_ENDPOINT_URL`` and the ``*_TABLE_NAME`` variables.

Run from the ``backend`` directory::

    python -m seed.seed           # load real content from data/
    python -m seed.seed --demo    # load the bundled example templates

Files whose name starts with ``_`` are templates and are ignored unless
``--demo`` is passed.
"""

import argparse
import json
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ValidationError

from src.schemas.learning import ArticleCreate
from src.schemas.project import ProjectCreate
from src.schemas.technology import TechnologyCreate
from src.services.errors import ConflictError
from src.services.learning_service import get_learning_service
from src.services.project_service import get_project_service
from src.services.technology_service import get_technology_service

DATA_DIR = Path(__file__).parent / "data"


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


def _singleton_file(name: str, *, demo: bool) -> Path:
    """Return the path of a single-file data source.

    Parameters
    ----------
    name : str
        Base file name without extension, for example ``"technologies"``.
    demo : bool
        When ``True`` return the ``_``-prefixed example template.

    Returns
    -------
    Path
        The resolved file path (which may not exist).
    """
    return DATA_DIR / (f"_{name}.example.json" if demo else f"{name}.json")


def seed_technologies(*, demo: bool) -> None:
    """Register technologies from the technologies data file.

    Parameters
    ----------
    demo : bool
        Load the example template instead of the real file.
    """
    path = _singleton_file("technologies", demo=demo)
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


def seed_projects(*, demo: bool) -> None:
    """Create projects from one JSON file per project.

    Parameters
    ----------
    demo : bool
        Load the example templates instead of the real files.
    """
    service = get_project_service()
    for path in _collection_files(DATA_DIR / "projects", demo=demo):
        payload = _validate(ProjectCreate, _load_json(path), path)
        try:
            item = service.create_project(payload)
            print(f"  + project: {item['slug']}")
        except ConflictError:
            print(f"  = project exists, skipped: {path.stem}")


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


def main(argv: list[str] | None = None) -> None:
    """Run the full seeding pipeline.

    Parameters
    ----------
    argv : list[str] or None
        Command-line arguments (defaults to ``sys.argv``).
    """
    parser = argparse.ArgumentParser(description="Seed portfolio content.")
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Load the bundled example templates instead of real content.",
    )
    args = parser.parse_args(argv)
    print(f"Seeding from {'example templates' if args.demo else 'data/'}...")

    print("Technologies:")
    seed_technologies(demo=args.demo)
    print("Projects:")
    seed_projects(demo=args.demo)
    print("Learning articles:")
    seed_learning(demo=args.demo)
    print("Done.")


if __name__ == "__main__":
    main()
