# Governed Prompt Solution

Analyze OrderService and orderController first. Do not modify files.

Identify:
1. current responsibilities;
2. controller/service coupling;
3. architecture violations;
4. public API behavior that must be preserved;
5. current tests and missing characterization tests;
6. security-sensitive logging risks;
7. impacted files.

Propose the smallest refactoring sequence to move pricing validation out of the controller into OrderService.

Constraints:
- preserve API behavior;
- do not change payment behavior;
- do not add dependencies;
- do not change public API response contract;
- add characterization tests before behavior changes;
- never log customerEmail, paymentToken, or card data;
- wait for approval before editing files.
