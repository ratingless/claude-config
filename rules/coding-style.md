# Coding Style (Language-Agnostic)

## Universal Principles

- **Readability > Cleverness** — Code is read 10x more than written
- **Consistency** — Follow the existing codebase conventions first
- **Simplicity** — The simplest solution that works is the best solution

## Naming

- **Classes/Types**: PascalCase (`UserProfile`, `OrderService`)
- **Functions/Methods**: camelCase or snake_case (match language convention)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_BASE_URL`)
- **Booleans**: prefix with `is`, `has`, `can`, `should`
- **Handlers/Callbacks**: prefix with `handle`, `on` (`handleClick`, `onSubmit`)
- **Avoid**: single-letter names (except loops `i,j,k`), abbreviations, generic names (`data`, `temp`, `info`)

## Functions

- **Single Responsibility** — one function = one task
- **Max 3 positional parameters** — use options/struct/dict beyond that
- **Early return** — guard clauses instead of deep nesting
- **Pure functions preferred** — minimize side effects
- **Max 30 lines** — split if longer

## Error Handling

- **Never swallow errors silently** — at minimum log them
- **Fail fast** — validate inputs at boundaries, not deep inside
- **Specific exceptions** — catch specific errors, not generic `catch (e) {}`
- **Error messages** — include context (what failed, with what input, why)

## Code Organization

- **One concept per file** — don't mix unrelated logic
- **Co-locate related files** — tests next to source, styles next to component
- **Import order**: stdlib → external → internal → relative → types
- **No circular dependencies**
- **No dead code** — remove it, use version control instead

## Comments

- **Don't comment WHAT** — the code should be self-explanatory
- **Comment WHY** — explain non-obvious decisions
- **No commented-out code** — git history exists for a reason
- **TODO format**: `TODO(author): description` with context

## Language-Specific Conventions

- **TypeScript**: `any` forbidden → use `unknown` or specific types; `interface` for shapes, `type` for unions
- **Python**: PEP 8, type hints, f-strings, context managers for resources
- **Go**: gofmt, effective Go patterns, error wrapping with `fmt.Errorf`
- **Rust**: clippy lints, `Result<T, E>` for errors, avoid `unwrap()` in library code
- **Java/Kotlin**: follow language idioms, prefer immutable data
