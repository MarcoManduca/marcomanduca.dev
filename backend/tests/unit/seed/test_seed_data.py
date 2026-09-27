"""The real seed content validates and gives each project its own slug."""

from seed import seed as seeder
from src.utils.slugify import slugify


def test_real_projects_validate_with_distinct_slugs() -> None:
    # Act
    projects = seeder._project_payloads(demo=False)
    slugs = [slugify(project.title.en) for project in projects]

    # Assert
    assert slugs == ["child-well-being", "deep-layers", "marcomanduca-dev"]


def test_demo_copies_mirror_every_real_project() -> None:
    # Act
    copies = seeder._project_payloads(demo=True)

    # Assert
    assert [slugify(copy.title.en) for copy in copies] == [
        "demo-child-well-being",
        "demo-deep-layers",
        "demo-marcomanduca-dev",
    ]
