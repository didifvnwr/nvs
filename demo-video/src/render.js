const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const mode = process.argv[2] || 'test'; const VERT = process.env.VERT==='1';
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: VERT ? { width: 720, height: 1280 } : { width: 1280, height: 720 }, deviceScaleFactor: mode === 'test' ? 1 : 1.5 });
  await page.goto('file://' + path.join(__dirname, 'promo-demo.html') + (VERT ? '?v=1' : ''));
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(__dirname, mode === 'test' ? (VERT ? 'testv' : 'test') : (VERT ? 'framesv' : 'frames'));
  fs.mkdirSync(out, { recursive: true });
  const fps = 24;
  if (mode === 'test') {
    for (const t of (process.argv[3]||'').split(',').map(Number)) {
      await page.evaluate(async t => { await render(t); }, t);
      await page.screenshot({ path: path.join(out, `t${t}.png`) });
    }
  } else {
    const a = +process.argv[3], b = +process.argv[4];
    for (let i = a; i < b; i++) {
      await page.evaluate(async t => { await render(t); }, i / fps);
      await page.screenshot({ path: path.join(out, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
    }
  }
  await browser.close();
})();
