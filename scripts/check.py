#!/usr/bin/env python3
"""Read-only checks for the distributed method, its configuration and BMAD."""
from __future__ import annotations

import argparse
import ast
import json
from pathlib import Path
import re
import sys
import tomllib
from urllib.parse import unquote, urlsplit

from bmad import checkout_path, read_object, status as bmad_status
from method_files import owned_files

ROOT = Path(__file__).resolve().parents[1]


def _table(parent: dict, key: str) -> dict:
    value = parent.get(key)
    if not isinstance(value, dict):
        raise ValueError(f"Expected a BMAD TOML table: {key}")
    return value


def _text(table: dict, key: str) -> str:
    value = table.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"BMAD config field must be a non-empty string: {key}")
    return value


def _config_path(root: Path, value: str, output_folder: str | None = None) -> Path:
    if output_folder is not None:
        value = value.replace("{output_folder}", output_folder)
    if value == "{project-root}":
        return root
    relative = value.removeprefix("{project-root}/")
    if "{" in relative or "}" in relative:
        raise ValueError(f"Unresolved BMAD config variable: {value}")
    return checkout_path(root, relative)


def validate(root: Path) -> dict:
    root = root.resolve()
    distribution = bmad_status(root)
    errors = list(distribution["errors"])
    try:
        central = tomllib.loads(checkout_path(root, "_bmad/config.toml").read_text(encoding="utf-8"))
        for key in ["core", "modules"]:
            if key in central:
                _table(central, key)
        if "bmm" in central.get("modules", {}):
            _table(central["modules"], "bmm")
    except (OSError, ValueError, TypeError) as error:
        errors.append(f"Invalid central BMAD config: {error}")
    try:
        config = tomllib.loads(checkout_path(root, "_bmad/custom/config.toml").read_text(encoding="utf-8"))
        core, module = _table(config, "core"), _table(_table(config, "modules"), "bmm")
        for table, keys in [(core, ["project_name", "user_name", "communication_language", "document_output_language", "output_folder"]),
                            (module, ["planning_artifacts", "implementation_artifacts", "project_knowledge"])]:
            for key in keys:
                _text(table, key)
        output = _config_path(root, core["output_folder"]).relative_to(root).as_posix()
        for key in ["planning_artifacts", "implementation_artifacts", "project_knowledge"]:
            _config_path(root, module[key], output)
    except (OSError, ValueError, KeyError, TypeError) as error:
        errors.append(f"Invalid portable BMAD config: {error}")
    try:
        capabilities = _table(read_object(root, "config/bmad-routing.json"), "capabilities")
        names = {_text(_table(capabilities, outcome), "skill")
                 for outcome in ["implementation", "review", "ad_hoc_review"]}
        required_facts = {"file:{project-root}/AGENTS.md", "file:{project-root}/docs/bmad.md"}
        for name in sorted(names):
            relative = f"_bmad/custom/{name}.toml"
            override = tomllib.loads(checkout_path(root, relative).read_text(encoding="utf-8"))
            facts = _table(override, "workflow").get("persistent_facts")
            if not isinstance(facts, list) or any(not isinstance(fact, str) for fact in facts):
                raise ValueError(f"Invalid persistent facts: {relative}")
            if missing := required_facts - set(facts):
                raise ValueError(f"Missing persistent facts in {relative}: {sorted(missing)}")
        for fact in required_facts:
            if not checkout_path(root, fact.removeprefix("file:{project-root}/")).is_file():
                raise ValueError(f"Missing persistent-fact file: {fact}")
    except (OSError, ValueError, KeyError, TypeError) as error:
        errors.append(f"Invalid BMAD persistent facts: {error}")

    try:
        first_party = owned_files(root)
    except (OSError, ValueError, TypeError) as error:
        errors.append(f"Invalid method ownership: {error}")
        first_party = []
    for relative in first_party:
        try:
            path = checkout_path(root, relative)
            text = path.read_text(encoding="utf-8")
            if path.suffix == ".json":
                json.loads(text)
            if path.suffix == ".toml":
                tomllib.loads(text)
            if path.suffix == ".py":
                ast.parse(text, filename=relative)
            if path.suffix == ".md":
                for target in re.findall(r"(?<!!)\[[^\]]+\]\(([^)]+)\)", text):
                    target = target.strip("<>")
                    if urlsplit(target).scheme or target.startswith("#") or "<" in target:
                        continue
                    destination = (path.parent / unquote(target.split("#", 1)[0])).resolve()
                    if not destination.is_relative_to(root.resolve()) or not destination.exists():
                        errors.append(f"Broken or escaping reference: {relative} -> {target}")
                if re.search(r"/(?:Users|home)/[^\s<>]+", text):
                    errors.append(f"Machine-specific absolute path: {relative}")
        except (OSError, ValueError, SyntaxError) as error:
            errors.append(f"Invalid file {relative}: {error}")
    return {"ok": not errors, "errors": errors,
            "checks": ["BMAD provenance, file integrity and both skill catalogs", "version-bound capability map", "portable config", "method-owned syntax and document references"],
            "bmad_version": distribution["installed_version"], "bmad_skill_count": distribution["skill_count"],
            "product_tests": "not_run", "linear_access": "not_checked"}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    result = validate(args.root.resolve())
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
