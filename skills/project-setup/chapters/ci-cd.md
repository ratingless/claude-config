# CI/CD Configuration

## GitHub Actions Basic Pipeline

```yaml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build
```

## Pipeline Stages (recommended order)

1. **Install** — `npm ci` (deterministic installs)
2. **Type Check** — `tsc --noEmit` (fastest to fail)
3. **Lint** — `eslint .` (catch style issues)
4. **Unit Test** — `vitest run --coverage`
5. **Build** — `vite build` or equivalent
6. **E2E Test** — Playwright/Cypress (after build)
7. **Deploy** — Only on main branch, after all checks pass

## Caching Strategy

- Cache `node_modules` keyed by `package-lock.json` hash
- Cache build output for unchanged modules
- Cache Playwright browsers separately

## Branch Protection

- Require CI to pass before merge
- Require at least 1 code review
- No direct push to main/master
- Auto-delete merged branches

## Environment Variables

- Use GitHub Secrets for sensitive values
- Never hardcode secrets in config files
- Use `.env.example` to document required vars
- Validate env vars at startup (fail fast)
