---
title: 'Keep the foundation reliable after project initialization'
type: 'bugfix'
created: '2026-10-17'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'NO_VCS'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/docs/framework/spec.md'
---

<frozen-after-approval reason="Sofiane approved the four listed pre-project corrections with ok go in the current conversation">

## Intent

**Problem:** The foundation's tests assume an uninitialized checkout, its checker applies framework constraints to product files, interrupted YAML setup can overwrite human edits, and Linear guidance still confuses technical completion with project delivery.

**Approach:** Delimit method-owned files and independent test fixtures, protect every managed configuration during interrupted setup, and align the shared Linear semantics. Keep the method simple and usable after a real project has been initialized.

## Boundaries & Constraints

**Always:** Preserve product identity, decisions, human configurations and unrelated work. Keep checks meaningful: modified native or owned resources still fail. A technical task closes only after its entire agreed deliverable is accepted, verified and integrated at the agreed target; project, acceptance and delivery tasks retain their own criteria. Preserve the five core states, read/write/read, GO gates and scoped progress-commit policy. The current GO covers this four-part maintenance lot; no further product choice is unresolved.

**Never:** Edit Pink, change native BMAD files, initialize the actual foundation as a fake product, create real Linear objects, merge main, deploy or publish the repository. Add no custom skills, scheduler, broad documentation reorganization or automatic updater.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Reuse | Clean template or initialized product | Method tests use pristine fixtures and pass independently of live product identity | Missing owned resources remain explicit failures |
| Coexistence | Product routes, invalid JSON fixtures, dependencies or unrelated tests | Method checks and fixture copies include only method-owned resources | Owned-file corruption must still fail |
| Interrupted setup | Original or exact expected partial TOML/YAML | Preserve verified source archives and resume | Divergent human edits stop before further writes |
| YAML boundaries | Quoted managed keys or ambiguous duplicates | Preserve supported forms or reject before writes | Never append a semantic duplicate |
| Existing Linear team | Backlog plus separate active En définition | Bind Backlog correctly; preserve other states | Genuine ambiguity/category conflicts still stop writes |

</frozen-after-approval>

## Code Map

- `scripts/check.py:88-111`, `tests/test_project.py:21-23` -- replace recursive scans/copies with explicit ownership.
- `config/method-files.json`, `scripts/method_files.py` -- shared ownership plus existing native lock.
- `tests/fixtures/`, `tests/test_project.py`, `tests/test_bmad.py`, `scripts/test_method.py` -- pristine mutable configs and bounded method-only testing.
- `scripts/project.py:222-269` -- extend TOML archive/retry discipline to both YAML configs.
- `config/linear-workflow.json`, `scripts/linear_setup.py`, `tests/test_linear_setup.py` -- remove the misleading alias; preserve additive setup and genuine-conflict checks.
- `AGENTS.md`, `README.md`, `docs/{workflow,bmad,initialisation}.md`, `docs/framework/` -- harmonize affected rules, commands and evidence.

## Tasks & Acceptance

**Execution:**
- [x] `config/method-files.json`, `scripts/method_files.py`, `scripts/check.py` -- delimit owned files; preserve native validation.
- [x] `tests/fixtures/`, `tests/test_project.py`, `tests/test_bmad.py`, `scripts/test_method.py` -- independent fixtures, bounded execution and coexistence regressions.
- [x] `scripts/project.py`, `tests/test_project.py` -- verified archives, safe resume, human-edit protection and quoted keys.
- [x] `config/linear-workflow.json`, `tests/test_linear_setup.py`, shared guidance -- correct binding and task/project semantics.
- [x] `docs/framework/validation.md`, `docs/framework/decisions.md` -- record actual final evidence and limits.

**Acceptance Criteria:**
- Given template and initialized checkouts, when the bounded suite runs, then both pass without changing product identity or knowledge.
- Given product files and dependencies, when method validation and fixture copying run, then only owned resources are checked/copied; native corruption still fails.
- Given an interrupted setup and human edits, when initialization resumes, then it reports conflicts without writes; unchanged partial setup still resumes.
- Given accepted technical integration, when its task closes, then project and delivery tasks remain subject to their own completion criteria.

