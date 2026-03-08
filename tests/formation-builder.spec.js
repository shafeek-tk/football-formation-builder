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
    await expect(page.getByText('SHARE')).toBeVisible();
    await expect(page.locator('#downloadBtn')).toBeVisible();
    await expect(page.getByText('11v11')).toBeVisible();
    await expect(page.getByText('7v7')).toBeVisible();
    await expect(page.getByText('6v6')).toBeVisible();
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
    await page.getByText('SHARE').click();

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

    await expect(page.getByText('IMAGE')).toBeVisible();
    await expect(page.getByText('11v11')).toBeVisible();
    await expect(page.locator('.header-right')).toBeVisible();
  });

  test('should load 7v7 format correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    await expect(page).toHaveTitle(/7v7 Football Formation/);
    await page.waitForSelector('.player');
    const players = await page.locator('.player').count();
    expect(players).toBe(14);
  });

  test('should load 6v6 format correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    await expect(page).toHaveTitle(/6v6 Football Formation/);
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
    await expect(page).toHaveTitle(/7v7 Football Formation/);
    await expect(page.locator('#myTeamFormation')).toBeVisible();
    await expect(page.getByText('SHARE')).toBeVisible();
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

    await expect(page.getByText('IMAGE')).toBeVisible();
    await expect(page.locator('.mode-btn', { hasText: '7v7' })).toBeVisible();
    await expect(page.locator('.header-right')).toBeVisible();
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
    await page.getByText('SHARE').click();
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
    await expect(page).toHaveTitle(/6v6 Football Formation/);
    await expect(page.locator('#myTeamFormation')).toBeVisible();
    await expect(page.getByText('SHARE')).toBeVisible();
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

    await expect(page.getByText('IMAGE')).toBeVisible();
    await expect(page.locator('.mode-btn', { hasText: '6v6' })).toBeVisible();
    await expect(page.locator('.header-right')).toBeVisible();
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
    await page.getByText('SHARE').click();
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
    await page.getByText('SHARE').click();
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

  test('should render penalty arcs clipped by overflow:hidden wrapper', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field');

    const arcInfo = await page.evaluate(() => {
      const topArc = document.querySelector('.penalty-arc.top');
      const bottomArc = document.querySelector('.penalty-arc.bottom');
      const topWrapper = document.querySelector('.penalty-arc-clip.top');
      const bottomWrapper = document.querySelector('.penalty-arc-clip.bottom');
      const field = document.getElementById('field');
      const fieldRect = field.getBoundingClientRect();
      return {
        topExists: !!topArc,
        bottomExists: !!bottomArc,
        topWrapperOverflow: topWrapper ? window.getComputedStyle(topWrapper).overflow : null,
        bottomWrapperOverflow: bottomWrapper ? window.getComputedStyle(bottomWrapper).overflow : null,
        topWrapperHeightPct: topWrapper ? (topWrapper.getBoundingClientRect().height / fieldRect.height) * 100 : 0,
        bottomWrapperHeightPct: bottomWrapper ? (bottomWrapper.getBoundingClientRect().height / fieldRect.height) * 100 : 0,
      };
    });

    expect(arcInfo.topExists).toBe(true);
    expect(arcInfo.bottomExists).toBe(true);
    expect(arcInfo.topWrapperOverflow).toBe('hidden');
    expect(arcInfo.bottomWrapperOverflow).toBe('hidden');
    expect(arcInfo.topWrapperHeightPct).toBeGreaterThanOrEqual(4);
    expect(arcInfo.bottomWrapperHeightPct).toBeGreaterThanOrEqual(4);
  });

  test('should render corner arcs with visible borders inside the field', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field');

    // The corner arcs are positioned half-outside the field. Only the quadrant
    // inside the field should have borders. The field has overflow:hidden so
    // borders outside the field are clipped. We verify the inside-facing borders exist.
    const borderInfo = await page.evaluate(() => {
      const results = {};
      const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
      corners.forEach(corner => {
        const el = document.querySelector(`.corner-arc.${corner}`);
        const style = window.getComputedStyle(el);
        results[corner] = {
          borderTop: style.borderTopWidth,
          borderBottom: style.borderBottomWidth,
          borderLeft: style.borderLeftWidth,
          borderRight: style.borderRightWidth,
        };
      });
      return results;
    });

    // top-left: inside field is bottom-right quadrant, so bottom + right borders must exist
    expect(parseFloat(borderInfo['top-left'].borderBottom)).toBeGreaterThan(0);
    expect(parseFloat(borderInfo['top-left'].borderRight)).toBeGreaterThan(0);

    // top-right: inside field is bottom-left quadrant
    expect(parseFloat(borderInfo['top-right'].borderBottom)).toBeGreaterThan(0);
    expect(parseFloat(borderInfo['top-right'].borderLeft)).toBeGreaterThan(0);

    // bottom-left: inside field is top-right quadrant
    expect(parseFloat(borderInfo['bottom-left'].borderTop)).toBeGreaterThan(0);
    expect(parseFloat(borderInfo['bottom-left'].borderRight)).toBeGreaterThan(0);

    // bottom-right: inside field is top-left quadrant
    expect(parseFloat(borderInfo['bottom-right'].borderTop)).toBeGreaterThan(0);
    expect(parseFloat(borderInfo['bottom-right'].borderLeft)).toBeGreaterThan(0);
  });

  test('should have at least 7 visible grass stripes on the pitch', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field');

    // Count the number of grass stripes by checking background-size
    const stripeInfo = await page.evaluate(() => {
      const field = document.getElementById('field');
      const style = window.getComputedStyle(field);
      const bgSize = style.backgroundSize;
      const fieldHeight = field.offsetHeight;

      let stripeHeightPx;
      if (bgSize.includes('%')) {
        const yPercent = parseFloat(bgSize.split(/\s+/)[1]);
        stripeHeightPx = fieldHeight * (yPercent / 100);
      } else {
        stripeHeightPx = parseFloat(bgSize.split(/\s+/)[1]);
      }

      const stripeCount = Math.round(fieldHeight / stripeHeightPx);
      return { stripeCount, bgSize, fieldHeight };
    });

    // At least 7 stripes for a realistic look (currently only 5)
    expect(stripeInfo.stripeCount).toBeGreaterThanOrEqual(7);
  });

  test('should render center circle as visually circular', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field');

    const circleInfo = await page.evaluate(() => {
      const field = document.getElementById('field');
      const style = window.getComputedStyle(field, '::after');
      const width = parseFloat(style.width);
      const height = parseFloat(style.height);
      return { width, height, ratio: width / height };
    });

    // Aspect ratio between 0.9 and 1.1 means visually circular
    expect(circleInfo.ratio).toBeGreaterThanOrEqual(0.9);
    expect(circleInfo.ratio).toBeLessThanOrEqual(1.1);
  });

  test('should render goal indicators at top and bottom of pitch', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field');

    const topGoal = page.locator('.goal.top');
    const bottomGoal = page.locator('.goal.bottom');

    await expect(topGoal).toBeVisible();
    await expect(bottomGoal).toBeVisible();

    // Goals should be centered and at edges
    const topGoalBox = await topGoal.boundingBox();
    const bottomGoalBox = await bottomGoal.boundingBox();
    const fieldBox = await page.locator('#field').boundingBox();

    expect(topGoalBox.y).toBeLessThanOrEqual(fieldBox.y + 5);
    expect(bottomGoalBox.y + bottomGoalBox.height).toBeGreaterThanOrEqual(fieldBox.y + fieldBox.height - 5);
  });

  test('should render spots as circular', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('#field');
    const spotInfo = await page.evaluate(() => {
      return ['.center-spot', '.penalty-spot.top', '.penalty-spot.bottom'].map(sel => {
        const r = document.querySelector(sel).getBoundingClientRect();
        return { sel, ratio: r.width / r.height };
      });
    });
    for (const s of spotInfo) {
      expect(s.ratio).toBeGreaterThanOrEqual(0.8);
      expect(s.ratio).toBeLessThanOrEqual(1.2);
    }
  });
});
