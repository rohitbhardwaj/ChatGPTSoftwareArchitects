# CLAUDE.md — Repository Architecture Guidance

## System Intent
[Describe what this repo owns and what it must not own.]

## Architecture Style
[Describe layers, allowed dependencies, and key boundaries.]

## Module Boundaries
- Controllers:
- Services:
- Repositories:
- External integrations:

## Data Ownership
[Identify authoritative data stores and cache-only stores.]

## Testing Expectations
[State what tests must exist before and after changes.]

## Security Rules
[State secrets, PII, payment, logging, and validation rules.]

## Observability Rules
[State logging, metrics, tracing, and correlation ID expectations.]

## Approval-Required Changes
Claude must stop and request approval before changing:
- authentication or authorization;
- payment behavior;
- database schema or migrations;
- public API contracts;
- dependencies;
- production deployment scripts;
- secret handling.

## Prohibited Patterns
[List anti-patterns Claude should avoid.]
