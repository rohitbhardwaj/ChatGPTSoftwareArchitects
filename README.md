# ChatGPT for Software Architects

A hands-on workshop for architects, senior developers, tech leads, and engineering leaders who want to use generative AI across the software architecture lifecycle — from discovering the right problem to designing, deciding, delegating, governing, and operating AI-assisted systems.

> **Think with AI. Design with evidence. Delegate with boundaries. Govern with architecture.**

## What You Will Learn

By the end of this workshop, you will be able to:

- Use ChatGPT as an architecture reasoning partner.
- Turn business goals and customer pain points into architecture-driving requirements.
- Derive functional requirements, NFRs, constraints, assumptions, and risks.
- Use AI for workload modeling, capacity reasoning, and failure analysis.
- Decompose systems into capabilities, services, data stores, and integration patterns.
- Evaluate alternatives using trade-offs, evidence, reversibility, and ADRs.
- Use Claude Code as a repo-aware engineering agent without giving up architecture control.
- Create `CLAUDE.md` guidance for repository-specific architecture rules.
- Apply plan-first, bounded, reviewable AI-assisted engineering workflows.
- Review AI-generated changes with **ARCH-GATE**.
- Design agent permissions with **ALLOW / ASK / DENY**.
- Threat-model MCP tools, prompt injection, secrets, and approval boundaries.
- Convert architecture decisions into fitness functions, CI gates, observability, and production feedback loops.
- Detect architecture drift and evolve architecture using production evidence.

## Workshop Backbone

| Act | Theme | Core Question | Typical AI Mode |
|---|---|---|---|
| **1 — THINK** | Discover the architecture problem | Are we solving the right problem? | ChatGPT |
| **2 — DESIGN** | Build the architecture | What system should exist? | ChatGPT |
| **3 — DECIDE** | Architecture decision intelligence | Why is this design appropriate? | ChatGPT |
| **4 — DELEGATE** | Claude Code architecture lab | How do we turn intent into repo-aware execution? | Claude Code |
| **5 — GOVERN** | Governed engineering | How do we safely constrain and review AI-generated change? | Claude Code + ChatGPT |
| **6 — OPERATE** | Architecture that learns | Is production validating or invalidating our architecture? | ChatGPT + Claude Code |

## Architecture Journey

```text
Business Problem
      ↓
Customer Journey
      ↓
Requirements + NFRs
      ↓
Workload + Constraints
      ↓
System Architecture
      ↓
Trade-offs + ADRs
      ↓
CLAUDE.md + Repository Rules
      ↓
Claude Code
      ↓
Tests + ARCH-GATE
      ↓
Permissions + MCP Governance
      ↓
Production Telemetry
      ↓
Architecture Fitness Functions
      ↓
Architecture Learning
```

## Key Frameworks

### Architecture Problem Brief
- Business outcomes
- Personas
- Customer journey
- Pain points
- Functional requirements
- NFRs
- Constraints
- Assumptions
- Unknowns
- Risks

### Architecture Decision Intelligence
- Architecture drivers
- Alternatives
- Evidence
- Assumptions
- Trade-offs
- Risk
- Reversibility
- Cost of being wrong
- Validation metrics
- Revisit triggers

### ARCH-GATE
- **A** — Architecture fit
- **R** — Risk and rollback
- **C** — Correctness
- **H** — Hidden coupling
- **G** — Guardrails and security
- **A** — Automated tests
- **T** — Traceability
- **E** — Evolution

### VIBE → GEAR

**VIBE Coding**
- Vague intent
- Instant generation
- Blind trust
- Entropy at scale

**GEAR Engineering**
- Guardrails
- Evaluation
- Architecture judgment
- Review discipline

## Hands-On Workshop Style

Every section follows:

```text
Concept
   ↓
Instructor Demo
   ↓
Hands-On Exercise
   ↓
Peer / Architecture Review
   ↓
Debrief
   ↓
Reusable Artifact
```

Participants work through an evolving system and produce artifacts such as:

- Architecture Problem Brief
- Customer Journey / Architecture Pressure Map
- Workload Model
- System Architecture
- Failure Model
- Decision Matrix
- ADR
- `CLAUDE.md`
- Governed Claude Code Prompt
- AI-Assisted PR / Change Plan
- ARCH-GATE Review
- Agent Governance Policy
- MCP Threat Model
- Architecture Fitness Functions
- Production Observability Plan
- Architecture Drift Review

## Who This Workshop Is For

- Software architects
- Solution architects
- Enterprise architects
- Staff / principal engineers
- Senior developers
- Tech leads
- Engineering managers
- AI platform engineers
- Developers moving toward architecture roles

## Recommended Prerequisites

- Basic software architecture knowledge
- Familiarity with APIs, databases, cloud systems, and distributed systems
- Basic Git / GitHub usage
- Ability to read application code
- ChatGPT access
- Claude Code access for repo-aware exercises

## Workshop Philosophy

1. **AI output is a proposal, not a decision.**
2. **Architecture judgment remains a human responsibility.**
3. **Prompt engineering is not enough; architects need context engineering and control engineering.**
4. **Architecture must become executable through rules, tests, permissions, and gates.**
5. **The more agency an AI system receives, the more explicit its boundaries must become.**
6. **Production evidence should challenge architecture assumptions.**
7. **The goal is not more AI-generated code. The goal is safer, faster, better engineering.**

## Responsible Use

Do not place production secrets, credentials, private keys, customer data, or confidential information into prompts or AI context.

For coding agents:
- prefer read-only discovery first;
- use plan-first prompts;
- keep changes small;
- review all generated changes;
- require human approval for high-risk areas.

See [`SECURITY.md`](SECURITY.md).

## Final Takeaway

> **Use ChatGPT to reason.  
> Use architecture to decide.  
> Use Claude Code to execute.  
> Use controls to govern.  
> Use production evidence to learn.**

The architect’s role is not disappearing. It is becoming more important because AI can now create architectural change at machine speed.
