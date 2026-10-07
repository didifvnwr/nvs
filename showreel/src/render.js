const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path=require('path'),fs=require('fs');
(async()=>{const mode=process.argv[2]||'test';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const pg=await b.newPage({viewport:process.env.HORIZ==='1'?{width:1280,height:720}:{width:720,height:1280},deviceScaleFactor:mode==='test'?1:1.5});
await pg.goto('file://'+path.join(__dirname,'showreel.html')+(process.env.HORIZ==='1'?'?h=1':''));await pg.evaluate(()=>document.fonts.ready);
const out=path.join(__dirname,mode==='test'?(process.env.HORIZ==='1'?'testh':'test'):(process.env.HORIZ==='1'?'framesh':'frames'));fs.mkdirSync(out,{recursive:true});
if(mode==='test'){for(const t of process.argv[3].split(',').map(Number)){await pg.evaluate(async t=>{await render(t)},t);await pg.screenshot({path:path.join(out,`t${t}.png`)})}}
else{const a=+process.argv[3],e=+process.argv[4];for(let i=a;i<e;i++){await pg.evaluate(async t=>{await render(t)},i/24);await pg.screenshot({path:path.join(out,`f${String(i).padStart(5,'0')}.jpg`),type:'jpeg',quality:92})}}
await b.close()})();
