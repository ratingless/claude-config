# Clean Code Patterns

## Function Design

- **Single Responsibility**: One function = one task
- **Max 3 parameters** — use options object for more
- **Early return** — avoid deep nesting (guard clauses)
- **Descriptive names** — `getUserById()` not `get()`
- **Pure functions preferred** — minimize side effects

## Error Handling

```typescript
// Bad: swallowing errors
try {
  doSomething();
} catch (e) {}

// Good: handle or rethrow
try {
  doSomething();
} catch (error) {
  logger.error("Operation failed", { error, context });
  throw new AppError("OPERATION_FAILED", error);
}
```

## DRY vs Premature Abstraction

- **Rule of 3**: Abstract only after 3 repetitions
- **Prefer duplication over wrong abstraction**
- Keep abstractions shallow (max 2-3 levels deep)

## Code Smells to Watch

- Functions longer than 30 lines
- More than 3 levels of nesting
- Boolean parameters (use enum or separate functions)
- God objects/files doing too many things
- Feature envy (method uses another object's data more than its own)

## Import Order

1. Node built-in modules
2. External packages (npm)
3. Internal modules (absolute paths)
4. Relative imports (parent → sibling → child)
5. Type-only imports
6. Style imports
