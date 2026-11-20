// GET   /api/admin/orders                      — newest 200 order requests (signed-in admin only)
// PATCH /api/admin/orders  { id, status }      — change a request's status
import { listOrders, updateOrderStatus } from '../_lib/db.js';
import { isStatus, isUuid } from '../_lib/orders.js';
import { sessionEmail } from '../_lib/admin.js';
import { readJson, send, isJson, logError } from '../_lib/http.js';

export default async function handler(req, res) {
  // Verified before any database call: the service-role client bypasses RLS.
  if (!sessionEmail(req)) return send(res, 401, { error: 'Signed out' });

  if (req.method === 'GET') {
    try {
      return send(res, 200, { orders: await listOrders() });
    } catch (err) {
      logError('admin-orders:list', err);
      return send(res, 503, { error: 'Couldn’t load order requests.' });
    }
  }

  if (req.method === 'PATCH') {
    if (!isJson(req)) return send(res, 415, { error: 'Send JSON' });
    let body;
    try {
      body = await readJson(req, 2048);
    } catch {
      return send(res, 400, { error: 'We couldn’t read that request.' });
    }
    if (!isUuid(body.id) || !isStatus(body.status)) return send(res, 400, { error: 'Unknown order or status.' });
    try {
      const order = await updateOrderStatus(body.id, body.status);
      return order ? send(res, 200, { order }) : send(res, 404, { error: 'Order not found.' });
    } catch (err) {
      logError('admin-orders:update', err);
      return send(res, 503, { error: 'Couldn’t update that order.' });
    }
  }

  return send(res, 405, { error: 'Method not allowed' }, { Allow: 'GET, PATCH' });
}
