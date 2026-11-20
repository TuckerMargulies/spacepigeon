// Stands in for Supabase (PostgREST, order_requests only) and Resend in E2E tests.
// GET /__state shows what was stored and sent; POST /__reset clears it.
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const port = Number(process.env.STUB_PORT || 8788);
let orders = [];
let emails = [];

function body(req) {
  return new Promise((ok) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      ok(raw ? JSON.parse(raw) : {});
    });
  });
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://stub');
  if (url.pathname === '/__state') return json(res, 200, { orders, emails });
  if (url.pathname === '/__reset') {
    orders = [];
    emails = [];
    return json(res, 200, { ok: true });
  }

  if (url.pathname === '/emails' && req.method === 'POST') {
    if (req.headers.authorization !== 'Bearer test-resend-key') return json(res, 401, { message: 'bad key' });
    const mail = await body(req);
    emails.push(mail);
    return json(res, 200, { id: `email_${emails.length}` });
  }

  if (url.pathname === '/rest/v1/order_requests') {
    if (req.headers.apikey !== 'test-service-key') return json(res, 401, { message: 'bad key' });
    if (req.method === 'POST') {
      const row = { id: randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...(await body(req)) };
      orders.push(row);
      return json(res, 201, [row]);
    }
    if (req.method === 'GET') {
      return json(res, 200, [...orders].sort((a, b) => b.created_at.localeCompare(a.created_at)));
    }
    if (req.method === 'PATCH') {
      const id = (url.searchParams.get('id') || '').replace(/^eq\./, '');
      const patch = await body(req);
      const row = orders.find((o) => o.id === id);
      if (row) Object.assign(row, patch);
      return json(res, 200, row ? [row] : []);
    }
  }
  json(res, 404, { message: 'not stubbed' });
}).listen(port, () => console.log(`stub services on ${port}`));
