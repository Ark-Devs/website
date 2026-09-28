// Everything the site says lives here: the company, services, projects and FAQ.
// Pages are generated from this file by build.mjs, so a new project is one object below.

export const site = {
  name: 'arkdevs',
  legalName: 'arkdevs',
  alternateName: 'Ark Devs',
  // Absolute origin the site is served from. Canonical URLs, the sitemap and social
  // cards are built from it. Override at build time: SITE_URL=https://arkdevs.lk npm run build
  // Always https: GitHub Pages reports http:// until its certificate is issued.
  url: (process.env.SITE_URL || 'https://arkdevs.xyz').replace(/\/+$/, '').replace(/^http:\/\/(?!localhost)/, 'https://'),
  get domain() {
    return new URL(this.url).host;
  },
  tagline: 'Software, engineered end to end.',
  description:
    'arkdevs is a software solutions company in Colombo, Sri Lanka. We design and build custom ERP and inventory systems, web, mobile and desktop apps, database tooling and AI integrations, and ship them to production.',
  shortDescription: 'Custom software, apps and AI integrations from Colombo, Sri Lanka.',
  metaDescription:
    'arkdevs is a software development company in Colombo, Sri Lanka: custom ERP systems, web, mobile and desktop apps, database engineering and AI integration.',
  email: process.env.SITE_EMAIL || 'muhammedhspam@gmail.com',
  phone: process.env.SITE_PHONE || '+94 76 090 3997',
  // Optional form backend (Formspree, Web3Forms, Getform…). Empty: the form opens the visitor's mail app.
  formEndpoint: process.env.SITE_FORM_ENDPOINT || '',
  github: 'https://github.com/Ark-Devs',
  founder: { name: 'Mohammed Rahumatulla', github: 'https://github.com/muh4mmedh' },
  foundingYear: '2025',
  city: 'Colombo',
  region: 'Western Province',
  country: 'Sri Lanka',
  countryCode: 'LK',
  timezone: 'Asia/Colombo',
  geo: { lat: 6.9271, lng: 79.8612 },
  locale: 'en_US',
  themeColor: '#111111',
  accent: '#E10600',
  keywords: [
    'software development company Sri Lanka',
    'custom software development Colombo',
    'ERP and inventory systems',
    'mobile app development Sri Lanka',
    'web application development',
    'desktop application development',
    'SQL Server consulting',
    'database migration MSSQL to PostgreSQL',
    'AI integration',
    'MCP server development',
  ],
};

export const nav = [
  { href: 'services/', label: 'Services' },
  { href: 'work/', label: 'Work' },
  { href: 'about/', label: 'About' },
  { href: 'contact/', label: 'Contact' },
];

