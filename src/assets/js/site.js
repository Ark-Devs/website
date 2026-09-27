/* arkdevs — motion and behaviour.
   One file, no framework. GSAP + ScrollTrigger drive scroll choreography, Lenis smooths
   the scroll, and a canvas renderer draws the dot-matrix type. Everything degrades:
   no JS shows the static page, reduced motion gets no animation, touch gets no cursor. */
(() => {
  'use strict';

  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  const motion = !!(G && ST) && !reduce;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} },
    del: (k) => { try { sessionStorage.removeItem(k); } catch {} },
  };

  if (!motion) doc.classList.add('no-motion');
  if (G && ST) G.registerPlugin(ST);

  // ------------------------------------------------------------ dot-matrix renderer
  const FONT = window.DOTFONT || {};
  function rasterize(text) {
    const chars = [...String(text).toUpperCase()].map((c) => FONT[c] || FONT[' '] || ['...', '...', '...', '...', '...', '...', '...']);
    const rows = Array.from({ length: 7 }, () => []);
    chars.forEach((g, i) => {
      for (let y = 0; y < 7; y++) {
        for (const ch of g[y]) rows[y].push(ch === '#' ? 1 : ch === 'r' ? 2 : 0);
        if (i < chars.length - 1) rows[y].push(0);
      }
    });
    return rows;
  }

  const LEVELS = 24;
  class DotMatrix {
    constructor(canvas) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.mode = canvas.dataset.mode || 'hero';
      this.words = (canvas.dataset.words || 'ARK DEVS.').split('|');
      this.wi = 0;
      this.mouse = { x: -1e4, y: -1e4, a: 0 };
      this.ripples = [];
      this.visible = false;
      // The hero waits for the intro (release()).
      this.hold = true;
      this.started = false;
      this.last = performance.now();
      this.resize();
      new ResizeObserver(() => this.resize()).observe(canvas);
      new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible && !this.started && !this.hold) { this.started = true; this.setWord(0); }
        if (this.visible) this.loop();
      }, { threshold: 0.05 }).observe(canvas);
      if (!reduce) {
        addEventListener('pointermove', (e) => {
          const r = this.c.getBoundingClientRect();
          this.mouse.x = e.clientX - r.left;
          this.mouse.y = e.clientY - r.top;
        }, { passive: true });
        this.c.parentElement.addEventListener('pointerleave', () => { this.mouse.x = this.mouse.y = -1e4; });
        this.c.parentElement.addEventListener('pointerdown', (e) => {
          const r = this.c.getBoundingClientRect();
          this.ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
          if (this.mode === 'hero') this.next();
        });
        if (this.mode === 'hero' && this.words.length > 1) this.timer = setInterval(() => !document.hidden && this.visible && this.next(), 3400);
      }
    }
    resize() {
      const w = this.c.clientWidth, h = this.c.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      this.dpr = dpr; this.w = w; this.h = h;
      this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
      this.sp = w < 600 ? 7 : w < 1000 ? 10 : 12;
      this.cols = Math.max(1, Math.floor(w / this.sp));
      this.rows = Math.max(1, Math.floor(h / this.sp));
      this.ox = (w - (this.cols - 1) * this.sp) / 2;
      this.oy = (h - (this.rows - 1) * this.sp) / 2;
      const n = this.cols * this.rows;
      this.cur = new Float32Array(n); this.tgt = new Float32Array(n); this.nxt = new Float32Array(n);
      this.red = new Uint8Array(n); this.nred = new Uint8Array(n);
      this.st = new Float64Array(n); this.flash = new Float32Array(n);
      this.phase = new Float32Array(n); this.tw = new Uint8Array(n);
      for (let i = 0; i < n; i++) { this.phase[i] = Math.random() * 6.283; this.tw[i] = Math.random() < 0.07 ? 1 : 0; }
      this.sprites();
      if (this.started) this.setWord(this.wi, true);
      this.draw(performance.now());
    }
    sprites() {
      const r = this.sp * 0.34 * this.dpr, big = r * 1.45, size = Math.ceil(big * 2 + 2);
      const mk = (color, rad) => {
        const s = document.createElement('canvas'); s.width = s.height = size;
        const x = s.getContext('2d'); x.fillStyle = color; x.beginPath(); x.arc(size / 2, size / 2, rad, 0, 6.283); x.fill(); return s;
      };
      this.size = size;
      this.gray = []; this.grayBig = [];
      for (let l = 0; l < LEVELS; l++) {
        const v = Math.round(36 + (245 - 36) * (l / (LEVELS - 1)));
        this.gray.push(mk(`rgb(${v},${v},${v})`, r)); this.grayBig.push(mk(`rgb(${v},${v},${v})`, big));
      }
      this.redS = mk('#e10600', r); this.redBig = mk('#e10600', big);
    }
    layout(word) {
      // Fit the phrase on one line if possible, else one word per line.
      const fits = (lines, s) => lines.every((l) => rasterize(l)[0].length * s <= this.cols - 2) && (lines.length * 7 + (lines.length - 1) * 2) * s <= this.rows - 2;
      let lines = [word], s = 6;
      while (s > 1 && !fits(lines, s)) s--;
      if (!fits(lines, s) && word.includes(' ')) {
        lines = word.split(' ');
        s = 6; while (s > 1 && !fits(lines, s)) s--;
      }
      return { lines, s };
    }
    setWord(i, instant = false) {
      this.wi = i;
      const { lines, s } = this.layout(this.words[i]);
      this.nxt.fill(0); this.nred.fill(0);
      const blockH = (lines.length * 7 + (lines.length - 1) * 2) * s;
      let y0 = Math.floor((this.rows - blockH) / 2);
      for (const line of lines) {
        const bm = rasterize(line);
        const lw = bm[0].length * s;
        const x0 = Math.floor((this.cols - lw) / 2);
        bm.forEach((row, y) => row.forEach((v, x) => {
          if (!v) return;
          for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) {
            const cx = x0 + x * s + dx, cy = y0 + y * s + dy;
            if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) continue;
            const k = cy * this.cols + cx; this.nxt[k] = 1; this.nred[k] = v === 2 ? 1 : 0;
          }
        }));
        y0 += 9 * s;
      }
      const now = performance.now();
      for (let k = 0; k < this.nxt.length; k++) {
        const x = k % this.cols;
        this.st[k] = instant || reduce ? 0 : now + (x / this.cols) * 700 + Math.random() * 180;
        if (instant || reduce) { this.tgt[k] = this.cur[k] = this.nxt[k]; this.red[k] = this.nred[k]; }
      }
      if (reduce) this.draw(now);
    }
    next() { if (this.started) this.setWord((this.wi + 1) % this.words.length); }
    release() { this.hold = false; if (!this.started) { this.started = true; this.setWord(0); } }
    loop() {
      if (this.raf || reduce) return;
      const tick = (t) => {
        this.raf = 0;
        if (!this.visible || document.hidden) return;
        this.draw(t);
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }
    draw(t) {
      const { ctx, cols, rows, sp, dpr } = this;
      if (!this.cur) return;
      const dt = Math.min(64, t - this.last); this.last = t;
      const k1 = 1 - Math.pow(0.78, dt / 16.7);
      ctx.clearRect(0, 0, this.c.width, this.c.height);
      const mx = this.mouse.x, my = this.mouse.y, R = Math.max(90, sp * 11), R2 = R * R;
      this.ripples = this.ripples.filter((r) => t - r.t < 1400);
      const half = this.size / 2;
      for (let y = 0; y < rows; y++) {
        const py = this.oy + y * sp;
        for (let x = 0; x < cols; x++) {
          const k = y * cols + x;
          if (this.st[k] && t >= this.st[k]) {
            if (this.nxt[k] > this.tgt[k]) this.flash[k] = 1;
            this.tgt[k] = this.nxt[k]; this.red[k] = this.nred[k]; this.st[k] = 0;
          }
          let b = (this.cur[k] += (this.tgt[k] - this.cur[k]) * k1);
          if (this.tw[k]) b = Math.max(b, 0.1 + 0.08 * Math.sin(t * 0.0021 + this.phase[k]));
          const px = this.ox + x * sp;
          let inf = 0;
          const dx = px - mx, dy = py - my, d2 = dx * dx + dy * dy;
          if (d2 < R2) inf = 1 - Math.sqrt(d2) / R;
          for (const r of this.ripples) {
            const dist = Math.hypot(px - r.x, py - r.y), front = (t - r.t) * 0.9;
            const band = 1 - Math.abs(dist - front) / 50;
            if (band > 0) inf = Math.max(inf, band * (1 - (t - r.t) / 1400));
          }
          b = Math.min(1, b + inf * inf * 0.45);
          const f = this.flash[k];
          if (f > 0) this.flash[k] = Math.max(0, f - dt / 380);
          const bigger = inf > 0.55;
          let s;
          if ((this.red[k] && this.cur[k] > 0.5) || f > 0.55) s = bigger ? this.redBig : this.redS;
          else {
            const l = Math.min(LEVELS - 1, Math.max(0, Math.round(b * (LEVELS - 1))));
            s = bigger ? this.grayBig[l] : this.gray[l];
          }
          ctx.drawImage(s, px * dpr - half, py * dpr - half);
        }
      }
    }
  }
  const matrices = $$('canvas.dotmatrix').map((c) => new DotMatrix(c));

  // ------------------------------------------------------------ smooth scroll
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.095, wheelMultiplier: 1, smoothWheel: true, anchors: false });
    lenis.on('scroll', ST.update);
    G.ticker.add((time) => lenis.raf(time * 1000));
    G.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => {
    if (lenis) return lenis.scrollTo(target, { offset: target === 0 ? 0 : -80, duration: 1.4 });
    const top = target === 0 ? 0 : target.getBoundingClientRect().top + scrollY - 80;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#top' || id === '#') { e.preventDefault(); scrollTo(0); return; }
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); scrollTo(el); }
  });

  // ------------------------------------------------------------ nav, progress, menu
  const nav = $('#nav');
  const progress = $('.progress');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    nav.classList.toggle('is-hidden', y > 400 && y > lastY + 2 && !menuOpen);
    if (y < lastY - 2) nav.classList.remove('is-hidden');
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menu = $('#menu'), menuBtn = $('#menuBtn');
  let menuOpen = false;
  const setMenu = (open) => {
    menuOpen = open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); lenis?.stop(); document.body.style.overflow = 'hidden'; }
    else { menu.classList.remove('is-open'); lenis?.start(); document.body.style.overflow = ''; setTimeout(() => !menuOpen && (menu.hidden = true), 700); }
  };
  menuBtn.addEventListener('click', () => setMenu(!menuOpen));
  addEventListener('keydown', (e) => e.key === 'Escape' && menuOpen && (setMenu(false), menuBtn.focus()));
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => e.matches && menuOpen && setMenu(false));

  // ------------------------------------------------------------ clocks
  const clocks = $$('.clock');
  const tick = () => clocks.forEach((c) => {
    try { c.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: c.dataset.tz }).format(new Date()); } catch {}
  });
  if (clocks.length) { tick(); setInterval(tick, 20000); }

  // ------------------------------------------------------------ page transitions
  const wipe = $('.wipe');
  const internal = (a) => {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return false;
    if (u.pathname === location.pathname && u.hash) return false;
    return true;
  };
  if (motion) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !internal(a)) return;
      e.preventDefault();
      store.set('ark:t', '1');
      if (menuOpen) setMenu(false);
      G.fromTo(wipe, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.55, ease: 'expo.inOut', onComplete: () => { location.href = a.href; } });
    });
  }
  addEventListener('pageshow', (e) => {
    if (e.persisted) { G?.set(wipe, { scaleY: 0 }); doc.classList.remove('from-nav'); }
  });

  // ------------------------------------------------------------ text splitting
  function splitWords(el) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'wd';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = p;
            w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    el.classList.add('is-split');
    return $$('.wi', el);
  }
  const wdStyle = document.createElement('style');
  wdStyle.textContent = '.wd{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em}.wi{display:inline-block;will-change:transform}';
  document.head.appendChild(wdStyle);

  // ------------------------------------------------------------ loader, intro
  const loader = $('.loader');
  const firstVisit = motion && !doc.classList.contains('from-nav') && !store.get('ark:seen');

  // The A is drawn like a pen stroke, then the swoosh sweeps through it (brand mark).
  const drawMark = (svg, { delay = 0, dur = 0.9 } = {}) => {
    const a = $('.lg-a', svg), sw = $('.lg-sw', svg), word = $('.lg-word', svg);
    const tl = G.timeline({ delay });
    tl.fromTo(a, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' })
      .fromTo(sw, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: dur * 0.6, ease: 'expo.out' }, '-=0.25');
    if (word) tl.fromTo(word, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: dur * 0.8, ease: 'expo.out' }, '-=0.5');
    return tl;
  };

  function runLoader() {
    return new Promise((done) => {
      if (!firstVisit || !loader) { loader && (loader.style.display = 'none'); done(); return; }
      store.set('ark:seen', '1');
      loader.style.animation = 'none';
      const num = $('.loader-num', loader), o = { p: 0 };
      drawMark($('.loader-svg', loader), { dur: 0.85 });
      G.to(o, {
        p: 100, duration: 1.3, ease: 'power2.inOut',
        onUpdate: () => { num.textContent = String(Math.round(o.p)).padStart(2, '0'); },
        onComplete: () => {
          G.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut', delay: 0.15, onComplete: () => { loader.style.display = 'none'; } });
          setTimeout(done, 450);
        },
      });
    });
  }

  function runWipeIn() {
    if (!doc.classList.contains('from-nav')) return;
    store.del('ark:t');
    if (!motion) { doc.classList.remove('from-nav'); return; }
    G.fromTo(wipe, { scaleY: 1, transformOrigin: '50% 0%' }, { scaleY: 0, duration: 0.75, ease: 'expo.inOut', delay: 0.05, onComplete: () => doc.classList.remove('from-nav') });
  }

  // ------------------------------------------------------------ scroll choreography
  function animate() {
    if (!motion) {
      $$('[data-split]').forEach((el) => el.classList.add('is-split'));
      return;
    }
    // Headings: word-by-word mask reveal.
    $$('[data-split]').forEach((el) => {
      const words = splitWords(el);
      G.set(words, { yPercent: 110 });
      const inHero = el.closest('.hero, .page-hero, .nf');
      const play = () => G.to(words, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.045, delay: inHero ? Number(el.dataset.delay || 0.05) : 0 });
      if (inHero) play();
      else ST.create({ trigger: el, start: 'top 88%', once: true, onEnter: play });
    });

    // Everything else fades up in batches as it enters.
    const heroReveal = $$('.hero [data-reveal], .page-hero [data-reveal], .nf [data-reveal]');
    G.to(heroReveal, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.09, delay: 0.35 });
    ST.batch($$('[data-reveal]').filter((el) => !heroReveal.includes(el)), {
      start: 'top 90%',
      once: true,
      onEnter: (els) => G.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, overwrite: true }),
    });

    // Statement: words light up as you read.
    $$('[data-scrub]').forEach((el) => {
      const words = splitWords(el).map((w) => w.parentElement);
      words.forEach((w) => w.classList.add('w'));
      G.to(words, { color: '#f5f5f5', stagger: 0.12, ease: 'none', scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 50%', scrub: 0.6 } });
    });

    // Hero: the matrix drifts and fades as the page scrolls away.
    const hm = $('.hero-matrix');
    if (hm) G.to(hm, { yPercent: 18, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    const hc = $('.hero-copy');
    if (hc) G.to(hc, { y: -60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Parallax media.
    $$('[data-parallax]').forEach((el) => {
      const inner = el.firstElementChild;
      G.fromTo(inner, { y: -30 }, { y: 30, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Selected work: pinned horizontal scroll on wide screens.
    const mm = G.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const wrap = $('.hscroll'), track = $('.hscroll-track');
      if (!wrap || !track) return;
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = G.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: wrap, pin: true, start: 'center center', end: () => '+=' + dist(), scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
      $$('.panel-media .visual', track).forEach((v) => {
        G.fromTo(v, { scale: 0.92 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: v, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true } });
      });
    });

    // Footer logo draws itself when it scrolls into view.
    const fl = $('.footer-logo');
    if (fl) {
      G.set([$('.lg-a', fl)], { strokeDasharray: 1, strokeDashoffset: 1 });
      G.set($('.lg-sw', fl), { scaleX: 0, transformOrigin: '0% 50%' });
      G.set($('.lg-word', fl), { opacity: 0 });
      ST.create({ trigger: fl, start: 'top 85%', once: true, onEnter: () => drawMark(fl, { dur: 1.1 }) });
    }

    // Counters.
    $$('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count), suffix = el.dataset.suffix || '', o = { v: 0 };
      el.textContent = '0' + suffix;
      ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => G.to(o, { v: end, duration: 1.8, ease: 'expo.out', onUpdate: () => (el.textContent = Math.round(o.v) + suffix) }) });
    });

    // Process: the line fills and each step lights as it passes the middle.
    $$('.steps-wrap').forEach((list) => {
      const fill = $('.steps-fill', list);
      G.to(fill, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 60%', end: 'bottom 60%', scrub: true } });
      $$('.step', list).forEach((s) => ST.create({ trigger: s, start: 'top 62%', onEnter: () => s.classList.add('is-on'), onLeaveBack: () => s.classList.remove('is-on') }));
    });

    // Marquees speed up with scroll velocity.
    const mqs = $$('.mq-track').map((t) => t.getAnimations()[0]).filter(Boolean);
    if (lenis && mqs.length) {
      let v = 0;
      lenis.on('scroll', (e) => { v = Math.min(6, Math.abs(e.velocity) / 8); });
      G.ticker.add(() => { v *= 0.92; mqs.forEach((a) => (a.playbackRate = 1 + v)); });
    }

    addEventListener('load', () => ST.refresh());
    document.fonts?.ready.then(() => ST.refresh());
  }

  // ------------------------------------------------------------ cursor & magnetics
  function pointerFx() {
    if (!finePointer || !motion) return;
    doc.classList.add('has-cursor');
    const cur = $('.cursor'), dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
    const dx = G.quickTo(dot, 'x', { duration: 0.08 }), dy = G.quickTo(dot, 'y', { duration: 0.08 });
    const rx = G.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = G.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    let shown = false;
    addEventListener('pointermove', (e) => {
      if (!shown) { shown = true; G.set([dot, ring], { x: e.clientX, y: e.clientY }); G.to(cur, { opacity: 1, duration: 0.4 }); }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const l = e.target.closest('[data-cursor]');
      const h = e.target.closest('a, button, [data-hover], summary, label');
      cur.classList.toggle('has-label', !!l);
      cur.classList.toggle('is-hover', !l && !!h);
      if (l) label.textContent = l.dataset.cursor;
    });
    addEventListener('pointerdown', () => cur.classList.add('is-down'));
    addEventListener('pointerup', () => cur.classList.remove('is-down'));
    doc.addEventListener('mouseleave', () => G.to(cur, { opacity: 0, duration: 0.3 }));
    doc.addEventListener('mouseenter', () => G.to(cur, { opacity: 1, duration: 0.3 }));

    $$('[data-magnetic]').forEach((el) => {
      const x = G.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }), y = G.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * 0.28); y((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', () => { G.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' }); });
    });

    $$('.svc-link').forEach((el) => el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px');
    }));

    $$('.row a').forEach((a) => {
      const pv = $('.row-preview', a);
      if (!pv) return;
      const px = G.quickTo(pv, 'left', { duration: 0.6, ease: 'power3' }), py = G.quickTo(pv, 'top', { duration: 0.6, ease: 'power3' });
      a.addEventListener('pointermove', (e) => { const r = a.getBoundingClientRect(); px(e.clientX - r.left); py(e.clientY - r.top); });
    });
  }

  // ------------------------------------------------------------ work filters
  function filters() {
    const btns = $$('.filter');
    if (!btns.length) return;
    const cards = $$('#cards .card');
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      const f = b.dataset.filter;
      const show = cards.filter((c) => f === 'All' || c.dataset.tags.split('|').includes(f));
      cards.forEach((c) => c.classList.toggle('is-out', !show.includes(c)));
      if (motion) G.fromTo(show, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, overwrite: true });
      ST?.refresh();
    }));
  }

  // ------------------------------------------------------------ contact form
  function form() {
    const f = $('#contactForm');
    if (!f) return;
    const status = $('.form-status', f);
    const pre = new URLSearchParams(location.search).get('service');
    if (pre) $$('input[name="services"]', f).forEach((i) => { if (i.dataset.slug === pre) i.checked = true; });
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(f);
      if (data.get('_gotcha')) return;
      let bad = false;
      ['name', 'email', 'message'].forEach((n) => {
        const el = f.elements[n];
        const ok = el.value.trim() && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        el.classList.toggle('is-bad', !ok);
        if (!ok) bad = true;
      });
      if (bad) { status.className = 'form-status mono small is-err'; status.textContent = 'Please fill in your name, a valid email and a message.'; return; }
      const services = data.getAll('services').join(', ') || 'Not specified';
      const endpoint = f.dataset.endpoint;
      if (endpoint) {
        status.className = 'form-status mono small'; status.textContent = 'Sending…';
        try {
          const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error(String(res.status));
          f.reset();
          status.className = 'form-status mono small is-ok'; status.textContent = 'Thanks! We’ll reply within one business day.';
        } catch {
          status.className = 'form-status mono small is-err'; status.textContent = 'Could not send. Please email us directly.';
        }
        return;
      }
      const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company') || '-'}\nBudget: ${data.get('budget') || '-'}\nServices: ${services}\n\n${data.get('message')}`;
      location.href = `mailto:${f.dataset.email}?subject=${encodeURIComponent('New project: ' + (data.get('company') || data.get('name')))}&body=${encodeURIComponent(body)}`;
      status.className = 'form-status mono small is-ok'; status.textContent = 'Opening your email app…';
    });
  }

  // ------------------------------------------------------------ boot
  filters();
  form();
  pointerFx();
  runWipeIn();
  runLoader().then(() => {
    animate();
    matrices.forEach((m) => m.release());
  });
})();
