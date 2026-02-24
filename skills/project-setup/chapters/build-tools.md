# Build & Tools Configuration

## TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

## ESLint Setup

- Use `@typescript-eslint/parser`
- Enable rules: `no-unused-vars`, `no-explicit-any`, `prefer-const`
- Disable rules that conflict with Prettier

## Prettier Setup

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

## Husky + lint-staged

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,json,md}": "prettier --write"
  }
}
```

## Vite Configuration

- `resolve.alias` for `@/` imports
- `build.sourcemap` for debugging
- `define` for compile-time constants
- `server.proxy` for API proxy in development

## Monorepo Setup

- Use npm workspaces, pnpm workspaces, or turborepo
- Shared tsconfig: `tsconfig.base.json` with `extends`
- Shared eslint: root `.eslintrc` with workspace overrides
