"""Publish an attested Tema static build to its dedicated Likuid root."""
import os
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlsplit

FTP_HOST = "cpamg12.likuid.com"
HTTPS_ORIGIN = "https://academie.temasolutions.ca"
INDEX = "index.html"
REFERENCES = {
    ("link", "href", "styles.css"),
    ("script", "src", "config.js"),
    ("script", "src", "app.js"),
    ("img", "src", "assets/logo-tema.png"),
}
PUBLISHED_SUFFIXES = {".html", ".js", ".css", ".png", ".svg", ".woff", ".woff2", ".txt"}
CONTENT_TYPES = {
    ".html": {"text/html"},
    ".js": {"text/javascript", "application/javascript", "application/x-javascript"},
    ".css": {"text/css"},
}


class PublishError(RuntimeError):
    pass


def safe_name(name):
    if not all(re.fullmatch(r"[A-Za-z0-9_][A-Za-z0-9._-]*", part) for part in name.split("/")):
        raise PublishError("Unexpected file name in the public build.")
    return name


class IndexReferences(HTMLParser):
    def __init__(self, release):
        super().__init__()
        self.expected = {(tag, attribute, f"/{release}/{name}") for tag, attribute, name in REFERENCES}
        self.versioned = []

    def handle_starttag(self, tag, attrs):
        if tag == "base":
            raise PublishError("The public index cannot change the base URL.")
        for attribute, value in attrs:
            if attribute == "srcset":
                raise PublishError("Unsupported srcset in the public index.")
            if attribute not in {"src", "href"}:
                continue
            if (tag, attribute, value) in self.expected:
                self.versioned.append((tag, attribute, value))
                continue
            value = (value or "").strip()
            if tag in {"a", "area"} and attribute == "href" and value.startswith(("#", "mailto:")):
                continue
            url = urlsplit(value)
            if url.scheme in {"", "https", "http"} and url.hostname and url.hostname != urlsplit(HTTPS_ORIGIN).hostname:
                continue
            raise PublishError(f"Unsupported local {attribute} in the public index: {value!r}.")


def release_files(web, release):
    files = {}
    for path in sorted(web.rglob("*")):
        name = safe_name(path.relative_to(web).as_posix())
        if path.is_symlink():
            raise PublishError("Unexpected link in the public build.")
        if path.is_dir():
            continue
        if not path.is_file() or path.suffix not in PUBLISHED_SUFFIXES or name == "previous-index.html":
            raise PublishError(f"Unexpected public build file: {name}")
        files[name] = path.read_bytes()

    if {INDEX, *(name for _, _, name in REFERENCES)} - files.keys():
        raise PublishError("The public build lacks the index or a required resource.")
    index = files[INDEX].decode("utf-8")
    for _, attribute, name in REFERENCES:
        reference = f'{attribute}="{name}"'
        if index.count(reference) != 1:
            raise PublishError(f"Expected one local index reference for {name}.")
        index = index.replace(reference, f'{attribute}="/{release}/{name}"')
    references = IndexReferences(release)
    try:
        references.feed(index)
        references.close()
    except ValueError as error:
        raise PublishError("Invalid URL in the public index.") from error
    if sorted(references.versioned) != sorted(references.expected):
        raise PublishError("The public index is missing a versioned resource or has a duplicate.")
    files[INDEX] = index.encode("utf-8")
    return files


def netrc_value(value):
    if not value or any(ord(char) < 32 or ord(char) == 127 for char in value):
        raise PublishError("The Likuid FTPS credentials are missing or invalid.")
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


