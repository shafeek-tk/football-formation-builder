import { test, expect } from '@playwright/test';
import { BASE, PAGES } from './helpers.js';

test.describe('Installable app', () => {
  test('every page links a valid manifest with icons', async ({ page, request }) => {
    for (const { file } of PAGES) {
      await page.goto(`${BASE}/${file}`);
      await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest.webmanifest');
    }
    const manifest = await (await request.get(`${BASE}/manifest.webmanifest`)).json();
    expect(manifest.display).toBe('standalone');
    for (const icon of manifest.icons) {
      const res = await request.get(`${BASE}/${icon.src}`);
      expect(res.ok()).toBe(true);
    }
    expect(manifest.icons.some(i => i.purpose === 'maskable')).toBe(true);
  });

  test('service worker installs and serves the page offline', async ({ page, context }) => {
    await page.goto(`${BASE}/7s.html`);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload(); // now controlled by the worker
    await page.waitForSelector('.player');
    await context.setOffline(true);
    await page.reload();
    await page.waitForSelector('.player');
    await expect(page.locator('.player')).toHaveCount(14);
    await context.setOffline(false);
  });
});
