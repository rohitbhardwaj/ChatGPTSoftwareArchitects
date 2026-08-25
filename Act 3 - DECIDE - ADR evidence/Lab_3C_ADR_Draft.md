# Lab 3C — ADR Draft

Drafted from Lab 3B's recommendation (order datastore, not search architecture) — this is the decision with the most riding on it being both correct and *enforced*, since Act 6's drift assessment later finds exactly the failure mode this ADR exists to prevent.

---

## Title
**ADR-002: PostgreSQL as the Authoritative Order State Store**

## Status
Accepted

## Context
ShopSmart's order management system must guarantee that order status, payment linkage, and fulfillment state are never ambiguous — a customer, a support agent, and an automated recovery process must always see the same answer to "is this order paid and confirmed." The platform is entering a period of rapid growth, with Black-Friday-class traffic spikes anticipated. One authoritative datastore for order state must be chosen now, before order volume and downstream integrations make switching costly. Three datastore families were evaluated in Lab 3B — PostgreSQL, DynamoDB, Cassandra — plus a variant combining PostgreSQL with a non-authoritative cache.

## Architecture Drivers
- **Business outcome:** no customer-visible order/payment inconsistency — no double charge, no "lost" order, no conflicting status shown to different systems.
- **Functional requirement:** atomic multi-entity writes across order header, line items, inventory reservation, and payment reference at creation time; point lookup by order id; range query by customer; ad hoc reporting/finance queries.
- **NFRs:** strong consistency for order/payment state (not eventual); recoverability with a clear, provable RPO/RTO; write throughput sufficient for realistic peak order-creation rate (a materially different scale problem than product-search read volume); operability by the existing team without a large new skill investment.
- **Constraints:** no new dependency without approval; the decision must be made before production order volume accumulates, since it becomes progressively harder to reverse over time.
- **Assumptions:** order-creation write volume is meaningfully lower cardinality than product-search read volume; the team's existing skill base is predominantly relational/SQL. Neither has been benchmarked yet — see Metrics / Validation.

## Options Considered
1. **PostgreSQL** — full ACID, multi-table transactions, mature recovery tooling, broadest team skill; write-throughput ceiling is real but likely sufficient at order-write scale.
2. **DynamoDB** — excellent managed horizontal throughput and low ops complexity, but multi-entity transactional integrity requires access-pattern-first single-table modeling — a real new skill; ad hoc reporting queries fight the access-pattern-locked schema.
3. **Cassandra** — best raw write throughput, but built for availability over strict consistency; lightweight transactions are narrow and costly; highest operational burden and lowest team familiarity.
4. **PostgreSQL + non-authoritative cache** (e.g., Redis) for read-heavy order-status traffic — same transactional core as option 1, with read scaling handled by a cache explicitly forbidden from being a second source of truth.

## Decision
Adopt **PostgreSQL as the sole authoritative datastore for order state.** A cache (e.g., Redis) may be introduced later to serve read-heavy order-status views, but it **must never become the source of truth for order recovery, payment state, or fulfillment state** — a cache read is a hint, not a guarantee, and any code path responsible for recovering or confirming order/payment state must resolve against PostgreSQL.

## Rationale
Order management's dominant requirement is correctness, not raw horizontal write throughput — the cost of an inconsistent order/payment record is far higher than the cost of provisioning more PostgreSQL capacity. PostgreSQL's ACID guarantees map directly onto the actual write shape (order + line items + inventory + payment reference, atomically); its query flexibility matches the mixed access-pattern needs (point lookup, range query, ad hoc reporting) better than either NoSQL option; and it's the lowest-risk choice for a team with predominantly relational skills. Cassandra is eliminated because its consistency model works against, not with, this requirement. DynamoDB is eliminated primarily on access-pattern fit and team-skill risk, not throughput, which is genuinely excellent — if ShopSmart's needs shift toward extreme, unpredictable horizontal write volume with simple, known-upfront access patterns, this decision should be revisited.

