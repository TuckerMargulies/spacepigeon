import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken, secretOk, LOGIN_TTL_MS } from '../api/_lib/tokens.js';

const SECRET = 'a'.repeat(40);

test('a token verifies for its own purpose only', () => {
  const t = signToken(SECRET, 'login', 'admin@coalesce.nyc', LOGIN_TTL_MS);
  assert.equal(verifyToken(SECRET, 'login', t), 'admin@coalesce.nyc');
  assert.equal(verifyToken(SECRET, 'session', t), null);
});

test('expired, tampered or foreign tokens fail', () => {
  const now = Date.now();
  const t = signToken(SECRET, 'login', 'admin@coalesce.nyc', 1000, now);
  assert.equal(verifyToken(SECRET, 'login', t, now + 2000), null);
  const [body, sig] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ e: 'evil@example.com', x: now + 1e9, n: 'x' })).toString('base64url');
  assert.equal(verifyToken(SECRET, 'login', `${forged}.${sig}`, now), null);
  assert.equal(verifyToken('b'.repeat(40), 'login', t, now), null);
  assert.equal(verifyToken(SECRET, 'login', `${body}`, now), null);
  assert.equal(verifyToken(SECRET, 'login', null, now), null);
  assert.equal(verifyToken(SECRET, 'login', 'x'.repeat(700), now), null);
});

test('a short secret fails closed', () => {
  assert.equal(secretOk('short'), false);
  assert.throws(() => signToken('short', 'login', 'a@b.co', 1000));
  assert.equal(verifyToken('short', 'login', 'anything.here'), null);
});
