import json,re
h=open('showreel.html',encoding='utf-8').read()
def r(a,b,cnt=1):
    global h
    assert a in h,a[:60]
    h=h.replace(a,b,cnt)
# ---------- part A markup (native landscape) ----------
A_HTML=r'''
H.a1=`<div class="tint" style="background:radial-gradient(900px 500px at 35% 50%,#0b2a5a,#030812 80%)"></div>
 <svg id="a1s" viewBox="0 0 1280 720"><g id="a1w" fill="none" stroke-linecap="round"></g></svg>
 <div class="abs o k" id="a1k" style="right:70px;top:210px;left:auto">THE NEW VOICE</div>
 <div class="abs big gt" id="a1h" style="right:70px;top:240px;width:600px;text-align:right;font-size:84px">הקול הראשון<br>שהלקוח שומע</div>
 <div class="abs gold" id="a1s2" style="right:70px;top:470px;width:600px;text-align:right;font-size:44px;font-weight:800">הוא הקול של העסק</div>`;
H.a2=`<div class="tint" style="background:radial-gradient(800px 600px at 30% 50%,#0b2a5a,#030812 80%)"></div>
 <div class="abs o gt" id="a2y" style="left:80px;top:150px;font-size:230px;direction:ltr;letter-spacing:6px">2008</div>
 <div class="abs" id="a2l" style="left:90px;top:440px;width:560px;height:6px;border-radius:3px;background:rgba(255,255,255,.14)"><div id="a2b" style="height:100%;width:0;border-radius:3px;background:linear-gradient(90deg,#3de1ff,#e0b877)"></div></div>
 <div class="abs o k" style="left:90px;top:460px;font-size:16px;color:var(--dim)">2008 → TODAY</div>
 <div class="abs o k" id="a2k" style="right:70px;top:170px;left:auto">SINCE 2008</div>
 <div class="abs big gt" id="a2h" style="right:70px;top:200px;width:520px;text-align:right;font-size:100px">הקול החדש</div>
 <div class="abs" id="a2t" style="right:70px;top:340px;width:520px;text-align:right;font-size:36px;font-weight:500;color:var(--dim)">מקליטים את הקול של</div>
 <div class="abs gold big" id="a2n" style="right:70px;top:395px;width:520px;text-align:right;font-size:92px">אלפי עסקים</div>`;
H.a3=`<div class="tint" style="background:radial-gradient(800px 600px at 30% 50%,#0b2a5a,#030812 80%)"></div>
 <svg id="a3s" viewBox="0 0 1280 720"><g id="a3st"></g></svg>
 <div class="abs o gt" id="a3n" style="left:120px;top:370px;font-size:170px;direction:ltr">5.0</div>
 <div class="abs o k" id="a3k" style="right:70px;top:200px;left:auto">GOOGLE REVIEWS</div>
 <div class="abs big gt" id="a3h" style="right:70px;top:230px;width:540px;text-align:right;font-size:80px">ביקורות מעולות<br>בגוגל</div>
 <div class="abs" id="a3c" style="right:70px;top:440px;width:540px;text-align:right"><span class="chip hi">לקוחות שחוזרים</span><span class="chip">שירות אישי</span></div>`;
H.a4=`<div class="tint" style="background:radial-gradient(800px 600px at 30% 50%,#0b2a5a,#030812 80%)"></div>
 <svg id="a4s" viewBox="0 0 1280 720"><g id="a4l" stroke="#3de1ff" stroke-width="2.5" fill="none" stroke-dasharray="7 7"></g><g id="a4n"></g></svg>
 <div class="abs o k" id="a4k" style="right:70px;top:180px;left:auto">VOICE ROUTING DESIGN</div>
 <div class="abs big gt" id="a4h" style="right:70px;top:210px;width:540px;text-align:right;font-size:64px">ייעוץ ובניית<br>מענים קוליים</div>
 <div class="abs" id="a4t" style="right:70px;top:380px;width:540px;text-align:right;font-size:40px;font-weight:800" ><span class="gold">לחברות מובילות במשק</span></div>`;
H.a5=`<div class="tint" style="background:radial-gradient(800px 600px at 30% 50%,#10265a,#030812 80%)"></div>
 <div class="abs" id="a5eq" style="left:70px;top:210px;width:620px;height:300px;display:flex;gap:9px;align-items:flex-end;direction:ltr"></div>
 <div class="abs" id="a5nt" style="left:70px;top:130px;width:620px;height:80px;font-size:54px;color:#e0b877"></div>
 <div class="abs o k" id="a5k" style="right:70px;top:210px;left:auto">JINGLES · RADIO</div>
 <div class="abs big gt" id="a5h" style="right:70px;top:240px;width:540px;text-align:right;font-size:84px">ג׳ינגלים<br>ופרסומות רדיו</div>
 <div class="abs" id="a5c" style="right:70px;top:480px;width:540px;text-align:right"><span class="chip hi" style="font-size:28px">שנשארים בראש</span></div>`;
H.a6=`<div class="tint" style="background:radial-gradient(800px 600px at 30% 50%,#0b2a5a,#030812 80%)"></div>
 <div class="abs" id="a6g" style="left:60px;top:150px;width:640px;height:430px"></div>
 <div class="abs o k" id="a6k" style="right:70px;top:210px;left:auto">VOICE TALENT</div>
 <div class="abs big gt" id="a6h" style="right:70px;top:240px;width:520px;text-align:right;font-size:70px">מגוון רחב של<br>קריינים וקריינות</div>
 <div class="abs" id="a6c" style="right:70px;top:430px;width:520px;text-align:right"><span class="chip">לכל סגנון</span><span class="chip hi">לכל קהל</span></div>`;
H.a7=`<img class="bg" id="a7v"><div class="tint" style="background:linear-gradient(270deg,rgba(3,8,18,.9),rgba(3,8,18,.55) 55%,rgba(3,8,18,.2))"></div>
 <div class="abs" id="a7l" style="left:110px;top:210px;width:470px;border-radius:22px;background:#fff;overflow:hidden;box-shadow:0 0 70px rgba(61,225,255,.4)"><img src="img/mitsi-logo.png" style="display:block;width:100%"></div>
 <div class="abs o k" id="a7k" style="right:70px;top:190px;left:auto">NEXT-GEN PBX</div>
 <div class="abs big gt" id="a7h" style="right:70px;top:220px;width:540px;text-align:right;font-size:70px">המרכזיות<br>המתקדמות שיש</div>
 <div class="abs" id="a7t" style="right:70px;top:420px;width:540px;text-align:right;font-size:44px;font-weight:800"><span class="gold">דור העתיד של המרכזיות</span></div>`;
'''
r("$('scenes').innerHTML=",A_HTML+"\n$('scenes').innerHTML=")
# ---------- init for part A ----------
INIT=r'''
$('a1w').innerHTML=[0,1,2,3].map(i=>`<path id="a1p${i}" stroke="${['#3de1ff','#4d7cff','#7fe9ff','#e0b877'][i]}" stroke-width="${[5,3,2,3][i]}" opacity="${[1,.7,.5,.6][i]}"/>`).join('');
$('a3st').innerHTML=Array.from({length:5},(_,i)=>`<path id="a3s${i}" transform="translate(${120+i*105} 170) scale(2.2)" d="M24 2l6.5 14.5 15.5 1.5-11.7 10.5 3.4 15.5L24 36l-13.7 8 3.4-15.5L2 18l15.5-1.5z" fill="none" stroke="#e0b877" stroke-width="2"/><path id="a3f${i}" transform="translate(${120+i*105} 170) scale(2.2)" d="M24 2l6.5 14.5 15.5 1.5-11.7 10.5 3.4 15.5L24 36l-13.7 8 3.4-15.5L2 18l15.5-1.5z" fill="#e0b877" opacity="0"/>`).join('');
{const N=[[640,110,'שלום, הגעתם ל...',150],[640,290,'',0]];
 const NA=[['מכירות','1',200,520],['שירות','2',480,520],['חשבונות','3',760,520]];
 $('a4l').innerHTML=`<path id="a4p0" d="M420 190 L260 420"/><path id="a4p1" d="M420 190 L420 420"/><path id="a4p2" d="M420 190 L580 420"/>`;
 $('a4n').innerHTML=`<g id="a4g0"><rect x="300" y="130" width="240" height="70" rx="16" fill="rgba(10,24,52,.92)" stroke="#3de1ff" stroke-width="2.5"/><text x="420" y="175" text-anchor="middle" fill="#fff" font-size="26" font-weight="800">שלום, הגעתם ל...</text></g>`+[['מכירות',1,260],['שירות',2,420],['חשבונות',3,580]].map(([t,n,x],i)=>`<g id="a4g${i+1}"><rect x="${x-80}" y="420" width="160" height="90" rx="16" fill="rgba(10,24,52,.92)" stroke="#e0b877" stroke-width="2.5"/><text x="${x}" y="452" text-anchor="middle" fill="#e0b877" font-size="22" font-weight="800">לחצו ${n}</text><text x="${x}" y="488" text-anchor="middle" fill="#fff" font-size="26" font-weight="800">${t}</text></g>`).join('');}
$('a5eq').innerHTML=Array.from({length:30},(_,i)=>`<i style="display:block;flex:1;border-radius:6px;background:linear-gradient(180deg,#e0b877,#4d7cff);height:20px"></i>`).join('');
$('a5nt').innerHTML=['♪','♫','♪','♫','♪'].map((n,i)=>`<span id="a5n${i}" style="position:absolute;left:${60+i*120}px">${n}</span>`).join('');
{const CL=['#3de1ff','#e0b877','#7fe9ff','#4d7cff','#ff8a5c','#27d17a'],LB=['חם','מקצועי','אנרגטי','רגוע','צעיר','בטוח'];
 $('a6g').innerHTML=LB.map((t,i)=>`<div id="a6c${i}" class="glass" style="position:absolute;left:${(i%3)*215}px;top:${Math.floor(i/3)*215}px;width:200px;height:200px;padding:14px;border-color:${CL[i]}"><div class="k o" style="color:${CL[i]};font-size:12px">VOICE 0${i+1}</div><div style="height:100px;margin-top:10px;display:flex;gap:4px;align-items:center;direction:ltr" id="a6w${i}">${Array.from({length:12},()=>`<i style="display:block;flex:1;border-radius:3px;background:${CL[i]};height:8px"></i>`).join('')}</div><div style="font-size:28px;font-weight:800;margin-top:14px;text-align:right">${t}</div></div>`).join('');}
'''
r("// builders",INIT+"\n// builders")
# ---------- timeline / ids ----------
tl=json.load(open('show_timeline.json'))
r("const SEG=TL.seg;const TOTAL=TL.total;","const SEG=TL.seg;const TOTAL=TL.total;const DESM=TL.des;const SIDX=id=>SEG.findIndex(s=>s[2]===id);")
a=h.index("const DES=[");b=h.index("\n",a)
h=h[:a]+"const DES=[];"+h[b:]
h=re.sub(r"const TL=.*?;\nconst SEG=TL.seg",lambda m:"const TL="+json.dumps(tl)+";\nconst SEG=TL.seg",h,count=1,flags=re.S)
r("const L=i=>clamp(t-SEG[i][0],0,SEG[i][1]-SEG[i][0])*DES[i]/(SEG[i][1]-SEG[i][0]);let lt;","const L=id=>{const i=SIDX(id),d=SEG[i][1]-SEG[i][0];return clamp(t-SEG[i][0],0,d)*DESM[id]/d};let lt;")
# replace L(n)
for n in range(1,10):
    h=h.replace(f"lt=L({n});",f"lt=L('f{n}');")
