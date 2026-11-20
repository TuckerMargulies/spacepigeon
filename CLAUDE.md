# Space Pigeon

spacepigeon.net — a one-page site for a tongue-in-cheek space-helmet campaign, rebuilt with real-time 3D. Keep the original copy word for word unless Tucker changes it.

## Commands

```bash
npm run dev           # Site + API functions at http://localhost:8000 (reads .env.local)
npm run lint          # Static checks: inline script parses, assets exist, no template holes
npm test              # Unit tests (node:test, tests/)
npm run test:e2e      # E2E tests (Playwright, headless, software WebGL)
npm run test:e2e:ui   # E2E tests (Playwright, interactive UI)
```

Always run `npm run lint` and `npm test` before committing and `npm run test:e2e` before pushing.

## Stack

| Layer | Technology |
|-------|-----------|
| Page | One static `index.html` (markup, styles, script); no build step |
| 3D | Raw WebGL 1: the hero pigeon is a mesh (`assets/pigeon-mesh.json`); helmets and patch are raymarched signed distance fields |
| API | Vercel Node functions in `api/` (no dependencies; `fetch` to Supabase REST and Resend) |
| Data | Supabase Postgres: `order_requests` (RLS on, no client access; server writes with the service-role key) |
| Email | Resend (`resend_key`): order confirmations (admin on CC) and admin sign-in links |
| Deployment | Vercel (static + functions, no framework) |
| Unit Tests | node:test |
| E2E Tests | Playwright |

## Project structure

```
index.html                 # Home page markup (+ the order request dialog)
assets/site.js             # The 3D renderer for every page (generated from the canvas; data-sp-scene, data-sp-bg)
about/index.html           # About: the original story and pigeon facts, live planet hero (data-sp-bg)
assets/about-space.jpg     # Still of the planet scene; shows until WebGL draws (and without it)
admin/index.html           # Light admin: order requests list + status (email-link sign-in)
api/order-request.js       # POST: file an order request, email confirmation (CC admin)
api/admin/                 # login (email a link), session (link → cookie), orders (list, set status)
api/_lib/                  # Shared: validation (orders.js), db.js (only Supabase caller), email.js, tokens.js, env.js
supabase/migrations/       # SQL for order_requests
assets/order.js            # Order request dialog
assets/patch-round.jpg     # Round mission patch (2018B), unwarped from a photo of the real patch
assets/patch-pigeon.jpg    # Die-cut pigeon patch colour + patch-pigeon-sdf.png (its outline as a distance field)
assets/pigeon-mesh.json    # Hero pigeon: packed positions, normals, material ids (from the purchased OBJ)
e2e/                       # Playwright tests (support/stub-services.mjs stands in for Supabase + Resend)
tests/                     # Unit tests
scripts/dev-server.mjs     # npm run dev
scripts/check.mjs          # npm run lint
scripts/vercel-ignore-build.sh
```

The design source is the Claude Design canvas "Space Pigeon — 3D Rebuild". Page markup and `assets/site.js` are exported from it; the order dialog and `data-order` buttons live only here — keep them when re-exporting. Asset paths are absolute (`/assets/…`) so every page can share them.

Order requests, admin and email rules: `.claude/rules/orders.md`. Env vars: `.env.example`.

## Code conventions

- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`
- Purchased 3D models and textures: check the license allows commercial web use before committing

## Testing

Every change that touches `index.html` or `assets/` updates or adds an E2E test in the same PR.

## CI

CI runs on every PR to `staging` or `main`: `lint` and `unit-tests`, then `e2e`.

- E2E runs by default on every PR to `staging` (skipped on the release PR to `main` — already tested on staging)
- Add the **`skip-e2e`** label only for docs-only, config/chore, or dependency-only PRs
- **Do NOT skip E2E** for any PR that touches `index.html`, `assets/` or `e2e/`

## Deployment (Vercel)

- Vercel's Git integration deploys `main` to production and every other branch (incl. `staging`) as a preview
- `vercel.json` sets `ignoreCommand` → `scripts/vercel-ignore-build.sh`: skips builds for Dependabot branches and docs/config/test-only commits; it also sets security headers (admin: noindex, no-store)
- `.vercelignore` keeps tests, migrations and dev scripts off the public site
- Env vars live in Vercel; document every new one in `.env.example`
- Migrations are applied to the hosted Supabase project by hand (or via Supabase's GitHub integration once connected); never edit one after it has been applied

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
