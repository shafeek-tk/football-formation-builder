import { test, expect } from '@playwright/test';
import { openFresh, shareState, openState } from './helpers.js';

/** Drag one element onto another element, or to a point inside the field (in %). */
async function drag(page, from, to) {
  await from.scrollIntoViewIfNeeded();
  const a = await from.locator('.player-icon').boundingBox();
  let tx, ty;
  if (to.pct) {
    const f = await page.locator('#field').boundingBox();
    tx = f.x + f.width * to.pct[0] / 100; ty = f.y + f.height * to.pct[1] / 100;
  } else {
    const b = await to.locator('.player-icon').boundingBox();
    tx = b.x + b.width / 2; ty = b.y + b.height / 2;
  }
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 + 10, { steps: 3 });
  await page.mouse.move(tx, ty, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(800); // swap animation
}

test.describe('Drag players', () => {
  // Tall enough that both halves of the pitch are on screen with every tool merged
  test.use({ viewport: { width: 1280, height: 1300 } });

  test('no mode toggle; a hint explains tap and drag', async ({ page }) => {
    await openFresh(page, 'index.html');
    await expect(page.locator('.toggle-pill')).toHaveCount(0);
    await expect(page.locator('.interaction-hint')).toContainText('Drag a player');
    const editable = await page.locator('.player-name').evaluateAll(els => els.every(el => el.isContentEditable));
    expect(editable).toBe(true);
  });

  for (const file of ['index.html', '7s.html', '5s.html']) {
    test(`drag onto another player swaps them across teams on ${file}`, async ({ page }) => {
      await openFresh(page, file);
      const home = page.locator('.my-team.player').nth(1);
      const away = page.locator('.opp-team.player').nth(1);
      const homeName = await home.locator('.player-name').textContent();
      const awayName = await away.locator('.player-name').textContent();
      await drag(page, home, away);
      await expect(home.locator('.player-name')).toHaveText(awayName);
      await expect(away.locator('.player-name')).toHaveText(homeName);
    });
  }

  test('swap within a team survives reload and share link', async ({ page }) => {
    await openFresh(page, 'index.html');
    const a = page.locator('.my-team.player').nth(2);
    const b = page.locator('.my-team.player').nth(3);
    const nameA = await a.locator('.player-name').textContent();
    const nameB = await b.locator('.player-name').textContent();
    await drag(page, a, b);
    await page.reload();
    await page.waitForSelector('.player');
    await expect(page.locator('.my-team .player-name').nth(2)).toHaveText(nameB);
    const state = await shareState(page);
    await page.evaluate(() => localStorage.clear());
    await openState(page, 'index.html', state);
    await expect(page.locator('.my-team .player-name').nth(3)).toHaveText(nameA);
  });

  test('drag onto grass moves the player, the link keeps it, reset puts it back', async ({ page }) => {
    await openFresh(page, '7s.html');
    const p = page.locator('.my-team.player').nth(6);
    const before = await p.evaluate(el => [el.style.left, el.style.top]);
    await drag(page, p, { pct: [20, 60] });
    const after = await p.evaluate(el => [parseFloat(el.style.left), parseFloat(el.style.top)]);
    expect(after[0]).toBeCloseTo(20, 0);
    expect(after[1]).toBeCloseTo(60, 0);

    const state = await shareState(page);
    expect(state.p.h.p['6']).toEqual([expect.closeTo(20, 0), expect.closeTo(60, 0)]);
    await openState(page, '7s.html', state);
    expect(await page.locator('.my-team.player').nth(6).evaluate(el => parseFloat(el.style.left))).toBeCloseTo(20, 0);

    await expect(page.locator('#resetPositionsBtn')).toBeVisible();
    await page.locator('#resetPositionsBtn').click();
    expect(await page.locator('.my-team.player').nth(6).evaluate(el => [el.style.left, el.style.top])).toEqual(before);
    await expect(page.locator('#resetPositionsBtn')).toBeHidden();
  });

  test('changing the formation clears moved positions for that team', async ({ page }) => {
    await openFresh(page, '7s.html');
    await drag(page, page.locator('.my-team.player').nth(6), { pct: [20, 60] });
    await page.selectOption('#myTeamFormation', '222');
    const state = await shareState(page);
    expect(state.p).toBeUndefined();
  });

  test('a tap without moving still edits the name', async ({ page }) => {
    await openFresh(page, '6s.html');
    const name = page.locator('.my-team .player-name').first();
    await name.click();
    await page.keyboard.type('Zara');
    await page.keyboard.press('Enter');
    await expect(name).toHaveText('ZARA');
  });

  test('the shared image shows a moved player where it was dropped', async ({ page }) => {
    await openFresh(page, '5s.html');
    await drag(page, page.locator('.my-team.player').nth(4), { pct: [85, 55] });
    const ok = await page.evaluate(async () => {
      const field = document.getElementById('field');
      const c = await formationBuilder.renderFieldToCanvas(field);
      const icon = document.querySelectorAll('.my-team .player-icon')[4].getBoundingClientRect();
      const f = field.getBoundingClientRect();
      const k = c.width / f.width;
      const d = c.getContext('2d').getImageData(Math.round((icon.left - f.left + icon.width * 0.3) * k), Math.round((icon.top - f.top + icon.height * 0.75) * k), 1, 1).data;
      return d[2] > d[1]; // blue shirt, not grass
    });
    expect(ok).toBe(true);
  });

  test('holding a player near the screen edge scrolls the page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await openFresh(page, 'index.html');
    const p = page.locator('.my-team.player').first();
    await p.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);
    const a = await p.locator('.player-icon').boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(a.x + 20, a.y - 20, { steps: 3 });
    await page.mouse.move(a.x + 20, 8, { steps: 5 });
    await page.waitForTimeout(600);
    const during = await page.evaluate(() => window.scrollY);
    await page.mouse.up();
    expect(during).toBeLessThan(before - 50);
  });
});
