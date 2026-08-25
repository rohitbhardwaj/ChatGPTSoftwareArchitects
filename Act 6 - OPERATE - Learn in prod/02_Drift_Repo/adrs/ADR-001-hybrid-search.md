# ADR-001 Hybrid Search

## Decision
Use BM25 + vector retrieval + reranking for product search.

## Operating rule
The reranker is allowed to degrade under overload. Search should fall back to BM25 + vector retrieval rather than failing the user journey.
