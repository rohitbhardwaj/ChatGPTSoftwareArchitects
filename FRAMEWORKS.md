# Workshop Frameworks

## THINK → DESIGN → DECIDE → DELEGATE → GOVERN → OPERATE

This is the workshop lifecycle.

## Architecture Problem Brief

```text
Business Outcomes
Personas
Customer Journey
Pain Points
Functional Requirements
Non-Functional Requirements
Constraints
Assumptions
Unknowns
Risks
```

## Architecture Decision Intelligence

```text
Decision
Alternatives
Architecture Drivers
Evidence
Assumptions
Trade-offs
Risk
Reversibility
Cost of Being Wrong
Validation Metrics
Revisit Triggers
```

## Architecture Control Plane

```text
Human Architecture Judgment
          ↓
Architecture Intent
          ↓
+----------------------------+
| Architecture Control Plane |
| CLAUDE.md                  |
| Repository Rules           |
| Permissions                |
| Security Policy            |
| Tests                      |
| Quality Gates              |
| Review Workflow            |
| Observability              |
+----------------------------+
          ↓
AI-Assisted Engineering
```

## ARCH-GATE

```text
A — Architecture fit
R — Risk and rollback
C — Correctness
H — Hidden coupling
G — Guardrails and security
A — Automated tests
T — Traceability
E — Evolution
```

## Agent Permission Model

### ALLOW
Read source, inspect docs, run unit tests, run formatters.

### ASK
Edit multiple files, install dependencies, run migrations, change build configuration, create PRs.

### DENY
Read secrets, print environment credentials, delete production data, deploy production, independently modify critical auth/payment behavior.

## Continuous Architecture Loop

```text
Architecture Intent
       ↓
Implementation
       ↓
Production
       ↓
Observability
       ↓
Evidence
       ↓
Architecture Review
       ↓
Code Change or ADR Update
       ↓
Fitness Functions / Rules
```
