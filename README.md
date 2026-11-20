# Space Pigeon

Premier space helmet technology for the galaxy's ultimate navigators.

A one-page rebuild of spacepigeon.net with real-time 3D scenes: the pigeonnaut in the hero, the SPH72 and SPH42 helmets, and the Official Pigeonnaut Patch. Every model is drawn live in the browser with WebGL: the pigeon is a real mesh, and the helmets and patch are raymarched signed distance fields. There are no 3D libraries, model files or build steps.

## Run it

It's a static site. Open `index.html` through any local server, for example:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000. Opening the file directly from disk also works, though some browsers block loading the patch texture from `file://`.

## Files

- `index.html`: markup, styles, and the WebGL renderer, all in one file.
- `assets/patch.png`: the patch artwork, mapped onto the 3D patch.
- `assets/pigeon-mesh.json`: the hero pigeon mesh (converted from the purchased OBJ; positions, normals and material ids, base64-packed). The plumage is painted in the mesh shader; the SPH72 helmet is raymarched and fitted to the head, with depth compositing so the shell hides the head and the glass shows the face.

## Tweaks

At the top of the script, `DCLogic` sets the defaults:

- `accent`: button and highlight color, also used for the SPH72 stripe.
- `shell42`: the SPH42 shell color.
- `autoRotate`: whether the models turn on their own.

Every model can also be dragged to rotate.

## Development and deployment

See [`CLAUDE.md`](./CLAUDE.md) for commands, CI and the branch/release workflow: feature branches → `staging` (QA) → `main` (production), with the release PR opened automatically.

Import this repository in Vercel (framework preset: Other; no build command). `main` deploys to production; `staging` and feature branches get preview deployments.

### One-time repository setup

- Make `staging` the default branch (it's the base for every PR)
- Settings → Actions → General: allow GitHub Actions to create pull requests (for the release PR)
- Labels: `skip-e2e`

## Not wired up yet

The Place Order, Purchase, About, Contact and social links all point to `#`, so they don't go anywhere yet.
