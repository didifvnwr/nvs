import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { makeMouth2 } from './mouth3d2.js';

const qs = new URLSearchParams(location.search);
const W = +qs.get('w') || 1080, H = +qs.get('h') || 1920;
const VERT = H > W;
const FPS = 30;
const D2 = await (await fetch('data2.json')).json();
const END = D2.end;
const DATA = D2.segs;
for (const f of ['400 40px Heebo', '700 40px Heebo', '900 40px Heebo', '900 40px HeeboL']) await document.fonts.load(f, 'אבג abc');

// ---------- renderer ----------
const glCanvas = document.createElement('canvas');
glCanvas.width = W; glCanvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const out = document.createElement('canvas');
out.width = W; out.height = H;
document.body.appendChild(out);
const ctx = out.getContext('2d');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#2a2f2c');
scene.fog = new THREE.Fog('#2a2f2c', 14, 26);
const camera = new THREE.PerspectiveCamera(VERT ? 58 : 36, W / H, 0.1, 60);

// ---------- helpers ----------
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.75, metalness: o.m ?? 0, ...o.x });
function mesh(geo, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#fff6e0', '#3b3326', 0.9); scene.add(hemi);
const key = new THREE.DirectionalLight('#fff3d6', 1.6);
key.position.set(2.5, 9, 5); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 25 });
key.shadow.bias = -0.0008; key.shadow.normalBias = 0.02;
scene.add(key);
const fill = new THREE.PointLight('#d9f0ff', 6, 14, 1.6); fill.position.set(0, 4.2, 0); scene.add(fill);
const spot = new THREE.SpotLight('#ffe7a8', 0, 14, 0.42, 0.5, 1.2); // used for Mitsi's moment
spot.position.set(0, 6, 1); scene.add(spot); scene.add(spot.target);

// ---------- room ----------
const floorTex = canvasTex(512, 512, (g, w) => {
  const n = 8, s = w / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? '#c9c2ad' : '#b4ab93'; g.fillRect(i * s, j * s, s, s); }
});
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(5, 5);
const floor = mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.6 }));
floor.rotation.x = -Math.PI / 2; scene.add(floor);

const wallMat = M('#e8dcc0'), lowWall = M('#5f8f86');
function wall(x, z, ry, w) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  mesh(new THREE.BoxGeometry(w, 2.2, 0.1), lowWall, 0, 1.1, 0, g);
  mesh(new THREE.BoxGeometry(w, 3.6, 0.1), wallMat, 0, 4.0, 0, g);
  mesh(new THREE.BoxGeometry(w, 0.08, 0.16), M('#3f6b63'), 0, 2.2, 0.03, g);
  scene.add(g); return g;
}
wall(0, -6, 0, 20); wall(-7.5, 0, Math.PI / 2, 16); wall(7.5, 0, -Math.PI / 2, 16); wall(0, 9, Math.PI, 20);

// whiteboard
const wbTex = canvasTex(1400, 800, (g, w, h) => {
  g.fillStyle = '#fbfbf7'; g.fillRect(0, 0, w, h);
  g.direction = 'rtl'; g.textAlign = 'center';
  g.fillStyle = '#1d4fa3'; g.font = '900 150px Heebo'; g.fillText('קבוצת תמיכה', w / 2, 200);
  g.fillStyle = '#c0392b'; g.font = '700 82px Heebo'; g.fillText('״ממתינים על הקו״', w / 2, 330);
  g.fillStyle = '#333'; g.font = '400 60px Heebo';
  g.fillText('מפגש מס׳ 47 · נא לא לשים על ״המתנה״', w / 2, 450);
  g.textAlign = 'right'; g.font = '700 54px Heebo'; g.fillStyle = '#2b7a3d';
  g.fillText('ימים על הקו השבוע:', w - 80, 600);
  g.strokeStyle = '#2b7a3d'; g.lineWidth = 9;
  for (let k = 0; k < 3; k++) { const x0 = 120 + k * 200; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x0 + i * 30, 560); g.lineTo(x0 + i * 30, 660); g.stroke(); } g.beginPath(); g.moveTo(x0 - 15, 650); g.lineTo(x0 + 110, 570); g.stroke(); }
  g.strokeStyle = '#999'; g.lineWidth = 14; g.strokeRect(0, 0, w, h);
});
const wb = mesh(new THREE.BoxGeometry(4.2, 2.4, 0.06), [M('#bbb'), M('#bbb'), M('#bbb'), M('#bbb'), new THREE.MeshStandardMaterial({ map: wbTex, roughness: 0.4 }), M('#bbb')], 0, 3.15, -5.9);
scene.add(wb);

// wall clock (hands spin during IVR)
const clock = new THREE.Group(); clock.position.set(-3.6, 3.7, -5.9); scene.add(clock);
mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 40), M('#fafafa'), 0, 0, 0.03, clock).rotation.x = Math.PI / 2;
mesh(new THREE.TorusGeometry(0.42, 0.04, 8, 40), M('#222'), 0, 0, 0.06, clock);
const hourH = new THREE.Group(), minH = new THREE.Group(); clock.add(hourH, minH); hourH.position.z = minH.position.z = 0.08;
mesh(new THREE.BoxGeometry(0.04, 0.22, 0.02), M('#111'), 0, 0.1, 0, hourH);
mesh(new THREE.BoxGeometry(0.03, 0.34, 0.02), M('#111'), 0, 0.16, 0, minH);

// poster
const posterTex = canvasTex(600, 800, (g, w, h) => {
  g.fillStyle = '#ffd34d'; g.fillRect(0, 0, w, h);
  g.direction = 'rtl'; g.textAlign = 'center'; g.fillStyle = '#222';
  g.font = '900 96px Heebo'; g.fillText('אתם', w / 2, 200); g.fillText('לא לבד', w / 2, 320); g.fillText('על הקו', w / 2, 440);
  g.font = '700 50px Heebo'; g.fillText('(כנראה שכן)', w / 2, 600);
});
const poster = mesh(new THREE.PlaneGeometry(1.2, 1.6), new THREE.MeshStandardMaterial({ map: posterTex }), 3.6, 3.3, -5.94); scene.add(poster);

// refreshment table
const table = new THREE.Group(); table.position.set(5.2, 0, -3.6); table.rotation.y = -0.5; scene.add(table);
mesh(new THREE.BoxGeometry(2.2, 0.08, 0.9), M('#8a6a45'), 0, 0.9, 0, table);
for (const [x, z] of [[-1, -0.38], [1, -0.38], [-1, 0.38], [1, 0.38]]) mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9), M('#555'), x, 0.45, z, table);
mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.6, 20), M('#c9ccd1', { m: 0.7, r: 0.3 }), -0.5, 1.24, 0, table);
mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 24), M('#fff'), 0.4, 0.96, 0.05, table);
for (let i = 0; i < 6; i++) mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 12), M('#c58b45'), 0.4 + Math.cos(i) * 0.16, 0.99, 0.05 + Math.sin(i) * 0.16, table);
for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.13, 12), M('#f4f4f4'), 0.9, 1.0, -0.3 + i * 0.15, table);

// plant
const plant = new THREE.Group(); plant.position.set(-5.6, 0, -4.6); scene.add(plant);
mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.6, 16), M('#b5553c'), 0, 0.3, 0, plant);
for (let i = 0; i < 7; i++) { const l = mesh(new THREE.SphereGeometry(0.35, 10, 8), M(i % 2 ? '#4f8a3c' : '#3f7431'), Math.sin(i * 2) * 0.25, 0.9 + i * 0.12, Math.cos(i * 2) * 0.25, plant); l.scale.set(0.6, 1.2, 0.6); }

