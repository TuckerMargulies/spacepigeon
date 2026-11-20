---
description: Development workflow — applies when starting new work, creating branches, or opening PRs
alwaysApply: true
---

# Development Workflow

## Before Starting Any Implementation Work

- Discuss the work with the user and align on scope
- For anything beyond a small change, write a plan and confirm it before writing code

## Starting Work

1. Ensure you're on an up-to-date `staging` branch: `git checkout staging && git pull`
2. Create a feature branch: `{username}/{short-description}` (e.g., `tucker/sph42-lamp-glow`)

## During Development

- Commit with conventional commits: `feat:`, `fix:`, `chore:`, etc.
- Run `npm run lint` and `npm run test:e2e` before pushing

## Opening a PR

- Target branch is always `staging` (never `main` directly)
- PR title should be descriptive of the change
- PR body summarizes what was done and why; fill in the PR template's Security checklist
- Add the **`skip-e2e`** label for PRs that only change docs, config, chores, or deps (no `index.html`, `assets/` or `e2e/` changes). E2E runs by default otherwise.
- **One PR, one change.** Don't bundle unrelated work in a single branch/PR.

## After PR Merge

- QA is manual on the staging environment (Vercel preview for `staging`)
- The Release PR (staging → main) is auto-created/updated by GitHub Actions; merging it deploys production

## Branch Naming Convention

Format: `{username}/{short-description}`
- Username of the person working on it
- Short kebab-case description
- Examples: `tucker/patch-hires-texture`, `tucker/fix-hero-framing`