## Implementation Notes

The current GO approves these four corrections. NO_VCS is a sentinel: the baseline checkout had no HEAD. Recovery copy/hashes are recorded in ignored `.bkbx/reuse-fixes-baseline.json`. Existing untracked files are known authorized work. No live product or team is designated.

This is the native Build step-03 handoff: execute the checklist directly, leaving VCS operations and final review to the parent. Keep native specs/code in English and existing user guidance in French.

Completion checkpoint: the approved foundation is recorded locally on a working branch. This is the first commit because the initial checkout had no HEAD; it includes the previously approved foundation as well as this maintenance lot. The original NO_VCS baseline is preserved above. No push, main integration or repository publication is performed.

## Spec Change Log

## Review Triage Log

Native dispatch review ran all three layers independently against the temporary unified diff. Each raw finding is recorded separately before grouping. Locations refer to the reviewed candidate.

| ID | Raw finding | Verdict and verified evidence | Route |
|---|---|---|---|
| BH-1 | `test_method.py:24`: a product package can shadow a declared test file. | medium — Name-based unittest loading searches packages before the file; the declared path is not the import origin. Existing test modules also import the declared `test_project` helper, so both initial and sibling imports require the same protection. | patch |
| BH-2 | `project.py:147`: an indented root YAML mapping receives duplicate unindented managed keys. | medium — Pure-merge reproduction returns both indented `project_name: old` and unindented `project_name: new`. The revised ambiguous-key handling must reject this demonstrated form before writes. | patch; shared with EC-1 |
| BH-3 | `project.py:150`: invalid unmanaged YAML values survive initialization. | medium — `custom_rules: "unterminated` survives the merge. The baseline merge already preserved arbitrary unmanaged YAML without parsing it; this change does not introduce that missing full-syntax validation. | defer; shared with BH-4 |
| BH-4 | `check.py:98`: mutable YAML and fixture syntax is not parsed by the checker. | medium — `custom_rules: [` leaves the checker successful. Baseline `check.py` likewise parsed only JSON, TOML and Python, not YAML. Native hashes and managed-key guards are separate checks and do not prove arbitrary YAML syntax. | defer; shared with BH-3 |
| BH-5 | `project.py:309`: an edit after the final preflight can be overwritten during context generation. | medium — A hook editing BMM YAML when the first context is written returns `initialized` and loses the edit. Recheck each managed source immediately before its replacement, retaining the earlier all-source check. | patch; shared with EC-2 |
| BH-6 | `project.py:280`: text newline normalization authenticates a changed archive. | low — Converting an archived source from LF to CRLF changes its bytes but resumes successfully. Source authentication promises exact originals; preserve newline bytes when reading the source/archive for hashing and archival. | patch |
| BH-7 | `project.py:275`: complete archives without their common journal are trusted retroactively. | medium — Removing the journal and changing an archived managed value still resumes. The incomplete-archive guard must also reject a complete unverified set. | patch |
| BH-8 | `method_files.py:40`: a declared nested test module is silently excluded. | low — A declared `tests/regression/test_sentinel.py` is not selected. The documented runner currently owns three top-level modules only; nested modules are not part of everyday use. Adding a generic nested-loading contract or guard exceeds a direct correction for this negligible future case. | rejected under native low-finding rule |
| BH-9 | `method_files.py:60`: copies lose executable modes. | low — The native resolver is 0755 at source and 0644 in the copy. Preserve modes with the direct copy-operation correction. | patch |
| BH-10 | `method-files.json:48`: two mutable workflow overrides leak product context into pristine copies. | medium — A product-only comment in `bmad-build.toml` appears in the pristine copy. Add pristine references for both owned workflow overrides, using the existing fixture mechanism. | patch |
| EC-1 | `project.py:147-149`: consistently indented root mapping generates invalid YAML. | medium — Same demonstrated root-indentation defect as BH-2; preserve the independent finding and fix their shared cause once. | patch; shared with BH-2 |
| EC-2 | `project.py:309-317`: a configuration changes while generated context is written. | medium — Same hook-confirmed overwrite as BH-5; each replacement needs its own fresh source check. | patch; shared with BH-5 |
| VG-1 | No subprocess regression verifies the runner's actual exclusion boundary. | medium — Pre-verified review evidence: replacing bounded loading with general discovery still passes all 82 tests. Add minimal owned sentinels, an undeclared import marker and package-shadow fixtures at the real CLI boundary. | patch |
| VG-2 | No regression exercises a source edit during the archive phase of one attempt. | medium — Pre-verified review evidence: removing the all-source reread still passes 82 tests; an archive hook then erases an intervening edit. Add the hook regression, requiring preserved sources and no context/profile writes. | patch |

