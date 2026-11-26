import { test, expect } from '@playwright/test';
import { openFresh, shareState } from './helpers.js';

const SQUAD = `1. Sam 5
2. Alex GK
3. Priya ****
4. Jo 2
5. Kai 3
6. Ben (gk)
7. Tom *
8. Liam 4
9. Noah 2
10. Oli 3
11. Sam 5`; // duplicate Sam is ignored

test.describe('Team splitter', () => {
  test('parses ratings, keepers, numbering and duplicates', async ({ page }) => {
    await openFresh(page, '5s.html');
    const squad = await page.evaluate(t => EFL.parseSquad(t), SQUAD);
    expect(squad.map(p => p.name)).toEqual(['Sam', 'Alex', 'Priya', 'Jo', 'Kai', 'Ben', 'Tom', 'Liam', 'Noah', 'Oli']);
    expect(squad.find(p => p.name === 'Priya').skill).toBe(4);
    expect(squad.filter(p => p.gk).map(p => p.name)).toEqual(['Alex', 'Ben']);
  });

  test('splits fairly: one keeper each, sizes within one, skill close', async ({ page }) => {
    await openFresh(page, '5s.html');
    for (let run = 0; run < 20; run++) {
      const teams = await page.evaluate(t => EFL.splitSquad(EFL.parseSquad(t)), SQUAD);
      const sum = t => t.reduce((s, p) => s + p.skill, 0);
      expect(Math.abs(teams[0].length - teams[1].length)).toBeLessThanOrEqual(1);
      expect(teams[0][0].gk && teams[1][0].gk).toBe(true);
      expect(Math.abs(sum(teams[0]) - sum(teams[1]))).toBeLessThanOrEqual(1);
    }
  });

  test('split, reshuffle and use puts the teams on the pitch', async ({ page }) => {
    await openFresh(page, '5s.html');
    await page.locator('#splitTeamsBtn').click();
    await page.fill('#spList', SQUAD);
    await expect(page.locator('#spCount')).toContainText('10 players');
    await page.locator('#spSplit').click();
    await expect(page.locator('.split-col')).toHaveCount(2);
    await page.locator('#spShuffle').click();
    await page.locator('#spUse').click();

    const home = await page.locator('.my-team .player-name').allTextContents();
    const away = await page.locator('.opp-team .player-name').allTextContents();
    const all = [...home, ...away].sort();
    expect(all).toEqual(['ALEX', 'BEN', 'JO', 'KAI', 'LIAM', 'NOAH', 'OLI', 'PRIYA', 'SAM', 'TOM']);
    expect(['ALEX', 'BEN']).toContain(home[0]); // keeper wears 1
    const state = await shareState(page);
    expect(Object.values(state.n)).toContain('PRIYA');
  });

  test('remembers the pasted list for next time', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.locator('#splitTeamsBtn').click();
    await page.fill('#spList', 'A\nB\nC');
    await page.locator('#spSplit').click();
    await page.reload();
    await page.waitForSelector('.player');
    await page.locator('#splitTeamsBtn').click();
    await expect(page.locator('#spList')).toHaveValue('A\nB\nC');
  });
});
