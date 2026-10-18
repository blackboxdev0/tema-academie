from __future__ import annotations

import hashlib
from itertools import product
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import tomllib
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from project import SetupError, doctor, initialize, merge_yaml_config, read_json, update_toml
from check import validate
from method_files import copy_method, owned_files, test_files as method_test_files
import project


def checkout(destination: Path, *, source: Path = ROOT) -> None:
    copy_method(source, destination, pristine=True)


def init_project(root: Path, **changes):
    values = dict(name='Projet "été"', brief="Un service pour organiser des ressources partagées.",
                  github="https://github.com/example/new-product", linear="https://linear.app/example/team/DEMO/all")
    values.update(changes)
    return initialize(root, **values)


def snapshot(root: Path) -> dict:
    return {str(path.relative_to(root)): hashlib.sha256(path.read_bytes()).hexdigest()
            for path in root.rglob("*") if path.is_file() and ".git" not in path.parts and "__pycache__" not in path.parts}


MANAGED_CONFIGS = {
    "_bmad/custom/config.toml": "docs/project/setup/bmad-config-before-init.toml",
    "_bmad/bmm/config.yaml": "docs/project/setup/bmad-bmm-config-before-init.yaml",
    "_bmad/core/config.yaml": "docs/project/setup/bmad-core-config-before-init.yaml",
}


class CheckoutCase(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="bkbx-test-")
        self.root = Path(self.temporary.name) / "new checkout"
        checkout(self.root)

    def tearDown(self):
        self.temporary.cleanup()

    def interrupt_before_profile(self, root=None):
        root = root or self.root
        write = project.atomic_write

        def fail_final_profile(destination, content):
            if destination == root / "config/project.json":
                raise OSError("Simulated final write interruption")
            write(destination, content)

        with patch("project.atomic_write", side_effect=fail_final_profile):
            with self.assertRaises(OSError):
                init_project(root)


