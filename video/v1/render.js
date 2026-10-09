// Deterministic frame renderer: node render.js [--out frames] [--fps 24] [--scale 1.5] [--workers 4] [--at 0.5,3,7.5]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const out = path.resolve(arg('out', 'frames'));
const fps = +arg('fps', 24), scale = +arg('scale', 1.5), workers = +arg('workers', 4);
const at = arg('at', null);
const exe = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const url = 'file://' + path.resolve(__dirname, 'scene.html');
  const open = async () => {
    const ctx = await browser.newContext({ viewport: { width: 720, height: 1280 }, deviceScaleFactor: scale });
    const page = await ctx.newPage();
    await page.goto(url);
    await page.evaluate(() => document.fonts.load('800 54px Heebo').then(() => document.fonts.load('400 28px Heebo')));
    return page;
  };
  if (at) {                       // quick check frames (png)
    const page = await open();
    for (const s of at.split(',').map(Number)) {
      await page.evaluate(t => render(t), s);
      await page.screenshot({ path: path.join(out, `t${s.toFixed(2)}.png`) });
    }
  } else {
    const probe = await open();
    const dur = await probe.evaluate(() => DUR);
    const total = Math.round(dur * fps);
    const jobs = Array.from({ length: workers }, async (_, w) => {
      const page = w === 0 ? probe : await open();
      for (let f = w; f < total; f += workers) {
        await page.evaluate(t => render(t), f / fps);
        await page.screenshot({ path: path.join(out, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 95 });
      }
    });
    await Promise.all(jobs);
    console.log('frames:', total);
  }
  await browser.close();
})();
