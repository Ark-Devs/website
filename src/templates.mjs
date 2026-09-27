// Page templates. Plain template literals: every page is prerendered HTML, so the content,
// links and structured data are all in the document before any script runs.
import { site, nav, services, projects, steps, principles, stackMarquee, faq } from './data.mjs';
import { rasterize } from './lib/dotfont.mjs';
import { logoSVG, symbolSVG } from './lib/brand.mjs';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const abs = (path) => `${site.url}/${path}`;
const bySlug = (slug) => projects.find((p) => p.slug === slug);

// ---------------------------------------------------------------- graphics

// A 7x7 glyph as SVG ('#' lit, 'r' red, '.' dim). Used for the logo mark and service icons.
export function glyph(rows, { size = 56, cls = 'glyph', label = '' } = {}) {
  const n = rows.length;
  const step = 100 / n;
  let dots = '';
  rows.forEach((row, y) =>
    [...row].forEach((c, x) => {
      const k = c === '#' ? 'on' : c === 'r' ? 'red' : 'off';
      dots += `<circle class="${k}" style="--i:${x + y}" cx="${(x + 0.5) * step}" cy="${(y + 0.5) * step}" r="${step * 0.36}"/>`;
    }),
  );
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  return `<svg class="${cls}" viewBox="0 0 100 100" width="${size}" height="${size}" ${a11y}>${dots}</svg>`;
}

export function logo() {
  return logoSVG({ cls: 'logo-svg', label: 'arkdevs' });
}

// Deterministic PRNG so generated covers are identical on every build.
function rng(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h = Math.imul(h ^ (h >>> 13), 3266489909)), ((h ^= h >>> 16) >>> 0) / 4294967296);
}

// Dot-matrix artwork for a project: its monogram, scaled up, on a field of dim dots.
export function cover(p, { cols = 40, rows = 25 } = {}) {
  const S = 10;
  const bitmap = rasterize(p.mono);
  const w = bitmap[0].length;
  const scale = Math.max(1, Math.min(Math.floor((cols - 6) / w), Math.floor((rows - 8) / 7)));
  const ox = Math.floor((cols - w * scale) / 2);
  const oy = Math.floor((rows - 7 * scale) / 2);
  const rand = rng(p.slug);
  const lit = new Set();
  let out = '';
  bitmap.forEach((row, y) =>
    row.forEach((v, x) => {
      if (!v) return;
      for (let dy = 0; dy < scale; dy++)
        for (let dx = 0; dx < scale; dx++) {
          const cx = ox + x * scale + dx;
          const cy = oy + y * scale + dy;
          lit.add(cx + ',' + cy);
          out += `<circle class="l" style="--d:${((cx / cols) * 0.5 + rand() * 0.2).toFixed(2)}s" cx="${cx * S + 5}" cy="${cy * S + 5}" r="3.4"/>`;
        }
    }),
  );
  // Scattered "signal" dots, denser near the monogram.
  for (let i = 0; i < 70; i++) {
    const cx = Math.floor(rand() * cols);
    const cy = Math.floor(rand() * rows);
    if (lit.has(cx + ',' + cy)) continue;
    out += `<circle class="s" style="--d:${(rand() * 3).toFixed(2)}s" cx="${cx * S + 5}" cy="${cy * S + 5}" r="3.4"/>`;
  }
  const rx = Math.min(cols - 2, ox + w * scale + 1);
  const ry = oy + 7 * scale - 1;
  out += `<circle class="r" cx="${rx * S + 5}" cy="${ry * S + 5}" r="3.4"/>`;
  const id = 'g' + p.slug.replace(/[^a-z0-9]/g, '');
  return `<svg class="cover-art" viewBox="0 0 ${cols * S} ${rows * S}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="${id}" width="${S}" height="${S}" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="3.4" class="o"/></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/>${out}</svg>`;
}

function projectVisual(p, rel, { eager = false } = {}) {
  const img = p.images?.[0];
  const loading = eager ? 'eager" fetchpriority="high' : 'lazy';
  if (p.phone && img) {
    return `<div class="visual visual-phones">${p.images
      .slice(0, 3)
      .map((im, i) => `<figure class="phone phone-${i}"><img src="${rel}assets/img/${im.src}" alt="${esc(im.alt)}" width="${im.w}" height="${im.h}" loading="${loading}" decoding="async"></figure>`)
      .join('')}</div>`;
  }
  if (img?.logo) {
    return `<div class="visual visual-logo">${cover({ ...p, mono: ' ' })}<img class="visual-logo-img" src="${rel}assets/img/${img.src}" alt="${esc(img.alt)}" width="200" height="200" loading="${loading}" decoding="async"></div>`;
  }
  if (img?.wide) {
    return `<div class="visual visual-wide"><img src="${rel}assets/img/${img.src}" alt="${esc(img.alt)}" width="${img.w}" height="${img.h}" loading="${loading}" decoding="async"></div>`;
  }
  return `<div class="visual">${cover(p)}</div>`;
}

const chips = (list, cls = 'chip') => `<ul class="chips" role="list">${list.map((t) => `<li class="${cls}">${esc(t)}</li>`).join('')}</ul>`;

const arrow = `<svg class="arr" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ext = `<svg class="arr" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const btn = (href, label, { ghost = false, external = false } = {}) =>
  `<a class="btn${ghost ? ' btn-ghost' : ''}" href="${href}" data-magnetic${external ? ' target="_blank" rel="noopener"' : ''}><span class="btn-label" data-text="${esc(label)}">${esc(label)}</span>${external ? ext : arrow}</a>`;

