// Optional browser checks; Playwright is supplied by the caller, not a project dependency.
const { chromium } = require(process.env.LUMINA_PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const viewports = [[320,568], [360,640], [375,667], [375,812], [390,844], [393,852], [412,915], [430,932], [768,1024], [1440,900]];

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.LUMINA_BROWSER_EXECUTABLE || undefined,
    headless: true,
  });
  try {
    for (const [width, height] of viewports) {
      const context = await browser.newContext({
        viewport: { width, height }, isMobile: width < 768, hasTouch: width < 768,
        reducedMotion: 'reduce',
      });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        // Validate fallback without sending the test question to the online service.
        await page.route('**/*.workers.dev/**', route => route.abort());
        await page.goto(process.env.LUMINA_TEST_URL || 'http://127.0.0.1:5173');
        await page.getByRole('button', { name: 'Entrar no Santuário' }).click();
        const checkOverflow = async () => {
          const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, layout: document.querySelector('.reading-area')?.dataset.layout, offenders: [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).slice(0, 15).map(el => el.className?.baseVal || el.className) }));
          assert.ok(dimensions.scroll <= dimensions.width, JSON.stringify(dimensions));
          assert.ok(await page.locator('[role="dialog"]').evaluateAll(panels =>
            panels.every(panel => panel.scrollWidth <= panel.clientWidth + 1)));
        };
        await checkOverflow();
        if (width < 768) {
          await page.getByRole('button', { name: 'Mais', exact: true }).click();
          const tools = page.getByRole('dialog', { name: 'Ferramentas do santuário' });
          await tools.waitFor();
          await page.keyboard.press('Escape');
          assert.equal(await tools.count(), 0);
          assert.equal(await page.locator(':focus').innerText(), 'Mais');
          await page.getByRole('button', { name: 'Mais', exact: true }).click();
          await page.setViewportSize({ width: 768, height });
          await tools.waitFor({ state: 'detached' });
          assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
          await page.setViewportSize({ width, height });
        }
        await page.getByRole('button', { name: 'Grimório', exact: true }).click();
        await page.getByRole('dialog', { name: 'Grimório', exact: true }).waitFor();
        assert.equal(await page.locator('.grimoire-card').count(), 78);
        await checkOverflow();
        await page.keyboard.press('Escape');
        const spreadTabs = page.locator('.spread-navigation button[aria-pressed]');
        for (let index = 0; index < await spreadTabs.count(); index++) {
          await spreadTabs.nth(index).click();
          await page.waitForTimeout(400); // Allow the existing layout exit/entry transition.
          await checkOverflow();
          if (await page.locator('#free-spread-count').count()) {
            for (let count = 1; count <= 10; count++) {
              await page.locator('#free-spread-count').selectOption(String(count));
              await checkOverflow();
            }
          }
        }
        await page.locator('button[title^="Trocar para o Baralho Cigano"]').click();
        assert.equal(await page.locator('.deck-card-cell').count(), 36);
        await page.getByRole('button', { name: 'Grimório', exact: true }).click();
        await page.getByRole('dialog', { name: 'Grimório', exact: true }).waitFor();
        assert.equal(await page.locator('.grimoire-card').count(), 36);
        await checkOverflow();
        assert.deepEqual(errors, []);
        console.log(`✓ ${width}×${height}: navigation, spreads, free 1–10, Tarot and Lenormand`);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
