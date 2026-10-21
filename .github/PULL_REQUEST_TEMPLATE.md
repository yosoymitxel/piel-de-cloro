## Root cause and reproduction
- [ ] Describe the observed failure, not only the symptom.
- [ ] Record exact reproduction steps and expected vs. actual behavior.
- [ ] Identify the responsible state transitions, event handlers, and async boundaries.

## Engineering review
- [ ] **Architecture:** verify ownership of state and UI; check for competing sources of truth and race conditions.
- [ ] **Implementation:** trace all callers and confirm async contracts, cancellation, error handling, and cleanup.
- [ ] **QA:** add a regression test that fails on the old code; cover ordering, cancellation, and failure paths where relevant.
- [ ] **Code review:** inspect the full diff for unrelated changes, dead code, brittle mocks, and misleading tests.
- [ ] **DevOps/release:** verify CI, browser/mobile smoke tests, and deployment status separately.

## Validation evidence
- [ ] Unit/regression tests pass.
- [ ] Browser test reproduces the original user flow end-to-end.
- [ ] Mobile viewport / touch / scroll behavior checked when UI navigation is involved.
- [ ] Deployed build checked if the bug was reported in production.
- [ ] Record any checks that could not run and why.

## Merge gate
- [ ] No required check is pending or failing.
- [ ] No claim of production resolution without a verified deployed smoke test.
- [ ] Summarize remaining risks and rollback path.
