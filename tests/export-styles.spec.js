import { test, expect } from '@playwright/test';
import { openFresh, shareState, openState, revealTool } from './helpers.js';

async function exportImage(page, prefs) {
  return page.evaluate(async p => {
    EFL.setExportPrefs(p);
    const c = await formationBuilder.renderExport();
    return { width: c.width, height: c.height, png: c.toDataURL('image/png') };
  }, prefs);
}

test.describe('Branded export', () => {
  test('portrait image adds a header and footer around the pitch', async ({ page }) => {
    await openFresh(page, 'index.html');
    const plain = await exportImage(page, { frame: false });
    const framed = await exportImage(page, { frame: true, size: 'portrait' });
    expect(framed.width).toBeGreaterThan(plain.width);
    expect(framed.height).toBeGreaterThan(plain.height);
  });

  test('square and story sizes have exact dimensions', async ({ page }) => {
    await openFresh(page, '7s.html');
    const square = await exportImage(page, { frame: true, size: 'square' });
    expect([square.width, square.height]).toEqual([2160, 2160]);
    const story = await exportImage(page, { frame: true, size: 'story' });
    expect([story.width, story.height]).toEqual([1440, 2560]);
  });

  test('match details travel in the share link', async ({ page }) => {
    await openFresh(page, '5s.html');
    await revealTool(page, 'imageOptionsBtn');
    await page.locator('#imageOptionsBtn').click();
    await page.fill('#exMatch', 'Thursday Futsal');
    await page.fill('#exVenue', 'Goals, Pitch 3');
    await page.evaluate(() => { formationBuilder.downloadImage = () => { window.saved = true; }; });
    await page.locator('#exSave').click();
    expect(await page.evaluate(() => window.saved)).toBe(true);
    const state = await shareState(page);
    expect(state.m).toEqual({ t: 'Thursday Futsal', d: '', v: 'Goals, Pitch 3' });

    await page.evaluate(() => localStorage.clear());
    await openState(page, '5s.html', state);
    await revealTool(page, 'imageOptionsBtn');
    await page.locator('#imageOptionsBtn').click();
    await expect(page.locator('#exMatch')).toHaveValue('Thursday Futsal');
  });
});