// ceiling fluorescent lamps (visual only)
for (const x of [-2.5, 2.5]) { const l = mesh(new THREE.BoxGeometry(2.4, 0.08, 0.35), new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#f4fff6', emissiveIntensity: 1.2 }), x, 5.6, -1); l.castShadow = false; scene.add(l); }

// rug
const rug = mesh(new THREE.CircleGeometry(3.0, 48), M('#7a3b4e', { r: 0.95 }), 0, 0.012, -0.4); rug.rotation.x = -Math.PI / 2; scene.add(rug);

// ---------- chairs + seats ----------
const R = 3.2;
const SEAT_ORDER = { itai: -2.6, tomer: -1.7, danit: -0.85, mitsi: 0, tamar: 1.0, homeless: 2.0 };
const seats = {};
for (const [name, k] of Object.entries(SEAT_ORDER)) {
  const a = Math.PI + k * 0.74;
  const p = v3(R * Math.sin(a), 0, R * Math.cos(a) - 0.4);
  seats[name] = { a, p, ry: Math.atan2(-p.x, -(p.z + 0.4)) };
  if (name === 'mitsi') continue;
  const ch = new THREE.Group(); ch.position.copy(p); ch.rotation.y = seats[name].ry; scene.add(ch);
  const cm = M(['#e07a2e', '#2f6fb3', '#d8b62a'][Math.abs(k) % 3], { r: 0.45 });
  mesh(new THREE.BoxGeometry(0.62, 0.06, 0.58), cm, 0, 0.5, 0, ch);
  mesh(new THREE.BoxGeometry(0.62, 0.62, 0.06), cm, 0, 0.84, -0.3, ch).rotation.x = -0.1;
  for (const [x, z] of [[-0.27, -0.25], [0.27, -0.25], [-0.27, 0.25], [0.27, 0.25]]) mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.5), M('#777', { m: 0.6, r: 0.3 }), x, 0.25, z, ch);
}

