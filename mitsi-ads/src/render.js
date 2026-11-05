const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path=require('path'),fs=require('fs');
(async()=>{const [mode,ad,a,e]=process.argv.slice(2);const OUT='/tmp/claude-0/-home-user-nvs/0f9540b5-d01e-533c-b68d-1d5a2bac763f/scratchpad/ads';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--allow-file-access-from-files']});
const pg=await b.newPage({viewport:{width:720,height:1280},deviceScaleFactor:mode==='test'?1:1.5});
pg.on('pageerror',er=>console.log('ERR',er.message));
await pg.goto('file://'+path.join(OUT,'ads.html')+'?ad='+ad);await pg.evaluate(()=>document.fonts.ready);
const out=path.join(OUT,mode==='test'?'test'+ad:'frames'+ad);fs.mkdirSync(out,{recursive:true});
if(mode==='test'){for(const t of a.split(',').map(Number)){await pg.evaluate(async t=>{await render(t)},t);await pg.screenshot({path:path.join(out,`t${t}.png`)})}}
else{for(let i=+a;i<+e;i++){await pg.evaluate(async t=>{await render(t)},i/24);await pg.screenshot({path:path.join(out,`f${String(i).padStart(5,'0')}.jpg`),type:'jpeg',quality:90})}}
await b.close()})();
