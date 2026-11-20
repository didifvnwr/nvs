const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const [W,H,PFX,...TS]=process.argv.slice(2);
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{const f=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'content-type':types[path.extname(f)]||''});r.end(d);});}).listen(0);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
p.on('pageerror',e=>console.error('pageerror:',e.message));
await p.goto(`http://127.0.0.1:${srv.address().port}/index2.html?w=${W}&h=${H}`);await p.waitForFunction('window.READY===true');
for(const t of TS){const d=await p.evaluate(t=>window.renderFrame(t),+t);fs.writeFileSync(`${PFX}_${t}.jpg`,Buffer.from(d.split(',')[1],'base64'));}
await b.close();srv.close();})();
