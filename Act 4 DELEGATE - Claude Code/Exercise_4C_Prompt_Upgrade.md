# Exercise 4C — Prompt Upgrade

## Weak prompt
> "Clean up OrderService and make it better."

**Why it fails:** no scope (which files? how much is "clean up"?), no constraint against modifying files before review, no mention of preserving the existing API contract, no requirement for tests before behavior changes, and no approval gate — it hands an agent free rein to change anything, including the payment-boundary and public-behavior areas that `CLAUDE.md` explicitly requires human approval for.

## Governed prompt

> Analyze `orderController.js` and `orderService.js` in this repo. **Do not modify any files.**
>
> Identify:
> 1. The current responsibilities of each file, and where they overlap.
> 2. The coupling between the controller and the service — what each currently depends on, and any logic duplicated across both.
> 3. Architecture violations against `CLAUDE.md` (controllers must map HTTP only; `OrderService` owns validation, pricing, and orchestration; `paymentGateway`/`inventoryClient` are external boundaries).
> 4. The current public API behavior of order creation that must not change: status codes, response shape, and existing validation error messages — including edge cases like an unrecognized discount code.
> 5. What `tests/orderService.test.js` actually covers today, and what characterization tests are missing before any refactor.
> 6. Security-sensitive risks in the current code — any logging of `customerEmail`, `paymentToken`, or other PII/credentials, and any place a client-supplied price or total is trusted without server-side recomputation.
>
> Propose the smallest refactoring sequence that moves pricing, discount, and validation logic out of `orderController.js` and into `orderService.js`, without changing anything else.
>
> Constraints:
> - Preserve the existing public API behavior and status codes exactly, including current edge-case behavior. If you believe a behavior should change, flag it as a separate, explicitly-approved decision — do not fold a behavior change into a "cleanup" refactor.
> - Do not add, remove, or upgrade any dependency.
> - Do not change `paymentGateway.js`'s or `inventoryClient.js`'s interface.
> - Add a characterization test for current behavior — including empty items, invalid quantity, invalid price, and an unrecognized discount code — before making any change that could alter it.
> - Never log `customerEmail`, `paymentToken`, or any other PII/credential in new or changed code.
> - List every file you intend to touch, then stop. Wait for explicit approval before editing anything.

## How the governed prompt applies the pattern

| Pattern step | Where it appears above |
|---|---|
| Analyze first. Do not modify files. | Opening line, stated before any other instruction. |
| Identify responsibilities, coupling, architecture violations, public behavior, current tests, and risks. | Enumerated as six explicit, file-specific questions (items 1–6) instead of one vague "clean up." |
| Propose the smallest refactoring sequence. | Scoped to one concrete move — pricing/discount/validation logic out of the controller — not an open-ended "make it better." |
| Preserve API behavior and do not add dependencies. | Stated as hard constraints, with the unrecognized-discount-code edge case called out by name so it can't be silently changed and mistaken for cleanup. |
| Add characterization tests before changing behavior. | Required explicitly, with the specific edge cases the analysis in Exercise 4A already found were untested. |
| List impacted files and wait for approval. | Closing instruction — nothing proceeds without an explicit stop-and-list step. |

## What this closes, specifically
Every constraint traces back to a real finding from Exercise 4A/4B, not a generic caution:
- The API-behavior-preservation constraint exists because `orderController.js` currently ignores unrecognized discount codes silently — a "cleanup" that quietly started rejecting them would be a public API break disguised as refactoring.
- The characterization-test requirement exists because the discovery report found zero coverage of the controller's validation branches or the service's failure paths.
- The no-PII-logging constraint exists because `orderService.js` was found logging `customerEmail` and `paymentToken` in plaintext.
- The "list files and wait" close exists because the weak prompt gave no signal about scope at all — this makes scope an explicit, reviewable artifact before any edit happens.
