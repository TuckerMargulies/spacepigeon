import { test, expect, watchErrors } from './support/test.mjs';

// The one test that runs the 3D: every shader compiles and nothing throws, on both pages.
// Small viewport, so software rendering stays quick.
test.use({ webgl: true, viewport: { width: 480, height: 320 } });

test('3D scenes compile and run without errors', async ({ page }) => {
  const errors = watchErrors(page);
  for (const path of ['/', '/about/']) {
    await page.goto(path);
    await expect(page.locator('canvas[data-sp-scene]').first()).toBeAttached();
    await page.waitForTimeout(1500);
  }
  expect(errors).toEqual([]);
});
