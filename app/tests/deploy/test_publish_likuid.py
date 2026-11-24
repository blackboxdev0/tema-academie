import contextlib
import os
import runpy
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

publisher = runpy.run_path(str(Path(__file__).resolve().parents[2] / "scripts/publish-likuid.py"))
publish = publisher["publish"]
PublishError = publisher["PublishError"]
CurlTransfer = publisher["CurlTransfer"]

COMMIT = "a" * 40
RUN_ID = "907"
ATTEMPT = "1"
RELEASE = f"_releases/{COMMIT}-{RUN_ID}-{ATTEMPT}"
BACKUP = f"{RELEASE}/previous-index.html"
STAGED = f"_likuid-index-{COMMIT}-{RUN_ID}-{ATTEMPT}.tmp"
ROLLBACK = f"_likuid-rollback-{COMMIT}-{RUN_ID}-{ATTEMPT}.tmp"
INDEX = b'<link href="styles.css"><script src="config.js"></script><script src="app.js"></script><img src="assets/logo-tema.png"><a href="#main">Catalogue</a>\n'
PREVIOUS = b'<link href="/_releases/previous/styles.css">\n'
PREVIOUS_CSS = b".old { color: black; }\n"
UNRELATED = {".htaccess": b"DirectoryIndex index.html\n", "unrelated.txt": b"keep"}


class FakeTransfer:
    def __init__(self, previous=None):
        self.files = UNRELATED.copy()
        self.events = []
        self.fail_upload = None
        self.bad_https = None
        self.bad_https_probes = {"candidate", "after"}
        self.bad_mime = None
        self.lose_activation_reply = False
        self.lose_recovery_reply = False
        self.replace_before_recovering = False
        if previous is not None:
            self.files["index.html"] = previous
            self.files["_releases/previous/styles.css"] = PREVIOUS_CSS

    def put(self, name, contents):
        self.events.append(("put", name))
        if name == self.fail_upload:
            self.files[name] = contents[:1]
            raise PublishError("transfer interrupted")
        self.files[name] = contents

    def read(self, name):
        return self.files[name]

    def read_index(self):
        return self.files.get("index.html")

    def rename(self, source, destination):
        self.events.append(("rename", source, destination))
        self.files[destination] = self.files.pop(source)
        if (source == ROLLBACK and self.lose_recovery_reply) or (source == STAGED and self.lose_activation_reply):
            raise PublishError("lost reply after rename")

    def delete(self, name):
        self.events.append(("delete", name))
        del self.files[name]

    def public(self, name, probe):
        self.events.append(("https", name, probe))
        status = 403 if not name else 404
        if name == self.bad_https and probe in self.bad_https_probes:
            if self.replace_before_recovering:
                self.files["index.html"] = b"A different index"
            return 200, "text/html", b"Unexpected bytes"
        path = name or "index.html"
        content_type = {
            ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
        }.get(Path(path).suffix, "application/octet-stream")
        if path not in self.files:
            return status, content_type, b"Missing"
        if name == self.bad_mime:
            content_type = "text/plain"
        return 200, content_type, self.files[path]


class CurlTransferTests(unittest.TestCase):
    def test_ftp_curl_requires_certificate_verified_tls_for_control_and_data(self):
        transfer = CurlTransfer("fake-netrc", "test-release")
        with patch.object(subprocess, "run") as run:
            transfer.ftp("index.html")
        args = run.call_args.args[0]
        self.assertIn("--ssl-reqd", args)
        self.assertIn("--tlsv1.2", args)
        self.assertEqual(args[args.index("--proto") + 1], "=ftp")
        self.assertEqual(args[args.index("--netrc-file") + 1], "fake-netrc")
        self.assertEqual(args[-1], "ftp://cpamg12.likuid.com:21/index.html")
        self.assertTrue({"--insecure", "-k", "--ssl", "--ftp-ssl-control", "--ftp-ssl-ccc"}.isdisjoint(args))

    def index_read_with_listing(self, listing):
        transfer = CurlTransfer("fake-netrc", "test-release")
        transfer.ftp = Mock(side_effect=[
            subprocess.CompletedProcess([], 78, b""),
            subprocess.CompletedProcess([], 0, listing),
        ])
        return transfer

    def test_missing_retr_and_valid_mlsd_confirm_first_publication(self):
        transfer = self.index_read_with_listing(b"type=dir; .well-known\r\n")
        self.assertIsNone(transfer.read_index())
        transfer.ftp.assert_called_with("", ["--request", "MLSD"])

    def test_mlsd_cannot_confirm_absence_when_index_exists_or_response_is_malformed(self):
        for listing in (b"type=file;size=42; index.html\r\n", b"unrecognized directory listing"):
            with self.subTest(listing=listing), self.assertRaises(PublishError):
                self.index_read_with_listing(listing).read_index()


