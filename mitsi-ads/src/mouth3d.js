// Animated cartoon mouth decal for the Tripo cat (parented to the head bone). Usage: const mo=makeMouth(THREE,M,head); mo.set(m)
export function makeMouth(THREE,M,head,mesh){
 // sample muzzle albedo from the base texture at a known muzzle uv
 let col='#dedbd6';
 try{const img=mesh.material.map.image;const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);
  const pts=[[0.16,0.449],[0.158,0.43],[0.15,0.44]];let r=0,g=0,b=0;for(const [u,v] of pts){const d=x.getImageData(Math.floor(u*img.width),Math.floor(v*img.height),1,1).data;r+=d[0];g+=d[1];b+=d[2]}
  col=`rgb(${r/3|0},${g/3|0},${b/3|0})`;}catch(e){}
 const cv=document.createElement('canvas');cv.width=512;cv.height=256;const cx=cv.getContext('2d');
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
 const R=0.11,H=0.072,TH=1.35;
 const geo=new THREE.CylinderGeometry(R,R,H,24,1,true,-TH/2+Math.PI/2*0,TH);
 // cylinder default: theta measured from +z? rotate so the arc faces +z (forward)
 const mat=new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:.95,metalness:0,side:THREE.FrontSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
 const mesh2=new THREE.Mesh(geo,mat);
 const grp=new THREE.Group();grp.add(mesh2);
 M.updateMatrixWorld(true);
 // world placement at bind pose: arc front at (x0, y0, zf)
 const x0=-0.0491,y0=0.6295,zf=0.2735;
 grp.position.set(x0,y0,zf-R);
 head.attach(grp); // keep world transform, follow head
 function draw(m){
  cx.clearRect(0,0,512,256);
  cx.save();cx.filter='blur(10px)';cx.fillStyle=col;cx.beginPath();cx.ellipse(256,112,226,112,0,0,Math.PI*2);cx.fill();cx.restore();
  cx.fillStyle=col;cx.beginPath();cx.ellipse(256,112,205,96,0,0,Math.PI*2);cx.fill();
  const ink='#2b2224';const L=[74,44],Rr=[438,44],C=[256,60];
  cx.lineCap='round';cx.lineJoin='round';
  cx.strokeStyle=ink;cx.lineWidth=9;cx.beginPath();cx.moveTo(256,0);cx.lineTo(256,C[1]);cx.stroke();
  if(m<.07){cx.beginPath();cx.moveTo(...L);cx.quadraticCurveTo(170,104,C[0],C[1]);cx.quadraticCurveTo(342,104,...Rr);cx.stroke();}
  else{const h=34+165*m;
   const P=new Path2D();P.moveTo(...L);P.quadraticCurveTo(170,96,C[0],C[1]);P.quadraticCurveTo(342,96,...Rr);
   P.bezierCurveTo(410,44+h*1.1,102,44+h*1.1,...L);P.closePath();cx.fillStyle='#4a171b';cx.fill(P);
   cx.save();cx.clip(P);cx.fillStyle='#e8838a';cx.beginPath();cx.ellipse(256,44+h*.95,66+36*m,16+20*m,0,0,Math.PI*2);cx.fill();cx.restore();
   cx.stroke(P);}
  tex.needsUpdate=true;
 }
 draw(0);
 return {set:draw,group:grp};
}
