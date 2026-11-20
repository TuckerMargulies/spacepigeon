// POST /api/admin/login — emails a 15-minute sign-in link to an allow-listed admin.
// The answer is the same for every address, so it never reveals who is an admin.
import { config } from '../_lib/env.js';
import { signToken, secretOk, LOGIN_TTL_MS } from '../_lib/tokens.js';
import { adminSignInEmail, sendEmail } from '../_lib/email.js';
import { readJson, send, isJson, clientIp, logError } from '../_lib/http.js';
import { allow } from '../_lib/rate-limit.js';

const SAME_ANSWER = { ok: true, message: 'If that address can sign in, a link is on its way.' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' }, { Allow: 'POST' });
  if (!isJson(req)) return send(res, 415, { error: 'Send JSON' });

  const { adminEmails, sessionSecret, siteUrl } = config();
  if (!secretOk(sessionSecret)) return send(res, 503, { error: 'Admin sign-in is not set up yet.' });

  let email = '';
  try {
    const body = await readJson(req, 2048);
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
  } catch {
    return send(res, 400, { error: 'We couldn’t read that request.' });
  }

  if (!allow(`admin-login-ip:${clientIp(req)}`, 10, 10 * 60 * 1000)) {
    return send(res, 429, { error: 'Too many requests. Please try again in a few minutes.' });
  }
  if (!adminEmails.includes(email) || !allow(`admin-login:${email}`, 3, 10 * 60 * 1000)) {
    return send(res, 200, SAME_ANSWER);
  }

  try {
    const token = signToken(sessionSecret, 'login', email, LOGIN_TTL_MS);
    const link = `${siteUrl}/admin/?t=${encodeURIComponent(token)}`;
    await sendEmail({ to: email, ...adminSignInEmail(link) });
  } catch (err) {
    logError('admin-login', err);
  }
  return send(res, 200, SAME_ANSWER);
}
