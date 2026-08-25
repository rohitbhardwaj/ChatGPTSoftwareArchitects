# Lab 3B — Order Datastore Trade-off

**Decision question:** Choose the authoritative datastore for order management.

**Prompt used:** Compare PostgreSQL, DynamoDB, and Cassandra for order management. Evaluate transactions, consistency, access patterns, write throughput, recovery, cost, team skills, and reversibility. Recommend an option, but include assumptions, risks, and conditions that would change the recommendation.

## Scoring method
Cells are scored 1–5, 5 = most favorable to ShopSmart's goals — for Ops Complexity, 5 = lowest complexity. The workspace table doesn't carry separate Access Patterns, Cost, or Reversibility columns, so those three are addressed in their own section below rather than squeezed into cells that don't fit them well.

## Lab 3B — Decision Matrix Workspace

| Option | Transactions | Consistency | Throughput | Ops Complexity | Recovery | Team Skills | Decision Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| PostgreSQL | 5 | 5 | 3 | 3 | 5 | 5 | Full ACID across order/line-item/payment in one transaction; write ceiling is real but likely sufficient for order volume specifically (not search-scale). |
| DynamoDB | 3 | 4 | 5 | 5 | 4 | 2 | Excellent managed throughput, but multi-entity transactional integrity requires deliberate single-table design, not something the engine gives you by default. |
| Cassandra | 1 | 2 | 5 | 1 | 2 | 1 | Built for availability over strict consistency — philosophically the worst fit for data that must never be "eventually" correct about payment status. |
| **Other:** PostgreSQL (authoritative) + Redis as a strictly non-authoritative read cache for order-status views | 5 | 5 | 4 | 3 | 5 | 4 | Same transactional core as plain PostgreSQL, with read-heavy traffic (status polling) absorbed by a cache — but only works if the cache boundary is actually enforced, not just decided. |

*All scores below are assumptions unless marked EVIDENCE — none are benchmarked against ShopSmart's actual infrastructure yet.*

## Per-option rationale

**PostgreSQL** — ASSUMPTION: full ACID and multi-table transactions are exactly what order creation needs — a single atomic write spanning the order header, line items, inventory reservation, and payment reference. Vertical scaling plus read replicas handle most realistic order-volume workloads; this is *not* the same scale problem as Lab 3A's 50M-product search, since order writes are naturally much lower cardinality than search reads. SQL/relational skill is the most broadly held datastore skill in most engineering orgs, which lowers hiring and onboarding risk. The real limitation is single-primary write scaling under extreme, unpredictable horizontal load — a legitimate ceiling, not a myth, but one that should be benchmarked against realistic peak before being treated as disqualifying.

**DynamoDB** — ASSUMPTION: near-unlimited, fully managed horizontal write throughput with no cluster operations — DynamoDB's core strength. Transactions exist (up to 100 items per transaction) but require access-pattern-first, single-table data modeling to get relational-feeling integrity; this is a genuinely different design discipline from PostgreSQL, not just a different query language, and a team without prior DynamoDB experience faces a real learning curve. Ad hoc reporting/support queries ("all orders over $X this week") fight against DynamoDB's access-pattern-locked schema design.

**Cassandra** — ASSUMPTION: purpose-built for very high append-heavy write throughput (its classic use case is event/time-series ingestion), which is real and genuine — but its lightweight transactions (Paxos-based LWT) are expensive, single-partition-scoped, and not designed for the multi-entity atomic write order creation needs. Cassandra's default posture is availability over strict consistency; achieving strong consistency means paying a latency/availability cost on every operation, working against the grain of the system rather than with it. Highest operational burden of the three (ring topology, compaction tuning, repair operations) and the least commonly held team skill.

**Other — PostgreSQL + bounded Redis cache** — ASSUMPTION: this is the strongest option on paper because it keeps PostgreSQL as the transactional source of truth while letting a cache absorb read-heavy traffic like order-status polling, without touching the write path's integrity at all. The catch, stated plainly: this only works if the boundary — Redis is a cache, never the source of truth for order recovery, payment state, or fulfillment state — is actually enforced in code and CI, not merely decided in this document. It is entirely possible to make this exact decision and have it silently fail in implementation.

