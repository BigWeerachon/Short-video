// ตัวละคร 2D flat vector + 2-bone IK (คู่มือขั้นที่ 3, lessons L03 L04 L05 L06)
import { CAST } from './cast.js';

export const EXPRS = ['happy', 'smug', 'scared', 'shock', 'sad', 'cry', 'laugh', 'pale', 'angry', 'sleep', 'swirl', 'sweat'];
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
const ARM = {
  down: { x: 50, y: -112, bend: 'out' }, hips: { x: 72, y: -128, bend: 'out' }, up: { x: 62, y: -335, bend: 'out' },
  cheer: { x: 100, y: -300, bend: 'out' }, wave: { x: 100, y: -300, bend: 'out', wave: true }, point: { x: 135, y: -215, bend: 'down' },
  'cover-mouth': { x: 16, y: -262, bend: 'down' }, 'cover-eyes': { x: 26, y: -298, bend: 'down' }, cheek: { x: 52, y: -272, bend: 'down' },
  phone: { x: 22, y: -205, bend: 'down' }, fold: { x: -22, y: -165, bend: 'down' }, shrug: { x: 88, y: -218, bend: 'down' },
  hold: { x: 58, y: -165, bend: 'down' }, scared: { x: 34, y: -250, bend: 'down' }, reach: { x: 140, y: -240, bend: 'down' },
};

function armTarget(spec, side, t) {
  if (spec && typeof spec === 'object') return { x: spec.x, y: spec.y, bend: spec.bend || 'down' };
  const p = ARM[spec || 'down'] || ARM.down;
  const wob = p.wave ? Math.sin(t * 9) * 18 : 0;
  return { x: side * (p.x + wob), y: p.y, bend: p.bend };
}

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
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.scale * (c.size || 1), p.scale * (c.size || 1));
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
    arms[k] = { ...ik2(sh[k], tg, 55, 52, sign), sh: sh[k], front: p.armsFront ?? tg.y < Y(-228), side };
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
  // หัว
  drawHead(ctx, c, p, t, Y(-292));
  // แขนหน้า (มือขึ้นหน้า → วาดทับหัว)
  for (const k of ['l', 'r']) if (arms[k].front) drawArm(ctx, c, arms[k]);
  if (p.prop) drawProp(ctx, p.prop, arms.r);
  ctx.restore();
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
  ctx.strokeStyle = SKIN; ctx.lineWidth = 17; line(ctx, mid, a.hand);
  ctx.fillStyle = SKIN; circle(ctx, a.hand.x, a.hand.y, 13);
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
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.ellipse(0, cy, 64, 72, 0, 0, Math.PI * 2); ctx.fill();
  if (p.expr === 'pale') {
    const g = ctx.createLinearGradient(0, cy - 72, 0, cy + 10);
    g.addColorStop(0, 'rgba(120,170,230,0.75)'); g.addColorStop(1, 'rgba(120,170,230,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, cy, 64, 72, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (p.expr === 'angry') { ctx.fillStyle = 'rgba(230,80,60,0.18)'; ctx.beginPath(); ctx.ellipse(0, cy, 64, 72, 0, 0, Math.PI * 2); ctx.fill(); }
  // หู
  ctx.fillStyle = SKIN; circle(ctx, -63, cy + 4, 11); circle(ctx, 63, cy + 4, 11);
  if (c.helmet) drawHelmetBack(ctx, c, cy); else drawHair(ctx, c, cy);
  drawFace(ctx, c, p, t, cy);
  if (c.helmet) drawHelmetFront(ctx, c, cy);
  if (p.goose) drawGoose(ctx, p.goose, t);
  if (c.glasses) {
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
  } else {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * ex, ey, 7, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; circle(ctx, s * ex + 2, ey - 3, 2.4); ctx.fillStyle = '#2b2233'; }
  }
  // คิ้ว
  ctx.lineWidth = 4.5;
  const brow = { sweat: [-6, 1], angry: [8, -1], sad: [-7, 1], cry: [-7, 1], scared: [-6, 1], pale: [-6, 1], shock: [0, 1] }[e];
  if (brow) for (const s of [-1, 1]) line(ctx, { x: s * ex - 11, y: ey - 22 + (s < 0 ? brow[0] : -brow[0]) * 0.5 }, { x: s * ex + 11, y: ey - 22 - (s < 0 ? brow[0] : -brow[0]) * 0.5 });
  // แก้ม
  if (['happy', 'laugh', 'smug'].includes(e)) { ctx.fillStyle = 'rgba(240,120,130,0.35)'; circle(ctx, -40, cy + 18, 10); circle(ctx, 40, cy + 18, 10); }
  // ปาก
  const my = cy + 32;
  const open = p.talk ? (clock.mouth / 9) * 18 : 0;
  ctx.fillStyle = '#7a2b3a'; ctx.strokeStyle = '#2b2233'; ctx.lineWidth = 4.5;
  if (open > 1.5) { ctx.beginPath(); ctx.ellipse(0, my, 11 + open * 0.2, open * 0.6 + 2, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (e === 'laugh') { ctx.beginPath(); ctx.arc(0, my - 4, 16, 0, Math.PI); ctx.fill(); }
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

function drawProp(ctx, prop, arm) {
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
