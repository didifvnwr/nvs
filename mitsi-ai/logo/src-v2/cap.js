// node cap.js W H bg theme outdir times|full:sec
const { chromium } = require('/opt/node22/lib/node_modules/playwright');const path=require('path'),fs=require('fs');
(async()=>{const [W,H,bg,theme,out,times,pad]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const pg=await b.newPage({viewport:{width:+W,height:+H}});const tr=bg==='transparent';
const bgc=tr?'transparent':bg==='dark'?'radial-gradient(ellipse at 50% 45%,#0b1c3d,#030812 70%)':bg==='light'?'radial-gradient(ellipse at 50% 45%,#fff,#e6eef8 75%)':bg;
await pg.goto('file://'+path.join(__dirname,'cap.html')+'?theme='+theme);
await pg.evaluate(([bgc,W,H,pad])=>{document.body.style.background=bgc;const m=document.getElementById('m');document.body.style.cssText+=`;width:${W}px;height:${H}px;display:flex;align-items:center;justify-content:center`;m.style.width=(pad||60)+'%'},[bgc,W,H,pad]);
const shot=p=>pg.screenshot({path:p,omitBackground:tr,type:p.endsWith('.png')?'png':'jpeg',...(p.endsWith('.jpg')?{quality:92}:{})});
if(times.startsWith('full:')){const n=Math.round(+times.slice(5)*30);for(let i=0;i<n;i++){await pg.evaluate(t=>L.draw(t),i/30);await shot(path.join(out,`f${String(i).padStart(5,'0')}.${tr?'png':'jpg'}`))}}
else for(const t of times.split(',')){await pg.evaluate(t=>L.draw(t),+t);await shot(path.join(out,`t${t}.png`))}
await b.close()})();
