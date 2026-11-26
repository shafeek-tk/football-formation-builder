// Builds the static formation guide pages in formations/ from the formation
// data in js/formations.js and the text in scripts/formation-guides-content.mjs.
// Run:  node scripts/make-formation-guides.mjs   (needs `npm install` for lz-string)
import fs from 'fs';
import vm from 'vm';
import { createRequire } from 'module';
import { FORMATS } from './formation-guides-content.mjs';

const require = createRequire(import.meta.url);
const LZString = require('lz-string');
const SITE = 'https://easyfootballlineup.com';

// Load the formation constants exactly as the site uses them
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/formations.js', 'utf8') + '\n;this.F = { FORMATIONS_11V11, FORMATIONS_10V10, FORMATIONS_9V9, FORMATIONS_8V8, FORMATIONS_7V7, FORMATIONS_6V6, FORMATIONS_5V5 };', ctx);

const label = key => key.split('').join('-');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Small static pitch diagram of one formation (attacking upwards). */
function diagram(layers) {
  const W = 120, H = 170, pad = 6;
  const outfield = layers.length - 1;
  const y = i => i === 0 ? H - 16 : (outfield === 1 ? H * 0.42 : H - 42 - (i - 1) * ((H - 42 - 26) / (outfield - 1)));
  const dots = layers.flatMap((layer, i) => layer.map(x => {
    const cx = pad + (x / 100) * (W - pad * 2);
    return `<circle cx="${cx.toFixed(1)}" cy="${y(i).toFixed(1)}" r="6.5" fill="${i === 0 ? '#facc15' : '#1f6fe0'}" stroke="#fff" stroke-width="1.6"/>`;
  })).join('');
  return `<svg class="guide-pitch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagram of the ${label(layers.map(l => l.length).slice(1).join(''))} formation">
    <rect width="${W}" height="${H}" rx="6" fill="#2f8a3b"/>
    <g fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.2">
      <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="2"/>
      <line x1="4" y1="${H / 2}" x2="${W - 4}" y2="${H / 2}"/>
      <circle cx="${W / 2}" cy="${H / 2}" r="14"/>
      <rect x="${W / 2 - 26}" y="4" width="52" height="22"/>
      <rect x="${W / 2 - 26}" y="${H - 26}" width="52" height="22"/>
    </g>${dots}</svg>`;
}

function head({ title, description, path }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${SITE}/${path}">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${SITE}/${path}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Easy Football Lineup">
    <meta name="twitter:card" content="summary">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚽</text></svg>">
    <link rel="stylesheet" href="../css/app-styles.css?v=1795660000">
    <link rel="stylesheet" href="../css/guides.css?v=1795660000">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-BGH9W2K44G"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-BGH9W2K44G');
    </script>
</head>`;
}

function nav(current) {
  return `<nav class="guide-nav" aria-label="Formation guides">
        <a href="index.html"${current === 'index' ? ' aria-current="page"' : ''}>All guides</a>
        ${FORMATS.map(f => `<a href="${f.slug}.html"${current === f.slug ? ' aria-current="page"' : ''}>${f.slug}</a>`).join('\n        ')}
    </nav>`;
}

/** Formations offered on the format's page, in picker order (keys like '231' would sort numerically). */
function pickerKeys(fmt) {
  const select = fs.readFileSync(fmt.page, 'utf8').match(/<select id="myTeamFormation"[\s\S]*?<\/select>/)[0];
  return [...select.matchAll(/<option value="([^"]+)"/g)].map(m => m[1]);
}

fs.mkdirSync('formations', { recursive: true });

for (const fmt of FORMATS) {
  const data = ctx.F[fmt.key];
  const keys = pickerKeys(fmt);
  for (const k of keys) if (!fmt.formations[k] || !data[k]) throw new Error(`Missing ${fmt.game} ${k}`);
  const path = `formations/${fmt.slug}.html`;
  const description = `${fmt.title.replace('Formations', 'formations')} explained: ${keys.slice(0, 4).map(label).join(', ')} and more, with diagrams, strengths, weaknesses and a free lineup builder.`;
  const sections = keys.map(k => {
    const [summary, pros, cons, best] = fmt.formations[k];
    const hash = LZString.compressToEncodedURIComponent(JSON.stringify({ h: k, a: k }));
    return `
        <section class="guide-card" id="f-${k}">
            ${diagram(data[k])}
            <div class="guide-text">
                <h2>${label(k)}</h2>
                <p>${esc(summary)}</p>
                <dl>
                    <dt>Strengths</dt><dd>${esc(pros)}</dd>
                    <dt>Watch out for</dt><dd>${esc(cons)}</dd>
                    <dt>Best for</dt><dd>${esc(best)}</dd>
                </dl>
                <a class="guide-cta" href="../${fmt.page}#f=${hash}">Use ${label(k)} in the lineup builder →</a>
            </div>
        </section>`;
  }).join('');
  const html = `${head({ title: `${fmt.title}: ${keys.length} Shapes Explained | Easy Football Lineup`, description, path })}
<body>
    <div class="guide">
        ${nav(fmt.slug)}
        <header class="guide-head">
            <h1>${fmt.title} Explained</h1>
            <p>${esc(fmt.intro)}</p>
            <a class="guide-cta guide-cta--main" href="../${fmt.page}">Open the free ${fmt.slug} lineup builder</a>
        </header>
        ${sections}
        <p class="guide-foot">Pick a formation, add your players, split teams fairly and share the lineup to WhatsApp with <a href="../${fmt.page}">Easy Football Lineup</a>. Free, no sign-up.</p>
    </div>
</body>
</html>
`;
  fs.writeFileSync(path, html);
  console.log('wrote', path);
}

// Hub page
const hub = `${head({ title: 'Football Formations Guide: 5-a-side to 11-a-side | Easy Football Lineup', description: 'Every football formation for 5, 6, 7, 8, 9, 10 and 11-a-side, with diagrams, strengths and weaknesses, and a free lineup builder to try them.', path: 'formations/' })}
<body>
    <div class="guide">
        ${nav('index')}
        <header class="guide-head">
            <h1>Football Formations Guide</h1>
            <p>Every formation in the lineup builder, for every team size, with a diagram and what it is good at.</p>
        </header>
        <div class="guide-hub">
        ${FORMATS.map(f => `<a class="guide-hub-card" href="${f.slug}.html"><strong>${f.title}</strong><span>${pickerKeys(f).map(label).join(' · ')}</span></a>`).join('\n        ')}
        </div>
    </div>
</body>
</html>
`;
fs.writeFileSync('formations/index.html', hub);
console.log('wrote formations/index.html');
