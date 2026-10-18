#!/usr/bin/env python3
"""Inspect installed BMAD and its capability map; never install or rewrite files."""
from __future__ import annotations

import argparse
import csv
import hashlib
from http.client import HTTPException
import io
import json
from pathlib import Path, PurePosixPath
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

ROOT = Path(__file__).resolve().parents[1]
PROVIDERS = {"codex": ".agents/skills", "claude-code": ".claude/skills"}
LATEST_URL = "https://registry.npmjs.org/bmad-method/latest"
STABLE_VERSION = re.compile(r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)\Z")
REQUIRED_CAPABILITIES = {"framing", "implementation", "review", "testing", "stories", "project_knowledge", "guidance"}
CATALOGUE_FILES = ("_bmad/_config/skill-manifest.csv", "_bmad/_config/bmad-help.csv")
RESOURCE_FILES = (*CATALOGUE_FILES, "_bmad/core/module-help.csv", "_bmad/bmm/module-help.csv",
                  "_bmad/core/v6-shims/README.md", "_bmad/bmm/v6-shims/README.md", "vendor/BMAD-LICENSE")


class BmadError(ValueError):
    pass


class _RefuseRedirects(HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, new_url):
        raise BmadError("Official npm metadata redirected to an unexpected URL.")


# Keep one patchable request surface, with redirects refused before a follow-up request.
urlopen = build_opener(_RefuseRedirects()).open


def checkout_path(root: Path, relative: str) -> Path:
    """Resolve a portable relative path, including through existing symlinks."""
    if (not isinstance(relative, str) or not relative or "\\" in relative
            or "\x00" in relative or PurePosixPath(relative).is_absolute()
            or any(part in {".", ".."} for part in relative.split("/"))
            or not (root / relative).resolve().is_relative_to(root.resolve())):
        raise BmadError(f"Escaping or invalid BMAD path: {relative!r}")
    return root / relative


