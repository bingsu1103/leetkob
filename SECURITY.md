# Security policy for development

## Assistant permissions

### Allowed without asking

- Read repository files, issue descriptions, and public LeeTKOB documentation.
- Create or edit source, tests, and documentation on a feature branch.
- Run local lint, format check, type check, tests, build, and read-only Git commands.

### Ask first

- Install or upgrade dependencies, contact a paid model, or make a network request that sends repository content.
- Push a branch or tag, open/merge/close a pull request, change GitHub settings, or deploy.
- Change the contract, test fixtures, eval data, or dependency policy after team review has started.

### Never

- Read, print, commit, or send `.env`, API keys, tokens, credentials, private student data, or classmates' work.
- Put a secret in source, tests, logs, prompts, CI variables, Docker images, or a judging sandbox.
- Weaken, delete, skip, or rewrite a test, an eval case, or a label merely to make a check pass.
- Make a real model call in a unit or contract test.
- Run untrusted submissions on the host, as root, with network access, host mounts, the Docker socket, or model credentials.

## Secret handling

`.env` files are ignored. `.env.example` is the complete variable-name inventory and contains no values. PA#3 model credentials must be stored only in the deployment/CI secret store and must never enter the judging sandbox. The model account must enforce the per-lab spending cap documented in the README.

If a secret enters Git history, stop, rotate it before any other work, remove it from history, and record the incident and verification in `AI-LOG.md`.
