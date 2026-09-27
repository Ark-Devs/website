// Checks the built site the way a crawler would: every page has one h1, a unique title and
// description, a canonical URL, valid JSON-LD, images with alt text, and no broken internal links.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '../dist');
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); });
walk(dist);

const problems = [];
const titles = new Map(), descs = new Map();
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const name = relative(dist, file);
  const is404 = name === '404.html';
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${name}: ${h1} <h1> elements`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.replace(/&amp;/g, '&');
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if (!title) problems.push(`${name}: no <title>`);
  else if (title.length > 65) problems.push(`${name}: title is ${title.length} chars: ${title}`);
  if (!desc) problems.push(`${name}: no meta description`);
  else if (!is404 && (desc.length < 70 || desc.length > 165)) problems.push(`${name}: description is ${desc.length} chars`);
  if (!is404) {
    if (titles.has(title)) problems.push(`${name}: duplicate title with ${titles.get(title)}`);
    if (descs.has(desc)) problems.push(`${name}: duplicate description with ${descs.get(desc)}`);
    titles.set(title, name); descs.set(desc, name);
    if (!/<link rel="canonical" href="https?:\/\/[^"]+">/.test(html)) problems.push(`${name}: no canonical`);
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { problems.push(`${name}: invalid JSON-LD (${e.message})`); }
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="[^"]+"/.test(m[0])) problems.push(`${name}: <img> without alt`);
  if (is404) continue;
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(url)) continue;
    const clean = url.split(/[?#]/)[0];
    let target = resolve(dirname(file), clean);
    if (clean.endsWith('/') || clean === '' || clean === './') target = join(target, 'index.html');
    if (!existsSync(target)) problems.push(`${name}: broken link ${url}`);
  }
}
for (const f of ['sitemap.xml', 'robots.txt', 'site.webmanifest', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'llms.txt'])
  if (!existsSync(join(dist, f))) problems.push(`missing ${f}`);
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
const urls = (sitemap.match(/<loc>/g) || []).length;
if (urls !== files.length - 1) problems.push(`sitemap lists ${urls} URLs for ${files.length - 1} pages`);

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`OK: ${files.length} pages, ${urls} sitemap URLs, no broken links`);
