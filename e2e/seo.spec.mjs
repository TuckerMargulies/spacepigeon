import { test, expect } from './support/test.mjs';

const PAGES = [
  { path: '/', title: /^Space Pigeon \| Space Helmets for Pigeons/ },
  { path: '/about/', title: /^About Space Pigeon/ },
];

for (const { path, title } of PAGES) {
  test(`SEO and link preview tags: ${path}`, async ({ page, request }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    const meta = (sel) => page.locator(sel).first().getAttribute('content');
    expect((await meta('meta[name="description"]')).length).toBeLessThanOrEqual(160);
    expect(await meta('meta[name="description"]')).toMatch(/space pigeon/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://spacepigeon.net${path}`);
    expect(await meta('meta[property="og:url"]')).toBe(`https://spacepigeon.net${path}`);
    expect(await meta('meta[property="og:image"]')).toBe('https://spacepigeon.net/assets/og.jpg');
    expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    await expect(page.locator('h1')).toHaveCount(1);
    const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    expect(ld['@graph'].some((n) => n['@type'] === 'Organization' && n.name === 'Space Pigeon')).toBe(true);
    await expect(page.locator('img:not([alt])')).toHaveCount(0);
  });
}

test('home h1 names Space Pigeon for search engines', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Space Pigeon');
  await expect(page.locator('h1')).toContainText("For the galaxy's ultimate navigators");
});

test('crawler files and icons are served', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /admin/');
  expect(robots).toContain('Sitemap: https://spacepigeon.net/sitemap.xml');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://spacepigeon.net/about/</loc>');
  for (const p of ['/favicon.ico', '/assets/og.jpg', '/assets/apple-touch-icon.png', '/assets/icon-512.png', '/site.webmanifest']) {
    expect((await request.get(p)).status(), p).toBe(200);
  }
});
