const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const S=process.argv[2],FPS=30,N=78*FPS,K=4;
(async()=>{const b=await chromium.launch();
 const only=process.argv[3]?process.argv[3].split(',').map(Number):null;
 const job=async k=>{const p=await b.newPage({viewport:{width:1080,height:1920}});await p.goto('file://'+S+'/render.html');
  await p.evaluate(async()=>{await Promise.all([300,500,800].map(w=>document.fonts.load(w+' 40px Heebo','שלום')))});
  for(let i=k;i<N;i+=K){if(only&&!only.includes(i))continue;const d=await p.evaluate(i=>{frame(i/30);return c.toDataURL('image/png')},i);
   fs.writeFileSync(`${S}/frames2/f${String(i).padStart(5,'0')}.png`,Buffer.from(d.split(',')[1],'base64'))}};
 await Promise.all([...Array(K).keys()].map(job));await b.close()})();
