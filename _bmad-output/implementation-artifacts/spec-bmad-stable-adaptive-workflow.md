---
title: 'Keep the reusable workflow current with stable BMAD'
type: 'feature'
created: '2026-10-17'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'NO_VCS'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/docs/framework/spec.md'
  - '{project-root}/docs/workflow.md'
  - '{project-root}/docs/context.md'
---

<frozen-after-approval reason="user-approved foundation scope, clarified by the request for current stable BMAD and portable project knowledge">

## Intent

**Problem:** The reusable foundation deliberately retained BMAD 6.10 names. The user has clarified that new projects must use the latest stable release and that an agent must learn the installed skills instead of freezing an obsolete workflow. Framing, consistent stories, review, testing, Linear and relevant project knowledge must survive changes of BMAD version or assistant provider.

**Approach:** Use the official current stable distribution, bind an inspected capability map to its exact installed inventory, and require catalog discovery at initialization and after updates. Keep the common workflow expressed in outcomes; use the current native skills and proportional routes to achieve them. Record the installed version for reproducibility without treating it as a permanent version policy.

## Boundaries & Constraints

**Always:** Latest stable at project initialization; verified equivalents may be adapted autonomously while preserving agreed behavior, human checkpoints and evidence. Record relevant decisions and information inside the project, read them when pertinent, retain superseded decisions. Preserve original configuration, unknown human files, product context and the working Linear helper. Keep English native BMAD specs and French team guidance. Honor the prior implementation GO and the user's subsequent clarified scope; do not invent a separate approval event. No shared personal memory dependency.

**Never:** Touch the source project, commit, push, create a fake product or external ticket, mutate a real Linear team, export conversations, silently rewrite approved behavior, or skip required review/tests. Do not add custom skills or an unattended updater. Native files remain unchanged; use official customization surfaces. Existing compatible updates are tested at a coherent checkpoint rather than injected into active story execution.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Installed catalog | Official skill/help manifests and both tool directories | Complete inventory, descriptions, phases/actions/outputs where declared; real paths and current capability mapping | Missing, escaping or mismatched files are reported |
| Stable query | Official npm latest metadata | Exact stable release and installed/latest comparison | Offline or prerelease response never claims up-to-date; no writes or installs |
| Version drift | Installed version or locked inventory changed | Existing capability analysis is stale and must be regenerated after reading the changed skills | No silent reuse of old routing |
| Provider handoff | Saved project decisions and handoff in copied checkout | Fresh agent can retrieve relevant knowledge without personal memories | Missing evidence stays unresolved |

</frozen-after-approval>

## Code Map

- `scripts/project.py`, `tests/test_project.py`: protected local setup and resume; preserve behavior and use current dynamic skill identities in tests.
- `scripts/check.py`, `config/bmad.lock.json`: official integrity and portable document validation; replace obsolete hard-coded required skill names with a validated version-bound capability map.
- `_bmad/_config/{bmad-help,skill-manifest}.csv`: official installed catalog; use real skill directories because manifest source paths are not necessarily deployed paths.
- `config/bmad-routing.json`, `scripts/bmad.py`, `tests/test_bmad.py`: new concise map plus read-only inventory/stable checks, standard library only; paths must stay inside the checkout.
- `AGENTS.md`, `README.md`, `docs/{initialisation,workflow,context,bmad}.md`, `docs/framework/`: instructions, current decisions, coverage and proof. Historical 6.10 choice becomes superseded, not erased.
- `_bmad/custom/`: native persistent facts for current Build and Code Review; retire only our obsolete create/dev/quick customizations. Version 6.12.4 is already installed with `--no-shims`; validate its inventory.
- `.bkbx/before-stable.json`: temporary recoverable baseline location, outside the distributed product. Git has no commit, so no canonical HEAD exists; `NO_VCS` is a workflow sentinel, not a revision.

## Tasks & Acceptance

**Execution:**
- [x] `config/bmad.lock.json`, `vendor/BMAD-LICENSE`, `THIRD_PARTY_NOTICES.md` -- verify npm provenance/integrity and lock actual official 6.12.4 files without modifying native resources.
- [x] `config/bmad-routing.json`, `scripts/bmad.py`, `scripts/check.py`, `tests/test_bmad.py` -- implement full installed catalog, read-only stable check and stale capability-map detection. Test matrix failures without live npm calls.
- [x] `tests/test_project.py`, `_bmad/custom/` -- migrate native references and persistent facts; demonstrate Build renders without personal configuration.
- [x] `AGENTS.md`, `README.md`, `docs/` -- document stable lifecycle, natural intent routing, proportional specs/stories, built-in review, method explanation and portable project knowledge. Keep external-validation limits truthful.
- [x] `docs/framework/validation.md` -- record actual tests, cold-copy checks and current native skill activation; identify previous proof as historical.

**Acceptance Criteria:**
- Given a fresh project, when the agent initializes it, then it checks stable availability, reads the entire installed catalog, learns the relevant entrypoints and records its version-bound routing; an unavailable check is explicit.
- Given a small change or an epic story, when the agent chooses a route, then it uses actual current BMAD skills with proportional artifacts and existing GO/review/test/Linear rules.
- Given the question “how do you develop and which skills do you use?”, when an agent reads the foundation, then it can explain the invariant process and actual current skills without executing a fictitious product.
- Given saved decisions and pertinent information, when a different assistant opens the checkout, then required knowledge is present in project files and linked for retrieval.

