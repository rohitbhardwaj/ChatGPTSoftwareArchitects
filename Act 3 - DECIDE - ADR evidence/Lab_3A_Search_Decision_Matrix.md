# Lab 3A — Search Architecture Decision Matrix

**Decision question:** How should ShopSmart search 50M products with lexical relevance, semantic matching, personalization, and P95 < 300 ms?

**Prompt used:** Compare BM25 only, vector KNN only, BM25 + vector, graph + hybrid, and hybrid + reranker. Evaluate using relevance, latency, freshness, cost, explainability, complexity, scale, and operational risk. Separate assumptions from evidence and identify what must be benchmarked.

## Scoring method
Each criterion is scored 1–5, where **5 is most favorable to ShopSmart's goals** — for Cost, Complexity, and Ops Risk, that means 5 = lowest cost/complexity/risk, not highest. Weights reflect what the decision question actually treats as hard vs. soft: Relevance 25%, Latency 20% (P95 < 300 ms is a stated hard constraint), Freshness 15%, Cost 10%, Explainability 10%, Complexity 10%, Ops Risk 10%.

**Scale (50M products)** doesn't get its own column below — the workspace table doesn't carry one — so it's folded into Latency, Complexity, and Ops Risk for each option, since at this size scale shows up as *how each option behaves under volume*, not as an independent axis.

## Lab 3A — Decision Matrix Workspace

| Option | Relevance | Latency | Freshness | Cost | Explainability | Complexity | Ops Risk | Weighted Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BM25 only | 2 | 5 | 5 | 5 | 5 | 5 | 5 | **4.25** |
| Vector KNN only | 3 | 3 | 2 | 2 | 2 | 2 | 2 | **2.45** |
| BM25 + vector | 4 | 3 | 3 | 3 | 3 | 3 | 3 | **3.25** |
| Graph + hybrid | 4 | 2 | 2 | 2 | 2 | 1 | 1 | **2.30** |
| Hybrid + reranker | 5 | 3 | 3 | 2 | 2 | 2 | 3 | **3.20** |
| **Your variant:** Tiered hybrid — BM25 + vector, reranker gated by query-confidence | 4 | 4 | 3 | 3 | 3 | 2 | 3 | **3.35** |

*Weighted total = Σ(score × weight), weights above. All scores below are assumptions unless marked EVIDENCE.*

## Per-option rationale

**BM25 only** — ASSUMPTION: strong lexical precision, but no semantic/synonym understanding and no built-in personalization; underperforms on conversational or vague queries. Inverted-index lookups and near-real-time segment refresh are EVIDENCE-backed at 50M-document scale (mature, widely deployed pattern in Elasticsearch/OpenSearch) — cheapest, fastest, simplest, most explainable, lowest ops risk of the set.

**Vector KNN only** — ASSUMPTION: good semantic/conceptual recall, but weak on exact-match queries (SKU, brand, model number) that commerce search depends on. ANN search (HNSW/IVF-PQ) at 50M vectors can hit P95 < 300 ms, but tail latency is far less predictable than an inverted index and degrades under concurrent reindexing — this latency claim needs benchmarking, not just literature. Embedding index updates are inherently more expensive than inverted-index updates, so freshness lags.

**BM25 + vector** — ASSUMPTION: combining both retrieval paths generally beats either alone for commerce queries (exact-match + semantic). Not scored higher on relevance because naive score fusion (weighted sum / RRF) between two different scales is imperfect without a learned reranking step. Latency, freshness, and complexity are all "blend of the two" — bounded by whichever path is slower/heavier.

**Graph + hybrid** — ASSUMPTION: co-purchase/taxonomy graph signals can meaningfully improve personalization and related-item relevance. But graph traversal at 50M-node+ scale combined with lexical+vector retrieval is the highest latency and complexity risk in the set, and graph edges are typically computed offline/batch, making this the least fresh option. Three distinct retrieval paradigms (lexical, vector, graph) to build and keep synchronized is the highest integration and operational risk here.

**Hybrid + reranker** — ASSUMPTION: retrieval (BM25 + vector) followed by a learned reranker (cross-encoder or LTR) over only the top-K candidates is the current best-practice pattern for this exact requirement set — personalization signals fit naturally as reranker features. Reranking only top-K (not the full corpus) is what keeps P95 < 300 ms achievable, but it leaves less latency margin than retrieval-only options, and the reranker itself is the least explainable component (black-box relative to term overlap or a simple fusion score).

