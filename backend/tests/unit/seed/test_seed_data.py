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


def test_every_project_technology_is_a_registered_technology() -> None:
    # Arrange
    registered = {
        technology["name"]
        for technology in seeder._load_json(seeder.DATA_DIR / "technologies.json")
    }

    # Act
    used = {
        name
        for project in seeder._project_payloads(demo=False)
        for name in project.technologies
    }

    # Assert: the filter and the stack chips match by name.
    assert used - registered == set()
