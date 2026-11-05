const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const mode = process.argv[2] || 'test';
  const dir = __dirname;
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: mode === 'test' ? 1 : 1.5 });
  await page.goto('file://' + path.join(dir, 'promo-v7.html'));
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(dir, mode === 'test' ? 'test' : 'frames-v7');
  fs.mkdirSync(out, { recursive: true });
  const fps = 24;
  if (mode === 'test') {
    for (const t of [49, 52, 60]) {
      await page.evaluate(t => render(t), t);
      await page.screenshot({ path: path.join(out, `t${String(t).replace('.', '_')}.png`) });
    }
  } else {
    const total = Math.round(69.2 * fps);
    for (let i = parseInt(process.argv[3] || "0"); i < total; i++) {
      await page.evaluate(t => render(t), i / fps);
      await page.screenshot({ path: path.join(out, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
    }
  }
  await browser.close();
})();
