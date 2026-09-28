# arkdevs website

The company site for arkdevs: static, prerendered HTML for every page, motion design, and the files search engines look for. No framework and no runtime dependencies. The build uses only Node's standard library.

```bash
node build.mjs            # → dist/
node serve.mjs            # preview on http://localhost:4173
node tools/check.mjs      # one <h1>, unique titles/descriptions, valid JSON-LD, no broken links
```

`SITE_URL=https://arkdevs.lk node build.mjs` builds for another origin: canonical URLs, the sitemap, social cards and robots.txt follow it, and a custom domain gets a `CNAME`. The default is `https://arkdevs.xyz`; in CI the build uses the address GitHub Pages reports, so a custom domain set in Settings → Pages is picked up automatically.

## Brand

The logo is the arkdevs brand kit (`tools/source/brand`): the brush A with the red swoosh, black `#111111`, red `#E10600`, and Sora. Red stays on the swoosh and small accents. The logo is inlined from `src/lib/brand.mjs`, so it is crisp at any size and can animate. Dot-matrix, the texture our apps share, appears in supporting roles only: the hero display, service icons and project covers.

## Editing content

Everything the site says is in **`src/data.mjs`**: company details, services, projects, process and FAQ. Each project is one object, and its case-study page, card, sitemap entry and structured data are generated from it. Contact details can also come from the environment (`SITE_EMAIL`, `SITE_PHONE`), and `SITE_FORM_ENDPOINT` points the contact form at a form backend (Formspree, Web3Forms…). With no endpoint, the form opens the visitor's mail app.

After changing a title, a project or the brand, regenerate the binary assets (favicons and touch icons from the brand kit, WebP screenshots, one 1200×630 social card per page):

```bash
npm install               # sharp + playwright-core, only needed for this step
npm run assets
```

## Layout

```
build.mjs              renders pages, writes sitemap.xml, robots.txt, site.webmanifest, llms.txt, humans.txt, security.txt
serve.mjs              local preview with clean URLs and the 404 page
src/data.mjs           the content
src/templates.mjs      page templates, dot-matrix covers, JSON-LD
src/lib/dotfont.mjs    the 5×7 dot-matrix font, shared by the build and the browser
src/assets/css/        site.css (brand tokens at the top)
src/assets/js/         site.js (motion), vendor/ (GSAP, ScrollTrigger, Lenis)
src/assets/fonts/      Sora (brand typeface), Space Mono (self-hosted)
src/assets/og/         social cards (generated)
src/static/            favicons, touch icons, _headers (generated / copied to the site root)
tools/make-assets.mjs  generates icons, images and social cards
tools/check.mjs        SEO and link checks, run in CI
tools/source/          original screenshots and logos the assets are made from
tools/source/brand/    the arkdevs brand kit files the site uses (logo, favicons, icons)
```

## Motion

- **Hero:** a canvas dot-matrix display cycling through phrases (the dot-matrix look our apps share), drawn with a 5×7 font. Dots light in a sweep with a red leading edge, swell around the cursor, and ripple on click.
- **Intro and transitions:** the first visit in a session draws the A like a pen stroke and sweeps the red swoosh through it. The footer logo draws itself the same way. Internal links wipe to a dot field and back.
- **Scroll:** Lenis smooth scrolling. Headings reveal word by word, the intro statement lights up as you read, the selected work scrolls sideways while pinned, the process line fills, counters count, and marquees speed up with scroll velocity.
- **Pointer:** custom cursor with context labels, magnetic buttons, spotlight service cards, and project previews that follow the cursor.

It respects `prefers-reduced-motion`, pauses canvases off-screen and in background tabs, turns the cursor off on touch screens, and shows the full page with JavaScript disabled.

## SEO

Every page has a unique title and description, a canonical URL, Open Graph and Twitter cards with its own image, and JSON-LD: `Organization` + `ProfessionalService` (address, geo, contact point, service catalogue), `WebSite`, `BreadcrumbList`, plus `Service`, `SoftwareApplication`/`CreativeWork`, `FAQPage`, `AboutPage` and `ContactPage` where they apply. `sitemap.xml` includes image entries; `llms.txt` summarises the site for AI search.

After the first deploy, add the site to [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters), and submit `sitemap.xml`.

## Deploying

`.github/workflows/deploy.yml` builds and checks the site on every push and pull request, and publishes `main` with GitHub Pages. One-time setup: **Settings → Pages → Source: GitHub Actions**. For a custom domain, add it in the same settings page.

Any static host works too. For Vercel, Netlify or Cloudflare Pages, use the build command `node build.mjs` and the output directory `dist`. `vercel.json` and `_headers` add caching and security headers.
