// POST /api/order-request — files an order request (no payment), emails a confirmation
// to the customer with the admin inbox on CC.
import { randomBytes } from 'node:crypto';
import { validateOrder, isBot, newReference } from './_lib/orders.js';
import { insertOrder } from './_lib/db.js';
import { orderConfirmationEmail, sendEmail } from './_lib/email.js';
import { config } from './_lib/env.js';
import { readJson, send, isJson, clientIp, logError } from './_lib/http.js';
import { allow } from './_lib/rate-limit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' }, { Allow: 'POST' });
  if (!isJson(req)) return send(res, 415, { error: 'Send JSON' });

  let input;
  try {
    input = await readJson(req);
  } catch {
    return send(res, 400, { error: 'We couldn’t read that request.' });
  }

  // Bots get the same answer as people, and nothing is stored or sent.
  if (isBot(input)) return send(res, 200, { ok: true, reference: newReference(randomBytes) });

  const { order, errors } = validateOrder(input);
  if (errors) return send(res, 400, { error: 'Please check the highlighted fields.', fields: errors });

  if (!allow(`ip:${clientIp(req)}`, 5, 10 * 60 * 1000) || !allow(`email:${order.email}`, 3, 10 * 60 * 1000)) {
    return send(res, 429, { error: 'Too many requests. Please try again in a few minutes.' });
  }

  const record = { ...order, reference: newReference(randomBytes), status: 'new' };
  let saved;
  try {
    saved = await insertOrder(record);
  } catch (err) {
    logError('order-request:db', err);
    return send(res, 503, { error: 'We couldn’t file your request just now. Please try again shortly.' });
  }

  const { orderCc } = config();
  let emailed = true;
  try {
    const mail = orderConfirmationEmail(saved || record);
    await sendEmail({ to: record.email, cc: orderCc, replyTo: orderCc[0], ...mail });
  } catch (err) {
    emailed = false;
    logError('order-request:email', err);
  }

  return send(res, 201, { ok: true, reference: record.reference, emailed });
}
