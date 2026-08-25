# Act 3 DECIDE - Prompt Cards

## 3A - Search Decision Matrix
Act as a principal software architect. For ShopSmart, compare search architecture options for 50M products with lexical relevance, semantic matching, personalization, inventory freshness, and P95 search latency below 300 ms.

Options: BM25 only; vector KNN only; BM25 + vector; graph + hybrid; hybrid + reranker.

Evaluate using relevance, latency, freshness, cost, explainability, complexity, scalability, and operational risk. Produce a weighted matrix. Keep assumptions separate from evidence.

## 3A - Score Challenge
Challenge your own decision matrix. Which scores are subjective? Which require benchmarking? Which assumption, if wrong by 10x, would change the recommendation?

## 3B - Datastore Trade-off
Compare PostgreSQL, DynamoDB, and Cassandra for order management. Evaluate transactions, consistency, access patterns, write throughput, recovery, cost, team skills, and reversibility. Recommend an option, but state assumptions, risks, and conditions that would change the recommendation.

## 3B - Reversibility Review
For this datastore decision, classify it as Type 1 or Type 2. Explain the cost of being wrong, migration difficulty, rollback path, and validation steps before full commitment.

## 3C - ADR Draft
Create an ADR for the selected architecture decision. Include status, context, architecture drivers, options considered, decision, consequences, risks, rollback strategy, metrics, and revisit trigger. Keep it concise and defensible.

## 3D - Adversarial Review Board
Act as an architecture review board. Reject this ADR unless the evidence is sufficient. Identify weak assumptions, hidden costs, missing stakeholders, reversibility issues, operational risks, and required validation. Recommend approve, revise, spike/benchmark, or reject.

## 3E - Act 4 Rule Extraction
From this ADR, extract architecture rules that should become CLAUDE.md guidance for a repository. Include boundaries, prohibited patterns, test expectations, approval-required changes, and observability requirements.