// ---------- characters ----------
const chars = {};
function eyes(head, y, z, r, sep, iris = '#111') {
  const res = [];
  for (const s of [-1, 1]) {
    const e = mesh(new THREE.SphereGeometry(r, 16, 12), M('#fff', { r: 0.3 }), s * sep, y, z, head);
    const p = mesh(new THREE.SphereGeometry(r * 0.55, 12, 10), M(iris, { r: 0.2 }), 0, 0, r * 0.62, e);
    const lid = mesh(new THREE.SphereGeometry(r * 1.08, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(head.userData.skin), 0, 0, 0, e);
    lid.rotation.x = -1.6; // open
    res.push({ e, p, lid });
  }
  return res;
}
function human(name, o) {
  const g = new THREE.Group(); const seat = seats[name];
  g.position.copy(seat.p); g.rotation.y = seat.ry; scene.add(g);
  const body = new THREE.Group(); g.add(body);
  const shirt = M(o.shirt), pants = M(o.pants || '#3a3f4a'), skin = M(o.skin);
  for (const s of [-1, 1]) {
    mesh(new THREE.CapsuleGeometry(0.1, 0.38, 4, 10), pants, s * 0.13, 0.6, 0.18, body).rotation.x = Math.PI / 2;
    mesh(new THREE.CapsuleGeometry(0.09, 0.36, 4, 10), pants, s * 0.13, 0.3, 0.42, body);
    mesh(new THREE.BoxGeometry(0.15, 0.08, 0.26), M(o.shoes || '#222'), s * 0.13, 0.05, 0.48, body);
  }
  const torso = mesh(new THREE.CapsuleGeometry(0.27, 0.42, 6, 16), shirt, 0, 1.0, -0.02, body); torso.scale.set(1, 1, 0.75);
  const arms = [];
  for (const s of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(s * 0.33, 1.22, 0); body.add(arm);
    mesh(new THREE.CapsuleGeometry(0.075, 0.38, 4, 10), shirt, 0, -0.22, 0.05, arm);
    mesh(new THREE.SphereGeometry(0.075, 10, 8), skin, 0, -0.45, 0.12, arm);
    arm.rotation.x = -0.55; arm.rotation.z = s * 0.12; arms.push(arm);
  }
  const neck = new THREE.Group(); neck.position.set(0, 1.36, 0); body.add(neck);
  const head = new THREE.Group(); head.position.set(0, 0.2, 0); neck.add(head); head.userData.skin = o.skin;
  const skull = mesh(new THREE.SphereGeometry(0.25, 28, 22), skin, 0, 0, 0, head); skull.scale.set(0.95, 1.05, 0.95);
  mesh(new THREE.SphereGeometry(0.05, 10, 8), skin, 0, -0.01, 0.24, head); // nose
  for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.055, 10, 8), skin, s * 0.24, 0, 0, head);
  const ey = eyes(head, 0.06, 0.2, 0.052, 0.09);
  for (const s of [-1, 1]) { const b = mesh(new THREE.BoxGeometry(0.1, 0.022, 0.02), M(o.hair || '#222'), s * 0.09, 0.15, 0.225, head); b.rotation.z = s * -0.12; ey.push({ brow: b, s }); }
  const mouth = mesh(new THREE.SphereGeometry(0.06, 16, 10), M('#5a1f1f'), 0, -0.11, 0.215, head); mouth.scale.set(1, 0.15, 0.4);
  if (o.hairStyle !== 'beanie') {
    const cap = mesh(new THREE.SphereGeometry(0.265, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), M(o.hair), 0, 0.02, -0.02, head);
    cap.rotation.x = -0.35;
    if (o.hairStyle === 'long') { const lh = mesh(new THREE.CapsuleGeometry(0.22, 0.32, 4, 12), M(o.hair), 0, -0.18, -0.12, head); lh.scale.set(1.15, 1, 0.6); }
    if (o.hairStyle === 'bun') mesh(new THREE.SphereGeometry(0.11, 12, 10), M(o.hair), 0, 0.22, -0.15, head);
  } else {
    mesh(new THREE.SphereGeometry(0.27, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), M('#7a2b2b'), 0, 0.04, 0, head);
    mesh(new THREE.TorusGeometry(0.255, 0.04, 8, 30), M('#5e1f1f'), 0, 0.06, 0, head).rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.07, 10, 8), M('#e0c9a0'), 0, 0.31, 0, head);
  }
  if (o.beard) { const bd = mesh(new THREE.SphereGeometry(0.2, 18, 12), M(o.beard), 0, -0.12, 0.1, head); bd.scale.set(1.05, 0.85, 0.75); mouth.position.z = 0.27; mouth.position.y = -0.09; }
  if (o.glasses) for (const s of [-1, 1]) mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 20), M('#222'), s * 0.09, 0.06, 0.255, head);
  if (o.clipboard) { const cb = mesh(new THREE.BoxGeometry(0.3, 0.4, 0.02), M('#a0743f'), 0, 0.72, 0.38, body); cb.rotation.x = -1.1; mesh(new THREE.PlaneGeometry(0.25, 0.32), M('#fff'), 0, 0, 0.012, cb); }
  if (o.patch) mesh(new THREE.BoxGeometry(0.12, 0.12, 0.02), M('#8c7b4c'), 0.12, 0.95, 0.2, body);
  chars[name] = { g, body, neck, head, mouth, eyes: ey, arms, kind: 'human', baseY: 0 };
}
function cat(name, o) {
  const g = new THREE.Group(); const seat = seats[name];
  g.position.copy(seat.p); g.rotation.y = seat.ry; scene.add(g);
  const body = new THREE.Group(); g.add(body);
  const fur = M(o.fur), light = M(o.light || '#fff4e6');
  const torso = mesh(new THREE.SphereGeometry(0.34, 24, 18), fur, 0, 0.86, 0, body); torso.scale.set(0.95, 1.15, 0.85);
  mesh(new THREE.SphereGeometry(0.22, 18, 12), light, 0, 0.84, 0.15, body).scale.set(0.8, 1.1, 0.6);
  for (const s of [-1, 1]) { mesh(new THREE.SphereGeometry(0.11, 12, 10), fur, s * 0.15, 0.58, 0.28, body).scale.set(0.9, 0.7, 1.4); }
  const arms = [];
  for (const s of [-1, 1]) { const arm = new THREE.Group(); arm.position.set(s * 0.22, 1.0, 0.1); body.add(arm); mesh(new THREE.CapsuleGeometry(0.065, 0.24, 4, 8), fur, 0, -0.16, 0.06, arm); mesh(new THREE.SphereGeometry(0.075, 10, 8), light, 0, -0.32, 0.1, arm); arm.rotation.x = -0.4; arms.push(arm); }
  // tail
  const tailCurve = new THREE.CatmullRomCurve3([v3(0, 0.6, -0.25), v3(0.25, 0.55, -0.45), v3(0.45, 0.8, -0.4), v3(0.42, 1.15, -0.3)]);
  const tail = mesh(new THREE.TubeGeometry(tailCurve, 20, 0.055, 8), fur, 0, 0, 0, body);
  const neck = new THREE.Group(); neck.position.set(0, 1.2, 0.02); body.add(neck);
  const head = new THREE.Group(); head.position.set(0, 0.2, 0); neck.add(head); head.userData.skin = o.fur;
  const skull = mesh(new THREE.SphereGeometry(0.29, 28, 22), fur, 0, 0, 0, head); skull.scale.set(1.1, 0.95, 0.95);
  for (const s of [-1, 1]) {
    const ear = mesh(new THREE.ConeGeometry(0.11, 0.2, 4), fur, s * 0.17, 0.27, -0.02, head); ear.rotation.z = s * -0.35;
    const inner = mesh(new THREE.ConeGeometry(0.06, 0.12, 4), M('#f2a6b4'), 0, -0.02, 0.035, ear);
  }
  const muzzle = mesh(new THREE.SphereGeometry(0.12, 16, 12), light, 0, -0.08, 0.22, head); muzzle.scale.set(1.3, 0.8, 0.8);
  mesh(new THREE.SphereGeometry(0.035, 10, 8), M('#e5738a'), 0, -0.02, 0.32, head).scale.set(1.3, 0.8, 0.8);
  const ey = eyes(head, 0.06, 0.22, 0.07, 0.11, o.iris);
  for (const s of [-1, 1]) for (const k of [-1, 1]) { const w = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.32), M('#eee'), s * 0.2, -0.07 + k * 0.025, 0.27, head); w.rotation.z = Math.PI / 2 + s * k * 0.12; w.castShadow = false; }
  const mouth = mesh(new THREE.SphereGeometry(0.045, 14, 10), M('#5a1f1f'), 0, -0.14, 0.29, head); mouth.scale.set(1, 0.15, 0.4);
  if (o.bow) { for (const s of [-1, 1]) mesh(new THREE.ConeGeometry(0.06, 0.12, 8), M('#ff4f8b'), s * 0.07 + 0.17, 0.2, 0.12, head).rotation.z = s * Math.PI / 2; mesh(new THREE.SphereGeometry(0.035, 8, 6), M('#ff4f8b'), 0.17, 0.2, 0.12, head); }
  if (o.headset) {
    const band = mesh(new THREE.TorusGeometry(0.3, 0.025, 8, 30, Math.PI), M('#1c2a3a'), 0, 0.02, 0, head);
    for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), M('#18a0d8'), s * 0.31, 0.0, 0, head).rotation.z = Math.PI / 2;
    const boom = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3), M('#1c2a3a'), -0.27, -0.12, 0.13, head); boom.rotation.x = 1.2; boom.rotation.z = 0.5;
    mesh(new THREE.SphereGeometry(0.03, 8, 6), M('#18a0d8'), -0.16, -0.17, 0.27, head);
  }
  chars[name] = { g, body, neck, head, mouth, eyes: ey, arms, tail, kind: 'cat', baseY: 0 };
}
human('danit', { shirt: '#c2557a', skin: '#e9b98f', hair: '#3a2416', hairStyle: 'bun', glasses: true, clipboard: true, pants: '#2c2c3a' });
human('tomer', { shirt: '#4d7fbf', skin: '#d9a77c', hair: '#1b1b1b', pants: '#4a4036' });
human('itai', { shirt: '#3f9e6a', skin: '#efc39b', hair: '#6b4423', pants: '#30343c' });
human('tamar', { shirt: '#e6a33c', skin: '#c99068', hair: '#2a1a12', hairStyle: 'long', pants: '#3d2e4f' });
human('homeless', { shirt: '#6e5b3e', skin: '#d6a07a', hairStyle: 'beanie', beard: '#7b6a58', pants: '#4d4a40', shoes: '#5a3d22', patch: true });
// ---------- "מִיצִי": the studio cat (rigged GLB, Omer's voice) ----------
const MITSI_H = 1.3;
const MI = await (async () => {
  const g = await new GLTFLoader().loadAsync('cat-m2.glb'); const Mo = g.scene;
  const root = new THREE.Group(); const inner = new THREE.Group(); root.add(inner); inner.add(Mo); scene.add(root);
  const bb = new THREE.Box3().setFromObject(Mo); const fy = -bb.min.y; Mo.position.y = fy;
  const mix = new THREE.AnimationMixer(Mo); const A = {};
  g.animations.forEach(c => { const k = c.name.replace(/\.\d+$/, ''); const a = mix.clipAction(c); a.play(); a.setEffectiveWeight(0); A[k] = { a, d: c.duration }; });
  let head, hips, lh, rh; Mo.traverse(o => { if (o.isBone && /Head$/.test(o.name)) head = o; if (o.isBone && /Hips$/.test(o.name)) hips = o; if (o.isBone && /LeftHand$/.test(o.name)) lh = o; if (o.isBone && /RightHand$/.test(o.name)) rh = o; if (o.isMesh) { o.frustumCulled = false; o.castShadow = true; } });
  A.idle.a.setEffectiveWeight(1); A.idle.a.time = 0; mix.update(0); Mo.updateMatrixWorld(true);
  const MO = makeMouth2(THREE, head, { y0: .669, zf: .266, W: .15, R: .1, patch: '#aab2c4', ink: '#2a2328' });
  const hr = new THREE.Vector3(); hips.getWorldPosition(hr);
  for (const k in A) A[k].a.setEffectiveWeight(0); A.sit_idle.a.setEffectiveWeight(1); A.sit_idle.a.time = .5; mix.update(0); Mo.updateMatrixWorld(true);
  const hs = new THREE.Vector3(); hips.getWorldPosition(hs);
  const ph = new THREE.Group(); ph.add(new THREE.Mesh(new THREE.BoxGeometry(.055, .1, .012), new THREE.MeshStandardMaterial({ color: 0x22232b, roughness: .4 })));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(.045, .085), new THREE.MeshBasicMaterial({ color: 0x5fd3ff })); scr.position.z = .0065; ph.add(scr); scene.add(ph); ph.visible = false;
  const k = MITSI_H / 0.978; root.scale.setScalar(k);
  return { Mo, root, inner, mix, A, head, hips, lh, rh, MO, ph, fy, k, rest: { x: hr.x, z: hr.z }, seat: hs.y, mPrev: 0 };
})();
{ // shallow chair at Mitsi's own sitting height
  const s = seats.mitsi; const st = MI.seat * MI.k - .06 * MI.k; const g = new THREE.Group(); g.position.copy(s.p); g.rotation.y = s.ry; scene.add(g);
  const cm = M('#e07a2e', { r: 0.45 }); const dz = -.09 * MI.k, sw = .46 * MI.k, sd = .32 * MI.k;
  mesh(new THREE.BoxGeometry(sw, .05, sd), cm, 0, st - .025, dz, g); mesh(new THREE.BoxGeometry(sw, .45 * MI.k, .05), cm, 0, st + .24 * MI.k, dz - sd / 2, g).rotation.x = -.08;
  for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mesh(new THREE.CylinderGeometry(.02, .02, st - .05), M('#777', { m: 0.6, r: 0.3 }), lx * sw * .42, (st - .05) / 2, dz + lz * sd * .4, g);
}
const NAMES = Object.keys(chars);

