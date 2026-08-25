# CLAUDE.md — ShopSmart Order API

Use layered architecture: controller -> service -> repository/integration. Controllers handle HTTP only. Business rules belong in services/domain. Do not add dependencies without approval. Do not change payment behavior, public API contracts, schemas, or auth without explicit approval. Never log payment tokens, card data, customer PII, raw authorization headers, or secrets. Add characterization tests before refactoring behavior.
