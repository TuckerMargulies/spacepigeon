// Small helpers so handlers run the same on Vercel and in the local dev server.

export async function readJson(req, limit = 16 * 1024) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
    if (raw.length > limit) throw new Error('TooLarge');
    return raw ? JSON.parse(raw) : {};
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('TooLarge');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function send(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

export function isJson(req) {
  return String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json');
}

export function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '');
  return fwd.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

export function getCookie(req, name) {
  const header = String(req.headers.cookie || '');
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

/** Log error names only — never addresses, form contents or provider messages. */
export function logError(where, err) {
  console.error(`[${where}]`, err && err.name !== 'Error' ? err.name : err?.message?.replace(/[^A-Za-z0-9]/g, '') || 'Error');
}
