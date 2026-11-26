# Easy Football Lineup

[easyfootballlineup.com](https://easyfootballlineup.com) is a free football lineup builder: pick a format (5-a-side to 11-a-side), choose formations, add names, and share the lineup as a link or an image. No account, no server: plain HTML, CSS and JavaScript on GitHub Pages.

## Run it locally

```bash
npm install
python3 -m http.server 8080     # then open http://localhost:8080
```

## Tests

```bash
npx playwright install chromium   # first time only
npx playwright test               # all tests, desktop + mobile Chrome
npx playwright test tests/drag-drop.spec.js   # one file
npx playwright show-report        # last report
```

Tests also run on GitHub Actions for every push to `main` and every pull request (`.github/workflows/tests.yml`).

## How the code is organised

| Path | What it is |
| --- | --- |
| `index.html`, `5s.html` … `10s.html` | One page per format. Each sets up `FormationBuilder` with its formations and default names. |
| `js/formation-builder.js` | The core: players, names, share links, the high-resolution image, and the `EFL` event bus features hook into. |
| `js/app.js` | Share bar buttons, toast, and helpers for features (tools row, dialogs). |
| `js/pitch-common.js` | The vector pitch used on screen and in the image. |
| `js/formations.js` | Formation coordinates and default names. |
| `js/feature-*.js`, `css/feature-*.css` | Optional features, one file each (see below). |
| `tests/` | Playwright tests; `tests/<feature>.spec.js` per feature. |

## Features are independent

Each optional feature (team splitter, drag and drop, bench, ...) lives in its own `js/feature-<name>.js` and only talks to the core through `EFL` events, so it can be added or removed on its own. Every page has one marker comment per feature (`<!-- feature: name -->`) and the feature's `<script>` line sits right under it. To remove a feature, delete its script line, its files and its test. See `CLAUDE.md` for the list of events.

Share links store the lineup in the URL hash (`#f=` + LZString-compressed JSON). Keys are only ever added, never renamed, so old links keep working.
