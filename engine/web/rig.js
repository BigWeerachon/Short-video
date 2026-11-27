// ตัวละคร 2D flat vector + 2-bone IK (คู่มือขั้นที่ 3, lessons L03 L04 L05 L06)
import { CAST } from './cast.js';

export const EXPRS = ['happy', 'smug', 'scared', 'shock', 'sad', 'cry', 'laugh', 'pale', 'angry', 'sleep', 'swirl', 'sweat', 'fire', 'starry', 'bliss', 'grin'];
export const SKIN = '#f6c9a2';
export const SHOE = '#3a3350';

const clock = { t: 0, mouth: 0 };
/** ตั้งเวลาปัจจุบันและค่าปาก (envelope 0–9) ก่อนวาดเฟรม */
export function setClock(t, mouth) { clock.t = t; clock.mouth = mouth || 0; }

/** สีเข้มขึ้น k (0..1) — แขนเสื้อเข้มกว่าลำตัว ~14% */
export function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.round(c * (1 - k)).toString(16).padStart(2, '0');
  return `#${f(n >> 16)}${f((n >> 8) & 255)}${f(n & 255)}`;
}

/**
 * 2-bone IK: หาข้อศอก/เข่า จากไหล่/สะโพกไปยังเป้า
 * bendSign = เครื่องหมายของ cross(target-shoulder, elbow-shoulder)
 */
export function ik2(shoulder, target, l1, l2, bendSign = 1) {
  let dx = target.x - shoulder.x, dy = target.y - shoulder.y;
  let d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 1e-9, minD = Math.abs(l1 - l2) + 1e-6;
  if (d < 1e-9) { dx = 0; dy = 1; d = 1e-9; }
  const dc = Math.min(Math.max(d, minD), maxD);
  const ux = dx / d, uy = dy / d;
  const hand = d > maxD || d < minD ? { x: shoulder.x + ux * dc, y: shoulder.y + uy * dc } : { x: target.x, y: target.y };
  const a = (l1 * l1 - l2 * l2 + dc * dc) / (2 * dc);
  const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
  const px = shoulder.x + ux * a, py = shoulder.y + uy * a;
  // ตั้งฉาก: (-uy, ux) ให้ cross = +h*dc
  const elbow = { x: px - uy * h * bendSign, y: py + ux * h * bendSign };
  return { elbow, hand };
}

// เป้ามือ (แขนขวาของภาพ, x บวก) — แขนซ้ายสะท้อนแกน x
export const ARM = {
  throat: { x: 30, y: -220, bend: 'out', elbow: { x: 82, y: -198 } }, drink: { x: 50, y: -244, bend: 'out' },
  down: { x: 50, y: -112, bend: 'out' }, hips: { x: 72, y: -128, bend: 'out' }, up: { x: 62, y: -335, bend: 'out' },
  cheer: { x: 100, y: -300, bend: 'out' }, wave: { x: 100, y: -300, bend: 'out', wave: true }, point: { x: 135, y: -215, bend: 'down' },
  'cover-mouth': { x: 16, y: -262, bend: 'down' }, 'cover-eyes': { x: 26, y: -298, bend: 'down' }, cheek: { x: 52, y: -272, bend: 'down' },
  phone: { x: 22, y: -205, bend: 'down' }, fold: { x: -22, y: -165, bend: 'down' }, shrug: { x: 88, y: -218, bend: 'down' },
  hold: { x: 58, y: -165, bend: 'down' }, scared: { x: 34, y: -250, bend: 'down' }, reach: { x: 140, y: -240, bend: 'down' },
  // ท่าถือของ (คนเกิด 7 วัน) — ศอกออกนอก/ลงล่างเสมอ (L03 L23)
  selfie: { x: 118, y: -330, bend: 'out' }, magnify: { x: 92, y: -232, bend: 'down' }, calc: { x: 34, y: -170, bend: 'down' },
  drag: { x: 78, y: -118, bend: 'out' }, thumb: { x: 92, y: -250, bend: 'out', thumb: true }, unroll: { x: 72, y: -236, bend: 'down' },
  hug: { x: 18, y: -168, bend: 'down' }, stop: { x: 112, y: -262, bend: 'down', palm: true }, swat: { x: 140, y: -318, bend: 'out', palm: true },
  wheel: { x: 96, y: -150, bend: 'down' },
};

function armTarget(spec, side, t) {
  if (spec && typeof spec === 'object') return { x: spec.x, y: spec.y, bend: spec.bend || 'down' };
  const p = ARM[spec || 'down'] || ARM.down;
  const wob = p.wave ? Math.sin(t * 9) * 18 : 0;
  return { x: side * (p.x + wob), y: p.y, bend: p.bend, elbow: p.elbow && { x: side * p.elbow.x, y: p.elbow.y }, thumb: p.thumb, palm: p.palm };
}

let SKN = SKIN; // สีผิวของตัวที่กำลังวาด (ตัวประกอบเงาใช้สีเทาฟ้า)
const DEF = { x: 540, y: 1500, scale: 1, dir: 1, expr: 'happy', talk: false, mode: 'stand', arms: {}, walkPhase: 0, prop: null };

/**
 * วาดตัวละคร — origin = กึ่งกลางเท้า
 * pose: {x,y,scale,dir,expr,talk,mode:'stand'|'sit'|'walk'|'sleep',arms:{l,r},walkPhase,prop,armsFront}
 */
/** บันทึกการวาดตัวละครทุกครั้งสำหรับทีม QA (เปิดเฉพาะตอนตรวจ) */
export const qaLog = { on: false, items: [] };

