# Performance Optimization

## General Principles

- **Measure before optimizing** — use profiling tools, not intuition
- **Optimize the bottleneck** — 80/20 rule applies
- **Avoid premature optimization** — make it work, make it right, then make it fast

## Frontend Performance

### Bundle Size

- Dynamic import for routes: `React.lazy(() => import('./Page'))`
- Tree-shake: use named exports, avoid barrel files for large modules
- Analyze: `npx vite-bundle-visualizer` or `webpack-bundle-analyzer`

### Rendering

- `React.memo()` for expensive pure components
- `useMemo/useCallback` only when profiling shows re-render issues
- Virtualize long lists (react-window, react-virtuoso)
- `contain: layout style paint` for CSS render isolation
- `content-visibility: auto` for off-screen content

### Images & Assets

- Use `loading="lazy"` and `decoding="async"` on images
- Serve WebP/AVIF with fallbacks
- Set explicit `width` and `height` to prevent layout shifts

## Backend Performance

### Database

- Index frequently queried columns
- Use `SELECT` only needed columns (not `*`)
- Paginate results (cursor-based for large datasets)
- Use connection pooling
- Cache hot data (Redis, in-memory)

### API Design

- Batch endpoints to reduce round trips
- Use compression (gzip/brotli)
- Set proper Cache-Control headers
- Implement rate limiting

## CSS Performance

- Avoid expensive selectors (deep nesting, universal `*`)
- Prefer `transform` and `opacity` for animations (GPU-accelerated)
- Use `will-change` sparingly and only when measured
- `prefers-reduced-motion` for accessibility