// ---------------------------------------------------------------- chrome

function header(rel, path) {
  const links = nav
    .map((n) => `<li><a href="${rel}${n.href}"${path.startsWith(n.href) ? ' aria-current="page"' : ''} data-hover>${n.label}</a></li>`)
    .join('');
  const mobile = nav
    .map((n, i) => `<li><a href="${rel}${n.href}"><span class="mono">0${i + 1}</span>${n.label}</a></li>`)
    .join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="nav" id="nav">
  <a class="logo" href="${rel}" aria-label="arkdevs home">${logo()}</a>
  <nav aria-label="Main"><ul class="nav-links" role="list">${links}</ul></nav>
  <a class="nav-cta" href="${rel}contact/" data-magnetic><span class="pulse" aria-hidden="true"></span>Start a project</a>
  <button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><span></span><span></span></button>
</header>
<div class="menu" id="menu" hidden>
  <nav aria-label="Mobile"><ul role="list">${mobile}</ul></nav>
  <div class="menu-foot mono"><a href="mailto:${site.email}">${site.email}</a><span>${site.city}, ${site.country}</span></div>
</div>`;
}

function footer(rel) {
  const svc = services.map((s) => `<li><a href="${rel}services/${s.slug}/">${esc(s.title)}</a></li>`).join('');
  const work = projects
    .slice(0, 6)
    .map((p) => `<li><a href="${rel}work/${p.slug}/">${esc(p.name)}</a></li>`)
    .join('');
  const year = new Date().getFullYear();
  return `<footer class="footer">
  <div class="footer-cta wrap">
    <p class="eyebrow mono">Have a project in mind?</p>
    <a class="footer-big" href="${rel}contact/" data-cursor="Say hi">Let’s build it<span class="red">.</span></a>
  </div>
  <div class="footer-grid wrap">
    <div class="footer-col footer-brand">
      <a class="logo" href="${rel}" aria-label="arkdevs home">${logo()}</a>
      <p>${esc(site.shortDescription)}</p>
      <p class="mono small">Local time in ${site.city} <time class="clock" data-tz="${site.timezone}">--:--</time></p>
    </div>
    <nav class="footer-col" aria-label="Services"><h2 class="mono">Services</h2><ul role="list">${svc}</ul></nav>
    <nav class="footer-col" aria-label="Work"><h2 class="mono">Work</h2><ul role="list">${work}<li><a href="${rel}work/">All work</a></li></ul></nav>
    <div class="footer-col"><h2 class="mono">Company</h2><ul role="list">
      <li><a href="${rel}about/">About</a></li>
      <li><a href="${rel}contact/">Contact</a></li>
      <li><a href="${site.github}" target="_blank" rel="noopener">GitHub</a></li>
      <li><a href="${rel}privacy/">Privacy</a></li>
    </ul>
    <address><a href="mailto:${site.email}">${site.email}</a><br><a href="tel:${site.phone.replace(/\s/g, '')}">${site.phone}</a><br>${site.city}, ${site.country}</address>
    </div>
  </div>
  <div class="footer-mark wrap" aria-hidden="true">${logoSVG({ cls: 'footer-logo', label: '' })}</div>
  <div class="footer-base wrap mono small"><span>© ${year} ${site.legalName}. All rights reserved.</span><span>Built in ${site.city}, by hand.</span><a href="#top" class="to-top" data-hover>Back to top ↑</a></div>
</footer>`;
}

// ---------------------------------------------------------------- structured data

const orgId = `${site.url}/#organization`;
export function orgGraph() {
  return [
    {
      '@type': ['Organization', 'ProfessionalService'],
      '@id': orgId,
      name: site.name,
      alternateName: site.alternateName,
      legalName: site.legalName,
      url: `${site.url}/`,
      logo: { '@type': 'ImageObject', url: abs('icon-512.png'), width: 512, height: 512 },
      image: abs('assets/og/home.png'),
      description: site.description,
      email: site.email,
      telephone: site.phone.replace(/\s/g, ''),
      foundingDate: site.foundingYear,
      founder: { '@type': 'Person', name: site.founder.name, sameAs: [site.founder.github] },
      address: { '@type': 'PostalAddress', addressLocality: site.city, addressRegion: site.region, addressCountry: site.countryCode },
      geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
      areaServed: 'Worldwide',
      priceRange: '$$',
      knowsAbout: site.keywords,
      sameAs: [site.github],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: site.email,
        telephone: site.phone.replace(/\s/g, ''),
        availableLanguage: ['English', 'Tamil', 'Sinhala'],
        areaServed: 'Worldwide',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Software development services',
        itemListElement: services.map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.title, url: abs(`services/${s.slug}/`) },
        })),
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: `${site.url}/`,
      name: site.name,
      alternateName: site.alternateName,
      description: site.shortDescription,
      publisher: { '@id': orgId },
      inLanguage: 'en',
    },
  ];
}

function breadcrumbs(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  };
}

