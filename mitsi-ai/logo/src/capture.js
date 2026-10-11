// usage: node capture.js <svgfile> <W> <H> <bg|transparent> <outdir> <times(comma) | full:seconds> [scalePct]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{const [svgf,W,H,bg,out,times,sp]=process.argv.slice(2);const svg=fs.readFileSync(svgf,'utf8');fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const pg=await b.newPage({viewport:{width:+W,height:+H}});
const tr=bg==='transparent';
const bgcss=tr?'transparent':bg==='dark'?'radial-gradient(ellipse at 50% 45%,#0b1c3d,#030812 70%)':bg==='light'?'radial-gradient(ellipse at 50% 45%,#ffffff,#e6eef8 75%)':bg;
await pg.setContent(`<html><body style="margin:0;width:${W}px;height:${H}px;display:flex;align-items:center;justify-content:center;background:${bgcss}"><div style="width:${sp||70}%;max-height:80%;display:flex;justify-content:center">${svg.replace('<svg ','<svg style="width:100%;height:auto;max-height:'+(+H*0.8)+'px" ')}</div></body></html>`);
await pg.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
const seek=async t=>pg.evaluate(t=>document.getAnimations().forEach(a=>a.currentTime=t*1000),t);
const shot=async p=>pg.screenshot({path:p,omitBackground:tr,type:p.endsWith('.png')?'png':'jpeg',...(p.endsWith('.jpg')?{quality:92}:{})});
if(times.startsWith('full:')){const n=Math.round(+times.slice(5)*30);for(let i=0;i<n;i++){await seek(i/30);await shot(path.join(out,`f${String(i).padStart(5,'0')}.${tr?'png':'jpg'}`))}}
else for(const t of times.split(',')){await seek(+t);await shot(path.join(out,`t${t}.png`))}
await b.close()})();
