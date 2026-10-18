#!/usr/bin/env python3
"""Read/verify the team workflow; create only missing states with `apply`."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import unicodedata
import urllib.error
import urllib.request
import uuid
from urllib.parse import unquote, urlsplit

from project import ROOT, SetupError, atomic_write, json_text, now, project_path, read_json

ENDPOINT = "https://api.linear.app/graphql"
TEAMS = """query BkbxTeams($after: String) {
  organization { id name urlKey }
  teams(first: 250, after: $after) {
    nodes { id name key }
    pageInfo { hasNextPage endCursor }
  }
}"""
STATES = """query BkbxStates($id: String!) {
  team(id: $id) {
    id name key
    states(first: 250) {
      nodes { id name type position color }
      pageInfo { hasNextPage endCursor }
    }
  }
}"""
CREATE = """mutation BkbxCreateState($input: WorkflowStateCreateInput!) {
  workflowStateCreate(input: $input) {
    success
    workflowState { id name type position color }
  }
}"""


def normalized(value: str) -> str:
    return " ".join("".join(char for char in unicodedata.normalize("NFKD", value)
                            if not unicodedata.combining(char)).casefold().split())


class LinearClient:
    def __init__(self, token: str, *, transport=None):
        if not token or "\n" in token or "\r" in token:
            raise SetupError("Provide LINEAR_API_KEY through the environment.")
        self.token = token
        self.transport = transport or urllib.request.urlopen
        self.confirmed_changes: list[dict] = []

    def request(self, query: str, variables: dict) -> dict:
        request = urllib.request.Request(
            ENDPOINT, data=json.dumps({"query": query, "variables": variables}).encode(),
            headers={"Content-Type": "application/json", "Authorization": self.token}, method="POST",
        )
        try:
            with self.transport(request, timeout=30) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            raise SetupError(f"Linear HTTP {error.code}; no automatic write retry.") from None
        except (OSError, ValueError) as error:
            raise SetupError("Linear response unavailable or invalid; no automatic write retry.") from None
        if not isinstance(payload, dict):
            raise SetupError("Unexpected Linear response; no automatic write retry.")
        if payload.get("errors"):
            messages = "; ".join(str(item.get("message", "GraphQL error")) for item in payload["errors"] if isinstance(item, dict))
            raise SetupError("Linear GraphQL error: " + messages.replace(self.token, "[redacted]")[:600])
        data = payload.get("data")
        if not isinstance(data, dict):
            raise SetupError("Missing Linear data; no automatic write retry.")
        return data

    def team(self, identifier: str) -> dict:
        after = None
        matches = {}
        cursors = set()
        for _ in range(100):
            data = self.request(TEAMS, {"after": after})
            organization = data.get("organization", {})
            if not isinstance(organization, dict) or not organization.get("id") or not organization.get("urlKey"):
                raise SetupError("Linear workspace identity was not verified.")
            connection = data.get("teams")
            if not isinstance(connection, dict) or not isinstance(connection.get("nodes"), list):
                raise SetupError("Incomplete Linear team listing.")
            for team in connection["nodes"]:
                if not isinstance(team, dict) or not all(isinstance(team.get(key), str) and team[key] for key in ["id", "key", "name"]):
                    raise SetupError("Invalid Linear team data.")
                if any(normalized(str(team.get(key, ""))) == normalized(identifier) for key in ["id", "key", "name"]):
                    matches[team["id"]] = team
            page = connection.get("pageInfo", {})
            if not isinstance(page, dict) or not isinstance(page.get("hasNextPage"), bool):
                raise SetupError("Linear team pagination completeness was not verified.")
            if page["hasNextPage"] is False:
                break
            after = page.get("endCursor")
            if not after or after in cursors:
                raise SetupError("Invalid Linear pagination; team identity not verified.")
            cursors.add(after)
        else:
            raise SetupError("Linear team listing exceeded its bound.")
        if len(matches) != 1:
            raise SetupError("Team not found or ambiguous; use its verified UUID or unique key.")
        return {**next(iter(matches.values())), "workspace_url_key": organization["urlKey"]}

    def states(self, team_id: str) -> list[dict]:
        team = self.request(STATES, {"id": team_id}).get("team")
        if not isinstance(team, dict) or team.get("id") != team_id:
            raise SetupError("The returned Linear team does not match the requested team.")
        connection = team.get("states", {})
        if (not isinstance(connection, dict) or not isinstance(connection.get("pageInfo"), dict)
                or connection["pageInfo"].get("hasNextPage") is not False or not isinstance(connection.get("nodes"), list)):
            raise SetupError("Incomplete Linear workflow listing; no mutation is safe.")
        states = connection["nodes"]
        if any(not isinstance(state, dict) or not all(isinstance(state.get(field), str) and state[field] for field in ["id", "name", "type"]) for state in states):
            raise SetupError("Invalid Linear workflow state data.")
        return states

    def create(self, team_id: str, state: dict, position: float) -> dict:
        # Stable creation identity prevents two setup runs from adding the
        # same logical step. Linear's input contract requires UUID v4 bits.
        identity = f"bkbx.linear.workflow:{team_id}:{state['key']}".encode()
        identifier = uuid.UUID(bytes=hashlib.sha256(identity).digest()[:16], version=4)
        response = self.request(CREATE, {"input": {
            "id": str(identifier),
            "teamId": team_id, "name": state["name"], "type": state["type"],
            "color": state["color"], "position": position,
        }}).get("workflowStateCreate", {})
        result = response.get("workflowState")
        if response.get("success") is not True or not isinstance(result, dict) or not result.get("id"):
            raise SetupError("Workflow creation was not confirmed; read the team before retrying.")
        return result


def workflow_plan(definitions: list[dict], existing: list[dict], pinned: dict | None = None) -> dict:
    """Bind explicit equivalents; preserve distinct stages and reject real conflicts."""
    if not definitions:
        raise SetupError("The workflow configuration is empty.")
    pinned = pinned or {}
    expected = {"backlog": "backlog", "ready": "unstarted", "in_progress": "started", "review": "started", "done": "completed"}
    if not isinstance(definitions, list) or any(not isinstance(item, dict) for item in definitions):
        raise SetupError("Workflow definitions must be a list of objects.")
    if not expected.keys() <= {item.get("key") for item in definitions}:
        raise SetupError("The five core workflow steps are required.")
    keys, names, claimed = set(), set(), set()
    mapping, creates = {}, []
    for definition in definitions:
        if not all(isinstance(definition.get(field), str) and definition[field] for field in ["key", "name", "type", "color"]):
            raise SetupError("Invalid workflow definition.")
        key = definition["key"]
        if (definition["type"] not in {"backlog", "unstarted", "started", "completed", "canceled"}
                or key in expected and definition["type"] != expected[key]
                or not re.fullmatch(r"#[0-9a-fA-F]{6}", definition["color"])):
            raise SetupError(f"Invalid workflow category or color for {key}.")
        aliases = {normalized(name) for name in [definition["name"], *definition.get("aliases", [])]}
        if key in keys or names.intersection(aliases):
            raise SetupError("Duplicate or overlapping workflow definitions.")
        keys.add(key)
        names.update(aliases)
        if key in pinned:
            pinned_id = pinned[key].get("id") if isinstance(pinned[key], dict) else pinned[key]
            matches = [state for state in existing if state["id"] == pinned_id]
            if not matches:
                raise SetupError(f"Recorded state for {key} is no longer available; resolve before rebinding.")
        else:
            matches = [state for state in existing if normalized(state["name"]) in aliases]
        if len(matches) > 1:
            raise SetupError(f"Several states match {key}; choose an explicit mapping first.")
        if matches:
            state = matches[0]
            if state["type"] != definition["type"] or state["id"] in claimed:
                raise SetupError(f"State for {key} has a conflicting category or is used by another step.")
            claimed.add(state["id"])
            mapping[key] = {field: state[field] for field in ["id", "name", "type"]}
        else:
            creates.append(definition)
    return {"mapping": mapping, "creates": creates}


def state_position(definition: dict, definitions: list[dict], existing: list[dict], mapping: dict | None = None) -> float:
    same_type = [state for state in existing if state["type"] == definition["type"]]
    # Insert relative to an existing following logical step when possible;
    # otherwise append within this category. Never reorder existing states.
    following = definitions[definitions.index(definition) + 1:]
    for later in following:
        if later["type"] != definition["type"]:
            continue
        aliases = {normalized(name) for name in [later["name"], *later.get("aliases", [])]}
        recorded = (mapping or {}).get(later["key"], {})
        successor = next((state for state in same_type if state["id"] == recorded.get("id")), None)
        if not successor:
            successor = next((state for state in same_type if normalized(state["name"]) in aliases), None)
        if successor:
            return float(successor.get("position", 0)) - 1
    return max((float(state.get("position", 0)) for state in same_type), default=-1) + 1


def configure(client: LinearClient, team: dict, definitions: list[dict], *, apply: bool,
              pinned: dict | None = None, before_write=None) -> dict:
    initial = workflow_plan(definitions, client.states(team["id"]), pinned)
    if not apply:
        return {"status": "planned", "team": team, **initial, "mutated": False}
    pinned = {**initial["mapping"], **(pinned or {})}
    for _ in range(len(definitions)):
        observed = client.states(team["id"])
        plan = workflow_plan(definitions, observed, pinned)
        pinned.update(plan["mapping"])
        if not plan["creates"]:
            break
        definition = plan["creates"][0]
        if before_write:
            before_write()
        try:
            created = client.create(team["id"], definition, state_position(definition, definitions, observed, plan["mapping"]))
        except SetupError:
            # Read once to recover observability, but never automatically retry
            # an ambiguous write, including one that actually succeeded.
            try:
                client.states(team["id"])
            except SetupError:
                pass
            raise
        confirmed = client.states(team["id"])
        match = next((state for state in confirmed if state["id"] == created["id"]), None)
        if not match or match["name"] != definition["name"] or match["type"] != definition["type"]:
            raise SetupError("Creation response and subsequent read disagree; stop and inspect Linear.")
        client.confirmed_changes.append({"key": definition["key"], **{field: match[field] for field in ["id", "name", "type"]}})
        pinned[definition["key"]] = {field: match[field] for field in ["id", "name", "type"]}
    final = workflow_plan(definitions, client.states(team["id"]), pinned)
    if final["creates"]:
        raise SetupError("The complete workflow was not verified.")
    return {"status": "verified", "team": team, **final, "confirmed_changes": client.confirmed_changes,
            "verified_at": now(), "board_layout": "not_verified", "github_integration": "not_verified"}


def run(root: Path, team_identifier: str, *, apply: bool, client: LinearClient) -> dict:
    path = project_path(root, "config/project.json")
    profile = read_json(path)
    definitions = read_json(root / "config/linear-workflow.json")["states"]
    team = client.team(team_identifier)
    workspace = unquote(urlsplit(profile["linear_url"]).path.strip("/").split("/")[0])
    if normalized(workspace) != normalized(team["workspace_url_key"]):
        raise SetupError("The API key belongs to another Linear workspace; no writes were made.")
    binding = profile.get("linear", {})
    if binding.get("team_id") and binding["team_id"] != team["id"]:
        raise SetupError("This project is bound to another team; no writes were made.")
    url_team = re.search(r"/team/([^/?#]+)", profile["linear_url"])
    if url_team and normalized(url_team[1]) not in {normalized(team["key"]), normalized(team["id"])}:
        raise SetupError("The selected team does not match the project's Linear URL.")
    def check_binding():
        current = read_json(path)
        if (current.get("linear", {}) != binding or current.get("linear_url") != profile["linear_url"]
                or current.get("github_url") != profile.get("github_url")):
            raise SetupError("Profile binding changed during setup; stop before further external writes.")

    result = configure(client, team, definitions, apply=apply, pinned=binding.get("states", {}), before_write=check_binding)
    if apply:
        current = read_json(path)
        if (current.get("linear", {}) != binding or current.get("linear_url") != profile["linear_url"]
                or current.get("github_url") != profile.get("github_url")):
            raise SetupError("Profile changed during setup; verified external changes were not written over local edits.")
        current["linear"] = {"team_id": team["id"], "team_key": team["key"],
                             "states": result["mapping"], "verified_at": result["verified_at"]}
        atomic_write(path, json_text(current))
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--team", required=True, help="Verified team UUID, unique key or unique name")
    parser.add_argument("command", choices=["plan", "apply"])
    args = parser.parse_args()
    client = None
    try:
        client = LinearClient(os.environ.get("LINEAR_API_KEY", ""))
        result = run(args.root.resolve(), args.team, apply=args.command == "apply", client=client)
        print(json_text(result), end="")
        return 0
    except (SetupError, OSError, KeyError, TypeError, ValueError) as error:
        message = str(error)
        token = os.environ.get("LINEAR_API_KEY", "")
        if token:
            message = message.replace(token, "[redacted]")
        print(json_text({"status": "not_verified", "error": message,
                         "confirmed_changes": client.confirmed_changes if client else [],
                         "next": "Read Linear and the project profile before any retry."}), file=sys.stderr, end="")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
