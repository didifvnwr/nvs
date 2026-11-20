// Builds 1920x1080 transparent side-panel overlays for the 16:9 YouTube versions of the vertical ads.
// The vertical video sits in the centre (608px wide); the panels fill the left and right sides.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const OUT = process.argv[2];
const ADS = JSON.parse(process.argv[3]);
const FONTS = path.join(__dirname, 'fonts');
const html = (title, sub) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:H;src:url(file://${FONTS}/heebo-800.ttf);font-weight:800}
@font-face{font-family:H;src:url(file://${FONTS}/heebo-500.ttf);font-weight:500}
html,body{margin:0;width:1920px;height:1080px;background:transparent;font-family:H;direction:rtl;color:#fff}
.side{position:absolute;top:0;bottom:0;width:656px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;padding:0 60px}
.r{right:0}.l{left:0}
.logo{font-size:84px;white-space:nowrap;font-weight:800;line-height:1;background:linear-gradient(90deg,#3fd0ff,#e0b877);-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 4px 12px rgba(0,0,0,.6))}
.tag{font-size:30px;font-weight:500;margin-top:18px;opacity:.92;text-shadow:0 2px 10px rgba(0,0,0,.7)}
.title{font-size:54px;font-weight:800;margin-top:46px;line-height:1.2;background:rgba(0,0,0,.35);border:3px solid rgba(255,255,255,.35);border-radius:24px;padding:18px 26px;text-shadow:0 2px 10px rgba(0,0,0,.5)}
.sub{font-size:30px;font-weight:500;margin-top:16px;opacity:.9;text-shadow:0 2px 8px rgba(0,0,0,.7)}
.cta{font-size:44px;font-weight:800;background:linear-gradient(90deg,#3fd0ff,#2a9be6);color:#02122a;border-radius:999px;padding:18px 44px;box-shadow:0 0 34px rgba(63,208,255,.55)}
.ph{font-size:46px;font-weight:800;margin-top:40px;direction:ltr;letter-spacing:3px;text-shadow:0 2px 10px rgba(0,0,0,.7)}
.site{font-size:38px;font-weight:800;color:#3fd0ff;direction:ltr;margin-top:8px;text-shadow:0 2px 10px rgba(0,0,0,.7)}
.feat{font-size:28px;font-weight:500;margin-top:36px;line-height:1.7;opacity:.95;text-shadow:0 2px 8px rgba(0,0,0,.7)}
</style></head><body>
<div class="side r"><div class="logo">מיצי תקשורת</div><div class="tag">מרכזייה חכמה לעסקים · מנוהלת עם קלוד</div><div class="title">${title}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>
<div class="side l"><div class="cta">🔗 הקישור בתיאור</div><div class="ph">03-3826600</div><div class="site">mitsi.co.il</div>
<div class="feat">💬 בוט וואטסאפ · 🎙 בוט קולי<br>⏺ הקלטה · 📝 תמלול · ✨ סיכום A.I</div></div>
</body></html>`;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const [k, title, sub] of ADS) {
    const f = path.join(OUT, 'yt-panel.html'); require('fs').writeFileSync(f, html(title, sub)); await pg.goto('file://' + f);
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(OUT, `yt-panel-${k}.png`), omitBackground: true });
  }
  await b.close();
})();
