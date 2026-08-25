# Example PR Summary Solution

## Summary
Moved order pricing validation and discount calculation out of orderController into OrderService. Controller now only maps HTTP request/response. Added characterization tests for happy path, invalid quantity, invalid price, and invalid discount code. Redacted sensitive order fields from service logs.

## Changed Files
- src/controllers/orderController.js
- src/services/orderService.js
- tests/orderService.test.js

## Architecture Impact
Improves layering by keeping business logic in OrderService. Does not change payment behavior or public API contract.

## Tests
Run: npm test
Expected: all tests pass.

## Risks
Discount rules are simplified for workshop purposes and should be aligned with real pricing policy before production.

## Rollback
Revert changed files. No migration, dependency, or deployment change required.
