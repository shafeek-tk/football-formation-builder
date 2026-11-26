import { test, expect } from '@playwright/test';
import { BASE } from './helpers.js';

const GUIDES = [['5-a-side', 7], ['6-a-side', 5], ['7-a-side', 7], ['8-a-side', 5], ['9-a-side', 5], ['10-a-side', 4], ['11-a-side', 23]];

test.describe('Formation guides', () => {
  test('hub links to every guide and the footer links to the hub', async ({ page }) => {
    await page.goto(`${BASE}/formations/`);
    await expect(page.locator('.guide-hub-card')).toHaveCount(7);
    await page.goto(`${BASE}/7s.html`);
    await expect(page.locator('.internal-nav a', { hasText: 'Formation guides' })).toHaveAttribute('href', 'formations/');
  });

  for (const [slug, count] of GUIDES) {
    test(`${slug} guide lists every formation with a diagram`, async ({ page }) => {
      await page.goto(`${BASE}/formations/${slug}.html`);
      await expect(page.locator('h1')).toContainText(slug.replace('a-side', 'a-side'), { ignoreCase: true });
      await expect(page.locator('.guide-card')).toHaveCount(count);
      await expect(page.locator('.guide-card svg')).toHaveCount(count);
    });
  }

  test('"Use in the lineup builder" opens the builder with that formation', async ({ page }) => {
    await page.goto(`${BASE}/formations/7-a-side.html`);
    await page.locator('#f-141 .guide-cta').click();
    await page.waitForSelector('.player');
    await expect(page).toHaveURL(/7s\.html#f=/);
    await expect(page.locator('#myTeamFormation')).toHaveValue('141');
    await expect(page.locator('#awayTeamFormation')).toHaveValue('141');
  });
});
