# Act 2 DESIGN - Prompt Cards

## 2A - Workload Model
Act as a software architect. Using the scenario and these assumptions, calculate average and peak search QPS, order volume, inventory event pressure, storage implications, bandwidth assumptions, and architecture pressure points. Keep assumptions separate from calculations.

Assumptions: 50M monthly users; 5M daily active users; peak multiplier 5x; 20 searches/user/day; 50M SKUs; 100K inventory updates/sec peak.

## 2A - Assumption Critique
Review your workload model. Which assumptions are most uncertain? Which values would change the architecture if wrong by 10x? Which numbers require real measurement instead of reasoning?

## 2B - Capability Decomposition
From the problem brief and customer journey, derive business capabilities. For each capability, evaluate data ownership, transaction boundary, scale pattern, failure isolation, team ownership, and change frequency. Classify each as: module now, separate service now, separate service later, or external dependency.

## 2B - Boundary Challenge
Challenge your own boundary proposal. Which capability did you over-split? Which did you under-split? What should stay together because it changes together?

## 2C - Architecture v1 Generation
Using our problem brief, workload model, and capability map, propose a high-level architecture. Include components, data stores, sync/async flows, AI-native components, and major integration points.

## 2C - Architecture Review Board
Act as a principal architecture review board. Review the design for scale, consistency, latency, failure, security, cost, operability, and team ownership. Do not be polite. Identify top weaknesses and assumptions.

## 2D - Failure Simulation
Simulate this failure through the architecture: [insert failure]. Show propagation path, affected users, data impact, downstream effects, monitoring symptoms, business impact, and design changes needed to degrade safely.

## 2D - Design Improvement
Revise the architecture to address the failure. Consider timeout, retry, idempotency, cache fallback, queue, DLQ, circuit breaker, fallback UX, observability, and operational runbooks. Show the trade-off introduced by each change.

## Act 3 Handoff
Based on this architecture v1 and failure model, identify the top architecture decisions that require formal ADRs. For each decision, list alternatives, evaluation criteria, risks, and what evidence we need.
