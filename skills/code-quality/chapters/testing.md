# Testing Strategies

## Test Pyramid

1. **Unit tests** (70%): Fast, isolated, test one function/component
2. **Integration tests** (20%): Test module interactions
3. **E2E tests** (10%): Test critical user flows

## Naming Convention

```
describe('ComponentName')
  it('should render default state')
  it('should handle click event')
  it('should show error when validation fails')
```

Pattern: `should [expected behavior] when [condition]`

## Test Structure (AAA)

```typescript
it("should calculate total with discount", () => {
  // Arrange
  const items = [{ price: 100, qty: 2 }];
  const discount = 0.1;

  // Act
  const total = calculateTotal(items, discount);

  // Assert
  expect(total).toBe(180);
});
```

## What to Test

- **Happy path**: Normal expected behavior
- **Edge cases**: Empty input, null, boundary values, large data
- **Error cases**: Invalid input, network failures, timeouts
- **User interactions**: Click, type, submit, keyboard navigation

## What NOT to Test

- Implementation details (private methods, internal state)
- Third-party library internals
- Exact CSS values (test behavior, not pixels)
- Snapshot tests (too brittle — use explicit assertions)

## React Component Testing

```typescript
// Use Testing Library patterns
import { render, screen, fireEvent } from "@testing-library/react";

it("should show validation error", () => {
  render(<Form />);
  fireEvent.click(screen.getByRole("button", { name: /submit/i }));
  expect(screen.getByRole("alert")).toHaveTextContent("Required");
});
```

## Mocking Rules

- Mock at module boundaries (API calls, DB, file system)
- Never mock the unit under test
- Prefer dependency injection over module mocking
- Reset mocks between tests
