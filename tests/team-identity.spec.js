import { test, expect } from '@playwright/test';
import { openFresh, shareState, openState } from './helpers.js';

test.describe('Team names, kits and captains', () => {
  test('set names, colours and captain; they show on the pitch and in the link', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.locator('#teamsBtn').click();
    await page.fill('#tiName_h', 'Bibs');
    await page.fill('#tiName_a', 'Shirts');
    await page.locator('[data-side="h"] .kit-swatch[data-color="#facc15"]').click();
    await page.selectOption('#tiCap_h', '3');
    await page.locator('#tiDone').click();

    const body = page.locator('.my-team .jersey-body').first();
    await expect(body).toHaveCSS('fill', 'rgb(250, 204, 21)');
    // Dark numbers on a light kit
    await expect(page.locator('.my-team .player-number').first()).toHaveCSS('color', 'rgb(17, 24, 39)');
    await expect(page.locator('.my-team[data-index="3"] .captain-badge')).toHaveCount(1);
    // The name is shown beside the pitch, never on the grass
    await expect(page.locator('.team-tag')).toHaveCount(0);
    await expect(page.locator('.home-label')).toHaveText('Bibs:');

    const state = await shareState(page);
    expect(state.t.h).toEqual({ n: 'Bibs', c: '#facc15', k: 3 });
    expect(state.t.a).toEqual({ n: 'Shirts' });

    await page.evaluate(() => localStorage.clear());
    await openState(page, '7s.html', state);
    await expect(page.locator('.away-label')).toHaveText('Shirts:');
    await expect(page.locator('.my-team[data-index="3"] .captain-badge')).toHaveCount(1);
  });

  test('the shared image uses the kit colour', async ({ page }) => {
    await openFresh(page, '5s.html');
    await page.locator('#teamsBtn').click();
    await page.locator('[data-side="h"] .kit-swatch[data-color="#16a34a"]').click();
    await page.locator('#tiDone').click();
    const pixel = await page.evaluate(async () => {
      const c = await formationBuilder.renderFieldToCanvas(document.getElementById('field'));
      const el = document.querySelector('.my-team .player-icon');
      const f = document.getElementById('field').getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const k = c.width / f.width;
      const x = Math.round((r.left - f.left + r.width * 0.3) * k), y = Math.round((r.top - f.top + r.height * 0.75) * k);
      return [...c.getContext('2d').getImageData(x, y, 1, 1).data];
    });
    expect(pixel[1]).toBeGreaterThan(pixel[0] + 40); // green kit
  });
});
