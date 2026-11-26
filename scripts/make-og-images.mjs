// Builds the 1200x630 link-preview images (images/og/*.jpg) shown when a page
// link is shared on WhatsApp, iMessage, X, Facebook or Slack.
// Run with the local server up:  python3 -m http.server 8080 & node scripts/make-og-images.mjs
import { chromium } from '@playwright/test';

const PAGES = [
  ['index.html', '11-a-side', 'og-11v11.jpg'],
  ['10s.html', '10-a-side', 'og-10v10.jpg'],
  ['9s.html', '9-a-side', 'og-9v9.jpg'],
  ['8s.html', '8-a-side', 'og-8v8.jpg'],
  ['7s.html', '7-a-side', 'og-7v7.jpg'],
  ['6s.html', '6-a-side', 'og-6v6.jpg'],
  ['5s.html', '5-a-side', 'og-5v5.jpg'],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

for (const [file, format, out] of PAGES) {
  await page.goto(`http://localhost:8080/${file}`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`http://localhost:8080/${file}`);
  await page.waitForSelector('.player');
  const pitch = await page.evaluate(async () => {
    await document.fonts.ready;
    const c = await formationBuilder.renderFieldToCanvas(document.getElementById('field'));
    return c.toDataURL('image/png');
  });

  await page.setContent(`<!DOCTYPE html><html><head>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; box-sizing: border-box; }
      body { width: 1200px; height: 630px; overflow: hidden; font-family: Oswald, system-ui, sans-serif;
             background: radial-gradient(120% 140% at 0% 0%, #26304a 0%, #1a1f2e 55%, #131722 100%); color: #fff; }
      .wrap { display: flex; height: 100%; padding: 0 64px 0 72px; align-items: center; gap: 56px; }
      .text { flex: 1; }
      .badge { display: inline-block; background: #22c55e; color: #0b1a10; font-weight: 700; font-size: 26px;
               padding: 6px 16px; border-radius: 8px; letter-spacing: .5px; margin-bottom: 26px; }
      h1 { font-size: 76px; line-height: 1.02; font-weight: 700; letter-spacing: .5px; }
      p { margin-top: 22px; font-size: 30px; color: #b8c0d0; font-weight: 400; line-height: 1.3; }
      .site { margin-top: 38px; font-size: 24px; color: #22c55e; font-weight: 600; letter-spacing: .5px; }
      .pitch { height: 566px; border-radius: 14px; box-shadow: 0 18px 50px rgba(0,0,0,.55); }
    </style></head><body>
    <div class="wrap">
      <div class="text">
        <div class="badge">${format.toUpperCase()}</div>
        <h1>Football Lineup<br>Builder</h1>
        <p>Split your squad into fair teams, pick a formation, share to WhatsApp.</p>
        <div class="site">easyfootballlineup.com · free, no sign-up</div>
      </div>
      <img class="pitch" src="${pitch}">
    </div></body></html>`);
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `images/og/${out}`, type: 'jpeg', quality: 86 });
  await page.setViewportSize({ width: 1200, height: 900 });
  console.log('wrote', out);
}
await browser.close();
