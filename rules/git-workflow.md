# Git Workflow (All Projects)

## Commit Message Format

```
type(scope): short description (imperative mood)

Optional body explaining what and why (not how).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## Types

- `feat`: New feature or functionality
- `fix`: Bug fix
- `refactor`: Code restructuring (no behavior change)
- `test`: Adding or updating tests
- `chore`: Build, config, dependency updates
- `docs`: Documentation changes
- `perf`: Performance improvement
- `style`: Formatting, whitespace (no logic change)
- `ci`: CI/CD pipeline changes

## Scope

Use the most relevant module name (e.g., `auth`, `api`, `ui`, `db`, `cli`, `core`).

## Rules

- **Verify before commit** — type check + lint must pass
- **Never commit secrets** — `.env`, credentials, API keys, private keys
- **Never force push** to main/master/develop
- **Atomic commits** — one logical change per commit
- **Meaningful messages** — not "fix stuff", "update", "WIP"
- **Small PRs** — easier to review, easier to rollback
- **Rebase over merge** for feature branches (cleaner history)

## Branch Naming

```
feat/short-description
fix/issue-number-description
refactor/what-is-changing
chore/dependency-update
```
