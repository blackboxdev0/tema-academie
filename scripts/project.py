#!/usr/bin/env python3
"""Small, local-only project setup. No Git mutations or product commands."""
from __future__ import annotations

import argparse
from datetime import date, datetime, time, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import tomllib
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from bmad import status as bmad_status

ROOT = Path(__file__).resolve().parents[1]


class SetupError(Exception):
    pass


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def read_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as error:
        raise SetupError(f"Cannot read valid JSON: {path.name}") from error
    if not isinstance(value, dict):
        raise SetupError(f"Expected a JSON object: {path.name}")
    return value


def read_config_source(path: Path) -> str:
    """Decode without universal-newline translation; archive hashes bind bytes."""
    return path.read_bytes().decode("utf-8")


def project_path(root: Path, relative: str) -> Path:
    path = root / relative
    if not path.resolve().is_relative_to(root.resolve()):
        raise SetupError(f"Path leaves this checkout: {relative}")
    return path


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as stream:
            stream.write(content)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def json_text(value: dict) -> str:
    return json.dumps(value, indent=2, ensure_ascii=False) + "\n"


def github_url(value: str) -> str:
    value = re.sub(r"^git@github\.com:", "https://github.com/", value.strip())
    parsed = urlsplit(value)
    parts = parsed.path.strip("/").removesuffix(".git").split("/")
    if (parsed.scheme != "https" or parsed.netloc != "github.com"
            or parsed.query or parsed.fragment or len(parts) != 2
            or any(not re.fullmatch(r"[A-Za-z0-9_.-]+", part) or part in {".", ".."} for part in parts)):
        raise SetupError("Use a GitHub repository URL without credentials, query or fragment.")
    return "https://github.com/" + "/".join(parts)


def linear_url(value: str) -> str:
    parsed = urlsplit(value.strip())
    if (parsed.scheme != "https" or parsed.netloc != "linear.app"
            or not parsed.path.strip("/")):
        raise SetupError("Use an https://linear.app/... workspace, team, project or board URL.")
    return value.strip()


def update_toml(source: str, updates: dict[str, dict[str, str]]) -> str:
    """Merge parsed TOML values, including multiline strings and quoted tables.

    Values outside the managed fields are preserved. Formatting/comments are
    not part of TOML's data model; the original source is preserved separately
    by initialization whenever this rewrite is necessary.
    """
    data = tomllib.loads(source)
    for section, fields in updates.items():
        table = data
        for component in section.split("."):
            table = table.setdefault(component, {})
            if not isinstance(table, dict):
                raise SetupError(f"Configuration section is not a table: {section}")
        table.update(fields)

    def key(value: str) -> str:
        return value if re.fullmatch(r"[A-Za-z0-9_-]+", value) else json.dumps(value, ensure_ascii=False)

    def value(item):
        if isinstance(item, str):
            return json.dumps(item, ensure_ascii=False)
        if isinstance(item, bool):
            return "true" if item else "false"
        if isinstance(item, (datetime, date, time)):
            return item.isoformat()
        if isinstance(item, (int, float)):
            return repr(item)
        if isinstance(item, list):
            return "[" + ", ".join(value(child) for child in item) + "]"
        if isinstance(item, dict):
            return "{ " + ", ".join(f"{key(name)} = {value(child)}" for name, child in item.items()) + " }"
        raise SetupError("Unsupported TOML value; configuration was not changed.")

    lines = []

    def emit(table: dict, section: tuple[str, ...] = ()):
        if section:
            lines.extend(["", "[" + ".".join(key(part) for part in section) + "]"])
        lines.extend(f"{key(name)} = {value(item)}" for name, item in table.items() if not isinstance(item, dict))
        for name, item in table.items():
            if isinstance(item, dict):
                emit(item, (*section, name))

    emit(data)
    result = "\n".join(lines).strip() + "\n"
    if tomllib.loads(result) != data:
        raise SetupError("Configuration round-trip failed; no changes were made.")
    return result