# drop f0 block
a=h.index("  lt=L(0);");b=h.index("\n",h.index("show('f0s',lt,1.5);"))
h=h[:a]+h[b+1:]
r("$('logo').style.opacity=t<SEG[9][0]?1:0;","$('logo').style.opacity=(t>=SEG[SIDX('a7')][0]&&t<SEG[SIDX('f9')][0])?1:0;$('nvs')&&0;")
# part A animation
ANIM=r'''  lt=L('a1');{const ps=[0,1,2,3].map(i=>{let d='M0 360';for(let x=0;x<=1280;x+=16){const e=Math.exp(-Math.pow((x-640)/460,2));const y=360+e*(90*Math.sin(x*.018+t*4+i)*Math.sin(t*2.2+i*1.3)+60*Math.sin(x*.043-t*6+i*2)*(i+1)/3)*(.5+.5*Math.sin(t*1.5));d+=' L'+x+' '+y.toFixed(1)}return d});ps.forEach((d,i)=>$('a1p'+i).setAttribute('d',d));show('a1k',lt,.2);show('a1h',lt,.4,.5,30,.05);show('a1s2',lt,2.2)}
  lt=L('a2');show('a2h',lt,.2,.5,30,.05);show('a2k',lt,.1);show('a2t',lt,1.1);show('a2n',lt,1.7,.5,26,.05);{const yy=Math.round(2000+8*ease(lt/1.6));$('a2y').textContent=String(yy);$('a2b').style.width=(ease((lt-.8)/3)*100)+'%'}
  lt=L('a3');show('a3k',lt,.1);show('a3h',lt,.3,.5,30,.05);show('a3n',lt,2.6,.5,20,.1);for(let i=0;i<5;i++){$('a3f'+i).setAttribute('opacity',ease((lt-.6-i*.35)/.3))}show('a3c',lt,3.4);
  lt=L('a4');show('a4k',lt,.1);show('a4h',lt,.3,.5,30,.05);show('a4t',lt,2.4);show('a4g0',lt,.8,.4,0);[0,1,2].forEach(i=>{const s=seg(lt,1.4+i*.5,.5);$('a4p'+i).style.opacity=s;$('a4p'+i).style.strokeDashoffset=(1-s)*80;$('a4g'+(i+1)).style.opacity=s});
  lt=L('a5');show('a5k',lt,.1);show('a5h',lt,.3,.5,30,.05);show('a5c',lt,2.2);[...$('a5eq').children].forEach((b,i)=>{const v=.5+.5*Math.sin(t*9+i*.7);const w=.5+.5*Math.sin(t*3.1+i*.31);b.style.height=(30+250*v*w*ease(lt/.6))+'px'});for(let i=0;i<5;i++){const n=$('a5n'+i);const p=((lt*.5+i*.2)%1);n.style.top=(60-p*60)+'px';n.style.opacity=Math.sin(p*Math.PI)}
  lt=L('a6');show('a6k',lt,.1);show('a6h',lt,.3,.5,30,.05);show('a6c',lt,2.6);for(let i=0;i<6;i++){show('a6c'+i,lt,.4+i*.45,.4,18);[...$('a6w'+i).children].forEach((b,j)=>{const on=lt>.6+i*.45;b.style.height=(8+(on?80:2)*(.5+.5*Math.sin(t*8+j*.9+i))*(.6+.4*Math.sin(t*2+i+j)))+'px'})}
  lt=L('a7');jobs.push(setImg($('a7v'),pp('city',lt*24+40,199)));show('a7l',lt,.3,.6,0,.1);show('a7k',lt,.2);show('a7h',lt,.7,.5,30,.05);show('a7t',lt,2.4);
'''
r("  lt=L('f1');",ANIM+"  lt=L('f1');")
# HUD label per part
r("$('live').style.opacity=.5+.5*Math.sin(t*6);","$('live').style.opacity=.5+.5*Math.sin(t*6);{const lab=document.querySelector('#hud .abs.o');if(lab){const nv=t<SEG[SIDX('a7')][0];lab.lastChild.textContent=nv?'THE NEW VOICE · SINCE 2008':'CLOUD PBX · 2030'}}")
# final card brand line
r("<div class=\"abs\" id=\"f9c\"","<div class=\"abs\" id=\"f9m\" style=\"left:0;right:0;top:600px;text-align:center;font-size:24px;color:var(--dim)\">הקול החדש · מיצי תקשורת</div><div class=\"abs\" id=\"f9c\"")
r("show('f9c',lt,5.6);","show('f9c',lt,5.6);show('f9m',lt,6.4);")
open('showreel.html','w',encoding='utf-8').write(h)
print('ok')
