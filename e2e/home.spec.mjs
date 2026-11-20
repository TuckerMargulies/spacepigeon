import { test, expect } from '@playwright/test';

test('home renders every scene without errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.text().includes('[spacepigeon]')) errors.push(m.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("For the galaxy's ultimate navigators");
  await expect(page.locator('canvas[data-sp-scene]')).toHaveCount(4);
  for (const name of ['SPH72', 'SPH42', 'OFFICIAL PIGEONNAUT PATCH']) {
    await expect(page.getByRole('heading', { name })).toBeVisible();
  }

  // Give WebGL time to compile the shaders and fetch the pigeon mesh and patch texture.
  await page.waitForTimeout(4000);
  expect(errors).toEqual([]);
});

test('3D assets are served', async ({ request }) => {
  for (const path of ['/assets/pigeon-mesh.json', '/assets/patch-round.jpg', '/assets/patch-pigeon.jpg', '/assets/patch-pigeon-sdf.png']) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
  }
  const mesh = await (await request.get('/assets/pigeon-mesh.json')).json();
  expect(mesh.count).toBeGreaterThan(1000);
  expect(mesh.tris).toBeGreaterThan(1000);
});

test('section links point at real sections', async ({ page }) => {
  await page.goto('/');
  const links = page.getByRole('navigation', { name: 'Sections' }).getByRole('link');
  await expect(links).toHaveCount(4);
  for (const href of await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')))) {
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test('header: sticky while scrolling, no Facebook or Blog links', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = function () { return null; };
  });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Facebook' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Blog' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Instagram' }).first()).toBeVisible();
  await page.mouse.wheel(0, 2000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav).toBeInViewport();
  await expect(page.getByRole('navigation', { name: 'Sections' })).toBeInViewport();
});