class MainRevisionTests(unittest.TestCase):
    def test_remote_head_is_read_even_when_local_main_and_tracking_ref_are_stale(self):
        def git(directory, *args):
            return subprocess.run(
                ["git", *args], cwd=directory, capture_output=True, check=True, text=True,
            ).stdout.strip()

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            primary = root / "primary"
            remote = root / "origin.git"
            stale = root / "stale"
            git(root, "init", "--initial-branch=main", str(primary))
            identity = ("-c", "user.name=Test", "-c", "user.email=git@example.invalid")
            git(primary, *identity, "commit", "--allow-empty", "-m", "first")
            git(root, "clone", "--bare", str(primary), str(remote))
            git(root, "clone", str(remote), str(stale))
            old = git(stale, "rev-parse", "main")
            git(primary, *identity, "commit", "--allow-empty", "-m", "second")
            git(primary, "push", str(remote), "main")
            latest = git(primary, "rev-parse", "main")
            self.assertNotEqual(old, latest)
            self.assertEqual(git(stale, "rev-parse", "origin/main"), old)
            with contextlib.chdir(stale):
                self.assertEqual(publisher["remote_main_sha"](), latest)

    def test_stale_publisher_main_returns_nonzero(self):
        env = {
            "GITHUB_REF": "refs/heads/main", "GITHUB_SHA": COMMIT,
            "GITHUB_RUN_ID": RUN_ID, "GITHUB_RUN_ATTEMPT": ATTEMPT,
            "LIKUID_FTP_USERNAME": "offline-user", "LIKUID_FTP_PASSWORD": "offline-password",
        }
        main = publisher["main"]
        with patch.dict(os.environ, env), patch.dict(main.__globals__, {"publish": Mock(return_value=False)}):
            self.assertEqual(main("unused-build"), 1)


class PublishTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.web = Path(directory.name)
        self.assets = {
            "index.html": INDEX, "config.js": b"config", "app.js": b"script",
            "styles.css": b"url(assets/font.woff2)", "assets/logo-tema.png": b"logo",
            "assets/font.woff2": b"font",
        }
        for name, contents in self.assets.items():
            path = self.web / name
            path.parent.mkdir(exist_ok=True)
            path.write_bytes(contents)

    def publish(self, transfer, revisions=(COMMIT, COMMIT, COMMIT)):
        heads = iter(revisions)
        return publish(transfer, self.web, COMMIT, RUN_ID, ATTEMPT, lambda: next(heads))

    def assert_unrelated_preserved(self, transfer):
        for name, contents in UNRELATED.items():
            self.assertEqual(transfer.files[name], contents)

    def test_first_publication_versions_index_and_checks_every_resource_before_rename(self):
        transfer = FakeTransfer()
        self.assertTrue(self.publish(transfer))
        live = transfer.files["index.html"]
        self.assertEqual(live, transfer.files[f"{RELEASE}/index.html"])
        names = ("config.js", "app.js", "styles.css", "assets/logo-tema.png")
        for name in names:
            self.assertIn(f'="/{RELEASE}/{name}"'.encode(), live)
        self.assertIn(b'href="#main"', live)
        for name, contents in self.assets.items():
            if name != "index.html":
                self.assertEqual(transfer.files[f"{RELEASE}/{name}"], contents)
        rename_index = next(index for index, event in enumerate(transfer.events) if event[0] == "rename")
        before = transfer.events[:rename_index]
        self.assertIn(("https", "", "before"), before)
        for name in self.assets:
            self.assertIn(("https", f"{RELEASE}/{name}", "candidate"), before)
        self.assertIn(("https", "", "after"), transfer.events[rename_index:])
        self.assertIn(("https", "index.html", "after"), transfer.events[rename_index:])
        self.assert_unrelated_preserved(transfer)

    def test_update_preserves_the_old_index_copy_and_resources(self):
        transfer = FakeTransfer(PREVIOUS)
        self.assertTrue(self.publish(transfer))
        self.assertEqual(transfer.files[BACKUP], PREVIOUS)
        self.assertEqual(transfer.files["_releases/previous/styles.css"], PREVIOUS_CSS)
        self.assertNotEqual(transfer.read_index(), PREVIOUS)
        self.assert_unrelated_preserved(transfer)

    def test_partial_transfer_leaves_the_active_index_intact(self):
        transfer = FakeTransfer(PREVIOUS)
        transfer.fail_upload = f"{RELEASE}/styles.css"
        with self.assertRaisesRegex(PublishError, "transfer interrupted"):
            self.publish(transfer)
        self.assertEqual(transfer.read_index(), PREVIOUS)
        self.assertFalse(any(event[0] in {"rename", "delete"} for event in transfer.events))
        self.assert_unrelated_preserved(transfer)

    def test_failed_public_asset_check_stops_activation(self):
        transfer = FakeTransfer(PREVIOUS)
        transfer.bad_https = f"{RELEASE}/app.js"
        with self.assertRaisesRegex(PublishError, "Unexpected HTTPS response"):
            self.publish(transfer)
        self.assertEqual(transfer.read_index(), PREVIOUS)
        self.assertFalse(any(event[0] in {"rename", "delete"} for event in transfer.events))

    def test_rejects_unsupported_local_index_links_before_any_transfer(self):
        for html in (
            INDEX + b'<link href="/assets/extra.css">',
            INDEX + b"<img src='assets/extra.png'>",
            INDEX.replace(b'src="app.js"', b"src='app.js'") + b'<!-- src="app.js" -->',
        ):
            with self.subTest(html=html):
                (self.web / "index.html").write_bytes(html)
                transfer = FakeTransfer()
                with self.assertRaisesRegex(PublishError, "Unsupported local"):
                    self.publish(transfer)
                self.assertEqual(transfer.events, [])

    def test_matching_public_asset_bytes_with_incorrect_content_type_stop_activation(self):
        transfer = FakeTransfer(PREVIOUS)
        transfer.bad_mime = f"{RELEASE}/app.js"
        with self.assertRaisesRegex(PublishError, "Unexpected HTTPS content type"):
            self.publish(transfer)
        self.assertEqual(transfer.read_index(), PREVIOUS)
        self.assertFalse(any(event[0] == "rename" for event in transfer.events))

    def test_stale_at_start_makes_no_transfers_and_stale_at_cutover_never_activates(self):
        new_head = "b" * 40
        transfer = FakeTransfer(PREVIOUS)
        self.assertFalse(self.publish(transfer, (new_head,)))
        self.assertEqual(transfer.events, [])
        self.assertFalse(self.publish(transfer, (COMMIT, new_head)))
        self.assertEqual(transfer.read_index(), PREVIOUS)
        self.assertNotIn(STAGED, transfer.files)
        self.assertIn(("delete", STAGED), transfer.events)
        self.assertFalse(any(event[0] == "rename" for event in transfer.events))

    def test_active_index_is_rechecked_after_the_pre_activation_head_lookup(self):
        transfer = FakeTransfer(PREVIOUS)
        heads = iter([False, True])
        def head():
            if next(heads):
                transfer.files["index.html"] = b"A different index"
            return COMMIT

        with self.assertRaisesRegex(PublishError, "active FTPS index changed"):
            publish(transfer, self.web, COMMIT, RUN_ID, ATTEMPT, head)
        self.assertEqual(transfer.read_index(), b"A different index")
        self.assertFalse(any(event[0] == "rename" for event in transfer.events))

    def test_main_advancing_after_rename_restores_the_previous_index(self):
        transfer = FakeTransfer(PREVIOUS)
        with self.assertRaisesRegex(PublishError, r"Main advanced during activation.*previous HTTPS state verified"):
            self.publish(transfer, (COMMIT, COMMIT, "b" * 40))
        self.assertEqual(transfer.read_index(), PREVIOUS)
        self.assertEqual(transfer.files[BACKUP], PREVIOUS)

    def test_first_publication_removes_only_its_index_if_public_verification_fails(self):
        transfer = FakeTransfer()
        transfer.bad_https = ""
        with self.assertRaisesRegex(PublishError, "previous HTTPS state verified"):
            self.publish(transfer)
        self.assertIsNone(transfer.read_index())
        self.assertIn(("delete", "index.html"), transfer.events)
        self.assertIn(("https", "", "recovery"), transfer.events)
        self.assert_unrelated_preserved(transfer)

    def test_failed_public_update_restores_the_previous_index(self):
        transfer = FakeTransfer(PREVIOUS)
        transfer.bad_https = "index.html"
        with self.assertRaisesRegex(PublishError, "previous HTTPS state verified"):
            self.publish(transfer)
        self.assertEqual(transfer.read_index(), PREVIOUS)
        self.assertIn(("rename", ROLLBACK, "index.html"), transfer.events)
        self.assertEqual(transfer.files[BACKUP], PREVIOUS)
        self.assertIn(("https", "index.html", "recovery"), transfer.events)
        self.assert_unrelated_preserved(transfer)

    def test_lost_rename_replies_after_activation_and_restore_are_recovered(self):
        transfer = FakeTransfer(PREVIOUS)
        transfer.lose_activation_reply = True
        transfer.lose_recovery_reply = True
        with self.assertRaisesRegex(PublishError, r"lost reply after rename.*previous HTTPS state verified"):
            self.publish(transfer)
        self.assertEqual(transfer.read_index(), PREVIOUS)
        self.assertIn(("rename", ROLLBACK, "index.html"), transfer.events)
        self.assertEqual(transfer.files[BACKUP], PREVIOUS)

    def test_backup_remains_available_if_recovery_https_is_unverified(self):
        transfer = FakeTransfer(PREVIOUS)
        transfer.bad_https = "index.html"
        transfer.bad_https_probes.add("recovery")
        with self.assertRaisesRegex(PublishError, "recovery unverified"):
            self.publish(transfer)
        self.assertEqual(transfer.read_index(), PREVIOUS)
        self.assertEqual(transfer.files[BACKUP], PREVIOUS)

    def test_unrecognized_index_is_preserved_for_manual_recovery(self):
        transfer = FakeTransfer(PREVIOUS)
        transfer.bad_https = "index.html"
        transfer.replace_before_recovering = True
        with self.assertRaisesRegex(PublishError, "recovery unverified"):
            self.publish(transfer)
        self.assertEqual(transfer.read_index(), b"A different index")
        self.assertEqual(transfer.files[BACKUP], PREVIOUS)
        self.assert_unrelated_preserved(transfer)


if __name__ == "__main__":
    unittest.main()
