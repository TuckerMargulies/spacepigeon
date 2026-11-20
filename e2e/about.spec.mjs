import { test, expect, watchErrors } from './support/test.mjs';

test('about page tells the original story and links back to the helmets', async ({ page }) => {
  const errors = watchErrors(page);

  await page.goto('/');
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about\/$/);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('SUBWAY TO OUTER SPACE');
  for (const name of ['WE STARTED WITH HUMANS.', '1. BASICALLY SUPERHEROES', '2. SERIOUSLY HEROES', '3. FAMOUS FAN CLUB', "WHAT'S THE POINT?"]) {
    await expect(page.getByRole('heading', { name })).toBeVisible();
  }
  await expect(page.getByText('Cher Ami')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Dickin Medal' })).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Dickin_Medal');
  await expect(page.getByText(/SUPERHEROS|SERIOUSLY HEROS/)).toHaveCount(0);
  // the Coalesce logo (traced artwork, not text) links to the agency
  const logo = page.getByRole('img', { name: 'Coalesce' });
  await expect(logo).toBeVisible();
  await expect(page.locator('a[href="https://coalesce.nyc"]').filter({ has: logo })).toHaveCount(1);
  // every illustration is the shared pigeon drawing, with a text alternative
  await expect(page.locator('#sp-bird')).toHaveCount(1);
  for (const name of [/standing on a small planet/, /speed lines/, /wearing a medal/, /Three pigeons/]) {
    await expect(page.getByRole('img', { name })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'not your average creative agency' })).toHaveAttribute('href', 'https://coalesce.nyc');
  await expect(page.getByRole('link', { name: 'Reconsider the Pigeon.' })).toHaveAttribute('href', '#reconsider');
  await expect(page.locator('canvas[data-sp-scene="0"][data-sp-bg="1"]')).toHaveCount(1);

  expect(errors).toEqual([]);

  await page.getByRole('link', { name: 'BACK TO HELMETS' }).click();
  await expect(page).toHaveURL(/\/#sph72$/);
});
