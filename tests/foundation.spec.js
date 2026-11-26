import { test, expect } from '@playwright/test';
import { openFresh, shareState, openState, exportSize } from './helpers.js';

test.describe('Feature foundation', () => {
  test('state round-trips through a share link', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.selectOption('#myTeamFormation', '222');
    await page.locator('.my-team .player-name').first().evaluate(el => {
      el.textContent = 'Keeper'; el.dispatchEvent(new Event('blur'));
    });
    const state = await shareState(page);
    expect(state.h).toBe('222');
    expect(state.n['my-team_0']).toBe('KEEPER');

    await page.evaluate(() => localStorage.clear());
    await openState(page, '7s.html', state);
    await expect(page.locator('#myTeamFormation')).toHaveValue('222');
    await expect(page.locator('.my-team .player-name').first()).toHaveText('KEEPER');
  });

  test('features can extend state and the export through events', async ({ page }) => {
    await openFresh(page, '7s.html');
    const before = await exportSize(page);
    const result = await page.evaluate(async () => {
      EFL.on('state:collect', s => { s.x = 1; });
      EFL.on('export', canvas => {
        const c = document.createElement('canvas');
        c.width = canvas.width; c.height = canvas.height + 100;
        return c;
      });
      const c = await formationBuilder.renderExport();
      return { x: formationBuilder.getState().x, height: c.height };
    });
    expect(result.x).toBe(1);
    expect(result.height).toBe(before.height + 100);
  });

  test('a tool added by a feature shows up in the More menu', async ({ page }) => {
    await openFresh(page, 'index.html');
    await page.evaluate(() => EFL.addTool({ id: 't1', label: 'Test', onClick() {} }));
    await page.locator('#moreBtn').click();
    await expect(page.locator('#moreMenu #t1')).toBeVisible();
    await expect(page.locator('#t1')).toHaveText('Test');
  });

  test('panels open and close with Escape', async ({ page }) => {
    await openFresh(page, 'index.html');
    await page.evaluate(() => EFL.openPanel({ title: 'Hello', build: b => { b.textContent = 'Body'; } }));
    await expect(page.locator('.efl-panel')).toContainText('Body');
    await page.keyboard.press('Escape');
    await expect(page.locator('.efl-panel')).toHaveCount(0);
  });
});
