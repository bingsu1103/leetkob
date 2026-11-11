# Self-assessment — PA#2

Submitted by:

- 23120205 — Ngô Gia An (34%)
- 23120207 — Nguyễn Bảo An (33%)
- 23120231 — Trương Nhật Đạt (33%)

Total I claim: 100 / 100

| Criterion                      |     Max | I claim | Evidence                                                                                                                                                                                                                                             |
| ------------------------------ | ------: | ------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Rules file                  |      15 |      15 | `AGENTS.md` has stack, commands, conventions and product-specific never rules; two refinements (dependency vulnerability audit and CI runner execution verification) are traced to `AI-LOG.md` dated 2026-11-10.                                     |
| 2. Permissions and secrets     |      10 |      10 | `SECURITY.md` records allowed/ask-first/never tiers; `.env.example` lists empty variables; `.gitignore` excludes secrets; `README.md` sets USD 5/month and USD 0.50/lab safety caps; `docs/evidence/LOCAL_VERIFICATION.md` records the history scan. |
| 3. One command for every check |      10 |      10 | `README.md` and `package.json`: `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`; `.github/workflows/ci.yml` invokes the same commands.                                                                                       |
| 4. CI that blocks a merge      |      20 |      20 | `docs/evidence/branch-protection.json` requires `quality-gate` and PR review on `main`; `PA2.md` links PR #1, run `42971805898` failing at lint, commit `a1f2b40`, and green run `42972116842`.                                                      |
| 5. One endpoint contract       |      25 |      25 | `docs/contract/publish-lab.md`: role and class ownership, request/response fields, RFC 9457 error types, natural idempotency, concurrency, and observable effects.                                                                                   |
| 6. Contract tests that bite    |      15 |      15 | `test/publish-contract.test.ts` covers success, every documented error, cross-class ownership and idempotency. `PA2.md` links closed PR #2 and run `42972271928`, where the unchanged test caught overwritten first-publication audit fields.        |
| 7. AI-LOG.md                   |       5 |       5 | `AI-LOG.md` names the tool/tasks and records concrete kept/changed/rejected decisions and checks.                                                                                                                                                    |
| **Total**                      | **100** | **100** | The ZIP name ends in `_100.zip`; every claimed criterion has file, commit, PR, or CI evidence.                                                                                                                                                       |

## What we did not manage

We completed every PA#2 rubric item. The C++ sandbox and LLM constraint-review pipeline are intentionally not implemented in PA#2; the class brief schedules those capabilities for later checkpoints.

## What we would do differently

Verify the repository owner's Actions entitlement before the evidence day. An account-level billing lock initially prevented runners from starting; after access was restored, we reran the evidence from scratch and cited only runs that executed the actual lint and contract-test steps.
