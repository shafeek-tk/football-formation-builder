# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Football Formation Builder (easyfootballlineup.com) - a static site for creating and sharing soccer/football formations. Supports 11v11, 10v10, 9v9, 8v8, 7v7, 6v6, and 5v5 formats. Hosted on GitHub Pages with a custom domain. No build step - vanilla HTML/CSS/JS served directly. Primary audience is in England (use British English: football, pitch, kickabout).

## Development

**Local server:** `python3 -m http.server 8080` (Playwright config expects port 8080)

**Run all tests:** `npx playwright test`

**Run a single test:** `npx playwright test -g "test name pattern"`

**Run tests headed (see browser):** `npx playwright test --headed`

**View test report:** `npx playwright show-report`

**Cache busting:** When changing CSS/JS, update the `?v=` query param on all `<link>` and `<script>` tags in every HTML page. Use a Unix timestamp: `date +%s`.

Tests run on Chromium (desktop) and Mobile Chrome (Pixel 5) projects. The Playwright config uses `file://` as baseURL but tests hardcode `http://localhost:8080`.

## Architecture

This is a zero-duplication static site. One `FormationBuilder` class powers all game formats.

### Pages
- `index.html` - 11v11 (two teams, home + away selectors)
- `10s.html` - 10v10
- `9s.html` - 9v9
- `8s.html` - 8v8
- `7s.html` - 7v7
- `6s.html` - 6v6
- `5s.html` - 5v5 / futsal

Each HTML page includes the shared JS/CSS and initializes `FormationBuilder` with a game-type-specific config (formations, default names, etc.). The share bar buttons are wired up in `js/app.js`.

### Core JS (`js/`)
- **`formation-builder.js`** - `FormationBuilder` class: player rendering, name editing, swap mode, URL sharing (LZString compression), image download (native high-res canvas renderer, ~2800px long side), localStorage persistence. Contains `getLayerY()` which has a 5v5-specific tighter spacing branch.
- **`formations.js`** - Formation data constants (`FORMATIONS_11V11`, `FORMATIONS_5V5`, `FORMATIONS_10V10`, etc.) as arrays of layers, where each layer is an array of X-coordinate percentages. Also contains default player name arrays for each format.
- **`pitch-common.js`** - `buildPitchSVG(w, h)` builds the vector pitch (grass stripes + true-to-scale markings); `initializePitch()` injects it into the field and redraws on resize. The same SVG is used for the exported image.
- **`common-mode-toggle.js`** - `createModeToggle()` generates the format switcher tabs (11v11, 10v10, 9v9, 8v8, 7v7, 6v6, 5v5). Renders as a segmented control.
- **`common-footer.js`** - `createFooter()` generates feature cards, internal nav links (cross-linking all formats), and attribution footer.

- **`app.js`** - Share bar wiring (Copy Link, Save Image, WhatsApp), `showToast()`, and UI helpers for features: `EFL.addTool()` (a button in the tools row), `EFL.openPanel({ title, build, onClose, anchor })` (a panel: on desktop it drops from the button that opened it, like the formation picker), `EFL.css()` (load a stylesheet). On phones (`EFL.PHONE`, ≤600px) panels, the formation picker and the More menu are short trays along the bottom with no dark overlay: `EFL.revealPitch(tray)` scrolls the pitch into view above the tray, nothing is auto-focused (no keyboard on open), and the `--vv-top`/`--vv-h` variables keep a tray above the on-screen keyboard. Panels show changes on the pitch as you go and save when closed.
- **`vendor/lz-string-1.5.0.min.js`** - Self-hosted LZString used for share links.

