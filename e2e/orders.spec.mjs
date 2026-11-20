import { test, expect, STUB } from './support/test.mjs';
import { validOrder } from './support/fixtures.mjs';




test.beforeEach(async ({ request }) => {
  await request.post(`${STUB}/__reset`);
});

test('Place Order files a request and emails a confirmation with admin on CC', async ({ page, request }) => {
  await page.goto('/');
  await page.locator('#sph72').getByRole('button', { name: 'Place Order' }).click();

  const dialog = page.getByRole('dialog', { name: 'SPH72' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('COST: $246,000')).toBeVisible();
  await expect(dialog.getByText('Nothing is charged.')).toBeVisible();

  await dialog.getByLabel('Quantity').fill('2');
  await dialog.getByLabel('Name', { exact: true }).fill('Ada Pigeon');
  await dialog.getByLabel('Email').fill('Ada@Example.com');
  await dialog.getByLabel('Street address').fill('1 Coop Lane');
  await dialog.getByLabel('City').fill('New York');
  await dialog.getByLabel('State or region (optional)').fill('NY');
  await dialog.getByLabel('Postal code').fill('10021');
  await dialog.getByLabel('Notes (optional)').fill('Please add <b>beak</b> padding');
  await dialog.getByRole('button', { name: 'Send order request' }).click();

  await expect(dialog.getByRole('heading', { name: 'Request received' })).toBeVisible();
  const ref = (await dialog.locator('#order-ref').textContent()).trim();
  expect(ref).toMatch(/^SP-[A-Z2-9]{6}$/);

  const state = await (await request.get(`${STUB}/__state`)).json();
  expect(state.orders).toHaveLength(1);
  expect(state.orders[0]).toMatchObject({
    reference: ref,
    product: 'SPH72',
    quantity: 2,
    unit_price_cents: 24600000,
    name: 'Ada Pigeon',
    email: 'ada@example.com',
    status: 'new',
    notes: 'Please add <b>beak</b> padding',
  });
  expect(state.orders[0].shipping_address).toMatchObject({ line1: '1 Coop Lane', city: 'New York', postal: '10021', country: 'United States' });

  expect(state.emails).toHaveLength(1);
  const mail = state.emails[0];
  expect(mail.from).toBe('Space Pigeon <orders@spacepigeon.net>');
  expect(mail.to).toEqual(['ada@example.com']);
  expect(mail.cc).toEqual(['admin@coalesce.nyc']);
  expect(mail.reply_to).toBe('admin@coalesce.nyc');
  expect(mail.subject).toBe(`Order request received: SPH72 (${ref})`);
  expect(mail.html).toContain('nothing has been charged');
  expect(mail.html).toContain('&lt;b&gt;beak&lt;/b&gt;');
  expect(mail.html).not.toContain('<b>beak</b>');
  expect(mail.text).toContain('$246,000 each ($492,000 total)');

  await dialog.getByRole('button', { name: 'Close' }).last().click();
  await expect(dialog).toBeHidden();
});

test('Purchase opens a request for the patch', async ({ page }) => {
  await page.goto('/');
  await page.locator('#patch').getByRole('button', { name: 'Purchase' }).click();
  const dialog = page.getByRole('dialog', { name: 'Official Pigeonnaut Patch' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Product')).toHaveValue('PATCH');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('the server rejects bad requests and stores nothing', async ({ request }) => {
  const bad = await request.post('/api/order-request', {
    data: { ...validOrder, product: 'SPH99', quantity: 50, email: 'not-an-email', address: { ...validOrder.address, line1: '' } },
  });
  expect(bad.status()).toBe(400);
  const body = await bad.json();
  expect(Object.keys(body.fields).sort()).toEqual(['address.line1', 'email', 'product', 'quantity']);

  const notJson = await request.post('/api/order-request', { headers: { 'Content-Type': 'text/plain' }, data: 'hi' });
  expect(notJson.status()).toBe(415);

  const state = await (await request.get(`${STUB}/__state`)).json();
  expect(state.orders).toHaveLength(0);
  expect(state.emails).toHaveLength(0);
});

test('a bot that fills the hidden field gets the same answer and nothing is filed', async ({ request }) => {
  const res = await request.post('/api/order-request', { data: { ...validOrder, company: 'Spam Inc' } });
  expect(res.status()).toBe(200);
  expect((await res.json()).reference).toMatch(/^SP-/);
  const state = await (await request.get(`${STUB}/__state`)).json();
  expect(state.orders).toHaveLength(0);
  expect(state.emails).toHaveLength(0);
});
