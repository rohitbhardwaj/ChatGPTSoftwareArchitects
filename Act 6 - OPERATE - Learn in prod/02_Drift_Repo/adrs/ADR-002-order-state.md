# ADR-002 Order State Source of Truth

## Decision
PostgreSQL is authoritative for order state. Redis may cache order views but must never become the source of truth for order recovery, payment state, or fulfillment state.
