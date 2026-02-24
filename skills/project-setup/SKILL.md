---
name: project-setup
description: Project initialization and configuration guide. Package management, build tools, CI/CD, and infrastructure setup. Auto-loaded for new projects or configuration changes.
---

# Project Setup Manual

## Table of Contents

- Build & Tools: [chapters/build-tools.md](chapters/build-tools.md)
- CI/CD: [chapters/ci-cd.md](chapters/ci-cd.md)

## Quick Setup Checklist

### New Project

1. Initialize: `npm init` or framework CLI
2. TypeScript: `tsconfig.json` with strict mode
3. Linting: ESLint + Prettier (format on save)
4. Testing: Vitest/Jest + Testing Library
5. Git hooks: husky + lint-staged (pre-commit)
6. CI: GitHub Actions or equivalent
7. Environment: `.env.example` template (never commit `.env`)

### Existing Project Onboarding

1. Read `README.md` and `package.json`
2. Check `tsconfig.json` for paths and strict settings
3. Identify test runner and coverage setup
4. Review CI pipeline configuration
5. Check for `.env.example` and required env vars
6. Run `npm install && npm run build && npm test`

### Package.json Standards

```json
{
  "scripts": {
    "dev": "starts development server",
    "build": "creates production build",
    "test": "runs test suite",
    "test:watch": "tests in watch mode",
    "lint": "runs linter",
    "lint:fix": "auto-fix lint issues",
    "format": "runs formatter",
    "typecheck": "runs tsc --noEmit"
  }
}
```
