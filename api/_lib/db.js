// The only module that talks to Supabase. It uses the service-role key, which bypasses
// row-level security, so every caller must have verified the request first:
//   insertOrder       — a validated public order request (rate-limited)
//   listOrders/update — a signed-in admin (verified session cookie + allow-list)
import { config } from './env.js';

function settings() {
  const { supabaseUrl, supabaseKey } = config();
  if (!supabaseUrl || !supabaseKey) throw new Error('DatabaseNotConfigured');
  return {
    base: `${supabaseUrl}/rest/v1/order_requests`,
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
  };
}

async function call(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`DatabaseError${res.status}`);
  return res.status === 204 ? null : res.json();
}

export async function insertOrder(order) {
  const { base, headers } = settings();
  const rows = await call(base, { method: 'POST', headers: { ...headers, Prefer: 'return=representation' }, body: JSON.stringify(order) });
  return rows[0];
}

export async function listOrders(limit = 200) {
  const { base, headers } = settings();
  return call(`${base}?select=*&order=created_at.desc&limit=${Number(limit)}`, { headers });
}

export async function updateOrderStatus(id, status) {
  const { base, headers } = settings();
  const rows = await call(`${base}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
  });
  return rows[0] || null;
}