class CurlTransfer:
    def __init__(self, netrc, release_id):
        self.netrc = netrc
        self.release_id = release_id

    def curl(self, options, data=None):
        return subprocess.run(
            ["curl", "--disable", "--silent", "--noproxy", "*", "--connect-timeout", "10",
             "--max-time", "30", "--max-filesize", "20000000", "--tlsv1.2", *options],
            input=data, capture_output=True, check=False,
        )

    def ftp(self, name, options=(), data=None):
        if name:
            safe_name(name)
        return self.curl(
            ["--proto", "=ftp", "--ssl-reqd", "--netrc-file", str(self.netrc),
             "--ftp-skip-pasv-ip", *options, f"ftp://{FTP_HOST}:21/{name}"], data,
        )

    @staticmethod
    def check(result, action):
        if result.returncode:
            raise PublishError(f"{action} failed (curl {result.returncode}).")
        return result.stdout

    def read_index(self):
        result = self.ftp(INDEX)
        if result.returncode != 78:
            return self.check(result, "Read active index over FTPS")

        # RETR and a successful machine-readable directory listing must agree.
        listing = self.check(self.ftp("", ["--request", "MLSD"]), "List the dedicated FTPS root")
        for line in listing.splitlines():
            facts, separator, name = line.partition(b" ")
            if not separator or not facts.endswith(b";"):
                raise PublishError("The FTPS root did not return a machine-readable listing.")
            if name.lower() == INDEX.encode():
                raise PublishError("The active index exists but could not be read over FTPS.")
        return None

    def read(self, name):
        return self.check(self.ftp(name), f"Read {name} over FTPS")

    def put(self, name, contents):
        self.check(self.ftp(name, ["--ftp-create-dirs", "--upload-file", "-"], contents),
                   f"Upload {name} over FTPS")

    def rename(self, source, destination):
        self.check(self.ftp("", ["--head", "--quote", f"RNFR {safe_name(source)}",
                                 "--quote", f"RNTO {safe_name(destination)}"]),
                   "Rename the active index over FTPS")

    def delete(self, name):
        self.check(self.ftp("", ["--head", "--quote", f"DELE {safe_name(name)}"]),
                   f"Remove {name} installed by this run over FTPS")

    def public(self, name, probe):
        if name:
            safe_name(name)
        result = self.curl([
            "--proto", "=https", "--compressed", "--header", "Cache-Control: no-cache, no-store",
            "--write-out", "\n%{http_code} %{content_type}",
            f"{HTTPS_ORIGIN}/{name}?tema-release={self.release_id}-{probe}",
        ])
        body, _, metadata = self.check(result, f"HTTPS GET /{name}").rpartition(b"\n")
        code, separator, content_type = metadata.partition(b" ")
        if not separator or not re.fullmatch(rb"[0-9]{3}", code):
            raise PublishError(f"Missing HTTPS response status for /{name}.")
        return int(code), content_type.decode("latin1").split(";")[0].strip().lower(), body


def verify_public(transfer, name, expected, probe):
    statuses = {200}
    if expected is None:
        statuses = {404} if name else {403, 404}
    status, content_type, contents = transfer.public(name, probe)
    if status not in statuses or (expected is not None and contents != expected):
        raise PublishError(f"Unexpected HTTPS response for /{name} (HTTP {status}).")
    types = CONTENT_TYPES.get(Path(name or INDEX).suffix)
    if expected is not None and types and content_type not in types:
        raise PublishError(f"Unexpected HTTPS content type for /{name}.")


def verify_index(transfer, contents, probe):
    verify_public(transfer, "", contents, probe)
    verify_public(transfer, INDEX, contents, probe)


def recover(transfer, candidate, previous, backup, rollback):
    active = transfer.read_index()
    if active == candidate:
        if previous is not None:
            saved = transfer.read(backup)
            if saved != previous:
                raise PublishError("The FTPS backup differs from the previous index.")
            transfer.put(rollback, saved)
            if transfer.read(rollback) != previous or transfer.read_index() != candidate:
                raise PublishError("The rollback copy or active index changed before recovery.")
        try:
            if previous is None:
                transfer.delete(INDEX)
            else:
                transfer.rename(rollback, INDEX)
        except PublishError:
            # A completed rename or delete may be followed by a lost FTP reply.
            if transfer.read_index() != previous:
                raise
    elif active != previous:
        raise PublishError("The active index matches neither this release nor the previous one.")
    if transfer.read_index() != previous:
        raise PublishError("The previous FTPS state could not be confirmed.")
    verify_index(transfer, previous, "recovery")


