from __future__ import annotations

import contextlib
import copy
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import sys
import threading
import unittest
import urllib.request
import uuid

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from project import SetupError, read_json
from linear_setup import LinearClient, configure, run, workflow_plan
from test_project import CheckoutCase, init_project

TEAM = {"id": "11111111-1111-4111-8111-111111111111", "name": "Example team", "key": "DEMO"}
DEFINITIONS = read_json(ROOT / "config/linear-workflow.json")["states"]


def state(name, kind, position=0):
    return {"id": f"state-{name}", "name": name, "type": kind, "position": position, "color": "#cccccc"}


class Service:
    def __init__(self):
        self.states = [state("Todo", "unstarted"), state("In Progress", "started"), state("Done", "completed"), state("Canceled", "canceled")]
        self.mutations = []
        self.reads = 0
        self.on_read = None
        self.on_create = None
        self.create_error = None
        self.persist = True
        self.workspace = "example"
        self.ambiguous_teams = False
        self.paginate = False
        self.fail_auth = False
        self.omit_pagination = False
        self.drop_after_create = False

    def respond(self, body):
        query, variables = body["query"], body["variables"]
        if "BkbxTeams" in query:
            teams = [TEAM, {**TEAM, "id": "another-id", "key": "OTHER"}] if self.ambiguous_teams else [TEAM]
            if self.paginate and variables["after"] is None:
                return {"data": {"organization": {"id": "organization", "name": "Example", "urlKey": self.workspace},
                                 "teams": {"nodes": [], "pageInfo": {"hasNextPage": True, "endCursor": "page-2"}}}}
            return {"data": {"organization": {"id": "organization", "name": "Example", "urlKey": self.workspace},
                             "teams": {"nodes": teams, "pageInfo": {"hasNextPage": False, "endCursor": None}}}}
        if "BkbxStates" in query:
            self.reads += 1
            if self.on_read:
                self.on_read(self)
            connection = {"nodes": copy.deepcopy(self.states)}
            if not self.omit_pagination:
                connection["pageInfo"] = {"hasNextPage": False}
            return {"data": {"team": {**TEAM, "states": connection}}}
        if "BkbxCreateState" in query:
            value = variables["input"]
            assert value["teamId"] == TEAM["id"]
            assert uuid.UUID(value["id"]).version == 4  # Official input contract.
            self.mutations.append(value)
            if any(item["id"] == value["id"] for item in self.states):
                return {"errors": [{"message": "The supplied identifier already exists"}]}
            created = {key: value[key] for key in ["id", "name", "type", "color", "position"]}
            if self.persist:
                self.states.append(created)
            if self.on_create:
                self.on_create(self)
            result = {"data": {"workflowStateCreate": {"success": True, "workflowState": created}}}
            if self.create_error:
                result["errors"] = [{"message": self.create_error}]
            return result
        raise AssertionError("Unexpected GraphQL operation")


@contextlib.contextmanager
def server(service):
    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            if service.fail_auth or self.headers.get("Authorization") != "test-key":
                self.send_error(401)
                return
            body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            response = json.dumps(service.respond(body)).encode()
            if service.drop_after_create and "BkbxCreateState" in body["query"]:
                self.close_connection = True
                return
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(response)))
            self.end_headers()
            self.wfile.write(response)

        def log_message(self, *args):
            pass

    http = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=http.serve_forever, daemon=True)
    thread.start()

    def transport(request, timeout):
        # Only the isolated test transport rewrites the fixed official URL.
        local = urllib.request.Request(f"http://127.0.0.1:{http.server_port}/graphql", data=request.data,
                                       headers=dict(request.headers), method=request.method)
        return urllib.request.urlopen(local, timeout=timeout)

    try:
        yield LinearClient("test-key", transport=transport)
    finally:
        http.shutdown()
        http.server_close()
        thread.join(timeout=2)


