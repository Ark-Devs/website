// Generates the site's binary assets. Run after changing the brand, a project image or a
// page title:  npm run assets   (needs the devDependencies: sharp, playwright-core)
//
//   src/static/   favicon.ico, favicon.svg, apple-touch-icon.png, icon-192/512, maskable icon
//   src/assets/img/work/   project screenshots as WebP
//   src/assets/og/  one 1200x630 social card per page
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright-core';
import { site, services, projects } from '../src/data.mjs';
import { rasterize } from '../src/lib/dotfont.mjs';
import { logoSVG, RED, BLACK } from '../src/lib/brand.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const staticDir = join(root, 'src/static');
const workDir = join(root, 'src/assets/img/work');
const ogDir = join(root, 'src/assets/og');
for (const d of [staticDir, workDir, ogDir]) mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------- brand icons
// Favicons and app icons come straight from the brand kit (tools/source/brand), which
// includes a heavier cut of the A for 16-32px.
const kit = join(root, 'tools/source/brand');
for (const [from, to] of [
  ['favicon.ico', 'favicon.ico'],
  ['favicon.svg', 'favicon.svg'],
  ['apple-touch-icon.png', 'apple-touch-icon.png'],
  ['android-chrome-192x192.png', 'icon-192.png'],
  ['android-chrome-512x512.png', 'icon-512.png'],
  ['maskable-512x512.png', 'icon-maskable-512.png'],
]) copyFileSync(join(kit, from), join(staticDir, to));

// ---------------------------------------------------------------- project images
const shots = join(root, 'tools/source');
const arkNames = { '1-today.png': 'today', '2-app.png': 'app', '3-install.png': 'install', '4-guide.png': 'guide' };
if (existsSync(shots)) {
  for (const f of readdirSync(shots).filter((f) => arkNames[f])) {
    await sharp(join(shots, f)).resize({ width: 780 }).webp({ quality: 82 }).toFile(join(workDir, `arkstore-${arkNames[f]}.webp`));
  }
}
const source = join(root, 'tools/source');
if (existsSync(join(source, 'jarvis-hud.png'))) await sharp(join(source, 'jarvis-hud.png')).webp({ quality: 86 }).toFile(join(workDir, 'jarvis-hud.webp'));
if (existsSync(join(source, 'db-crawler-mark.svg'))) copyFileSync(join(source, 'db-crawler-mark.svg'), join(workDir, 'db-crawler-mark.svg'));

// ---------------------------------------------------------------- social cards
function dotWord(text, dot = 12) {
  const bm = rasterize(text);
  const w = bm[0].length, h = 7;
  let c = '';
  bm.forEach((row, y) => row.forEach((v, x) => {
    c += `<circle cx="${x * dot + dot / 2}" cy="${y * dot + dot / 2}" r="${dot * 0.38}" fill="${v === 1 ? '#F5F5F5' : v === 2 ? RED : '#262626'}"/>`;
  }));
  return `<svg width="${w * dot}" height="${h * dot}" viewBox="0 0 ${w * dot} ${h * dot}">${c}</svg>`;
}
function glyphSVG(rows, size) {
  const step = size / 7;
  let c = '';
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    c += `<circle cx="${(x + 0.5) * step}" cy="${(y + 0.5) * step}" r="${step * 0.36}" fill="${ch === '#' ? '#F5F5F5' : ch === 'r' ? RED : '#262626'}"/>`;
  }));
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${c}</svg>`;
}
// Inlined: a page built with setContent() cannot load file:// URLs.
const font = (f) => `data:font/woff2;base64,${readFileSync(join(root, 'src/assets/fonts', f)).toString('base64')}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// Logo leads; dot-matrix art only where a project or service has its own mark.
function card({ label, word, title, sub, glyphRows }) {
  const art = glyphRows ? glyphSVG(glyphRows, 280) : word ? dotWord(word, word.length > 5 ? 14 : 18) : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:S;font-weight:600;src:url(${font('sora-latin-600-normal.woff2')})}
@font-face{font-family:S;font-weight:400;src:url(${font('sora-latin-400-normal.woff2')})}
@font-face{font-family:M;src:url(${font('space-mono-latin-400-normal.woff2')})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:${BLACK};color:#F5F5F5;font-family:S;padding:56px 64px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;position:relative}
body:after{content:'';position:absolute;left:0;right:0;bottom:0;height:10px;background:${RED}}
.top{display:flex;justify-content:space-between;align-items:center}
.logo svg{height:46px;width:auto;color:#F5F5F5}
.label{font-family:M;font-size:18px;letter-spacing:.1em;text-transform:uppercase;color:#a3a3a3;display:flex;gap:10px;align-items:center}
.label:before{content:'';width:10px;height:10px;border-radius:50%;background:${RED}}
.mid{display:flex;justify-content:space-between;align-items:flex-end;gap:40px}
h1{font-weight:600;font-size:${title.length > 28 ? 60 : 76}px;line-height:1.04;letter-spacing:-.045em;max-width:${glyphRows ? 740 : 1072}px}
p{font-size:25px;color:#a3a3a3;margin-top:20px;max-width:900px;line-height:1.4;letter-spacing:-.01em}
.art{flex:none}
.foot{display:flex;justify-content:space-between;font-family:M;font-size:17px;letter-spacing:.08em;text-transform:uppercase;color:#6b6b6b;margin-bottom:6px}
</style></head><body>
<div class="top"><div class="logo">${logoSVG({ cls: 'l', label: '' })}</div><div class="label">${esc(label)}</div></div>
${art && !glyphRows ? `<div class="art">${art}</div>` : ''}
<div class="mid"><div><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</div>${glyphRows ? `<div class="art">${art}</div>` : ''}</div>
<div class="foot"><span>${esc(site.domain)}</span><span>${esc(site.city)}, ${esc(site.country)}</span></div>
</body></html>`;
}

const cards = [
  ['home', { label: 'Software solutions', title: 'Software, engineered end to end.', sub: 'Custom ERP systems, web, mobile and desktop apps, database engineering and AI integration.' }],
  ['services', { label: 'Services', title: 'Software development services', sub: services.map((s) => s.title).join(' · ') }],
  ['work', { label: `${projects.length} projects`, title: 'Things we’ve built and shipped', sub: projects.slice(0, 5).map((p) => p.name).join(' · ') }],
  ['about', { label: 'About', title: 'A small team that ships big systems', sub: `Software solutions from ${site.city}, ${site.country}.` }],
  ['contact', { label: 'Contact', title: 'Start a project with arkdevs', sub: `${site.email} · ${site.phone}` }],
  ...services.map((s) => [`service-${s.slug}`, { label: 'Service', title: s.title, sub: s.short, glyphRows: s.glyph }]),
  ...projects.map((p) => [`work-${p.slug}`, { label: `${p.kind} · ${p.year}`, word: p.mono + '.', title: p.name, sub: p.summary }]),
];

function findChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!existsSync(base)) return undefined;
  for (const d of readdirSync(base).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
    for (const p of ['chrome-linux/chrome', 'chrome-linux64/chrome']) if (existsSync(join(base, d, p))) return join(base, d, p);
  }
  return undefined;
}
const browser = await chromium.launch({ executablePath: findChromium() });
const pg = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [name, opts] of cards) {
  await pg.setContent(card(opts), { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  const buf = await pg.screenshot({ type: 'png' });
  writeFileSync(join(ogDir, `${name}.png`), await sharp(buf).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer());
}
await browser.close();
console.log(`Assets written: icons, ${readdirSync(workDir).length} project images, ${cards.length} social cards`);
