import { test, expect, STUB } from './support/test.mjs';
import { validOrder } from './support/fixtures.mjs';

const state = async (request) => (await request.get(`${STUB}/__state`)).json();

test.beforeEach(async ({ request }) => {
  await request.post(`${STUB}/__reset`);
});

test('admin signs in by email link, sees requests and changes a status', async ({ page, request }) => {
  const filed = await request.post('/api/order-request', { data: validOrder });
  const { reference } = await filed.json();

  await page.goto('/admin/');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

  // Someone not on the list gets the same answer, and no email is sent.
  await page.getByLabel('Email').fill('someone@example.com');
  await page.getByRole('button', { name: 'Email me a link' }).click();
  await expect(page.getByRole('status')).toHaveText(/If that address can sign in/);
  expect((await state(request)).emails).toHaveLength(1); // only the order confirmation

  await page.getByLabel('Email').fill('Admin@Coalesce.nyc');
  await page.getByRole('button', { name: 'Email me a link' }).click();
  await expect.poll(async () => (await state(request)).emails.length).toBe(2);
  const mail = (await state(request)).emails[1];
  expect(mail.to).toEqual(['admin@coalesce.nyc']);
  const link = mail.text.match(/http:\/\/localhost:8000\/admin\/\?t=\S+/)[0];

  // Opening the link changes nothing; only Continue signs in.
  await page.goto(link);
  await expect(page.getByRole('heading', { name: 'Continue to admin' })).toBeVisible();
  expect((await page.request.get('/api/admin/orders')).status()).toBe(401);
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Order requests' })).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/$/);
  const row = page.getByRole('row', { name: new RegExp(reference) });
  await expect(row).toContainText('SPH42 × 1');
  await expect(row).toContainText('ada@example.com');
  await expect(row).toContainText('1 Coop Lane');

  await row.getByRole('combobox', { name: `Status for ${reference}` }).selectOption('contacted');
  await expect(page.getByRole('status')).toHaveText(`Updated ${reference}.`);
  expect((await state(request)).orders[0].status).toBe('contacted');

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  expect((await page.request.get('/api/admin/orders')).status()).toBe(401);
});

test('admin API refuses requests without a valid session', async ({ request }) => {
  expect((await request.get('/api/admin/orders')).status()).toBe(401);
  expect((await request.patch('/api/admin/orders', { data: { id: '00000000-0000-0000-0000-000000000000', status: 'fulfilled' } })).status()).toBe(401);
  expect((await request.post('/api/admin/session', { data: { token: 'forged.token' } })).status()).toBe(401);
  expect((await request.get('/api/admin/orders', { headers: { Cookie: 'sp_admin=forged.token' } })).status()).toBe(401);
});
