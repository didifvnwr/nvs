// node capture.js <outDir> <fromFrame> <toFrame>   |   node capture.js test <t1,t2,...>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [a, b, c] = process.argv.slice(2);
const srv = http.createServer((q, s) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html' : f.endsWith('.json') ? 'application/json' : f.endsWith('.ttf') ? 'font/ttf' : 'text/plain' }); s.end(d); }); }).listen(0);
(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const pg = await br.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto(`http://localhost:${srv.address().port}/overlay.html`); await pg.waitForFunction(() => window.READY, null, { timeout: 60000 });
  if (a === 'test') { fs.mkdirSync(path.join(__dirname, '../out/test'), { recursive: true }); for (const t of b.split(',').map(Number)) { await pg.evaluate(t => window.render(t), t); await pg.screenshot({ path: path.join(__dirname, `../out/test/o${t}.png`), omitBackground: true }); } }
  else { fs.mkdirSync(a, { recursive: true }); for (let i = +b; i < +c; i++) { await pg.evaluate(t => window.render(t), i / 30); await pg.screenshot({ path: path.join(a, `f${String(i).padStart(5, '0')}.png`), omitBackground: true }); } }
  await br.close(); srv.close();
})();
