// Static checks for the site. Run with `npm run lint`.
// - every script parses (inline and assets/*.js)
// - every local asset a page or script references exists
// - no unfilled template holes ({{ … }}) or canvas-only URLs from the design canvas export
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const PAGES = ['index.html', 'admin/index.html'];
const SCRIPTS = readdirSync('assets').filter((f) => f.endsWith('.js')).map((f) => `assets/${f}`);
const problems = [];
let assetCount = 0;

function checkAssets(file, text) {
  const refs = new Set([...text.matchAll(/['"(]\/?(assets\/[^'")\s?#]+)/g)].map((m) => m[1]));
  for (const a of refs) if (!existsSync(a)) problems.push(`${file}: missing asset ${a}`);
  assetCount += refs.size;
}

function parses(file, src) {
  try {
    new Function(src);
  } catch (e) {
    problems.push(`${file}: script does not parse: ${e.message}`);
  }
}

for (const page of PAGES) {
  if (!existsSync(page)) {
    problems.push(`Missing page ${page}`);
    continue;
  }
  const html = readFileSync(page, 'utf8');
  for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) parses(page, m[1]);
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) {
    const path = m[1].replace(/^\//, '');
    if (!existsSync(path)) problems.push(`${page}: missing script ${m[1]}`);
  }
  checkAssets(page, html);
  if (/\{\{[^}]*\}\}/.test(html)) problems.push(`${page}: unfilled template hole ({{ … }})`);
  if (/\/_blob\/|\.dc\.html/.test(html)) problems.push(`${page}: canvas-only URL (/_blob/ or .dc.html) left in`);
}

for (const file of SCRIPTS) {
  const src = readFileSync(file, 'utf8');
  parses(file, src);
  checkAssets(file, src);
  if (/\/_blob\//.test(src)) problems.push(`${file}: canvas-only URL (/_blob/) left in`);
}

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'));
  process.exit(1);
}
console.log(`✓ ${PAGES.length} pages and ${SCRIPTS.length} scripts OK (${assetCount} asset references)`);