class ProjectTests(CheckoutCase):
    def test_cold_checkout_has_native_skills_and_needs_no_personal_config(self):
        self.assertTrue(validate(self.root)["ok"])
        self.assertFalse((self.root / "config/project.json").exists())
        self.assertFalse((self.root / "_bmad/config.user.toml").exists())
        init_project(self.root)
        self.assertTrue(validate(self.root)["ok"])
        config = tomllib.loads((self.root / "_bmad/custom/config.toml").read_text())
        self.assertEqual(config["core"]["project_name"], 'Projet "été"')
        self.assertEqual(config["modules"]["bmm"]["project_knowledge"], "{project-root}/docs/project")
        command = [sys.executable, str(self.root / "_bmad/scripts/resolve_config.py"), "--project-root", str(self.root)]
        resolved = json.loads(subprocess.check_output(command, text=True))
        self.assertEqual(resolved["core"]["output_folder"], "_bmad-output")
        self.assertEqual(resolved["core"]["user_name"], "Responsable du projet")
        routing = read_json(self.root / "config/bmad-routing.json")
        skill = routing["capabilities"]["implementation"]["skill"]
        command = [sys.executable, str(self.root / "_bmad/scripts/render_skill.py"),
                   "--project-root", str(self.root), "--skill", str(self.root / ".agents/skills" / skill)]
        rendered = subprocess.check_output(command, text=True).strip()
        entry = Path(rendered.removeprefix("read and follow "))
        self.assertTrue(entry.is_file())
        self.assertTrue(entry.is_relative_to((self.root / "_bmad/render").resolve()))
        self.assertIn("file:{project-root}/AGENTS.md", entry.read_text())
        self.assertIn("file:{project-root}/docs/bmad.md", entry.read_text())
        self.assertIn("### CHECKPOINT 1", (entry.parent / "step-02-plan.md").read_text())
        self.assertNotIn("{workflow.", entry.read_text())

    def test_reinitialization_preserves_accumulated_context_and_permissions(self):
        init_project(self.root)
        context = self.root / "docs/project/project-context.md"
        context.write_text(context.read_text() + "\nDécision acceptée : conserver les règles existantes.\n")
        profile = read_json(self.root / "config/project.json")
        profile["permissions"]["commits"] = "on_request"
        (self.root / "config/project.json").write_text(json.dumps(profile))
        before = snapshot(self.root)
        self.assertEqual(init_project(self.root)["status"], "unchanged")
        self.assertEqual(snapshot(self.root), before)

    def test_different_project_is_rejected_without_writing(self):
        init_project(self.root)
        before = snapshot(self.root)
        with self.assertRaises(SetupError):
            init_project(self.root, github="https://github.com/example/other")
        self.assertEqual(snapshot(self.root), before)

    def test_existing_context_collision_fails_before_any_configuration_change(self):
        context = self.root / "docs/project/handoff.md"
        context.parent.mkdir(parents=True)
        context.write_text("Décision et travail existants à préserver.\n")
        before = snapshot(self.root)
        with self.assertRaises(SetupError):
            init_project(self.root)
        self.assertEqual(snapshot(self.root), before)

    def test_symlink_cannot_redirect_initialization_outside_checkout(self):
        outside = Path(self.temporary.name) / "outside"
        outside.mkdir()
        (self.root / "docs/project").symlink_to(outside, target_is_directory=True)
        with self.assertRaises(SetupError):
            init_project(self.root)
        self.assertEqual(list(outside.iterdir()), [])
        self.assertFalse((self.root / "config/project.json").exists())

    def test_prompt_text_is_data_and_cli_does_not_run_it(self):
        marker = Path(self.temporary.name) / "must-not-exist"
        brief = f"Une description contenant $(touch {marker}) et `touch {marker}`."
        command = [sys.executable, str(self.root / "scripts/project.py"), "init", "--name", "Demo",
                   "--brief", brief, "--github-url", "git@github.com:example/product.git",
                   "--linear-url", "https://linear.app/example/team/DEMO/all"]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        self.assertEqual(json.loads(result.stdout)["status"], "initialized")
        self.assertFalse(marker.exists())
        self.assertEqual(read_json(self.root / "config/project.json")["brief"], brief)

    def test_init_does_not_reconfigure_git_or_assume_linear_is_verified(self):
        subprocess.run(["git", "init", "-q", str(self.root)], check=True)
        subprocess.run(["git", "-C", str(self.root), "remote", "add", "origin", "https://github.com/example/template"], check=True)
        before = (self.root / ".git/config").read_bytes()
        init_project(self.root)
        self.assertEqual((self.root / ".git/config").read_bytes(), before)
        result = doctor(self.root)
        states = {item["name"]: item["status"] for item in result["checks"]}
        self.assertEqual(states["git_destination"], "pending")
        self.assertEqual(states["linear_mapping"], "pending")
        self.assertEqual(result["external_access"], "not_checked")
        permissions = read_json(self.root / "config/project.json")["permissions"]
        for action in ["commits", "working_branch_pushes", "draft_pull_requests"]:
            self.assertEqual(permissions[action], "within_authorized_scope")
        for action in ["development", "main_merge", "delivery"]:
            self.assertEqual(permissions[action], "explicit_go")

    def test_embedded_credentials_and_invalid_timezone_fail_without_changes(self):
        for change in [dict(github="https://secret@github.com/example/product"),
                       dict(linear="https://linear.app.attacker.invalid/example/team/DEMO/all"),
                       dict(project_timezone="Invalid/Timezone")]:
            before = snapshot(self.root)
            with self.assertRaises(SetupError):
                init_project(self.root, **change)
            self.assertEqual(snapshot(self.root), before)

    def test_corrupted_official_skill_is_detected(self):
        routing = read_json(self.root / "config/bmad-routing.json")
        skill = routing["capabilities"]["implementation"]["skill"]
        path = self.root / ".agents/skills" / skill / "SKILL.md"
        path.write_text(path.read_text() + "\nUnexpected edit\n")
        result = validate(self.root)
        self.assertFalse(result["ok"])
        self.assertTrue(any(f"{skill}/SKILL.md" in error for error in result["errors"]))

    def test_project_state_can_travel_without_the_original_checkout(self):
        init_project(self.root)
        context = self.root / "docs/project/project-context.md"
        context.write_text(context.read_text() + "\nDécision D-001 : les ressources sont réservées par créneau.\n")
        features = self.root / "docs/project/features.md"
        features.write_text(features.read_text() + "\nRéservation : DEMO-7, choix D-001, recette en attente.\n")
        moved = Path(self.temporary.name) / "another-machine"
        shutil.copytree(self.root, moved)
        shutil.rmtree(self.root)
        self.assertIn("D-001", (moved / "docs/project/project-context.md").read_text())
        self.assertIn("DEMO-7", (moved / "docs/project/features.md").read_text())
        self.assertTrue(validate(moved)["ok"])
        self.assertNotIn(str(self.root), json.dumps(read_json(moved / "config/project.json")))

    def test_existing_yaml_configuration_keeps_unmanaged_fields(self):
        path = self.root / "_bmad/bmm/config.yaml"
        path.write_text(path.read_text() + '\ndeployment_region: "region-example"\ncustom_rules:\n  enabled: true\n')
        init_project(self.root)
        self.assertIn('deployment_region: "region-example"', path.read_text())
        self.assertIn('custom_rules:\n  enabled: true', path.read_text())

    def test_commented_headers_and_multiline_toml_are_preserved_semantically(self):
        source = '[core] # Team defaults\nnote = """\nproject_name = "keep this example"\n"""\nproject_name = "Original"\n\n[extra]\nflags = [{ code = "a", active = true }]\n'
        path = self.root / "_bmad/custom/config.toml"
        path.write_text(source)
        init_project(self.root, name="Changed")
        result = tomllib.loads(path.read_text())
        self.assertEqual(result["core"]["project_name"], "Changed")
        self.assertIn('project_name = "keep this example"', result["core"]["note"])
        self.assertEqual(result["extra"], tomllib.loads(source)["extra"])
        archived = self.root / "docs/project/setup/bmad-config-before-init.toml"
        self.assertEqual(archived.read_text(), source)

    def test_complex_managed_yaml_requires_review_before_any_write(self):
        path = self.root / "_bmad/bmm/config.yaml"
        path.write_text('project_name:\n  nested: "value"\n')
        before = snapshot(self.root)
        with self.assertRaises(SetupError):
            init_project(self.root)
        self.assertEqual(snapshot(self.root), before)

    def test_indented_yaml_root_mapping_is_rejected_before_any_write(self):
        for relative in list(MANAGED_CONFIGS)[1:]:
            path = self.root / relative
            original = path.read_bytes()
            for source in ['  project_name: "Original"\n  user_name: "Human"\n',
                           '# Team defaults\n\n  "project_name": "Original"\n']:
                with self.subTest(relative=relative, source=source):
                    path.write_text(source)
                    before = snapshot(self.root)
                    with self.assertRaisesRegex(SetupError, "Indented YAML root"):
                        init_project(self.root)
                    self.assertEqual(snapshot(self.root), before)
            path.write_bytes(original)

    def test_failed_archive_does_not_replace_original_configuration(self):
        path = self.root / "_bmad/custom/config.toml"
        source = path.read_text() + "\n# Original team rationale to preserve.\n"
        path.write_text(source)
        before = snapshot(self.root)
        write = project.atomic_write

        def fail_archive(destination, content):
            if destination.name == "bmad-config-before-init.toml":
                raise OSError("Simulated archive failure")
            write(destination, content)

        with patch("project.atomic_write", side_effect=fail_archive):
            with self.assertRaises(OSError):
                init_project(self.root)
        after = snapshot(self.root)
        after.pop("docs/project/setup/bmad-init-state.json")
        self.assertEqual(after, before)
        self.assertEqual(path.read_text(), source)

    def test_interrupted_initialization_resumes_from_confirmed_source_archive(self):
        path = self.root / "_bmad/custom/config.toml"
        source = path.read_text() + "\n# Original team rationale to preserve.\n"
        path.write_text(source)
        write = project.atomic_write

        def fail_final_profile(destination, content):
            if destination == self.root / "config/project.json":
                raise OSError("Simulated final write interruption")
            write(destination, content)

        with patch("project.atomic_write", side_effect=fail_final_profile):
            with self.assertRaises(OSError):
                init_project(self.root)
        archived = self.root / "docs/project/setup/bmad-config-before-init.toml"
        self.assertEqual(archived.read_text(), source)
        self.assertFalse((self.root / "config/project.json").exists())
        self.assertEqual(init_project(self.root)["status"], "initialized")
        self.assertEqual(archived.read_text(), source)

    def test_intervening_team_config_edit_after_interruption_is_preserved(self):
        write = project.atomic_write

        def fail_final_profile(destination, content):
            if destination == self.root / "config/project.json":
                raise OSError("Simulated final write interruption")
            write(destination, content)

        with patch("project.atomic_write", side_effect=fail_final_profile):
            with self.assertRaises(OSError):
                init_project(self.root)
        path = self.root / "_bmad/custom/config.toml"
        path.write_text(path.read_text() + '\n[human]\nnote = "New decision"\n')
        before = snapshot(self.root)
        with self.assertRaises(SetupError):
            init_project(self.root)
        self.assertEqual(snapshot(self.root), before)

    def test_every_managed_configuration_is_archived_and_protected_after_interruption(self):
        originals = {relative: (self.root / relative).read_text() for relative in MANAGED_CONFIGS}
        self.interrupt_before_profile()
        for relative, archive in MANAGED_CONFIGS.items():
            with self.subTest(relative=relative):
                self.assertEqual((self.root / archive).read_text(), originals[relative])
                path = self.root / relative
                partial = path.read_text()
                path.write_text(partial + "\n# New human decision after interruption.\n")
                before = snapshot(self.root)
                with self.assertRaisesRegex(SetupError, re.escape(relative)):
                    init_project(self.root)
                self.assertEqual(snapshot(self.root), before)
                path.write_text(partial)

    def test_original_and_exact_partial_toml_yaml_combinations_resume(self):
        self.interrupt_before_profile()
        partials = {relative: (self.root / relative).read_text() for relative in MANAGED_CONFIGS}
        originals = {relative: (self.root / archive).read_text() for relative, archive in MANAGED_CONFIGS.items()}
        for choices in product([False, True], repeat=len(MANAGED_CONFIGS)):
            with self.subTest(partials=choices):
                for (relative, _), partial in zip(MANAGED_CONFIGS.items(), choices):
                    (self.root / relative).write_text(partials[relative] if partial else originals[relative])
                self.assertEqual(init_project(self.root)["status"], "initialized")
                self.assertEqual({relative: (self.root / relative).read_text() for relative in MANAGED_CONFIGS}, partials)
                self.assertEqual({relative: (self.root / archive).read_text() for relative, archive in MANAGED_CONFIGS.items()}, originals)
                (self.root / "config/project.json").unlink()

    def test_interruption_before_each_configuration_write_is_resumable(self):
        write = project.atomic_write
        for index, relative in enumerate(MANAGED_CONFIGS):
            with self.subTest(relative=relative):
                root = Path(self.temporary.name) / f"partial-{index}"
                checkout(root)

                def fail_configuration(destination, content):
                    if destination == root / relative:
                        raise OSError("Simulated configuration interruption")
                    write(destination, content)

                with patch("project.atomic_write", side_effect=fail_configuration):
                    with self.assertRaises(OSError):
                        init_project(root)
                self.assertTrue(all((root / archive).is_file() for archive in MANAGED_CONFIGS.values()))
                self.assertFalse((root / "config/project.json").exists())
                self.assertEqual(init_project(root)["status"], "initialized")
                self.assertTrue(validate(root)["ok"])

    def test_yaml_archives_must_be_written_and_confirmed_before_configuration_rewrites(self):
        write = project.atomic_write
        for index, archive in enumerate(list(MANAGED_CONFIGS.values())[1:]):
            for corrupt in [False, True]:
                with self.subTest(archive=archive, corrupt=corrupt):
                    root = Path(self.temporary.name) / f"archive-{index}-{corrupt}"
                    checkout(root)
                    originals = {relative: (root / relative).read_bytes() for relative in MANAGED_CONFIGS}

                    def fail_archive(destination, content):
                        if destination == root / archive:
                            if corrupt:
                                return write(destination, "Incomplete source archive.\n")
                            raise OSError("Simulated YAML archive failure")
                        write(destination, content)

                    with patch("project.atomic_write", side_effect=fail_archive):
                        with self.assertRaises((OSError, SetupError)):
                            init_project(root)
                    self.assertEqual({relative: (root / relative).read_bytes() for relative in MANAGED_CONFIGS}, originals)
                    self.assertFalse((root / "docs/project/project-context.md").exists())
                    self.assertFalse((root / "config/project.json").exists())

    def test_interruption_between_archives_protects_every_unarchived_source(self):
        write = project.atomic_write
        for index, failed_archive in enumerate(MANAGED_CONFIGS.values()):
            with self.subTest(failed_archive=failed_archive):
                root = Path(self.temporary.name) / f"between-archives-{index}"
                checkout(root)

                def fail_archive(destination, content):
                    if destination == root / failed_archive:
                        raise OSError("Simulated interruption between archives")
                    write(destination, content)

                with patch("project.atomic_write", side_effect=fail_archive):
                    with self.assertRaises(OSError):
                        init_project(root)
                self.assertTrue((root / "docs/project/setup/bmad-init-state.json").is_file())
                for relative, archive in MANAGED_CONFIGS.items():
                    if (root / archive).exists():
                        continue
                    path = root / relative
                    original = path.read_text()
                    path.write_text(original + "\n# Human edit while setup was interrupted.\n")
                    before = snapshot(root)
                    with self.assertRaisesRegex(SetupError, re.escape(relative)):
                        init_project(root)
                    self.assertEqual(snapshot(root), before)
                    path.write_text(original)
                self.assertEqual(init_project(root)["status"], "initialized")

    def test_edit_during_archive_write_stops_before_context_or_configuration_writes(self):
        write = project.atomic_write
        for index, relative in enumerate(MANAGED_CONFIGS):
            with self.subTest(relative=relative):
                root = Path(self.temporary.name) / f"during-archive-{index}"
                checkout(root)
                originals = {name: (root / name).read_bytes() for name in MANAGED_CONFIGS}
                human = originals[relative] + b"\n# Human edit during archive creation.\n"

                def edit_during_archive(destination, content):
                    write(destination, content)
                    if destination == root / list(MANAGED_CONFIGS.values())[-1]:
                        (root / relative).write_bytes(human)

                with patch("project.atomic_write", side_effect=edit_during_archive):
                    with self.assertRaisesRegex(SetupError, "Configuration changed during setup"):
                        init_project(root)
                self.assertEqual((root / relative).read_bytes(), human)
                self.assertEqual({name: (root / name).read_bytes() for name in MANAGED_CONFIGS if name != relative},
                                 {name: source for name, source in originals.items() if name != relative})
                for generated in ["project-context.md", "features.md", "decisions/index.md", "handoff.md"]:
                    self.assertFalse((root / "docs/project" / generated).exists())
                self.assertFalse((root / "config/project.json").exists())

    def test_edit_during_context_write_is_preserved_before_replacing_each_source(self):
        write = project.atomic_write
        for index, relative in enumerate(MANAGED_CONFIGS):
            with self.subTest(relative=relative):
                root = Path(self.temporary.name) / f"during-context-{index}"
                checkout(root)
                human = (root / relative).read_bytes() + b"\n# Human edit during context creation.\n"

                def edit_during_context(destination, content):
                    write(destination, content)
                    if destination == root / "docs/project/project-context.md":
                        (root / relative).write_bytes(human)

                with patch("project.atomic_write", side_effect=edit_during_context):
                    with self.assertRaisesRegex(SetupError, "Configuration changed during setup"):
                        init_project(root)
                self.assertEqual((root / relative).read_bytes(), human)
                self.assertFalse((root / "config/project.json").exists())

    def test_source_archive_edits_and_changed_retry_parameters_are_rejected_without_writes(self):
        self.interrupt_before_profile()
        for relative, archive in MANAGED_CONFIGS.items():
            with self.subTest(archive=archive):
                path = self.root / archive
                original = path.read_text()
                # Even an archived managed value that the merge would replace
                # must remain authentic to the confirmed source evidence.
                path.write_text(original.replace("project_name", "original_project_name", 1))
                before = snapshot(self.root)
                with self.assertRaises(SetupError):
                    init_project(self.root)
                self.assertEqual(snapshot(self.root), before)
                path.write_text(original)
        before = snapshot(self.root)
        with self.assertRaises(SetupError):
            init_project(self.root, owner="Different setup owner")
        self.assertEqual(snapshot(self.root), before)

    def test_missing_legacy_source_proofs_are_preserved_for_review(self):
        source = self.root / "_bmad/custom/config.toml"
        archive = self.root / MANAGED_CONFIGS["_bmad/custom/config.toml"]
        archive.parent.mkdir(parents=True)
        archive.write_bytes(source.read_bytes())
        before = snapshot(self.root)
        with self.assertRaisesRegex(SetupError, "source archives without an initialization journal"):
            init_project(self.root)
        self.assertEqual(snapshot(self.root), before)

    def test_complete_archives_without_journal_cannot_certify_changed_sources(self):
        self.interrupt_before_profile()
        (self.root / "docs/project/setup/bmad-init-state.json").unlink()
        archive = self.root / MANAGED_CONFIGS["_bmad/custom/config.toml"]
        archive.write_text(archive.read_text().replace('project_name = "unconfigured"', 'project_name = "Changed archived identity"'))
        before = snapshot(self.root)
        with self.assertRaisesRegex(SetupError, "source archives without an initialization journal"):
            init_project(self.root)
        self.assertEqual(snapshot(self.root), before)

    def test_configuration_archives_authenticate_exact_newline_bytes(self):
        self.interrupt_before_profile()
        for relative, archive in MANAGED_CONFIGS.items():
            for name in [relative, archive]:
                with self.subTest(changed=name):
                    path = self.root / name
                    original = path.read_bytes()
                    self.assertNotIn(b"\r\n", original)
                    path.write_bytes(original.replace(b"\n", b"\r\n"))
                    before = snapshot(self.root)
                    with self.assertRaises(SetupError):
                        init_project(self.root)
                    self.assertEqual(snapshot(self.root), before)
                    path.write_bytes(original)
        root = Path(self.temporary.name) / "crlf-sources"
        checkout(root)
        sources = {}
        for relative in MANAGED_CONFIGS:
            path = root / relative
            sources[relative] = path.read_bytes().replace(b"\n", b"\r\n")
            path.write_bytes(sources[relative])
        self.interrupt_before_profile(root)
        state = read_json(root / "docs/project/setup/bmad-init-state.json")
        for relative, archive in MANAGED_CONFIGS.items():
            self.assertEqual((root / archive).read_bytes(), sources[relative])
            self.assertEqual(state["configurations"][relative]["source_sha256"], hashlib.sha256(sources[relative]).hexdigest())
        self.assertEqual(init_project(root)["status"], "initialized")

    def test_quoted_managed_yaml_keys_keep_their_spelling_without_semantic_duplicates(self):
        for relative in list(MANAGED_CONFIGS)[1:]:
            path = self.root / relative
            original = path.read_text()
            for token in ["'project_name'", '"project_name"', '"project\\u005fname"']:
                with self.subTest(relative=relative, token=token):
                    source = original.replace("project_name:", token + " :")
                    path.write_text(source)
                    # The pure merge also proves that a second pass neither
                    # appends a plain key nor changes the supported quoted key.
                    result = merge_yaml_config(source, 'project_name: "Quoted project"\n')
                    self.assertIn(token + ' : "Quoted project"', result)
                    self.assertFalse(any(line.startswith("project_name:") for line in result.splitlines()))
                    self.assertEqual(merge_yaml_config(result, 'project_name: "Quoted project"\n'), result)
                    path.write_text(original)
        (self.root / "_bmad/bmm/config.yaml").write_text('"project_name": "Original"\ncustom_rules:\n  enabled: true\n')
        init_project(self.root)
        self.assertIn('"project_name": "Projet \\"été\\""', (self.root / "_bmad/bmm/config.yaml").read_text())

    def test_ambiguous_yaml_keys_and_semantic_duplicates_stop_before_all_writes(self):
        sources = ["project_name: old\n'project_name': duplicate\n",
                   '"project_name": old\n"project\\u005fname": duplicate\n',
                   '"\\x70roject_name": hidden\n',
                   '? "project_name"\n: hidden\n',
                   '<<: *team_defaults\n',
                   '{project_name: hidden}\n',
                   'project_name: !custom tagged\n']
        for relative in list(MANAGED_CONFIGS)[1:]:
            path = self.root / relative
            for source in sources:
                with self.subTest(relative=relative, source=source):
                    path.write_text(source)
                    before = snapshot(self.root)
                    with self.assertRaises(SetupError):
                        init_project(self.root)
                    self.assertEqual(snapshot(self.root), before)
            path.write_text((ROOT / "tests/fixtures/bmad" / relative.removeprefix("_bmad/")).read_text())