function crumbsHTML(rel, trail) {
  return `<nav class="crumbs mono small" aria-label="Breadcrumb"><ol role="list">${trail
    .map(([name, path], i) =>
      i === trail.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${rel}${path}">${esc(name)}</a></li>`,
    )
    .join('')}</ol></nav>`;
}

// ---------------------------------------------------------------- layout

export function layout({ path, title, description, og, schema = [], body, pageClass = '', rel, assets }) {
  const url = abs(path);
  const fullTitle = path === '' ? `${site.name} | ${title}` : `${title} | ${site.name}`;
  const ogImage = abs(`assets/og/${og}.png`);
  const graph = { '@context': 'https://schema.org', '@graph': [...orgGraph(), ...schema] };
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="author" content="${esc(site.name)}">
<meta name="theme-color" content="${site.themeColor}">
<meta name="color-scheme" content="dark">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}, ${esc(site.name)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="geo.region" content="${site.countryCode}-1">
<meta name="geo.placename" content="${site.city}">
<meta name="geo.position" content="${site.geo.lat};${site.geo.lng}">
<meta name="ICBM" content="${site.geo.lat}, ${site.geo.lng}">
<link rel="icon" href="${rel}favicon.ico" sizes="32x32">
<link rel="icon" href="${rel}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${rel}apple-touch-icon.png">
<link rel="manifest" href="${rel}site.webmanifest">
<link rel="sitemap" type="application/xml" href="${rel}sitemap.xml">
<link rel="preload" href="${rel}assets/fonts/sora-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${rel}assets/fonts/space-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${rel}assets/css/site.css?v=${assets.css}">
<script>(function(d){d.classList.replace('no-js','js');try{if(sessionStorage.getItem('ark:t'))d.classList.add('from-nav');else if(sessionStorage.getItem('ark:seen'))d.classList.add('seen')}catch(e){}})(document.documentElement)</script>
<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>
</head>
<body class="${pageClass}">
<div class="loader" aria-hidden="true"><div class="loader-mark">${symbolSVG({ cls: 'loader-svg' })}</div><div class="loader-count mono"><span class="loader-num">00</span><span class="red">%</span></div></div>
<div class="wipe" aria-hidden="true"></div>
<div class="progress" aria-hidden="true"></div>
<div class="cursor" aria-hidden="true"><span class="cursor-dot"></span><span class="cursor-ring"><span class="cursor-label"></span></span></div>
<div class="grain" aria-hidden="true"></div>
${header(rel, path)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(rel)}
<script src="${rel}assets/js/vendor/gsap.min.js" defer></script>
<script src="${rel}assets/js/vendor/ScrollTrigger.min.js" defer></script>
<script src="${rel}assets/js/vendor/lenis.min.js" defer></script>
<script src="${rel}assets/js/site.js?v=${assets.js}" defer></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- sections

function sectionHead(eyebrow, title, { id, lead = '', link = '' } = {}) {
  return `<div class="sec-head">
    <p class="eyebrow mono" data-reveal><span class="idx">${esc(eyebrow)}</span></p>
    <h2 ${id ? `id="${id}" ` : ''}class="h2" data-split>${title}</h2>
    ${lead ? `<p class="lead" data-reveal>${lead}</p>` : ''}
    ${link}
  </div>`;
}

function serviceCards(rel) {
  return `<ul class="svc-grid" role="list">${services
    .map(
      (s, i) => `<li class="svc" data-reveal style="--n:${i}">
      <a href="${rel}services/${s.slug}/" class="svc-link" data-cursor="Explore">
        <span class="svc-num mono">0${i + 1}</span>
        ${glyph(s.glyph, { size: 64, cls: 'glyph svc-glyph' })}
        <h3 class="h4">${esc(s.title)}</h3>
        <p>${esc(s.short)}</p>
        <span class="svc-more mono">Learn more ${arrow}</span>
      </a></li>`,
    )
    .join('')}</ul>`;
}

function workCard(p, rel, i = 0) {
  return `<article class="card" data-kind="${esc(p.kind)}" data-tags="${esc([p.kind, ...p.tags].join('|'))}" data-reveal style="--n:${i % 3}">
    <a href="${rel}work/${p.slug}/" class="card-link" data-cursor="View">
      <div class="card-media">${projectVisual(p, rel)}</div>
      <div class="card-body">
        <p class="card-meta mono small"><span>${esc(p.kind)}</span><span>${esc(p.year)}</span></p>
        <h3 class="h4">${esc(p.name)}</h3>
        <p>${esc(p.summary)}</p>
        ${chips(p.stack.slice(0, 4))}
      </div>
    </a>
  </article>`;
}

function marquee(items, { reverse = false, big = false } = {}) {
  const row = items.map((t) => `<span class="mq-item">${esc(t)}</span><span class="mq-dot" aria-hidden="true"></span>`).join('');
  return `<div class="marquee${big ? ' marquee-big' : ''}${reverse ? ' is-rev' : ''}" aria-hidden="true"><div class="mq-track"><div class="mq-row">${row}</div><div class="mq-row">${row}</div></div></div>`;
}

function processSection(showHead = true) {
  return `<section class="sec process" aria-labelledby="process-h">
    <div class="wrap process-grid">
      <div class="process-side">${showHead ? sectionHead('How we work', 'From first call to<br>shipped product.', { id: 'process-h', lead: 'A clear process, working software every week, and no surprises on the invoice.' }) : ''}</div>
      <div class="steps-wrap">
        <span class="steps-line" aria-hidden="true"><span class="steps-fill"></span></span>
        <ol class="steps" role="list">${steps.map(([n, t, d]) => `<li class="step" data-reveal><span class="step-n dot-num">${n}</span><div><h3 class="h4">${t}</h3><p>${d}</p></div></li>`).join('')}</ol>
      </div>
    </div>
  </section>`;
}

function faqSection(items = faq) {
  return `<section class="sec faq" aria-labelledby="faq-h">
    <div class="wrap faq-grid">
      ${sectionHead('FAQ', 'Questions, answered.', { id: 'faq-h' })}
      <div class="faq-list">${items
        .map(([q, a]) => `<details class="qa" data-reveal><summary><span>${esc(q)}</span><span class="qa-icon" aria-hidden="true"></span></summary><div class="qa-body"><p>${esc(a)}</p></div></details>`)
        .join('')}</div>
    </div>
  </section>`;
}

const faqSchema = (items = faq) => ({
  '@type': 'FAQPage',
  mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

function cta(rel, title = 'Tell us what you’re building.') {
  return `<section class="sec cta-band" aria-label="Start a project">
    <div class="wrap cta-inner">
      <h2 class="h2" data-split>${title}</h2>
      <p class="lead" data-reveal>We reply within one business day with next steps, and a rough estimate if you share a brief.</p>
      <div class="cta-row" data-reveal>${btn(`${rel}contact/`, 'Start a project')}<a class="link-u mono" href="mailto:${site.email}">${site.email}</a></div>
    </div>
  </section>`;
}

function pageHero(rel, { eyebrow, title, lead, trail }) {
  return `<section class="page-hero wrap">
    ${crumbsHTML(rel, trail)}
    <p class="eyebrow mono" data-reveal>${esc(eyebrow)}</p>
    <h1 class="h1" data-split>${title}</h1>
    ${lead ? `<p class="lead lead-xl" data-reveal>${lead}</p>` : ''}
  </section>`;
}

// ---------------------------------------------------------------- pages

export function homePage(rel) {
  const featured = ['arkstore', 'nmw-inventory', 'arksql', 'jarvis', 'db-crawler', 'softacare'].map(bySlug);
  const own = projects.filter((p) => p.kind === 'Product');
  const statement =
    'We are a senior, hands-on team that designs, builds and ships software for businesses: ERP systems that run the working day, apps people keep installed, and the tools developers use to build everything else.';
  const body = `
