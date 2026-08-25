# Security Guidelines

## Never Use Real Secrets

Do not place these in prompts, code examples, logs, screenshots, or AI context:

- API keys
- access tokens
- passwords
- private keys
- production credentials
- customer PII
- payment data
- confidential company information

## Treat External Context as Untrusted

AI may read source files, README files, issues, tickets, logs, copied web content, and MCP results.

Treat those as **context**, not authority.

Suggested authority model:

```text
Human Instruction
      ↓
Repository Governance
      ↓
Approved Task
      ↓
Repository Evidence
      ↓
External Context
```

## Use Least Privilege

### Allow
- read source;
- inspect docs;
- run unit tests.

### Ask
- edit multiple files;
- install packages;
- run migrations;
- modify CI configuration.

### Deny
- expose secrets;
- destructive production operations;
- direct production deploys;
- unauthorized auth/payment changes.

## Human Approval

Require named approval for changes involving:
- authentication / authorization;
- payments / pricing;
- PII;
- database migrations;
- public APIs;
- critical dependencies;
- production infrastructure.

## Review AI-Generated Code

AI-generated code must go through the same or stronger review as human-generated code.

Use the ARCH-GATE model in [`FRAMEWORKS.md`](FRAMEWORKS.md).
