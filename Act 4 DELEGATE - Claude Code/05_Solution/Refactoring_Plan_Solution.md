# Refactoring Plan Solution

## Scope
Move pricing and discount validation from orderController to OrderService. Preserve API behavior and status codes.

## Impacted Files
- src/controllers/orderController.js
- src/services/orderService.js
- tests/orderService.test.js

## Steps
1. Add characterization tests for existing success and validation behavior.
2. Move discount calculation into OrderService.calculateFinalTotal.
3. Keep controller limited to extracting request body and mapping service output to HTTP response.
4. Redact sensitive fields before logging.
5. Run tests.

## Out of Scope
- Payment retry behavior.
- Database schema.
- New dependencies.
- Public API contract changes.
- Authentication or authorization.

## Risks
- Existing tests may not fully capture current behavior.
- Discount logic may require product/pricing domain rules not present in starter repo.

## Rollback
Revert the three changed files. No schema or dependency change is required.
