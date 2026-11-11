# LeeTKOB

LeeTKOB helps a teaching assistant verify, with evidence, that Accepted C++ lab submissions obey the assignment constraints before marks are published. This repository is the PA#2 contract-first harness for team 23120205, 23120207, and 23120231.

## PA#2 scope

- The contract and executable implementation of `POST /labs/{labId}/publish`.
- Contract tests for success, every documented error, cross-class ownership, deadline/review guards, and idempotent retry.
- One local/CI command for lint, formatting, type checking, and tests.

The C++ sandbox, queue, hard rules, model review, UI, persistence, and deployment are later milestones. The final product will include them; they are not falsely represented as complete here.

## Requirements and setup

- Node.js 22.x
- npm 10.x

```bash
npm ci
cp .env.example .env
```

The current contract tests need no environment values and never contact a real model.

## Quality commands

Run exactly the same commands locally and in `.github/workflows/ci.yml`:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
```

Or run the complete local gate with `npm run check`. `npm test` enforces coverage thresholds in addition to running tests.

## Development server

```bash
npm run dev
```

The PA#2 harness accepts deterministic test authorization such as `Authorization: Bearer ta:ta-a`; this is explicitly not the production authentication design.

## Model data and cost (PA#3 policy)

No model is called in PA#2. For PA#3 the provider/model will be recorded before integration in this README and `AI-LOG.md`. Only the statement, constraints, and code after comments, names, and student IDs are removed may leave the system. Before any real call, the provider account must have a hard monthly cap of **USD 5.00** and the application must enforce a **USD 0.50 per-lab cap** through `MODEL_MONTHLY_SPENDING_CAP_USD` and `MODEL_SPENDING_CAP_USD_PER_LAB`. These are safety ceilings, not cost estimates; the measured cost of one lab will replace this note after PA#3 profiling. Until the provider, model, and measured cost are documented, real model calls are prohibited.

Model credentials live only in the deployment secret store. They must never enter Git history, logs, prompts, or the code-judging sandbox.

## Branch gate

`main` must require the GitHub Actions check named `quality-gate`, require a pull request and one approval, dismiss stale approvals, require conversation resolution, block force pushes/deletion, and apply the rule to administrators. Evidence links belong in `PA2.md`.

## Product sources

- `LeeTKOB — class project brief.pdf` in this repository.
- [LeeTKOB product-owner FAQ](https://github.com/tkob-team/LeeTKOB-FAQ/blob/main/FAQ.md), especially FAQ-01 and FAQ-12.