## Implementation Notes

Current stable was verified through npm and the official 6.12.4 release notes. A temporary pristine installation has 29 native skills per tool. The actual foundation was updated using the official installer with `--no-shims`; personal installer answers remain ignored. The backup contains the previous local candidate. This spec refines the already authorized foundation, not a new product feature. The implementation handoff is already inside native Build step 03; execute this checklist directly without starting a nested workflow. Work sequentially and return findings to the parent for review.

Completed with the official dependency payload unchanged: the npm tarball SHA-512 matched its published integrity, 438 included files matched the package, and the two generated catalogs were verified separately. The lock covers 440 SHA-256 file entries. The current capability map binds to the exact installed version and inventory; additional human skills can coexist without being treated as native BMAD resources. Team facts use the official customization surface. All pertinent project knowledge stays in project documents and indexes, without exporting conversations or relying on personal assistant memory.

## Spec Change Log

## Review Triage Log

| ID | Verdict | Route | Evidence |
|---|---|---|---|
| B1 | high | patch | Removing the installer central config leaves validation green but native rendering fails. Require its readable TOML before accepting the method. |
| B2 | medium | patch | Removing the Build override drops both mandatory persistent facts while check.py stays green. Verify required facts for the mapped implementation/review workflows. |
| B3 | medium | patch | Scalar TOML tables and integer artifact paths reach AttributeError in validate(), escaping JSON diagnostics. Reproduced by the reviewer; handle malformed shapes. |
| B4 | medium | patch | An undefined artifact placeholder is accepted as a literal contained path. It is unresolved BMAD input, so validate supported substitutions before containment. |
| B5 | medium | patch | A complementary folder may declare the native name bmad-build and pass. Its discoverable identity can collide even though its directory name differs. |
| B6 | false | reject | The offline checker labels provenance as declared; it verifies installed bytes against the reviewed lock. Authentic npm bytes were independently compared during adoption and that dated evidence is recorded. Replacing a shape-valid declaration does not demonstrate execution of unverified native bytes; re-authentication of a maliciously rewritten trusted lock is not this command's promise. |
| B7 | medium | patch | Removing story/sprint outcomes from epic_story or making method_question implement code passes current structural validation. Enforce the existing route contracts. |
| B8 | medium | patch | IncompleteRead is an HTTPException outside the current catches; an interrupted read escapes the promised unavailable result. |
| B9 | low | patch | urllib follows a demonstrated redirect before validating its final URL. Use the standard redirect refusal handler so the existing fixed-endpoint restriction applies before a second request. |
| B10 | low | reject | Python may create ignored bytecode caches on import. Read-only here concerns project content, configuration, Git and external state; .gitignore explicitly treats caches as derived runtime files. Changing process-wide cache behavior adds a guard for negligible impact and is unnecessary. |
| E1 | medium | patch | Same demonstrated malformed TOML diagnostic failure as B3; preserve this source finding in the log. |
| E2 | medium | patch | Same interrupted HTTP body failure as B8. |
| E3 | medium | patch | The claims check confirms the same unavailable-result violation as B8/E2. |
| V1 | medium | patch | Verified mutant help=[] still passes all existing catalogue tests. Assert all declared rows and values, including multi-action skills, are emitted. |
| V2 | medium | patch | Verified mutant that drops unavailable from status.ok still passes. Exercise online failure through status and main, checking JSON and exit code. |
| V3 | medium | patch | Integer output_folder demonstrably raises AttributeError at containment normalization rather than returning invalid-config diagnostics; grouped with B3/E1. |

All three configured native review layers completed. The 14 accepted raw findings formed ten patch groups; all were corrected and revalidated. The two rejected findings retain their rationale above. Nothing is deferred and no intent gap, new public API or unresolved user choice remains. Official dependency payloads were independently verified against the pristine installation/tarball; review diff scope is the integration and first-party documentation.

## Verification

**Commands:**
- `python3 scripts/check.py` -- integrity, current routing and portable references pass.
- `python3 scripts/bmad.py catalogue` -- every installed native skill is represented.
- `python3 scripts/bmad.py status --online` -- read-only current stable check; report actual network result separately.
- `python3 -m unittest discover -s tests -v` -- existing protections and new matrix tests pass.
- In a copy of only Git-distributable files, run local setup and the native Build renderer without personal settings; inspect the rendered entrypoint and checkpoint. No product implementation or external mutations in the pilot.

**Final results, 2026-10-17:** All 65 tests passed in the working candidate and in a separate copy of the 479 Git-distributable files without personal configuration. Native Build rendering with `uv` included both required persistent facts and the preparation checkpoint. Web, service and existing multi-repository setup/resume pilots retained decisions and feature context after relocation, with validation still passing. The real read-only npm query returned installed 6.12.4, latest 6.12.4, `up_to_date`; local doctor confirmed template mode with no product identity. Fresh-interface discovery and real Linear configuration remain explicitly unverified. The source project was unchanged; no commit, staging, push or external mutation was performed. Local completion honors the user's no-commit rule over native Build's generic commit instruction.