// ---------- timeline helpers ----------
const segAt = (t, who) => DATA.find(s => s.who === who && t >= s.start && t < s.start + s.dur);
const ampOf = s => (t) => { if (!s) return 0; const i = Math.floor((t - s.start) * FPS); return s.env[clamp(i, 0, s.env.length - 1)] || 0; };
const chorusTargets = ['tomer', 'itai', 'tamar', 'homeless', 'mitsi'];
const chorusSegs = DATA.filter(s => s.who === 'chorus');
const T = Object.fromEntries(DATA.map(s => [s.file, s]));
const MITSI_UP = T['n_m1'].start - 1.6;
const DIAL = T['dial'].start, IVR = T['n_i1'].start, PITCH = T['n_m2'].start;
const HUG = chorusSegs[4].start, PIZZA = HUG, SIT = 1e9;
const ENDCARD = D2.endcard;

function speakerAt(t) {
  for (const s of DATA) if (t >= s.start - 0.15 && t < s.start + s.dur + 0.5) {
    if (s.who === 'chorus') return chorusTargets[chorusSegs.indexOf(s)];
    if (['ivr', 'dial'].includes(s.who)) return 'mitsi';
    return s.who;
  }
  return t > PITCH ? 'mitsi' : 'danit';
}
function headWorld(name) { const c = name === 'mitsi' ? MI : chars[name]; c.head.updateWorldMatrix(true, false); return new THREE.Vector3().setFromMatrixPosition(c.head.matrixWorld); }

// ---------- animate characters ----------
function animate(t) {
  const spk = speakerAt(t);
  const ivrK = ease((t - IVR) / 0.8) * (1 - ease((t - PITCH + 0.3) / 0.6));
  const hug = ease((t - HUG + 0.1) / 0.6);
  const chorusSeg = chorusSegs.find(s => t >= s.start && t < s.start + s.dur);
  for (const name of NAMES) {
    const c = chars[name], seed = name.length * 1.7;
    let amp = ampOf(segAt(t, name))(t);
    const inChorus = chorusSeg && (chorusTargets[chorusSegs.indexOf(chorusSeg)] !== name || chorusSeg === chorusSegs[4]) && name !== 'mitsi';
    if (inChorus) amp = Math.max(amp, ampOf(chorusSeg)(t) * 0.8);
    c.mouth.scale.y = 0.15 + amp * 1.25; c.mouth.scale.x = 1 + amp * 0.15;
    // breathing
    c.body.scale.y = 1 + Math.sin(t * 1.6 + seed) * 0.012;
    // Mitsi stands on the chair
    let lift = 0;
    if (name === 'mitsi') {
      const up = ease((t - MITSI_UP) / 0.35) - ease((t - (SIT + 1.3)) / 0.4);
      lift = up * 0.5 + Math.max(0, Math.sin(clamp((t - MITSI_UP) / 0.35, 0, 1) * Math.PI)) * 0.25;
    }
    // hug: lean toward circle centre
    const hugLean = name === 'mitsi' ? 0 : hug * 0.18;
    c.g.position.y = lift;
    c.body.rotation.x = hugLean + (amp > 0.05 ? Math.sin(t * 7 + seed) * 0.02 : 0) + ivrK * 0.12;
    // head look-at speaker
    let yaw = 0, pitch = 0;
    if (spk && spk !== name) {
      const hw = headWorld(spk), me = headWorld(name);
      const d = hw.sub(me); const local = Math.atan2(d.x, d.z) - c.g.rotation.y;
      yaw = clamp(Math.atan2(Math.sin(local), Math.cos(local)), -1.0, 1.0);
      pitch = clamp(-Math.atan2(d.y, Math.hypot(d.x, d.z)), -0.3, 0.3);
    }
    if (spk === name) yaw = Math.sin(t * 0.9 + seed) * 0.15;
    c.neck.rotation.y = lerp(c.neck.rotation.y || 0, yaw, 1);
    let nod = amp * 0.12 * Math.sin(t * 9 + seed) + pitch;
    if (inChorus) nod += Math.sin((t - chorusSeg.start) * 6) * 0.08 + 0.05;
    nod += ivrK * 0.55; // droop during the IVR
    if (name === 'ginger' && (segAt(t, 'ginger') && t < PIZZA)) nod += 0.25; // sad
    c.head.rotation.x = nod;
    c.head.rotation.z = Math.sin(t * 0.7 + seed) * 0.04 + 0;
    // eyes: blink + sad lids
    const blink = ((t * 0.31 + seed * 0.13) % 1) < 0.035 ? 1 : 0;
    const sad = ivrK > 0.3 || (name === 'homeless' && segAt(t, 'homeless')) || (name === 'tomer' && segAt(t, 'tomer'));
    for (const e of c.eyes) {
      if (e.lid) e.lid.rotation.x = blink ? 1.35 : sad ? 0.45 : name === 'mitsi' && t >= SIT && t < SIT + 3 ? 0.65 : -1.65;
      if (e.p) e.p.position.x = Math.sin(yaw) * -0.006;
      if (e.brow) e.brow.rotation.z = e.s * (sad ? 0.3 : -0.12);
    }
    // arms: gesture when speaking
    c.arms.forEach((a, i) => { a.rotation.x = -0.55 - (amp > 0.1 ? 0.35 + Math.sin(t * 5 + i * 2 + seed) * 0.25 : 0) * (i ? 1 : 0.6) - hug * 0.8; a.rotation.z = (i ? 1 : -1) * (0.12 + hug * 0.5); });
    if (name === 'mitsi' && t > PITCH && t < PIZZA) c.arms.forEach((a, i) => { a.rotation.x = -1.2 - Math.sin(t * 4 + i) * 0.5; a.rotation.z = (i ? 1 : -1) * 0.5; });
    if (name === 'ginger' && t > PIZZA - 0.2 && t < SIT) c.arms[1].rotation.x = -2.6; // raises paw
    if (c.tail) c.tail.rotation.y = Math.sin(t * 2 + seed) * 0.25;
  }
  // clock spins during IVR, otherwise slow
  const spin = t < IVR ? t * 0.02 : t < PITCH ? 0.02 * IVR + (t - IVR) * 6 : 0.02 * IVR + (PITCH - IVR) * 6 + (t - PITCH) * 0.02;
  minH.rotation.z = -spin * 12; hourH.rotation.z = -spin;
  // lighting moods
  const dim = Math.max(ease((t - DIAL + 0.2) / 0.5) * (1 - ease((t - PITCH + 0.2) / 0.5)), 0);
  const flicker = (t > IVR && t < PITCH) ? (Math.sin(t * 37) > 0.93 ? 0.4 : 1) : 1;
  hemi.intensity = (0.9 - dim * 0.55) * flicker; key.intensity = (1.6 - dim * 1.0) * flicker; fill.intensity = 6 - dim * 4;
  const sp = ease((t - MITSI_UP) / 0.4) * (1 - ease((t - DIAL) / 0.3)) + ease((t - PITCH + 0.2) / 0.4) * (1 - ease((t - PIZZA) / 0.4));
  spot.intensity = sp * 60; spot.target.position.copy(seats.mitsi.p).add(v3(0, 1, 0));
}