Deferred group: full syntax validation of arbitrary unmanaged YAML was absent before this maintenance. It requires a separately chosen YAML parser/dependency policy; no additional parser is introduced silently into a Python-standard-library foundation. The limitation is recorded in deferred work and validation. All other surviving groups are direct corrections to demonstrated states using existing surfaces; no new product decision or public interface is required.

Patch resolution: re-engaged the original implementation agent once with the surviving corrections. Declared test origins now win over product packages, including sibling imports; a subprocess regression verifies the real CLI boundary. Root-indented YAML is rejected before writes. Source checks run after archiving and immediately before each replacement. Source/archive authentication preserves exact UTF-8 bytes and rejects every archive set without its journal. Copies preserve file modes and use pristine references for both mutable workflow overrides. Added archive-phase and context-phase edit interleavings. All 11 patch-routed raw findings are addressed; the two pre-existing YAML findings are recorded as one deferred group, and the nested-test suggestion is rejected under the native low-finding rule.

## Verification

- Run bounded tests and `python3 scripts/check.py` on template, cold copy and initialized product with unrelated fixtures/tests. Compare product state before/after.
- Cover every matrix row; verify native hashes, portable references and source status. Keep real external setup and fresh-interface discovery explicitly unverified.

Pre-review parent acceptance verification: 82 bounded tests pass in a cold copy of all 487 Git-distributable files and again after real local initialization. The initialized profile, human permission restriction, D-001 decision, DEMO-7 feature index and unrelated product files retain identical hashes. Product tests remain unexecuted. Method checks pass before and after initialization and after moving the checkout; native Build renders after the move without changing product state. The real foundation remains a template. Evidence is retained outside the distribution, with its summary in the framework validation reference.

Post-patch parent verification: all 89 tests passed in 36.541 seconds with verbose output, including every new review regression and the covering matrix tests. `check.py` and `project.py doctor` pass; all 440 native hashes and the frozen intent are unchanged. The source checkout retains its original status. The final pilot copied all 490 Git-distributable files: 89/89 tests pass in the cold template and again in the initialized product, with unchanged product hashes and successful checks/rendering after moving the checkout. No source product, real Linear object or external destination was changed.

Matrix coverage audit:
- Reuse: `test_pristine_copies_ignore_initialized_identity_and_custom_mutable_configs`, context preservation/travel tests and both final independent 89-test runs.
- Coexistence: `test_product_routes_invalid_fixtures_dependencies_and_tests_do_not_enter_method_checks_or_copies`, owned corruption/missing/symlink tests, existing native integrity tests and the independent initialized pilot.
- Interrupted setup: all managed configuration/archive interruption tests, eight original/partial combinations, intervening source/archive edits, changed retry parameters and legacy incomplete archives.
- YAML boundaries: supported quoted keys and semantic duplicate/ambiguous form rejection tests.
- Existing Linear team: explicit separate En définition, absent Backlog, genuine alias ambiguity and category-conflict tests. Technical completion semantics were checked in the affected guidance; no external state is inferred from these tests.