export function drawChar(ctx, castId, pose = {}) {
  const c = CAST[castId];
  if (!c) throw new Error(`ไม่มีตัวละคร ${castId}`);
  if (qaLog.on) {
    const m = ctx.getTransform ? ctx.getTransform() : null;
    const pt = m ? m.transformPoint({ x: pose.x ?? DEF.x, y: pose.y ?? DEF.y }) : { x: pose.x, y: pose.y };
    const k = (m ? Math.hypot(m.a, m.b) : 1) * (pose.scale ?? 1) * (c.size || 1);
    qaLog.items.push({ cast: castId, x: Math.round(pt.x), y: Math.round(pt.y), h: Math.round(380 * k), talk: !!pose.talk,
      expr: pose.expr || 'happy', mode: pose.mode || 'stand', flip: !!(pose.dir < 0) });
  }
  if (c.type === 'ghost') { drawGhost(ctx, pose); return; }
  const p = { ...DEF, ...pose, arms: { ...(pose.arms || {}) } };
  const t = clock.t + (c.seed || 0);
  SKN = c.skin || SKIN;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.scale * (c.size || 1), p.scale * (c.size || 1));
  if (p.lean) ctx.rotate(p.lean);
  if (p.mode === 'sleep') { drawSleeping(ctx, c, t); ctx.restore(); return; }
  const bw = c.width || 1;
  const sitDrop = p.mode === 'sit' || p.mode === 'ride' ? 62 : 0;
  if (p.shiver) ctx.translate(Math.sin(clock.t * 60) * 4 * p.shiver, 0);
  const breath = Math.sin(t * 2.1) * 1.6;
  const Y = (y) => y + sitDrop - (y < -100 ? breath * ((-100 - y) / 200) : 0);

  // ขา
  if (p.mode === 'sit') drawSitLegs(ctx, c, bw);
  else if (p.mode === 'ride') drawRideLegs(ctx, c, p.dir);
  else if (p.mode === 'walk') drawWalkLegs(ctx, c, bw, p);
  else drawStandLegs(ctx, c, bw);

  // เป้สะพายหลัง (โผล่สองข้างลำตัว)
  if (c.backpack) { ctx.fillStyle = c.backpack; roundRectPath(ctx, -58 * bw, Y(-210), 116 * bw, 120, 26); ctx.fill(); }
  // ผมยาวด้านหลัง
  if (c.hair === 'long') {
    ctx.fillStyle = c.hairColor;
    roundRectPath(ctx, -70, Y(-330), 140, 175, 60); ctx.fill();
  }
  // แขนที่อยู่หลังลำตัว/หัว
  const sh = { l: { x: -40 * bw, y: Y(-205) }, r: { x: 40 * bw, y: Y(-205) } };
  const arms = {};
  for (const [k, side] of [['l', -1], ['r', 1]]) {
    let tg = armTarget(p.arms[k], side, t);
    if (p.mode === 'ride' && !p.arms[k]) tg = { x: p.dir * (k === (p.dir > 0 ? 'r' : 'l') ? 120 : 95), y: -190, bend: 'down' };
    if (p.mode === 'walk' && !p.arms[k]) {
      const sw = Math.sin(p.walkPhase + (side > 0 ? 0 : Math.PI)) * 26;
      tg = { x: side * 34 + sw * p.dir, y: -112, bend: 'down' };
    }
    if (p.prop && p.prop.type === 'flashlight' && k === 'r') {
      const a = p.prop.angle ?? 0;
      tg = { x: sh.r.x + Math.cos(a) * 98, y: sh.r.y + Math.sin(a) * 98, bend: 'down' };
    }
    tg.y = Y(tg.y);
    const sign = pickBend(sh[k], tg, side);
    const sol = tg.elbow ? { elbow: { x: tg.elbow.x, y: Y(tg.elbow.y) }, hand: { x: tg.x, y: tg.y } } : ik2(sh[k], tg, 55, 52, sign);
    arms[k] = { ...sol, sh: sh[k], front: p.armsFront ?? tg.y < Y(-228), side, thumb: tg.thumb, palm: tg.palm };
  }
  for (const k of ['l', 'r']) if (!arms[k].front) drawArm(ctx, c, arms[k]);

  // ลำตัว
  ctx.fillStyle = c.shirt;
  ctx.beginPath();
  ctx.moveTo(-44 * bw, Y(-218)); ctx.lineTo(44 * bw, Y(-218));
  ctx.quadraticCurveTo(48 * bw, Y(-150), 40 * bw, Y(-92));
  ctx.lineTo(-40 * bw, Y(-92)); ctx.quadraticCurveTo(-48 * bw, Y(-150), -44 * bw, Y(-218));
  ctx.fill();
  if (c.helmet) { // แจ็กเก็ตไรเดอร์: ซิปกลาง + แถบสะท้อนแสง
    ctx.fillStyle = shade(c.shirt, 0.25); ctx.fillRect(-3, Y(-214), 6, 118);
    ctx.fillStyle = '#fff36b'; ctx.fillRect(-44 * bw, Y(-150), 88 * bw, 10);
  }
  if (c.tie) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(-16, Y(-218)); ctx.lineTo(0, Y(-196)); ctx.lineTo(16, Y(-218)); ctx.fill();
    ctx.fillStyle = c.tie;
    ctx.beginPath(); ctx.moveTo(-6, Y(-206)); ctx.lineTo(6, Y(-206)); ctx.lineTo(9, Y(-140)); ctx.lineTo(0, Y(-128)); ctx.lineTo(-9, Y(-140)); ctx.fill();
  }
  if (c.suit) { // สูท: ปกเสื้อทับเชิ้ต (วาดหลังเนกไท)
    ctx.fillStyle = shade(c.shirt, 0.2);
    ctx.beginPath(); ctx.moveTo(-26, Y(-218)); ctx.lineTo(-10, Y(-150)); ctx.lineTo(-34, Y(-190)); ctx.fill();
    ctx.beginPath(); ctx.moveTo(26, Y(-218)); ctx.lineTo(10, Y(-150)); ctx.lineTo(34, Y(-190)); ctx.fill();
  }
  if (c.backpack) { ctx.fillStyle = shade(c.backpack, 0.15); ctx.fillRect(-30 * bw, Y(-218), 12, 110); ctx.fillRect(18 * bw, Y(-218), 12, 110); }
  if (c.collar) { // เชิ้ตติดกระดุมถึงคอ
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(-26, Y(-220)); ctx.lineTo(0, Y(-200)); ctx.lineTo(-8, Y(-188)); ctx.lineTo(-30, Y(-206)); ctx.fill();
    ctx.beginPath(); ctx.moveTo(26, Y(-220)); ctx.lineTo(0, Y(-200)); ctx.lineTo(8, Y(-188)); ctx.lineTo(30, Y(-206)); ctx.fill();
    ctx.fillStyle = shade(c.shirt, 0.3); for (const yy of [-190, -164, -138, -112]) circle(ctx, 0, Y(yy), 4.5);
  }
  if (c.hood) { ctx.fillStyle = shade(c.hood, 0.1); roundRectPath(ctx, -40, Y(-224), 80, 26, 13); ctx.fill(); ctx.fillStyle = '#ffffff'; roundRectPath(ctx, -16, Y(-200), 5, 40, 2.5); ctx.fill(); roundRectPath(ctx, 11, Y(-200), 5, 40, 2.5); ctx.fill(); }
  if (c.badge) { ctx.fillStyle = c.badge; roundRectPath(ctx, 12 * bw, Y(-186), 26, 14, 4); ctx.fill(); }
  // หัว
  drawHead(ctx, c, p, t, Y(-292) + (p.headDy || 0));
  // แขนหน้า (มือขึ้นหน้า → วาดทับหัว)
  for (const k of ['l', 'r']) if (arms[k].front) drawArm(ctx, c, arms[k]);
  if (p.prop) for (const pr of [].concat(p.prop)) drawProp(ctx, pr, arms[pr.hand || 'r'], arms);
  ctx.restore();
  SKN = SKIN;
}

function pickBend(sh, tg, side) {
  const s1 = ik2(sh, tg, 55, 52, 1), s2 = ik2(sh, tg, 55, 52, -1);
  if (tg.bend === 'out') return side * (s1.elbow.x - s2.elbow.x) >= 0 ? 1 : -1;
  return s1.elbow.y >= s2.elbow.y ? 1 : -1; // 'down'
}

