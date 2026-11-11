# LeeTKOB assistant rules

## Stack

- Node.js 22, TypeScript in strict mode, Fastify, Vitest, ESLint, and Prettier.
- PA#2 is an in-memory contract harness; production persistence and sandbox execution arrive in later milestones.

## Commands

- `npm run lint` - lint; `npm run format:check` - formatting; `npm run typecheck` - types; `npm test` - tests.
- `npm run check` runs the complete local gate. CI must use the same four individual commands.

## Conventions

- Keep HTTP behavior in `docs/contract/` synchronized with implementation and contract tests.
- Return RFC 9457 Problem Details for every HTTP error and hide cross-class resources with `404`.
- Treat Publish as irreversible and naturally idempotent; preserve the first publication audit fields.
- Record material assistant use and the check that caught mistakes in `AI-LOG.md`.

## Never

- Never expose a secret to the submission sandbox or commit real student identity/code.
- Never make a real model call in unit or contract tests.
- Never edit a test, eval case, or label merely to make a failing implementation pass.
- Never execute untrusted C++ on the host; the PA#3 sandbox must have no network, secrets, root, host mounts, or Docker socket.

The Problem Details rule and the fixed idempotent response were tightened after contract review; see the 2026-11-10 AI log.