<section class="hero" id="top">
  <div class="hero-bar wrap mono small" data-reveal>
    <span><span class="live" aria-hidden="true"></span>Available for new projects</span>
    <span class="hide-sm">${site.city}, ${site.country}</span>
    <span class="hide-sm">Est. ${site.foundingYear}</span>
  </div>
  <div class="hero-matrix"><canvas class="dotmatrix" data-words="WE BUILD|SOFTWARE|THAT SHIPS." data-mode="hero" aria-hidden="true"></canvas></div>
  <div class="hero-copy wrap">
    <h1 class="display" data-split data-delay="0.15">Software solutions,<br><em>engineered end to end.</em></h1>
    <div class="hero-side">
      <p class="lead" data-reveal>Custom ERP and inventory systems, web, mobile and desktop apps, database tooling and AI integrations. Designed, built and shipped from ${site.city} for clients anywhere.</p>
      <div class="cta-row" data-reveal>${btn(`${rel}contact/`, 'Start a project')}${btn(`${rel}work/`, 'See our work', { ghost: true })}</div>
    </div>
  </div>
</section>

${marquee(['Android', 'iOS', 'Windows', 'macOS', 'Linux', 'Web', 'SQL Server', 'PostgreSQL', 'AI agents'], { big: true })}

<section class="sec intro" id="intro" aria-label="About arkdevs">
  <div class="wrap">
    <p class="eyebrow mono" data-reveal><span class="idx">00 / Who we are</span></p>
    <p class="statement" data-scrub>${statement}</p>
    <div class="intro-foot" data-reveal>${btn(`${rel}about/`, 'About the studio', { ghost: true })}</div>
  </div>
</section>

<section class="sec" aria-labelledby="svc-h">
  <div class="wrap">
    ${sectionHead('01 / Services', 'Everything it takes<br>to ship software.', { id: 'svc-h', link: `<a class="link-u mono" href="${rel}services/" data-reveal>All services ${arrow}</a>` })}
    ${serviceCards(rel)}
  </div>
</section>

<section class="sec work-h" aria-labelledby="work-h">
  <div class="wrap">${sectionHead('02 / Selected work', 'Built, shipped,<br>in production.', { id: 'work-h', link: `<a class="link-u mono" href="${rel}work/" data-reveal>All ${projects.length} projects ${arrow}</a>` })}</div>
  <div class="hscroll">
    <div class="hscroll-track">
      ${featured
        .map(
          (p, i) => `<article class="panel">
        <a href="${rel}work/${p.slug}/" class="panel-link" data-cursor="View">
          <div class="panel-media">${projectVisual(p, rel)}</div>
          <div class="panel-info">
            <span class="mono small panel-idx">${String(i + 1).padStart(2, '0')} / ${String(featured.length).padStart(2, '0')}</span>
            <h3 class="h3">${esc(p.name)}</h3>
            <p>${esc(p.summary)}</p>
            <p class="mono small dim">${esc(p.kind)} · ${esc(p.platforms.join(', '))}</p>
          </div>
        </a>
      </article>`,
        )
        .join('')}
      <article class="panel panel-end"><a href="${rel}work/" class="panel-link panel-all" data-cursor="All work"><span class="dot-num">${projects.length}</span><span class="h3">See all projects ${arrow}</span></a></article>
    </div>
  </div>
</section>

