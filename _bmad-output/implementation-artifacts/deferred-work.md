- source_spec: `spec-reusable-project-foundation.md`
  summary: Validate complete mutable YAML syntax during initialization and method checks, including unmanaged values.
  evidence: The pre-maintenance merge and checker already accepted an unterminated unmanaged scalar or flow collection; current managed-key guards and native hashes do not parse arbitrary YAML. Choose a maintained parser and its portable dependency policy before adding that validation. Findings BH-3 and BH-4 share this pre-existing gap.
