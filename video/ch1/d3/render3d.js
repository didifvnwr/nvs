// node render3d.js [--out work/f3d] [--at 1,5,9] [--workers 4] [--fps 24]; needs http server rooted at video/ on :8765
const { chromium } = require('../../node_modules/playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const out = path.resolve(arg('out', '../work/f3d')), at = arg('at', null);
const fps = +arg('fps', 24), workers = +arg('workers', 4), scale = +arg('scale', 1.5);
const url = arg('url', 'http://localhost:8765/ch1/d3/scene3d.html');
const exe = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const open = async () => {
    const page = await (await browser.newContext({ viewport: { width: 720, height: 1280 }, deviceScaleFactor: scale })).newPage();
    page.on('console', m => console.log('C', m.text())); page.on('pageerror', e => console.log('PAGE ERROR', e.message));
    await page.goto(url);
    if (process.argv.includes('--clean')) await page.addStyleTag({ content: '#cap,#tag,#dip{display:none!important}' });
    await page.waitForFunction('window.ready===true', null, { timeout: 15000 });
    return page;
  };
  const shot = async (page, t, file, jpg) => {
    await page.evaluate(x => render(x), t);
    await page.screenshot(jpg ? { path: file, type: 'jpeg', quality: 95 } : { path: file });
  };
  if (at) {
    const page = await open();
    for (const s of at.split(',').map(Number)) { const t0 = Date.now(); await shot(page, s, path.join(out, `t${s.toFixed(2)}.png`), false); console.log('t', s, Date.now() - t0, 'ms'); }
  } else {
    const probe = await open(), dur = await probe.evaluate(() => DUR), total = Math.round(dur * fps);
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const page = w === 0 ? probe : await open();
      for (let f = w; f < total; f += workers) await shot(page, f / fps, path.join(out, String(f).padStart(5, '0') + '.jpg'), true);
    }));
    console.log('frames', total);
  }
  await browser.close();
})();
