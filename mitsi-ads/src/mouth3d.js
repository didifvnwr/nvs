// Animated mouth decal for the lazy smug Tripo cat (closed slight smile). makeMouth(THREE,M,head,mesh).set(m 0..1)
export function makeMouth(THREE,M,head,mesh){
 let col='#e2e0dc';
 try{const img=mesh.material.map.image;const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);
  const pts=[[0.726,0.553],[0.707,0.535]];let r=0,g=0,b=0;for(const [u,v] of pts){const d=x.getImageData(Math.floor(u*img.width),Math.floor(v*img.height),1,1).data;r+=d[0];g+=d[1];b+=d[2]}
  col=`rgb(${r/2*.9|0},${g/2*.9|0},${b/2*.9|0})`;}catch(e){}
 const cv=document.createElement('canvas');cv.width=512;cv.height=256;const cx=cv.getContext('2d');
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
 const PXW=0.000463, W=345*PXW, H=155*PXW, R=0.11, TH=W/R;
 const geo=new THREE.CylinderGeometry(R,R,H,32,1,true,-TH/2,TH);
 const mat=new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:.95,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
 const grp=new THREE.Group();grp.add(new THREE.Mesh(geo,mat));
 M.updateMatrixWorld(true);
 const x0=-0.0480,y0=0.6625,zf=0.2805;
 grp.position.set(x0,y0,zf-R);head.attach(grp);
 const ink='#262022';
 function smile(){cx.beginPath();cx.moveTo(29,92);cx.quadraticCurveTo(70,124,130,128);cx.quadraticCurveTo(205,130,256,111);cx.quadraticCurveTo(307,130,375,128);cx.quadraticCurveTo(440,124,486,92)}
 function draw(m){
  cx.clearRect(0,0,512,256);
  cx.save();cx.filter='blur(7px)';cx.fillStyle=col;cx.beginPath();cx.ellipse(256,120,222,30,0,0,Math.PI*2);cx.fill();cx.restore();
  cx.fillStyle=col;cx.beginPath();cx.ellipse(256,119,204,20,0,0,Math.PI*2);cx.fill();
  cx.save();cx.filter='blur(6px)';cx.strokeStyle='rgba(60,60,75,.35)';cx.lineWidth=14;cx.beginPath();cx.moveTo(80,130);cx.quadraticCurveTo(256,152,432,130);cx.stroke();cx.restore();
  cx.lineCap='round';cx.lineJoin='round';cx.strokeStyle=ink;cx.lineWidth=9;
  cx.beginPath();cx.moveTo(256,72);cx.lineTo(256,111);cx.stroke();
  if(m>.06){const h=10+80*m;const P=new Path2D();
   P.moveTo(165,127);P.quadraticCurveTo(215,127,256,111);P.quadraticCurveTo(297,127,347,127);
   P.bezierCurveTo(330,127+h,182,127+h,165,127);P.closePath();
   cx.fillStyle='#3f1518';cx.fill(P);cx.save();cx.clip(P);cx.fillStyle='#d9787f';cx.beginPath();cx.ellipse(256,124+h*.95,52+20*m,9+13*m,0,0,Math.PI*2);cx.fill();cx.restore();
   cx.lineWidth=6;cx.stroke(P);cx.lineWidth=9;}
  smile();cx.stroke();
  tex.needsUpdate=true;
 }
 draw(0);return {set:draw,group:grp};
}
