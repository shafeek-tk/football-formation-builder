import { test, expect } from '@playwright/test';
import { openFresh, BASE } from './helpers.js';

test.describe('Analytics events', () => {
  test('actions and formation changes become GA events without player names', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.evaluate(() => {
      window.events = [];
      window.gtag = (type, name, params) => { if (type === 'event') window.events.push([name, params]); };
      formationBuilder.shareURL = () => {};
    });
    await page.locator('.my-team .player-name').first().evaluate(el => { el.textContent = 'Secret Name'; el.dispatchEvent(new Event('blur')); });
    await page.locator('#copyLinkBtn').click();
    await page.selectOption('#myTeamFormation', '222');
    const events = await page.evaluate(() => window.events);
    expect(events).toContainEqual(['share_link', { game_type: '7v7' }]);
    expect(events).toContainEqual(['formation_change', { game_type: '7v7', side: 'home', formation: '222' }]);
    expect(JSON.stringify(events)).not.toContain('SECRET');
  });

  test('opening a shared link is counted', async ({ page }) => {
    await openFresh(page, '7s.html');
    const hash = await page.evaluate(() => formationBuilder.buildShareUrl().split('#')[1]);
    await page.goto(`${BASE}/7s.html#${hash}`);
    await page.reload();
    await page.waitForSelector('.player');
    // The page's own gtag() queues calls on dataLayer until Google's script loads
    const names = await page.evaluate(() => window.dataLayer.filter(a => a[0] === 'event').map(a => a[1]));
    expect(names).toContain('open_shared_link');
  });
});