def merge_yaml_config(source: str, managed: str) -> str:
    """Merge simple top-level keys, refusing ambiguous YAML before any write.

    JSON-compatible double quotes and YAML single quotes are supported on
    keys. More complex key forms (tags, aliases, explicit keys, merge keys,
    flow documents) need a human review rather than a possible duplicate.
    """
    replacements = dict(line.split(":", 1) for line in managed.splitlines() if line and not line.startswith("#"))
    lines, seen = [], set()
    source_lines = source.splitlines()
    first = next((line for line in source_lines if line.strip() and not line.lstrip().startswith("#")), "")
    if first[:1].isspace():
        raise SetupError("Indented YAML root mappings are unsupported; review before initialization.")
    for index, line in enumerate(source_lines):
        if not line.strip() or line.lstrip().startswith("#") or line[:1].isspace():
            lines.append(line)
            continue
        match = re.fullmatch(r'''(?P<key>"(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[A-Za-z_][A-Za-z_0-9-]*)(?P<colon>[ \t]*:)[ \t]*(?P<value>.*)''', line)
        if not match:
            raise SetupError("Unsupported top-level YAML key or document form; review before initialization.")
        token = match["key"]
        try:
            key = json.loads(token) if token.startswith('"') else token[1:-1].replace("''", "'") if token.startswith("'") else token
        except ValueError as error:
            raise SetupError("Unsupported quoted YAML key; review before initialization.") from error
        if key in seen:
            raise SetupError(f"Duplicate YAML field: {key}; review before initialization.")
        seen.add(key)
        if key in replacements:
            continuation = next((later for later in source_lines[index + 1:] if later.strip() and not later.lstrip().startswith("#")), "")
            if (not match["value"].strip() or match["value"].lstrip().startswith("#")
                    or match["value"].lstrip().startswith(("|", ">", "&", "*", "!", "{", "["))
                    or continuation[:1].isspace()):
                raise SetupError(f"Complex managed YAML field: {key}; review before initialization.")
            line = token + match["colon"] + replacements[key]
        lines.append(line)
    lines.extend(key + ":" + value for key, value in replacements.items() if key not in seen)
    return "\n".join(lines).rstrip() + "\n"


def yaml_config(profile: dict) -> str:
    fields = {
        "project_name": profile["name"], "user_name": profile["owner"],
        "communication_language": profile["communication_language"],
        "document_output_language": profile["document_language"],
        "user_skill_level": "intermediate", "output_folder": "_bmad-output",
        "planning_artifacts": "{project-root}/_bmad-output/planning-artifacts",
        "implementation_artifacts": "{project-root}/_bmad-output/implementation-artifacts",
        "project_knowledge": "{project-root}/docs/project",
    }
    return "# Project config; managed by scripts/project.py init.\n" + "".join(
        f"{key}: {json.dumps(value, ensure_ascii=False)}\n" for key, value in fields.items()
    )


