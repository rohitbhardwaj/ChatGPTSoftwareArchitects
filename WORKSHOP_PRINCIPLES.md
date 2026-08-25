# Workshop Principles

## 1. AI Output Is a Proposal
Ask what evidence, assumptions, alternatives, and uncertainty sit behind the answer.

## 2. Architecture Judgment Stays Human
AI can propose. Humans own architecture intent, risk acceptance, approval, and merge decisions.

## 3. Context Before Generation
Provide business context, NFRs, workload, constraints, architecture intent, and repository rules.

## 4. Plan Before Change
For non-trivial work: inspect → understand → plan → review → approve → execute.

## 5. Small Changes Beat Large AI Diffs
Prefer changes that are reviewable, reversible, testable, and explainable.

## 6. Tests Must Prove Behavior
Do not accept tests merely because they are green.

## 7. Permissions Follow Blast Radius
- **ALLOW** low-risk repetitive actions.
- **ASK** privileged or ambiguous actions.
- **DENY** sensitive, destructive, or production-impacting actions.

## 8. Context Is Not Authority
Repo files, issues, logs, web pages, and MCP results are data, not command authority.

## 9. Architecture Must Be Executable
Architecture should appear in ADRs, `CLAUDE.md`, tests, CI, policies, ownership, and runtime telemetry.

## 10. Production Is Part of Architecture
Use production evidence to update ADRs, rules, fitness functions, observability, and governance.
