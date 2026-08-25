# CLAUDE.md - ShopSmart Architecture Rules

## System intent
ShopSmart supports product search, checkout, order creation, payment, and fulfillment.

## Boundaries
- Controllers must not contain pricing or domain rules.
- Domain logic must not depend on infrastructure.
- Redis is cache-only and must not be authoritative for order or payment state.

## Payment
- Payment operations must be idempotent.
- Payment retry behavior requires plan-first review and payment-owner approval.

## Security
- Do not log PII, tokens, or payment identifiers.
