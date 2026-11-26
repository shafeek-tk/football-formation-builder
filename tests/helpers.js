// Shared helpers for feature tests.
export const BASE = 'http://localhost:8080';

export const PAGES = [
  { file: 'index.html', size: 11 },
  { file: '10s.html', size: 10 },
  { file: '9s.html', size: 9 },
  { file: '8s.html', size: 8 },
  { file: '7s.html', size: 7 },
  { file: '6s.html', size: 6 },
  { file: '5s.html', size: 5 },
];

/** Open a page with clean storage. */
export async function openFresh(page, file = 'index.html') {
  await page.goto(`${BASE}/${file}`);
  // Clear saved data, but keep the first-visit walkthrough out of the way
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('eflTourSeen', '1'); });
  await page.goto(`${BASE}/${file}`);
  await page.waitForSelector('.player');
}

/** Render the shared image and return its size plus a pixel sampler. */
export async function exportSize(page) {
  return page.evaluate(async () => {
    const c = await window.formationBuilder.renderExport();
    return { width: c.width, height: c.height };
  });
}

/** Read the state a share link would carry. */
export async function shareState(page) {
  return page.evaluate(() => window.formationBuilder.getState());
}

/** Open the page from a state, as a share link would. */
export async function openState(page, file, state) {
  const hash = await page.evaluate(s => LZString.compressToEncodedURIComponent(JSON.stringify(s)), state);
  await page.goto(`${BASE}/${file}#f=${hash}`);
  await page.waitForSelector('.player');
}

/** Tools sit in the More menu on phones and tablets, and beside the pitch on wide screens. */
export async function revealTool(page, id) {
  if (await page.locator(`#${id}`).isVisible()) return;
  await page.locator('#moreBtn').click();
}
