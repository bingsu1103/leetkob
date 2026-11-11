# AI-LOG.md — CSC13114

## 2026-11-10 — PA#2 rubric audit and harness design

Tool: OpenAI Codex.
Asked for: read the attached brief, rubric and template, identify every PA#2 requirement, and build the initial LeeTKOB harness.
Kept: the Node.js/TypeScript quality-gate structure and the choice of the irreversible Publish endpoint.
Changed: narrowed the generated system to an honest PA#2 in-memory contract harness; sandbox, LLM and persistence claims were moved to later milestones because they are not PA#2 deliverables.
Rejected: claiming full-system or sandbox completion from only an endpoint harness; the class brief makes that PA#3–PA#5 work.

## 2026-11-10 — Publish contract and contract tests

Tool: OpenAI Codex.
Asked for: specify and test `POST /labs/{labId}/publish` against the class brief and product-owner FAQ.
Kept: role/ownership checks, deadline and pending-review conflicts, RFC 9457 errors, and idempotent retry tests.
Changed: cross-class access returns the same `404 lab-not-found` as an unknown lab so callers cannot enumerate another class's data; tests now assert both cases.
Rejected: requiring an idempotency key for Publish; FAQ-12 says pressing Publish again changes nothing, so the resource state itself supplies natural idempotency and preserves the first audit fields.

## 2026-11-10 — CI, permissions and secret policy

Tool: OpenAI Codex.
Asked for: create matching local/CI commands plus written three-tier assistant permissions and secret controls.
Kept: separate lint, format-check, type-check and test commands used verbatim by GitHub Actions.
Changed: added coverage thresholds so the test command can fail on weak tests, and made the future model cost fields explicit but empty in `.env.example`.
Rejected: a fake API key and a guessed model price; PA#2 makes no model calls, and values must be selected and measured honestly in PA#3.

## 2026-11-10 — dependency security audit

Tool: OpenAI Codex.
Asked for: verify the locked dependency tree before committing the PA#2 baseline.
Kept: exact versions and the reproducible `npm ci` workflow.
Changed: `npm audit` found newly published high/critical advisories in the initially selected Fastify 5.6 and Vitest 4.0 releases; upgraded to patched Fastify 5.12 and Vitest 5.1, then reran the complete gate.
Rejected: submitting merely because lint/types/tests were green; those checks do not prove the dependency tree has no known vulnerability.

## 2026-11-10 — GitHub evidence run and billing-lock diagnosis

Tool: OpenAI Codex.
Asked for: create the public repository, protect `main`, and produce the required red-to-green CI evidence.
Kept: the public repository, required `quality-gate` branch check, PR-only changes, linear history, stale-review dismissal, and force-push/deletion blocks.
Changed: stopped treating the red PR as code evidence after the GitHub check annotation showed that no runner started because the owner's account was billing-locked; documented the incident as infrastructure-only and submitted a support ticket.
Rejected: claiming the red check as proof that lint or contract tests caught a defect; GitHub ran zero workflow steps, so that claim would be false.

## 2026-11-10 — local submission candidate

Tool: OpenAI Codex.
Asked for: finish every PA#2 artifact that does not depend on GitHub Actions and prepare a ZIP candidate.
Kept: strict local lint, format, type, contract-test, build, coverage and dependency-audit gates.
Changed: added a reproducible local verification record, concrete future model spending ceilings, and an explicit pending-evidence checklist.
Rejected: inflating the self-assessment to 100 while PR/tag CI links are still unavailable; the candidate remains 75/100 until those links are real.

## 2026-11-11 — final CI evidence after access restoration

Tool: OpenAI Codex.
Asked for: complete every remaining PA#2 rubric item after GitHub Actions access was restored.
Kept: the protected `main` rule and the same four local/CI commands.
Changed: created a fresh lint-failing commit on PR #1, verified its merge state was `BLOCKED`, then removed only the unused variable and obtained a green run; separately opened PR #2 with a code-only idempotency break and closed it after the unchanged contract test failed.
Rejected: reusing the earlier billing-lock failures as rubric evidence; the final links point only to runs whose logs show ESLint or Vitest actually executing and detecting the intended defect.

## 2026-11-11 — clean team history and replacement evidence

Tool: OpenAI Codex.
Asked for: rebuild the public repository with the same reviewed code while recording the scope actually owned by each member working on the project.
Kept: the implementation, endpoint contract, tests, four-command gate, security policy, and equal 34/33/33 assessment split.
Changed: rebuilt the history as scoped commits using each active member's university identity, invited both collaborators, protected the new `main`, and reran the red-to-green lint PR plus the never-merged idempotency-break PR from scratch.
Rejected: copying the old PR/run links into the replacement submission; `PA2.md` now cites only evidence generated by the replacement public repository.
