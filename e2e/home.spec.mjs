import { test, expect, watchErrors } from './support/test.mjs';

test('home: copy, sections, sticky header, no Facebook or Blog', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText("For the galaxy's ultimate navigators");
  for (const name of ['SPH72', 'SPH42', 'OFFICIAL PIGEONNAUT PATCH']) {
    await expect(page.getByRole('heading', { name })).toBeVisible();
  }
  await expect(page.locator('canvas[data-sp-scene]')).toHaveCount(4);

  const sections = page.getByRole('navigation', { name: 'Sections' }).getByRole('link');
  await expect(sections).toHaveCount(4);
  for (const href of await sections.evaluateAll((els) => els.map((el) => el.getAttribute('href')))) {
    await expect(page.locator(href)).toHaveCount(1);
  }

  await expect(page.getByRole('link', { name: 'Facebook' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Blog' })).toHaveCount(0);
  for (const [name, href] of [['Instagram', 'https://www.instagram.com/coalescenyc/'], ['LinkedIn', 'https://www.linkedin.com/company/coalesce-creative']]) {
    for (const link of await page.getByRole('link', { name }).all()) {
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  }

  await page.mouse.wheel(0, 2000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeInViewport();

  expect(errors).toEqual([]);
});

test('3D assets are served', async ({ request }) => {
  for (const path of ['/assets/site.js', '/assets/pigeon-mesh.json', '/assets/patch-round.jpg', '/assets/patch-pigeon.jpg', '/assets/patch-pigeon-sdf.png']) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  const mesh = await (await request.get('/assets/pigeon-mesh.json')).json();
  expect(mesh.tris).toBeGreaterThan(1000);
});

test('contact shows the inquiries address on both pages', async ({ page }) => {
  for (const path of ['/', '/about/']) {
    await page.goto(path);
    const link = page.locator('#contact a');
    await expect(link).toHaveText('admin@coalesce.nyc');
    await expect(link).toHaveAttribute('href', 'mailto:admin@coalesce.nyc');
  }
});
