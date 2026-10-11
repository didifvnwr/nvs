const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const mode = process.argv[2] || 'test';
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: mode === 'test' ? 1 : 1.5 });
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  await page.goto('file://' + path.join(__dirname, 'promo-bot3.html'));
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(__dirname, mode === 'test' ? 'test' : 'frames-bot3');
  fs.mkdirSync(out, { recursive: true });
  const fps = 24;
  if (mode === 'test') {
    for (const t of [13, 30, 45, 56]) {
      await page.evaluate(async t => { await render(t); }, t);
      await page.screenshot({ path: path.join(out, `t${t}.png`) });
    }
  } else {
    const total = 57.5 * fps;
    for (let i = 0; i < total; i++) {
      await page.evaluate(async t => { await render(t); }, i / fps);
      await page.screenshot({ path: path.join(out, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
    }
  }
  await browser.close();
})();