def read_object(root: Path, relative: str) -> dict:
    value = json.loads(checkout_path(root, relative).read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise BmadError(f"Expected a JSON object: {relative}")
    return value


def load_lock(root: Path) -> dict:
    lock = read_object(root, "config/bmad.lock.json")
    if lock.get("package") != "bmad-method" or not STABLE_VERSION.fullmatch(str(lock.get("version", ""))):
        raise BmadError("BMAD lock must identify an exact stable bmad-method release.")
    skills, files = lock.get("skills"), lock.get("files")
    if (not isinstance(skills, list) or not skills
            or any(not isinstance(skill, str) or not re.fullmatch(r"[a-z0-9-]+", skill) for skill in skills)
            or len(set(skills)) != len(skills)):
        raise BmadError("Invalid or duplicate skill identities in BMAD lock.")
    if not isinstance(files, dict) or not files:
        raise BmadError("BMAD lock has no file inventory.")
    for relative, digest in files.items():
        checkout_path(root, relative)
        if not isinstance(digest, str) or not re.fullmatch(r"[0-9a-f]{64}", digest):
            raise BmadError(f"Invalid BMAD checksum: {relative}")
    expected_source = f"https://registry.npmjs.org/bmad-method/-/bmad-method-{lock['version']}.tgz"
    if lock.get("source") != expected_source or not re.fullmatch(r"sha512-[A-Za-z0-9+/]{86}==", str(lock.get("integrity", ""))):
        raise BmadError("BMAD lock has invalid official npm provenance.")
    return lock


def inventory_fingerprint(lock: dict) -> str:
    inventory = {"skills": sorted(lock["skills"]), "files": lock["files"]}
    encoded = json.dumps(inventory, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def installed_version(root: Path) -> str:
    text = checkout_path(root, "_bmad/_config/manifest.yaml").read_text(encoding="utf-8")
    installation = re.search(r"^installation:\s*\n((?:[ \t].*\n|\n)*)", text, re.MULTILINE)
    versions = re.findall(r"^  version:\s*([^\s]+)\s*$", installation[1] if installation else "", re.MULTILINE)
    if len(versions) != 1 or not STABLE_VERSION.fullmatch(versions[0]):
        raise BmadError("Installed BMAD manifest does not declare one exact stable version.")
    return versions[0]


def _csv_rows(root: Path, relative: str, columns: set[str]) -> list[dict]:
    reader = csv.DictReader(io.StringIO(checkout_path(root, relative).read_text(encoding="utf-8")))
    if not columns.issubset(reader.fieldnames or []):
        raise BmadError(f"Invalid BMAD catalogue columns: {relative}")
    rows = list(reader)
    if any(None in row or any(value is None for value in row.values()) for row in rows):
        raise BmadError(f"Incomplete or malformed BMAD catalogue row: {relative}")
    return rows


def _declared_identities(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    header = re.match(r"\A---\r?\n(.*?)\r?\n---(?:\r?\n|$)", text, re.DOTALL)
    names = re.findall(r"^name:\s*([^\r\n]+)", header[1] if header else "", re.MULTILINE)
    return [name.strip().strip("\"'") for name in names]


def _skill_identity(path: Path) -> str:
    names = _declared_identities(path)
    if len(names) != 1:
        raise BmadError(f"Missing or duplicate native skill identity: {path.name}")
    return names[0]


def _resources(root: Path, native_names: set[str]) -> set[str]:
    resources = set(RESOURCE_FILES)
    for relative in [*PROVIDERS.values(), "_bmad/scripts"]:
        directory = checkout_path(root, relative)
        for path in directory.rglob("*"):
            if relative in PROVIDERS.values():
                skill_name = path.relative_to(directory).parts[0]
                if skill_name not in native_names and not skill_name.startswith("bmad-"):
                    continue
            if (path.is_file() and "__pycache__" not in path.parts
                    and path.suffix not in {".pyc", ".pyo"} and path.name != ".DS_Store"):
                resources.add(path.relative_to(root).as_posix())
    return resources


def _inspect(root: Path) -> tuple[dict, dict | None]:
    errors, skills, modules, additional = [], [], [], []
    lock, version = None, None
    try:
        version = installed_version(root)
        lock = load_lock(root)
        if version != lock["version"]:
            errors.append(f"Installed BMAD version {version} differs from lock {lock['version']}.")
        for relative, digest in lock["files"].items():
            path = checkout_path(root, relative)
            if not path.is_file():
                errors.append(f"Missing BMAD file: {relative}")
            elif hashlib.sha256(path.read_bytes()).hexdigest() != digest:
                errors.append(f"Modified official BMAD file: {relative}")
        for relative in sorted(_resources(root, set(lock["skills"])) - set(lock["files"])):
            errors.append(f"Unlocked BMAD resource: {relative}")
    except (OSError, ValueError, TypeError) as error:
        errors.append(f"Invalid BMAD distribution: {error}")

    try:
        manifests = _csv_rows(root, CATALOGUE_FILES[0], {"canonicalId", "name", "description", "module", "path"})
        help_rows = _csv_rows(root, CATALOGUE_FILES[1], {"module", "skill", "description", "phase", "action", "outputs"})
        identities, names = set(), set()
        for entry in manifests:
            identifier, name = entry["canonicalId"], entry["name"]
            if (not re.fullmatch(r"[a-z0-9-]+", identifier) or not re.fullmatch(r"[a-z0-9-]+", name)
                    or identifier in identities or name in names or not entry["description"].strip()):
                raise BmadError(f"Invalid or duplicate BMAD manifest identity: {identifier!r}")
            identities.add(identifier)
            names.add(name)
            # Upstream's path is a source locator, not necessarily a deployed file.
            checkout_path(root, entry["path"])
            paths = {}
            for provider, directory in PROVIDERS.items():
                relative = f"{directory}/{name}/SKILL.md"
                path = checkout_path(root, relative)
                if not path.is_file():
                    errors.append(f"Missing native BMAD entrypoint: {relative}")
                elif _skill_identity(path) != name:
                    errors.append(f"Mismatched native BMAD identity: {relative}")
                paths[provider] = relative
            skills.append({"id": identifier, "name": name, "description": entry["description"],
                           "module": entry["module"], "source_path": entry["path"], "paths": paths,
                           "help": [row for row in help_rows if row["skill"] == name]})
        for row in help_rows:
            if row["skill"] == "_meta":
                modules.append(row)
            elif row["skill"] not in names:
                errors.append(f"Help catalogue references an uninstalled BMAD skill: {row['skill']}")
        for provider, directory in PROVIDERS.items():
            actual = set()
            for path in checkout_path(root, directory).iterdir():
                if path.is_dir() or path.is_symlink():
                    relative = f"{directory}/{path.name}/SKILL.md"
                    entrypoint = checkout_path(root, relative)
                    if path.name in names or path.name.startswith("bmad-"):
                        actual.add(path.name)
                    else:
                        if entrypoint.is_file():
                            for declared in _declared_identities(entrypoint):
                                if declared in names or declared.casefold().startswith("bmad-"):
                                    errors.append(f"Additional skill declares a native or reserved BMAD identity: {relative}: {declared}")
                        additional.append({"provider": provider, "name": path.name, "path": relative,
                                           "entrypoint_exists": entrypoint.is_file()})
            if actual != names:
                errors.append(f"Native inventory differs from the manifest: {provider}; missing={sorted(names - actual)}, extra={sorted(actual - names)}")
        if lock is not None and set(lock["skills"]) != names:
            errors.append("Skill manifest inventory differs from the BMAD lock.")
    except (OSError, ValueError, TypeError, KeyError, csv.Error) as error:
        errors.append(f"Invalid BMAD catalogue: {error}")
    return {"ok": not errors, "installed_version": version, "skill_count": len(skills),
            "skills": skills, "additional_skills": additional, "modules": modules,
            "errors": errors, "read_only": True}, lock


def catalogue(root: Path) -> dict:
    return _inspect(root.resolve())[0]


def capability_status(root: Path, inventory: dict, lock: dict | None) -> dict:
    errors = []
    try:
        routing = read_object(root, "config/bmad-routing.json")
        if routing.get("schema_version") != 1:
            raise BmadError("Unsupported BMAD capability map schema.")
        if (lock is None or routing.get("bmad_version") != inventory["installed_version"]
                or routing.get("bmad_version") != lock["version"]
                or routing.get("inventory_sha256") != inventory_fingerprint(lock)
                or inventory["errors"]):
            errors.append("Capability analysis is stale: inspect the changed native skills, then regenerate the version-bound map.")
        capabilities = routing.get("capabilities")
        if not isinstance(capabilities, dict) or not REQUIRED_CAPABILITIES.issubset(capabilities):
            raise BmadError("Capability map does not cover all invariant workflow outcomes.")
        installed = {skill["name"] for skill in inventory["skills"]}
        for outcome, binding in capabilities.items():
            if (not isinstance(binding, dict) or not isinstance(binding.get("skill"), str)
                    or binding["skill"] not in installed or not isinstance(binding.get("purpose"), str)
                    or not binding["purpose"].strip()):
                raise BmadError(f"Invalid installed capability binding: {outcome}")
            evidence = binding.get("evidence")
            if not isinstance(evidence, list) or "SKILL.md" not in evidence:
                raise BmadError(f"Capability has no inspected native entrypoint: {outcome}")
            for directory in PROVIDERS.values():
                for relative in evidence:
                    # Check the evidence relative to the skill as well as the checkout.
                    skill_root = checkout_path(root, f"{directory}/{binding['skill']}")
                    path = checkout_path(skill_root, relative)
                    if not path.is_file() or lock is None or path.relative_to(root).as_posix() not in lock["files"]:
                        raise BmadError(f"Missing or unlocked capability evidence: {outcome}/{relative}")
        routes = routing.get("routes")
        if not isinstance(routes, dict) or not {"small_change", "epic_story", "method_question"}.issubset(routes):
            raise BmadError("Capability map needs change, epic-story and method-question routes.")
        for name, route in routes.items():
            if (not isinstance(route, dict) or not isinstance(route.get("capabilities"), list)
                    or not route["capabilities"] or not isinstance(route.get("artifact"), str)
                    or not route["artifact"].strip()
                    or any(not isinstance(key, str) or key not in capabilities for key in route["capabilities"])):
                raise BmadError(f"Invalid BMAD route: {name}")
            if name in {"small_change", "epic_story"} and not {"framing", "implementation", "review", "testing"}.issubset(route["capabilities"]):
                raise BmadError(f"BMAD route omits invariant preparation, review or testing: {name}")
            if name == "epic_story" and not {"stories", "sprint"}.issubset(route["capabilities"]):
                raise BmadError("Epic-story route omits its story or sprint capabilities.")
            if name == "method_question" and set(route["capabilities"]) != {"guidance"}:
                raise BmadError("Method-question route must provide guidance without implementation.")
    except (OSError, ValueError, TypeError, KeyError) as error:
        errors.append(f"Invalid BMAD capability map: {error}")
    return {"status": "stale" if errors else "current", "errors": errors}


def stable_status(version: str | None, *, timeout: float = 10) -> dict:
    """Query only the official npm latest tag; failures never imply currency."""
    try:
        request = Request(LATEST_URL, headers={"Accept": "application/json", "User-Agent": "BKBX-BMAD-status"})
        with urlopen(request, timeout=timeout) as response:
            if response.geturl() != LATEST_URL:
                raise BmadError("Official npm metadata redirected to an unexpected URL.")
            body = response.read(1024 * 1024 + 1)
        if len(body) > 1024 * 1024:
            raise BmadError("Official npm metadata exceeds the size limit.")
        metadata = json.loads(body)
        latest = metadata.get("version") if isinstance(metadata, dict) else None
        if metadata.get("name") != "bmad-method" or not isinstance(latest, str) or not STABLE_VERSION.fullmatch(latest):
            raise BmadError("Official npm latest response is not an exact stable bmad-method release.")
        if version is None or not STABLE_VERSION.fullmatch(version):
            raise BmadError("Installed stable version is unavailable; no comparison was made.")
        installed_numbers, latest_numbers = tuple(map(int, version.split("."))), tuple(map(int, latest.split(".")))
        comparison = "up_to_date" if installed_numbers == latest_numbers else "update_available" if installed_numbers < latest_numbers else "installed_ahead"
        return {"status": comparison, "installed_version": version, "latest_version": latest, "source": LATEST_URL}
    except (OSError, ValueError, TypeError, AttributeError, HTTPError, URLError, HTTPException) as error:
        return {"status": "unavailable", "source": LATEST_URL,
                "reason": str(error) if isinstance(error, BmadError) else type(error).__name__,
                "message": "Stable availability is unverified; nothing was installed or changed."}


def status(root: Path, *, online: bool = False) -> dict:
    root = root.resolve()
    inventory, lock = _inspect(root)
    mapping = capability_status(root, inventory, lock)
    stable = stable_status(inventory["installed_version"]) if online else {"status": "not_checked", "source": LATEST_URL}
    errors = [*inventory["errors"], *mapping["errors"]]
    return {"ok": not errors and stable["status"] != "unavailable", "installed_version": inventory["installed_version"],
            "skill_count": inventory["skill_count"], "additional_skill_count": len(inventory["additional_skills"]),
            "capability_map": mapping, "stable": stable,
            "errors": errors, "read_only": True}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("catalogue", help="Read both deployed catalogs and all declared help metadata.")
    current = commands.add_parser("status", help="Validate the installed version, integrity and capability map.")
    current.add_argument("--online", action="store_true", help="Also query npm latest in read-only mode.")
    args = parser.parse_args()
    result = catalogue(args.root) if args.command == "catalogue" else status(args.root, online=args.online)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
