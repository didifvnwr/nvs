// usage: node capture.js W H out.mp4 [start end step]  (step>0 => write stills instead)
const http=require('http'),fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const {chromium}=require('playwright');
const [W,H,OUT,S0,S1,STEP]=process.argv.slice(2);const FPS=30;
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{const f=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});}).listen(0);
(async()=>{
 const port=srv.address().port;
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:400,height:400}});
 p.on('console',m=>{if(m.type()==='error')console.error('page:',m.text())});p.on('pageerror',e=>console.error('pageerror:',e.message));
 await p.goto(`http://127.0.0.1:${port}/index2.html?w=${W}&h=${H}`);
 await p.waitForFunction('window.READY===true',null,{timeout:120000});
 const meta=await p.evaluate('window.META');
 if(STEP){ for(let t=+S0;t<=+S1;t+=+STEP){const d=await p.evaluate(t=>window.renderFrame(t),t);fs.writeFileSync(`${OUT}_${t.toFixed(1)}.jpg`,Buffer.from(d.split(',')[1],'base64'));} await b.close();srv.close();return;}
 const end=meta.END, N=Math.round(end*FPS), CH=300;
 for(let c0=0;c0<N;c0+=CH){
 const seg=`${OUT}.part${String(c0/CH).padStart(2,'0')}.mp4`; if(fs.existsSync(seg)){continue;}
 const tmp=seg+'.tmp.mp4'; const c1=Math.min(N,c0+CH);
 const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p',tmp],{stdio:['pipe','inherit','inherit']});
 const t0=Date.now();
 for(let i=c0;i<c1;i++){const d=await p.evaluate(t=>window.renderFrame(t),i/FPS);
  if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));
  if(i%150===0)console.log(`${OUT} frame ${i}/${N} ${((Date.now()-t0)/1000).toFixed(0)}s`);}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));fs.renameSync(tmp,seg);}
 await b.close();srv.close();console.log('done',OUT,meta);
})().catch(e=>{console.error(e);process.exit(1)});