class MethodOwnershipTests(CheckoutCase):
    def test_product_routes_invalid_fixtures_dependencies_and_tests_do_not_enter_method_checks_or_copies(self):
        init_project(self.root)
        product_files = {
            "docs/project/routes.md": "[API route](/api/users)\n[External knowledge](/Users/product/notes.md)\n",
            "docs/product.md": "[Product route](/dashboard)\n",
            "tests/fixtures/product/invalid.json": "{ deliberately invalid JSON",
            "tests/test_product.py": "raise RuntimeError('Product tests need their own environment')\n",
            "scripts/product.py": "deliberately invalid Python product fixture",
            "config/product.json": "invalid product fixture",
            "node_modules/dependency/tests/test_dependency.py": "raise RuntimeError('Dependency tests must stay out')\n",
            "_bmad/custom/human.toml": "unrelated = [ incomplete human experiment",
        }
        for relative, content in product_files.items():
            path = self.root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
        before = snapshot(self.root)
        result = validate(self.root)
        self.assertTrue(result["ok"], result["errors"])
        self.assertEqual(method_test_files(self.root), ["tests/test_bmad.py", "tests/test_linear_setup.py", "tests/test_project.py"])
        copied = Path(self.temporary.name) / "method-only"
        checkout(copied, source=self.root)
        self.assertTrue(validate(copied)["ok"])
        self.assertTrue(all(not (copied / relative).exists() for relative in product_files))
        self.assertFalse((copied / "config/project.json").exists())
        self.assertFalse((copied / "docs/project").exists())
        self.assertEqual(set(snapshot(copied)), set(owned_files(self.root, native=True)))
        self.assertEqual(snapshot(self.root), before)

    def test_pristine_copies_ignore_initialized_identity_and_custom_mutable_configs(self):
        init_project(self.root)
        for relative in MANAGED_CONFIGS:
            path = self.root / relative
            path.write_text(path.read_text() + "\n# Human configuration and context.\n")
        central = self.root / "_bmad/config.toml"
        central.write_text(central.read_text().replace('project_name = "bkbx-agentic"', 'project_name = "Real product"'))
        overrides = ["_bmad/custom/bmad-build.toml", "_bmad/custom/bmad-code-review.toml"]
        product_fact = "file:{project-root}/docs/project/product-only-rules.md"
        for relative in overrides:
            (self.root / relative).write_text('[workflow]\npersistent_facts = ' + json.dumps([
                "file:{project-root}/AGENTS.md", "file:{project-root}/docs/bmad.md", product_fact]) + "\n")
        before = snapshot(self.root)
        copied = Path(self.temporary.name) / "pristine"
        checkout(copied, source=self.root)
        self.assertFalse((copied / "config/project.json").exists())
        for relative in ["_bmad/config.toml", *MANAGED_CONFIGS, *overrides]:
            fixture = copied / "tests/fixtures/bmad" / relative.removeprefix("_bmad/")
            self.assertEqual((copied / relative).read_bytes(), fixture.read_bytes())
        for relative in overrides:
            self.assertNotIn(product_fact, (copied / relative).read_text())
            self.assertIn(product_fact, (self.root / relative).read_text())
        self.assertEqual(init_project(copied, name="Independent test project")["status"], "initialized")
        self.assertEqual(snapshot(self.root), before)

    def test_method_copy_preserves_native_resolver_executable_mode(self):
        relative = "_bmad/scripts/resolve_config.py"
        source = self.root / relative
        source.chmod(0o751)
        copied = Path(self.temporary.name) / "executable-copy"
        checkout(copied, source=self.root)
        self.assertEqual((copied / relative).read_bytes(), source.read_bytes())
        self.assertEqual((copied / relative).stat().st_mode & 0o7777, 0o751)

    def test_runner_cli_loads_declared_origins_and_sibling_imports_despite_product_shadow_packages(self):
        root = Path(self.temporary.name) / "sentinel-runner"
        scripts = ["scripts/bmad.py", "scripts/method_files.py", "scripts/test_method.py"]
        for relative in scripts:
            path = root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(ROOT / relative, path)
        tests = {
            "tests/test_project.py": (
                "from pathlib import Path\nimport unittest\nTOKEN = 'declared sibling'\n"
                "class ProjectSentinel(unittest.TestCase):\n"
                "    def test_declared_origin(self):\n"
                "        self.assertEqual(Path(__file__).name, 'test_project.py')\n"
                "        (Path(__file__).parents[1] / 'project-ran').write_text(__file__)\n"),
            "tests/test_alpha.py": (
                "from pathlib import Path\nimport unittest\nfrom test_project import TOKEN\n"
                "class AlphaSentinel(unittest.TestCase):\n"
                "    def test_declared_sibling(self):\n"
                "        self.assertEqual(TOKEN, 'declared sibling')\n"
                "        (Path(__file__).parents[1] / 'alpha-ran').write_text(__file__)\n"),
        }
        for relative, content in tests.items():
            path = root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
        manifest = {"schema_version": 1, "files": ["config/method-files.json", *scripts, *tests], "fixture_overrides": {}}
        (root / "config").mkdir()
        (root / "config/method-files.json").write_text(json.dumps(manifest))
        (root / "tests/import_marker.py").write_text(
            "from pathlib import Path\n(Path(__file__).parents[1] / 'product-imported').write_text('unexpected import')\n"
            "raise AssertionError('An undeclared product module was imported')\n")
        (root / "tests/test_product.py").write_text("import import_marker\n")
        for name in ["test_alpha", "test_project"]:
            package = root / "tests" / name
            package.mkdir()
            (package / "__init__.py").write_text(
                "from pathlib import Path\n(Path(__file__).parents[2] / 'shadow-imported').write_text(__file__)\n"
                "import import_marker\n")
        result = subprocess.run([sys.executable, str(root / "scripts/test_method.py"), "-v"],
                                cwd=root, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Ran 2 tests", result.stderr)
        self.assertEqual((root / "project-ran").read_text(), str((root / "tests/test_project.py").resolve()))
        self.assertEqual((root / "alpha-ran").read_text(), str((root / "tests/test_alpha.py").resolve()))
        self.assertFalse((root / "product-imported").exists())
        self.assertFalse((root / "shadow-imported").exists())

    def test_owned_corruption_still_fails_syntax_and_reference_checks(self):
        for relative, content in {"config/project.example.json": "{ invalid",
                                  "scripts/project.py": "def invalid Python",
                                  "docs/workflow.md": "[Missing method reference](missing.md)\n",
                                  "_bmad/custom/config.toml": "[invalid"}.items():
            with self.subTest(relative=relative):
                path = self.root / relative
                original = path.read_bytes()
                path.write_text(content)
                result = validate(self.root)
                self.assertFalse(result["ok"])
                self.assertTrue(result["errors"])
                path.write_bytes(original)

    def test_missing_owned_resources_are_explicit_and_fail_copy_before_writes(self):
        for index, relative in enumerate(["docs/workflow.md", "_bmad/custom/config.toml", "tests/fixtures/bmad/core/config.yaml"]):
            with self.subTest(relative=relative):
                path = self.root / relative
                original = path.read_bytes()
                path.unlink()
                result = validate(self.root)
                self.assertFalse(result["ok"])
                self.assertTrue(any(f"Missing method-owned file: {relative}" in error for error in result["errors"]))
                destination = Path(self.temporary.name) / f"missing-{index}"
                with self.assertRaises(ValueError):
                    checkout(destination, source=self.root)
                self.assertFalse(destination.exists())
                path.write_bytes(original)

    def test_an_owned_symlink_cannot_escape_the_checkout(self):
        outside = Path(self.temporary.name) / "outside.md"
        outside.write_text("Human document outside the checkout.\n")
        path = self.root / "README.md"
        path.unlink()
        path.symlink_to(outside)
        result = validate(self.root)
        self.assertFalse(result["ok"])
        destination = Path(self.temporary.name) / "escaping-copy"
        with self.assertRaises(ValueError):
            checkout(destination, source=self.root)
        self.assertFalse(destination.exists())
        self.assertEqual(outside.read_text(), "Human document outside the checkout.\n")


if __name__ == "__main__":
    unittest.main()
