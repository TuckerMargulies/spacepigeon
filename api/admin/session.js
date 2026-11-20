// POST   /api/admin/session  { token } — trades a sign-in link token for a session cookie.
//        Only this POST spends the link (mail scanners open links with GET).
// GET    /api/admin/session            — who is signed in (or 401).
// DELETE /api/admin/session            — signs out.
import { config } from '../_lib/env.js';
import { signToken, verifyToken, SESSION_TTL_MS } from '../_lib/tokens.js';
import { readJson, send, isJson } from '../_lib/http.js';
import { sessionEmail, COOKIE } from '../_lib/admin.js';

function cookie(value, maxAgeSec, req) {
  const host = String(req.headers.host || '');
  const local = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  return `${COOKIE}=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSec}${local ? '' : '; Secure'}`;
}

export default async function handler(req, res) {
  const { sessionSecret, adminEmails } = config();

  if (req.method === 'GET') {
    const email = sessionEmail(req);
    return email ? send(res, 200, { email }) : send(res, 401, { error: 'Signed out' });
  }

  if (req.method === 'DELETE') {
    return send(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0, req) });
  }

  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' }, { Allow: 'GET, POST, DELETE' });
  if (!isJson(req)) return send(res, 415, { error: 'Send JSON' });

  let token = '';
  try {
    const body = await readJson(req, 2048);
    token = typeof body.token === 'string' ? body.token : '';
  } catch {
    return send(res, 400, { error: 'We couldn’t read that request.' });
  }

  const email = verifyToken(sessionSecret, 'login', token);
  if (!email || !adminEmails.includes(email)) {
    return send(res, 401, { error: 'That sign-in link has expired or isn’t valid. Ask for a new one.' });
  }
  const session = signToken(sessionSecret, 'session', email, SESSION_TTL_MS);
  return send(res, 200, { email }, { 'Set-Cookie': cookie(session, SESSION_TTL_MS / 1000, req) });
}
