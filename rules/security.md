# Security Rules (All Languages)

## Protected Files (never modify automatically)

- `.env`, `.env.*` — environment secrets
- `*.pem`, `*.key`, `*.cert`, `*.p12` — certificates and keys
- `credentials.json`, `secrets.json`, `*.secret` — credentials
- Lock files — modify via package manager only:
  - JS: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
  - Python: `poetry.lock`, `Pipfile.lock`
  - Go: `go.sum`
  - Rust: `Cargo.lock`

## Dangerous Operations (require confirmation)

- `rm -rf` with broad paths
- `git push --force` / `git reset --hard`
- Database `DROP` / `TRUNCATE` / `DELETE` without WHERE
- `chmod -R 777` / `chown -R`
- Package publish (`npm publish`, `pip upload`, `cargo publish`)
- Infrastructure changes (`terraform apply`, `kubectl delete`)

## Secure Coding (OWASP Top 10)

- **Injection**: Parameterize all queries (SQL, NoSQL, LDAP, OS commands)
- **Auth**: Never store passwords in plain text; use bcrypt/argon2
- **Data Exposure**: Encrypt sensitive data at rest and in transit (HTTPS)
- **XXE**: Disable external entity processing in XML parsers
- **Access Control**: Check permissions on every request, not just UI
- **Misconfiguration**: No default credentials, no debug mode in production
- **XSS**: Escape/sanitize all user input before rendering
- **Deserialization**: Don't deserialize untrusted data
- **Dependencies**: Audit regularly (`npm audit`, `pip audit`, `cargo audit`)
- **Logging**: Log security events; never log secrets or PII

## Secrets Management

- Use environment variables or secret managers (Vault, AWS Secrets Manager)
- Never commit secrets — use `.env.example` templates
- Rotate secrets regularly
- Use different secrets per environment (dev/staging/prod)