<section class="sec stats" aria-label="arkdevs in numbers">
  <div class="wrap stats-grid">
    <div class="stat" data-reveal><span class="dot-num" data-count="${projects.length}">${projects.length}</span><p>Products and systems shipped</p></div>
    <div class="stat" data-reveal><span class="dot-num" data-count="6">6</span><p>Platforms we ship to</p></div>
    <div class="stat" data-reveal><span class="dot-num" data-count="4">4</span><p>Database engines we work in daily</p></div>
    <div class="stat" data-reveal><span class="dot-num" data-count="100" data-suffix="%">100%</span><p>Source code handed to the client</p></div>
  </div>
</section>

<section class="sec products" aria-labelledby="prod-h">
  <div class="wrap">
    ${sectionHead('03 / Our products', 'We build our own<br>tools, too.', { id: 'prod-h', lead: 'Open-source software we design, run and maintain ourselves. The same engineering goes into every client project.' })}
    <ul class="rows" role="list">
      ${own
        .map(
          (p) => `<li class="row" data-reveal><a href="${rel}work/${p.slug}/" data-cursor="Open">
        <span class="row-name h3">${esc(p.name)}</span>
        <span class="row-desc">${esc(p.summary)}</span>
        <span class="row-meta mono small">${esc(p.platforms.slice(0, 3).join(' · '))}${p.platforms.length > 3 ? ' +' + (p.platforms.length - 3) : ''}</span>
        <span class="row-arrow">${arrow}</span>
        <span class="row-preview" aria-hidden="true">${cover(p, { cols: 32, rows: 20 })}</span>
      </a></li>`,
        )
        .join('')}
    </ul>
  </div>
</section>

${processSection()}

<section class="sec stack" aria-labelledby="stack-h">
  <div class="wrap">${sectionHead('05 / Stack', 'Right tool for the job.', { id: 'stack-h', lead: 'We pick technology for your constraints, not for our CV: languages and platforms we have shipped to production.' })}</div>
  ${marquee(stackMarquee.slice(0, 12))}
  ${marquee(stackMarquee.slice(12), { reverse: true })}
</section>

${faqSection()}
${cta(rel)}`;
  return { body, schema: [faqSchema(), { '@type': 'WebPage', '@id': `${site.url}/#webpage`, url: `${site.url}/`, name: site.name, isPartOf: { '@id': `${site.url}/#website` }, about: { '@id': orgId } }] };
}

export function servicesPage(rel) {
  const trail = [['Home', ''], ['Services', 'services/']];
  const body = `
${pageHero(rel, { eyebrow: 'Services', title: 'Software for the way<br><em>your business works.</em>', lead: 'Six disciplines, one team. Most projects use several: an ERP needs a database, a mobile app needs an API, and every product today can use a little AI.', trail })}
<section class="sec">
  <div class="wrap">
    <ol class="svc-list" role="list">${services
      .map(
        (s, i) => `<li class="svc-row" data-reveal><a href="${rel}services/${s.slug}/" data-cursor="Explore">
        <span class="svc-num mono">0${i + 1}</span>
        ${glyph(s.glyph, { size: 72, cls: 'glyph svc-glyph' })}
        <div class="svc-row-main"><h2 class="h3">${esc(s.title)}</h2><p>${esc(s.short)}</p></div>
        ${chips(s.stack.slice(0, 5))}
        <span class="row-arrow">${arrow}</span></a></li>`,
      )
      .join('')}</ol>
  </div>
</section>
${processSection()}
${cta(rel)}`;
  return {
    body,
    schema: [
      breadcrumbs(trail),
      {
        '@type': 'CollectionPage',
        name: 'Services',
        url: abs('services/'),
        mainEntity: { '@type': 'ItemList', itemListElement: services.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`services/${s.slug}/`), name: s.title })) },
      },
    ],
  };
}

export function servicePage(rel, s) {
  const trail = [['Home', ''], ['Services', 'services/'], [s.title, `services/${s.slug}/`]];
  const related = s.work.map(bySlug).filter(Boolean);
  const others = services.filter((x) => x.slug !== s.slug);
  const body = `
<section class="page-hero wrap svc-hero">
  ${crumbsHTML(rel, trail)}
  <div class="svc-hero-grid">
    <div>
      <p class="eyebrow mono" data-reveal>Service</p>
      <h1 class="h1" data-split>${esc(s.title)}</h1>
      <p class="lead lead-xl" data-reveal>${esc(s.intro)}</p>
      <div class="cta-row" data-reveal>${btn(`${rel}contact/?service=${s.slug}`, 'Discuss your project')}</div>
    </div>
    <div class="svc-hero-glyph" data-reveal>${glyph(s.glyph, { size: 320, cls: 'glyph glyph-xl' })}</div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    ${sectionHead('What we deliver', 'What’s included.')}
    <ul class="points" role="list">${s.points
      .map(([t, d], i) => `<li class="point" data-reveal style="--n:${i % 3}"><span class="mono small point-n">0${i + 1}</span><h3 class="h4">${esc(t)}</h3><p>${esc(d)}</p></li>`)
      .join('')}</ul>
  </div>
</section>
<section class="sec">
  <div class="wrap two-col">
    ${sectionHead('Technology', 'The stack we use.')}
    <div data-reveal>${chips(s.stack, 'chip chip-lg')}</div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    ${sectionHead('Related work', 'Where we’ve done it.', { link: `<a class="link-u mono" href="${rel}work/" data-reveal>All work ${arrow}</a>` })}
    <div class="cards">${related.map((p, i) => workCard(p, rel, i)).join('')}</div>
  </div>
</section>
${processSection()}
<section class="sec">
  <div class="wrap">
    ${sectionHead('More services', 'Also from arkdevs.')}
    <ul class="mini-svc" role="list">${others
      .map((o) => `<li data-reveal><a href="${rel}services/${o.slug}/" data-hover>${glyph(o.glyph, { size: 36 })}<span>${esc(o.title)}</span>${arrow}</a></li>`)
      .join('')}</ul>
  </div>
</section>
${cta(rel)}`;
  return {
    body,
    schema: [
      breadcrumbs(trail),
      {
        '@type': 'Service',
        name: s.title,
        serviceType: s.title,
        description: s.description,
        url: abs(`services/${s.slug}/`),
        provider: { '@id': orgId },
        areaServed: 'Worldwide',
        hasOfferCatalog: { '@type': 'OfferCatalog', name: s.title, itemListElement: s.points.map(([t, d]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t, description: d } })) },
      },
    ],
  };
}

