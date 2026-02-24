# create-claude-config

Scaffold a production-grade `.claude/` directory for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with hooks, rules, skills, and agents.

## Quick Start

```bash
npx create-claude-config
```

Or with npm init:

```bash
npm init claude-config
```

## What's Included

### Hooks (9) — Automated Development Lifecycle

| Hook                     | Event                   | What It Does                                                       |
| ------------------------ | ----------------------- | ------------------------------------------------------------------ |
| smart-context-injector   | UserPromptSubmit        | Analyzes intent, domain, complexity, risk — injects relevant hints |
| guard-dangerous-commands | PreToolUse:Bash         | Blocks `rm -rf /`, `git push --force`, `DROP TABLE`, etc.          |
| guard-protected-files    | PreToolUse:Write\|Edit  | Protects .env, credentials, lock files + impact analysis           |
| post-edit-autoformat     | PostToolUse:Write\|Edit | Auto-runs prettier/eslint, tracks changes, detects quality issues  |
| post-bash-analyzer       | PostToolUse:Bash        | Detects test failures, build errors across JS/Python/Go/Rust/Java  |
| session-context-loader   | SessionStart            | Detects project stack (10+ languages), loads learned conventions   |
| project-profile-updater  | Stop                    | Accumulates project patterns across sessions                       |
| pre-compact-saver        | PreCompact              | Saves session state before context compression                     |
| idle-reminder            | Notification:idle       | Shows progress reminders during idle periods                       |

Plus **Stop prompt** (Definition of Done verification) and **SubagentStop prompt** (subagent completion check).

### Rules (7) — Universal Coding Standards

| Rule                  | Scope                                                      |
| --------------------- | ---------------------------------------------------------- |
| coding-style.md       | Naming, functions, error handling (TS/Python/Go/Rust/Java) |
| git-workflow.md       | Conventional commits, branch naming, verification          |
| security.md           | Protected files, OWASP Top 10, secrets management          |
| validation.md         | Pre-completion checks (type/test/lint/build)               |
| definition-of-done.md | 16 criteria by work type                                   |
| task-memory.md        | 3-document pattern for complex tasks                       |
| adr.md                | Architecture Decision Records                              |

### Skills (3) — On-Demand Knowledge

| Skill         | Chapters                         |
| ------------- | -------------------------------- |
| code-quality  | clean-code, testing, performance |
| debugging     | error-analysis, common-patterns  |
| project-setup | build-tools, ci-cd               |

### Agents (4) — Specialist Teammates

| Agent            | Role                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| code-reviewer    | 5-category code review (correctness, security, TS, perf, maintainability) |
| test-runner      | Auto-detect stack, run tests, fix failures                                |
| planner          | 3-document planning system (Plan, Context, Checklist)                     |
| security-auditor | OWASP Top 10, secrets detection, dependency audit                         |

## Options

```bash
npx create-claude-config              # Interactive setup
npx create-claude-config --force      # Overwrite without prompting
npx create-claude-config --update     # Update only new/changed files
npx create-claude-config --only hooks,rules  # Selective install
npx create-claude-config --dry-run    # Preview only
```

## Customization

### Add plugins (project-specific)

Edit `.claude/settings.json`:

```json
{
  "enabledPlugins": {
    "context7@claude-plugins-official": true,
    "typescript-lsp@claude-plugins-official": true
  }
}
```

### Override settings locally

Create `.claude/settings.local.json` (gitignored) for personal preferences.

### Customize rules

Edit any file in `.claude/rules/` to match your team's conventions.

### Add custom hooks

Add `.js` files to `.claude/hooks/` and register them in `settings.json`.

## Token Consumption

| Component       | Tokens      | When                                  |
| --------------- | ----------- | ------------------------------------- |
| Rules (7 files) | ~2,500      | Always loaded (1.25% of 200K context) |
| Hooks (9 files) | 0           | External Node.js process              |
| Skills          | ~1,000 each | On-demand only                        |
| Agents          | ~450 each   | When summoned                         |

## Updating

Re-run with `--update` to get new files without overwriting your customizations:

```bash
npx create-claude-config --update
```

## Requirements

- Node.js >= 18
- Claude Code CLI

## License

MIT
