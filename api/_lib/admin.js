import { config } from './env.js';
import { verifyToken } from './tokens.js';
import { getCookie } from './http.js';

export const COOKIE = 'sp_admin';

/** The signed-in admin's email, or null. Re-checks the allow-list on every request. */
export function sessionEmail(req) {
  const { sessionSecret, adminEmails } = config();
  const email = verifyToken(sessionSecret, 'session', getCookie(req, COOKIE));
  return email && adminEmails.includes(email) ? email : null;
}
