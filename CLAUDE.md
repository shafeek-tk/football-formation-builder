# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Football Formation Builder (easyfootballlineup.com) - a static site for creating and sharing soccer/football formations. Supports 11v11, 9v9, 8v8, 7v7, and 6v6 formats. Hosted on GitHub Pages with a custom domain. No build step - vanilla HTML/CSS/JS served directly.

## Development

**Local server:** `python3 -m http.server 8080` (Playwright config expects port 8080)

**Run all tests:** `npx playwright test`

**Run a single test:** `npx playwright test -g "test name pattern"`

**Run tests headed (see browser):** `npx playwright test --headed`

**View test report:** `npx playwright show-report`

Tests run on Chromium (desktop) and Mobile Chrome (Pixel 5) projects. The Playwright config uses `file://` as baseURL but tests hardcode `http://localhost:8080`.

## Architecture

This is a zero-duplication static site. One `FormationBuilder` class powers all game formats.

### Pages
- `index.html` - 11v11 (two teams, home + away selectors)
- `9s.html`, `8s.html`, `7s.html`, `6s.html` - smaller formats (two teams each)

Each HTML page includes the shared JS/CSS and initializes `FormationBuilder` with a game-type-specific config (formations, default names, etc.).

### Core JS (`js/`)
- **`formation-builder.js`** - `FormationBuilder` class: player rendering, name editing, swap mode, URL sharing (LZString compression), image download (html2canvas), localStorage persistence. This is the main logic file.
- **`formations.js`** - Formation data constants (`FORMATIONS_11V11`, `FORMATIONS_7V7`, etc.) as arrays of layers, where each layer is an array of X-coordinate percentages. Also contains default player name arrays.
- **`pitch-common.js`** - `initializePitch()` function that injects pitch markings (penalty areas, center spot, etc.) into the field div.
- **`common-header.js`** - `createHeader()` generates the header HTML with formation selectors and action buttons.
- **`common-mode-toggle.js`** - `createModeToggle()` generates the game format switcher (11v11/9v9/8v8/7v7/6v6 tabs).
- **`common-footer.js`** - `createFooter()` generates footer HTML.

### CSS (`css/`)
- `pitch-styles.css` - Pitch/field rendering, player positioning, jersey icons
- `app-styles.css` - UI controls, header, buttons, mode toggle, swap animations

### Key Patterns
- Players are positioned using percentage-based `left`/`top` on a relatively-positioned field div.
- Formation data is arrays of "layers" (GK, defense, midfield, etc.); each layer is an array of X% positions. The Y positions are computed by `getLayerY()`.
- Two interaction modes: "edit" (contentEditable player names) and "swap" (tap-to-swap players with fly-out/fly-in animation).
- URL sharing uses LZString compression in the hash fragment (`#f=...`). Supports both old array format and new object format (`{h, a, n}`).
- Player names persist to `localStorage` under key `playerNames`.
- Teams use CSS classes `my-team` (blue/home) and `opp-team` (red/away).

### Tests (`tests/`)
Single Playwright E2E test suite (`formation-builder.spec.js`) covering all formats: page loading, formation changes, name editing, URL sharing round-trips, mobile viewport, and swap feature.
