---
name: debugging
description: Systematic debugging methodology. Error analysis, root cause identification, fix verification. Auto-loaded when investigating bugs, errors, or unexpected behavior.
---

# Debugging Manual

## Table of Contents

- Error Analysis: [chapters/error-analysis.md](chapters/error-analysis.md)
- Common Patterns: [chapters/common-patterns.md](chapters/common-patterns.md)

## Debugging Workflow (always follow)

### Step 1: Reproduce

- Get exact steps to reproduce
- Note: which environment? which browser? which input?
- If intermittent, identify frequency and conditions

### Step 2: Isolate

- Narrow down: which file? which function? which line?
- Use binary search: comment out half the code
- Check git blame for recent changes to suspect area

### Step 3: Understand

- Read the code around the bug — don't guess
- Check types, null checks, edge cases
- Trace data flow: where does the input come from?

### Step 4: Fix

- Fix the root cause, not the symptom
- Minimal change — don't refactor while fixing
- Add a test that would have caught this bug

### Step 5: Verify

- Run the test suite
- Manually verify the original reproduction steps
- Check for regressions in related functionality