## Access patterns, cost, and reversibility (not columns above)

**Access patterns:** order management needs a point lookup by order id (very common — support, status pages), a range query by customer, atomic status updates that must be consistent with concurrent reads, and ad hoc reporting/finance queries. This mix — point lookups *and* range queries *and* unpredictable reporting queries — favors a system with real query flexibility (SQL) over a design where every access pattern must be pre-modeled into the schema (DynamoDB) or worked around with secondary indexes/materialized views (Cassandra).

**Cost:** PostgreSQL (self-managed or RDS/Aurora) is typically the lowest predictable baseline cost at moderate order volume — no premium NoSQL managed-service margin. DynamoDB's pay-per-request model can be cost-effective at spiky, unpredictable volume, but needs real capacity planning at sustained high throughput; it does remove ops-labor cost. Cassandra's "cheap open-source database" reputation is offset by real operational staffing cost — its total cost of ownership is usually the highest of the three once self-managed operational expertise is priced in.

**Reversibility:** covered properly in the next exercise (3B — Reversibility Review), but briefly: choosing PostgreSQL now is relatively low-regret while the system is young — before order-history data and downstream integrations accumulate against it. It becomes progressively harder to reverse (a Type 1, hard-to-reverse decision) the longer it's in production with real transactional data behind it.

## Recommendation
**PostgreSQL, as the authoritative datastore for order state**, with any read-scaling need (e.g., high-volume status-check traffic) met by a cache layer that is explicitly, architecturally forbidden from becoming a second source of truth. Order management's dominant requirement is correctness — no double charge, no lost order, referential integrity between order/payment/inventory — not raw horizontal write throughput at search-scale volume. That requirement points at strong transactional guarantees over eventual consistency, which rules out Cassandra outright and makes DynamoDB a worse fit than its throughput numbers alone would suggest.

## Risks
- **Write-scaling ceiling:** if ShopSmart's order-creation rate under real peak load (see Act 6's 12x-traffic Black Friday scenario) exceeds what vertical scaling + read replicas can sustain, this decision needs revisiting — but that should be established by benchmarking actual peak throughput, not assumed away or assumed to be a problem preemptively.
- **Schema-change discipline:** PostgreSQL's integrity guarantees are only as good as migration discipline — this is exactly why schema changes are already an approval-gated action in this workshop's CLAUDE.md rules.
- **The cache-boundary risk is the real one to watch:** if a Redis-style cache is added for read scaling, "Redis is cache-only" has to be enforced, not just decided. This isn't hypothetical for this exact scenario — it's what actually happens later: Act 6's drift assessment found `orderService.js` writing order status *only* to Redis, with `recoverOrder` reading *only* from Redis, exactly the violation this decision is meant to prevent. The lesson from that finding applies here directly — write this decision down as an ADR, but also turn it into a fitness-function/CI check (as Lab 6A does), because the document alone did not stop the drift.

## Conditions that would change this recommendation
- If ShopSmart genuinely needed multi-region, active-active order writes and was willing to accept eventual consistency for order data as a deliberate business trade-off (not an accident), Cassandra or DynamoDB Global Tables would become the stronger technical fit — but that's a business decision about acceptable risk to financial data, not a purely technical one, and would need to be made explicitly.
- If benchmarking (per the same discipline used in Lab 3A) showed PostgreSQL genuinely could not sustain realistic peak order-creation throughput even with read replicas and reasonable vertical scaling, that's the trigger to reconsider — but it should be measured, not assumed, before giving up transactional integrity to get there.
- If the team's actual skill composition turned out to be NoSQL-heavy with limited relational database experience, the Team Skills score could tip toward DynamoDB — this should be assessed honestly against the real team, not assumed from a generic industry baseline.