export function workPage(rel) {
  const trail = [['Home', ''], ['Work', 'work/']];
  const filters = ['All', 'Product', 'Client', 'Open source', 'Mobile', 'Desktop', 'Database', 'AI', 'ERP'];
  const body = `
${pageHero(rel, { eyebrow: `Work · ${projects.length} projects`, title: 'Things we’ve<br><em>built and shipped.</em>', lead: 'Our own open-source products and systems built for clients: app stores, IDEs, ERPs, AI assistants and more. Every one of them is running today.', trail })}
<section class="sec sec-tight">
  <div class="wrap">
    <div class="filters" role="toolbar" aria-label="Filter projects" data-reveal>${filters
      .map((f, i) => `<button class="filter${i === 0 ? ' is-on' : ''}" data-filter="${f}" aria-pressed="${i === 0}">${f}</button>`)
      .join('')}</div>
    <div class="cards" id="cards">${projects.map((p, i) => workCard(p, rel, i)).join('')}</div>
  </div>
</section>
${cta(rel, 'Your project could be next.')}`;
  return {
    body,
    schema: [
      breadcrumbs(trail),
      {
        '@type': 'CollectionPage',
        name: 'Work',
        url: abs('work/'),
        mainEntity: { '@type': 'ItemList', itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`work/${p.slug}/`), name: p.name })) },
      },
    ],
  };
}

export function projectPage(rel, p) {
  const trail = [['Home', ''], ['Work', 'work/'], [p.name, `work/${p.slug}/`]];
  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];
  const gallery = (p.images || []).filter((im) => !im.logo);
  const body = `
<article class="case">
<section class="page-hero wrap case-hero">
  ${crumbsHTML(rel, trail)}
  <p class="eyebrow mono" data-reveal>${esc(p.kind)} · ${esc(p.year)}</p>
  <h1 class="h1" data-split>${esc(p.name)}</h1>
  <p class="lead lead-xl" data-reveal>${esc(p.summary)}</p>
</section>
<div class="wrap case-visual" data-reveal data-parallax>${projectVisual(p, rel, { eager: true })}</div>
<section class="sec sec-tight">
  <div class="wrap meta-grid">
    <div class="meta" data-reveal><h2 class="mono small">Type</h2><p>${esc(p.kind)}</p></div>
    <div class="meta" data-reveal><h2 class="mono small">Year</h2><p>${esc(p.year)}</p></div>
    <div class="meta" data-reveal><h2 class="mono small">Platforms</h2><p>${esc(p.platforms.join(', '))}</p></div>
    <div class="meta" data-reveal><h2 class="mono small">Links</h2><p>${
      p.links.length ? p.links.map((l) => `<a class="link-u" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)} ${ext}</a>`).join('<br>') : 'Private client project'
    }</p></div>
  </div>
</section>
<section class="sec">
  <div class="wrap two-col">
    <div class="sec-head"><p class="eyebrow mono" data-reveal>Overview</p></div>
    <div class="prose">
      <p class="lead" data-reveal>${esc(p.description)}</p>
      <h2 class="h4" data-reveal>The challenge</h2><p data-reveal>${esc(p.challenge)}</p>
      <h2 class="h4" data-reveal>What we built</h2><p data-reveal>${esc(p.solution)}</p>
    </div>
  </div>
</section>
<section class="sec stats stats-case" aria-label="Key figures">
  <div class="wrap stats-grid stats-3">${p.stats.map(([n, l]) => `<div class="stat" data-reveal><span class="dot-num">${esc(n)}</span><p>${esc(l)}</p></div>`).join('')}</div>
</section>
<section class="sec">
  <div class="wrap">
    ${sectionHead('Features', 'What it does.')}
    <ul class="points" role="list">${p.features
      .map(([t, d], k) => `<li class="point" data-reveal style="--n:${k % 3}"><span class="mono small point-n">0${k + 1}</span><h3 class="h4">${esc(t)}</h3><p>${esc(d)}</p></li>`)
      .join('')}</ul>
  </div>
</section>
${
  gallery.length > 1
    ? `<section class="sec"><div class="wrap">${sectionHead('Gallery', 'Screens.')}<div class="gallery">${gallery
        .map((im) => `<figure class="shot" data-reveal><img src="${rel}assets/img/${im.src}" alt="${esc(im.alt)}" width="${im.w}" height="${im.h}" loading="lazy" decoding="async"><figcaption class="mono small">${esc(im.alt)}</figcaption></figure>`)
        .join('')}</div></div></section>`
    : ''
}
<section class="sec">
  <div class="wrap two-col">
    ${sectionHead('Stack', 'Built with.')}
    <div data-reveal>${chips(p.stack, 'chip chip-lg')}</div>
  </div>
</section>
</article>
<section class="next wrap" aria-label="Next project">
  <a href="${rel}work/${next.slug}/" class="next-link" data-cursor="Next">
    <span class="mono small">Next project</span>
    <span class="next-name">${esc(next.name)}</span>
    <span class="next-art" aria-hidden="true">${cover(next, { cols: 40, rows: 14 })}</span>
  </a>
</section>
${cta(rel, 'Want something like this?')}`;
  const isSoftware = p.kind !== 'Client';
  const entity = isSoftware
    ? {
        '@type': 'SoftwareApplication',
        name: p.name,
        description: p.description,
        url: abs(`work/${p.slug}/`),
        applicationCategory: p.tags.includes('Database') ? 'DeveloperApplication' : p.tags.includes('AI') ? 'UtilitiesApplication' : 'BusinessApplication',
        operatingSystem: p.platforms.join(', '),
        author: { '@id': orgId },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        ...(p.links[0] ? { sameAs: p.links.map((l) => l.href) } : {}),
        ...(p.images?.[0] ? { image: abs(`assets/img/${p.images[0].src}`) } : {}),
      }
    : {
        '@type': 'CreativeWork',
        name: p.name,
        description: p.description,
        url: abs(`work/${p.slug}/`),
        creator: { '@id': orgId },
        dateCreated: p.year,
        keywords: p.stack.join(', '),
      };
  return { body, schema: [breadcrumbs(trail), entity] };
}

