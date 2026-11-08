/* Mitsi the cat – rigged flat-vector SVG. makeCat(prefix) returns svg <g> markup; poseCat(prefix, P) updates it. */
const CK='#26242b',OR='#f39a3d',OR2='#d9772a',WH='#fff8ef',PK='#f6a5b2',TIE='#d8333f';
function limb(id,len,w=30){return `<g id="${id}"><line x1="0" y1="0" x2="0" y2="${len}" stroke="${CK}" stroke-width="${w+12}" stroke-linecap="round"/><line x1="0" y1="0" x2="0" y2="${len}" stroke="${OR}" stroke-width="${w}" stroke-linecap="round"/><g transform="translate(0 ${len})"><ellipse rx="${w*.72}" ry="${w*.55}" fill="${WH}" stroke="${CK}" stroke-width="6"/><line x1="-6" y1="-2" x2="-6" y2="${w*.4}" stroke="${CK}" stroke-width="3"/><line x1="6" y1="-2" x2="6" y2="${w*.4}" stroke="${CK}" stroke-width="3"/></g></g>`}
function eye(p,s,x){return `<clipPath id="${p}c${s}"><ellipse cx="${x}" cy="-100" rx="25" ry="23"/></clipPath>
<ellipse cx="${x}" cy="-100" rx="25" ry="23" fill="#fff"/>
<g clip-path="url(#${p}c${s})"><g id="${p}iris${s}"><circle cx="${x}" cy="-98" r="15" fill="#b7d84b"/><ellipse cx="${x}" cy="-98" rx="5" ry="12" fill="${CK}"/><circle cx="${x+5}" cy="-104" r="4" fill="#fff"/></g>
<g id="${p}lid${s}"><rect x="${x-30}" y="-160" width="60" height="37" fill="${OR}"/><line x1="${x-30}" y1="-123" x2="${x+30}" y2="-123" stroke="${CK}" stroke-width="6"/></g></g>
<ellipse id="${p}eo${s}" cx="${x}" cy="-100" rx="25" ry="23" fill="none" stroke="${CK}" stroke-width="6"/>
<path id="${p}ec${s}" d="M${x-24} -102 Q ${x} -84 ${x+24} -102" fill="none" stroke="${CK}" stroke-width="7" stroke-linecap="round" opacity="0"/>`}
function makeCat(p){return `<g id="${p}root">
<g id="${p}tail" transform="translate(78 -40)"><path d="M0 0 C 70 -10, 100 -70, 78 -140 C 68 -175, 92 -192, 112 -184" fill="none" stroke="${CK}" stroke-width="40" stroke-linecap="round"/><path d="M0 0 C 70 -10, 100 -70, 78 -140 C 68 -175, 92 -192, 112 -184" fill="none" stroke="${OR}" stroke-width="27" stroke-linecap="round"/><path d="M84 -120 L 100 -126 M88 -150 L 104 -152" stroke="${OR2}" stroke-width="7" stroke-linecap="round"/></g>
<g id="${p}legs" opacity="0">${limb(p+'legL',70,34).replace('<g id','<g transform="translate(-42 -20)"><g id')+'</g>'}${limb(p+'legR',70,34).replace('<g id','<g transform="translate(42 -20)"><g id')+'</g>'}</g>
<g id="${p}haunch"><ellipse cx="-78" cy="-38" rx="48" ry="42" fill="${OR}" stroke="${CK}" stroke-width="7"/><ellipse cx="78" cy="-38" rx="48" ry="42" fill="${OR}" stroke="${CK}" stroke-width="7"/><ellipse cx="-62" cy="-6" rx="34" ry="15" fill="${WH}" stroke="${CK}" stroke-width="6"/><ellipse cx="62" cy="-6" rx="34" ry="15" fill="${WH}" stroke="${CK}" stroke-width="6"/></g>
<path d="M-92 -4 C -122 -70, -104 -175, -58 -222 L 58 -222 C 104 -175, 122 -70, 92 -4 Z" fill="${OR}" stroke="${CK}" stroke-width="7"/>
<ellipse cx="0" cy="-96" rx="54" ry="86" fill="${WH}"/>
<path d="M-98 -120 q 18 6 26 -2 M-102 -80 q 20 6 28 -2 M98 -120 q -18 6 -26 -2 M102 -80 q -20 6 -28 -2" stroke="${OR2}" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M-34 -222 L 0 -196 L 34 -222 L 18 -228 L 0 -214 L -18 -228 Z" fill="#fff" stroke="${CK}" stroke-width="5" stroke-linejoin="round"/>
<g id="${p}tie"><path d="M-11 -210 L 11 -210 L 8 -196 L -8 -196 Z" fill="${TIE}" stroke="${CK}" stroke-width="5" stroke-linejoin="round"/><path d="M-8 -196 L 8 -196 L 18 -140 L 0 -120 L -18 -140 Z" fill="${TIE}" stroke="${CK}" stroke-width="5" stroke-linejoin="round"/><path d="M-4 -178 L 6 -170 M -9 -158 L 11 -146" stroke="#9e1f2a" stroke-width="4"/></g>
<g id="${p}armL" transform="translate(-58 -192)">${limb(p+'aL',175)}<g id="${p}mug" opacity="0" transform="translate(0 175)"><rect x="-26" y="-58" width="44" height="54" rx="8" fill="#fff" stroke="${CK}" stroke-width="6"/><path d="M18 -46 q 18 0 18 14 q 0 14 -18 14" fill="none" stroke="${CK}" stroke-width="6"/><rect x="-26" y="-40" width="44" height="12" fill="#d97757"/><path d="M-12 -66 q -6 -10 0 -18 M2 -66 q -6 -10 0 -18" stroke="#9aa" stroke-width="4" fill="none" stroke-linecap="round"/></g></g>
<g id="${p}armR" transform="translate(58 -192)">${limb(p+'aR',175)}<g id="${p}remote" opacity="0" transform="translate(0 175) rotate(180)"><rect x="-14" y="-10" width="28" height="70" rx="8" fill="#3a3a46" stroke="${CK}" stroke-width="5"/><circle id="${p}rbtn" cx="0" cy="45" r="8" fill="#ff4d5e"/><circle cx="0" cy="20" r="5" fill="#9aa"/></g></g>
<g id="${p}head" transform="translate(0 -222)">
 <g id="${p}earL"><path d="M-92 -128 L -80 -222 L -26 -172 Z" fill="${OR}" stroke="${CK}" stroke-width="7" stroke-linejoin="round"/><path d="M-78 -146 L -72 -196 L -44 -172 Z" fill="${PK}"/></g>
 <g id="${p}earR"><path d="M92 -128 L 80 -222 L 26 -172 Z" fill="${OR}" stroke="${CK}" stroke-width="7" stroke-linejoin="round"/><path d="M78 -146 L 72 -196 L 44 -172 Z" fill="${PK}"/></g>
 <ellipse cx="0" cy="-92" rx="108" ry="90" fill="${OR}" stroke="${CK}" stroke-width="7"/>
 <path d="M-14 -176 L -10 -150 M0 -180 L 0 -150 M14 -176 L 10 -150" stroke="${OR2}" stroke-width="7" stroke-linecap="round"/>
 <path d="M-104 -80 q 14 4 22 -4 M104 -80 q -14 4 -22 -4" stroke="${OR2}" stroke-width="6" fill="none" stroke-linecap="round"/>
 ${eye(p,'L',-42)}${eye(p,'R',42)}
 <path id="${p}browL" d="M-66 -134 L -22 -128" stroke="${CK}" stroke-width="6" stroke-linecap="round"/>
 <path id="${p}browR" d="M66 -134 L 22 -128" stroke="${CK}" stroke-width="6" stroke-linecap="round"/>
 <ellipse cx="-20" cy="-56" rx="26" ry="19" fill="${WH}"/><ellipse cx="20" cy="-56" rx="26" ry="19" fill="${WH}"/>
 <g id="${p}mouthO" opacity="0"><ellipse id="${p}mo" cx="0" cy="-44" rx="13" ry="10" fill="#7a1f2c" stroke="${CK}" stroke-width="5"/><ellipse id="${p}tg" cx="0" cy="-38" rx="8" ry="5" fill="${PK}"/></g>
 <path id="${p}mouthC" d="M-16 -52 Q -8 -42 0 -52 Q 8 -42 16 -52" fill="none" stroke="${CK}" stroke-width="5" stroke-linecap="round"/>
 <path d="M-9 -70 L 9 -70 L 0 -59 Z" fill="${PK}" stroke="${CK}" stroke-width="4" stroke-linejoin="round"/>
 <path d="M-46 -62 L -112 -72 M-46 -54 L -110 -50 M46 -62 L 112 -72 M46 -54 L 110 -50" stroke="${CK}" stroke-width="3.5" stroke-linecap="round"/>
</g></g>`}
function poseCat(p,P){const g=id=>document.getElementById(p+id);
 const d={x:360,y:1000,s:1,rot:0,aL:8,aR:-8,lidL:.42,lidR:.42,mouth:0,earL:0,earR:0,tail:0,head:0,brow:0,stand:0,look:0,legL:0,legR:0,headY:0,mug:0,remote:0,press:0};P=Object.assign(d,P);
 g('root').setAttribute('transform',`translate(${P.x} ${P.y}) rotate(${P.rot}) scale(${P.s})`);
 g('armL').setAttribute('transform',`translate(-58 -192) rotate(${P.aL})`);g('armR').setAttribute('transform',`translate(58 -192) rotate(${P.aR})`);
 g('head').setAttribute('transform',`translate(0 ${-222+P.headY}) rotate(${P.head} 0 -60)`);
 g('lidL').setAttribute('transform',`translate(0 ${46*P.lidL})`);g('lidR').setAttribute('transform',`translate(0 ${46*P.lidR})`);['L','R'].forEach(k=>{const c=P['lid'+k]>.93;g('ec'+k).setAttribute('opacity',c?1:0);g('eo'+k).setAttribute('opacity',c?0:1);g('lid'+k).setAttribute('opacity',c?0:1);g('iris'+k).setAttribute('opacity',c?0:1)});
 g('irisL').setAttribute('transform',`translate(${P.look} 0)`);g('irisR').setAttribute('transform',`translate(${P.look} 0)`);
 g('browL').setAttribute('transform',`rotate(${P.brow} -44 -131)`);g('browR').setAttribute('transform',`rotate(${-P.brow} 44 -131)`);
 g('earL').setAttribute('transform',`rotate(${P.earL} -60 -150)`);g('earR').setAttribute('transform',`rotate(${-P.earR} 60 -150)`);
 g('tail').setAttribute('transform',`translate(78 -40) rotate(${P.tail})`);
 const m=clamp(P.mouth);g('mouthO').setAttribute('opacity',m>.08?1:0);g('mouthC').setAttribute('opacity',m>.08?0:1);g('mo').setAttribute('ry',4+16*m);g('mo').setAttribute('cy',-48+8*m);g('tg').setAttribute('cy',-42+15*m);
 g('legs').setAttribute('opacity',P.stand);g('haunch').setAttribute('opacity',1-P.stand);
 g('legL').setAttribute('transform',`rotate(${P.legL})`);g('mug').setAttribute('opacity',P.mug?1:0);g('mug').setAttribute('transform',`translate(0 175) rotate(${-P.aL-P.rot})`);g('remote').setAttribute('opacity',P.remote?1:0);g('remote').setAttribute('transform',`translate(0 175) rotate(${180-P.aR})`);g('rbtn').setAttribute('fill',P.press?'#ffe14d':'#ff4d5e');g('legR').setAttribute('transform',`rotate(${P.legR})`);
}