// ---------- Mitsi animation (studio clips) ----------
function poseMitsi(t) {
  const s = seats.mitsi; let base = 'sit_idle', bt = (t * .7) % MI.A.sit_idle.d, hold = false, fwd = 0;
  if (t >= MITSI_UP && t < MITSI_UP + 1.5) { base = 'sit_to_stand'; bt = t - MITSI_UP; hold = true; fwd = ease((t - MITSI_UP) / 1.5); }
  else if (t >= MITSI_UP + 1.5) { base = 'idle_calm'; bt = t; fwd = 1; }
  const segs = [], G = [];
  if (base === 'idle_calm') {
    segs.push(['phone_talk_standing', DIAL - .2, IVR + T['n_i1'].dur + .2], ['talk_02', PITCH + 3.0, PITCH + T['n_m2'].dur]);
    G.push(['point_forward', T['n_m1'].start - .1], ['present_both_hands', PITCH], ['count_fingers', PITCH + 4.9], ['fist_pump', PITCH + T['n_m2'].dur - 1.3], ['heart_pose', HUG + .1]);
  }
  const list = []; let gw = 0;
  for (const g of G) { const [k, st] = g; const x = MI.A[k]; if (!x) continue; const d = x.d, q = t - st; if (q < 0 || q > d) continue; const w = Math.min(ease(q / .4), ease((d - q) / .4)); if (w <= 0) continue; list.push([k, w, q]); gw = Math.max(gw, w); }
  let segw = 0; for (const [k, a, e] of segs) { const x = MI.A[k]; if (!x || t < a - .35 || t > e + .35) continue; const w = Math.min(ease((t - a + .35) / .7), ease((e - t + .35) / .7)); if (w <= 0) continue; list.push([k, (1 - gw) * w * (1 - segw), (t - a + .35) % x.d]); segw += w * (1 - segw); }
  list.push([base, (1 - gw) * (1 - segw), hold ? Math.min(bt, MI.A[base].d - .001) : bt % MI.A[base].d]);
  for (const k in MI.A) MI.A[k].a.setEffectiveWeight(0);
  for (const [k, w, tm] of list) { const x = MI.A[k]; x.a.time = Math.min(tm, x.d - .001); x.a.setEffectiveWeight(w); }
  const off = .3 * MI.k * fwd;
  MI.root.position.set(s.p.x + Math.sin(s.ry) * off, 0, s.p.z + Math.cos(s.ry) * off); MI.root.rotation.y = s.ry;
  MI.Mo.position.y = MI.fy; MI.mix.update(0);
  MI.Mo.position.x = 0; MI.Mo.position.z = 0; MI.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); MI.hips.getWorldPosition(hp); MI.inner.worldToLocal(hp); MI.Mo.position.x = -(hp.x - MI.rest.x); MI.Mo.position.z = -(hp.z - MI.rest.z);
  const call = list.some(([k, w]) => w > .5 && k === 'phone_talk_standing'); MI.ph.visible = call;
  if (call) { MI.root.updateMatrixWorld(true); const a = new THREE.Vector3(), b2 = new THREE.Vector3(), hd = new THREE.Vector3(); MI.lh.getWorldPosition(a); MI.rh.getWorldPosition(b2); MI.head.getWorldPosition(hd); const sc = MI.root.scale.x; const p = (a.distanceTo(hd) < b2.distanceTo(hd) ? a : b2).clone(); p.z += .07 * sc; MI.ph.position.copy(p); MI.ph.scale.setScalar(sc * 1.3); MI.ph.rotation.set(0, s.ry, (p.x < hd.x ? -1 : 1) * .35); }
  const m = window.DBGM != null ? window.DBGM : ampOf(segAt(t, 'mitsi'))(t); const mm = Math.max(m, MI.mPrev * .55); MI.mPrev = mm; MI.MO.set(mm);
}

// ---------- camera ----------
function closeup(name, dist = 2.1, side = 0.35, up = 0.12, push = 0.25, k = 0) {
  const s = seats[name]; const hw = headWorld(name);
  const inward = v3(-s.p.x, 0, -(s.p.z + 0.4)).normalize(); const perp = v3(inward.z, 0, -inward.x);
  const d = (VERT ? dist * 1.08 : dist) - push * k;
  const pos = hw.clone().add(inward.clone().multiplyScalar(d)).add(perp.multiplyScalar(side)).add(v3(0, up, 0));
  const tgt = hw.clone().add(v3(0, VERT ? -0.28 : -0.12, 0));
  return { pos, tgt };
}
function wide(k, a = 0) {
  const pos = VERT ? v3(Math.sin(a) * 2, lerp(3.6, 3.2, k), lerp(8.6, 7.4, k)) : v3(Math.sin(a) * 2, lerp(3.1, 2.7, k), lerp(8.2, 7.0, k));
  return { pos, tgt: v3(0, 1.25, -0.9) };
}
const SHOTS = [];
function shot(start, fn) { SHOTS.push({ start, fn }); }
shot(0, k => wide(k, 0));
const lineShots = [['02_tomer_a', 'tomer'], ['04_itai_a', 'itai'], ['06_tamar_a', 'tamar'], ['08_homeless_a', 'homeless']];
lineShots.forEach(([f, n], i) => {
  shot(T[f].start - 0.2, k => closeup(n, 2.0, i % 2 ? -0.35 : 0.35, 0.1, 0.3, k));
  const cs = chorusSegs[i];
  shot(cs.start - 0.05, k => wide(0.4 + k * 0.4, (i % 2 ? -1 : 1) * 0.35));
});
shot(MITSI_UP - 0.1, k => closeup('mitsi', 1.7, 0, -0.05, 0.25, k));
shot(DIAL, k => ({ pos: v3(0, 5.2 - k * 0.4, 6.5), tgt: v3(0, 0.8, -0.8) }));
shot(IVR, k => ({ pos: v3(Math.sin(k * 0.8) * 1.5, 7.5 - k * 0.8, 3.2), tgt: v3(0, 0.6, -0.5) }));
shot(PITCH - 0.1, k => closeup('mitsi', VERT ? 2.0 : 1.9, 0, 0.0, 0.4, k));
shot(HUG - 0.05, k => wide(0.2 + k * 0.6, 0));
SHOTS.sort((a, b) => a.start - b.start);
function updateCamera(t) {
  let i = SHOTS.length - 1; while (i > 0 && SHOTS[i].start > t) i--;
  const s = SHOTS[i], next = SHOTS[i + 1]?.start ?? END;
  const k = ease((t - s.start) / Math.max(1, next - s.start));
  const { pos, tgt } = s.fn(k);
  camera.position.copy(pos); camera.lookAt(tgt);
}

