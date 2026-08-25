# Workshop Setup

## 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
```

## 2. Verify Git

```bash
git --version
```

## 3. Open the Repository

Use your preferred IDE or editor.

## 4. ChatGPT

Used primarily for:
- requirements and architecture reasoning;
- workload analysis;
- system design;
- trade-offs;
- ADRs;
- incident reasoning;
- architecture learning.

## 5. Claude Code

Used primarily for:
- repository analysis;
- dependency discovery;
- change planning;
- architecture katas;
- bounded refactoring;
- test generation;
- architecture drift analysis.

Use the official installation instructions for your environment.

## 6. Safety

Do not use:
- production repositories containing secrets;
- real customer data;
- private credentials;
- production tokens;
- unredacted sensitive logs.

## 7. Recommended Agent Workflow

```text
READ
  ↓
ANALYZE
  ↓
PLAN
  ↓
REVIEW
  ↓
APPROVE
  ↓
CHANGE
  ↓
TEST
  ↓
REVIEW AGAIN
```
