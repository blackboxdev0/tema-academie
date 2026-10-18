"""Explicit file ownership shared by method validation and isolated tests."""
from __future__ import annotations

from pathlib import Path, PurePosixPath
import shutil

from bmad import checkout_path, load_lock, read_object

MANIFEST = "config/method-files.json"


def manifest(root: Path) -> dict:
    value = read_object(root, MANIFEST)
    files, fixtures = value.get("files"), value.get("fixture_overrides")
    if (value.get("schema_version") != 1 or not isinstance(files, list) or not files
            or any(not isinstance(relative, str) for relative in files)
            or len(set(files)) != len(files) or MANIFEST not in files
            or not isinstance(fixtures, dict)):
        raise ValueError("Invalid method ownership inventory.")
    for relative in files:
        checkout_path(root, relative)
    for relative, fixture in fixtures.items():
        if (relative not in files or not isinstance(fixture, str) or fixture not in files
                or not fixture.startswith("tests/fixtures/")):
            raise ValueError("Invalid pristine method fixture binding.")
    return value


def owned_files(root: Path, *, native: bool = False) -> list[str]:
    files = set(manifest(root)["files"])
    if native:
        files.update(load_lock(root)["files"])
    for relative in sorted(files):
        if not checkout_path(root, relative).is_file():
            raise ValueError(f"Missing method-owned file: {relative}")
    return sorted(files)


def test_files(root: Path) -> list[str]:
    tests = [relative for relative in owned_files(root)
             if PurePosixPath(relative).parent == PurePosixPath("tests")
             and PurePosixPath(relative).name.startswith("test_")
             and PurePosixPath(relative).suffix == ".py"]
    if not tests:
        raise ValueError("The method ownership inventory has no test modules.")
    return tests


def copy_method(source: Path, destination: Path, *, pristine: bool = False) -> None:
    """Copy enumerated method/native files; never import live product state."""
    source = source.resolve()
    files = owned_files(source, native=True)
    fixtures = manifest(source)["fixture_overrides"] if pristine else {}
    # Resolve and confirm every source before creating the isolated checkout.
    sources = {relative: checkout_path(source, fixtures.get(relative, relative)) for relative in files}
    destination.mkdir(parents=True, exist_ok=False)
    for relative, path in sources.items():
        target = checkout_path(destination, relative)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(path, target)