// ---------- 2D overlay ----------
const SUBS = [];
function sub(file, parts, prefix = '') { const s = T[file]; parts.forEach(([a, b, txt]) => SUBS.push({ a: s.start + a, b: s.start + (b ?? s.dur) + 0.15, txt: prefix + txt })); }
sub('01_danit_a', [[0, null, 'שלום לכולם. מי רוצה לשתף היום?']]);
sub('02_tomer_a', [[0, 1.9, 'שלום, אני תומר…'], [2.3, 4.6, 'חיפשתי את סוכן הביטוח שלי.'], [4.9, 6.6, 'שלושה ימים על הקו.'], [6.96, null, 'ביום השני… כבר זמזמתי עם המוזיקה.']]);
sub('04_itai_a', [[0, 4.0, 'הסוכן שלי אמר: ״אחזור אליך תוך 24 שעות.״'], [4.43, null, 'זה היה בפסח.']]);
sub('06_tamar_a', [[0, 3.1, 'אחרי יומיים על הקו, ההקלטה אמרה:'], [3.33, 5.2, '״שיחתך חשובה לנו״…'], [5.5, 6.7, 'בכיתי.'], [7.0, null, 'זה הדבר הכי נחמד שמישהו אמר לי השנה.']]);
sub('08_homeless_a', [[0, 3.7, 'אני… חיכיתי על הקו לסוכן של ביטוח הדירה…'], [4.08, null, 'עד שכבר לא הייתה דירה.']]);
['אוהבים אותך, תומר.', 'אוהבים אותך, איתי.', 'אוהבים אותך, תמר.', 'אוהבים אותך.', 'אוהבים אותך, "מִיצִי"!'].forEach((txt, i) => sub(chorusSegs[i].file, [[0, null, txt]], 'כולם: '));
sub('n_m1', [[0, null, 'מכירים את הצליל הזה?']]);
sub('n_i1', [[0, 2.8, 'מיקומך בתור: 980.'], [3.09, null, 'זמן המתנה משוער: שלושה ימים.']]);
sub('n_m2', [[0, 2.6, 'עם "מִיצִי" תקשורת — זה פשוט לא קורה.'], [2.7, 4.85, 'אין מענה? הבוט הקולי עונה.'], [4.95, 6.1, 'או בוט וואטסאפ.'], [6.2, 7.95, 'או הודעה מתומללת למייל.'], [8.05, 9.3, 'או שיחה לנייד.'], [9.3, null, 'או… מה שתבחרו!']]);