function drawArm(ctx, c, a) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = shade(c.shirt, 0.14); ctx.lineWidth = 24;
  line(ctx, a.sh, a.elbow);
  const mid = { x: (a.elbow.x + a.hand.x) / 2, y: (a.elbow.y + a.hand.y) / 2 };
  ctx.strokeStyle = shade(c.shirt, 0.14); ctx.lineWidth = 22; line(ctx, a.elbow, mid);
  ctx.strokeStyle = SKN; ctx.lineWidth = 17; line(ctx, mid, a.hand);
  ctx.fillStyle = SKN; circle(ctx, a.hand.x, a.hand.y, 13);
  if (a.thumb) { roundRectPath(ctx, a.hand.x - 5, a.hand.y - 30, 10, 24, 5); ctx.fill(); }
  if (a.palm) { // ฝ่ามือกาง: นิ้วรวบชี้ขึ้น
    roundRectPath(ctx, a.hand.x - 13, a.hand.y - 34, 26, 34, 11); ctx.fill();
    roundRectPath(ctx, a.hand.x + a.side * 10, a.hand.y - 12, 16, 9, 4.5); ctx.fill();
  }
}

function drawStandLegs(ctx, c, bw) {
  ctx.lineCap = 'round'; ctx.strokeStyle = c.pants; ctx.lineWidth = 26;
  line(ctx, { x: -18 * bw, y: -98 }, { x: -20 * bw, y: -10 });
  line(ctx, { x: 18 * bw, y: -98 }, { x: 20 * bw, y: -10 });
  shoe(ctx, -24 * bw, -4, -1); shoe(ctx, 24 * bw, -4, 1);
}

function drawWalkLegs(ctx, c, bw, p) {
  const hip = { x: 0, y: -98 };
  for (const [ph, col] of [[p.walkPhase + Math.PI, shade(c.pants, 0.18)], [p.walkPhase, c.pants]]) {
    const fx = Math.sin(ph) * 34 * p.dir;
    const lift = Math.max(0, Math.cos(ph)) * 16;
    const foot = { x: fx, y: -8 - lift };
    const knee = ik2(hip, foot, 48, 48, p.dir > 0 ? -1 : 1).elbow;
    ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = 26;
    line(ctx, hip, knee); line(ctx, knee, foot);
    shoe(ctx, foot.x + 6 * p.dir, foot.y + 4, p.dir);
  }
}

function drawSitLegs(ctx, c, bw) {
  ctx.fillStyle = c.pants;
  roundRectPath(ctx, -72 * bw, -44, 144 * bw, 40, 20); ctx.fill();
  ctx.fillStyle = shade(c.pants, 0.12);
  roundRectPath(ctx, -50 * bw, -30, 100 * bw, 24, 12); ctx.fill();
  shoe(ctx, -58 * bw, -12, -1); shoe(ctx, 58 * bw, -12, 1);
}

function drawSleeping(ctx, c, t) {
  ctx.fillStyle = c.bag || '#4f7cd6';
  roundRectPath(ctx, -150, -78, 280, 78, 39); ctx.fill();
  ctx.fillStyle = shade(c.bag || '#4f7cd6', 0.15);
  roundRectPath(ctx, -40, -78, 170, 78, 39); ctx.fill();
  ctx.save(); ctx.translate(-150, -60); ctx.rotate(-Math.PI / 2 + 0.15);
  ctx.scale(0.75, 0.75);
  drawHead(ctx, c, { expr: 'sleep', talk: false }, t, 0);
  ctx.restore();
}

