# Exercise 4A — Read-Only Repository Discovery Report
https://claude.ai/code/artifact/f1f4fabd-1713-4cc9-9c2f-a9672f900e37?via=auto_preview


Produced via Exercise 4A (read-only repository discovery). No files were modified, no commands with side effects were run, no dependencies installed. Findings below are each labeled EVIDENCE (directly observed in the file) or INFERENCE (reasoned conclusion not literally stated in code).

## 1. Runtime Purpose
- EVIDENCE: A Node.js (CommonJS) service exposing order creation for an e-commerce platform — `package.json` names it `shopsmart-order-api-starter` (package.json:1).
- EVIDENCE: The only functional flow is "create an order": validate items → check inventory → charge payment → persist order → return confirmation (src/controllers/orderController.js, src/services/orderService.js).
- INFERENCE: This is a deliberately trimmed teaching fixture, not a deployable API — there's no HTTP server bootstrap file (no `app.js`/`server.js`/`index.js`), no route wiring, and no framework dependency in `package.json` (`dependencies: {}`). `req`/`res` in the controller imply an Express-style handler, but nothing invokes it.

## 2. Module Map
| Module | Role | Evidence |
|---|---|---|
| src/controllers/orderController.js | HTTP-facing handler for `createOrder` | EVIDENCE — exports `createOrder(req, res)` |
| src/services/orderService.js | Orchestrates inventory check, payment, persistence | EVIDENCE — exports `createOrder(orderInput)` |
| src/repositories/orderRepository.js | In-memory persistence stub | EVIDENCE — `save()` mutates a module-level counter, no DB |
| src/payment/paymentGateway.js | External payment boundary stub | EVIDENCE — `charge()` returns a fake `pay_<timestamp>` id |
| src/inventory/inventoryClient.js | External inventory boundary stub | EVIDENCE — `checkAvailability()` is a truthy check, no real lookup |
| tests/orderService.test.js | Single happy-path test | EVIDENCE — one `assert`-based script, no test framework |

## 3. Dependency Relationships
- EVIDENCE: `orderController.js` → `orderService.js` (src/controllers/orderController.js:1).
- EVIDENCE: `orderService.js` → `orderRepository.js`, `paymentGateway.js`, `inventoryClient.js` (src/services/orderService.js:1-3).
- EVIDENCE: `orderRepository.js`, `paymentGateway.js`, `inventoryClient.js` have no further internal dependencies — they're leaf modules.
- EVIDENCE: `package.json` declares zero runtime or dev dependencies — everything is hand-rolled, including the test runner (`node tests/orderService.test.js`).
- INFERENCE: The dependency graph is a clean, acyclic layered shape on paper (controller → service → boundaries), but the controller's own logic breaks that separation in practice (see §4).

## 4. Architecture Boundary Violations
- EVIDENCE: Business logic (subtotal computation, quantity/price validation, discount code `SAVE10` at 10%) lives in the controller, not `OrderService` — src/controllers/orderController.js:6-25. This directly violates the stated boundary "Controllers should only map HTTP requests/responses" / "OrderService owns order validation and orchestration."
- EVIDENCE: Validation is duplicated across layers — the controller validates `items`, `quantity`, `price` (src/controllers/orderController.js:7-18), while `orderService.createOrder` does no input validation of its own before calling external boundaries (src/services/orderService.js:5-14), meaning if `orderService` is ever called directly (as the test does), none of the controller's guarantees apply.
- EVIDENCE: `orderService.js` re-derives a subset of the order object rather than trusting a validated domain model — it accepts `subtotal`/`discount`/`total` as raw pass-through input from the caller (src/services/orderService.js:21-27) with no re-verification, so a caller bypassing the controller can submit an arbitrary `total` disconnected from `items`.
- INFERENCE: This makes `OrderService` not actually the owner of validation despite the stated architecture rule — it's an orchestrator that trusts pre-computed pricing fields handed to it.

