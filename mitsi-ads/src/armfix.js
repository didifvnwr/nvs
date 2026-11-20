// Visual separation of arms from the body: darker arm tint (by skin weights) + thin toon outline (inverted hull).
export function armFix(THREE,mesh,opts={}){
 const g=mesh.geometry,sk=mesh.skeleton;const n=g.attributes.position.count;
 const armIdx=new Set();sk.bones.forEach((b,i)=>{if(/(LeftArm|RightArm|ForeArm|Hand)/.test(b.name))armIdx.add(i)});
 const si=g.attributes.skinIndex,sw=g.attributes.skinWeight;const col=new Float32Array(n*3);
 const dark=opts.dark||[0.66,0.71,0.82];
 for(let v=0;v<n;v++){let w=0;for(let k=0;k<4;k++){if(armIdx.has(si.getComponent(v,k)))w+=sw.getComponent(v,k)}w=Math.min(1,Math.max(0,(w-.25)/.35));
  col[v*3]=1+(dark[0]-1)*w;col[v*3+1]=1+(dark[1]-1)*w;col[v*3+2]=1+(dark[2]-1)*w}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));mesh.material.vertexColors=true;mesh.material.needsUpdate=true;
 const th=opts.thickness||0.0035;
 const om=new THREE.MeshBasicMaterial({color:opts.outline||0x27303f,side:THREE.BackSide});
 om.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <skinning_vertex>','#include <skinning_vertex>\n transformed += normalize(objectNormal)*'+th.toFixed(5)+';')};
 const o=new THREE.SkinnedMesh(g,om);o.bind(sk,mesh.bindMatrix);o.frustumCulled=false;mesh.parent.add(o);
 return o;
}