def publish(transfer, web, commit, run_id, attempt, get_main_sha):
    release_id = f"{commit}-{run_id}-{attempt}"
    release = f"_releases/{release_id}"
    files = release_files(web, release)
    if commit != get_main_sha():
        print(f"Skipping {release_id}: main has advanced.")
        return False

    previous = transfer.read_index()
    verify_index(transfer, previous, "before")
    for name, contents in files.items():
        transfer.put(f"{release}/{name}", contents)
    for name, contents in files.items():
        verify_public(transfer, f"{release}/{name}", contents, "candidate")

    backup = f"{release}/previous-index.html"
    if previous is not None:
        transfer.put(backup, previous)
        if transfer.read(backup) != previous:
            raise PublishError("The previous index backup failed verification over FTPS.")
    staged = f"_likuid-index-{release_id}.tmp"
    candidate = files[INDEX]
    transfer.put(staged, candidate)
    if transfer.read(staged) != candidate:
        raise PublishError("The staged FTPS index changed before activation.")
    if commit != get_main_sha():
        transfer.delete(staged)
        print(f"Skipping {release_id}: main advanced during staging.")
        return False
    if transfer.read_index() != previous:
        raise PublishError("The active FTPS index changed before activation.")

    rollback = f"_likuid-rollback-{release_id}.tmp"
    try:
        transfer.rename(staged, INDEX)
        verify_index(transfer, candidate, "after")
        if commit != get_main_sha():
            raise PublishError("Main advanced during activation.")
    except (PublishError, OSError, KeyboardInterrupt) as error:
        try:
            recover(transfer, candidate, previous, backup, rollback)
        except (PublishError, OSError, KeyboardInterrupt) as recovery_error:
            raise PublishError(
                f"Activation failed ({error}); recovery unverified ({recovery_error}). "
                f"Inspect {INDEX}, {release}/{INDEX} and {backup} on the dedicated account."
            ) from recovery_error
        raise PublishError(f"Activation failed ({error}); previous HTTPS state verified.") from error

    print(f"Public HTTPS index and {len(files)} versioned files verified for {release_id}.")
    return True


def remote_main_sha():
    try:
        result = subprocess.run(
            ["git", "ls-remote", "--refs", "--exit-code", "origin", "refs/heads/main"],
            capture_output=True, check=False, timeout=20,
            env={**os.environ, "GIT_TERMINAL_PROMPT": "0"},
        )
    except subprocess.TimeoutExpired as error:
        raise PublishError("Timed out verifying the current main revision.") from error
    match = re.fullmatch(rb"([a-f0-9]{40})\trefs/heads/main\r?\n", result.stdout)
    if result.returncode or match is None:
        raise PublishError("Could not verify the current main revision.")
    return match[1].decode()


def main(web):
    if os.environ.get("GITHUB_REF") != "refs/heads/main":
        raise PublishError("Likuid publication requires the GitHub main ref.")
    commit = os.environ.get("GITHUB_SHA", "")
    run_id = os.environ.get("GITHUB_RUN_ID", "")
    attempt = os.environ.get("GITHUB_RUN_ATTEMPT", "")
    if not re.fullmatch(r"[a-f0-9]{40}", commit) or not all(
        re.fullmatch(r"[1-9][0-9]{0,19}", value) for value in (run_id, attempt)
    ):
        raise PublishError("Missing or invalid GitHub release identity.")

    username = netrc_value(os.environ.pop("LIKUID_FTP_USERNAME", ""))
    password = netrc_value(os.environ.pop("LIKUID_FTP_PASSWORD", ""))
    with TemporaryDirectory(prefix="tema-likuid-") as directory:
        netrc = Path(directory) / "netrc"
        with os.fdopen(os.open(netrc, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), "w") as file:
            file.write(f"machine {FTP_HOST} login {username} password {password}\n")
        transfer = CurlTransfer(netrc, f"{commit}-{run_id}-{attempt}")
        return 0 if publish(transfer, Path(web), commit, run_id, attempt, remote_main_sha) else 1


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage: publish-likuid.py <private production build web directory>")
    try:
        sys.exit(main(sys.argv[1]))
    except (PublishError, OSError, UnicodeError) as error:
        sys.exit(f"Likuid: {error}")
