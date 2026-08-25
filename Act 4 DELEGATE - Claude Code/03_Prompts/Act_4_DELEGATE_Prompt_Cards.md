# Act 4 Prompt Cards — DELEGATE

## 4A — Read-only repository discovery
```text
Analyze this repository. Do not modify files.
Produce:
1. architecture summary;
2. major modules and dependencies;
3. boundary violations;
4. testing gaps;
5. security-sensitive areas;
6. top architecture risks;
7. evidence vs inference for every major conclusion.
```

## 4B — CLAUDE.md critique
```text
Review this CLAUDE.md. Identify vague rules that cannot be objectively reviewed. Rewrite them as actionable repository guidance. Keep the file concise.
```

## 4C — Governed refactoring prompt
```text
Analyze OrderService and orderController first. Do not modify files.
Identify responsibilities, coupling, architecture violations, public behavior, current tests, and risks.
Propose the smallest refactoring sequence to move pricing validation out of the controller into OrderService.
Preserve API behavior. Do not add dependencies. Add characterization tests before changing behavior.
List impacted files. Wait for approval before editing.
```

## 4D — Evidence request after change
```text
Summarize the change as a PR-ready report:
- changed files;
- architecture impact;
- behavior preserved;
- tests added or updated;
- risks and rollback;
- what was intentionally not changed.
```

## Debrief prompt
```text
What did AI do well? What did it miss? What architecture judgment did the human provide? What should become an explicit CLAUDE.md rule?
```
