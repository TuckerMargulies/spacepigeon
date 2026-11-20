// Local server: static files plus the api/ functions, run the way Vercel runs them.
// Usage: node scripts/dev-server.mjs  (PORT, default 8000). Env vars as in .env.example.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const root = resolve(new URL('..', import.meta.url).pathname);
const port = Number(process.env.PORT || 8000);

// Load .env.local if present (never committed).
const envFile = join(root, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const ROUTES = {
  '/api/order-request': 'api/order-request.js',
  '/api/admin/login': 'api/admin/login.js',
  '/api/admin/session': 'api/admin/session.js',
  '/api/admin/orders': 'api/admin/orders.js',
};
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };
const PRIVATE = /^\/(api|supabase|scripts|e2e|tests|node_modules|\.)/;

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = ROUTES[url.pathname];
  if (route) {
    try {
      const mod = await import(join(root, route));
      return await mod.default(req, res);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      return res.end('{"error":"Server error"}');
    }
  }
  if (PRIVATE.test(url.pathname)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  if (url.pathname === '/admin') {
    res.writeHead(308, { Location: '/admin/' + url.search });
    return res.end();
  }
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  if (path.endsWith('/')) path += 'index.html';
  const file = join(root, path);
  if (!file.startsWith(root)) {
    res.statusCode = 403;
    return res.end();
  }
  try {
    if (!(await stat(file)).isFile()) throw new Error('nofile');
    res.setHeader('Content-Type', TYPES[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
}).listen(port, () => console.log(`Space Pigeon on http://localhost:${port}`));
