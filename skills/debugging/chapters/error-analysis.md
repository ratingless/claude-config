# Error Analysis

## Error Types & First Actions

### TypeError / ReferenceError

- Check: is the variable defined? is it the right type?
- Common: accessing property of `null`/`undefined`
- Fix: add null checks, verify data shape, check import paths

### Network Errors (4xx, 5xx)

- 400: Check request body/params format
- 401/403: Check auth token, permissions, CORS
- 404: Check URL, route registration, API version
- 500: Check server logs, database connection, unhandled exceptions

### Build Errors

- TypeScript: Read the error message carefully — it usually tells you exactly what's wrong
- Module not found: Check import path, package installation, tsconfig paths
- Circular dependency: Use `madge --circular` to detect

### Runtime Errors

- State not updating: Check immutability (spread/new reference)
- Infinite loop: Check useEffect dependencies, recursive calls
- Memory leak: Check cleanup in useEffect, event listener removal

## Log Analysis

```bash
# Filter logs by severity
grep -i "error\|fatal\|exception" app.log

# Find first occurrence
grep -n "ERROR" app.log | head -5

# Trace a request ID
grep "req-12345" app.log
```

## Git Bisect for Regression

```bash
git bisect start
git bisect bad HEAD          # current is broken
git bisect good v1.2.0       # this version was fine
# Git will checkout middle commits — test each one
git bisect good/bad          # mark each as good or bad
git bisect reset             # when done
```
