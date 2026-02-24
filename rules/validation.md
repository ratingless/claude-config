# Code Validation Rules (All Languages)

## Before Considering Work Complete

### Compilation / Type Check

- **TypeScript**: `npx tsc --noEmit`
- **Python**: `mypy .` or `pyright`
- **Go**: `go build ./...`
- **Rust**: `cargo check`
- **Java**: `mvn compile` or `gradle build`
- Run the appropriate check for the project's language

### Tests

- All existing tests must still pass
- New code should have new tests
- Run: `npm test` / `pytest` / `go test ./...` / `cargo test` / `mvn test`

### Lint

- No new lint errors introduced
- Run: `eslint` / `flake8` / `golangci-lint` / `clippy` / `checkstyle`

### Build

- Production build must succeed (if applicable)

## After Writing New Code

- Add tests for new functions/components/endpoints
- Verify edge cases: null/nil/None, empty collections, boundary values, large input
- Check error handling paths
- Verify with the project's actual test runner (don't just assume it works)

## After Fixing Bugs

- Add a regression test that reproduces the original bug
- Verify the fix doesn't break related functionality
- Run the FULL test suite, not just the affected test

## Security Checks (All Languages)

- No hardcoded secrets (API keys, passwords, tokens, connection strings)
- Input validation at system boundaries (API endpoints, CLI args, file reads)
- No injection vulnerabilities (SQL, XSS, command, path traversal)
- Sensitive data not logged or exposed in error messages
- Dependencies audited (`npm audit` / `pip audit` / `go vuln` / `cargo audit`)
