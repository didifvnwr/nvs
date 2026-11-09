const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path=require('path'),fs=require('fs');
(async()=>{const [mode,ad,a,e]=process.argv.slice(2);const OUT='/tmp/claude-0/-home-user-nvs/0f9540b5-d01e-533c-b68d-1d5a2bac763f/scratchpad/ads';
const http=require('http');let srv=null;let base='file://'+path.join(OUT,'ads.html');
if(['19','20','21','21b','22','23'].includes(ad)){srv=http.createServer((q,s)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);return s.end()}s.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':f.endsWith('.png')?'image/png':f.endsWith('.jpg')?'image/jpeg':f.endsWith('.webp')?'image/webp':f.endsWith('.ttf')?'font/ttf':'application/octet-stream'});s.end(d)})});await new Promise(r=>srv.listen(0,r));base='http://localhost:'+srv.address().port+'/ads.html'}
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--allow-file-access-from-files','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const pg=await b.newPage({viewport:{width:720,height:1280},deviceScaleFactor:mode==='test'?1:1.5});
pg.on('pageerror',er=>console.log('ERR',er.message));
await pg.goto(base+'?ad='+ad);await pg.evaluate(()=>document.fonts.ready);await pg.waitForFunction(()=>window.ready3d,null,{timeout:120000});
const out=path.join(OUT,mode==='test'?'test'+ad:'frames'+ad);fs.mkdirSync(out,{recursive:true});
if(mode==='test'){for(const t of a.split(',').map(Number)){await pg.evaluate(async t=>{await render(t)},t);await pg.screenshot({path:path.join(out,`t${t}.png`)})}}
else{for(let i=+a;i<+e;i++){await pg.evaluate(async t=>{await render(t)},i/24);await pg.screenshot({path:path.join(out,`f${String(i).padStart(5,'0')}.jpg`),type:'jpeg',quality:90})}}
await b.close();if(srv)srv.close()})();
