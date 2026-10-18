from __future__ import annotations

import csv
from email.message import Message
import hashlib
from http.client import HTTPException, IncompleteRead
import io
import json
from pathlib import Path
import re
import subprocess
import sys
import unittest
from unittest.mock import patch
from urllib.error import URLError
from urllib.response import addinfourl

from test_project import CheckoutCase, snapshot
import bmad
from bmad import LATEST_URL, PROVIDERS, catalogue, stable_status, status
from check import validate


class Response(io.BytesIO):
    def __init__(self, metadata=None, *, body=None, url=LATEST_URL):
        super().__init__(body if body is not None else json.dumps(metadata).encode())
        self.url = url

    def geturl(self):
        return self.url


class CatalogueTests(CheckoutCase):
    def read(self, relative):
        return json.loads((self.root / relative).read_text())

    def write(self, relative, value):
        (self.root / relative).write_text(json.dumps(value) + "\n")

    def binding(self):
        return self.read("config/bmad-routing.json")["capabilities"]["implementation"]["skill"]

    def edit_csv(self, relative, edit):
        path = self.root / relative
        reader = csv.DictReader(io.StringIO(path.read_text()))
        rows, columns = list(reader), reader.fieldnames
        edit(rows)
        with path.open("w", newline="") as stream:
            writer = csv.DictWriter(stream, fieldnames=columns)
            writer.writeheader()
            writer.writerows(rows)

    def config_fields(self, source, **values):
        for key, value in values.items():
            source, count = re.subn(rf"^{key}\s*=.*$", f"{key} = {json.dumps(value)}", source,
                                    count=1, flags=re.MULTILINE)
            self.assertEqual(count, 1, f"Configuration fixture has no field: {key}")
        return source

    def test_full_catalogue_uses_real_paths_and_retains_declared_metadata(self):
        before = snapshot(self.root)
        result = catalogue(self.root)
        self.assertTrue(result["ok"], result["errors"])
        locked = self.read("config/bmad.lock.json")
        self.assertEqual({entry["name"] for entry in result["skills"]}, set(locked["skills"]))
        self.assertEqual(result["skill_count"], len(locked["skills"]))
        with (self.root / "_bmad/_config/bmad-help.csv").open(newline="") as stream:
            declared_help = list(csv.DictReader(stream))
        for entry in result["skills"]:
            self.assertTrue(entry["description"])
            self.assertEqual(set(entry["paths"]), set(PROVIDERS))
            for relative in entry["paths"].values():
                self.assertTrue((self.root / relative).is_file())
            self.assertEqual(entry["help"], [row for row in declared_help if row["skill"] == entry["name"]])
            for row in entry["help"]:
                self.assertTrue({"phase", "action", "args", "outputs", "output-location", "required"}.issubset(row))
        implementation = next(entry for entry in result["skills"] if entry["name"] == self.binding())
        self.assertFalse((self.root / implementation["source_path"]).exists())
        self.assertEqual(result["modules"], [row for row in declared_help if row["skill"] == "_meta"])
        self.assertTrue(any(len({row["action"] for row in entry["help"]}) > 1 for entry in result["skills"]))
        self.assertEqual(snapshot(self.root), before)

    def test_central_configuration_is_required_and_must_be_valid_toml(self):
        path = self.root / "_bmad/config.toml"
        original = path.read_text()
        for source in [None, "[invalid"]:
            with self.subTest(source=source):
                if source is None:
                    path.unlink()
                else:
                    path.write_text(source)
                before = snapshot(self.root)
                result = validate(self.root)
                self.assertFalse(result["ok"])
                self.assertTrue(any("Invalid central BMAD config" in error for error in result["errors"]))
                self.assertEqual(snapshot(self.root), before)
                path.write_text(original)

    def test_mapped_workflows_require_their_portable_persistent_facts(self):
        capabilities = self.read("config/bmad-routing.json")["capabilities"]
        names = {capabilities[outcome]["skill"] for outcome in ["implementation", "ad_hoc_review"]}
        for name in names:
            path = self.root / "_bmad/custom" / f"{name}.toml"
            original = path.read_text()
            for source in [None, '[workflow]\npersistent_facts = []\n',
                           '[workflow]\npersistent_facts = ["file:{project-root}/AGENTS.md"]\n']:
                with self.subTest(skill=name, source=source):
                    if source is None:
                        path.unlink()
                    else:
                        path.write_text(source)
                    result = validate(self.root)
                    self.assertFalse(result["ok"])
                    self.assertTrue(any("Invalid BMAD persistent facts" in error for error in result["errors"]))
                    path.write_text(original)

    def test_scalar_config_tables_and_integer_paths_return_structured_diagnostics(self):
        portable = self.root / "_bmad/custom/config.toml"
        central = self.root / "_bmad/config.toml"
        override = self.root / "_bmad/custom" / f"{self.binding()}.toml"
        original = portable.read_text()
        cases = [(portable, "core = 1\n"),
                 (portable, "modules = 1\n" + original.split("[modules.bmm]", 1)[0]),
                 (portable, original.replace("[modules.bmm]", "[modules]\nbmm = 1\n[unused]")),
                 (portable, self.config_fields(original, output_folder=3)),
                 (portable, self.config_fields(original, planning_artifacts=3)),
                 (central, "core = 1\n"),
                 (override, "workflow = 1\n"),
                 (override, "[workflow]\npersistent_facts = 1\n")]
        for path, source in cases:
            with self.subTest(path=path.relative_to(self.root), source=source):
                saved = path.read_text()
                path.write_text(source)
                result = validate(self.root)
                self.assertFalse(result["ok"])
                self.assertTrue(result["errors"])
                self.assertTrue(all(isinstance(error, str) for error in result["errors"]))
                path.write_text(saved)

    def test_output_variables_resolve_before_containment_and_unknown_variables_fail(self):
        path = self.root / "_bmad/custom/config.toml"
        original = path.read_text()
        for fields in [dict(output_folder="{undefined_artifacts}"),
                       dict(planning_artifacts="{project-root}/{undefined_artifacts}/planning"),
                       dict(implementation_artifacts="{output_folder}/../../outside")]:
            with self.subTest(fields=fields):
                path.write_text(self.config_fields(original, **fields))
                result = validate(self.root)
                self.assertFalse(result["ok"])
                self.assertTrue(any("Invalid portable BMAD config" in error for error in result["errors"]))
        path.write_text(self.config_fields(original,
            output_folder="{project-root}/portable-output",
            planning_artifacts="{project-root}/{output_folder}/planning-artifacts",
            implementation_artifacts="{output_folder}/implementation-artifacts"))
        result = validate(self.root)
        self.assertTrue(result["ok"], result["errors"])

    def test_missing_entrypoint_is_reported_in_either_provider(self):
        for provider, directory in PROVIDERS.items():
            with self.subTest(provider=provider):
                path = self.root / directory / self.binding() / "SKILL.md"
                original = path.read_bytes()
                path.unlink()
                try:
                    result = status(self.root)
                    self.assertFalse(result["ok"])
                    self.assertEqual(result["capability_map"]["status"], "stale")
                    self.assertTrue(any("Missing native BMAD entrypoint" in error for error in result["errors"]))
                finally:
                    path.write_bytes(original)

    def test_mismatched_native_skill_identity_is_reported(self):
        path = self.root / ".agents/skills" / self.binding() / "SKILL.md"
        path.write_text(path.read_text().replace(f"name: {self.binding()}", "name: another-native-skill", 1))
        result = catalogue(self.root)
        self.assertFalse(result["ok"])
        self.assertTrue(any("Mismatched native BMAD identity" in error for error in result["errors"]))

    def test_human_skills_coexist_outside_the_official_lock_and_capability_map(self):
        extra = self.root / ".claude/skills/human-skill/SKILL.md"
        extra.parent.mkdir()
        extra.write_text("Human content to preserve.\n")
        before = snapshot(self.root)
        result = catalogue(self.root)
        self.assertTrue(result["ok"], result["errors"])
        self.assertEqual(result["additional_skills"], [{"provider":"claude-code", "name":"human-skill",
                                                     "path":".claude/skills/human-skill/SKILL.md", "entrypoint_exists":True}])
        self.assertTrue(status(self.root)["ok"])
        self.assertEqual(status(self.root)["capability_map"]["status"], "current")
        self.assertFalse(any("human-skill" in relative for relative in self.read("config/bmad.lock.json")["files"]))
        self.assertEqual(snapshot(self.root), before)

    def test_unknown_bmad_identity_still_fails_and_is_preserved(self):
        extra = self.root / ".claude/skills/bmad-unknown/SKILL.md"
        extra.parent.mkdir()
        extra.write_text("Unknown upstream-looking skill.\n")
        result = catalogue(self.root)
        self.assertFalse(result["ok"])
        self.assertTrue(any("extra=['bmad-unknown']" in error for error in result["errors"]))
        self.assertEqual(extra.read_text(), "Unknown upstream-looking skill.\n")

    def test_additional_folder_cannot_declare_a_native_or_reserved_identity(self):
        path = self.root / ".agents/skills/human-tool/SKILL.md"
        path.parent.mkdir()
        for identity in [self.binding(), "bmad-reserved"]:
            with self.subTest(identity=identity):
                content = f"---\nname: {identity}\n---\nHuman file to preserve.\n"
                path.write_text(content)
                before = snapshot(self.root)
                result = status(self.root)
                self.assertFalse(result["ok"])
                self.assertEqual(result["capability_map"]["status"], "stale")
                self.assertTrue(any("native or reserved BMAD identity" in error for error in result["errors"]))
                self.assertEqual(snapshot(self.root), before)
        path.write_text("---\nname: human-tool\n---\nUnrelated human skill.\n")
        self.assertTrue(status(self.root)["ok"])

    def test_symlink_escape_is_rejected_without_reading_or_changing_external_content(self):
        outside = Path(self.temporary.name) / "outside.md"
        outside.write_text("External human source.\n")
        path = self.root / ".agents/skills" / self.binding() / "SKILL.md"
        path.unlink()
        path.symlink_to(outside)
        result = status(self.root)
        self.assertFalse(result["ok"])
        self.assertTrue(any("Escaping or invalid BMAD path" in error for error in result["errors"]))
        self.assertEqual(outside.read_text(), "External human source.\n")

    def test_manifest_source_path_escape_is_reported(self):
        self.edit_csv("_bmad/_config/skill-manifest.csv", lambda rows: rows[0].update(path="../outside/SKILL.md"))
        result = catalogue(self.root)
        self.assertFalse(result["ok"])
        self.assertTrue(any("Escaping or invalid BMAD path" in error for error in result["errors"]))

    def test_help_cannot_claim_an_uninstalled_skill(self):
        self.edit_csv("_bmad/_config/bmad-help.csv", lambda rows: rows[1].update(skill="not-installed"))
        result = catalogue(self.root)
        self.assertFalse(result["ok"])
        self.assertTrue(any("Help catalogue references an uninstalled" in error for error in result["errors"]))

    def test_incomplete_catalogue_rows_and_duplicate_manifest_identities_fail(self):
        relative = "_bmad/_config/skill-manifest.csv"
        path = self.root / relative
        original = path.read_text()
        self.edit_csv(relative, lambda rows: rows.append(dict(rows[0])))
        self.assertTrue(any("duplicate BMAD manifest" in error for error in catalogue(self.root)["errors"]))
        path.write_text(original + "incomplete,row\n")
        self.assertTrue(any("Incomplete or malformed" in error for error in catalogue(self.root)["errors"]))

    def test_missing_or_invalid_lock_is_explicit_and_never_current(self):
        path = self.root / "config/bmad.lock.json"
        original = path.read_text()
        for value in [None, "[]", '{"package":"other"}']:
            with self.subTest(value=value):
                if value is None:
                    path.unlink()
                else:
                    path.write_text(value)
                result = status(self.root)
                self.assertFalse(result["ok"])
                self.assertEqual(result["capability_map"]["status"], "stale")
                path.write_text(original)

    def test_locked_path_escape_and_invalid_provenance_fail(self):
        relative = "config/bmad.lock.json"
        original = self.read(relative)
        for field, value in [("source", "https://example.invalid/package.tgz"), ("integrity", "sha512-invalid")]:
            with self.subTest(field=field):
                self.write(relative, {**original, field: value})
                self.assertFalse(status(self.root)["ok"])
        changed = {**original, "files": {**original["files"], "../outside.md": "0" * 64}}
        self.write(relative, changed)
        self.assertTrue(any("Escaping or invalid BMAD path" in error for error in status(self.root)["errors"]))

    def test_installed_version_drift_invalidates_previous_analysis(self):
        path = self.root / "_bmad/_config/manifest.yaml"
        version = self.read("config/bmad.lock.json")["version"]
        path.write_text(path.read_text().replace(f"version: {version}", "version: 99.0.0", 1))
        result = status(self.root)
        self.assertEqual(result["installed_version"], "99.0.0")
        self.assertFalse(result["ok"])
        self.assertEqual(result["capability_map"]["status"], "stale")

    def test_relocked_changed_resource_still_requires_new_capability_analysis(self):
        path = self.root / ".agents/skills" / self.binding() / "workflow.md"
        path.write_text(path.read_text() + "\nChanged installed inventory.\n")
        lock = self.read("config/bmad.lock.json")
        lock["files"][path.relative_to(self.root).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
        self.write("config/bmad.lock.json", lock)
        self.assertTrue(catalogue(self.root)["ok"])
        result = status(self.root)
        self.assertFalse(result["ok"])
        self.assertEqual(result["capability_map"]["status"], "stale")
        self.assertTrue(any("Capability analysis is stale" in error for error in validate(self.root)["errors"]))

    def test_map_requires_real_bindings_outcomes_and_safe_locked_evidence(self):
        relative = "config/bmad-routing.json"
        original = (self.root / relative).read_text()
        changes = [lambda data: data["capabilities"].pop("review"),
                   lambda data: data["capabilities"]["implementation"].update(skill="not-installed"),
                   lambda data: data["capabilities"]["implementation"].update(evidence=["SKILL.md", "../SKILL.md"]),
                   lambda data: data["capabilities"]["implementation"].update(evidence=["SKILL.md", "missing.md"]),
                   lambda data: data["routes"]["small_change"].update(capabilities=["unknown"]),
                   lambda data: data["routes"]["small_change"].update(capabilities=["framing", "implementation"])]
        for change in changes:
            with self.subTest(change=change):
                data = json.loads(original)
                change(data)
                self.write(relative, data)
                self.assertEqual(status(self.root)["capability_map"]["status"], "stale")
        (self.root / relative).unlink()
        self.assertFalse(status(self.root)["ok"])

    def test_epic_and_method_question_routes_preserve_their_existing_contracts(self):
        relative = "config/bmad-routing.json"
        original = self.read(relative)
        changes = [lambda data: data["routes"]["epic_story"]["capabilities"].remove("stories"),
                   lambda data: data["routes"]["epic_story"]["capabilities"].remove("sprint"),
                   lambda data: data["routes"].pop("method_question"),
                   lambda data: data["routes"]["method_question"]["capabilities"].append("implementation")]
        for change in changes:
            with self.subTest(change=change):
                data = json.loads(json.dumps(original))
                change(data)
                self.write(relative, data)
                before = snapshot(self.root)
                result = status(self.root)
                self.assertFalse(result["ok"])
                self.assertEqual(result["capability_map"]["status"], "stale")
                self.assertEqual(snapshot(self.root), before)
        self.write(relative, original)
        self.assertTrue(status(self.root)["ok"])

    def test_status_is_offline_by_default_and_online_check_is_read_only(self):
        before = snapshot(self.root)
        with patch("bmad.urlopen") as request:
            result = status(self.root)
            request.assert_not_called()
        self.assertTrue(result["ok"], result["errors"])
        self.assertEqual(result["stable"]["status"], "not_checked")
        with patch("bmad.urlopen", return_value=Response({"name":"bmad-method", "version":result["installed_version"]})) as request:
            online = status(self.root, online=True)
            request.assert_called_once()
            self.assertEqual(request.call_args.args[0].full_url, LATEST_URL)
        self.assertTrue(online["ok"])
        self.assertEqual(online["stable"]["status"], "up_to_date")
        self.assertEqual(snapshot(self.root), before)

    def test_cli_exposes_catalogue_and_offline_status_as_json(self):
        for command in ["catalogue", "status"]:
            result = subprocess.run([sys.executable, str(self.root / "scripts/bmad.py"), "--root", str(self.root), command],
                                    capture_output=True, text=True, check=True)
            self.assertTrue(json.loads(result.stdout)["ok"])

    def test_online_failure_reaches_status_and_main_with_nonzero_exit(self):
        with patch("bmad.urlopen", side_effect=URLError("offline")):
            result = status(self.root, online=True)
        self.assertEqual(result["stable"]["status"], "unavailable")
        self.assertFalse(result["ok"])
        with patch("bmad.urlopen", side_effect=URLError("offline")), \
                patch("sys.argv", ["bmad.py", "--root", str(self.root), "status", "--online"]), \
                patch("sys.stdout", new_callable=io.StringIO) as output:
            return_code = bmad.main()
        reported = json.loads(output.getvalue())
        self.assertEqual(reported["stable"]["status"], "unavailable")
        self.assertFalse(reported["ok"])
        self.assertNotEqual(return_code, 0)


class StableTests(unittest.TestCase):
    def test_exact_stable_versions_compare_numerically(self):
        for installed, latest, expected in [("6.12.4", "6.12.4", "up_to_date"),
                                            ("6.9.0", "6.10.0", "update_available"),
                                            ("6.12.4", "6.12.3", "installed_ahead")]:
            with self.subTest(installed=installed, latest=latest):
                with patch("bmad.urlopen", return_value=Response({"name":"bmad-method", "version":latest})):
                    result = stable_status(installed)
                self.assertEqual(result["status"], expected)
                self.assertEqual(result["latest_version"], latest)

    def test_offline_timeout_prerelease_and_malformed_metadata_never_claim_currency(self):
        for error in [URLError("offline"), TimeoutError("timeout")]:
            with self.subTest(error=error):
                with patch("bmad.urlopen", side_effect=error):
                    self.assertEqual(stable_status("6.12.4")["status"], "unavailable")
        for metadata in [{"name":"bmad-method", "version":"7.0.0-beta.1"}, {"name":"other", "version":"6.12.4"},
                         {"name":"bmad-method", "version":None}, [], {}]:
            with self.subTest(metadata=metadata):
                with patch("bmad.urlopen", return_value=Response(metadata)):
                    self.assertEqual(stable_status("6.12.4")["status"], "unavailable")
        with patch("bmad.urlopen", return_value=Response(body=b"invalid json")):
            self.assertEqual(stable_status("6.12.4")["status"], "unavailable")

    def test_oversize_redirect_and_missing_installed_version_are_unverified(self):
        responses = [Response(body=b" " * (1024 * 1024 + 1)),
                     Response({"name":"bmad-method", "version":"6.12.4"}, url="https://example.invalid/latest")]
        for response in responses:
            with patch("bmad.urlopen", return_value=response):
                self.assertEqual(stable_status("6.12.4")["status"], "unavailable")
        with patch("bmad.urlopen", return_value=Response({"name":"bmad-method", "version":"6.12.4"})):
            self.assertEqual(stable_status(None)["status"], "unavailable")

    def test_http_parsing_and_interrupted_body_are_unavailable(self):
        with patch("bmad.urlopen", side_effect=HTTPException("bad response")):
            result = stable_status("6.12.4")
        self.assertEqual(result["status"], "unavailable")
        response = Response({"name":"bmad-method", "version":"6.12.4"})
        with patch("bmad.urlopen", return_value=response), \
                patch.object(response, "read", side_effect=IncompleteRead(b'{"name":', 40)):
            result = stable_status("6.12.4")
        self.assertEqual(result["status"], "unavailable")
        self.assertEqual(result["reason"], "IncompleteRead")

    def test_redirect_target_is_never_contacted(self):
        contacted = []
        target = "https://example.invalid/unexpected"

        def https_response(request):
            contacted.append(request.full_url)
            headers = Message()
            if request.full_url == LATEST_URL:
                headers["Location"] = target
                response = addinfourl(io.BytesIO(b""), headers, request.full_url, 302)
                response.msg = "Found"
            else:
                body = json.dumps({"name":"bmad-method", "version":"6.12.4"}).encode()
                response = addinfourl(io.BytesIO(body), headers, request.full_url, 200)
                response.msg = "OK"
            return response

        with patch("urllib.request.HTTPSHandler.https_open", side_effect=https_response):
            result = stable_status("6.12.4")
        self.assertEqual(result["status"], "unavailable")
        self.assertEqual(contacted, [LATEST_URL])


if __name__ == "__main__":
    unittest.main()