class WorkflowTests(unittest.TestCase):
    def test_read_only_plan_identifies_only_missing_states(self):
        service = Service()
        with server(service) as client:
            team = client.team("DEMO")
            result = configure(client, team, DEFINITIONS, apply=False)
        self.assertEqual([value["name"] for value in result["creates"]], ["Backlog", "Review"])
        self.assertEqual(service.mutations, [])

    def test_apply_and_repeat_are_additive_and_verified(self):
        service = Service()
        with server(service) as client:
            team = client.team("DEMO")
            first = configure(client, team, DEFINITIONS, apply=True)
            second = configure(client, team, DEFINITIONS, apply=True, pinned=first["mapping"])
        self.assertEqual(first["status"], "verified")
        self.assertEqual(len(first["mapping"]), 5)
        self.assertEqual(len(service.mutations), 2)
        self.assertIn("Canceled", [value["name"] for value in service.states])
        self.assertEqual(first["mapping"], second["mapping"])
        started = [value for value in service.states if value["type"] == "started"]
        self.assertLess(next(value["position"] for value in started if value["name"] == "In Progress"),
                        next(value["position"] for value in started if value["name"] == "Review"))

    def test_french_aliases_are_reused(self):
        existing = [state("À cadrer", "backlog"), state("À faire", "unstarted"), state("En cours", "started"),
                    state("À valider", "started", 1), state("Livré", "completed")]
        result = workflow_plan(DEFINITIONS, existing)
        self.assertEqual(result["creates"], [])
        self.assertEqual(result["mapping"]["done"]["name"], "Livré")

    def test_backlog_binds_separately_from_active_en_definition_without_changing_existing_states(self):
        service = Service()
        service.states.extend([state("Backlog", "backlog"), state("En définition", "started", 4)])
        original = copy.deepcopy(service.states)
        with server(service) as client:
            first = configure(client, TEAM, DEFINITIONS, apply=True)
            second = configure(client, TEAM, DEFINITIONS, apply=True, pinned=first["mapping"])
        self.assertEqual(first["mapping"]["backlog"]["id"], "state-Backlog")
        self.assertEqual(first["mapping"], second["mapping"])
        self.assertEqual([item["name"] for item in service.mutations], ["Review"])
        self.assertEqual([item for item in service.states if item["id"] in {value["id"] for value in original}], original)

    def test_active_en_definition_is_not_reused_when_backlog_is_missing(self):
        service = Service()
        separate = state("En définition", "started", 4)
        service.states.append(separate)
        with server(service) as client:
            result = configure(client, TEAM, DEFINITIONS, apply=True)
        self.assertEqual(result["mapping"]["backlog"]["name"], "Backlog")
        self.assertEqual([item["name"] for item in service.mutations], ["Backlog", "Review"])
        self.assertIn(separate, service.states)

    def test_genuine_backlog_alias_ambiguity_and_wrong_category_still_prevent_writes(self):
        for additional in [[state("Backlog", "backlog"), state("À cadrer", "backlog")],
                           [state("Backlog", "started")]]:
            with self.subTest(additional=additional):
                service = Service()
                service.states.extend(additional)
                before = copy.deepcopy(service.states)
                with server(service) as client:
                    with self.assertRaises(SetupError):
                        configure(client, TEAM, DEFINITIONS, apply=True)
                self.assertEqual(service.states, before)
                self.assertEqual(service.mutations, [])

    def test_creation_identity_is_stable_across_independent_setup_runs(self):
        first, second = Service(), Service()
        for service in [first, second]:
            with server(service) as client:
                configure(client, TEAM, DEFINITIONS, apply=True)
        self.assertEqual([item["id"] for item in first.mutations],
                         [item["id"] for item in second.mutations])

    def test_category_conflict_prevents_every_write(self):
        service = Service()
        service.states.append(state("Review", "completed"))
        with server(service) as client:
            with self.assertRaises(SetupError):
                configure(client, TEAM, DEFINITIONS, apply=True)
        self.assertEqual(service.mutations, [])

    def test_ambiguous_names_and_removed_pinned_states_require_a_decision(self):
        existing = [state("Review", "started"), state("In Review", "started")]
        with self.assertRaises(SetupError):
            workflow_plan(DEFINITIONS, existing)
        with self.assertRaises(SetupError):
            workflow_plan(DEFINITIONS, existing, {"review": {"id": "deleted"}})

    def test_external_creation_between_plan_and_apply_does_not_duplicate(self):
        service = Service()

        def concurrent(current):
            if current.reads == 2:
                current.states.append(state("Review", "started", 1))

        service.on_read = concurrent
        with server(service) as client:
            result = configure(client, TEAM, DEFINITIONS, apply=True)
        self.assertEqual(result["status"], "verified")
        self.assertEqual([value["name"] for value in service.mutations], ["Backlog"])

    def test_http_200_partial_graphql_error_stops_and_does_not_repeat_mutation(self):
        service = Service()
        service.create_error = "Partial failure containing test-key"
        with server(service) as client:
            with self.assertRaises(SetupError) as caught:
                configure(client, TEAM, DEFINITIONS, apply=True)
            self.assertNotIn("test-key", str(caught.exception))
            self.assertGreaterEqual(service.reads, 3)
            self.assertEqual(client.confirmed_changes, [])
            self.assertEqual(len(service.mutations), 1)
            service.create_error = None
            result = configure(client, TEAM, DEFINITIONS, apply=True)
        self.assertEqual(result["status"], "verified")
        self.assertEqual([value["name"] for value in service.mutations], ["Backlog", "Review"])

    def test_success_payload_without_persistence_is_not_verification(self):
        service = Service()
        service.persist = False
        with server(service) as client:
            with self.assertRaises(SetupError):
                configure(client, TEAM, DEFINITIONS, apply=True)
        self.assertEqual(len(service.mutations), 1)

    def test_unauthorized_request_does_not_mutate(self):
        service = Service()
        service.fail_auth = True
        with server(service) as client:
            with self.assertRaises(SetupError):
                configure(client, TEAM, DEFINITIONS, apply=True)
        self.assertEqual(service.mutations, [])

    def test_team_pagination_and_ambiguity_are_resolved_before_writes(self):
        service = Service()
        service.paginate = True
        with server(service) as client:
            self.assertEqual(client.team("DEMO")["id"], TEAM["id"])
            service.ambiguous_teams = True
            with self.assertRaises(SetupError):
                client.team("Example team")
        self.assertEqual(service.mutations, [])

    def test_missing_pagination_proof_stops_before_mutating(self):
        service = Service()
        service.omit_pagination = True
        with server(service) as client:
            with self.assertRaises(SetupError):
                configure(client, TEAM, DEFINITIONS, apply=True)
        self.assertEqual(service.mutations, [])

    def test_custom_pinned_review_keeps_new_in_progress_before_it(self):
        service = Service()
        service.states = [item for item in service.states if item["name"] != "In Progress"]
        service.states.append(state("Quality assurance", "started", 5))
        pinned = {"review": {"id": "state-Quality assurance"}}
        with server(service) as client:
            result = configure(client, TEAM, DEFINITIONS, apply=True, pinned=pinned)
        created = next(item for item in service.states if item["name"] == "In Progress")
        self.assertLess(created["position"], 5)
        self.assertEqual(result["mapping"]["review"]["name"], "Quality assurance")

    def test_rename_during_setup_keeps_the_original_state_identity(self):
        service = Service()

        def rename(current):
            if current.reads == 2:
                next(item for item in current.states if item["name"] == "In Progress")["name"] = "Developing"

        service.on_read = rename
        with server(service) as client:
            result = configure(client, TEAM, DEFINITIONS, apply=True)
        self.assertEqual(result["mapping"]["in_progress"]["id"], "state-In Progress")
        self.assertEqual(result["mapping"]["in_progress"]["name"], "Developing")
        self.assertEqual([item["name"] for item in service.mutations], ["Backlog", "Review"])

    def test_dropped_mutation_response_is_recovered_by_reading_on_next_run(self):
        service = Service()
        service.drop_after_create = True
        with server(service) as client:
            with self.assertRaises(SetupError):
                configure(client, TEAM, DEFINITIONS, apply=True)
            self.assertEqual(len(service.mutations), 1)
            service.drop_after_create = False
            result = configure(client, TEAM, DEFINITIONS, apply=True)
        self.assertEqual(result["status"], "verified")
        self.assertEqual([item["name"] for item in service.mutations], ["Backlog", "Review"])

    def test_missing_core_workflow_step_is_not_a_complete_configuration(self):
        with self.assertRaises(SetupError):
            workflow_plan(DEFINITIONS[:-1], [])


