# Lab 6D — Incident Learning Exercise

**Note on ownership:** this document structures the response using ChatGPT/Claude as drafting support; the architecture decisions below (ADR update, new rules, long-term changes) are proposals for the architect to own and approve, not autonomous changes.

## Incident summary
Black Friday event drove traffic to 12x forecast against ShopSmart. Four symptoms surfaced together: search P95 latency rose to 1.8s, inventory data went 8 minutes stale, payment timeouts increased, and the AI shopping agent's tool retries spiked. Lab 6C's drift assessment traced the underlying causes to pre-existing architecture violations — Redis treated as authoritative for order state, pricing logic embedded in the controller, PII in logs, and payment retries with no idempotency key — that were dormant at normal traffic and only became consequential at 12x volume with rising timeout rates.

## Immediate stabilization (0–30 min)
Contain financial and data-integrity risk; do not attempt architecture redesign mid-incident.
1. **Payment** — circuit-break/halt automatic payment retries at the service or gateway level. `paymentService.js` retries without an idempotency key, so every retry during a timeout spike is a live duplicate-charge risk; queue failed charges for manual reconciliation instead of auto-retrying blind.
2. **Order state** — treat any order status that exists only in Redis as at-risk. If Redis memory pressure/eviction is a factor at 12x traffic, temporarily raise capacity or adjust eviction policy purely to avoid losing in-flight order state — a stopgap, not a fix; the real fix is Postgres becoming the write-of-record.
3. **Search** — force the reranker off via feature flag/config, routing all traffic to BM25+vector-only. No automatic fallback exists in code (per Lab 6C's ADR-001 scope note), so this has to be done manually; accept lower relevance to protect latency and availability.
4. **Agent** — cap the shopping agent's tool retry count, add backoff, and temporarily narrow its auto-approved action scope (more ASK-gated, fewer autonomous actions) so agent retries stop compounding load on the already-strained payment and inventory paths.
5. **Comms** — declare the incident and page the payment-owner immediately; CLAUDE.md already requires payment-owner involvement for any retry-behavior change, so they need to be in the incident channel from minute zero, not brought in only for the eventual fix.

## Architecture assumption that failed
The assumption that broke wasn't a capacity assumption — it was **"the documented boundaries are true because they're written down."** Redis-is-cache-only, controllers-don't-own-pricing, and payment-is-idempotent were all already false in the code before Black Friday (Lab 6C). They simply weren't load-bearing enough to matter until 12x traffic and rising timeouts turned dormant drift into simultaneous financial and data-integrity exposure. The root failure is that nothing enforced the ADRs/CLAUDE.md at merge time or at runtime — drift accumulated silently.

## Near-term remediation (1 week)
Fix the Lab 6C findings through the normal governed-PR / ARCH-GATE process (Act 5), not as emergency patches:
1. Move order-status writes to Postgres as the write-of-record; Redis becomes a cache refreshed after the DB write; `recoverOrder` reads from Postgres. Replace the placeholder test with a real contract test proving recovery survives Redis being empty or stale.
2. Extract pricing/discount calculation out of `checkoutController.js` into a domain function; add unit tests, including a cap/abuse guard for promo coupons like `BLACKFRIDAY`.
3. Remove `customerEmail`/`address` from the checkout log line; log order/session id only.
4. Add a stable idempotency key to `paymentService.charge`, with payment-owner review per CLAUDE.md, plus a contract test asserting retries reuse the same key.
5. Land the CI gates already scoped in Lab 6A for all four findings (Redis-write-without-DB-write check, PII-log scanner, controller-pricing-pattern check, idempotency-key contract test) so this class of drift can't merge silently again.
6. Decide explicitly on ADR-001's fallback path: either build the reranker→BM25 fallback for real, or amend the ADR to reflect that it doesn't exist yet — right now it's documented but unimplemented, which is its own drift.

## Long-term architecture change
1. **Enforce fitness functions in CI, not just document them** — the five Lab 6A fitness functions become blocking checks on any PR touching `src/controllers`, `src/services`, or `src/payment*`, so drift is caught at merge time instead of during a peak-traffic incident.
2. **Load-test architecture invariants, not just throughput** — pre-event testing should inject the specific failure modes that mattered here: Redis eviction during order writes, payment-provider timeouts (to prove idempotency actually holds under retry), and reranker degradation. Raw load testing alone didn't surface any of these four defects until they were live.

## ADR update
No ADR was wrong — Lab 6C's conclusion holds: this was an enforcement gap, not a decision gap. Append an implementation note to **ADR-002**: *"2026-08-25 incident: `orderService.js` was found writing order status directly to Redis only, violating this ADR. Remediated via [PR link]; a CI fitness-function gate now enforces this decision."* ADRs should carry a living record of drift-and-remediation so the next reviewer sees this already happened once, rather than re-discovering it.

## New fitness function
Beyond the five in Lab 6A: **"A payment-provider timeout injected in a chaos/load test must not result in more than one settled charge per order."** This goes further than "idempotency key present" (Lab 6A row 5) by verifying the outcome — no double charge — under an actual simulated timeout, not just that a key is passed on the call. Check type: chaos/integration test, run as part of the pre-event load-test gate, not only at unit level.

## New dashboard metric
Add to the **Architecture validity** layer (Lab 6B): **"Time from fitness-function-detectable violation to remediation."** This closes the loop this incident exposed — five real violations sat in production undetected until a live traffic event surfaced them. Target: once the Lab 6A/6D gates exist, new drift is caught within one PR cycle, not by the next incident.

## New CLAUDE.md rule
**"Any code path handling order state, payment, or checkout must carry an automated test that fails if the corresponding ADR or this file's rule is violated (authoritative-store bypass, missing idempotency key, PII in logs). A PR touching these paths without such a test is blocked from merge, not merely flagged."** This directly closes finding 5 from Lab 6C — a placeholder test (`expect(true).toBe(true)`) was allowed to exist and "pass" while protecting the wrong behavior. Making test-existence itself an enforced, mergeable-or-not rule — not a best practice — is what prevents that from recurring.
