# Repo Discovery Solution

## Architecture Summary
The starter repo is a small Node/Express-style Order API. It contains controller, service, repository, payment, inventory, and test modules. The intended architecture is layered, but the current implementation mixes HTTP, validation, pricing, payment-sensitive logging, and business behavior.

## Evidence-Based Findings
| Finding | Evidence | Risk |
|---|---|---|
| Business logic in controller | orderController calculates discount and finalTotal | Controller becomes domain layer; harder to test and maintain |
| Sensitive logging | orderService logs full order payload including customerEmail and paymentToken | PII/token leakage risk |
| Weak tests | test covers only happy path | Green tests can hide behavior regressions |
| No explicit repo guidance | no CLAUDE.md | Claude may infer bad patterns from existing code |
| Payment is high-risk | paymentGateway charge is called from service | Payment changes require approval and idempotency review |

## Inferences
- The repo appears to intend a layered architecture, but no explicit rule enforces it.
- Payment retry/idempotency is not addressed and should not be changed in Act 4.

## Recommended Next Step
Create CLAUDE.md, add characterization tests, and move pricing validation out of the controller into OrderService only.
