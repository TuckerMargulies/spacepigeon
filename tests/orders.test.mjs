import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { validateOrder, isBot, newReference, formatPrice, isStatus, isUuid } from '../api/_lib/orders.js';

const good = {
  product: 'sph72',
  quantity: '2',
  name: '  Ada   Pigeon ',
  email: ' Ada@Example.COM ',
  address: { line1: '1 Coop Lane', city: 'New York', postal: '10021', country: 'United States' },
  notes: '  Line one\r\nLine two  ',
};

test('accepts a good request and normalises it', () => {
  const { order, errors } = validateOrder(good);
  assert.equal(errors, undefined);
  assert.equal(order.product, 'SPH72');
  assert.equal(order.quantity, 2);
  assert.equal(order.name, 'Ada Pigeon');
  assert.equal(order.email, 'ada@example.com');
  assert.equal(order.notes, 'Line one\nLine two');
  assert.equal(order.shipping_address.line2, '');
  assert.equal(order.unit_price_cents, 24600000);
});

test('the price comes from the catalogue, never the request', () => {
  const { order } = validateOrder({ ...good, unit_price_cents: 1, price: 1 });
  assert.equal(order.unit_price_cents, 24600000);
  assert.equal(validateOrder({ ...good, product: 'PATCH' }).order.unit_price_cents, null);
});

test('rejects unknown products, bad quantities, bad emails and missing address fields', () => {
  const { errors } = validateOrder({ ...good, product: 'SPH99', quantity: 11, email: 'nope', address: { country: 'US' } });
  assert.deepEqual(Object.keys(errors).sort(), ['address.city', 'address.line1', 'address.postal', 'email', 'product', 'quantity']);
  assert.ok(validateOrder({ ...good, quantity: 1.5 }).errors.quantity);
  assert.ok(validateOrder({ ...good, quantity: 0 }).errors.quantity);
});

test('rejects over-long fields and control characters', () => {
  assert.ok(validateOrder({ ...good, name: 'x'.repeat(121) }).errors.name);
  assert.ok(validateOrder({ ...good, notes: 'x'.repeat(1001) }).errors.notes);
  assert.ok(validateOrder({ ...good, name: 'Ada\u0000' }).errors.name);
  assert.equal(validateOrder({ ...good, address: { ...good.address, city: 'New\nYork' } }).order.shipping_address.city, 'New York', 'newlines collapse to spaces in one-line fields');
});

test('rejects non-objects', () => {
  assert.ok(validateOrder(null).errors);
  assert.ok(validateOrder([]).errors);
  assert.ok(validateOrder({ ...good, name: 42 }).errors.name);
});

test('honeypot', () => {
  assert.equal(isBot({ company: '' }), false);
  assert.equal(isBot({ company: ' Spam ' }), true);
  assert.equal(isBot({}), false);
});

test('references look like SP-XXXXXX with no look-alike characters', () => {
  for (let i = 0; i < 200; i++) assert.match(newReference(randomBytes), /^SP-[A-HJ-NP-Z2-9]{6}$/);
});

test('helpers', () => {
  assert.equal(formatPrice(24600000), '$246,000');
  assert.equal(formatPrice(null), 'Price on request');
  assert.equal(isStatus('fulfilled'), true);
  assert.equal(isStatus('deleted'), false);
  assert.equal(isUuid('3f2b8c1e-1d2a-4b3c-9d4e-5f6a7b8c9d0e'), true);
  assert.equal(isUuid('1 or 1=1'), false);
});
