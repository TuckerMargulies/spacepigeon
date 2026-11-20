// Signed, expiring tokens for admin sign-in links and sessions (HMAC-SHA256).
// Each token carries a purpose, so a sign-in link can never be used as a session and vice versa.
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

export const LOGIN_TTL_MS = 15 * 60 * 1000;
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function mac(secret, purpose, body) {
  return createHmac('sha256', secret).update(`${purpose}.${body}`).digest();
}

export function secretOk(secret) {
  return typeof secret === 'string' && secret.length >= 32;
}

export function signToken(secret, purpose, email, ttlMs, now = Date.now()) {
  if (!secretOk(secret)) throw new Error('SessionSecretMissing');
  const body = b64url(JSON.stringify({ e: email, x: now + ttlMs, n: b64url(randomBytes(9)) }));
  return `${body}.${b64url(mac(secret, purpose, body))}`;
}

/** Returns the email inside a valid, unexpired token of this purpose, else null. */
export function verifyToken(secret, purpose, token, now = Date.now()) {
  if (!secretOk(secret) || typeof token !== 'string' || token.length > 600) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  let given;
  try {
    given = Buffer.from(sig, 'base64url');
  } catch {
    return null;
  }
  const want = mac(secret, purpose, body);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (typeof data.e !== 'string' || typeof data.x !== 'number' || data.x < now) return null;
    return data.e;
  } catch {
    return null;
  }
}