// 7x7 dot glyphs for the service icons: '#' lit, 'r' the red accent, '.' off.
export const services = [
  {
    slug: 'custom-software',
    title: 'Custom software & ERP',
    short: 'Inventory, POS, finance and operations systems built around how your business actually runs.',
    seoTitle: 'Custom Software & ERP Development in Sri Lanka',
    description:
      'Custom ERP, inventory, POS and finance systems for businesses in Sri Lanka and beyond: purchasing, stock, sales, accounts and reports in one system you own.',
    glyph: ['#######', '#.....#', '#.###.#', '#.....#', '#.###.#', '#.....#', '######r'],
    intro:
      'Off-the-shelf software makes you work its way. We build systems that follow your process: the approval chain you already have, the documents your auditors expect, the reports your managers read on Monday.',
    points: [
      ['Purchasing to payment', 'Purchase orders, GRNs, supplier returns, payment vouchers and cheque registers, with every document traceable back to where it started.'],
      ['Stock you can trust', 'Multi-location stock, transfers, requisitions, physical stock counts, discards and gate passes, reconciled as they happen.'],
      ['Sales and POS', 'Quotations, proforma invoices, invoices, receipts and returns, plus fast point-of-sale screens with barcode printing.'],
      ['Finance built in', 'Chart of accounts, debtors, advances, debit and credit notes, so operations and accounts stop living in two systems.'],
      ['Roles and audit', 'User groups and security per screen and per action. Who changed what, and when, is answered by the system.'],
      ['Print-perfect documents', 'Invoices, receipts and reports rendered to PDF from HTML templates that match your letterhead.'],
    ],
    stack: ['Go', 'Fiber', 'GORM', 'Next.js', 'React', 'SQL Server', 'PostgreSQL', 'S3'],
    work: ['nmw-inventory', 'masjid-management', 'isdn'],
  },
  {
    slug: 'web-development',
    title: 'Web applications',
    short: 'Fast, accessible web apps and websites, from marketing sites to full dashboards and portals.',
    seoTitle: 'Web Application & Website Development',
    description:
      'Web application and website development: React and Next.js front ends, Go APIs, dashboards, portals and e-commerce catalogues that load fast and rank well.',
    glyph: ['#######', '#.#.#.#', '#######', '#.....#', '#.###.#', '#.....#', '######r'],
    intro:
      'A web product has to be quick on a mid-range phone, readable by search engines and screen readers, and still pleasant to maintain a year later. We build for all three from the first commit.',
    points: [
      ['Dashboards and portals', 'Data-heavy interfaces with virtualised grids, filters and live updates over WebSockets.'],
      ['Catalogues and commerce', 'Product catalogues, carts and enquiry flows backed by a clean JSON API.'],
      ['Company websites', 'Prerendered, SEO-ready sites with structured data, sitemaps and real motion design, like this one.'],
      ['APIs that last', 'Typed, versioned REST APIs in Go with timeouts, graceful shutdown and logs that help at 2 a.m.'],
      ['Performance budgets', 'We measure Core Web Vitals and ship less JavaScript, not more.'],
      ['Accessibility', 'Keyboard navigation, focus states, reduced-motion support and semantic markup by default.'],
    ],
    stack: ['TypeScript', 'React', 'Next.js', 'Go', 'Node.js', 'Tailwind', 'Supabase', 'Vercel'],
    work: ['softacare', 'nmw-inventory', 'apps'],
  },
  {
    slug: 'mobile-apps',
    title: 'Mobile apps',
    short: 'Android and iOS apps with native performance, offline support and updates that reach users.',
    seoTitle: 'Mobile App Development for Android & iOS',
    description:
      'Android and iOS app development with Expo, React Native and Flutter: native modules, offline data, background tasks, push notifications and release pipelines.',
    glyph: ['.#####.', '.#...#.', '.#...#.', '.#...#.', '.#...#.', '.#####.', '...#..r'],
    intro:
      'We ship apps that people keep installed: quick to open, careful with battery and data, and updated without friction. One codebase where it makes sense, native code where it matters.',
    points: [
      ['Cross-platform, done properly', 'Expo and React Native, or Flutter, with native modules where the platform needs them.'],
      ['Native cores', 'Performance-critical logic in Go, linked in over FFI and tested on a laptop, not only on a phone.'],
      ['Offline and background', 'Local storage, background tasks and notifications that respect the OS rules.'],
      ['Secure by default', 'Secrets in the platform keystore, never in a file. Sign-in with OAuth providers.'],
      ['Release pipelines', 'CI builds per CPU architecture, signed releases, and in-app updates.'],
      ['Store or sideload', 'Play Store, App Store, or direct distribution when a store is not the right fit.'],
    ],
    stack: ['Expo', 'React Native', 'Flutter', 'Dart', 'Go', 'Kotlin', 'Swift', 'Supabase'],
    work: ['arkstore', 'db-crawler', 'apps'],
  },
  {
    slug: 'desktop-apps',
    title: 'Desktop applications',
    short: 'Windows, macOS and Linux apps with real installers, auto-update and deep OS integration.',
    seoTitle: 'Desktop App Development: Windows, macOS, Linux',
    description:
      'Desktop app development for Windows, macOS and Linux with Electron, WebView2 and .NET: installers, code signing, auto-update and native integrations.',
    glyph: ['#######', '#.....#', '#.....#', '#.....#', '#######', '...#...', '.####.r'],
    intro:
      'Some software belongs on the desktop: tools that talk to local databases, drive the OS, or have to work without a connection. We build them with proper installers and updates, so they feel like part of the machine.',
    points: [
      ['Every OS', 'One app for Windows, macOS and Linux, with the right installer per platform and CPU.'],
      ['Auto-update', 'Release-driven updates, so a tagged version reaches every user on its own.'],
      ['Local-first backends', 'A local Go service with a per-session token, instead of a server in the cloud.'],
      ['Native feel', 'Frameless windows, tray icons, notifications, credential manager, file associations.'],
      ['Developer tools', 'Monaco-based editors, Git integration, diffing and schema-aware autocomplete.'],
      ['Signing and trust', 'Code signing and notarisation set up in CI, so the first launch is not a warning.'],
    ],
    stack: ['Electron', 'React', 'Go', 'WebView2', 'Python', '.NET', 'electron-builder', 'Monaco'],
    work: ['arksql', 'jarvis', 'arkstore'],
  },
  {
    slug: 'database-engineering',
    title: 'Database engineering',
    short: 'SQL Server and PostgreSQL design, tuning, version control and zero-drama migrations.',
    seoTitle: 'Database Engineering & SQL Server Migration',
    description:
      'Database engineering: SQL Server and PostgreSQL schema design, stored procedures, performance tuning, database version control and MSSQL to PostgreSQL migration.',
    glyph: ['.#####.', '#.....#', '.#####.', '#.....#', '.#####.', '#.....#', '.####.r'],
    intro:
      'Most business software is only as good as its database. We have built our own tools for version-controlling stored procedures, migrating engines and querying production safely, and we bring that discipline to yours.',
    points: [
      ['Schema and procedures', 'Tables, indexes and T-SQL or PL/pgSQL that stay fast as the data grows.'],
      ['Version control for SQL', 'Stored procedures in Git, with branches, diffs, reviews and transactional deploys.'],
      ['Engine migrations', 'MSSQL to PostgreSQL with AI-assisted translation and side-by-side review of every routine.'],
      ['Performance', 'Query plans, indexing and the slow report everyone has learned to live with.'],
      ['Safe production access', 'Read-only modes, audited deploys and rollbacks that actually roll back.'],
      ['Four engines', 'SQL Server / Azure SQL, PostgreSQL, MySQL / MariaDB and SQLite.'],
    ],
    stack: ['SQL Server', 'PostgreSQL', 'MySQL', 'SQLite', 'T-SQL', 'PL/pgSQL', 'Git', 'Go'],
    work: ['arksql', 'procly', 'db-crawler'],
  },
  {
    slug: 'ai-integration',
    title: 'AI integration',
    short: 'LLM features, agents and MCP servers that do real work inside your product.',
    seoTitle: 'AI Integration, LLM Agents & MCP Servers',
    description:
      'AI integration services: LLM-powered features, agents with tool use, Model Context Protocol (MCP) servers, computer vision and automation with Claude and Gemini.',
    glyph: ['...#...', '...#...', '.#####.', '###.###', '.#####.', '...#...', '...#..r'],
    intro:
      'AI is useful when it can act: read your data, call your APIs, and ask before it does something that matters. We build assistants and integrations with guardrails, not demos.',
    points: [
      ['Agents with tools', 'Assistants that search, read files, run commands and call APIs, with confirmation before risky actions.'],
      ['MCP servers', 'Model Context Protocol servers so Claude, Codex and other agents can use your product directly.'],
      ['AI-assisted migration', 'LLM translation of legacy code and SQL, always reviewed side by side before it ships.'],
      ['Vision and voice', 'Screen and camera understanding, on-device face recognition, wake words and neural speech.'],
      ['Private by design', 'On-device where possible, your own API keys, nothing stored that does not need to be.'],
      ['Evaluation', 'We test AI features against real cases, so quality is measured rather than assumed.'],
    ],
    stack: ['Claude', 'Gemini', 'MCP', 'Python', 'TypeScript', 'Go', 'OpenCV', 'Edge Functions'],
    work: ['jarvis', 'procly', 'arkstore'],
  },
];

