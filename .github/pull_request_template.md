## Summary

<!-- What changed and why. -->

## Security

- [ ] No secrets or keys in the page or its assets
- [ ] New assets are ours to publish (licenses checked for purchased models/textures)
- [ ] No new `${{ github.event.* }}` / `${{ github.head_ref }}` inside a workflow `run:` block

## Test plan

- [ ] `npm run lint`
- [ ] `npm run test:e2e`
- [ ] Checked on the Vercel preview (desktop + phone width)
- [ ] E2E added or updated (or `skip-e2e` label, per CLAUDE.md)
