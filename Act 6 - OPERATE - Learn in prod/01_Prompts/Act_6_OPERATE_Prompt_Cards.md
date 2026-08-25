# Act 6 OPERATE - Prompt Cards

## Prompt 1 - Fitness functions from ADRs
Act as a principal software architect. Convert the following ADRs and CLAUDE.md rules into architecture fitness functions. For each one, classify the check as static analysis, unit test, integration test, contract test, CI policy, runtime metric, or human approval gate. Include evidence, failure action, severity, and owner.

## Prompt 2 - Observability for AI-native architecture
Design an operating dashboard for this architecture. Include user experience metrics, platform/SRE metrics, AI-agent metrics, business metrics, and architecture-validity metrics. For each metric, define target/alert threshold and the architecture question it answers.

## Prompt 3 - Claude Code drift analysis
Compare this repository against ADR-001, ADR-002, and CLAUDE.md. Do not modify files. Identify architecture drift. For each finding, show evidence, severity, operational risk, and recommended action: fix code, update ADR, add test, add CI gate, or update CLAUDE.md.

## Prompt 4 - Incident learning
Act as incident commander and software architect. Given the following production signals, propose immediate stabilization, near-term remediation, and long-term architecture updates. Then identify one ADR update, one new architecture fitness function, one dashboard metric, and one CLAUDE.md rule.

## Prompt 5 - Challenge the learning
Critique the proposed incident learning. Identify which actions are tactical workarounds, which are true architecture improvements, which require human approval, and which need evidence before becoming policy.