// kind: product (our own software) | client (built for a customer) | open-source
// cover: generated dot-matrix artwork from `mono`, or real images from `images`.
export const projects = [
  {
    slug: 'arkstore',
    name: 'ArkStore',
    kind: 'Product',
    tags: ['Open source', 'Mobile', 'Desktop', 'AI'],
    year: '2026',
    mono: 'ARK',
    summary: 'An app store for software that lives on GitHub, on Android, iPhone, Windows, macOS and Linux.',
    description:
      'ArkStore is arkdevs’ open-source app store for apps published on GitHub. It recognises an app from its repository, installs the right build for each device, and delivers every new release as an update.',
    platforms: ['Android', 'iOS', 'Windows', 'macOS', 'Linux', 'Web'],
    stack: ['Expo SDK 57', 'React Native', 'TypeScript', 'Electron', 'Supabase', 'PostgreSQL', 'Edge Functions', 'MCP'],
    links: [
      { label: 'Source on GitHub', href: 'https://github.com/Ark-Devs/ArkStore' },
      { label: 'Get ArkStore', href: 'https://ark-devs.github.io/ArkStore/download/' },
    ],
    images: [
      { src: 'work/arkstore-today.webp', alt: 'ArkStore Today tab on iPhone, showing the app of the day', w: 1170, h: 1992 },
      { src: 'work/arkstore-app.webp', alt: 'ArkStore app page with the GET button and download stats', w: 1170, h: 1992 },
      { src: 'work/arkstore-install.webp', alt: 'ArkStore installing an app through SideStore on iPhone', w: 1170, h: 1992 },
      { src: 'work/arkstore-guide.webp', alt: 'ArkStore step-by-step iPhone setup guide', w: 1170, h: 1992 },
    ],
    phone: true,
    challenge:
      'Thousands of good apps are published only as GitHub releases. Installing them means finding the right file for your CPU and OS, and nobody tells you when there is an update.',
    solution:
      'ArkStore reads a repository like a store reviewer would: metadata, README, launcher icons, build config and release assets. It publishes a listing, picks the right installer for each phone or computer, and a scheduled Postgres job checks every listing for new releases every 30 minutes.',
    features: [
      ['Recognises apps from a repo', 'Fastlane and Play metadata, README, launcher icons, Gradle config and release assets become a store listing.'],
      ['Right build per device', 'Detects the CPU and installs the matching APK, or the right EXE, MSI, DMG, AppImage, DEB or RPM on desktop.'],
      ['Updates, store style', 'Every new GitHub release reaches users as a notification and a one-tap update.'],
      ['iPhone support', 'An AltStore-format source read by SideStore, with IPA metadata read over HTTP range requests.'],
      ['Ownership-checked publishing', 'Only a repo’s owner or collaborators can publish it, enforced by row-level security.'],
      ['Built for AI agents', 'An MCP server lets Claude Code and Codex search apps, find agent tools and publish from the terminal.'],
    ],
    stats: [['6', 'platforms'], ['30 min', 'release sync'], ['12+', 'installer formats']],
  },
  {
    slug: 'arksql',
    name: 'ArkSQL',
    kind: 'Product',
    tags: ['Open source', 'Desktop', 'Database'],
    year: '2026',
    mono: 'SQL',
    summary: 'A SQL Server IDE with Git built into its bones: branch, diff, merge and deploy stored procedures.',
    description:
      'ArkSQL is a desktop IDE for Microsoft SQL Server that puts database code under real version control. Every procedure, function and view is scripted into a Git repository the app manages.',
    platforms: ['Windows'],
    stack: ['Electron', 'React', 'TypeScript', 'Monaco Editor', 'Go', 'SQL Server', 'Git', 'Zustand'],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/Ark-Devs/SQL-Version-Control-IDE' }],
    images: [],
    challenge:
      'Stored procedures are real code, yet they are usually edited live on servers with no history, no review and no way to keep a test and a production version side by side.',
    solution:
      'ArkSQL scripts every object to a .sql file in a Git repository, shows drift against the baseline, and deploys any branch to any server with CREATE OR ALTER in one transaction per database, all or nothing.',
    features: [
      ['Deep object explorer', 'Tables, keys, indexes, triggers, procedures, functions, types, sequences and security, with drift badges.'],
      ['Monaco SQL editor', 'The VS Code editor with T-SQL highlighting, schema-aware autocomplete and true server-side cancel.'],
      ['Git versioning', 'Branches, per-object history, side-by-side diffs and a merge conflict resolver, pushed to GitHub or Azure DevOps.'],
      ['Transactional deploys', 'Pick a branch and a server, review every script, and deploy with automatic rollback on failure.'],
      ['Cross-database systems', 'One repository tracks a whole system across databases, such as Hospital and Pharmacy.'],
      ['Secrets stay local', 'Passwords and tokens live in Windows Credential Manager; the Go backend is local-only.'],
    ],
    stats: [['Git', 'native'], ['1', 'transaction per deploy'], ['0', 'secrets on disk']],
  },
  {
    slug: 'db-crawler',
    name: 'DB Crawler',
    kind: 'Product',
    tags: ['Open source', 'Mobile', 'Database'],
    year: '2026',
    mono: 'DB',
    summary: 'A SQL client for phones: SQL Server, PostgreSQL, MySQL and SQLite from Android or iOS.',
    description:
      'DB Crawler lets you browse schemas and run queries against SQL Server, Azure SQL, PostgreSQL, MySQL, MariaDB and SQLite from a phone, with no laptop, no VPN appliance and no server in the middle.',
    platforms: ['Android', 'iOS'],
    stack: ['Flutter', 'Dart', 'Go', 'dart:ffi', 'SQL Server', 'PostgreSQL', 'MySQL', 'SQLite'],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/Ark-Devs/DB-Crawler' }],
    images: [{ src: 'work/db-crawler-mark.svg', alt: 'DB Crawler logo', w: 1024, h: 1024, logo: true }],
    challenge:
      'Dart has no mature driver for SQL Server’s TDS protocol, and a phone is the worst place to debug a wire protocol.',
    solution:
      'The interface is Flutter; everything that touches a database is Go, compiled for Android and iOS and called over dart:ffi. The risky parts run and are tested against real databases in CI, no phone required.',
    features: [
      ['Four engines', 'Connections saved on the device with a colour tag, so production never looks like staging.'],
      ['Exact numbers', 'Values cross the FFI boundary as strings, so a DECIMAL(19,4) never loses digits through a float.'],
      ['Query tabs', 'Each tab keeps its own results, with multi-statement batches and a stop button that really cancels.'],
      ['Results grid', 'Pinned header, lazy rows, NULL shown distinctly from empty, export to CSV or JSON.'],
      ['Read-only switch', 'A connection flag that refuses anything that is not a read.'],
      ['Keystore secrets', 'Passwords go into the platform keystore, never into a file.'],
    ],
    stats: [['4', 'SQL engines'], ['2', 'platforms'], ['0', 'servers in between']],
  },
  {
    slug: 'jarvis',
    name: 'J.A.R.V.I.S.',
    kind: 'Product',
    tags: ['Open source', 'Desktop', 'AI'],
    year: '2026',
    mono: 'AI',
    summary: 'A local AI assistant with real control over your computer, wrapped in a holographic HUD.',
    description:
      'JARVIS is a Windows AI assistant that does things instead of explaining them: it finds files, reads the error on your screen, manages processes and hands real software work to Claude Code.',
    platforms: ['Windows'],
    stack: ['Python', 'WebView2', 'Win32', 'Gemini', 'Claude Code', 'SQLite', 'OpenCV', 'Neural TTS'],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/muh4mmedh/Jarvis' }],
    images: [{ src: 'work/jarvis-hud.webp', alt: 'The JARVIS holographic HUD with its arc reactor interface', w: 920, h: 394, wide: true }],
    challenge:
      'Most assistants tell you how to do something. Letting one act on a real computer means solving vision, voice, memory and, above all, trust.',
    solution:
      'A native frameless Win32 app renders the HUD through Edge WebView2 and talks to Python in-process, so no port is ever opened. Every risky action asks first, optionally approved by on-device face recognition.',
    features: [
      ['Sees your screen', 'Takes a screenshot and reads it when you ask what an error means.'],
      ['Controls the machine', 'Files, apps, windows, PowerShell, Python, keyboard, mouse, clipboard and volume.'],
      ['Delegates to Claude Code', 'Hands real software work to Claude Code, waits, and reports back.'],
      ['Wake word and voice', '“Hey JARVIS” always-listening mode and a neural British voice, 47 voices to choose from.'],
      ['Knows your face', 'On-device YuNet and SFace recognition; no image is stored or sent.'],
      ['No server, no port', 'Nothing binds a socket. Only your conversation reaches the model, with your own key.'],
    ],
    stats: [['27 MB', 'single exe'], ['0', 'open ports'], ['47', 'voices']],
  },
  {
    slug: 'procly',
    name: 'Procly',
    kind: 'Product',
    tags: ['Open source', 'Database', 'AI'],
    year: '2026',
    mono: 'PG',
    summary: 'AI-assisted migration of stored procedures and functions from SQL Server to PostgreSQL.',
    description:
      'Procly migrates database logic from Microsoft SQL Server (T-SQL) to PostgreSQL (PL/pgSQL), routine by routine, with AI translation and a human review of every change before it is deployed.',
    platforms: ['Web', 'Windows', 'macOS', 'Linux'],
    stack: ['Go', 'Fiber', 'React', 'Vite', 'Ant Design', 'Gemini', 'SQL Server', 'PostgreSQL'],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/muh4mmedh/Procly' }],
    images: [],
    challenge:
      'Moving tables between engines is solved. Moving hundreds of stored procedures is where migrations stall, because T-SQL and PL/pgSQL differ in hundreds of small ways.',
    solution:
      'Procly lists every routine in the source database, translates each one with a configurable AI prompt, shows original and converted code side by side, and deploys the approved version straight to PostgreSQL.',
    features: [
      ['Per-routine flow', 'Select, convert, review and deploy functions and procedures one at a time.'],
      ['AI translation', 'Gemini translates T-SQL to PL/pgSQL with a system prompt you can tune.'],
      ['Side-by-side review', 'Nothing reaches the target until a person has compared it with the original.'],
      ['Schema and data helpers', 'Creates schemas and runs one-off data migrations.'],
      ['Direct deployment', 'Executes approved SQL on the target PostgreSQL instance.'],
      ['Local vault', 'Encrypted connection history, optionally unlocked with WebAuthn or a PIN.'],
    ],
    stats: [['T-SQL', 'to PL/pgSQL'], ['1', 'routine at a time'], ['100%', 'human reviewed']],
  },
  {
    slug: 'nmw-inventory',
    name: 'NMW Inventory & ERP',
    kind: 'Client',
    tags: ['ERP', 'Web', 'Database'],
    year: '2025',
    mono: 'ERP',
    summary: 'A full inventory, sales and finance system: purchasing, stock, POS, invoicing and accounts.',
    description:
      'A web-based ERP built for a trading business: from purchase order to goods received, stock transfers, point of sale, invoices, receivables and accounts, with print-ready documents for every step.',
    platforms: ['Web'],
    stack: ['Go', 'Fiber', 'GORM', 'Next.js', 'React', 'CoreUI', 'Glide Data Grid', 'SQL Server', 'AWS S3', 'Chromium PDF'],
    links: [],
    images: [],
    challenge:
      'Purchasing, stock, sales and accounts lived in separate tools, so stock levels, receivables and the books never agreed.',
    solution:
      'One system with more than fifty modules sharing the same ledger, a Go API, a fast data-grid front end and HTML templates rendered to PDF for every document the business prints.',
    features: [
      ['Purchasing', 'Purchase orders, GRNs, sundry GRNs, supplier returns and payment vouchers.'],
      ['Stock', 'Locations and racks, transfers, requisitions, consumption, physical stock entry, discards and gate passes.'],
      ['Sales and POS', 'Quotations, proforma invoices, invoices, cashier sessions, receipts, promotions and returns.'],
      ['Finance', 'Account groups, debtors, advances, bank and cheque registers, debit and credit notes.'],
      ['Documents', 'Twenty-plus print templates, from POS receipts to purchase orders, rendered to PDF.'],
      ['Security', 'User groups with per-screen permissions and cashier authorisation.'],
    ],
    stats: [['50+', 'modules'], ['20+', 'print templates'], ['1', 'shared ledger']],
  },
  {
    slug: 'masjid-management',
    name: 'Masjid Management System',
    kind: 'Client',
    tags: ['Web', 'ERP'],
    year: '2025',
    mono: 'MMS',
    summary: 'Membership, registrations, collections and reporting for a community organisation.',
    description:
      'A management system for a masjid and its community: member registrations, collections and transactions, dashboards and printable reports, with role-based access for committee members.',
    platforms: ['Web'],
    stack: ['Go', 'Fiber', 'GORM', 'WebSockets', 'Next.js', 'React', 'SQL Server', 'AWS S3', 'PDF'],
    links: [],
    images: [],
    challenge:
      'Registrations and collections were tracked on paper and spreadsheets, which made reporting to the committee slow and hard to verify.',
    solution:
      'A web system with registrations, transactions and a live dashboard, PDF reports generated on the server and security groups that give each role exactly the access it needs.',
    features: [
      ['Registrations', 'Member and family records with documents stored securely in S3.'],
      ['Transactions', 'Collections and payments with auto-generated reference numbers.'],
      ['Live dashboard', 'Figures update over WebSockets as entries are made.'],
      ['PDF reports', 'Server-side reports ready to print or share with the committee.'],
      ['Roles', 'User groups and security groups for committee, staff and administrators.'],
      ['Legacy friendly', 'Password compatibility with the organisation’s earlier desktop system.'],
    ],
    stats: [['Live', 'dashboard'], ['PDF', 'reports'], ['RBAC', 'access']],
  },
  {
    slug: 'softacare',
    name: 'Softa Care Website',
    kind: 'Client',
    tags: ['Web', 'E-commerce'],
    year: '2026',
    mono: 'SC',
    summary: 'Catalogue and enquiry site for a Sri Lankan medical equipment brand, on a zero-dependency Go API.',
    description:
      'A marketing and product catalogue site for SOFTaCARE, a medical equipment and patient care brand in Sri Lanka, serving both hospital procurement teams and families buying home care products.',
    platforms: ['Web'],
    stack: ['Go', 'Standard library', 'JSON API', 'Vanilla JS', 'HTML', 'CSS', 'S3 / CDN'],
    links: [],
    images: [],
    challenge:
      'Two very different visitors, hospital buyers and families, land on the same homepage and want different things from it.',
    solution:
      'A catalogue with categories, search, editorial stories and a cart, served by a Go API with no external dependencies and a frontend with no build step, designed so either audience finds its path quickly.',
    features: [
      ['Catalogue API', 'Categories, filtering, search, shuffle and pagination over a clean JSON API.'],
      ['Cart', 'Add, update and remove items with server-side pricing.'],
      ['Editorial blocks', 'Homepage stories managed as data, not hard-coded markup.'],
      ['Zero dependencies', 'Go standard library only, and no npm install for the frontend.'],
      ['Config discipline', 'Flags, then environment, then .env; secrets never touch the repository.'],
      ['Ready for inventory', 'Swaps its in-memory catalogue for the live inventory database with one setting.'],
    ],
    stats: [['0', 'dependencies'], ['10', 'API endpoints'], ['2', 'audiences']],
  },
  {
    slug: 'isdn',
    name: 'ISDN Distribution System',
    kind: 'Client',
    tags: ['ERP', 'Web', 'Database'],
    year: '2026',
    mono: 'ISD',
    summary: 'A centralised, island-wide sales distribution management system.',
    description:
      'ISDN manages sales distribution across the island from one place: stock, allocations, invoicing, deliveries and accounts, backed by SQL Server stored procedures and a JWT-secured Go API.',
    platforms: ['Web'],
    stack: ['Go', 'Fiber', 'WebSockets', 'JWT', 'SQL Server', 'Stored procedures', 'React', 'Ant Design', 'Redux Toolkit'],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/muh4mmedh/ISDN' }],
    images: [],
    challenge:
      'Distribution across regions needs one source of truth for stock and orders, while each region works on its own.',
    solution:
      'A central SQL Server database with business rules in stored procedures and functions, a Go REST API with JWT authentication and live updates over WebSockets, and a React and Ant Design interface.',
    features: [
      ['Central database', 'Tables, procedures, functions and seed data scripted and versioned.'],
      ['Secure API', 'RESTful Go API with JWT authentication.'],
      ['Distribution flow', 'Stock allocation, deliveries, delivery notes and gate passes across regions.'],
      ['Customer portal', 'A portal for customers alongside the back office, on the same API.'],
      ['Ant Design UI', 'Consistent tables, forms and filters for everyday operators.'],
      ['Print templates', 'Delivery notes, invoices, GRNs and transfer reports, rendered for print.'],
    ],
    stats: [['Island', 'wide'], ['JWT', 'secured'], ['25+', 'print templates']],
  },
  {
    slug: 'unimanage',
    name: 'UniManage',
    kind: 'Open source',
    tags: ['Web', 'Education'],
    year: '2026',
    mono: 'UNI',
    summary: 'A university course management system for courses, classes, students and faculty.',
    description:
      'UniManage is a .NET 8 web application for universities to manage courses, classes, students and faculty, with Entity Framework Core migrations and a one-click Windows setup.',
    platforms: ['Web'],
    stack: ['.NET 8', 'ASP.NET Core', 'C#', 'Entity Framework Core', 'SQL Server'],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/muh4mmedh/UniManage' }],
    images: [],
    challenge: 'Course and class administration spread across spreadsheets does not scale past one department.',
    solution:
      'A single ASP.NET Core application with EF Core migrations and a setup script that restores, builds, migrates and runs the system in one step.',
    features: [
      ['Courses and classes', 'Course catalogues, class scheduling and enrolment.'],
      ['Students and faculty', 'Records for both sides of the classroom.'],
      ['EF Core migrations', 'Schema changes are versioned and applied automatically.'],
      ['One-click setup', 'A script checks the SDK, installs tooling, migrates and starts the app.'],
      ['SQL Server', 'LocalDB for development, full SQL Server in production.'],
      ['.NET 8', 'Long-term-support runtime and modern C#.'],
    ],
    stats: [['.NET 8', 'LTS'], ['EF Core', 'migrations'], ['1', 'click setup']],
  },
  {
    slug: 'apps',
    name: 'Ark Apps',
    kind: 'Open source',
    tags: ['Web', 'Mobile'],
    year: '2026',
    mono: 'APP',
    summary: 'Installable, offline-first web apps, including a camera-based Rubik’s cube solver.',
    description:
      'A growing collection of small, self-contained web apps that install to the home screen, work offline and also ship as a single Android APK. The first is a Rubik’s cube solver that reads each face through your camera.',
    platforms: ['Web', 'Android'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Service Worker', 'PWA', 'Android', 'Node test runner'],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/muh4mmedh/APPS' }],
    images: [],
    challenge: 'Small tools should open instantly, work without a connection and not need an app store.',
    solution:
      'Plain HTML, CSS and JavaScript with shared design tokens, a service worker for offline use, a launcher with search, and an Android wrapper that packages every app into one APK.',
    features: [
      ['Camera cube solver', 'Show each face to the camera and follow the turns that solve it.'],
      ['Installable', 'Add to Home Screen on any phone or desktop, then use it offline.'],
      ['One APK', 'The launcher and every app packaged for Android.'],
      ['No build step', 'Open a folder and it runs, no bundler or framework.'],
      ['Scaffolding', 'A script creates a new app from a template and registers it.'],
      ['Tested', 'Node tests with no build step.'],
    ],
    stats: [['Offline', 'first'], ['1', 'APK'], ['0', 'frameworks']],
  },
];

