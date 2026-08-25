# Exercise 4B — CLAUDE.md for the ShopSmart Order API

This is the CLAUDE.md drafted for the Act 4 starter repo, grounded directly in the boundary violations, security gaps, and test gaps found during Exercise 4A's read-only discovery. It also lives at [`06_Starter_Repo/CLAUDE.md`](06_Starter_Repo/CLAUDE.md) — the location where it actually takes effect for future AI-assisted changes to that repo. This copy is kept here as the reviewable exercise deliverable.

---

## System Intent
This repo owns **order creation**: validating cart items, computing pricing and discounts, checking inventory availability, capturing payment, and persisting the resulting order.

It must **not** own: product catalog/search, customer account management, fulfillment/shipping, or the payment provider's own authorization/settlement logic — `paymentGateway.js` is a boundary to that system, not a reimplementation of it.

## Architecture Style
- Layering: `orderController.js` → `orderService.js` → `orderRepository.js` / `paymentGateway.js` / `inventoryClient.js`.
- **Controllers map HTTP only.** No pricing, discount, or validation logic belongs in `orderController.js`. If business logic shows up there, that's drift — move it into `orderService.js` rather than duplicating it in both places.
- **`orderService.js` owns all order validation, pricing, and orchestration.** It must not trust a client-supplied `subtotal`, `discount`, or `total` — these are always computed server-side from `items`.
- **`paymentGateway.js` and `inventoryClient.js` are external boundaries.** Treat their current interfaces (`charge({ token, amount })`, `checkAvailability(sku, quantity)`) as contracts. Callers outside `orderService.js` must not reach into them directly.
- No new inbound edges (e.g., a controller calling a repository or gateway directly) and no cycles between modules.

## Testing Expectations
- Before refactoring any existing behavior, add a **characterization test** that captures current behavior first — including edge cases like an unrecognized discount code, zero/negative quantity or price, and empty items — so the refactor can't silently change behavior unnoticed.
- Any change touching `orderController.js` or `orderService.js` must be covered by tests for: the happy path, every controller-level 400 validation branch, and the service-level failure paths (`inventoryClient` reporting unavailable, `paymentGateway` throwing).
- A suite that only proves the happy path is not sufficient to merge a change to pricing, validation, or payment/inventory calls.
- If a PR changes an **existing** test's expected value (not just adds a new one), the PR description must explain what behavior changed and why — don't quietly edit a test to match new output.

## Security Rules
- Never log `paymentToken`, `customerEmail`, card data, or any other PII/credential — not even partially, not even at debug level. Log order id, item count, and computed totals instead.
- Payment tokens must never be persisted to `orderRepository.js` or echoed back in an API response.
- Treat everything in `req.body` as untrusted. Pricing (`subtotal`, `discount`, `total`) must always be recomputed server-side from `items` in `orderService.js` — never accepted as client input and trusted as-is.
- No new third-party dependency may be added without explicit approval.

## Approval Gates
Stop and request explicit human approval before making any of these changes — do not proceed autonomously:
- Anything affecting `paymentGateway.js`'s behavior, its charge contract, or how/when payment is captured.
- Adding or changing authentication or authorization (none exists today — adding it is itself an approval-gated decision, not a silent default).
- The public API contract for order creation: request/response shape, status codes, or existing error messages.
- Any schema or persistence-model change, even though `orderRepository.js` is in-memory today.
- Adding, removing, or upgrading any dependency in `package.json`.
- Any production deployment or CI/CD pipeline change.

---

## Why each rule is there
Every rule above traces to a specific finding from Exercise 4A, not a generic best practice:
- **Controllers map HTTP only** — directly targets the discount/subtotal logic found sitting in `orderController.js:6-25`.
- **Never trust client-supplied totals** — closes the price-tampering surface found in `orderService.js:21-27`, where `subtotal`/`discount`/`total` were accepted as raw pass-through input.
- **Never log PII/credentials** — targets the exact defect found (and self-flagged) at `orderService.js:6-7`, logging `customerEmail` and `paymentToken` in plaintext.
- **Characterization tests before refactoring, and failure-path coverage** — closes the gap found in §6 of the discovery report: one happy-path test, nothing exercising the controller or the failure branches.
- **Payment/auth/schema/API/dependency approval gates** — carried forward unchanged from the original workshop constraints, now made explicit and enforceable in the repo itself rather than living only in a facilitator's exercise brief.
