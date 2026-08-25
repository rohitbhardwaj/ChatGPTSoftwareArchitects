# Architecture Drift - Reference Solution

1. Redis became order state source of truth. Fix code and add fitness function.
2. Controller contains pricing logic. Move logic into domain/service layer.
3. Payment retries are not idempotent. Block release and add integration test.
4. Tests were changed to protect drift. Restore characterization tests from ADR behavior.