export function aboutPage(rel) {
  const trail = [['Home', ''], ['About', 'about/']];
  const body = `
${pageHero(rel, { eyebrow: 'About', title: 'A small team that<br><em>ships big systems.</em>', lead: `arkdevs is a software solutions company in ${site.city}, ${site.country}. We build the systems businesses run on, and the tools developers build with.`, trail })}
<section class="sec">
  <div class="wrap two-col">
    <div class="sec-head"><p class="eyebrow mono" data-reveal>Our story</p></div>
    <div class="prose">
      <p class="lead" data-reveal>arkdevs started with enterprise work: hospital, inventory and finance systems running on SQL Server, the kind of software that has to be right every single day.</p>
      <p data-reveal>That work taught us what most projects lack: version control for the database, safe deployments, real tests against real data, and updates that reach every user without a phone call. So we built those tools ourselves, and released them as open source: ArkSQL for version-controlled SQL, DB Crawler for querying from a phone, Procly for migrating to PostgreSQL, and ArkStore for shipping apps to every platform.</p>
      <p data-reveal>Today we bring the same engineering to every client, from a catalogue website to a fifty-module ERP. You work directly with the engineers who build your product.</p>
    </div>
  </div>
</section>
<section class="sec stats" aria-label="arkdevs in numbers">
  <div class="wrap stats-grid">
    <div class="stat" data-reveal><span class="dot-num" data-count="${projects.length}">${projects.length}</span><p>Products and systems shipped</p></div>
    <div class="stat" data-reveal><span class="dot-num" data-count="${projects.filter((p) => p.kind !== 'Client').length}">${projects.filter((p) => p.kind !== 'Client').length}</span><p>Open-source projects</p></div>
    <div class="stat" data-reveal><span class="dot-num" data-count="6">6</span><p>Platforms we ship to</p></div>
    <div class="stat" data-reveal><span class="dot-num" data-count="${services.length}">${services.length}</span><p>Disciplines under one roof</p></div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    ${sectionHead('Principles', 'What we believe.')}
    <ul class="points points-2" role="list">${principles
      .map(([t, d], i) => `<li class="point" data-reveal style="--n:${i % 2}"><span class="mono small point-n">0${i + 1}</span><h3 class="h4">${esc(t)}</h3><p>${esc(d)}</p></li>`)
      .join('')}</ul>
  </div>
</section>
<section class="sec">
  <div class="wrap two-col">
    <div class="sec-head"><p class="eyebrow mono" data-reveal>Founder</p></div>
    <div class="prose founder" data-reveal>
      ${symbolSVG({ cls: 'founder-mark' })}
      <div>
        <h2 class="h3">${esc(site.founder.name)}</h2>
        <p class="mono small dim">Founder & lead engineer</p>
        <p>Software engineer focused on enterprise systems, databases and AI-powered developer tools. Builds in Go, TypeScript, Dart, Python and C#.</p>
        <p><a class="link-u" href="${site.founder.github}" target="_blank" rel="noopener">GitHub ${ext}</a></p>
      </div>
    </div>
  </div>
</section>
${processSection()}
<section class="sec stack" aria-labelledby="stack-h">
  <div class="wrap">${sectionHead('Stack', 'Right tool for the job.', { id: 'stack-h' })}</div>
  ${marquee(stackMarquee.slice(0, 12))}
  ${marquee(stackMarquee.slice(12), { reverse: true })}
</section>
${cta(rel, 'Let’s work together.')}`;
  return {
    body,
    schema: [
      breadcrumbs(trail),
      { '@type': 'AboutPage', name: 'About arkdevs', url: abs('about/'), about: { '@id': orgId } },
      { '@type': 'Person', name: site.founder.name, jobTitle: 'Founder', worksFor: { '@id': orgId }, sameAs: [site.founder.github] },
    ],
  };
}

