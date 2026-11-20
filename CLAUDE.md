# Space Pigeon

spacepigeon.net — a one-page site for a tongue-in-cheek space-helmet campaign, rebuilt with real-time 3D. Keep the original copy word for word unless Tucker changes it.

## Commands

```bash
npm run dev           # Serve the site at http://localhost:8000
npm run lint          # Static checks: inline script parses, assets exist, no template holes
npm run test:e2e      # E2E tests (Playwright, headless, software WebGL)
npm run test:e2e:ui   # E2E tests (Playwright, interactive UI)
```

Always run `npm run lint` before committing and `npm run test:e2e` before pushing.

## Stack

| Layer | Technology |
|-------|-----------|
| Page | One static `index.html` (markup, styles, script); no build step |
| 3D | Raw WebGL 1: the hero pigeon is a mesh (`assets/pigeon-mesh.json`); helmets and patch are raymarched signed distance fields |
| Deployment | Vercel (static, no framework) |
| E2E Tests | Playwright |

## Project structure

```
index.html                 # The whole site
assets/patch.png           # Patch artwork, mapped onto the 3D patch
assets/pigeon-mesh.json    # Hero pigeon: packed positions, normals, material ids (from the purchased OBJ)
e2e/                       # Playwright tests
scripts/check.mjs          # npm run lint
scripts/vercel-ignore-build.sh
```

The design source is the Claude Design canvas "Space Pigeon — 3D Rebuild". `index.html` is exported from it; keep the two in step.

## Code conventions

- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`
- Purchased 3D models and textures: check the license allows commercial web use before committing

## Testing

Every change that touches `index.html` or `assets/` updates or adds an E2E test in the same PR.

## CI

CI runs on every PR to `staging` or `main`: `lint`, then `e2e`.

- E2E runs by default on every PR to `staging` (skipped on the release PR to `main` — already tested on staging)
- Add the **`skip-e2e`** label only for docs-only, config/chore, or dependency-only PRs
- **Do NOT skip E2E** for any PR that touches `index.html`, `assets/` or `e2e/`

## Deployment (Vercel)

- Vercel's Git integration deploys `main` to production and every other branch (incl. `staging`) as a preview
- `vercel.json` sets `ignoreCommand` → `scripts/vercel-ignore-build.sh`: skips builds for Dependabot branches and docs/config/test-only commits

## Workflow

**Branches:** `main` (production) ← `staging` (QA) ← feature branches

1. Create a feature branch from an up-to-date `staging`: `{username}/short-description`
2. Make changes; `npm run lint` and `npm run test:e2e` pass
3. Commit with conventional commit messages
4. Push and open a PR against `staging`
5. After merge to staging, QA on the staging preview
6. Release PR (staging → main) is auto-created/updated by GitHub Actions
7. Merge the Release PR to deploy to production

Details in `.claude/rules/workflow.md`.
