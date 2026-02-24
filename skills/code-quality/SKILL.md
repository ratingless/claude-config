---
name: code-quality
description: Code quality assurance guide. Covers linting, formatting, type safety, testing patterns, and performance optimization. Auto-loaded when working on code quality, reviews, or refactoring.
---

# Code Quality Manual

## Table of Contents (load only what you need)

- Clean Code Patterns: [chapters/clean-code.md](chapters/clean-code.md)
- Testing Strategies: [chapters/testing.md](chapters/testing.md)
- Performance: [chapters/performance.md](chapters/performance.md)

## Core Rules (always apply)

### Code Hygiene

1. **No `any` types** in TypeScript — use `unknown` or specific types
2. **No hardcoded magic values** — extract constants or config
3. **No dead code** — remove commented-out code and unused imports
4. **No console.log in production** — use proper logging or remove
5. **Error handling** — never swallow errors silently; at minimum log them

### File Organization

- One exported component/class/module per file
- Keep files under 300 lines; split if larger
- Co-locate tests with source (`*.test.ts` next to `*.ts`)
- Index files for re-exports only — no logic

### Naming Conventions

- PascalCase: Components, Classes, Types, Interfaces
- camelCase: functions, variables, methods, hooks
- UPPER_SNAKE: constants, environment variables
- kebab-case: file names (non-component), CSS classes, URLs
