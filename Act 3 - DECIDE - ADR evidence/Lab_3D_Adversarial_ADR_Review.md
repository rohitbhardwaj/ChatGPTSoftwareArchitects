# Lab 3D — Adversarial ADR Review

**Reviewing:** [ADR-002 — PostgreSQL as the Authoritative Order State Store](Lab_3C_ADR_Draft.md)
**Review posture:** Acting as an architecture review board. This ADR is rejected unless the evidence presented is sufficient — the board is not evaluating whether the decision is *plausible*, only whether it is *proven enough to accept*.

## Findings

| Issue found | Severity | Evidence needed | ADR change |
|---|---|---|---|
| Peak order-creation throughput is asserted as "likely sufficient" but never benchmarked — the entire recommendation rests on an untested number. | **Critical** | A load test of realistic peak order-creation TPS (Black-Friday-class, 12x forecast) against the actual provisioned PostgreSQL configuration, with measured P95/P99 write latency. | Move Status from Accepted back to Proposed until this benchmark runs; add concrete target numbers to Metrics / Validation instead of "sufficient." |
| The cache-boundary fitness function — named as the primary control against the ADR's single biggest risk — has no owner, timeline, or acceptance criteria. A sentence saying it "must exist" is not a commitment. | **Critical** | A tracked ticket with a named owner and ship date, completed *before* any cache layer is introduced — not a line in a risk table. | Convert the mitigation from prose into a tracked, owned action item that gates the introduction of any cache; reference its ticket id directly in the ADR. |
| No stakeholder confirms what payment-related fields this datastore stores, or whether that brings it into PCI scope. The datastore holds a payment reference but the ADR never addresses this. | **Critical** | Written sign-off from the payment-owner/security team on exactly what payment data lives here and its compliance scope. | Add a named "Payment & Security sign-off" stakeholder line; state explicitly what payment data is and is not stored. |
| "Reversible today" is asserted with no concrete checkpoint — no stated volume or date threshold at which the decision stops being cheaply reversible. | **High** | A specific, falsifiable criterion (e.g., "reversible without a migration project until N production orders exist," or "only before GA launch on [date]"). | Replace the vague reversibility claim in Rollback Strategy with an explicit, measurable checkpoint. |
| No cost model exists — "PostgreSQL is the lowest predictable baseline cost" carries over from Lab 3B as a qualitative claim, with no instance sizing, replica count, or volume-scaled comparison. | **High** | A FinOps-reviewed cost projection for PostgreSQL (HA configuration) vs. DynamoDB at current, 3x, and 12x-peak volume, amortized annually. | Add a real Cost section with numbers before acceptance; name a finance/FinOps reviewer. |
| RPO/RTO are called "well-understood" but no target numbers or tested failover time are given — this is asserted maturity, not demonstrated maturity. | **High** | A disaster-recovery drill result: measured failover time and data-loss window under the actual chosen HA configuration. | Add explicit RPO/RTO targets to Metrics / Validation, backed by a drill result, not an assumption. |
| No graceful-degradation story exists for order writes if PostgreSQL saturates under a real spike. ADR-001 gives search an explicit "allowed to degrade" rule; this ADR has no equivalent for order writes under overload. | **High** | A defined behavior for order-write overload (queue-and-retry with idempotency, bounded 503 with retry guidance, etc.) — currently undefined. | Add an "Overload behavior" subsection defining what happens to an order-creation request when PostgreSQL saturates. |
| "Team's skill base is predominantly relational/SQL" is asserted, not verified against the actual team roster or hiring plan. | **Medium** | A short skills inventory of the engineers who will operate this system, or confirmation from engineering management. | Cite the source of this claim, or move it to Assumptions explicitly pending confirmation. |
| No SRE/on-call owner is named for the operational commitment (HA failover, backups, capacity planning) this decision creates. | **Medium** | A named accountable owner/team, confirmed by that team, not just implied by "the team." | Add an "Owner" field alongside Status. |
| The ADR names a hypothetical future "multi-region active-active" revisit trigger but never states ShopSmart's *current* region topology — the baseline the trigger is meant to diverge from is undefined. | **Medium** | A statement of current and near-term planned region strategy from platform/infrastructure. | Add a line to Context stating current region topology. |

## Board Recommendation

**Spike/Benchmark, then Revise.** Not a flat reject, and not an approve-as-is.

The board is not disputing the *direction* of the decision — PostgreSQL's transactional guarantees are a genuinely better fit than Cassandra's or DynamoDB's for order data where correctness dominates over raw throughput, and that reasoning holds up under scrutiny. What fails scrutiny is the **evidence backing three specific claims the whole decision leans on**: that PostgreSQL throughput is "likely sufficient" at peak, that the decision is "reversible today," and that the cache-boundary risk — already flagged in the ADR itself as the most likely failure mode — is actually mitigated rather than just named. All three are asserted, not demonstrated, and two of them (throughput, cache-boundary enforcement) are exactly the kind of gap that turns into a real production incident rather than staying theoretical — which is precisely what later happens in this workshop's own Act 6 material.

**Before re-review, the ADR needs:**
1. A completed load-test benchmark against realistic peak order-creation volume, with real numbers in Metrics / Validation instead of "sufficient."
2. A tracked, owned ticket for the cache-boundary fitness function, completed before any cache is introduced — not a sentence in a risk table.
3. Payment/security sign-off on what data this store actually holds.

**What does not need to change:** the core decision (PostgreSQL, cache non-authoritative by design), the elimination of Cassandra, and the overall structure of the ADR. This is a request for evidence and ownership, not a request to re-open the decision itself.
