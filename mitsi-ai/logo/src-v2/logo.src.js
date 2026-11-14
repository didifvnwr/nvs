/* mitsi.ai animated logo — walking cat. Usage:
   <div id="mitsi-logo" style="width:600px"></div>
   <script src="mitsi-ai-logo.js"></script>
   <script>MitsiLogo.mount(document.getElementById('mitsi-logo'),{theme:'dark'})</script>
   theme: 'dark' (white text) | 'light' (navy text). Deterministic: MitsiLogo.mount(el,{autoplay:false}).draw(t) */
(function(){
const GL=/*GLYPHS*/null;
const NS='http://www.w3.org/2000/svg';
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
const eout=x=>1-Math.pow(1-clamp(x),3);
const lerp=(a,b,k)=>a+(b-a)*k;
const back=x=>{x=clamp(x);const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
// timeline (seconds)
const T={wordIn:.1,walk0:.55,walk1:3.3,rub0:3.3,rub1:4.25,lie0:4.2,lie1:4.95,tag:5.05,spark:5.15,end:6.6};
const X0=-600,X1=34,BASE=-198;          // cat start/end x, wordmark baseline
const CAT_S=1.3;
function sparkle(cx,cy,r){const k=r*.16;return `M${cx},${cy-r}C${cx+k},${cy-k} ${cx+k},${cy-k} ${cx+r},${cy}C${cx+k},${cy+k} ${cx+k},${cy+k} ${cx},${cy+r}C${cx-k},${cy+k} ${cx-k},${cy+k} ${cx-r},${cy}C${cx-k},${cy-k} ${cx-k},${cy-k} ${cx},${cy-r}Z`}
function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
function ik(P,F,a,b,sign){const dx=F[0]-P[0],dy=F[1]-P[1];let d=Math.hypot(dx,dy);d=Math.min(d,a+b-.01);const base=Math.atan2(dy,dx);const ang=Math.acos(clamp((a*a+d*d-b*b)/(2*a*d),-1,1));const th=base+sign*ang;return[P[0]+a*Math.cos(th),P[1]+a*Math.sin(th)]}
function mount(host,opt={}){
 const theme=opt.theme||'dark';const ink=theme==='dark'?'#ffffff':'#0b1e3f';const sub=theme==='dark'?'#8fdcff':'#3a5a86';
 const W=GL.wm.w;
 const svg=el('svg',{viewBox:'-370 -400 740 510',role:'img','aria-label':'mitsi.ai',style:'width:100%;height:auto;display:block;overflow:visible'});
 const defs=el('defs',{},svg);
 defs.innerHTML=`<linearGradient id="mcG" gradientUnits="userSpaceOnUse" x1="-150" y1="-140" x2="150" y2="10"><stop offset="0" stop-color="#6ff3ff"/><stop offset=".5" stop-color="#3d8bff"/><stop offset="1" stop-color="#8a5cff"/></linearGradient>
 <linearGradient id="mcGf" gradientUnits="userSpaceOnUse" x1="-150" y1="-140" x2="150" y2="10"><stop offset="0" stop-color="#3fb6d8"/><stop offset=".5" stop-color="#2a5fc4"/><stop offset="1" stop-color="#5a3cc0"/></linearGradient>
 <linearGradient id="mcAi" gradientUnits="userSpaceOnUse" x1="430" y1="0" x2="650" y2="0"><stop offset="0" stop-color="#6ff3ff"/><stop offset=".5" stop-color="#3d8bff"/><stop offset="1" stop-color="#8a5cff"/></linearGradient>
 <radialGradient id="mcSh"><stop offset="0" stop-color="#3d8bff" stop-opacity=".45"/><stop offset="1" stop-color="#3d8bff" stop-opacity="0"/></radialGradient>
 <filter id="mcGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
 // wordmark
 const word=el('g',{transform:`translate(${-W/2} ${BASE})`},svg);const glyphs=[];
 GL.wm.g.forEach((g,i)=>{const cx=g.x+g.w/2;let e;
   if(g.c==='.'){e=el('path',{d:sparkle(cx,-24,27),fill:'url(#mcAi)'},word);e._spark=1}
   else e=el('path',{d:g.d,fill:i<5?ink:'url(#mcAi)'},word);
   glyphs.push({e,cx:cx-W/2,i,spark:g.c==='.'})});
 // tagline
 const tag=el('path',{d:GL.tg.d,fill:sub,transform:`translate(${-GL.tg.w/2} 78)`},svg);
 // cat
 const shadow=el('ellipse',{cx:0,cy:4,rx:120,ry:9,fill:'url(#mcSh)'},svg);
 const cat=el('g',{},svg);
 const farLegs=el('g',{opacity:.55},cat);
 const tail=el('path',{fill:'none',stroke:'url(#mcGf)','stroke-width':13,'stroke-linecap':'round'},cat);
 const legHB=el('path',{fill:'none',stroke:'url(#mcGf)','stroke-width':15,'stroke-linecap':'round','stroke-linejoin':'round'},farLegs);
 const legFB=el('path',{fill:'none',stroke:'url(#mcGf)','stroke-width':15,'stroke-linecap':'round','stroke-linejoin':'round'},farLegs);
 const body=el('g',{fill:'url(#mcG)'},cat);
 const torso=el('path',{fill:'none',stroke:'url(#mcG)','stroke-width':48,'stroke-linecap':'round'},body);
 const haunch=el('ellipse',{rx:27,ry:25},body);const chest=el('ellipse',{rx:22,ry:25},body);
 const neck=el('path',{fill:'none',stroke:'url(#mcG)','stroke-width':26,'stroke-linecap':'round'},body);
 const legH=el('path',{fill:'none',stroke:'url(#mcG)','stroke-width':16,'stroke-linecap':'round','stroke-linejoin':'round'},cat);
 const legF=el('path',{fill:'none',stroke:'url(#mcG)','stroke-width':16,'stroke-linecap':'round','stroke-linejoin':'round'},cat);
 const head=el('g',{},cat);
 const headIn=el('g',{fill:'url(#mcG)'},head);
 el('path',{d:'M-12,-16 L-20,-46 L2,-25 Z'},headIn);           // back ear
 el('path',{d:'M6,-22 L15,-50 L24,-18 Z'},headIn);             // front ear
 el('circle',{cx:0,cy:0,r:25},headIn);
 el('ellipse',{cx:19,cy:7,rx:14,ry:11},headIn);
 const earIn=el('path',{d:'M10,-24 L15,-41 L20,-22 Z',fill:'#03122b',opacity:.35},head);
 const eye=el('ellipse',{cx:13,cy:-3,rx:5.2,ry:6.5,fill:'#e6fdff',filter:'url(#mcGlow)'},head);
 el('ellipse',{cx:31,cy:3,rx:3.2,ry:2.4,fill:'#03122b',opacity:.45},head);  // nose
 const whisk=el('path',{d:'M28,11 L50,8 M28,14 L49,17',stroke:'#bff4ff','stroke-width':1.6,opacity:.55,'stroke-linecap':'round'},head);
 host.innerHTML='';host.appendChild(svg);
 const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const LEG=36;
 function draw(t){
  if(reduce)t=T.end+.5;
  // wordmark letters rise
  glyphs.forEach(g=>{let p=eout((t-T.wordIn-g.i*.06)/.5);let dy=(1-p)*30;let sc=1,rot=0;
   if(g.spark){p=back((t-T.spark)/.6);const tw=t>T.spark+.6?Math.sin((t-T.spark)*2.1):0;g.e.setAttribute('transform',`translate(${g.cx+W/2} -24) rotate(${(1-p)*-90+tw*12}) scale(${p*(1+.08*tw)}) translate(${-(g.cx+W/2)} 24)`);g.e.setAttribute('opacity',p>0?1:0);return}
   g._dy=dy;g._p=p});
  // cat state
  const kw=clamp((t-T.walk0)/(T.walk1-T.walk0));
  const xw=X0+(X1-X0)*(1-Math.pow(1-kw,1.6)*(kw<1?1:0))*1;   // decelerate slightly
  const x=t<T.walk0?X0:t>T.walk1?X1:lerp(X0,X1,1-Math.pow(1-kw,1.35));
  const dist=x-X0;const walking=t>=T.walk0&&t<T.walk1;
  const lie=ease((t-T.lie0)/(T.lie1-T.lie0));
  const rubE=Math.sin(Math.PI*clamp((t-T.rub0)/(T.rub1-T.rub0)));const rubW=rubE*Math.sin((t-T.rub0)*15);
  const breathe=t>T.lie1?Math.sin((t-T.lie1)*2.4)*1.2:0;
  // rub: contact with letters above
  let rub=0;const headX=x+74*CAT_S;glyphs.forEach(g=>{if(g.spark)return;const prox=Math.exp(-Math.pow((headX-g.cx)/60,2));const c=prox*(walking?1:0);rub=Math.max(rub,c);
    const bump=c*9+prox*rubE*(7+5*rubW);g.e.setAttribute('transform',`translate(0 ${g._dy-bump}) rotate(${c*Math.sin((x-g.cx)/20)*2} ${g.cx+W/2} 0)`);g.e.setAttribute('opacity',g._p)});
  const bob=walking?Math.abs(Math.sin(dist/110*Math.PI*2))*2.5:0;
  const hipY=lerp(-62,-27,lie)-bob, shY=lerp(-66,-31,lie)-bob*.6+breathe*.3;
  const H=[-52,hipY],S=[46,shY];
  const arch=lerp(8+rub*6+rubE*7,3,lie)+breathe;
  torso.setAttribute('d',`M${H[0]},${H[1]} Q${(H[0]+S[0])/2},${(H[1]+S[1])/2-arch*2} ${S[0]},${S[1]}`);
  haunch.setAttribute('cx',H[0]-2);haunch.setAttribute('cy',H[1]+2+lie*4);haunch.setAttribute('ry',25+lie*3);chest.setAttribute('cx',S[0]+4);chest.setAttribute('cy',S[1]+3);
  // head
  const hx=lerp(70,74,lie)+rubE*4,hy=lerp(shY-40,shY-36,lie)-rubE*12;
  const nod=walking?Math.sin(dist/110*Math.PI*4)*2:0;
  const rubTilt=rub*-8+rubE*(-16+9*rubW);
  const look=t>T.lie1?Math.sin(clamp((t-T.lie1-.3)/1.2)*Math.PI)*-6:0;
  neck.setAttribute('d',`M${S[0]-4},${S[1]} L${hx-10},${hy+12}`);
  head.setAttribute('transform',`translate(${hx} ${hy+nod}) rotate(${rubTilt+look})`);
  // blink
  let bl=1;const bt=[T.lie1+.6,T.lie1+4.2,T.lie1+8.4];if(t>T.lie1+4)bt.push(T.lie1+.6+Math.floor((t-T.lie1-.6)/4.2)*4.2);
  bt.forEach(b=>{const d=Math.abs(t-b);if(d<.12)bl=Math.min(bl,d/.12)});eye.setAttribute('ry',6.5*Math.max(.12,bl));
  // ear twitch
  const et=t>T.lie1+1.6?Math.max(0,Math.sin(((t-T.lie1-1.6)%5)*10))*((t-T.lie1-1.6)%5<.32?1:0):0;
  earIn.setAttribute('transform',`rotate(${et*-12} 15 -22)`);
  // legs (gait)
  const ph=dist/110;
  const foot=(anchor,off,front)=>{const p=((ph+off)%1+1)%1;let fx,fy;const st=33;
    if(!walking&&t<T.walk0){fx=anchor;fy=0}
    else if(p<.6){fx=anchor+st-(p/.6)*2*st;fy=0}else{const q=(p-.6)/.4;fx=anchor-st+q*2*st;fy=-14*Math.sin(Math.PI*q)}
    if(t>=T.walk1){fx=anchor;fy=0}
    return[fx,fy]};
  const legPath=(P,F,sign,lieF)=>{const Fx=lerp(F[0],lieF[0],lie),Fy=lerp(F[1],lieF[1],lie);const K=ik(P,[Fx,Fy],LEG,LEG,sign);return `M${P[0]},${P[1]+6} L${K[0]},${K[1]} L${Fx},${Fy-4} l7,0`};
  legH.setAttribute('d',legPath([H[0]+4,H[1]],foot(-46,0,0),-1,[H[0]+34,-4]));
  legHB.setAttribute('d',legPath([H[0]-6,H[1]],foot(-58,.5,0),-1,[H[0]+24,-4]));
  legF.setAttribute('d',legPath([S[0],S[1]],foot(52,.25,1),1,[S[0]+60,-4]));
  legFB.setAttribute('d',legPath([S[0]-10,S[1]],foot(40,.75,1),1,[S[0]+44,-4]));
  // tail
  const sw=Math.sin(t*3.1)*(walking?10:4);
  const T0=[H[0]-22,H[1]-6];
  const wP1=[T0[0]-34,T0[1]-4],wP2=[T0[0]-54,T0[1]-46+sw],wP3=[T0[0]-42+sw,T0[1]-82];
  const lP1=[T0[0]-30,T0[1]+30],lP2=[T0[0]-72,-2],lP3=[T0[0]-92+sw*.6,-22+sw*.4];
  const L2=(a,b)=>[lerp(a[0],b[0],lie),lerp(a[1],b[1],lie)];
  const p1=L2(wP1,lP1),p2=L2(wP2,lP2),p3=L2(wP3,lP3);
  tail.setAttribute('d',`M${T0[0]},${T0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`);
  cat.setAttribute('transform',`translate(${x} 0) scale(${CAT_S})`);
  cat.setAttribute('opacity',clamp((t-T.walk0+.05)/.3));
  shadow.setAttribute('cx',x);shadow.setAttribute('opacity',clamp((t-T.walk0)/.3)*lerp(.8,1,lie));shadow.setAttribute('rx',lerp(110,150,lie));
  tag.setAttribute('opacity',eout((t-T.tag)/.6));
 }
 let raf,t0;
 if(opt.autoplay!==false){const loop=ts=>{if(t0==null)t0=ts;draw((ts-t0)/1000);raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop)}
 else draw(0);
 return{draw,svg,stop:()=>cancelAnimationFrame(raf),replay:()=>{t0=null}};
}
window.MitsiLogo={mount,T};
})();
