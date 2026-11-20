const { chromium } = require('/opt/node22/lib/node_modules/playwright');const path=require('path'),fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});const pg=await b.newPage();
for(const th of ['dark','light']){await pg.goto('file://'+path.join(__dirname,'cap.html')+'?theme='+th);
const s=await pg.evaluate(()=>{L.draw(6.6);const v=L.svg.cloneNode(true);v.setAttribute('xmlns','http://www.w3.org/2000/svg');v.removeAttribute('style');return v.outerHTML});
fs.writeFileSync(path.join(__dirname,'..',`mitsi-ai-logo${th==='light'?'-light':''}.svg`),s)}
await b.close()})();
