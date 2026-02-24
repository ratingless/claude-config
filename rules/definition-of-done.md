# Definition of Done (All Languages)

## Every Code Change Must:

1. **Compile/Parse** — No syntax or type errors
2. **Pass Tests** — Existing tests still pass; new tests for new code
3. **Pass Lint** — No new lint warnings or errors
4. **Build** — Production build succeeds (if applicable)
5. **No Debug Artifacts** — No debug prints, no commented-out code, no leftover TODOs

## Feature Work Must Also:

6. **Have Tests** — Unit tests for logic, integration tests for flows
7. **Handle Errors** — Graceful error handling with meaningful messages
8. **Handle Edge Cases** — Null/empty/boundary values considered
9. **Be Accessible** — Keyboard navigable, screen reader friendly (if UI)
10. **Be Documented** — Public APIs have docstrings/JSDoc; README updated if needed

## Refactoring Must Also:

11. **Behavior Unchanged** — Same inputs produce same outputs
12. **Tests Pass Before AND After** — Run full suite both times
13. **No Scope Creep** — Don't add features while refactoring

## Bug Fixes Must Also:

14. **Root Cause Fixed** — Not just the symptom
15. **Regression Test Added** — Test that catches this specific bug
16. **Similar Patterns Checked** — Same bug might exist elsewhere in codebase
