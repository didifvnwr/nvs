const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path=require('path'),fs=require('fs');
(async()=>{const mode=process.argv[2]||'test';const OUT=process.env.OUT;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox','--allow-file-access-from-files']});
const pg=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:mode==='test'?1:1.5});
await pg.goto('file://'+path.join(OUT,'maih.html'));await pg.evaluate(()=>document.fonts.ready);
const out=path.join(OUT,mode==='test'?'test':'frames');fs.mkdirSync(out,{recursive:true});
if(mode==='test'){for(const t of process.argv[3].split(',').map(Number)){await pg.evaluate(async t=>{await render(t)},t);await pg.screenshot({path:path.join(out,`t${t}.png`)})}}
else{const a=+process.argv[3],e=+process.argv[4];for(let i=a;i<e;i++){await pg.evaluate(async t=>{await render(t)},i/24);await pg.screenshot({path:path.join(out,`f${String(i).padStart(5,'0')}.jpg`),type:'jpeg',quality:90})}}
await b.close()})();
