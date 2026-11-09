---
name: coverage-gate
description: Coverage gate for this project. Use after every green step of TDD, before
  committing, and before opening a PR, to verify line and branch coverage stay at or above 80%.
---

# Coverage gate

## Command
Run the project coverage command:
- Python: `pytest` (pyproject already enforces --cov-branch and --cov-fail-under=80)
- JS/TS: `npx vitest run --coverage`
- Java: `./mvnw verify`

## Rules
1. Line AND branch coverage MUST be >= 80% overall, and >= 80% on changed lines
   (`diff-cover coverage.xml --compare-branch=origin/main --fail-under=80`).
2. If coverage drops, go back to the TDD loop: add a failing test for the uncovered
   behavior at an agreed seam, then make it pass. Never add tests without assertions.
3. NEVER lower thresholds, add exclusions, add "no cover" pragmas, skip or delete tests
   to pass the gate. If you believe an exclusion is justified, stop and ask the user.
4. Report the coverage summary (lines and branches) at the end of each task.
