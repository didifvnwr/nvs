// Open-mouth decal for the A-pose Tripo cats (Mitsi + ginger). Closed = painted smile shows through; open = dark mouth drawn over it.
// makeMouth2(THREE,head,o).set(m 0..1)   o={y0,zf,W,R,patch,ink,tongue}
export function makeMouth2(THREE,head,o){
 const cv=document.createElement('canvas');cv.width=512;cv.height=256;const cx=cv.getContext('2d');
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
 const W=o.W,H=W/2,R=o.R||0.1,TH=W/R;
 const geo=new THREE.CylinderGeometry(R,R,H,32,1,true,-TH/2,TH);
 const mat=new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:.95,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
 const grp=new THREE.Group();const me=new THREE.Mesh(geo,mat);grp.add(me);
 grp.position.set(o.x0||0,o.y0-H*0.117,o.zf-R);head.attach(grp); // canvas row 98 = mouth line at y0
 let last=-1;
 function draw(m){m=Math.round(m*20)/20;if(m===last)return;last=m;cx.clearRect(0,0,512,256);
  if(m>.06){const h=14+120*m,w=70+60*m;const P=new Path2D();
   P.moveTo(256-w,98);P.quadraticCurveTo(256,88,256+w,98);P.bezierCurveTo(256+w*.9,98+h,256-w*.9,98+h,256-w,98);P.closePath();
   cx.save();cx.filter='blur(5px)';cx.fillStyle=o.patch;cx.beginPath();cx.ellipse(256,104+h*.4,w+26,h*.55+18,0,0,Math.PI*2);cx.fill();cx.restore();
   cx.fillStyle='#3a1216';cx.fill(P);cx.save();cx.clip(P);cx.fillStyle=o.tongue||'#e07b86';cx.beginPath();cx.ellipse(256,98+h*.92,w*.62,10+h*.22,0,0,Math.PI*2);cx.fill();cx.restore();
   cx.lineJoin='round';cx.strokeStyle=o.ink;cx.lineWidth=7;cx.stroke(P);}
  tex.needsUpdate=true}
 draw(0);return {set:draw,group:grp};
}