## 5. Public Behavior
- EVIDENCE: `createOrder(req, res)` (controller) — on success, returns HTTP 201 with the order object `{ id, total, status: 'CONFIRMED' }` (src/controllers/orderController.js:27-36, src/services/orderService.js:30).
- EVIDENCE: Returns HTTP 400 with `{ error: 'Order must contain at least one item' }`, `{ error: 'Invalid quantity' }`, or `{ error: 'Invalid price' }` for the respective invalid inputs (src/controllers/orderController.js:7-18).
- EVIDENCE: A `discountCode` of exactly `SAVE10` applies a 10% discount to subtotal (src/controllers/orderController.js:22-25); any other value (including case variants) is ignored.
- EVIDENCE: `orderService.createOrder` throws an uncaught `Error` (unhandled by the controller) if any item is unavailable (src/services/orderService.js:9-13) or if `paymentGateway.charge` rejects due to missing token/non-positive amount (src/payment/paymentGateway.js:2-3) — the controller has no try/catch, so these become unhandled promise rejections rather than structured HTTP error responses.
- INFERENCE: Because thrown errors aren't caught anywhere in the request path, a real deployment would either crash the process or return a generic 500 with no client-facing message — behavior that isn't itself specified anywhere.

## 6. Tests and Coverage Gaps
- EVIDENCE: The entire test suite is one script, one assertion path: happy-path order creation with valid, pre-computed totals (tests/orderService.test.js).
- EVIDENCE: No test exercises `orderController.js` at all — none of the validation branches (empty items, bad quantity, bad price, discount logic) are covered.
- EVIDENCE: No test exercises failure paths in `orderService.js` — unavailable inventory, payment failure/missing token, or `total` mismatched from `items`.
- EVIDENCE: No test framework/runner is used (no Jest/Mocha in `package.json`); `npm test` just executes the script directly and relies on `assert` throwing to fail — no test isolation, no mocking of `paymentGateway`/`inventoryClient`, so tests exercise the real stub implementations.
- INFERENCE: Given the stubs are side-effect-free and deterministic, this "works" today, but it means there's no way to simulate/verify real failure modes (declined payment, out-of-stock, network errors) since the boundary modules aren't designed for injection/mocking.

## 7. Security-Sensitive Areas
- EVIDENCE: `orderService.js` logs the entire `orderInput` object — including `customerEmail` and `paymentToken` — via `console.log('Creating order', orderInput)` (src/services/orderService.js:6-7). This is explicitly flagged in-code as a "Security smell" and would leak PII and a raw payment credential into logs.
- EVIDENCE: `paymentGateway.charge` is a stub that does no real authentication, signature verification, or idempotency handling — it accepts any non-empty token and positive amount and always returns `CAPTURED` (src/payment/paymentGateway.js:1-5). This is a stated external boundary (`PaymentGateway`) and per the operating rules, any change here requires explicit human approval.
- EVIDENCE: `orderRepository.js` stores orders only in process memory (`nextId` module variable, no DB) (src/repositories/orderRepository.js:1-5) — no persistence, no encryption at rest, data lost on restart.
- EVIDENCE: There is no authentication/authorization check anywhere in the controller or service — `createOrder` trusts `req.body` unconditionally.
- INFERENCE: Because `total` is client-supplied and never re-validated against `items` server-side (see §4), a malicious client could submit a `total` lower than the true subtotal and have `paymentGateway.charge` capture the reduced amount — a price-tampering vector.

## 8. Top Architecture Risks
1. **Business logic misplaced in the controller** (src/controllers/orderController.js:6-25) — violates the stated OrderService/controller boundary; any direct caller of `orderService.createOrder` (like the existing test) bypasses all pricing/quantity validation. EVIDENCE.
2. **Client-controlled pricing with no server-side recomputation/verification** in `orderService.js` — enables total/price tampering. EVIDENCE + INFERENCE (risk implication).
3. **Sensitive data logged in plaintext** (`paymentToken`, `customerEmail`) at src/services/orderService.js:7 — a compliance and credential-leak risk, already self-flagged in a comment. EVIDENCE.
4. **Unhandled errors crossing the payment/inventory boundary** — `orderService.createOrder` throws raw `Error`s with no catch in the controller, so failures don't map to controlled HTTP responses. EVIDENCE.
5. **Near-zero automated test coverage** — one happy-path script, no coverage of validation, discount, or failure branches, and no framework to build on. EVIDENCE.
6. **No repository-level AI/agent guidance (no CLAUDE.md)** — confirmed absent from the file listing; without it, boundary rules (approval-required areas, no-new-dependency rule) aren't enforced or discoverable by an AI collaborator, only by this out-of-band exercise prompt. EVIDENCE (absence) + INFERENCE (consequence).

---

Next step per the exercise goal: draft a `CLAUDE.md` that encodes the stated boundaries (OrderService owns validation, controllers map HTTP only, payment/auth/schema/public-API changes need approval, no new dependencies).
