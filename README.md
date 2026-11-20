# Space Pigeon

Premier space helmet technology for the galaxy's ultimate navigators.

A one-page rebuild of spacepigeon.net with real-time 3D scenes: the pigeonnaut in the hero, the SPH72 and SPH42 helmets, and the Official Pigeonnaut Patch. Every model is drawn live in the browser with WebGL (raymarched signed distance fields). There are no 3D libraries, model files or build steps.

## Run it

It's a static site. Open `index.html` through any local server, for example:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000. Opening the file directly from disk also works, though some browsers block loading the patch texture from `file://`.

## Files

- `index.html`: markup, styles, and the WebGL renderer, all in one file.
- `assets/patch.png`: the patch artwork, mapped onto the 3D patch.

## Tweaks

At the top of the script, `DCLogic` sets the defaults:

- `accent`: button and highlight color, also used for the SPH72 stripe.
- `shell42`: the SPH42 shell color.
- `autoRotate`: whether the models turn on their own.

Every model can also be dragged to rotate.

## Not wired up yet

The Place Order, Purchase, About, Contact and social links all point to `#`, so they don't go anywhere yet.