class ProfileBindingTests(CheckoutCase):
    def test_workflow_binding_is_recorded_only_after_full_readback(self):
        init_project(self.root)
        service = Service()
        with server(service) as client:
            result = run(self.root, "DEMO", apply=True, client=client)
        profile = read_json(self.root / "config/project.json")
        self.assertEqual(profile["linear"]["team_id"], TEAM["id"])
        self.assertEqual(len(profile["linear"]["states"]), 5)
        self.assertEqual(profile["linear"]["verified_at"], result["verified_at"])

    def test_another_workspace_is_rejected_even_with_the_same_team_key(self):
        init_project(self.root)
        service = Service()
        service.workspace = "other-workspace"
        with server(service) as client:
            with self.assertRaises(SetupError):
                run(self.root, "DEMO", apply=True, client=client)
        self.assertEqual(service.mutations, [])

    def test_partial_failure_leaves_the_profile_unverified(self):
        init_project(self.root)
        service = Service()
        service.create_error = "Uncertain write"
        with server(service) as client:
            with self.assertRaises(SetupError):
                run(self.root, "DEMO", apply=True, client=client)
        self.assertIsNone(read_json(self.root / "config/project.json")["linear"]["verified_at"])

    def test_parallel_local_edit_is_preserved(self):
        init_project(self.root)
        service = Service()
        path = self.root / "config/project.json"

        def local_change(current):
            profile = read_json(path)
            profile["verification"]["checks"] = [{"name": "Human-provided verification"}]
            path.write_text(json.dumps(profile))

        service.on_create = local_change
        with server(service) as client:
            run(self.root, "DEMO", apply=True, client=client)
        self.assertEqual(read_json(path)["verification"]["checks"][0]["name"], "Human-provided verification")

    def test_parallel_binding_edit_is_not_overwritten(self):
        init_project(self.root)
        service = Service()
        path = self.root / "config/project.json"

        def local_change(current):
            profile = read_json(path)
            profile["linear"]["team_id"] = "changed-by-human"
            path.write_text(json.dumps(profile))

        service.on_create = local_change
        with server(service) as client:
            with self.assertRaises(SetupError):
                run(self.root, "DEMO", apply=True, client=client)
        self.assertEqual(read_json(path)["linear"]["team_id"], "changed-by-human")
        self.assertEqual(len(service.mutations), 1)


if __name__ == "__main__":
    unittest.main()