export const steps = [
  ['01', 'Discover', 'We learn how your business works today: the people, the paperwork and the numbers that matter. You get a written scope with costs and milestones.'],
  ['02', 'Design', 'Data model, architecture and interface, reviewed with you before code. Clickable screens for anything a user will touch.'],
  ['03', 'Build', 'Short iterations with a working build you can use every week, not a big reveal at the end. Tests and CI from day one.'],
  ['04', 'Ship', 'Deployment, data migration, training and documentation. Installers, app store releases or servers, whatever the product needs.'],
  ['05', 'Support', 'We stay on after launch: monitoring, fixes, new features and updates that reach every user on their own.'],
];

export const principles = [
  ['Own your software', 'You get the source code, the documentation and the keys. No lock-in, no black boxes.'],
  ['Real data, real tests', 'We test against real databases and real devices, because mocks only prove code agrees with itself.'],
  ['Secrets stay secret', 'Credentials live in keystores and vaults, never in files or repositories.'],
  ['Ship, then improve', 'A working version early, then steady releases. Updates reach users without asking them to reinstall.'],
];

export const stackMarquee = [
  'Go', 'TypeScript', 'React', 'Next.js', 'React Native', 'Expo', 'Flutter', 'Dart', 'Electron', 'Python', '.NET', 'C#',
  'SQL Server', 'PostgreSQL', 'MySQL', 'SQLite', 'Supabase', 'AWS', 'Docker', 'GitHub Actions', 'Claude', 'Gemini', 'MCP',
];