## Consequences

### Positive
- Every order-state read — support tooling, recovery jobs, fulfillment triggers — has one unambiguous, transactionally-consistent answer.
- Existing team skill applies directly; no new hiring/training risk to ship this decision.
- Mature recovery tooling (WAL-based PITR, replication) gives a well-understood RPO/RTO story.

### Negative
- Single-primary write scaling is a real ceiling; sustained extreme write volume would eventually require read replicas, connection-pooling discipline, and possibly a sharding strategy.
- Introduces an ongoing discipline requirement: if a cache is added for read scaling, the boundary — cache is never truth — must be enforced continuously, not just decided once.

### Trade-offs accepted
We are explicitly trading DynamoDB's/Cassandra's superior raw horizontal write throughput for PostgreSQL's transactional integrity and query flexibility — judged correct because order data's correctness requirements dominate over its volume characteristics.

## Risks and Mitigations
- **Risk:** write-throughput ceiling exceeded under peak load. **Mitigation:** benchmark realistic peak order-creation rate before it becomes a production incident; add read replicas ahead of need; document a scale-out plan as a next step, not an emergency response.
- **Risk (the one most likely to actually happen):** a future cache layer silently becomes authoritative in practice even though this ADR forbids it in principle. **Mitigation:** this ADR's rule must be encoded as an enforceable CLAUDE.md rule and a CI/runtime fitness function — not left as a document only.
- **Risk:** schema evolution introduces downtime or data-integrity risk as migration practice matures. **Mitigation:** schema changes remain an approval-gated, reviewed action, with a defined migration/rollback process per change.

## Rollback Strategy
This decision is comparatively reversible today, before production order-history data and downstream integrations accumulate against it. Because no order data yet exists at ADR-acceptance time, the near-term rollback path is simply: stop using PostgreSQL for new order writes and adopt a replacement before meaningful data accumulates — no in-place migration of live transactional data is anticipated at this stage. Once production data exists, this shifts to a **Type 1 (hard-to-reverse)** decision requiring a planned migration project, not a deployment rollback.

## Metrics / Validation
- Order-creation P95/P99 write latency under realistic and peak (12x-forecast-class) load, tracked against a defined SLO.
- **Zero** occurrences of order-state divergence between any cache layer and PostgreSQL — this ADR is considered "working" only if this stays at zero in production, not just at review time.
- Recovery-drill success: periodic restore-from-backup exercises meeting the defined RPO/RTO.
- No customer-reported duplicate-charge or lost-order incidents attributable to datastore inconsistency.

## Revisit Trigger
- Benchmarked peak order-creation throughput approaches or exceeds what read replicas plus reasonable vertical scaling can sustain.
- ShopSmart adopts a genuine multi-region active-active requirement for order writes, and the business is willing to accept eventual consistency for order/payment data as a deliberate trade-off.
- **Any production incident where a cache layer is found serving as a de facto source of truth for order/payment/fulfillment state** — at that point this ADR's *enforcement*, not its content, has failed and needs remediation.

## Implementation Rules for Act 4
What this ADR becomes as `CLAUDE.md` guidance:
- Redis (or any cache) is cache-only and must not be authoritative for order or payment state.
- Any function responsible for recovering order status must read from PostgreSQL, never exclusively from a cache.
- Any write to order/payment status must go to PostgreSQL first (or as the only write-of-record); a cache may be updated afterward, never instead.
- Schema or migration changes to the order datastore require explicit human approval before merge.
- A CI or runtime fitness function must exist to detect an authoritative-write-to-cache without a corresponding database write — the enforcement mechanism that turns this ADR from a document into a control, not just advice on file.

*Note for continuity: this is the same ADR-002 that appears later in the workshop's Act 6 drift repo, where `orderService.js` is found violating this exact rule — writing order status only to Redis, with no PostgreSQL fallback. That finding is the direct, concrete argument for the last bullet above: a decision written down but not enforced in code and CI is a decision that can — and did — drift.*
