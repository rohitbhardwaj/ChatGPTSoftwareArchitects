# CLAUDE.md — ShopSmart Order API

## System Intent
This repository owns the Order API for ShopSmart. It validates order requests, coordinates order creation, checks inventory, and calls the payment gateway. It does not own product catalog, customer identity, inventory source of truth, fraud policy, or fulfillment.

## Architecture Style
Use a simple layered architecture:
HTTP controller -> application service -> repository/external integrations.
Controllers handle HTTP mapping only. They must not contain pricing, payment, inventory, or order business rules.

## Module Boundaries
- controllers: request/response mapping, status codes, input extraction.
- services: order validation, orchestration, idempotency expectations, business flow.
- repositories: persistence boundary only.
- payment: external payment boundary. Do not change behavior without approval.
- inventory: external inventory boundary. Treat as dependency that can fail or be stale.

## Testing Expectations
Before refactoring behavior, add characterization tests for current behavior. Tests must cover success path, validation errors, boundary cases, and failure paths. Do not weaken assertions to make generated code pass.

## Security Rules
Never log tokens, card data, customer PII, raw authorization headers, or secrets. Redact sensitive fields before logs. Do not read .env, print environment variables, or create secret-like test fixtures.

## Approval-Required Changes
Stop and request approval before changing authentication, authorization, payment behavior, public API contract, database schema, dependencies, production scripts, or retry/idempotency behavior.

## Prohibited Patterns
No business logic in controllers. No direct database access from controllers. No broad refactors without plan and approval. No new dependencies without approval. No payment retries without idempotency.
