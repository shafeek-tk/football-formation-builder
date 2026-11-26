// "Make your own" banner for people who open a shared lineup, plus the
// crawl files (robots.txt, sitemap, llms.txt) and guide links.
import { test, expect } from '@playwright/test';
import { BASE, PAGES, openFresh } from './helpers.js';

async function sharedLink(page, file = '7s.html') {
  await openFresh(page, file);
  await page.locator('#field .player-name').first().evaluate(el => {
    el.textContent = 'SHAREDNAME';
    el.dispatchEvent(new Event('blur'));
  });
  return page.evaluate(() => window.formationBuilder.buildShareUrl());
}

test('no banner on a normal visit', async ({ page }) => {
  await openFresh(page, '7s.html');
  await expect(page.locator('.share-cta')).toHaveCount(0);
});

test('shared link shows the banner, and "Make your own" starts a fresh lineup', async ({ page }) => {
  const url = await sharedLink(page);
  await page.goto('about:blank');
  await page.goto(url);
  await page.waitForSelector('.player');
  const bar = page.locator('.share-cta');
  await expect(bar).toBeVisible();
  await expect(bar).toContainText('shared with you');
  await page.locator('#makeOwnBtn').click();
  await expect(bar).toHaveCount(0);
  expect(await page.evaluate(() => window.location.hash)).toBe('');
  await expect(page.locator('#field .player-name', { hasText: 'SHAREDNAME' })).toHaveCount(0);
});

test('the banner can be dismissed', async ({ page }) => {
  const url = await sharedLink(page, 'index.html');
  await page.goto('about:blank');
  await page.goto(url);
  await page.locator('.share-cta-close').click();
  await expect(page.locator('.share-cta')).toHaveCount(0);
  // The shared lineup is still there
  await expect(page.locator('#field .player-name', { hasText: 'SHAREDNAME' })).toHaveCount(1);
});

test('robots.txt points to the sitemap, and the sitemap lists every page', async ({ request }) => {
  const robots = await (await request.get(`${BASE}/robots.txt`)).text();
  expect(robots).toContain('Sitemap: https://easyfootballlineup.com/sitemap.xml');
  const sitemap = await (await request.get(`${BASE}/sitemap.xml`)).text();
  for (const { file } of PAGES) {
    const loc = file === 'index.html' ? 'https://easyfootballlineup.com/' : `https://easyfootballlineup.com/${file}`;
    expect(sitemap).toContain(`<loc>${loc}</loc>`);
  }
  expect((await request.get(`${BASE}/llms.txt`)).ok()).toBeTruthy();
});

for (const { file, size } of PAGES) {
  test(`${file} links to its formation guide, and the guide has a share image`, async ({ page, request }) => {
    await openFresh(page, file);
    const link = page.locator('.guide-link a');
    await expect(link).toHaveAttribute('href', `formations/${size}-a-side.html`);
    const guide = await (await request.get(`${BASE}/formations/${size}-a-side.html`)).text();
    expect(guide).toContain(`images/og/og-${size}v${size}.jpg`);
    expect(guide).toContain('"BreadcrumbList"');
  });
}