const U = Math.min(W, H) / 1080; // unit scale
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function wrap(txt, maxW) {
  const words = txt.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t2 = cur ? cur + ' ' + w : w; if (ctx.measureText(t2).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t2; }
  if (cur) lines.push(cur); return lines;
}
function text(txt, x, y, size, weight = 900, color = '#fff', stroke = 0, align = 'center', font = 'Heebo') {
  ctx.font = `${weight} ${size}px ${font}`; ctx.direction = font === 'Heebo' ? 'rtl' : 'ltr'; ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = stroke; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(txt, x, y); }
  ctx.fillStyle = color; ctx.fillText(txt, x, y);
}
function drawSubs(t) {
  const s = SUBS.find(s => t >= s.a && t < s.b); if (!s) return;
  const pop = ease((t - s.a) / 0.12);
  const size = (VERT ? 64 : 58) * U; ctx.font = `900 ${size}px Heebo`;
  const lines = wrap(s.txt, W * (VERT ? 0.84 : 0.7));
  const lh = size * 1.22; const cy = VERT ? H * 0.74 : H * 0.86;
  const y0 = cy - (lines.length - 1) * lh / 2;
  ctx.save(); ctx.globalAlpha = pop; ctx.translate(W / 2, y0); ctx.scale(0.9 + 0.1 * pop, 0.9 + 0.1 * pop); ctx.translate(-W / 2, -y0);
  lines.forEach((l, i) => text(l, W / 2, y0 + i * lh, size, 900, s.txt.startsWith('כולם') ? '#ffe066' : '#fff', size * 0.2));
  ctx.restore();
}
// icons
function icon(kind, x, y, r, col) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'voice') { [0.3, 0.6, 0.9, 0.55, 0.3].forEach((h, i) => { ctx.beginPath(); ctx.moveTo((i - 2) * r * 0.25, -h * r * 0.5); ctx.lineTo((i - 2) * r * 0.25, h * r * 0.5); ctx.stroke(); }); }
  if (kind === 'chat') { rrect(-r * 0.5, -r * 0.42, r, r * 0.68, r * 0.18); ctx.fill(); ctx.beginPath(); ctx.moveTo(-r * 0.25, r * 0.2); ctx.lineTo(-r * 0.4, r * 0.48); ctx.lineTo(0, r * 0.24); ctx.fill(); ctx.fillStyle = col; [-1, 0, 1].forEach(i => { ctx.beginPath(); ctx.arc(i * r * 0.22, -r * 0.08, r * 0.07, 0, 7); ctx.fill(); }); }
  if (kind === 'mail') { ctx.strokeRect(-r * 0.5, -r * 0.33, r, r * 0.66); ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.33); ctx.lineTo(0, r * 0.08); ctx.lineTo(r * 0.5, -r * 0.33); ctx.stroke(); }
  if (kind === 'phone') { rrect(-r * 0.28, -r * 0.5, r * 0.56, r, r * 0.1); ctx.stroke(); ctx.beginPath(); ctx.arc(0, r * 0.36, r * 0.05, 0, 7); ctx.fill(); }
  if (kind === 'star') { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.25 : r * 0.55; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
const CHIPS = [
  { a: 2.55, txt: 'בוט קולי עונה', kind: 'voice', col: '#7b4dff' },
  { a: 4.62, txt: 'בוט וואטסאפ', kind: 'chat', col: '#1fae5b' },
  { a: 5.78, txt: 'הודעה מתומללת למייל', kind: 'mail', col: '#e2574c' },
  { a: 7.47, txt: 'שיחה לנייד', kind: 'phone', col: '#1d8fe0' },
  { a: 9.36, txt: 'מה שתבחרו!', kind: 'star', col: '#f2a20c' },
];
CHIPS.forEach((c, i) => { c.a = D2.chips[i] - PITCH; });
function drawChips(t) {
  const lt = t - PITCH; if (lt < 2.4 || t > PIZZA - 0.1) return;
  const fadeOut = 1 - ease((t - PIZZA + 0.5) / 0.4);
  const cw = (VERT ? 640 : 600) * U, ch = 96 * U;
  CHIPS.forEach((c, i) => {
    const k = ease((lt - c.a) / 0.25); if (k <= 0) return;
    let x, y;
    if (VERT) { x = W / 2 - cw / 2; y = H * 0.455 + i * (ch + 14 * U); }
    else { x = i % 2 ? W * 0.03 : W * 0.97 - cw; y = H * 0.36 + Math.floor(i / 2) * (ch + 28 * U); if (i === 4) x = W * 0.97 - cw, y = H * 0.36 + 2 * (ch + 28 * U); }
    const bounce = 1 + Math.sin(clamp((lt - c.a) / 0.3, 0, 1) * Math.PI) * 0.08 + (lt > CHIPS[4].a ? Math.sin((lt - CHIPS[4].a) * 10) * 0.03 : 0);
    ctx.save(); ctx.globalAlpha = k * fadeOut; ctx.translate(x + cw / 2, y + ch / 2); ctx.scale(bounce * (0.6 + 0.4 * k), bounce * (0.6 + 0.4 * k)); ctx.translate(-cw / 2, -ch / 2);
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18 * U; ctx.fillStyle = 'rgba(255,255,255,0.96)'; rrect(0, 0, cw, ch, ch / 2); ctx.fill(); ctx.shadowBlur = 0;
    icon(c.kind, cw - ch / 2, ch / 2, ch * 0.38, c.col);
    let fsz = 44 * U; ctx.font = `900 ${fsz}px Heebo`; while (ctx.measureText(c.txt).width > cw - ch - 110 * U) { fsz -= 1; ctx.font = `900 ${fsz}px Heebo`; }
    text(c.txt, cw - ch - 14 * U, ch / 2 + 2, fsz, 900, '#1b2733', 0, 'right');
    // check mark on the left
    ctx.strokeStyle = c.col; ctx.lineWidth = 8 * U; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(32 * U, ch / 2); ctx.lineTo(46 * U, ch / 2 + 14 * U); ctx.lineTo(72 * U, ch / 2 - 16 * U); ctx.stroke();
    ctx.restore();
  });
}
function drawDial(t) {
  const lt = t - DIAL; const end = IVR + T['n_i1'].dur + 0.3; if (lt < 0 || t > end) return;
  const fin = ease(lt / 0.3) * (1 - ease((t - end + 0.3) / 0.3));
  ctx.save(); ctx.globalAlpha = fin;
  ctx.fillStyle = 'rgba(8,12,20,0.55)'; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = VERT ? H * 0.36 : H * 0.42;
  // phone handset ring pulses (tones at 0 and 1.4s)
  if (t < IVR) {
    for (const st of [0, 1.4]) { const p = (lt - st); if (p > 0 && p < 1.2) { ctx.strokeStyle = `rgba(255,255,255,${1 - p / 1.2})`; ctx.lineWidth = 8 * U; ctx.beginPath(); ctx.arc(cx, cy, (120 + p * 260) * U, 0, 7); ctx.stroke(); } }
    ctx.fillStyle = '#1fae5b'; ctx.beginPath(); ctx.arc(cx, cy, 110 * U, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.6 + Math.sin(lt * 30) * 0.05); ctx.fillStyle = '#fff';
    rrect(-75 * U, -22 * U, 150 * U, 44 * U, 22 * U); ctx.fill(); ctx.fillRect(-75 * U, -22 * U, 36 * U, 60 * U); ctx.fillRect(39 * U, -22 * U, 36 * U, 60 * U); ctx.restore();
    text('טוּ…  טוּ…', cx, cy + 210 * U, 80 * U, 900, '#fff', 14 * U);
  } else {
    // IVR LCD panel
    const lt2 = t - IVR; const pw = (VERT ? 900 : 1000) * U, ph = 520 * U;
    ctx.fillStyle = '#0d1a10'; ctx.strokeStyle = '#3a4a3c'; ctx.lineWidth = 14 * U; rrect(cx - pw / 2, cy - ph / 2, pw, ph, 40 * U); ctx.fill(); ctx.stroke();
    text('מיקומך בתור', cx, cy - 170 * U, 64 * U, 700, '#7dff9a');
    const num = lt2 < 5.0 ? '980' : lt2 < 5.6 ? '981' : '982';
    ctx.save(); ctx.shadowColor = '#3dff6a'; ctx.shadowBlur = 40 * U;
    text(lt2 > 1.3 ? num : '…', cx, cy - 20 * U, 210 * U, 900, '#9dffb0', 0, 'center', 'HeeboL'); ctx.restore();
    if (lt2 > 3.0) text('זמן המתנה משוער: 3 ימים', cx, cy + 170 * U, 58 * U, 900, lt2 > 4.9 ? '#ff6b6b' : '#7dff9a');
  }
  ctx.restore();
}
// hearts for the group hug
function drawHearts(t) {
  const lt = t - HUG; if (lt < 0 || t > ENDCARD + 0.6) return;
  for (let i = 0; i < 26; i++) {
    const r = (i * 9301 + 49297) % 233280 / 233280, r2 = (i * 4271 + 1231) % 1000 / 1000;
    const p = (lt * 0.6 + r) % 1; const x = W * (0.08 + 0.84 * r2), y = H * (0.95 - p * 0.9); const s = (24 + r * 30) * U;
    ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI) * 0.9; ctx.translate(x, y); ctx.fillStyle = i % 3 ? '#ff4f8b' : '#ffd34d';
    ctx.beginPath(); ctx.moveTo(0, s * 0.3); ctx.bezierCurveTo(-s, -s * 0.4, -s * 0.4, -s * 1.1, 0, -s * 0.45); ctx.bezierCurveTo(s * 0.4, -s * 1.1, s, -s * 0.4, 0, s * 0.3); ctx.fill(); ctx.restore();
  }
}
// brand cat-head logo mark
function catMark(x, y, r) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(-r * 0.85, -r * 0.2); ctx.lineTo(-r * 0.7, -r * 1.15); ctx.lineTo(-r * 0.15, -r * 0.75); ctx.lineTo(r * 0.15, -r * 0.75); ctx.lineTo(r * 0.7, -r * 1.15); ctx.lineTo(r * 0.85, -r * 0.2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.85, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#0d3b66'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * 0.38, -r * 0.08, r * 0.12, r * 0.18, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#f28c38'; ctx.beginPath(); ctx.moveTo(-r * 0.1, r * 0.18); ctx.lineTo(r * 0.1, r * 0.18); ctx.lineTo(0, r * 0.3); ctx.fill();
  // headset
  ctx.strokeStyle = '#18a0d8'; ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 1.08, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  ctx.fillStyle = '#18a0d8'; for (const s of [-1, 1]) { rrect(s * r * 1.08 - r * 0.15, -r * 0.25, r * 0.3, r * 0.45, r * 0.1); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-r * 1.0, r * 0.2); ctx.quadraticCurveTo(-r * 0.9, r * 0.75, -r * 0.3, r * 0.62); ctx.stroke();
  ctx.restore();
}
// ---------- end card: the animated Mitsi logo from the earlier ads ----------
const LOGO_VARS = { '--bg-top': '#061226', '--bg-bot': '#01050c', '--cat-a': '#9cefff', '--cat-b': '#2a9be6', '--cat-c': '#11528a', '--txt-a': '#c8f6ff', '--txt-b': '#45b4f2', '--txt-c': '#1a6cb4', '--sub': '#8fc9ec', '--accent': '#3fd0ff' };
const b64 = async u => { const bl = await (await fetch(u)).blob(); return await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(bl); }); };
const F800 = await b64('heebo-800.ttf'), F300 = await b64('heebo-300.ttf');
let LOGO = (await (await fetch('logo_svg.txt')).text()).replace(/var\((--[a-z-]+)\)/g, (m, v) => LOGO_VARS[v]);
LOGO = LOGO.replace(/<svg([^>]*)>/, (m, at) => `<svg${at.includes('xmlns') ? '' : ' xmlns="http://www.w3.org/2000/svg"'}${at} width="1600" height="600"><style>@font-face{font-family:H;src:url(${F800});font-weight:900}@font-face{font-family:H;src:url(${F300});font-weight:300}text{font-family:H}</style>`);
const logoHold = document.createElement('div'); logoHold.style.cssText = 'position:absolute;left:-9999px;top:0;width:1600px;height:600px'; logoHold.innerHTML = LOGO; document.body.appendChild(logoHold);
const lclamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
let rs = 1; const lrnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
function logoFrame(t) { // t in ms — same animation as the earlier ads (ads.tpl.html)
  const g = id => logoHold.querySelector('#' + id); const clamp = lclamp, rnd = lrnd;
  const hips = [[80, 200], [101, 200], [204, 200], [222, 200]], legPhase = [0, Math.PI, Math.PI, 0];
  const easeOut = x => 1 - Math.pow(1 - x, 3), easeInOut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const START_X = 1950, END_X = 1260, WALK_AT = 150, WALK_MS = 2300, STRIDE = 150, STOP = WALK_AT + WALK_MS;
  const h = easeOut(clamp(t / 900)); g('horizon').setAttribute('x1', 800 - 560 * h); g('horizon').setAttribute('x2', 800 + 560 * h);
  const u = clamp((t - WALK_AT) / WALK_MS), p = 1 - Math.pow(1 - u, 2.2), X = START_X + (END_X - START_X) * p, phase = (START_X - X) / STRIDE * Math.PI * 2;
  const speed = u < 1 ? Math.pow(1 - u, 1.2) : 0, amp = Math.min(1, speed * 1.7), bob = -Math.abs(Math.sin(phase)) * 4 * amp;
  g('catPos').setAttribute('transform', `translate(${X.toFixed(2)} ${(117 + bob).toFixed(2)})`);
  ['legB1', 'legB2', 'legF1', 'legF2'].forEach((id, i) => g(id).setAttribute('transform', `rotate(${(26 * amp * Math.sin(phase + legPhase[i])).toFixed(2)} ${hips[i][0]} ${hips[i][1]})`));
  g('shadow').setAttribute('rx', (135 - bob * 2).toFixed(1));
  const ts = t - STOP; let headA = 2 * amp * Math.sin(phase * 2); if (ts > 0 && ts < 1100) headA += -9 * Math.sin(Math.PI * ts / 1100);
  g('head').setAttribute('transform', `rotate(${headA.toFixed(2)} 236 168)`);
  g('tail').setAttribute('transform', `rotate(${(Math.sin(t * .0045) * (4 + 9 * amp) + (ts > 0 ? Math.sin(t * .0016) * 6 : 0)).toFixed(2)} 58 175)`);
  let ry = 4.5; if (ts > 1500) { const k = (ts - 1500) % 3900; if (k < 160) ry = 4.5 * Math.abs(1 - 2 * k / 160); } g('eye').setAttribute('ry', ry.toFixed(2));
  if (ts > 0 && ts < 1000) { const e = easeOut(ts / 1000); g('ping').setAttribute('r', (10 + 190 * e).toFixed(1)); g('ping').setAttribute('opacity', (1 - e).toFixed(3)); } else g('ping').setAttribute('opacity', 0);
  ['arc0', 'arc1', 'arc2'].forEach((id, i) => { const appear = clamp((ts - 150 - i * 170) / 260), pulse = .4 + .6 * (.5 + .5 * Math.sin(t * .0055 - i * 1.15)); g(id).setAttribute('opacity', (appear * (ts > 900 ? pulse : 1)).toFixed(3)); });
  const m = clamp((ts - 250) / 750), em = easeInOut(m), WW = 680; g('wipeRect').setAttribute('x', 960 - WW * em); g('wipeRect').setAttribute('width', WW * em); g('scan').setAttribute('x', 958 - WW * em); g('scan').setAttribute('opacity', m > 0 && m < 1 ? .95 : 0);
  rs = 1 + Math.floor(t / 42); rnd(); const glitching = ts > 250 && ts < 1350;
  if (glitching && rnd() < .5) { const dx = (rnd() - .5) * 14; g('glitchA').setAttribute('transform', `translate(${dx} 0)`); g('glitchA').setAttribute('opacity', .55); g('glitchB').setAttribute('transform', `translate(${-dx} 0)`); g('glitchB').setAttribute('opacity', .55); } else { g('glitchA').setAttribute('opacity', 0); g('glitchB').setAttribute('opacity', 0); }
  const q = easeOut(clamp((ts - 850) / 900)); g('sub').setAttribute('opacity', q.toFixed(3)); g('sub').setAttribute('letter-spacing', (40 * (1 - q) + 6).toFixed(2));
  const sw = ((ts - 1900) % 4600) / 1500; if (ts > 1900 && sw < 1) { const x = 1000 - 820 * easeInOut(sw); g('sheen').setAttribute('x1', x - 90); g('sheen').setAttribute('x2', x + 90); } else { g('sheen').setAttribute('x1', -400); g('sheen').setAttribute('x2', -200); }
}
async function logoImage(ms) {
  logoFrame(ms); const xml = new XMLSerializer().serializeToString(logoHold.firstElementChild);
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml); await img.decode(); return img;
}
window.__logoImage = (ms) => logoImage(ms);
async function drawEndCard(t) {
  const lt = t - ENDCARD; if (lt < 0) return;
  const k = ease(lt / 0.4);
  ctx.save(); ctx.globalAlpha = k;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#061226'); g.addColorStop(1, '#01050c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const img = await logoImage(Math.max(0, lt - 0.2) * 1000);
  const lw = VERT ? W * 1.08 : W * 0.62, lh = lw * 600 / 1600, lx = (W - lw) / 2, ly = VERT ? H * 0.09 : H * 0.02;
  ctx.drawImage(img, lx, ly, lw, lh);
  const base = ly + lh + (VERT ? 20 : 0) * U;
  const tk = ease((lt - 2.3) / 0.4);
  if (tk > 0) { ctx.globalAlpha = k * tk; text('אף אחד לא נשאר על הקו.', W / 2, base + 30 * U, (VERT ? 64 : 54) * U, 900, '#c8f6ff'); }
  const items = ['מרכזייה בענן', 'ניהול עצמאי עם הקלוד שלכם, או מול הצוות שלנו', 'שלוחות חכמות בכל מקום בעולם, גם בסלולרי', 'מעסק של אדם אחד ועד עשרות שלוחות'];
  const fs = (VERT ? 44 : 34) * U, gap = (VERT ? 104 : 66) * U, y0 = base + (VERT ? 150 : 110) * U, bw = VERT ? W * 0.86 : W * 0.56;
  items.forEach((it, i) => {
    const ik = ease((lt - 2.7 - i * 0.3) / 0.3); if (ik <= 0) return;
    const y = y0 + i * gap; ctx.save(); ctx.globalAlpha = k * ik; ctx.translate((1 - ik) * 40 * U, 0);
    ctx.fillStyle = 'rgba(63,208,255,0.10)'; ctx.strokeStyle = 'rgba(63,208,255,0.55)'; ctx.lineWidth = 3 * U; rrect(W / 2 - bw / 2, y - gap * 0.38, bw, gap * 0.76, gap * 0.38); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3fd0ff'; ctx.beginPath(); ctx.arc(W / 2 + bw / 2 - gap * 0.36, y, 10 * U, 0, 7); ctx.fill();
    ctx.font = `700 ${fs}px Heebo`; let size = fs; while (ctx.measureText(it).width > bw - gap * 1.1) { size -= 2; ctx.font = `700 ${size}px Heebo`; }
    text(it, W / 2 + bw / 2 - gap * 0.72, y + 2, size, 700, '#ffffff', 0, 'right'); ctx.restore();
  });
  const uk = ease((lt - 4.1) / 0.4);
  if (uk > 0) { ctx.globalAlpha = k * uk; const uy = y0 + 4 * gap + (VERT ? 40 : 20) * U; text('03-3826600  ·  mitsi.co.il', W / 2, uy, (VERT ? 52 : 40) * U, 900, '#3fd0ff', 0, 'center', 'HeeboL'); }
  ctx.restore();
}
function vignette() {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function drawTitle(t) {
  if (t > 3.6) return; const k = ease(t / 0.4) * (1 - ease((t - 3.1) / 0.4));
  ctx.save(); ctx.globalAlpha = k; const y = VERT ? H * 0.1 : H * 0.1;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; const w = 760 * U; rrect(W / 2 - w / 2, y - 60 * U, w, 120 * U, 60 * U); ctx.fill();
  text('קבוצת תמיכה · מפגש מס׳ 47', W / 2, y + 2, 56 * U, 900, '#fff'); ctx.restore();
}

// ---------- frame ----------
window.renderFrame = async (t) => {
  animate(t); poseMitsi(t); updateCamera(t);
  renderer.render(scene, camera);
  ctx.globalAlpha = 1; ctx.drawImage(glCanvas, 0, 0);
  vignette(); drawTitle(t); drawHearts(t); drawChips(t); drawDial(t); await drawEndCard(t);
  if (t < ENDCARD + 0.4) drawSubs(t);
  // fade from black / to end
  const fb = 1 - ease(t / 0.4); if (fb > 0) { ctx.fillStyle = `rgba(0,0,0,${fb})`; ctx.fillRect(0, 0, W, H); }
  return out.toDataURL('image/jpeg', 0.9);
};
window.META = { END, ENDCARD, HUG, PITCH, IVR, DIAL, CHIPS: CHIPS.map(c => PITCH + c.a) };
window.READY = true;
