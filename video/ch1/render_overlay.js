// Transparent overlay frames: node render_overlay.js [--out work/ov] [--fps 24] [--scale 1.5] [--workers 4] [--at 1,2.5]
const { chromium } = require('../node_modules/playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const out = path.resolve(arg('out', 'work/ov'));
const fps = +arg('fps', 24), scale = +arg('scale', 1.5), workers = +arg('workers', 4), at = arg('at', null);
const exe = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const url = 'file://' + path.resolve(__dirname, 'overlay.html');
  const open = async () => {
    const page = await (await browser.newContext({ viewport: { width: 720, height: 1280 }, deviceScaleFactor: scale })).newPage();
    await page.goto(url);
    await page.evaluate(() => document.fonts.load('800 54px Heebo').then(() => document.fonts.load('400 28px Heebo')));
    return page;
  };
  const shot = async (page, t, file) => { await page.evaluate(x => render(x), t); await page.screenshot({ path: file, omitBackground: true }); };
  if (at) {
    const page = await open();
    for (const s of at.split(',').map(Number)) await shot(page, s, path.join(out, `t${s.toFixed(2)}.png`));
  } else {
    const probe = await open(); const dur = await probe.evaluate(() => DUR), total = Math.round(dur * fps);
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const page = w === 0 ? probe : await open();
      for (let f = w; f < total; f += workers) await shot(page, f / fps, path.join(out, String(f).padStart(5, '0') + '.png'));
    }));
    console.log('frames', total);
  }
  await browser.close();
})();