export function contactPage(rel) {
  const trail = [['Home', ''], ['Contact', 'contact/']];
  const budgets = ['Under $2k', '$2k – $10k', '$10k – $30k', '$30k+', 'Not sure yet'];
  const body = `
${pageHero(rel, { eyebrow: 'Contact', title: 'Start a<br><em>project.</em>', lead: 'Tell us what you’re building, what it needs to do and when. We reply within one business day.', trail })}
<section class="sec sec-tight">
  <div class="wrap contact-grid">
    <form class="form" id="contactForm" action="${site.formEndpoint || `mailto:${site.email}`}" method="post" data-endpoint="${esc(site.formEndpoint)}" data-email="${esc(site.email)}" novalidate>
      <fieldset class="field-set" data-reveal>
        <legend class="mono small">What do you need?</legend>
        <div class="pick">${services
          .map((s) => `<label class="pick-item"><input type="checkbox" name="services" value="${esc(s.title)}" data-slug="${s.slug}"><span>${esc(s.title)}</span></label>`)
          .join('')}</div>
      </fieldset>
      <div class="field-row">
        <label class="field" data-reveal><span class="mono small">Your name *</span><input name="name" autocomplete="name" required></label>
        <label class="field" data-reveal><span class="mono small">Email *</span><input name="email" type="email" autocomplete="email" required></label>
      </div>
      <div class="field-row">
        <label class="field" data-reveal><span class="mono small">Company</span><input name="company" autocomplete="organization"></label>
        <label class="field" data-reveal><span class="mono small">Budget</span><select name="budget"><option value="">Select a range</option>${budgets.map((b) => `<option>${b}</option>`).join('')}</select></label>
      </div>
      <label class="field" data-reveal><span class="mono small">Tell us about the project *</span><textarea name="message" rows="6" required placeholder="What are you building? Who is it for? Any deadlines?"></textarea></label>
      <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="form-foot" data-reveal>
        <button class="btn" type="submit" data-magnetic><span class="btn-label" data-text="Send message">Send message</span>${arrow}</button>
        <p class="form-status mono small" role="status" aria-live="polite"></p>
      </div>
    </form>
    <aside class="contact-side">
      <div class="contact-card" data-reveal>
        <h2 class="mono small">Email</h2><a class="h4 link-u" href="mailto:${site.email}">${site.email}</a>
      </div>
      <div class="contact-card" data-reveal>
        <h2 class="mono small">Phone / WhatsApp</h2><a class="h4 link-u" href="tel:${site.phone.replace(/\s/g, '')}">${site.phone}</a>
      </div>
      <div class="contact-card" data-reveal>
        <h2 class="mono small">GitHub</h2><a class="h4 link-u" href="${site.github}" target="_blank" rel="noopener">github.com/Ark-Devs ${ext}</a>
      </div>
      <div class="contact-card" data-reveal>
        <h2 class="mono small">Studio</h2><p class="h4">${site.city}, ${site.country}</p><p class="mono small dim">Now <time class="clock" data-tz="${site.timezone}">--:--</time> · GMT+5:30</p>
      </div>
    </aside>
  </div>
</section>
${faqSection(faq.slice(1, 6))}`;
  return {
    body,
    schema: [breadcrumbs(trail), { '@type': 'ContactPage', name: 'Contact arkdevs', url: abs('contact/'), about: { '@id': orgId } }, faqSchema(faq.slice(1, 6))],
  };
}

export function privacyPage(rel) {
  const trail = [['Home', ''], ['Privacy', 'privacy/']];
  const body = `
${pageHero(rel, { eyebrow: 'Legal', title: 'Privacy policy', lead: 'Short version: this site does not track you.', trail })}
<section class="sec sec-tight"><div class="wrap two-col"><div></div><div class="prose">
<h2 class="h4">What we collect</h2>
<p>This website sets no tracking cookies and runs no third-party analytics or advertising scripts. Fonts and scripts are served from this site, not from third parties.</p>
<h2 class="h4">When you contact us</h2>
<p>If you email us or send the contact form, we receive the details you choose to share (such as your name, email address and project description) and use them only to reply to you and discuss your project. We never sell or share them.</p>
<h2 class="h4">Storage in your browser</h2>
<p>The site stores one small session flag in your browser so the intro animation plays once per visit. It contains no personal information and is cleared when you close the tab.</p>
<h2 class="h4">Your rights</h2>
<p>You can ask us at any time to show, correct or delete what we hold about you by writing to <a class="link-u" href="mailto:${site.email}">${site.email}</a>.</p>
<p class="mono small dim">Last updated ${new Date().toISOString().slice(0, 10)}</p>
</div></div></section>`;
  return { body, schema: [breadcrumbs(trail)] };
}

export function notFoundPage(rel) {
  const body = `
<section class="nf wrap">
  <canvas class="dotmatrix" data-words="404|LOST." data-mode="hero" aria-hidden="true"></canvas>
  <h1 class="h1" data-split>This page doesn’t exist.</h1>
  <p class="lead" data-reveal>It may have moved, or the link may be wrong. Try one of these instead.</p>
  <div class="cta-row" data-reveal>${btn(rel, 'Go home')}${btn(`${rel}work/`, 'See our work', { ghost: true })}</div>
</section>`;
  return { body, schema: [] };
}
