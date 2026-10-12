const {chromium}=require(process.argv[2]);const fs=require('fs');
const [,, , out, W, H, BG, DUR]=process.argv,FPS=30,N=Math.round(+DUR*FPS),K=4;
(async()=>{const b=await chromium.launch();fs.mkdirSync(out,{recursive:true});
 const job=async k=>{const p=await b.newPage({viewport:{width:+W,height:+H}});p.on('pageerror',e=>console.log('ERR',e.message));await p.goto(`file://${__dirname}/logo.html?w=${W}&h=${H}&bg=${BG}`);
  await p.evaluate(async()=>{await Promise.all([300,500,800].map(w=>document.fonts.load(w+' 40px Heebo','שלום')))});
  for(let i=k;i<N;i+=K){const d=await p.evaluate(i=>{frame(i/30);return c.toDataURL('image/png')},i);fs.writeFileSync(`${out}/f${String(i).padStart(4,'0')}.png`,Buffer.from(d.split(',')[1],'base64'))}};
 await Promise.all([...Array(K).keys()].map(job));await b.close()})();
