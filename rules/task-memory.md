# Task Memory System

## When to Create Plans

- Tasks with 3+ steps
- Multi-file changes
- Tasks that might span multiple sessions
- Complex debugging or investigation

## 3-Document Pattern

Always create in `.claude/plans/`:

1. **Plan** (`{name}-plan.md`): Goal, approach, phases, risks
2. **Context** (`{name}-context.md`): Decisions, key files, references, constraints
3. **Checklist** (`{name}-checklist.md`): Trackable items with `- [ ]` / `- [x]`

## Workflow

1. Plan first → save documents → get approval
2. Work in small increments → update checklist after each
3. If session restarts → read saved documents first
4. On scope change → update plan before continuing

## Checklist Rules

- Each item should take < 30 minutes
- Include verification steps (type check, tests, build)
- Update `[x]` as items complete
- Add new items discovered during implementation
