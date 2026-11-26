import { test, expect } from '@playwright/test';

// Helper: edit a contentEditable player name element
async function editPlayerName(page, locator, newName) {
  await locator.evaluate((el, name) => {
    el.textContent = name;
    el.dispatchEvent(new Event('blur'));
  }, newName);
}

// Helper: override shareURL to capture the URL without alert/clipboard
async function captureShareUrl(page) {
  await page.evaluate(() => {
    window.capturedShareUrl = '';
    formationBuilder.shareURL = function(url) {
      window.capturedShareUrl = url;
    };
  });
}

test.describe('Football Formation Builder', () => {

  test('should load homepage and display formation controls', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');

    await expect(page).toHaveTitle(/Football Formation Builder/);
    await expect(page.locator('#myTeamFormation')).toBeVisible();
    await expect(page.locator('#awayTeamFormation')).toBeVisible();
    await expect(page.locator('#copyLinkBtn')).toBeVisible();
    await expect(page.locator('#downloadBtn')).toBeVisible();
    await expect(page.locator('.mode-btn', { hasText: '11v11' })).toBeVisible();
    await expect(page.locator('.mode-btn', { hasText: '7v7' })).toBeVisible();
    await expect(page.locator('.mode-btn', { hasText: '6v6' })).toBeVisible();
  });

  test('should change formation and update players', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field');

    const initialPlayers = await page.locator('.player').count();
    expect(initialPlayers).toBe(22);

    await page.selectOption('#myTeamFormation', '433');
    const playersAfterChange = await page.locator('.player').count();
    expect(playersAfterChange).toBe(22);
  });

  test('should edit player names', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.player-name');

    const firstPlayerName = page.locator('.my-team .player-name').first();
    await firstPlayerName.click();

    const isEditable = await firstPlayerName.evaluate(el => el.contentEditable === 'true');
    expect(isEditable).toBe(true);
  });

  test('should switch between different formats', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');

    await page.locator('.mode-btn', { hasText: '7v7' }).click();
    await expect(page).toHaveURL(/7s\.html/);
    await expect(page.locator('#myTeamFormation')).toBeVisible();

    await page.locator('.mode-btn', { hasText: '11v11' }).click();
    await expect(page).toHaveURL(/index\.html/);
  });

  test('should generate shareable URL', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field');

    const homeNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    for (let i = 0; i < homeNames.length; i++) {
      await editPlayerName(page, page.locator('.my-team .player-name').nth(i), homeNames[i]);
    }

    const awayNames = ['L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];
    for (let i = 0; i < awayNames.length; i++) {
      await editPlayerName(page, page.locator('.opp-team .player-name').nth(i), awayNames[i]);
    }

    await captureShareUrl(page);
    await page.locator('#copyLinkBtn').click();

    const shareUrl = await page.evaluate(() => window.capturedShareUrl);
    expect(shareUrl).toBeTruthy();
    expect(shareUrl).toContain('#f=');

    const localUrl = shareUrl.replace('https://easyfootballlineup.com', 'http://localhost:8080');
    await page.goto(localUrl);
    await page.waitForSelector('#field');

    expect(page.url()).toContain('#f=');

    for (let i = 0; i < homeNames.length; i++) {
      await expect(page.locator('.my-team .player-name').nth(i)).toHaveText(homeNames[i]);
    }
    for (let i = 0; i < awayNames.length; i++) {
      await expect(page.locator('.opp-team .player-name').nth(i)).toHaveText(awayNames[i]);
    }
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080/index.html');

    await expect(page.locator('#downloadBtn')).toBeVisible();
    await expect(page.locator('.mode-btn', { hasText: '11v11' })).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
  });

  test('should load 7v7 format correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    await expect(page).toHaveTitle(/7-a-side Formation Builder/);
    await page.waitForSelector('.player');
    const players = await page.locator('.player').count();
    expect(players).toBe(14);
  });

  test('should load 6v6 format correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    await expect(page).toHaveTitle(/6-a-side Formation Builder/);
    await page.waitForSelector('.player');
    const players = await page.locator('.player').count();
    expect(players).toBe(12);
  });

  test('should preserve names when changing formations', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.my-team .player-name');

    const homeNames = ['HOME A', 'HOME B', 'HOME C'];
    for (let i = 0; i < homeNames.length; i++) {
      await editPlayerName(page, page.locator('.my-team .player-name').nth(i), homeNames[i]);
    }

    const awayNames = ['AWAY X', 'AWAY Y', 'AWAY Z'];
    for (let i = 0; i < awayNames.length; i++) {
      await editPlayerName(page, page.locator('.opp-team .player-name').nth(i), awayNames[i]);
    }

    await page.selectOption('#myTeamFormation', '433');
    await page.waitForTimeout(500);

    for (let i = 0; i < homeNames.length; i++) {
      await expect(page.locator('.my-team .player-name').nth(i)).toHaveText(homeNames[i].toUpperCase());
    }
    for (let i = 0; i < awayNames.length; i++) {
      await expect(page.locator('.opp-team .player-name').nth(i)).toHaveText(awayNames[i].toUpperCase());
    }
  });

  // 7v7 Format Tests
  test('should load 7v7 format and display formation controls', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    await expect(page).toHaveTitle(/7-a-side Formation Builder/);
    await expect(page.locator('#myTeamFormation')).toBeVisible();
    await expect(page.locator('#copyLinkBtn')).toBeVisible();
    await expect(page.locator('#downloadBtn')).toBeVisible();

    await expect(page.locator('.mode-btn', { hasText: '11v11' })).toBeVisible();
    await expect(page.locator('.mode-btn', { hasText: '7v7' })).toBeVisible();
    await expect(page.locator('.mode-btn', { hasText: '6v6' })).toBeVisible();
  });

  test('should change 7v7 formation and update players', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    await page.waitForSelector('#field');

    expect(await page.locator('.player').count()).toBe(14);
    await page.selectOption('#myTeamFormation', '321');
    expect(await page.locator('.player').count()).toBe(14);
  });

  test('should preserve names when changing 7v7 formations', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    await page.waitForSelector('.my-team .player-name');

    const homeNames = ['7V7 A', '7V7 B', '7V7 C'];
    for (let i = 0; i < homeNames.length; i++) {
      await editPlayerName(page, page.locator('.my-team .player-name').nth(i), homeNames[i]);
    }

    const awayNames = ['AWAY 7A', 'AWAY 7B'];
    for (let i = 0; i < awayNames.length; i++) {
      await editPlayerName(page, page.locator('.opp-team .player-name').nth(i), awayNames[i]);
    }

    await page.selectOption('#myTeamFormation', '321');
    await page.waitForTimeout(500);

    for (let i = 0; i < homeNames.length; i++) {
      await expect(page.locator('.my-team .player-name').nth(i)).toHaveText(homeNames[i].toUpperCase());
    }
    for (let i = 0; i < awayNames.length; i++) {
      await expect(page.locator('.opp-team .player-name').nth(i)).toHaveText(awayNames[i].toUpperCase());
    }
  });

  test('should work on mobile viewport for 7v7', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080/7s.html');

    await expect(page.locator('#downloadBtn')).toBeVisible();
    await expect(page.locator('.mode-btn', { hasText: '7v7' })).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
  });

  test('should edit 7v7 player names', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    await page.waitForSelector('.player-name');

    const firstPlayerName = page.locator('.my-team .player-name').first();
    await editPlayerName(page, firstPlayerName, 'EDITED 7V7');
    await expect(firstPlayerName).toHaveText('EDITED 7V7');
  });

  test('should generate shareable URL for 7v7', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    await page.waitForSelector('#field');

    const homeNames = ['7A', '7B', '7C', '7D', '7E', '7F', '7G'];
    for (let i = 0; i < homeNames.length; i++) {
      await editPlayerName(page, page.locator('.my-team .player-name').nth(i), homeNames[i]);
    }

    await captureShareUrl(page);
    await page.locator('#copyLinkBtn').click();
    await page.waitForTimeout(500);

    const shareUrl = await page.evaluate(() => window.capturedShareUrl);
    expect(shareUrl).toBeTruthy();
    expect(shareUrl).toContain('#f=');

    const localUrl = shareUrl.replace('https://easyfootballlineup.com', 'http://localhost:8080');
    await page.goto(localUrl);
    await page.waitForSelector('#field');

    for (let i = 0; i < homeNames.length; i++) {
      await expect(page.locator('.my-team .player-name').nth(i)).toHaveText(homeNames[i]);
    }
  });

  // 6v6 Format Tests
  test('should load 6v6 format and display formation controls', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    await expect(page).toHaveTitle(/6-a-side Formation Builder/);
    await expect(page.locator('#myTeamFormation')).toBeVisible();
    await expect(page.locator('#copyLinkBtn')).toBeVisible();
    await expect(page.locator('#downloadBtn')).toBeVisible();

    await expect(page.locator('.mode-btn', { hasText: '11v11' })).toBeVisible();
    await expect(page.locator('.mode-btn', { hasText: '7v7' })).toBeVisible();
    await expect(page.locator('.mode-btn', { hasText: '6v6' })).toBeVisible();
  });

  test('should change 6v6 formation and update players', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    await page.waitForSelector('#field');

    expect(await page.locator('.player').count()).toBe(12);
    await page.selectOption('#myTeamFormation', '212');
    expect(await page.locator('.player').count()).toBe(12);
  });

  test('should preserve names when changing 6v6 formations', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    await page.waitForSelector('.my-team .player-name');

    const homeNames = ['6V6 A', '6V6 B', '6V6 C'];
    for (let i = 0; i < homeNames.length; i++) {
      await editPlayerName(page, page.locator('.my-team .player-name').nth(i), homeNames[i]);
    }

    const awayNames = ['AWAY 6A', 'AWAY 6B'];
    for (let i = 0; i < awayNames.length; i++) {
      await editPlayerName(page, page.locator('.opp-team .player-name').nth(i), awayNames[i]);
    }

    await page.selectOption('#myTeamFormation', '212');
    await page.waitForTimeout(500);

    for (let i = 0; i < homeNames.length; i++) {
      await expect(page.locator('.my-team .player-name').nth(i)).toHaveText(homeNames[i].toUpperCase());
    }
    for (let i = 0; i < awayNames.length; i++) {
      await expect(page.locator('.opp-team .player-name').nth(i)).toHaveText(awayNames[i].toUpperCase());
    }
  });

  test('should work on mobile viewport for 6v6', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080/6s.html');

    await expect(page.locator('#downloadBtn')).toBeVisible();
    await expect(page.locator('.mode-btn', { hasText: '6v6' })).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
  });

  test('should edit 6v6 player names', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    await page.waitForSelector('.player-name');

    const firstPlayerName = page.locator('.my-team .player-name').first();
    await editPlayerName(page, firstPlayerName, 'EDITED 6V6');
    await expect(firstPlayerName).toHaveText('EDITED 6V6');
  });

  test('should generate shareable URL for 6v6', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    await page.waitForSelector('#field');

    const homeNames = ['6A', '6B', '6C', '6D', '6E', '6F'];
    for (let i = 0; i < homeNames.length; i++) {
      await editPlayerName(page, page.locator('.my-team .player-name').nth(i), homeNames[i]);
    }

    await captureShareUrl(page);
    await page.locator('#copyLinkBtn').click();
    await page.waitForTimeout(500);

    const shareUrl = await page.evaluate(() => window.capturedShareUrl);
    expect(shareUrl).toBeTruthy();
    expect(shareUrl).toContain('#f=');

    const localUrl = shareUrl.replace('https://easyfootballlineup.com', 'http://localhost:8080');
    await page.goto(localUrl);
    await page.waitForSelector('#field');

    for (let i = 0; i < homeNames.length; i++) {
      await expect(page.locator('.my-team .player-name').nth(i)).toHaveText(homeNames[i]);
    }
  });

  // Formation Validation Tests
  test('should have valid 11v11 formations with 11 players each', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.my-team .player-name');

    const formations = await page.evaluate(() => {
      const select = document.getElementById('myTeamFormation');
      return Array.from(select.options).map(o => ({ value: o.value, text: o.text }));
    });

    for (const formation of formations) {
      await page.selectOption('#myTeamFormation', formation.value);
      await page.waitForFunction(() => document.querySelectorAll('.my-team .player-name').length > 0);
      const playerCount = await page.locator('.my-team .player-name').count();
      expect(playerCount).toBe(11);
    }
  });

  test('should have valid 7v7 formations with 7 players each', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    await page.waitForSelector('.my-team .player-name');

    const formations = await page.evaluate(() => {
      const select = document.getElementById('myTeamFormation');
      return Array.from(select.options).map(o => ({ value: o.value, text: o.text }));
    });

    for (const formation of formations) {
      await page.selectOption('#myTeamFormation', formation.value);
      await page.waitForFunction(() => document.querySelectorAll('.my-team .player-name').length > 0);
      const playerCount = await page.locator('.my-team .player-name').count();
      expect(playerCount).toBe(7);
    }

    const formationValues = formations.map(f => f.value);
    expect(formationValues).not.toContain('322');
  });

  test('should have valid 6v6 formations with 6 players each', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    await page.waitForSelector('.my-team .player-name');

    const formations = await page.evaluate(() => {
      const select = document.getElementById('myTeamFormation');
      return Array.from(select.options).map(o => ({ value: o.value, text: o.text }));
    });

    for (const formation of formations) {
      await page.selectOption('#myTeamFormation', formation.value);
      await page.waitForFunction(() => document.querySelectorAll('.my-team .player-name').length > 0);
      const playerCount = await page.locator('.my-team .player-name').count();
      expect(playerCount).toBe(6);
    }
  });

  // ===== SWAP FEATURE TESTS =====

  test('should render interaction toggle defaulting to edit mode', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.interaction-toggle');

    await expect(page.locator('.toggle-pill[data-mode="edit"]')).toHaveClass(/active/);
    await expect(page.locator('.toggle-pill[data-mode="swap"]')).not.toHaveClass(/active/);
    await expect(page.locator('.interaction-hint')).toContainText('edit');
  });

  test('should activate swap mode when clicking swap pill', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.interaction-toggle');

    await page.locator('.toggle-pill[data-mode="swap"]').click();

    await expect(page.locator('.toggle-pill[data-mode="swap"]')).toHaveClass(/active/);
    await expect(page.locator('.toggle-pill[data-mode="edit"]')).not.toHaveClass(/active/);
    await expect(page.locator('#field')).toHaveClass(/swap-mode/);
    await expect(page.locator('.interaction-hint')).toContainText('Tap a player');
  });

  test('should disable name editing in swap mode', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.player-name');

    await page.locator('.toggle-pill[data-mode="swap"]').click();

    const editableStates = await page.locator('.player-name').evaluateAll(
      elements => elements.map(el => el.contentEditable)
    );
    expect(editableStates.every(s => s === 'false')).toBe(true);
  });

  test('should select player and add swap-selected class', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.player-name');

    await page.locator('.toggle-pill[data-mode="swap"]').click();

    const firstPlayer = page.locator('.my-team.player').first();
    await firstPlayer.click();

    await expect(firstPlayer).toHaveClass(/swap-selected/);
    await expect(page.locator('.interaction-hint')).toContainText('another player');
  });

  test('should deselect player when tapping same player', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.player-name');

    await page.locator('.toggle-pill[data-mode="swap"]').click();

    const firstPlayer = page.locator('.my-team.player').first();
    await firstPlayer.click();
    await expect(firstPlayer).toHaveClass(/swap-selected/);

    await firstPlayer.click();
    await expect(firstPlayer).not.toHaveClass(/swap-selected/);
  });

  test('should swap names between two players cross-team', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.player-name');

    const homeNameEl = page.locator('.my-team .player-name').first();
    const awayNameEl = page.locator('.opp-team .player-name').first();
    const originalHomeName = await homeNameEl.textContent();
    const originalAwayName = await awayNameEl.textContent();

    await page.locator('.toggle-pill[data-mode="swap"]').click();
    await page.locator('.my-team.player').first().click();
    await page.locator('.opp-team.player').first().click();
    await page.waitForTimeout(700);

    await expect(homeNameEl).toHaveText(originalAwayName);
    await expect(awayNameEl).toHaveText(originalHomeName);
  });

  test('should swap names between two players same-team', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.player-name');

    const firstNameEl = page.locator('.my-team .player-name').nth(0);
    const secondNameEl = page.locator('.my-team .player-name').nth(1);
    const originalFirst = await firstNameEl.textContent();
    const originalSecond = await secondNameEl.textContent();

    await page.locator('.toggle-pill[data-mode="swap"]').click();
    await page.locator('.my-team.player').nth(0).click();
    await page.locator('.my-team.player').nth(1).click();
    await page.waitForTimeout(700);

    await expect(firstNameEl).toHaveText(originalSecond);
    await expect(secondNameEl).toHaveText(originalFirst);
  });

  test('should persist swap to localStorage and survive reload', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.player-name');

    const homeNameEl = page.locator('.my-team .player-name').first();
    const awayNameEl = page.locator('.opp-team .player-name').first();
    const originalHomeName = await homeNameEl.textContent();
    const originalAwayName = await awayNameEl.textContent();

    await page.locator('.toggle-pill[data-mode="swap"]').click();
    await page.locator('.my-team.player').first().click();
    await page.locator('.opp-team.player').first().click();
    await page.waitForTimeout(700);

    await page.reload();
    await page.waitForSelector('.player-name');

    await expect(page.locator('.my-team .player-name').first()).toHaveText(originalAwayName);
    await expect(page.locator('.opp-team .player-name').first()).toHaveText(originalHomeName);
  });

  test('should reflect swap in shared URL round-trip', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.player-name');

    await page.locator('.toggle-pill[data-mode="swap"]').click();
    await page.locator('.my-team.player').first().click();
    await page.locator('.opp-team.player').first().click();
    await page.waitForTimeout(700);

    const swappedHome = await page.locator('.my-team .player-name').first().textContent();
    const swappedAway = await page.locator('.opp-team .player-name').first().textContent();

    await page.locator('.toggle-pill[data-mode="edit"]').click();

    await captureShareUrl(page);
    await page.locator('#copyLinkBtn').click();
    const shareUrl = await page.evaluate(() => window.capturedShareUrl);
    const localUrl = shareUrl.replace('https://easyfootballlineup.com', 'http://localhost:8080');

    await page.goto(localUrl);
    await page.waitForSelector('.player-name');

    await expect(page.locator('.my-team .player-name').first()).toHaveText(swappedHome);
    await expect(page.locator('.opp-team .player-name').first()).toHaveText(swappedAway);
  });

  test('should swap work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.player-name');

    await expect(page.locator('.interaction-toggle')).toBeVisible();

    const homeNameEl = page.locator('.my-team .player-name').first();
    const awayNameEl = page.locator('.opp-team .player-name').first();
    const originalHome = await homeNameEl.textContent();
    const originalAway = await awayNameEl.textContent();

    await page.locator('.toggle-pill[data-mode="swap"]').click();
    await page.locator('.my-team.player').first().click();
    await page.locator('.opp-team.player').first().click();
    await page.waitForTimeout(700);

    await expect(homeNameEl).toHaveText(originalAway);
    await expect(awayNameEl).toHaveText(originalHome);
  });

  test('should edit mode work correctly after returning from swap mode', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.player-name');

    // Go to swap mode then back
    await page.locator('.toggle-pill[data-mode="swap"]').click();
    await page.locator('.toggle-pill[data-mode="edit"]').click();

    // contentEditable should be restored
    const firstPlayerName = page.locator('.my-team .player-name').first();
    const isEditable = await firstPlayerName.evaluate(el => el.contentEditable === 'true');
    expect(isEditable).toBe(true);

    await expect(page.locator('#field')).not.toHaveClass(/swap-mode/);

    // Should be able to edit names
    await editPlayerName(page, firstPlayerName, 'AFTER SWAP');
    await expect(firstPlayerName).toHaveText('AFTER SWAP');
  });

  test('should swap work on 7v7 page', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    await page.waitForSelector('.player-name');

    const homeNameEl = page.locator('.my-team .player-name').first();
    const awayNameEl = page.locator('.opp-team .player-name').first();
    const originalHome = await homeNameEl.textContent();
    const originalAway = await awayNameEl.textContent();

    await page.locator('.toggle-pill[data-mode="swap"]').click();
    await page.locator('.my-team.player').first().click();
    await page.locator('.opp-team.player').first().click();
    await page.waitForTimeout(700);

    await expect(homeNameEl).toHaveText(originalAway);
    await expect(awayNameEl).toHaveText(originalHome);
  });

  test('should swap work on 6v6 page', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    await page.waitForSelector('.player-name');

    const homeNameEl = page.locator('.my-team .player-name').first();
    const awayNameEl = page.locator('.opp-team .player-name').first();
    const originalHome = await homeNameEl.textContent();
    const originalAway = await awayNameEl.textContent();

    await page.locator('.toggle-pill[data-mode="swap"]').click();
    await page.locator('.my-team.player').first().click();
    await page.locator('.opp-team.player').first().click();
    await page.waitForTimeout(700);

    await expect(homeNameEl).toHaveText(originalAway);
    await expect(awayNameEl).toHaveText(originalHome);
  });

  // ===== PITCH RENDERING TESTS =====

  test('should render the pitch as a single vector layer sized to the field', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field .pitch-svg');

    const info = await page.evaluate(() => {
      const field = document.getElementById('field');
      const svg = field.querySelector('.pitch-svg');
      const vb = svg.viewBox.baseVal;
      return {
        count: field.querySelectorAll('.pitch-svg').length,
        vbW: vb.width, vbH: vb.height,
        fieldW: field.clientWidth, fieldH: field.clientHeight,
      };
    });

    expect(info.count).toBe(1);
    expect(Math.abs(info.vbW - info.fieldW)).toBeLessThanOrEqual(1);
    expect(Math.abs(info.vbH - info.fieldH)).toBeLessThanOrEqual(1);
  });

  test('should render all pitch markings', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field .pitch-svg');

    const counts = await page.evaluate(() => {
      const q = sel => document.querySelectorAll(`#field .pitch-svg ${sel}`).length;
      return {
        touchline: q('.touchline'), halfway: q('.halfway-line'), centreCircle: q('.centre-circle'),
        penaltyBox: q('.penalty-box'), goalBox: q('.goal-box'), penaltyD: q('.penalty-d'),
        corners: q('.corner-arc-line'), spots: q('.pitch-spots circle'), goals: q('.pitch-goal'),
      };
    });

    expect(counts).toEqual({
      touchline: 1, halfway: 1, centreCircle: 1, penaltyBox: 2, goalBox: 2,
      penaltyD: 2, corners: 4, spots: 3, goals: 2,
    });
  });

  test('should have at least 7 visible grass stripes on the pitch', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field .pitch-svg');
    const stripes = await page.locator('#field .pitch-svg .grass-stripe').count();
    expect(stripes).toBeGreaterThanOrEqual(7);
  });

  test('should render center circle as visually circular', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field .pitch-svg');
    const box = await page.locator('#field .centre-circle').boundingBox();
    const ratio = box.width / box.height;
    expect(ratio).toBeGreaterThanOrEqual(0.95);
    expect(ratio).toBeLessThanOrEqual(1.05);
  });

  test('should render goals at top and bottom of pitch', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field .pitch-svg');

    const topGoalBox = await page.locator('#field .pitch-goal.top').boundingBox();
    const bottomGoalBox = await page.locator('#field .pitch-goal.bottom').boundingBox();
    const fieldBox = await page.locator('#field').boundingBox();

    expect(topGoalBox.y).toBeLessThanOrEqual(fieldBox.y + 5);
    expect(bottomGoalBox.y + bottomGoalBox.height).toBeGreaterThanOrEqual(fieldBox.y + fieldBox.height - 5);
  });

  test('should redraw the pitch when the field is resized', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field .pitch-svg');
    await page.evaluate(() => { document.getElementById('field').style.width = '300px'; });
    await expect.poll(() => page.evaluate(() => document.querySelector('#field .pitch-svg').viewBox.baseVal.width)).toBe(300);
  });

  test('should render players with vector jerseys', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field .player');
    const info = await page.evaluate(() => ({
      players: document.querySelectorAll('#field .player').length,
      jerseys: document.querySelectorAll('#field .player .player-icon svg.jersey').length,
      home: getComputedStyle(document.querySelector('.my-team .jersey-body')).fill,
      away: getComputedStyle(document.querySelector('.opp-team .jersey-body')).fill,
    }));
    expect(info.jerseys).toBe(info.players);
    expect(info.home).not.toBe(info.away);
  });

  // ===== IMAGE EXPORT TESTS =====

  for (const pageName of ['index.html', '10s.html', '9s.html', '8s.html', '7s.html', '6s.html', '5s.html']) {
    test(`should export a sharp, high-resolution lineup image on ${pageName}`, async ({ page }) => {
      await page.goto(`http://localhost:8080/${pageName}`);
      await page.waitForSelector('#field .player');

      // The pitch image itself, before any optional frame (branding, bench) is added
      const result = await page.evaluate(() => new Promise((resolve, reject) => {
        const check = canvas => {
          const field = document.getElementById('field');
          const ctx = canvas.getContext('2d');
          // Sample the centre of the first home player's jersey: it must be jersey-coloured, not grass
          const f = field.getBoundingClientRect();
          const icon = document.querySelector('.my-team .player-icon').getBoundingClientRect();
          const sx = canvas.width / field.clientWidth;
          const px = ctx.getImageData(Math.round((icon.left - f.left + icon.width / 2) * sx),
            Math.round((icon.top - f.top + icon.height * 0.8) * sx), 1, 1).data;
          resolve({ w: canvas.width, h: canvas.height, fw: field.clientWidth, fh: field.clientHeight, px: Array.from(px) });
        };
        formationBuilder.renderFieldToCanvas(document.getElementById('field')).then(check).catch(reject);
        setTimeout(() => reject(new Error('export timed out')), 15000);
      }));

      // At least 3x the on-screen size and ~2800px on the long side
      expect(result.w).toBeGreaterThanOrEqual(result.fw * 3 - 1);
      expect(Math.max(result.w, result.h)).toBeGreaterThanOrEqual(2700);
      // Aspect ratio preserved
      expect(Math.abs(result.w / result.h - result.fw / result.fh)).toBeLessThan(0.01);
      // Home jersey is blue where the player stands
      const [r, g, b] = result.px;
      expect(b).toBeGreaterThan(150);
      expect(b).toBeGreaterThan(r + 60);
      expect(b).toBeGreaterThan(g + 30);
    });
  }
});
