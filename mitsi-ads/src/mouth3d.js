// Animated mouth decal for the lazy smug Tripo cat (closed slight smile). makeMouth(THREE,M,head,mesh).set(m 0..1)
export function makeMouth(THREE,M,head,mesh){
 let col='#e2e0dc';
 try{const img=mesh.material.map.image;const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);
  const pts=[[0.941,0.569],[0.135,0.822]];let r=0,g=0,b=0;for(const [u,v] of pts){const d=x.getImageData(Math.floor(u*img.width),Math.floor(v*img.height),1,1).data;r+=d[0];g+=d[1];b+=d[2]}
  col=`rgb(${r/2*.9|0},${g/2*.9|0},${b/2*.9|0})`;}catch(e){}
 const cv=document.createElement('canvas');cv.width=512;cv.height=256;const cx=cv.getContext('2d');
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
 const PXW=0.000463, W=345*PXW, H=155*PXW, R=0.18, TH=W/R;
 const geo=new THREE.CylinderGeometry(R,R,H,32,1,true,-TH/2,TH);
 const mat=new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:.95,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
 const grp=new THREE.Group();grp.add(new THREE.Mesh(geo,mat));
 M.updateMatrixWorld(true);
 const x0=-0.0417,y0=0.6737,zf=0.2662;
 grp.position.set(x0,y0,zf-R);head.attach(grp);
 const ink='#262022';
 function smile(){cx.beginPath();cx.moveTo(66,118);cx.quadraticCurveTo(110,140,164,139);cx.quadraticCurveTo(220,136,256,113);cx.quadraticCurveTo(292,136,349,139);cx.quadraticCurveTo(410,140,456,116)}
 function draw(m){
  cx.clearRect(0,0,512,256);
  cx.save();cx.filter='blur(7px)';cx.fillStyle=col;cx.beginPath();cx.ellipse(256,130,214,30,0,0,Math.PI*2);cx.fill();cx.restore();
  cx.fillStyle=col;cx.beginPath();cx.ellipse(256,129,196,20,0,0,Math.PI*2);cx.fill();
  cx.save();cx.filter='blur(6px)';cx.strokeStyle='rgba(60,60,75,.35)';cx.lineWidth=14;cx.beginPath();cx.moveTo(90,132);cx.quadraticCurveTo(256,160,422,132);cx.stroke();cx.restore();
  cx.lineCap='round';cx.lineJoin='round';cx.strokeStyle=ink;cx.lineWidth=9;
  cx.beginPath();cx.moveTo(256,60);cx.lineTo(256,113);cx.stroke();
  if(m>.06){const h=10+80*m;const P=new Path2D();
   P.moveTo(160,132);P.quadraticCurveTo(215,130,256,113);P.quadraticCurveTo(297,130,352,132);
   P.bezierCurveTo(335,132+h,177,132+h,160,132);P.closePath();
   cx.fillStyle='#3f1518';cx.fill(P);cx.save();cx.clip(P);cx.fillStyle='#d9787f';cx.beginPath();cx.ellipse(256,128+h*.95,56+20*m,9+13*m,0,0,Math.PI*2);cx.fill();cx.restore();
   cx.lineWidth=6;cx.stroke(P);cx.lineWidth=9;}
  smile();cx.stroke();
  tex.needsUpdate=true;
 }
 draw(0);return {set:draw,group:grp};
}
