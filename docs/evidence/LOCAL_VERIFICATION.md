# Local verification — PA#2 final submission

Verified on 2026-11-11 with Node.js 22 and npm 10.

## Fresh-install quality gate

```bash
npm ci
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
npm audit --audit-level=low
```

Expected result:

- lint: zero warnings and errors;
- format check: every tracked source/document matches Prettier;
- type check: strict TypeScript succeeds;
- tests: 23/23 pass across two files;
- coverage: 98.68% statements, 94.91% branches, 100% functions, 98.64% lines;
- production build: succeeds;
- dependency audit: zero known vulnerabilities.

## Secret/history review

The submitted tree contains no `.env` file. `.env.example` contains variable names with empty values. The complete local Git history was searched for common private-key, GitHub-token, provider-token, and credential assignment patterns; no live secret was found.

Re-run before packaging:

```bash
git ls-files | grep -E '(^|/)\.env($|\.)' || true
git log -p --all -- . ':!package-lock.json' | rg -n 'BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|gh[pousr]_[A-Za-z0-9]{20,}|(API_KEY|TOKEN|PASSWORD|SECRET)\s*[:=]\s*[^[:space:]<]+'
```

The expected tracked environment file is only `.env.example`; the history search should return no matches. GitHub's public-repository secret scanning remains an additional remote control, not a substitute for this check.

## Team history review

`docs/evidence/CONTRIBUTIONS.md` records the contribution breakdown and
the scope owned by each member. Verify the final history with:

```bash
git shortlog -sne HEAD
git shortlog -sne --all
```

The submitted branch must show three commits per member. With the two evidence
branches included, the complete history must show four commits per member.

## Remote evidence status

`main` was protected before the evidence branches were pushed. The exported rule in `branch-protection.json` requires the `quality-gate` status, an up-to-date branch, a pull request and one approval; it applies to administrators and disables force pushes/deletion.

GitHub Actions access was restored on 2026-11-11. PR #1 demonstrates the required lint check blocking a merge and then passing after a code-only fix. Closed PR #2 demonstrates the idempotency contract test rejecting a code-only contract violation. Final submission PR #3 is green. `PA2.md` links each PR, commit and run.

## Final remote checks

The final submission branch must be green, the submitted commit must carry the pushed `pa2` tag, and the tag-filtered run linked in `PA2.md` must be green before uploading the ZIP.
