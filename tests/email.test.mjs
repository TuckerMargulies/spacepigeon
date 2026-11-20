import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, orderConfirmationEmail, adminSignInEmail } from '../api/_lib/email.js';

const order = {
  reference: 'SP-ABCDEF',
  product: 'SPH42',
  quantity: 3,
  name: '<script>alert(1)</script>',
  email: 'ada@example.com',
  shipping_address: { line1: '1 "Coop" Lane', line2: '', city: 'New York', region: 'NY', postal: '10021', country: 'United States' },
  notes: 'a & b\nc',
};

test('escapeHtml', () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  assert.equal(escapeHtml(null), '');
});

test('order confirmation escapes every value and states nothing was charged', () => {
  const { subject, html, text } = orderConfirmationEmail(order);
  assert.equal(subject, 'Order request received: SPH42 (SP-ABCDEF)');
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('1 &quot;Coop&quot; Lane'));
  assert.ok(html.includes('a &amp; b<br>c'));
  assert.ok(html.includes('nothing has been charged'));
  assert.ok(text.includes('$174,000 each ($522,000 total)'));
});

test('patch confirmation says price on request', () => {
  const { text } = orderConfirmationEmail({ ...order, product: 'PATCH', quantity: 1 });
  assert.ok(text.includes('Price: Price on request'));
});

test('admin sign-in email carries the link, escaped in HTML', () => {
  const { html, text } = adminSignInEmail('https://spacepigeon.net/admin/?t=a"b');
  assert.ok(html.includes('?t=a&quot;b'));
  assert.ok(text.includes('https://spacepigeon.net/admin/?t=a"b'));
});
