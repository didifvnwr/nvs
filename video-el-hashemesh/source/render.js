const {chromium}=require(process.argv[4]);const fs=require('fs');
const S=process.argv[2],FPS=30,TOTAL=JSON.parse(fs.readFileSync(S+'/tl.json')).TOTAL,N=Math.round(TOTAL*FPS),K=4;
(async()=>{const b=await chromium.launch();const only=process.argv[3]&&process.argv[3]!='all'?process.argv[3].split(',').map(Number):null;
 const job=async k=>{const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('file://'+S+'/render.html');
  await p.evaluate(async()=>{await Promise.all([300,500,800].map(w=>document.fonts.load(w+' 40px Heebo','שלום')))});
  for(let i=k;i<N;i+=K){if(only&&!only.includes(i))continue;const d=await p.evaluate(i=>{frame(i/30);return c.toDataURL('image/png')},i);
   fs.writeFileSync(`${S}/frames/f${String(i).padStart(5,'0')}.png`,Buffer.from(d.split(',')[1],'base64'))}};
 await Promise.all([...Array(K).keys()].map(job));await b.close()})();
