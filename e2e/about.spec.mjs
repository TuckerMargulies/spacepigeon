import { test, expect } from '@playwright/test';

test('about page tells the original story and links back to the helmets', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.text().includes('[spacepigeon]')) errors.push(m.text());
  });

  await page.goto('/');
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about\/$/);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('SUBWAY TO OUTER SPACE');
  for (const name of ['WE STARTED WITH HUMANS.', '1. BASICALLY SUPERHEROS', '2. SERIOUSLY HEROS', '3. FAMOUS FAN CLUB', "WHAT'S THE POINT?"]) {
    await expect(page.getByRole('heading', { name })).toBeVisible();
  }
  await expect(page.getByText('Cher Ami')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Dickin Medal' })).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Dickin_Medal');
  await expect(page.getByRole('link', { name: 'not your average creative agency' })).toHaveAttribute('href', 'https://coalesce.nyc');
  await expect(page.getByRole('link', { name: 'Reconsider the Pigeon.' })).toHaveAttribute('href', '#reconsider');
  await expect(page.locator('canvas[data-sp-scene="0"][data-sp-bg="1"]')).toHaveCount(1);

  await page.waitForTimeout(3000);
  expect(errors).toEqual([]);

  await page.getByRole('link', { name: 'BACK TO HELMETS' }).click();
  await expect(page).toHaveURL(/\/#sph72$/);
});