**Your variant — tiered hybrid (reranker gated by query-confidence)** — ASSUMPTION: most queries (head/navigational, where BM25+vector fusion is already confident) skip the reranker entirely and run at retrieval-only latency; only ambiguous/long-tail queries pay the reranker's latency and cost. This targets the exact tension in the decision question — hybrid+reranker has the best relevance, but P95 < 300 ms is a hard constraint — by only spending the reranker's budget where it earns its keep. The added complexity is the confidence-gating mechanism itself, which is genuinely new work, not free.

## What must be benchmarked
Per the prompt's own instruction to separate assumptions from evidence, none of the Latency, Freshness, or Ops Risk scores above are grounded in ShopSmart's actual infrastructure — they're pattern-level industry assumptions. Before any of this becomes a recommendation with real weight behind it:
1. **P95 latency at 50M scale, under realistic concurrent load**, for: ANN retrieval alone (vector KNN, BM25+vector), and retrieval + reranker on top-K. This is the single highest-leverage benchmark — it directly tests the decision question's hard constraint.
2. **Embedding/index freshness lag** — actual time from an inventory/price update to that change being reflected in vector-index results, under production write volume.
3. **Reranker inference cost and latency** at the top-K size ShopSmart would actually use (e.g., top 50 vs. top 200), on real hardware — this materially changes both the Latency and Cost scores for hybrid+reranker and the tiered variant.
4. **Graph query latency** for the specific traversal patterns ShopSmart would need (co-purchase, substitution) at realistic node/edge counts — right now this score is closer to a guess than the others.
5. **Confidence-gate accuracy** for the tiered variant — what fraction of queries the gate correctly routes to retrieval-only vs. reranker, and what relevance is lost on misrouted queries.

## Architect check

**Which score is most subjective?** Explainability and Complexity. Neither has an objective, universal unit — "how explainable" depends on who's asking (a merchandiser debugging a ranking complaint has different needs than an engineer debugging a regression), and "how complex" depends heavily on the team's existing skills and tooling investment, not just the architecture itself. Latency and Freshness, by contrast, are the most objectively benchmarkable — they resolve to a number against a stated target.

**Which would change if benchmark data arrives?** Latency scores for Vector KNN, BM25+vector, Graph+hybrid, and Hybrid+reranker are all assumption-based estimates pulled from general ANN/reranker behavior, not ShopSmart-specific measurement — any of them could move once benchmarked, and Graph+hybrid's latency and ops-risk scores are the least certain of the set (graph traversal performance varies enormously by implementation choice, far more than inverted-index or ANN behavior does).

**The finding worth flagging explicitly:** on this weighting, BM25 only comes out on top (4.25) — but that's a weighting artifact, not a valid recommendation. Relevance is only 25% of the score, so an option that's cheap, fast, simple, and low-risk on every *other* axis can out-score options that actually satisfy the decision question. But the decision question isn't asking "what scores highest" — it's asking for semantic matching and personalization, which BM25 only architecturally cannot deliver at any relevance score. That's a hard gate, not a tradeable criterion, and a weighted-sum matrix will hide that distinction unless someone checks for it. The same logic knocks out Vector KNN only (fails on lexical precision, which commerce search also can't do without) and Graph + hybrid (real relevance upside, but latency/complexity/ops risk too far outside what a 300 ms hard constraint and a first production search architecture can absorb).

## Recommendation
Among options that actually satisfy the stated requirement (lexical + semantic + personalization, under a hard latency budget), **Hybrid + reranker** and the **tiered variant** are the real contenders (3.20 and 3.35). The tiered variant is the stronger starting recommendation: it keeps the reranker's relevance benefit where it matters, spends its latency/cost budget only on the queries that need it, and directly addresses the P95 constraint rather than assuming it away — but that recommendation is provisional on benchmark #1 (P95 latency under load) and #5 (confidence-gate accuracy) above. If those benchmarks show the confidence gate is unreliable or doesn't move the latency needle enough to matter, plain Hybrid + reranker with ADR-001's stated fallback rule (degrade to BM25 + vector under reranker overload, rather than failing the request) is the fallback recommendation.

## Conditions that would change this recommendation
- If benchmarked reranker latency at realistic top-K blows the 300 ms P95 budget even for a minority of queries, the tiered variant's confidence gate becomes load-bearing rather than optional — or the reranker candidate set needs to shrink further.
- If ShopSmart's catalog skews heavily toward exact-match/navigational queries (SKU, brand, model lookups), BM25 + vector without a reranker may already be "good enough," and the reranker's added cost/complexity may not be justified — this is itself a benchmarkable/measurable question (query-log analysis), not an assumption to leave unexamined.
- If graph-based relationship data (co-purchase, substitution) turns out to already exist and be cheap to query (e.g., precomputed and cached rather than live-traversed), Graph + hybrid's latency and complexity scores would need to be revisited — the scores above assume live traversal, which is the worst case, not the only possible implementation.
