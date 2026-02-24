# Architecture Decision Records (ADR)

## When to Create an ADR

- Choosing a new library or framework
- Changing database schema significantly
- Modifying authentication/authorization flow
- Restructuring project layout
- Adding new microservice or module boundary
- Any decision that would be hard to reverse

## ADR Format

Save in `.claude/plans/adr/` or project docs:

```markdown
# ADR-{number}: {Title}

## Status

Proposed | Accepted | Deprecated | Superseded by ADR-{N}

## Context

What is the problem or situation that requires a decision?

## Decision

What is the change we are making?

## Consequences

### Positive

- What becomes easier or better?

### Negative

- What becomes harder or worse?

### Neutral

- What else changes that isn't clearly positive or negative?
```

## Rules

- Number ADRs sequentially (ADR-001, ADR-002, ...)
- Never delete ADRs — mark as "Deprecated" or "Superseded"
- Include "Context" even if it seems obvious now — it won't be in 6 months
- Keep them short (1 page max)
- Reference related ADRs when decisions interact