export const faq = [
  ['What does arkdevs do?', 'arkdevs is a software solutions company based in Colombo, Sri Lanka. We design, build and maintain custom software: ERP and inventory systems, web applications, Android and iOS apps, Windows, macOS and Linux desktop apps, database tooling and AI integrations.'],
  ['Do you work with clients outside Sri Lanka?', 'Yes. We work remotely with clients anywhere, in English, and overlap comfortably with working hours in Asia, the Middle East, Europe and Australia.'],
  ['How much does a custom software project cost?', 'It depends on scope. After a short discovery call we send a written proposal with a fixed price per milestone, so you know the cost before any work starts.'],
  ['How long does it take to build an app or system?', 'A focused website or tool takes two to six weeks. A mobile app or a business system with several modules usually takes two to four months, delivered in weekly working builds.'],
  ['Who owns the source code?', 'You do. On delivery you receive the full source code, documentation, deployment scripts and credentials.'],
  ['Can you take over or modernise an existing system?', 'Yes. We regularly work with existing SQL Server databases and legacy applications, and can migrate them to new platforms such as PostgreSQL or the web without stopping the business.'],
  ['Do you provide support after launch?', 'Yes. We offer ongoing support and maintenance: monitoring, bug fixes, updates and new features on a monthly plan or on demand.'],
];
