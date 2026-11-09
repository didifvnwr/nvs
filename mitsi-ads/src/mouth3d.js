// Animated mouth decal for the apathetic Tripo cat (closed flat mouth). makeMouth(THREE,M,head,mesh).set(m 0..1)
export function makeMouth(THREE,M,head,mesh){
 let col='#e2e0dc';
 try{const img=mesh.material.map.image;const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);
  const pts=[[0.782,0.815],[0.788,0.836],[0.775,0.82]];let r=0,g=0,b=0;for(const [u,v] of pts){const d=x.getImageData(Math.floor(u*img.width),Math.floor(v*img.height),1,1).data;r+=d[0];g+=d[1];b+=d[2]}
  col=`rgb(${r/3|0},${g/3|0},${b/3|0})`;}catch(e){}
 const cv=document.createElement('canvas');cv.width=512;cv.height=256;const cx=cv.getContext('2d');
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
 const PXW=0.000463, W=345*PXW, H=155*PXW, R=0.2, TH=W/R;
 const geo=new THREE.CylinderGeometry(R,R,H,32,1,true,-TH/2,TH);
 const mat=new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:.95,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
 const grp=new THREE.Group();grp.add(new THREE.Mesh(geo,mat));
 M.updateMatrixWorld(true);
 // screen (800px close-up, centre 400,400 = world y .6327) -> canvas centre at screen y 329.5
 const x0=-0.0307,y0=0.6327+(400-329.5)*PXW+20*PXW*155/256*1.0,zf=0.3285;
 grp.position.set(x0,y0,zf-R);head.attach(grp);
 const ink='#262022';
 function line(){cx.beginPath();cx.moveTo(11,134);cx.quadraticCurveTo(70,150,107,145);cx.quadraticCurveTo(190,138,256,116);cx.quadraticCurveTo(322,140,375,150);cx.quadraticCurveTo(440,156,501,153)}
 function draw(m){
  cx.clearRect(0,0,512,256);
  cx.save();cx.filter='blur(9px)';cx.fillStyle=col;cx.beginPath();cx.ellipse(256,152,214,84,0,0,Math.PI*2);cx.fill();cx.restore();
  cx.fillStyle=col;cx.beginPath();cx.ellipse(256,152,196,70,0,0,Math.PI*2);cx.fill();
  cx.lineCap='round';cx.lineJoin='round';cx.strokeStyle=ink;cx.lineWidth=10;
  cx.beginPath();cx.moveTo(256,40);cx.lineTo(256,116);cx.stroke();
  if(m>.06){const h=12+92*m;const P=new Path2D();
   P.moveTo(150,132);P.quadraticCurveTo(205,128,256,116);P.quadraticCurveTo(307,128,362,138);
   P.bezierCurveTo(345,138+h,175,132+h,150,132);P.closePath();
   cx.fillStyle='#3f1518';cx.fill(P);cx.save();cx.clip(P);cx.fillStyle='#d9787f';cx.beginPath();cx.ellipse(256,132+h*.95,58+20*m,10+14*m,0,0,Math.PI*2);cx.fill();cx.restore();
   cx.lineWidth=6;cx.stroke(P);cx.lineWidth=8;}
  line();cx.stroke();
  tex.needsUpdate=true;
 }
 draw(0);return {set:draw,group:grp};
}
