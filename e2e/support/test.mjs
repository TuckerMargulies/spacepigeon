// Every spec imports `test` from here. WebGL is switched off by default: software rendering in
// CI is slow, and most tests are about markup, forms and the API. Opt in with
// `test.use({ webgl: true })` (only the 3D smoke test does).
import { test as base, expect } from '@playwright/test';

export const STUB = 'http://localhost:8788';

export const test = base.extend({
  webgl: [false, { option: true }],
  page: async ({ page, webgl }, use) => {
    if (!webgl) {
      await page.addInitScript(() => {
        HTMLCanvasElement.prototype.getContext = function () { return null; };
      });
    }
    await use(page);
  },
});

export { expect };

/** Collects page errors and console errors (including our [spacepigeon] shader warnings). */
export function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.text().includes('[spacepigeon]')) errors.push(m.text());
  });
  return errors;
}