def initialize(root: Path, *, name: str, brief: str, github: str, linear: str,
               owner: str = "Responsable du projet", project_timezone: str = "UTC",
               communication_language: str = "Français", document_language: str = "English") -> dict:
    for key, value in {"name": name, "owner": owner, "communication_language": communication_language,
                       "document_language": document_language}.items():
        if not value.strip() or len(value) > 160 or any(ord(char) < 32 for char in value):
            raise SetupError(f"Invalid {key}: use a short, non-empty single line.")
    if not brief.strip() or len(brief) > 20000:
        raise SetupError("Provide a non-empty project description (maximum 20,000 characters).")
    try:
        ZoneInfo(project_timezone)
    except (ZoneInfoNotFoundError, ValueError) as error:
        raise SetupError("Unknown IANA timezone.") from error
    profile = {
        "schema_version": 1, "name": name.strip(), "brief": brief.strip(), "owner": owner.strip(),
        "timezone": project_timezone, "communication_language": communication_language,
        "document_language": document_language, "github_url": github_url(github),
        "linear_url": linear_url(linear),
    }
    profile_path = project_path(root, "config/project.json")
    if profile_path.exists():
        existing = read_json(profile_path)
        identity = ["name", "github_url", "linear_url"]
        if any(existing.get(key) != profile[key] for key in identity):
            raise SetupError("A different project is already initialized. Review its profile; no files were changed.")
        return {"status": "unchanged", "message": "Existing context preserved. Read the profile and handoff before resuming."}
    if not (root / "config/bmad.lock.json").is_file():
        raise SetupError("Not a complete BKBX checkout: missing BMAD lock.")
    profile.update({
        "repositories": [{"path": ".", "role": "Produit et orchestration", "url": profile["github_url"]}],
        "linear": {"team_id": None, "team_key": None, "states": {}, "verified_at": None},
        "verification": {"checks": [], "acceptance": []},
        "delivery": {"target": None, "procedure": None},
        "permissions": {"development": "explicit_go", "commits": "within_authorized_scope",
                        "working_branch_pushes": "within_authorized_scope", "draft_pull_requests": "within_authorized_scope",
                        "main_merge": "explicit_go", "delivery": "explicit_go"},
    })
    context = (
        f"# Contexte du projet — {profile['name']}\n\n"
        f"## Besoin initial\n\n{profile['brief']}\n\n"
        f"## Références\n\n- GitHub : {profile['github_url']}\n- Linear : {profile['linear_url']}\n"
        "\n## Connaissances établies\n\nLa technologie, l'architecture, les environnements et les commandes restent à examiner ou cadrer. "
        "Aucune réalisation ni validation fonctionnelle n'est encore constatée.\n\n"
        "Actualiser ici les conventions communes et les faits vérifiés avec leurs sources. "
        "Les décisions et le détail des fonctionnalités sont reliés depuis [l'index](features.md).\n"
    )
    generated = {
        "docs/project/project-context.md": context,
        "docs/project/features.md": "# Fonctionnalités du projet\n\nAucune fonctionnalité confirmée à l'initialisation.\n\n| Fonctionnalité | Linear | Artefacts BMAD | Décisions | État vérifié et suite |\n|---|---|---|---|---|\n",
        "docs/project/decisions/index.md": "# Décisions du projet\n\nAucune décision produit ou technique validée à l'initialisation. Relier les choix durables à leur feature et conserver les décisions remplacées.\n",
        "docs/project/handoff.md": "# Reprise du projet\n\n- Phase : cadrage initial.\n- Configuration locale créée ; destinations externes et workflow Linear à vérifier.\n- Autorisation de développement : en attente de validation du périmètre et GO humain.\n- Aucun candidat produit ni résultat de test annoncé.\n- Prochaine action : lire le contexte, vérifier GitHub/Linear, puis exécuter le skill BMAD de cadrage pertinent.\n",
    }
    # Refuse every collision before creating anything. Identical remnants of an
    # interrupted initialization are safe to reuse; meaningful edits are not.
    for relative, content in generated.items():
        path = project_path(root, relative)
        if path.exists() and path.read_text(encoding="utf-8") != content:
            raise SetupError(f"Existing context would be overwritten: {relative}. No files were changed.")
    updates = {
        "core": {"project_name": profile["name"], "user_name": profile["owner"],
                 "communication_language": communication_language, "document_output_language": document_language,
                 "output_folder": "_bmad-output"},
        "modules.bmm": {"project_name": profile["name"], "project_knowledge": "{project-root}/docs/project",
                        "planning_artifacts": "{project-root}/_bmad-output/planning-artifacts",
                        "implementation_artifacts": "{project-root}/_bmad-output/implementation-artifacts"},
    }
    # Preflight every managed configuration before creating an archive or
    # context file. A retry accepts only the original or its exact expected
    # partial rewrite, including YAML; intervening human edits stay untouched.
    managed = {
        "_bmad/custom/config.toml": "docs/project/setup/bmad-config-before-init.toml",
        "_bmad/bmm/config.yaml": "docs/project/setup/bmad-bmm-config-before-init.yaml",
        "_bmad/core/config.yaml": "docs/project/setup/bmad-core-config-before-init.yaml",
    }
    state_path = project_path(root, "docs/project/setup/bmad-init-state.json")
    recorded = read_json(state_path) if state_path.exists() else None

    def digest(content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    state = {"schema_version": 1, "profile_sha256": digest(json_text(profile)), "configurations": {}}
    if recorded is not None and (recorded.get("schema_version") != 1
            or recorded.get("profile_sha256") != state["profile_sha256"]
            or not isinstance(recorded.get("configurations"), dict)
            or set(recorded["configurations"]) != set(managed)):
        raise SetupError("Initialization journal differs from this setup; review before resuming.")
    backup_paths = {relative: project_path(root, backup) for relative, backup in managed.items()}
    if recorded is None and any(path.exists() for path in backup_paths.values()):
        raise SetupError("Existing source archives without an initialization journal cannot be verified; review before resuming initialization.")
    configs, archives, observed = {}, {}, {}
    for relative, backup in managed.items():
        path = project_path(root, relative)
        current = read_config_source(path) if path.exists() else ""
        backup_path = backup_paths[relative]
        original = read_config_source(backup_path) if backup_path.exists() else current
        if recorded is not None:
            entry = recorded["configurations"][relative]
            if not isinstance(entry, dict) or digest(original) != entry.get("source_sha256"):
                raise SetupError(f"Source or archive changed since setup began: {relative}; review before resuming initialization.")
        updated = update_toml(original, updates) if relative.endswith(".toml") else merge_yaml_config(original, yaml_config(profile))
        if backup_path.exists() and current not in {original, updated}:
            raise SetupError(f"Configuration changed since its archive: {relative}; review before resuming initialization.")
        state["configurations"][relative] = {"archive": backup, "source_sha256": digest(original), "expected_sha256": digest(updated)}
        configs[relative], archives[backup], observed[relative] = updated, original, current
    if recorded is not None and recorded != state:
        raise SetupError("Initialization journal or expected configuration changed; review before resuming.")
    # Commit the evidence for ALL sources together before individual archives.
    # An interruption between archives must not absorb edits to an unarchived
    # YAML source on the next attempt. The journal contains no source contents.
    if recorded is None:
        atomic_write(state_path, json_text(state))
    if read_json(state_path) != state:
        raise SetupError("Initialization journal was not confirmed; no configuration was replaced.")
    # Preserve and re-read all three source archives BEFORE any configuration
    # or context rewrite. They are evidence, not additional BMAD overrides.
    for backup, original in archives.items():
        backup_path = project_path(root, backup)
        if not backup_path.exists():
            atomic_write(backup_path, original)
        if read_config_source(backup_path) != original:
            raise SetupError(f"Configuration archive was not confirmed: {backup}; no configuration was replaced.")
    for relative, previous in observed.items():
        path = project_path(root, relative)
        current = read_config_source(path) if path.exists() else ""
        if current != previous:
            raise SetupError(f"Configuration changed during setup: {relative}; no configuration was replaced.")
    for relative, content in {**generated, **configs}.items():
        path = project_path(root, relative)
        current = read_config_source(path) if path.exists() else ""
        if relative in observed and current != observed[relative]:
            raise SetupError(f"Configuration changed during setup: {relative}; stop before replacing this source.")
        if not path.exists() or current != content:
            atomic_write(path, content)
    profile["initialized_at"] = now()
    atomic_write(profile_path, json_text(profile))
    return {"status": "initialized", "name": profile["name"], "external_setup": "pending",
            "message": "Read docs/initialisation.md; no remote, ticket, approval or deployment was changed."}


def doctor(root: Path) -> dict:
    checks = [{"name": "python", "status": "ok" if sys.version_info >= (3, 11) else "error"}]
    for program in ["git", "uv"]:
        checks.append({"name": program, "status": "ok" if shutil.which(program) else "missing"})
    bmad = bmad_status(root)
    checks.append({"name": "bmad", "status": "ok" if bmad["ok"] else "error",
                   "version": bmad["installed_version"], "skill_count": bmad["skill_count"],
                   "capability_map": bmad["capability_map"]["status"], "errors": bmad["errors"],
                   "message": "Offline inventory only; the agent checks stable availability with scripts/bmad.py status --online."})
    profile_path = root / "config/project.json"
    if not profile_path.exists():
        checks.append({"name": "project", "status": "template", "message": "Explain the product and supply GitHub/Linear URLs to initialize."})
    else:
        profile = read_json(profile_path)
        checks.append({"name": "project", "status": "ok", "name_value": profile.get("name")})
        for relative in ["docs/project/handoff.md", "docs/project/project-context.md", "docs/project/features.md"]:
            checks.append({"name": relative, "status": "ok" if (root / relative).is_file() else "error"})
        if shutil.which("git"):
            git = subprocess.run(["git", "-C", str(root), "remote", "get-url", "origin"], text=True, capture_output=True)
            try:
                matches = git.returncode == 0 and github_url(git.stdout.strip()) == profile["github_url"]
            except SetupError:
                matches = False
            checks.append({"name": "git_destination", "status": "ok" if matches else "pending",
                           "message": "Verify the destination remote before any push." if not matches else "Destination matches the profile."})
        mapping = profile.get("linear", {})
        keys = {state["key"] for state in read_json(root / "config/linear-workflow.json")["states"]}
        checks.append({"name": "linear_mapping", "status": "recorded" if mapping.get("verified_at") and keys.issubset(mapping.get("states", {})) else "pending",
                       "message": "A recorded mapping must still be refreshed through Linear; doctor makes no network request."})
        checks.append({"name": "product_verification", "status": "configured" if profile.get("verification", {}).get("checks") else "pending"})
    return {"checks": checks, "read_only": True,
            "external_access": "not_checked", "ok": all(item["status"] not in {"error", "missing"} for item in checks)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    commands = parser.add_subparsers(dest="command", required=True)
    init = commands.add_parser("init")
    init.add_argument("--name", required=True)
    init.add_argument("--brief", required=True)
    init.add_argument("--github-url", required=True)
    init.add_argument("--linear-url", required=True)
    init.add_argument("--owner", default="Responsable du projet")
    init.add_argument("--timezone", default="UTC")
    init.add_argument("--communication-language", default="Français")
    init.add_argument("--document-language", default="English")
    commands.add_parser("doctor")
    args = parser.parse_args()
    root = args.root.resolve()
    try:
        if args.command == "init":
            result = initialize(root, name=args.name, brief=args.brief, github=args.github_url,
                                linear=args.linear_url, owner=args.owner, project_timezone=args.timezone,
                                communication_language=args.communication_language, document_language=args.document_language)
        else:
            result = doctor(root)
        print(json_text(result), end="")
        return 0 if result.get("ok", True) else 1
    except (SetupError, OSError, tomllib.TOMLDecodeError) as error:
        print(json_text({"error": str(error)}), file=sys.stderr, end="")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