### Features (optional, one file each)
Optional features live in `js/feature-<name>.js` (+ `css/feature-<name>.css` loaded with `EFL.css()`), with tests in `tests/<name>.spec.js`. They never edit the core files; they only use the `EFL` event bus defined at the top of `formation-builder.js`:
- `ready(builder)` once the builder exists · `render(builder)` after players are drawn · `player:created(el, builder)` per player
- `change(kind)` after a name edit or swap
- `state:collect(state)` add your own short key to the share-link/undo state · `state:apply(state)` restore it (runs before the redraw)
- `export(canvas)` async pipe over the shared image canvas (return a new canvas to replace it) · `export:player(ctx, el, origin, scale)` and `export:field(ctx, info)` draw extras on the pitch image
- `EFL.track(action, params)` record a user action (`track` event)

Page layout comes from `feature-layout.js`: it moves the controls into groups (Teams & formations, Squad, a toolbar above the pitch with Undo/Redo/More, Share) and puts every other tool button into the More menu. On wide screens (≥1100px) the pitch is centred, with setting up on its left and sharing on its right (Undo, Redo and More move there too, above Share, with Image options and Copy as text). Tests use `revealTool(page, id)` from `tests/helpers.js` to reach a tool wherever it sits.

Each page has one marker comment per feature (`<!-- feature: name -->`) just above the init script. A feature branch adds its `<script src="js/feature-name.js">` line directly under its own marker, so any subset of feature branches merges without conflicts. Features must be loaded before the init script so they see `state:apply` from a share link. A feature that needs a `<head>` line (e.g. the PWA manifest) adds it under its `<!-- feature-head: name -->` marker. Share-link state is additive: never rename or reuse a key, and treat a missing key as "off", so old links keep working.

### CSS (`css/`)
- `pitch-styles.css` - Pitch/field rendering, player positioning, jersey icons
- `app-styles.css` - Dark slate theme (#1a1f2e), UI controls, format tabs, share bar, dropdowns, interaction toggle, swap animations, info sections, responsive breakpoints

### Design System
- **Background:** #1a1f2e (body), #242938 (cards/surfaces), #2f3447 (inputs/borders)
- **Text:** #fff (primary), #d1d5e0 (headings light), #9ca3b4 (body/hints), #6b7689 (muted)
- **Accent:** #22c55e (green, primary actions, active tab)
- **Home label:** #93c5fd (blue) | **Away label:** #fca5a5 (red)
- **Borders:** 1px solid #3d4460
- **Font:** Oswald (Google Fonts)

### Key Patterns
- Players are positioned using percentage-based `left`/`top` on a relatively-positioned field div.
- Formation data is arrays of "layers" (GK, defense, midfield, etc.); each layer is an array of X% positions. The Y positions are computed by `getLayerY()`.
- Two interaction modes: "edit" (contentEditable player names) and "swap" (tap-to-swap players with fly-out/fly-in animation).
- URL sharing uses LZString compression in the hash fragment (`#f=...`). Supports both old array format and new object format (`{h, a, n}`).
- Player names persist to `localStorage` under key `playerNames`.
- Teams use CSS classes `my-team` (blue/home) and `opp-team` (red/away).

### Share Bar
Below the pitch on every page. Three buttons with inline SVG icons:
- **Copy Link** - calls `formationBuilder.shareFormation()` (copies URL with formation data to clipboard, or native share on mobile)
- **Save Image** - calls `formationBuilder.downloadImage()` (renders a ~2800px PNG with the native canvas renderer `renderFieldToCanvas()`; uses Web Share API on mobile for native share sheet)
- **WhatsApp** - on mobile: generates pitch image + formation URL, shares via Web Share API (which shows WhatsApp, iMessage, etc.); on desktop: opens wa.me with formation URL

### SEO
- Each page has unique `<title>`, `<meta description>`, `<h1>` (keyword-first, e.g. "5-a-Side Formation Builder")
- OG tags on every page pointing to `og-image.png`
- Schema.org WebApplication structured data
- Info sections below the pitch with formation explanations and FAQ (crawlable content for Google)
- Internal nav in footer cross-links all formats
- Sitemap at `sitemap.xml`

### Tests (`tests/`)
Single Playwright E2E test suite (`formation-builder.spec.js`) covering all formats: page loading, formation changes, name editing, URL sharing round-trips, mobile viewport, and swap feature.
