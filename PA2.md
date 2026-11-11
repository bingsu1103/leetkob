# PA#2 — Harness and quality gate

## Team

| Student ID | Full name       | Contribution |
| ---------- | --------------- | -----------: |
| 23120205   | Ngô Gia An      |          34% |
| 23120207   | Nguyễn Bảo An   |          33% |
| 23120231   | Trương Nhật Đạt |          33% |

The split is the agreed ownership target for PA#2. Each member must be able to explain the full submission at the oral.

## Evidence links

The public repository, protected branch, red-to-green gate evidence, and deliberate contract-break evidence are all public below.

| Required evidence                                                 | Link                                                                                                                                                  |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public repository                                                 | https://github.com/bingsu1103/leetkob                                                                                                                 |
| Protected `main` settings (URL or screenshot in `docs/evidence/`) | Owner settings: https://github.com/bingsu1103/leetkob/settings/branches; exported configuration: `docs/evidence/branch-protection.json`               |
| Pull request where a red required check blocked merge             | PR #1: https://github.com/bingsu1103/leetkob/pull/1; lint failure: https://github.com/bingsu1103/leetkob/actions/runs/42971805898                     |
| Commit that turned that pull request green                        | Commit `a1f2b40`: https://github.com/bingsu1103/leetkob/commit/a1f2b40; green run: https://github.com/bingsu1103/leetkob/actions/runs/42972116842     |
| Green pull request                                                | PR #1 after the fix: https://github.com/bingsu1103/leetkob/pull/1                                                                                     |
| Final submission pull request                                     | PR #3: https://github.com/bingsu1103/leetkob/pull/3; checks: https://github.com/bingsu1103/leetkob/pull/3/checks                                      |
| CI run for submitted `pa2` tag                                    | Exact tag-filtered workflow view: https://github.com/bingsu1103/leetkob/actions/workflows/ci.yml?query=branch%3Apa2                                   |
| Deliberate contract break caught by CI                            | Closed, never merged PR #2: https://github.com/bingsu1103/leetkob/pull/2; failing run: https://github.com/bingsu1103/leetkob/actions/runs/42972271928 |

## Reproduce the gate

```bash
npm ci
npm run lint
npm run format:check
npm run typecheck
npm test
```

The required GitHub status check is named `quality-gate`.

Local verification results and the exact commands used are recorded in `docs/evidence/LOCAL_VERIFICATION.md`.
Contribution ownership and the per-member scope are recorded in `docs/evidence/CONTRIBUTIONS.md`.

## Endpoint under contract

`POST /labs/{labId}/publish` is specified in `docs/contract/publish-lab.md`. It follows FAQ-01 for ownership and FAQ-12 for the publication preconditions and retry behavior.
