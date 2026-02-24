# Common Bug Patterns

## React-Specific

| Symptom                     | Likely Cause                   | Fix                         |
| --------------------------- | ------------------------------ | --------------------------- |
| Component doesn't re-render | State mutated directly         | Use spread/new reference    |
| Stale closure in callback   | Missing useEffect dependency   | Add to dependency array     |
| Infinite re-render loop     | Object/array in useEffect deps | useMemo the value           |
| Event handler fires twice   | React StrictMode double-render | Normal in dev, ignore       |
| State update on unmounted   | Missing cleanup                | Return cleanup in useEffect |

## API / Backend

| Symptom            | Likely Cause              | Fix                                |
| ------------------ | ------------------------- | ---------------------------------- |
| CORS error         | Missing CORS config       | Add origin to allowed list         |
| 401 on valid token | Token expired             | Implement refresh token flow       |
| Slow query         | Missing index             | Add database index                 |
| Duplicate records  | Missing unique constraint | Add UNIQUE index                   |
| Race condition     | Concurrent writes         | Use transaction or optimistic lock |

## CSS / Layout

| Symptom                       | Likely Cause                | Fix                       |
| ----------------------------- | --------------------------- | ------------------------- |
| Overflow hidden clips content | Parent has overflow:hidden  | Find and fix ancestor     |
| z-index not working           | Missing positioning context | Add position: relative    |
| Flexbox item won't shrink     | min-width defaults to auto  | Set min-width: 0          |
| Grid item overflows           | Implicit sizing             | Use minmax(0, 1fr)        |
| Scrollbar appears randomly    | Content slightly exceeds    | Check box-sizing, padding |

## TypeScript

| Symptom                    | Likely Cause          | Fix                              |
| -------------------------- | --------------------- | -------------------------------- |
| Type 'X' is not assignable | Shape mismatch        | Check optional vs required props |
| Cannot find module         | Missing types package | Install @types/package           |
| Excessive type assertion   | Wrong generic         | Fix the source type              |
| Union type narrowing fails | Missing discriminant  | Add type/kind field              |