function drawHead(ctx, c, p, t, cy) {
  drawHairBack(ctx, c, cy, t);
  ctx.fillStyle = SKN;
  ctx.beginPath(); ctx.ellipse(0, cy, c.roundFace ? 70 : 64, c.roundFace ? 66 : 72, 0, 0, Math.PI * 2); ctx.fill();
  if (c.jaw === 'square') { roundRectPath(ctx, -60, cy - 6, 120, 80, 24); ctx.fill(); }
  if (p.expr === 'pale') {
    const g = ctx.createLinearGradient(0, cy - 72, 0, cy + 10);
    g.addColorStop(0, 'rgba(120,170,230,0.75)'); g.addColorStop(1, 'rgba(120,170,230,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, cy, 64, 72, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (p.expr === 'angry') { ctx.fillStyle = 'rgba(230,80,60,0.18)'; ctx.beginPath(); ctx.ellipse(0, cy, 64, 72, 0, 0, Math.PI * 2); ctx.fill(); }
  // หู
  ctx.fillStyle = SKN; circle(ctx, -63, cy + 4, 11); circle(ctx, 63, cy + 4, 11);
  if (c.helmet) drawHelmetBack(ctx, c, cy); else drawHair(ctx, c, cy);
  drawFace(ctx, c, p, t, cy);
  drawFaceExtras(ctx, c, p, t, cy);
  if (c.helmet) drawHelmetFront(ctx, c, cy);
  if (p.goose) drawGoose(ctx, p.goose, t);
  if (c.glasses && p.expr !== 'fire' && p.expr !== 'starry') {
    ctx.strokeStyle = c.glasses; ctx.lineWidth = 5;
    roundRectPath(ctx, -44, cy - 14, 34, 26, 7); ctx.stroke();
    roundRectPath(ctx, 10, cy - 14, 34, 26, 7); ctx.stroke();
    line(ctx, { x: -10, y: cy - 4 }, { x: 10, y: cy - 4 });
  }
}

function drawHair(ctx, c, cy) {
  ctx.fillStyle = c.hairColor;
  const top = cy - 72;
  if (c.hair === 'buzz') {
    ctx.beginPath(); ctx.ellipse(0, cy - 22, 62, 52, 0, Math.PI, 0); ctx.fill();
    return;
  }
  if (NEW_HAIR[c.hair]) { NEW_HAIR[c.hair](ctx, c, cy); return; }
  ctx.beginPath(); ctx.ellipse(0, cy - 20, 67, 56, 0, Math.PI, 0); ctx.fill();
  if (c.hair === 'short' || c.hair === 'neat' || c.hair === 'long') {
    ctx.beginPath();
    ctx.moveTo(-66, cy - 18); ctx.quadraticCurveTo(-20, cy - 4, 10, cy - 34);
    ctx.quadraticCurveTo(40, cy - 10, 66, cy - 18); ctx.lineTo(66, cy - 30); ctx.lineTo(-66, cy - 30); ctx.fill();
  }
  if (c.hair === 'long') {
    roundRectPath(ctx, -74, cy - 30, 22, 100, 11); ctx.fill();
    roundRectPath(ctx, 52, cy - 30, 22, 100, 11); ctx.fill();
  }
  if (c.hair === 'spiky' || c.hair === 'cap') {
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(i * 18 - 12, top + 20); ctx.lineTo(i * 18, top - 20 + Math.abs(i) * 6); ctx.lineTo(i * 18 + 12, top + 20); ctx.fill();
    }
  }
  if (c.hair === 'cap') {
    ctx.fillStyle = c.cap;
    ctx.beginPath(); ctx.ellipse(0, cy - 34, 66, 44, 0, Math.PI, 0); ctx.fill();
    roundRectPath(ctx, -10, cy - 40, 96, 16, 8); ctx.fill();
  }
}

function drawFace(ctx, c, p, t, cy) {
  const blink = (t % (3.4 + (c.seed || 0) % 1.6)) < 0.12;
  const ex = 24, ey = cy - 2;
  const e = p.expr || 'happy';
  c = p.eyes ? { ...c, eyes: p.eyes === 'normal' ? null : p.eyes } : c; // pose.eyes เปลี่ยนแบบตาชั่วคราว
  ctx.fillStyle = '#2b2233'; ctx.strokeStyle = '#2b2233'; ctx.lineCap = 'round'; ctx.lineWidth = 5;
  // ตา
  if (e === 'swirl') {
    ctx.lineWidth = 3.5;
    for (const s of [-1, 1]) { ctx.beginPath(); for (let a = 0; a < 14; a += 0.3) { const r = 1 + a * 0.9; const aa = a + t * 8 * s; ctx.lineTo(s * ex + Math.cos(aa) * r, ey + Math.sin(aa) * r); } ctx.stroke(); }
    ctx.lineWidth = 5;
  } else if (e === 'sleep' || (blink && !['laugh', 'shock'].includes(e))) {
    for (const s of [-1, 1]) line(ctx, { x: s * ex - 9, y: ey }, { x: s * ex + 9, y: ey });
  } else if (e === 'laugh') {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * ex, ey + 4, 9, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  } else if (['scared', 'shock', 'pale', 'sweat'].includes(e)) {
    for (const s of [-1, 1]) {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(s * ex, ey, 13, 15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2b2233'; circle(ctx, s * ex, ey + 1, 5);
    }
  } else if (e === 'smug') {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * ex, ey + 2, 7, 5, 0, 0, Math.PI * 2); ctx.fill(); line(ctx, { x: s * ex - 10, y: ey - 3 }, { x: s * ex + 10, y: ey - 3 }); }
  } else if (e === 'fire') { // ตาเป็นไฟ
    for (const s of [-1, 1]) flameShape(ctx, s * ex, ey + 8, 1.1, t, '#ff7a1a', '#ffd23f');
    ctx.fillStyle = '#2b2233';
  } else if (e === 'starry') { // ตาเป็นประกาย
    for (const s of [-1, 1]) { ctx.fillStyle = '#2b2233'; circle(ctx, s * ex, ey, 13); starShape(ctx, s * ex, ey, 9, '#fff36b'); }
    ctx.fillStyle = '#2b2233';
  } else if (e === 'bliss' || (e === 'grin' && c.eyes === 'squint')) { // ตาปิดฟิน ^ ^
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * ex, ey + 6, 10, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  } else if (c.eyes === 'big') {
    for (const s of [-1, 1]) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(s * ex, ey, 14, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#2b2233'; circle(ctx, s * ex + 2, ey + 1, 8); ctx.fillStyle = '#fff'; circle(ctx, s * ex + 5, ey - 3, 2.6); ctx.fillStyle = '#2b2233'; }
  } else if (c.eyes === 'squint') { // ตาหรี่จ้อง
    ctx.lineWidth = 6; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * ex - 11, ey + 1); ctx.quadraticCurveTo(s * ex, ey - 5, s * ex + 11, ey + 1); ctx.stroke(); } ctx.lineWidth = 5;
  } else if (c.eyes === 'sleepy') { // ตาง่วงครึ่งเปลือก
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * ex, ey - 1, 9, 0, Math.PI); ctx.fill(); ctx.fillStyle = shade(SKN, 0.12); ctx.beginPath(); ctx.arc(s * ex, ey - 1, 10, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#2b2233'; line(ctx, { x: s * ex - 11, y: ey - 1 }, { x: s * ex + 11, y: ey - 1 }); }
  } else {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * ex, ey, 7, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; circle(ctx, s * ex + 2, ey - 3, 2.4); ctx.fillStyle = '#2b2233'; }
  }
  if (c.lashes && !['sleep', 'laugh', 'bliss', 'fire', 'starry'].includes(e)) for (const s of [-1, 1]) for (const k of [0, 1, 2]) line(ctx, { x: s * (ex + 4 + k * 4), y: ey - 8 + k * 3 }, { x: s * (ex + 12 + k * 5), y: ey - 15 + k * 3 });
  // คิ้ว
  ctx.lineWidth = 4.5;
  const brow = { sweat: [-6, 1], angry: [8, -1], sad: [-7, 1], cry: [-7, 1], scared: [-6, 1], pale: [-6, 1], shock: [0, 1] }[e];
  if (c.browThick) { ctx.lineWidth = 10; const b = brow || [0, 1]; for (const s of [-1, 1]) line(ctx, { x: s * ex - 13, y: ey - 26 + (s < 0 ? b[0] : -b[0]) * 0.5 }, { x: s * ex + 13, y: ey - 26 - (s < 0 ? b[0] : -b[0]) * 0.5 }); ctx.lineWidth = 4.5; }
  else if (brow) for (const s of [-1, 1]) line(ctx, { x: s * ex - 11, y: ey - 22 + (s < 0 ? brow[0] : -brow[0]) * 0.5 }, { x: s * ex + 11, y: ey - 22 - (s < 0 ? brow[0] : -brow[0]) * 0.5 });
  // แก้ม
  if (c.blush || ['happy', 'laugh', 'smug', 'bliss', 'grin', 'starry'].includes(e)) { ctx.fillStyle = 'rgba(240,120,130,0.35)'; circle(ctx, -40, cy + 18, 10); circle(ctx, 40, cy + 18, 10); }
  // ปาก
  const my = cy + 32;
  const open = p.talk ? (clock.mouth / 9) * 18 : 0;
  ctx.fillStyle = '#7a2b3a'; ctx.strokeStyle = '#2b2233'; ctx.lineWidth = 4.5;
  if (open > 1.5) { ctx.beginPath(); ctx.ellipse(0, my, 11 + open * 0.2, open * 0.6 + 2, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (e === 'laugh' || e === 'grin' || e === 'starry') { ctx.beginPath(); ctx.arc(0, my - 4, e === 'grin' ? 20 : 16, 0, Math.PI); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(-14, my - 4, 28, 5); }
  else if (e === 'fire') { ctx.beginPath(); ctx.moveTo(-16, my - 4); ctx.lineTo(16, my - 4); ctx.lineTo(10, my + 8); ctx.lineTo(-10, my + 8); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(-14, my - 4, 28, 5); }
  else if (e === 'shock') { ctx.beginPath(); ctx.ellipse(0, my, 10, 13, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (e === 'swirl') { ctx.beginPath(); ctx.ellipse(0, my, 9, 6, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (['scared', 'pale', 'sweat'].includes(e)) { ctx.beginPath(); ctx.moveTo(-12, my); for (let i = -12; i <= 12; i += 6) ctx.lineTo(i, my + (i / 6) % 2 * 3); ctx.stroke(); }
  else if (['sad', 'cry', 'angry'].includes(e)) { ctx.beginPath(); ctx.arc(0, my + 10, 12, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  else if (e === 'smug') { ctx.beginPath(); ctx.moveTo(-8, my); ctx.quadraticCurveTo(6, my + 6, 14, my - 4); ctx.stroke(); }
  else if (e === 'sleep') { line(ctx, { x: -5, y: my }, { x: 5, y: my }); }
  else { ctx.beginPath(); ctx.arc(0, my - 6, 13, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
  // เอฟเฟกต์
  if (e === 'cry') {
    ctx.fillStyle = 'rgba(90,170,240,0.85)';
    const k = (t * 1.5) % 1;
    for (const s of [-1, 1]) { roundRectPath(ctx, s * ex - 4, ey + 8, 8, 30 + k * 20, 4); ctx.fill(); }
  }
  if (e === 'sweat') { ctx.fillStyle = 'rgba(110,180,240,0.9)'; for (const [sx, sy, ph] of [[-58, -20, 0], [60, -34, 0.5], [50, 0, 0.25]]) { const k = (t * 1.3 + ph) % 1; ctx.beginPath(); ctx.ellipse(sx, cy + sy + k * 30, 6, 9, 0, 0, Math.PI * 2); ctx.fill(); } }
  if (['scared', 'pale'].includes(e)) { ctx.fillStyle = 'rgba(110,180,240,0.9)'; ctx.beginPath(); ctx.ellipse(56, cy - 30, 6, 9, 0, 0, Math.PI * 2); ctx.fill(); }
  if (e === 'sleep') { ctx.fillStyle = '#ffffff'; ctx.font = '700 28px Kanit'; ctx.fillText('z', 60, cy - 60 - (t * 10) % 20); }
}

// ---- ทรงผม/หน้าเพิ่ม (คนเกิด 7 วัน) ไม่มีตัวอักษร ----
function drawHairBack(ctx, c, cy, t) {
  if (c.hood) { ctx.fillStyle = c.hood; ctx.beginPath(); ctx.ellipse(0, cy + 2, 86, 90, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = c.hairColor;
  if (c.hair === 'bob') { roundRectPath(ctx, -76, cy - 60, 152, 128, 44); ctx.fill(); }
  if (c.hair === 'messy') { roundRectPath(ctx, -74, cy - 50, 148, 140, 40); ctx.fill(); }
  if (c.hair === 'ponytail') { // มัดสูง หางลอนสะบัดด้านหลัง
    const sw = Math.sin(t * 3) * 6;
    ctx.beginPath(); ctx.ellipse(34, cy - 84, 30, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(40, cy - 100); ctx.bezierCurveTo(130 + sw, cy - 110, 120 + sw, cy - 10, 96 + sw, cy + 30);
    ctx.bezierCurveTo(112 + sw, cy - 20, 92, cy - 70, 50, cy - 66); ctx.fill();
    for (const [x, y] of [[104, -40], [112, -6]]) circle(ctx, x + sw, cy + y, 16);
  }
}
const NEW_HAIR = {
  sidepart: (ctx, c, cy) => { // เรียบแสกข้าง
    ctx.beginPath(); ctx.ellipse(0, cy - 26, 68, 54, 0, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-68, cy - 22); ctx.quadraticCurveTo(-60, cy - 50, -24, cy - 52); ctx.quadraticCurveTo(30, cy - 40, 68, cy - 14); ctx.lineTo(68, cy - 30); ctx.lineTo(-68, cy - 30); ctx.fill();
    ctx.fillStyle = SKN; ctx.fillRect(-26, cy - 80, 5, 30);
  },
  fluffy: (ctx, c, cy) => { // ผมชี้ฟู + ผ้าคาดหัว
    ctx.beginPath(); ctx.ellipse(0, cy - 30, 68, 50, 0, Math.PI, 0); ctx.fill();
    for (let i = -4; i <= 4; i++) { const a = -Math.PI / 2 + i * 0.32; ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.2) * 60, cy - 30 + Math.sin(a - 0.2) * 52); ctx.lineTo(Math.cos(a) * 112, cy - 30 + Math.sin(a) * 96); ctx.lineTo(Math.cos(a + 0.2) * 60, cy - 30 + Math.sin(a + 0.2) * 52); ctx.fill(); }
    ctx.fillStyle = c.headband; roundRectPath(ctx, -68, cy - 46, 136, 20, 10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(60, cy - 40); ctx.lineTo(96, cy - 58); ctx.lineTo(92, cy - 30); ctx.fill();
  },
  bob: (ctx, c, cy) => { // หน้าม้าตรง
    ctx.beginPath(); ctx.ellipse(0, cy - 26, 74, 50, 0, Math.PI, 0); ctx.fill();
    roundRectPath(ctx, -72, cy - 40, 144, 22, 8); ctx.fill();
  },
  crew: (ctx, c, cy) => { // เกรียนสั้นมาก
    ctx.beginPath(); ctx.ellipse(0, cy - 30, 62, 44, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = shade(c.hairColor, -0.2); for (let i = -3; i <= 3; i++) circle(ctx, i * 15, cy - 56 + Math.abs(i) * 3, 3);
  },
  ponytail: (ctx, c, cy) => {
    ctx.beginPath(); ctx.ellipse(0, cy - 26, 68, 54, 0, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-66, cy - 20); ctx.quadraticCurveTo(-30, cy - 30, 0, cy - 52); ctx.quadraticCurveTo(30, cy - 30, 66, cy - 20); ctx.lineTo(66, cy - 30); ctx.lineTo(-66, cy - 30); ctx.fill();
    ctx.fillStyle = '#ff7ab6'; circle(ctx, 30, cy - 76, 9);
  },
  messy: (ctx, c, cy) => {
    ctx.beginPath(); ctx.ellipse(0, cy - 26, 72, 54, 0, Math.PI, 0); ctx.fill();
    for (const [x, y, r] of [[-50, -64, 22], [-14, -80, 24], [26, -78, 22], [56, -58, 20]]) circle(ctx, x, cy + y, r);
  },
  slick: (ctx, c, cy) => { // เสยเงา
    ctx.beginPath(); ctx.moveTo(-66, cy - 14); ctx.quadraticCurveTo(-70, cy - 92, 10, cy - 100); ctx.quadraticCurveTo(80, cy - 96, 66, cy - 14);
    ctx.quadraticCurveTo(50, cy - 52, 0, cy - 56); ctx.quadraticCurveTo(-50, cy - 52, -66, cy - 14); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-10, cy - 82, 30, 7, -0.15, 0, Math.PI * 2); ctx.fill();
  },
};
function drawFaceExtras(ctx, c, p, t, cy) {
  const e = p.expr || 'happy';
  if (c.nose) { ctx.fillStyle = shade(SKN, 0.18); circle(ctx, 0, cy + 14, 5); }
  if (c.mustache) { ctx.fillStyle = c.hairColor; ctx.beginPath(); ctx.ellipse(-10, cy + 20, 12, 6, 0.2, 0, Math.PI * 2); ctx.ellipse(10, cy + 20, 12, 6, -0.2, 0, Math.PI * 2); ctx.fill(); }
  if (c.roundGlasses && e !== 'fire' && e !== 'starry') {
    ctx.strokeStyle = c.roundGlasses; ctx.lineWidth = 5;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 24, cy - 2, 19, 0, Math.PI * 2); ctx.stroke(); }
    line(ctx, { x: -5, y: cy - 4 }, { x: 5, y: cy - 4 });
  }
  if (c.hair === 'messy') { // ผมปรกตา
    ctx.fillStyle = c.hairColor;
    ctx.beginPath(); ctx.moveTo(-70, cy - 40);
    for (const [x, y] of [[-52, -4], [-36, -30], [-18, -8], [0, -34], [16, -10], [34, -30], [52, -2], [70, -34]]) ctx.lineTo(x, cy + y);
    ctx.lineTo(70, cy - 50); ctx.lineTo(-70, cy - 50); ctx.fill();
  }
  if (p.headphones) { // หูฟังครอบหัว
    ctx.strokeStyle = '#2b2a3a'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, cy - 10, 80, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.fillStyle = p.headphones; roundRectPath(ctx, -92, cy - 26, 30, 56, 14); ctx.fill(); roundRectPath(ctx, 62, cy - 26, 30, 56, 14); ctx.fill();
  }
  if (c.shades && p.shades !== false) { // แว่นดำ (ถอดได้ด้วย pose.shades=false)
    ctx.fillStyle = '#15131c';
    roundRectPath(ctx, -50, cy - 16, 44, 30, 12); ctx.fill(); roundRectPath(ctx, 6, cy - 16, 44, 30, 12); ctx.fill();
    ctx.fillRect(-8, cy - 10, 16, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; roundRectPath(ctx, -42, cy - 11, 14, 6, 3); ctx.fill(); roundRectPath(ctx, 14, cy - 11, 14, 6, 3); ctx.fill();
  }
}
function starShape(ctx, x, y, r, color) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.fill();
}
/** เปลวไฟการ์ตูน (ใช้ทั้งตาไฟและรอบตัว) */
export function flameShape(ctx, x, y, s = 1, t = 0, outer = '#ff7a1a', inner = '#ffd23f') {
  const f = Math.sin(t * 18 + x) * 0.12;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s * (1 + f));
  ctx.fillStyle = outer; ctx.beginPath(); ctx.moveTo(0, -30); ctx.bezierCurveTo(14, -14, 16, 0, 12, 6); ctx.arc(0, 6, 12, 0, Math.PI); ctx.bezierCurveTo(-16, 0, -10, -12, 0, -30); ctx.fill();
  ctx.fillStyle = inner; ctx.beginPath(); ctx.moveTo(0, -14); ctx.bezierCurveTo(7, -6, 8, 2, 6, 6); ctx.arc(0, 6, 6, 0, Math.PI); ctx.bezierCurveTo(-8, 2, -5, -6, 0, -14); ctx.fill();
  ctx.restore();
}

/** แก้วในมือ: ยึดกับตำแหน่งมือจาก IK ทุกเฟรม ปากแก้วเอียงเข้าหาหน้า (tilt 0..1) */
export function glassPose(arm, tilt = 0) {
  const rot = -arm.side * 0.75 * tilt;
  return { x: arm.hand.x, y: arm.hand.y, rot, rim: { x: arm.hand.x + Math.sin(rot) * 40, y: arm.hand.y - Math.cos(rot) * 40 } };
}

/** ทิศปลายแขน (ศอก→มือ) ใช้หมุนของถือให้ต่อแนวแขน */
export function handDir(arm) { const a = Math.atan2(arm.hand.y - arm.elbow.y, arm.hand.x - arm.elbow.x); return { a, ux: Math.cos(a), uy: Math.sin(a) }; }
/** จุดเลนส์แว่นขยาย / หัวไม้เซลฟี่ — คำนวณจากมือทุกเฟรม (L23) */
export function propTip(arm, len) { const d = handDir(arm); return { x: arm.hand.x + d.ux * len, y: arm.hand.y + d.uy * len, a: d.a }; }

function drawProp(ctx, prop, arm, arms = {}) {
  drawProp7(ctx, prop, arm, arms);
  if (prop.type === 'glass') {
    const g = glassPose(arm, prop.tilt || 0), f = prop.fill ?? 0.7;
    ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.rot);
    const shape = () => { ctx.beginPath(); ctx.moveTo(-20, -40); ctx.lineTo(20, -40); ctx.lineTo(16, 28); ctx.lineTo(-16, 28); ctx.closePath(); };
    ctx.fillStyle = 'rgba(220,240,255,0.9)'; shape(); ctx.fill();
    ctx.save(); shape(); ctx.clip(); ctx.rotate(-g.rot);
    ctx.fillStyle = '#5cb8ff'; ctx.fillRect(-60, 28 - 68 * f, 120, 140); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-14, -34, 5, 50);
    ctx.restore();
    ctx.fillStyle = SKIN; circle(ctx, arm.hand.x, arm.hand.y, 13); // นิ้วโอบหน้าแก้ว
  }
  if (prop.type === 'phone') {
    ctx.save(); ctx.translate(arm.hand.x, arm.hand.y - 6);
    ctx.fillStyle = '#25304a'; roundRectPath(ctx, -14, -26, 28, 46, 6); ctx.fill();
    ctx.fillStyle = '#7cc4ff'; roundRectPath(ctx, -10, -22, 20, 36, 3); ctx.fill();
    ctx.restore();
  }
  if (prop.type === 'flashlight') {
    const a = Math.atan2(arm.hand.y - arm.elbow.y, arm.hand.x - arm.elbow.x);
    ctx.save(); ctx.translate(arm.hand.x, arm.hand.y); ctx.rotate(a);
    if (prop.on !== false) { // ลำแสงออกจากหัวไฟฉาย ทิศเดียวกับแขน (L05)
      const len = prop.length || 520;
      const g = ctx.createLinearGradient(26, 0, len, 0);
      g.addColorStop(0, 'rgba(255,240,190,0.75)'); g.addColorStop(1, 'rgba(255,240,190,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(26, -10); ctx.lineTo(len, -len * 0.22); ctx.lineTo(len, len * 0.22); ctx.lineTo(26, 10); ctx.fill();
    }
    ctx.fillStyle = '#3d4458'; roundRectPath(ctx, -8, -8, 34, 16, 4); ctx.fill();
    ctx.fillStyle = '#c9cfdb'; roundRectPath(ctx, 22, -11, 8, 22, 3); ctx.fill();
    ctx.restore();
  }
}

const SHEET_COLS = ['#ffd23f', '#f472b6', '#22c55e', '#fb923c', '#38bdf8', '#8b5cf6', '#ef4444'];
function drawProp7(ctx, prop, arm, arms) {
  const H0 = arm.hand, hx = H0.x, hy = H0.y, sd = arm.side;
  const fist = () => { ctx.fillStyle = SKN; circle(ctx, hx, hy, 13); };
  if (prop.type === 'calendarBig') { // ปฏิทินเปล่ายาวเหยียด: แกนม้วนในมือ แผ่นห้อยลงถึงพื้น (y=0) แล้วไหลไปตามพื้น
    const u = clamp01(prop.unroll ?? 1), w = 130, total = (prop.len || 900) * u;
    const cx = hx + sd * 50, drop = Math.min(total, -hy), run = Math.max(0, total - drop);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - w / 2, hy, w, drop);
    if (run > 0) { ctx.fillRect(sd > 0 ? cx - w / 2 : cx + w / 2 - run - w, -14, run + w, 14); }
    const cell = 24;
    for (let yy = hy + 26, r = 0; yy < hy + drop - 12; yy += cell + 6, r++) for (let i = 0; i < 4; i++) {
      ctx.fillStyle = (r * 4 + i) % 5 === 0 ? SHEET_COLS[(r + i) % 7] : '#e5e9f2'; roundRectPath(ctx, cx - w / 2 + 10 + i * 29, yy, cell, cell, 5); ctx.fill();
    }
    ctx.fillStyle = '#ef4444'; ctx.fillRect(cx - w / 2, hy, w, 16);
    ctx.fillStyle = '#c9b48a'; roundRectPath(ctx, cx - w / 2 - 14, hy - 10, w + 28, 20, 10); ctx.fill(); // แกนม้วน
    if (u < 1) { ctx.fillStyle = '#ffffff'; circle(ctx, cx, hy + drop, 20); }
    fist();
  }
  if (prop.type === 'suitcase') { // หูจับในมือ ตัวกระเป๋าใต้มือ (ล้อลาก)
    const col = prop.color || '#ff8a3d';
    ctx.fillStyle = '#4a5276'; ctx.fillRect(hx - 4, hy, 8, 34);
    ctx.fillStyle = col; roundRectPath(ctx, hx - 40, hy + 30, 80, 92, 14); ctx.fill();
    ctx.fillStyle = shade(col, 0.18); ctx.fillRect(hx - 22, hy + 38, 8, 76); ctx.fillRect(hx + 14, hy + 38, 8, 76);
    ctx.fillStyle = '#2b2233'; circle(ctx, hx - 26, hy + 126, 7); circle(ctx, hx + 26, hy + 126, 7);
    ctx.fillStyle = '#3d4458'; roundRectPath(ctx, hx - 16, hy - 6, 32, 12, 6); ctx.fill();
    fist();
  }
  if (prop.type === 'magnifier') {
    const L = 62, tip = propTip(arm, L), r = prop.r || 38;
    ctx.strokeStyle = '#7a4a2a'; ctx.lineWidth = 12; ctx.lineCap = 'round'; line(ctx, H0, { x: hx + (tip.x - hx) * 0.55, y: hy + (tip.y - hy) * 0.55 });
    ctx.fillStyle = '#c9cfdb'; circle(ctx, tip.x, tip.y, r + 8);
    ctx.fillStyle = 'rgba(200,236,255,0.85)'; circle(ctx, tip.x, tip.y, r);
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.ellipse(tip.x - r * 0.35, tip.y - r * 0.35, r * 0.25, r * 0.12, -0.7, 0, Math.PI * 2); ctx.fill();
    fist();
  }
  if (prop.type === 'calculator') { // ถือแนวตั้งบนฝ่ามือ ปุ่มสีไม่มีตัวเลข
    const x0 = hx - 38, y0 = hy - 96;
    ctx.fillStyle = '#4a5276'; roundRectPath(ctx, x0, y0, 76, 108, 12); ctx.fill();
    ctx.fillStyle = prop.glow ? '#b6ffcf' : '#9fe3b8'; roundRectPath(ctx, x0 + 8, y0 + 8, 60, 22, 5); ctx.fill();
    const cols = ['#ffd23f', '#f472b6', '#38bdf8', '#ffffff'];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) {
      const lit = prop.press != null && (prop.press % 9) === r * 3 + i;
      ctx.fillStyle = lit ? '#ffffff' : cols[(r + i) % 4]; roundRectPath(ctx, x0 + 9 + i * 21, y0 + 38 + r * 22, 16, 16, 4); ctx.fill();
    }
    ctx.fillStyle = SKN; roundRectPath(ctx, hx - 30, hy - 6, 60, 20, 10); ctx.fill(); // นิ้วรองใต้เครื่อง
    const o = arms[arm.side > 0 ? 'l' : 'r']; // มืออีกข้างกดปุ่ม: วาดนิ้วทับหน้าเครื่อง
    if (o && Math.abs(o.hand.x - hx) < 44 && o.hand.y > y0 - 10 && o.hand.y < y0 + 118) {
      ctx.fillStyle = SKN; circle(ctx, o.hand.x, o.hand.y + 6, 13); roundRectPath(ctx, o.hand.x - 5, o.hand.y - 14, 10, 20, 5); ctx.fill();
    }
  }
  if (prop.type === 'selfieStick') { // ไม้ต่อแนวแขน มือถือที่ปลาย หันจอเข้าหาตัว
    const tip = propTip(arm, prop.len || 120);
    ctx.strokeStyle = '#3d4458'; ctx.lineWidth = 8; ctx.lineCap = 'round'; line(ctx, H0, tip);
    ctx.save(); ctx.translate(tip.x, tip.y); ctx.rotate(tip.a + Math.PI / 2);
    ctx.fillStyle = '#25304a'; roundRectPath(ctx, -26, -46, 52, 84, 9); ctx.fill();
    ctx.fillStyle = '#7cc4ff'; roundRectPath(ctx, -20, -40, 40, 72, 5); ctx.fill();
    if (prop.flash > 0) { ctx.fillStyle = `rgba(255,255,220,${prop.flash})`; circle(ctx, 0, -10, 70 * prop.flash + 20); }
    ctx.restore();
    fist();
  }
  if (prop.type === 'receipt') { receiptStrip(ctx, hx, hy - 6, prop.len || 220, prop.rot || 0); fist(); }
  if (prop.type === 'sunglasses') {
    ctx.fillStyle = '#15131c'; roundRectPath(ctx, hx - 44, hy - 30, 40, 26, 10); ctx.fill(); roundRectPath(ctx, hx + 4, hy - 30, 40, 26, 10); ctx.fill(); ctx.fillRect(hx - 6, hy - 24, 12, 5);
    fist();
  }
  if (prop.type === 'wheel') { // พวงมาลัย: วงรีผ่านมือทั้งสอง แล้ววาดกำปั้นทับขอบ
    const a = arms.l || arm, b = arms.r || arm;
    const cx = (a.hand.x + b.hand.x) / 2, cy = (a.hand.y + b.hand.y) / 2 + 6, rx = Math.abs(b.hand.x - a.hand.x) / 2 + 4;
    ctx.fillStyle = '#1d2240'; roundRectPath(ctx, cx - 16, cy, 32, 160, 10); ctx.fill();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(prop.rot || 0);
    ctx.strokeStyle = '#1d2240'; ctx.lineWidth = 18; ctx.beginPath(); ctx.ellipse(0, 0, rx, 40, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#3a4070'; ctx.beginPath(); ctx.ellipse(0, 4, 34, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.fillStyle = SKN; circle(ctx, a.hand.x, a.hand.y, 14); circle(ctx, b.hand.x, b.hand.y, 14);
  }
  if (prop.type === 'pillow') { // หมอนรถ กอดด้วยสองมือ
    const a = arms.l || arm, b = arms.r || arm;
    const cx = (a.hand.x + b.hand.x) / 2, cy = (a.hand.y + b.hand.y) / 2;
    ctx.fillStyle = prop.color || '#ffd8e8'; ctx.beginPath(); ctx.ellipse(cx, cy - 10, 74, 54, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(cx - 24, cy - 30, 24, 10, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = SKN; circle(ctx, a.hand.x, a.hand.y, 13); circle(ctx, b.hand.x, b.hand.y, 13);
  }
}
/** ใบเสร็จยาว (เส้นแทนตัวอักษร) origin = ขอบบนกึ่งกลาง */
export function receiptStrip(ctx, x, y, len = 220, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.lineTo(40, len);
  for (let i = 0; i <= 8; i++) ctx.lineTo(40 - i * 10, len + (i % 2 ? 8 : 0));
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c3c9d8'; for (let yy = 18; yy < len - 30; yy += 20) ctx.fillRect(-28, yy, yy % 40 ? 40 : 56, 7);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(-28, len - 26, 56, 10);
  ctx.restore();
}
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function shoe(ctx, x, y, side) { ctx.fillStyle = SHOE; ctx.beginPath(); ctx.ellipse(x + side * 6, y, 20, 10, 0, 0, Math.PI * 2); ctx.fill(); }
function line(ctx, a, b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
export function roundRectPath(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// ---- ไรเดอร์: ขาบนรถ + หมวกกันน็อก ----
function drawRideLegs(ctx, c, dir) {
  ctx.lineCap = 'round'; ctx.strokeStyle = c.pants; ctx.lineWidth = 26;
  for (const off of [-10, 10]) {
    const hip = { x: off, y: -36 }, knee = { x: dir * 62 + off * 0.4, y: -44 }, foot = { x: dir * 70 + off * 0.4, y: 22 };
    line(ctx, hip, knee); line(ctx, knee, foot);
    shoe(ctx, foot.x + dir * 6, foot.y + 6, dir);
  }
}
function drawHelmetBack(ctx, c, cy) {
  ctx.fillStyle = c.helmet;
  ctx.beginPath(); ctx.ellipse(0, cy - 6, 80, 88, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(0, cy + 8, 52, 56, 0, 0, Math.PI * 2); ctx.fill();
}
function drawHelmetFront(ctx, c, cy) {
  ctx.fillStyle = shade(c.helmet, 0.12);
  ctx.beginPath(); ctx.ellipse(0, cy - 44, 80, 50, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = 'rgba(190,230,255,0.55)'; // ชิลด์ใสเปิดขึ้น
  roundRectPath(ctx, -62, cy - 84, 124, 34, 16); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; roundRectPath(ctx, -40, cy - 78, 36, 8, 4); ctx.fill();
  ctx.fillStyle = c.helmet; roundRectPath(ctx, -80, cy + 30, 22, 46, 10); ctx.fill(); roundRectPath(ctx, 58, cy + 30, 22, 46, 10); ctx.fill();
}
function drawGoose(ctx, k, t) { // ขนลุก: ขีดสั้นๆ รอบตัว
  ctx.strokeStyle = `rgba(255,255,255,${0.8 * k})`; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (const [x, y, a] of [[-98, -200, 3.6], [-108, -150, 3.2], [98, -200, -0.5], [108, -150, 0]]) {
    const j = Math.sin(t * 30 + x) * 3;
    line(ctx, { x: x + j, y }, { x: x + j + Math.cos(a) * 14, y: y + Math.sin(a) * 14 });
  }
}

// ---- ผีสาวชุดขาว (การ์ตูนตลก ไม่สยดสยอง) ----
/** pose: {x,y,scale,smile:0..1,wave:bool,tilt:rad,blow:0..1,alpha} origin = ปลายชุด */
export function drawGhost(ctx, pose = {}) {
  const { x = 540, y = 1500, scale = 1, smile = 0, wave = false, tilt = 0, blow = 0, alpha = 1 } = pose;
  const t = clock.t;
  const bob = Math.sin(t * 2.4) * 12;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.translate(x, y + bob); ctx.scale(scale, scale);
  // เงาลอย
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(0, 40 - bob, 70, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(tilt * 0.3);
  // ผมด้านหลัง
  ctx.fillStyle = '#1b1726';
  ctx.beginPath(); ctx.moveTo(-70, -330); ctx.quadraticCurveTo(-95 - blow * 60, -200, -80 - blow * 90, -120); ctx.lineTo(80 - blow * 40, -120); ctx.quadraticCurveTo(95, -200, 70, -330); ctx.fill();
  // ชุดยาว ปลายคลื่น
  ctx.fillStyle = '#f7f8ff';
  ctx.beginPath(); ctx.moveTo(-46, -220); ctx.lineTo(46, -220); ctx.quadraticCurveTo(80, -100, 92, 0);
  for (let i = 0; i <= 6; i++) { const xx = 92 - i * 30.6; ctx.lineTo(xx, 8 + Math.sin(t * 5 + i * 1.3) * 10 + (i % 2) * 10); }
  ctx.quadraticCurveTo(-80, -100, -46, -220); ctx.fill();
  ctx.fillStyle = '#dfe3f5'; ctx.beginPath(); ctx.moveTo(-10, -200); ctx.quadraticCurveTo(-20, -90, -30, 0); ctx.lineTo(-12, 0); ctx.quadraticCurveTo(-4, -100, -10, -200); ctx.fill();
  // แขน
  ctx.lineCap = 'round';
  const shL = { x: -42, y: -205 }, shR = { x: 42, y: -205 };
  const wv = Math.sin(t * 3) * 22;
  const hR = wave ? { x: 110 + wv, y: -320 } : { x: 56, y: -110 };
  const armR = ik2(shR, hR, 55, 52, wave ? 1 : -1);
  const armL = ik2(shL, { x: -56, y: -110 }, 55, 52, 1);
  for (const a of [armL, armR]) {
    ctx.strokeStyle = '#eceffd'; ctx.lineWidth = 24; line(ctx, a === armL ? shL : shR, a.elbow); line(ctx, a.elbow, a.hand);
    ctx.fillStyle = '#cfe6f5'; circle(ctx, a.hand.x, a.hand.y, 12);
  }
  // หัว
  ctx.save(); ctx.translate(0, -292); ctx.rotate(tilt);
  ctx.fillStyle = '#cfe6f5'; ctx.beginPath(); ctx.ellipse(0, 0, 62, 70, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1b1726';
  ctx.beginPath(); ctx.ellipse(0, -18, 70, 60, 0, Math.PI, 0); ctx.fill();
  if (smile > 0) {
    // แหวกผมสองข้าง เห็นหน้า: ตากลม แก้มชมพู ยิ้มกว้าง ฟันขาวเรียบ
    ctx.fillStyle = '#1b1726';
    roundRectPath(ctx, -78, -24, 26, 120, 13); ctx.fill(); roundRectPath(ctx, 52, -24, 26, 120, 13); ctx.fill();
    ctx.fillStyle = '#2b2233'; circle(ctx, -22, -6, 8); circle(ctx, 22, -6, 8);
    ctx.fillStyle = '#fff'; circle(ctx, -20, -9, 3); circle(ctx, 24, -9, 3);
    ctx.fillStyle = 'rgba(245,130,160,0.55)'; circle(ctx, -40, 18, 11); circle(ctx, 40, 18, 11);
    const mw = 22 + 34 * smile;
    ctx.fillStyle = '#7a2b3a';
    ctx.beginPath(); ctx.moveTo(-mw, 16); ctx.quadraticCurveTo(0, 30 + 34 * smile, mw, 16); ctx.quadraticCurveTo(0, 24, -mw, 16); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(-mw * 0.92, 18); ctx.quadraticCurveTo(0, 26, mw * 0.92, 18); ctx.quadraticCurveTo(0, 32 + 10 * smile, -mw * 0.92, 18); ctx.fill();
  } else {
    // ผมปิดหน้า เห็นแค่ตากลมจุดขาว
    ctx.beginPath(); ctx.moveTo(-70, -20);
    for (let i = 0; i <= 7; i++) ctx.lineTo(-70 + i * 20, 70 + (i % 2) * 14 + Math.sin(t * 3 + i) * 3 + blow * (i * 4));
    ctx.lineTo(70, -20); ctx.fill();
    ctx.fillStyle = '#ffffff'; circle(ctx, -22, 2, 7); circle(ctx, 22, 2, 7);
  }
  ctx.restore();
  ctx.restore();
}
