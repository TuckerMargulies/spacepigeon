// Static checks for the one-page site. Run with `npm run lint`.
// - the inline script parses
// - every local asset the page references exists
// - no unfilled template holes ({{ … }}) from the design canvas export
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const problems = [];

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (scripts.length === 0) problems.push('index.html has no inline <script>.');
for (const [i, src] of scripts.entries()) {
  try {
    new Function(src);
  } catch (e) {
    problems.push(`Inline script ${i + 1} does not parse: ${e.message}`);
  }
}

const assets = new Set([...html.matchAll(/['"(](assets\/[^'")\s?#]+)/g)].map((m) => m[1]));
for (const a of assets) if (!existsSync(a)) problems.push(`Missing asset: ${a}`);

if (/\{\{[^}]*\}\}/.test(html)) problems.push('Unfilled template hole ({{ … }}) in index.html.');
if (/\/_blob\//.test(html)) problems.push('Canvas-only asset URL (/_blob/…) left in index.html.');

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'));
  process.exit(1);
}
console.log(`✓ index.html OK (${scripts.length} script, ${assets.size} assets)`);
