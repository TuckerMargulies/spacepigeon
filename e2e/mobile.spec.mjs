import { test, expect } from './support/test.mjs';

for (const width of [320, 390]) {
  test(`phone layout at ${width}px: compact sticky header, no sideways scroll`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ['/', '/about/']) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const header = await page.locator('header').first().boundingBox();
      expect(header.height).toBeLessThanOrEqual(64);
      // social links move to the footer only; the header keeps HELMETS and About
      await expect(page.locator('header a.sp-social').first()).toBeHidden();
      await expect(page.locator('footer a[href*="instagram"]')).toBeVisible();
      await expect(page.locator('header nav[aria-label="Primary"] a').first()).toBeVisible();
    }
    // the home page's sticky block (header + section links) stays small
    await page.goto('/');
    const sticky = await page.locator('.sp-sticky').boundingBox();
    expect(sticky.height).toBeLessThanOrEqual(110);
  });
}
