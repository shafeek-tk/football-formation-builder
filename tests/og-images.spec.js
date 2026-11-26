import { test, expect } from '@playwright/test';
import { BASE, PAGES } from './helpers.js';

test('every page has its own working 1200x630 link preview image', async ({ page, request }) => {
  for (const { file } of PAGES) {
    await page.goto(`${BASE}/${file}`);
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    const tw = await page.locator('meta[name="twitter:image"]').getAttribute('content');
    expect(og).toBe(tw);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    const res = await request.get(og.replace('https://easyfootballlineup.com', BASE));
    expect(res.ok()).toBe(true);
    expect(res.headers()['content-type']).toContain('image/jpeg');
    expect((await res.body()).length).toBeLessThan(300 * 1024); // WhatsApp skips large previews
  }
});
