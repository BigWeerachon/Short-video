// ฉากและองค์ประกอบ flat vector สีสด ไม่มีเส้นขอบ (คู่มือขั้นที่ 5)
import { W, H, rand, pop, clamp } from './core.js';
import { roundRectPath } from './rig.js';
import { fitText } from './subs.js';

export const SKIES = {
  night: ['#16204a', '#2b3a7a'], dusk: ['#3a2a6e', '#5d40a0'], day: ['#7cc8ff', '#d4f0ff'],
  sunset: ['#ff9f6b', '#ffd9a3'], studio: ['#4a2f8e', '#6b46b9'], warm: ['#ffe2bd', '#fff4e3'],
  blue: ['#3d7be0', '#7fb2ff'], mint: ['#c8f3e6', '#effcf7'],
  neonStudio: ['#2a1450', '#4b2384'], digitalSky: ['#7fd0ff', '#e4f6ff'], roadNight: ['#0c1433', '#1d2a5c'], hotel: ['#cfe9ff', '#eef8ff'],
};
const HILLS = {
  night: ['#2c3a73', '#223060', '#1a2550'], dusk: ['#4c3a8a', '#3f2f78', '#33266a'], day: ['#a9e0b8', '#7fcf98', '#5cb87c'],
  sunset: ['#e98a6a', '#c96f5d', '#a75a55'], warm: ['#f3cfa0', '#e6b986', '#d7a571'],
};

export function sky(ctx, preset = 'day') {
  const [a, b] = SKIES[preset] || SKIES.day;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, a); g.addColorStop(1, b);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

export function stars(ctx, seed = 7, n = 70) {
  const r = rand(seed);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(r() * W, r() * H * 0.45, 1 + r() * 2.2, 0, Math.PI * 2); ctx.fill(); }
}

export function moon(ctx, x = 820, y = 260, r = 60) {
  ctx.fillStyle = '#fff6d6'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.arc(x + r * 0.45, y - r * 0.2, r * 0.85, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

/** ดวงจันทร์เสี้ยวบนท้องฟ้า (วาดบน layer แยกไม่ให้ลบท้องฟ้า) */
export function crescent(ctx, x = 820, y = 260, r = 60, skyColor = '#16204a') {
  ctx.fillStyle = '#fff6d6'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skyColor; ctx.beginPath(); ctx.arc(x + r * 0.45, y - r * 0.25, r * 0.85, 0, Math.PI * 2); ctx.fill();
}

export function sun(ctx, x = 820, y = 300, r = 70) {
  ctx.fillStyle = 'rgba(255,240,150,0.35)'; ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

export function hills(ctx, preset = 'day', baseY = 1150) {
  const cols = HILLS[preset] || HILLS.day;
  cols.forEach((c, i) => {
    const y = baseY + i * 70, amp = 90 - i * 20;
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y - amp * (0.5 + 0.5 * Math.sin(x / (230 - i * 40) + i * 1.7)));
    ctx.lineTo(W, H); ctx.fill();
  });
}

export function pines(ctx, y = 1380, color = '#1f2b55', seed = 3, n = 13) {
  const r = rand(seed);
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const x = (i + r() * 0.6) * (W / (n - 1)) - 30, h = 150 + r() * 110, w = h * 0.42;
    for (let k = 0; k < 3; k++) {
      const ty = y - h + k * h * 0.28;
      ctx.beginPath(); ctx.moveTo(x, ty); ctx.lineTo(x - w * (0.6 + k * 0.2), ty + h * 0.45); ctx.lineTo(x + w * (0.6 + k * 0.2), ty + h * 0.45); ctx.fill();
    }
  }
}

export function ground(ctx, y = 1450, color = '#2a2f55') { ctx.fillStyle = color; ctx.fillRect(0, y, W, H - y); }

export function tent(ctx, x, y, w = 340, color = '#f08a3c', opts = {}) {
  const h = w * 0.62;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.quadraticCurveTo(x - w * 0.2, y - h * 0.7, x, y - h); ctx.quadraticCurveTo(x + w * 0.2, y - h * 0.7, x + w / 2, y); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x - w * 0.14, y); ctx.lineTo(x + w * 0.14, y); ctx.fill();
  if (opts.glow) { ctx.fillStyle = 'rgba(255,230,140,0.35)'; ctx.beginPath(); ctx.moveTo(x, y - h * 0.8); ctx.lineTo(x - w * 0.12, y); ctx.lineTo(x + w * 0.12, y); ctx.fill(); }
}

/** โต๊ะสตูดิโอ — วาดหลังตัวผู้เล่าเพื่อทับขา (ผู้เล่ายืนหลังโต๊ะ) */
export function desk(ctx, y = 1380, color = '#7d55c7') {
  ctx.fillStyle = color; ctx.fillRect(0, y, W, 34);
  ctx.fillStyle = '#5f3fa3'; ctx.fillRect(40, y + 34, W - 80, H - y);
}

export function candle(ctx, x, y, t = 0) {
  ctx.fillStyle = '#fff3d6'; roundRectPath(ctx, x - 12, y - 70, 24, 70, 6); ctx.fill();
  const f = 1 + Math.sin(t * 13 + x) * 0.08;
  ctx.fillStyle = '#ffcc4d'; ctx.beginPath(); ctx.ellipse(x, y - 86, 9 * f, 16 * f, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff4b0'; ctx.beginPath(); ctx.ellipse(x, y - 82, 4, 8, 0, 0, Math.PI * 2); ctx.fill();
}

/** ป้ายหัวข้อแคปซูลด้านบน — k = ความคืบหน้าเด้งเข้า 0..1 */
export function titleCapsule(ctx, text, { x = W / 2, y = 330, bg = '#ffd23f', fg = '#3b2479', size = 64, k = 1 } = {}) {
  const s = fitText(ctx, text, 860, size);
  ctx.font = `700 ${s}px Kanit`;
  const w = ctx.measureText(text).width + 70, h = s + 44;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop(k), pop(k));
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; roundRectPath(ctx, -w / 2 + 6, -h / 2 + 8, w, h, h / 2); ctx.fill();
  ctx.fillStyle = bg; roundRectPath(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill();
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 4);
  ctx.restore();
}

/** การ์ดอธิบาย: ขาวมุมมน แถบสีซ้าย หัวข้อ + คำอธิบาย */
export function infoCard(ctx, { x = W / 2, y = 500, w = 760, title = '', sub = '', accent = '#2f6fdf', k = 1 } = {}) {
  const h = sub ? 170 : 120;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop(k), pop(k)); ctx.globalAlpha = clamp(k * 3, 0, 1);
  ctx.fillStyle = '#ffffff'; roundRectPath(ctx, -w / 2, -h / 2, w, h, 22); ctx.fill();
  ctx.fillStyle = accent; roundRectPath(ctx, -w / 2, -h / 2, 16, h, 8); ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const ts = fitText(ctx, title, w - 80, 52); ctx.font = `700 ${ts}px Kanit`; ctx.fillStyle = accent;
  ctx.fillText(title, 8, sub ? -28 : 2);
  if (sub) { const ss = fitText(ctx, sub, w - 80, 34, 500); ctx.font = `500 ${ss}px Kanit`; ctx.fillStyle = '#4a4a5c'; ctx.fillText(sub, 8, 36); }
  ctx.restore();
}

/** ลูกโป่งคำพูด (ใช้กับเสียง/คำอุทานที่บทพูดจริง) */
export function bubble(ctx, text, { x = W / 2, y = 700, tail = 'down', k = 1, size = 54 } = {}) {
  const s = fitText(ctx, text, 700, size);
  ctx.font = `700 ${s}px Kanit`;
  const w = ctx.measureText(text).width + 60, h = s + 40;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop(k), pop(k));
  ctx.fillStyle = '#ffffff'; roundRectPath(ctx, -w / 2, -h / 2, w, h, 26); ctx.fill();
  ctx.beginPath();
  if (tail === 'down') { ctx.moveTo(-18, h / 2 - 2); ctx.lineTo(0, h / 2 + 30); ctx.lineTo(18, h / 2 - 2); }
  ctx.fill();
  ctx.fillStyle = '#26203a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3);
  ctx.restore();
}

/** การ์ดขาวมุมมนพร้อมโลโก้ PAAK IN จัดกึ่งกลาง (กฎถาวรข้อ 7) */
export function logoCard(ctx, img, { x = W / 2, y = 420, w = 560, k = 1 } = {}) {
  if (!img) return;
  const lw = w - 80, lh = lw * (img.naturalHeight / img.naturalWidth), h = lh + 70;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop(k), pop(k));
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; roundRectPath(ctx, -w / 2 + 6, -h / 2 + 10, w, h, 30); ctx.fill();
  ctx.fillStyle = '#ffffff'; roundRectPath(ctx, -w / 2, -h / 2, w, h, 30); ctx.fill();
  ctx.drawImage(img, -lw / 2, -lh / 2, lw, lh);
  ctx.restore();
}

/** มือถือหน้าจอจองโรงแรม PAAKIN — step: 0 รายการ, 1 กดจอง, 2 จองสำเร็จ */
export function phone(ctx, { x = W / 2, y = 1000, s = 1, step = 0, logo = null, price = '฿690 / คืน' } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#1f2a44'; roundRectPath(ctx, -170, -330, 340, 660, 44); ctx.fill();
  ctx.fillStyle = '#ffffff'; roundRectPath(ctx, -150, -300, 300, 600, 30); ctx.fill();
  if (logo) { const lw = 200; ctx.drawImage(logo, -lw / 2, -275, lw, lw * logo.naturalHeight / logo.naturalWidth); }
  ctx.fillStyle = '#5aa0f0'; roundRectPath(ctx, -125, -195, 250, 150, 16); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-125, -60); ctx.lineTo(-20, -150); ctx.lineTo(125, -90); ctx.lineTo(125, -45); ctx.lineTo(-125, -45); ctx.fill();
  ctx.fillStyle = '#2b2b3d'; ctx.font = '500 22px Kanit'; ctx.textAlign = 'center'; ctx.fillText('โรงแรมใกล้คุณ · 1.2 กม.', 0, -10);
  ctx.fillStyle = '#ff7a2f'; ctx.font = '700 30px Kanit'; ctx.fillText(price, 0, 30);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = step >= 2 ? '#d7f5e3' : '#eef1f6'; roundRectPath(ctx, -125, 60 + i * 44, 250, 30, 10); ctx.fill();
    if (step >= 2) { ctx.fillStyle = '#22a35a'; ctx.font = '700 22px Kanit'; ctx.fillText('✓', -105, 83 + i * 44); }
  }
  ctx.fillStyle = step >= 2 ? '#22a35a' : '#2f6fdf';
  roundRectPath(ctx, -110, 215, 220, 56, 28); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = '700 28px Kanit'; ctx.fillText(step >= 2 ? 'จองสำเร็จ ✓' : 'จองเลย', 0, 253);
  if (step === 1) { ctx.fillStyle = 'rgba(47,111,223,0.35)'; ctx.beginPath(); ctx.arc(0, 243, 44, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

/** รูปในกรอบ (ภาพจำ/ความทรงจำ) — ตัวละครด้านในต้องย่อให้อยู่ครบในกรอบ (L10) */
export function photoFrame(ctx, { x = W / 2, y = 700, w = 720, h = 520, preset = 'day', k = 1 } = {}, inner) {
  ctx.save(); ctx.translate(x, y); ctx.scale(pop(k), pop(k));
  ctx.fillStyle = '#ffffff'; roundRectPath(ctx, -w / 2 - 22, -h / 2 - 22, w + 44, h + 44, 18); ctx.fill();
  ctx.save(); roundRectPath(ctx, -w / 2, -h / 2, w, h, 8); ctx.clip();
  ctx.translate(-w / 2, -h / 2); ctx.scale(w / W, h / (H * 0.5));
  sky(ctx, preset);
  if (preset === 'day') sun(ctx, 800, 260, 80);
  hills(ctx, preset, 700);
  if (inner) inner(ctx);
  ctx.restore(); ctx.restore();
}

/** ฉากปิดท้าย End card (กฎถาวรข้อ 1) */
export function endCard(ctx, img, k = 1) {
  ctx.fillStyle = '#eef6ff'; ctx.fillRect(0, 0, W, H);
  if (!img) return;
  ctx.save(); ctx.globalAlpha = clamp(k * 2.5, 0, 1);
  const s = 0.96 + 0.04 * pop(clamp(k * 1.5, 0, 1));
  ctx.translate(W / 2, H / 2); ctx.scale(s, s);
  ctx.drawImage(img, -W / 2, -H / 2, W, H);
  ctx.restore();
}

// ===== ชุดฉาก "ออเดอร์เที่ยงคืน" (ใช้ซ้ำได้) =====
const R = (ctx, x, y, w, h, r, c) => { ctx.fillStyle = c; roundRectPath(ctx, x, y, w, h, r); ctx.fill(); };
const dot = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };

/** สตูดิโอนีออน: ม่วงเข้ม + แถบนีออนส้ม; dim 0..1 หรี่ไฟ, flicker = กะพริบ, bright เพิ่มความสว่าง */
export function neonStudio(ctx, { t = 0, dim = 0, flicker = false, bright = 0 } = {}) {
  sky(ctx, 'neonStudio');
  const on = flicker ? (Math.sin(t * 23) > -0.6 ? 1 : 0.35) : 1;
  const a = (0.9 - dim * 0.55) * on;
  for (const [y, c] of [[260, '255,140,40'], [330, '255,90,180']]) {
    ctx.fillStyle = `rgba(${c},${a * 0.25})`; roundRectPath(ctx, 60, y - 18, W - 120, 46, 23); ctx.fill();
    ctx.fillStyle = `rgba(${c},${a})`; roundRectPath(ctx, 80, y, W - 160, 12, 6); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 6; i++) ctx.fillRect(90 + i * 180, 420, 90, 900);
  if (dim > 0) { ctx.fillStyle = `rgba(30,10,60,${dim * 0.45})`; ctx.fillRect(0, 0, W, H); }
  if (bright > 0) { ctx.fillStyle = `rgba(255,200,150,${bright * 0.12})`; ctx.fillRect(0, 0, W, H); }
}

/** ฟ้าดิจิทัล: ฟ้าใส + กริดจางๆ */
export function digitalSky(ctx, { t = 0 } = {}) {
  sky(ctx, 'digitalSky');
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
  const o = (t * 20) % 90;
  for (let x = -90 + o; x < W + 90; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = o; y < H; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const r = rand(5);
  for (let i = 0; i < 14; i++) dot(ctx, r() * W, r() * H, 4 + r() * 6, 'rgba(255,255,255,0.6)');
}

/** ถนนกลางป่ายามดึก: scroll = เลื่อน parallax (px), poles = เสาไฟดับ, speed 0..1 = เส้นความเร็ว, roadY = ขอบถนนบน */
export function roadNight(ctx, { scroll = 0, poles = false, speed = 0, roadY = 1300, t = 0, sway = 0 } = {}) {
  sky(ctx, 'roadNight'); stars(ctx, 21, 50);
  ctx.globalAlpha = 0.6; crescent(ctx, 820, 260, 46, SKIES.roadNight[0]); ctx.globalAlpha = 1;
  for (const [k, col, y, seed] of [[0.3, '#16204a', roadY - 40, 4], [0.6, '#0b1130', roadY + 10, 9]]) {
    ctx.save(); const off = -((scroll * k) % W);
    for (const dx of [off, off + W]) { ctx.save(); ctx.translate(dx, 0); if (sway) { ctx.translate(0, y); ctx.transform(1, 0, Math.sin(t * 2 + k * 5) * 0.04 * sway, 1, 0, 0); ctx.translate(0, -y); } pines(ctx, y, col, seed, 9); ctx.restore(); }
    ctx.restore();
  }
  ctx.fillStyle = '#232843'; ctx.fillRect(0, roadY, W, H - roadY);
  ctx.fillStyle = '#2e3454'; ctx.fillRect(0, roadY, W, 14);
  ctx.fillStyle = 'rgba(255,230,140,0.7)';
  const dOff = -(scroll % 220);
  for (let x = dOff; x < W; x += 220) roundRectPath(ctx, x, roadY + 150, 110, 14, 7), ctx.fill();
  if (poles) {
    const pOff = -((scroll * 0.9) % 700);
    for (let x = pOff + 200; x < W + 200; x += 700) {
      R(ctx, x - 9, roadY - 520, 18, 530, 8, '#3a4060');
      R(ctx, x - 9, roadY - 520, 90, 14, 7, '#3a4060');
      R(ctx, x + 60, roadY - 512, 40, 20, 10, '#555c7a'); // หลอดดับ
    }
  }
  if (speed > 0) speedLines(ctx, { k: speed, t });
}

/** เส้นความเร็วแนวนอน */
export function speedLines(ctx, { k = 1, t = 0, y0 = 300, y1 = 1600, seed = 13 } = {}) {
  const r = rand(seed);
  ctx.fillStyle = `rgba(255,255,255,${0.35 * k})`;
  for (let i = 0; i < 18; i++) {
    const y = y0 + r() * (y1 - y0), len = 120 + r() * 260 * k;
    const x = W - ((t * (1400 + r() * 900) + r() * W * 2) % (W + len + 200));
    roundRectPath(ctx, x, y, len, 5 + k * 4, 4); ctx.fill();
  }
}

/** สกู๊ตเตอร์ส่งอาหาร origin = กึ่งกลางพื้นใต้รถ; view 'side'|'back'; light = เปิดไฟหน้า; beam = ความยาวลำแสง
 *  คืนค่า {seat:{x,y}} (พิกัดในฉาก) ไว้วางตัวละคร mode 'ride' */
export function motorcycle(ctx, { x = 540, y = 1500, s = 1, dir = 1, view = 'side', t = 0, light = true, beam = 700, lean = 0, color = '#16b85a', box = true } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(lean); ctx.scale(s * dir, s);
  if (view === 'back') {
    dot(ctx, 0, -40, 40, '#1d1f2c'); R(ctx, -70, -190, 140, 120, 30, color);
    R(ctx, -26, -110, 52, 18, 8, '#ff5a5a'); R(ctx, -120, -230, 240, 14, 7, '#3a3f55');
    if (box) R(ctx, -70, -320, 140, 120, 16, shadeHex(color));
    ctx.restore(); return { seat: { x, y: y - 190 * s } };
  }
  if (light) { // ลำแสงออกจากหัวโคม (L05)
    const g = ctx.createLinearGradient(130, 0, 130 + beam, 0);
    g.addColorStop(0, 'rgba(255,240,170,0.8)'); g.addColorStop(1, 'rgba(255,240,170,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(140, -168); ctx.lineTo(140 + beam, -168 - beam * 0.2); ctx.lineTo(140 + beam, -150 + beam * 0.32); ctx.lineTo(140, -146); ctx.fill();
  }
  const wheel = (wx) => { dot(ctx, wx, -46, 46, '#1d1f2c'); dot(ctx, wx, -46, 20, '#9aa3bf'); ctx.save(); ctx.translate(wx, -46); ctx.rotate(t * 14); R(ctx, -3, -20, 6, 40, 3, '#5d6580'); ctx.restore(); };
  wheel(-110); wheel(110);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-150, -90); ctx.quadraticCurveTo(-150, -150, -90, -150); ctx.lineTo(30, -140); ctx.lineTo(80, -90); ctx.lineTo(150, -90); ctx.lineTo(150, -60); ctx.lineTo(-150, -60); ctx.fill();
  R(ctx, 80, -230, 30, 150, 14, color);              // คอรถ
  R(ctx, -120, -168, 130, 26, 13, '#2b2f45');        // เบาะ
  R(ctx, 70, -244, 70, 14, 7, '#3a3f55');            // แฮนด์
  R(ctx, 110, -178, 34, 30, 10, '#fff4b0');          // หัวโคม
  if (box) { R(ctx, -190, -290, 120, 110, 14, shadeHex(color)); R(ctx, -180, -270, 100, 10, 5, 'rgba(255,255,255,0.4)'); }
  ctx.restore();
  return { seat: { x: x - 50 * s * dir, y: y - 150 * s }, bar: { x: x + 105 * s * dir, y: y - 237 * s } };
}
function shadeHex(hex) { const n = parseInt(hex.slice(1), 16); const f = (c) => Math.round(c * 0.78).toString(16).padStart(2, '0'); return `#${f(n >> 16)}${f((n >> 8) & 255)}${f(n & 255)}`; }

/** กระจกมองหลังวงรี + ก้าน; inner(ctx) วาดในพิกัดฉากเต็ม (ถูก clip) */
export function mirrorView(ctx, { x = W / 2, y = 800, w = 860, h = 600 } = {}, inner) {
  R(ctx, x - 20, y + h / 2 - 10, 40, 600, 20, '#4a5068');
  ctx.fillStyle = '#6b7290'; ctx.beginPath(); ctx.ellipse(x, y, w / 2 + 30, h / 2 + 30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.clip();
  ctx.translate(x - W / 2, y - H / 2 * 0.62); ctx.scale(1, 0.62);
  if (inner) inner(ctx);
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.ellipse(x - w * 0.2, y - h * 0.25, w * 0.25, h * 0.12, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** ห้องโรงแรม: ผนังฟ้าอ่อน หน้าต่าง (dawn 0 มืด → 1 เช้า) แอร์ + ลมเย็น (cool 0..1) เตียง; ตัวละครวาดระหว่าง bed() กับ blanket() */
export function hotelRoom(ctx, { t = 0, dawn = 0, cool = 0, door = false } = {}) {
  sky(ctx, 'hotel');
  ctx.fillStyle = '#b9dcf5'; ctx.fillRect(0, 1380, W, H - 1380);
  ctx.fillStyle = '#a3cdec'; ctx.fillRect(0, 1380, W, 16);
  // หน้าต่าง
  R(ctx, 600, 380, 380, 440, 24, '#ffffff');
  const g = ctx.createLinearGradient(0, 400, 0, 800);
  const mix = (a, b) => a.map((v, i) => Math.round(v + (b[i] - v) * dawn));
  g.addColorStop(0, `rgb(${mix([18, 28, 74], [255, 196, 140])})`); g.addColorStop(1, `rgb(${mix([43, 58, 122], [190, 230, 255])})`);
  ctx.fillStyle = g; roundRectPath(ctx, 620, 400, 340, 400, 14); ctx.fill();
  if (dawn > 0.4) dot(ctx, 790, 760 - dawn * 160, 46, `rgba(255,224,120,${dawn})`);
  else { ctx.globalAlpha = 1 - dawn * 2; dot(ctx, 880, 470, 24, '#fff6d6'); ctx.globalAlpha = 1; }
  R(ctx, 784, 400, 12, 400, 6, '#ffffff'); R(ctx, 620, 594, 340, 12, 6, '#ffffff');
  // แอร์
  R(ctx, 90, 330, 420, 120, 26, '#ffffff'); R(ctx, 120, 420, 360, 12, 6, '#d7e6f3'); dot(ctx, 470, 360, 7, '#22c55e');
  if (cool > 0) {
    ctx.strokeStyle = `rgba(120,190,255,${0.8 * cool})`; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const yy = 470 + i * 40, o = (t * 120 + i * 50) % 160; ctx.beginPath(); ctx.moveTo(140 + i * 80, yy + o * 0.3); ctx.quadraticCurveTo(200 + i * 80, yy + 30 + o * 0.3, 160 + i * 80, yy + 70 + o * 0.3); ctx.stroke(); }
    for (let i = 0; i < 6; i++) snowflake(ctx, 150 + i * 60, 520 + ((t * 90 + i * 70) % 300), 10, cool);
  }
  if (door) { R(ctx, 70, 760, 240, 640, 16, '#f5d9b0'); dot(ctx, 270, 1080, 12, '#c79a5a'); }
}
export function snowflake(ctx, x, y, r = 10, a = 1) {
  ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 3;
  for (let k = 0; k < 3; k++) { const an = k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(x - Math.cos(an) * r, y - Math.sin(an) * r); ctx.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); ctx.stroke(); }
}
/** เตียง (วาดก่อนตัวละคร) */
export function bed(ctx, { x = 540, y = 1560, w = 820 } = {}) {
  R(ctx, x - w / 2, y - 330, 40, 330, 16, '#8ab6dc');
  R(ctx, x - w / 2, y - 160, w, 160, 26, '#ffffff');
  R(ctx, x - w / 2 + 50, y - 220, 220, 80, 36, '#f4f7ff');
}
/** ผ้าห่ม (วาดหลังตัวละคร) top = ขอบบนผ้าห่ม */
export function blanket(ctx, { x = 540, y = 1560, w = 820, top = 1380 } = {}) {
  ctx.fillStyle = '#5fa8ee';
  ctx.beginPath(); ctx.moveTo(x - w / 2 + 40, y); ctx.lineTo(x - w / 2 + 40, top + 30); ctx.quadraticCurveTo(x - w / 2 + 40, top, x - w / 2 + 90, top);
  ctx.quadraticCurveTo(x, top - 30, x + w / 2 - 20, top + 10); ctx.lineTo(x + w / 2, y); ctx.fill();
  ctx.fillStyle = '#4b93d8'; ctx.fillRect(x - w / 2 + 40, top + 50, w - 40, 22);
}

/** นาฬิกาปลุกดิจิทัล 02:00 (prop) */
export function clock0200(ctx, { x = 800, y = 600, s = 1, k = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * pop(k), s * pop(k));
  R(ctx, -150, -90, 300, 180, 40, '#ff7a45'); R(ctx, -120, -62, 240, 124, 22, '#1d1f2c');
  dot(ctx, -110, -96, 22, '#ffd23f'); dot(ctx, 110, -96, 22, '#ffd23f');
  ctx.fillStyle = '#7dffb0'; ctx.font = '700 84px Kanit'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('02:00', 0, 6);
  ctx.restore();
}

/** มือถือไม่มีตัวหนังสือ — screen: 'order' (ชานมไข่มุก+หมุด) | 'hotel' (โลโก้+รูป+การ์ดห้อง) | 'done' (ติ๊กถูก)
 *  k = ความคืบหน้าองค์ประกอบ, tap = {x,y} นิ้ว/วงแตะ, logo = img */
export function phoneScreen(ctx, { x = W / 2, y = 900, s = 1, screen = 'order', k = 1, k2 = 0, tap = null, logo = null, rot = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  R(ctx, -170, -330, 340, 660, 44, '#1f2a44');
  ctx.save(); roundRectPath(ctx, -150, -300, 300, 600, 30); ctx.clip();
  ctx.fillStyle = screen === 'order' ? '#f0fff6' : '#ffffff'; ctx.fillRect(-150, -300, 300, 600);
  if (screen === 'order') {
    ctx.fillStyle = '#16b85a'; ctx.fillRect(-150, -300, 300, 70);
    // ชานมไข่มุก
    ctx.save(); ctx.translate(0, -130); ctx.scale(pop(k), pop(k));
    dot(ctx, 0, 0, 80, '#ffe8c8');
    ctx.fillStyle = '#c99561'; ctx.beginPath(); ctx.moveTo(-36, -40); ctx.lineTo(36, -40); ctx.lineTo(26, 55); ctx.lineTo(-26, 55); ctx.fill();
    R(ctx, -42, -52, 84, 16, 8, '#ffffff'); R(ctx, 6, -92, 10, 50, 5, '#ff7aa8');
    for (let i = 0; i < 5; i++) dot(ctx, -16 + (i % 3) * 16, 40 - Math.floor(i / 3) * 14, 7, '#3b2a22');
    ctx.restore();
    // แผนที่ + หมุด
    ctx.globalAlpha = clamp(k2 * 3, 0, 1);
    R(ctx, -125, 0, 250, 270, 20, '#d9f1e1');
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-100, 240); ctx.quadraticCurveTo(-40, 120, 40, 160); ctx.quadraticCurveTo(100, 180, 80, 60); ctx.stroke();
    ctx.fillStyle = '#2f7a4a'; for (let i = 0; i < 5; i++) { const px = -100 + i * 48, py = 40 + (i % 2) * 30; ctx.beginPath(); ctx.moveTo(px, py - 24); ctx.lineTo(px - 14, py + 6); ctx.lineTo(px + 14, py + 6); ctx.fill(); }
    pin(ctx, 80, 60 - 20 * (1 - pop(k2)), '#ff4d6d');
    ctx.globalAlpha = 1;
  } else if (screen === 'hotel' || screen === 'done') {
    if (logo) { ctx.globalAlpha = clamp(k * 3, 0, 1); const lw = 180 * pop(k); ctx.drawImage(logo, -lw / 2, -280, lw, lw * logo.naturalHeight / logo.naturalWidth); ctx.globalAlpha = 1; }
    R(ctx, -125, -200, 250, 140, 16, '#5aa0f0');
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-125, -80); ctx.lineTo(-30, -160); ctx.lineTo(125, -100); ctx.lineTo(125, -60); ctx.lineTo(-125, -60); ctx.fill();
    // การ์ดห้อง (เด้งตาม k2) + หมุด "ใกล้ที่สุด"
    for (let i = 0; i < 2; i++) {
      const kk = clamp(k2 * 2 - i * 0.5, 0, 1); if (kk <= 0) continue;
      ctx.save(); ctx.translate(0, -10 + i * 130); ctx.scale(pop(kk), pop(kk));
      R(ctx, -125, 0, 250, 110, 18, i === 0 ? '#eaf4ff' : '#f2f4f8');
      R(ctx, -110, 14, 90, 82, 12, '#9cc9f5'); R(ctx, -100, 60, 70, 26, 8, '#ffffff');
      R(ctx, -5, 24, 110, 14, 7, '#c8d3e3'); R(ctx, -5, 50, 70, 14, 7, '#ffb36b');
      if (i === 0) pin(ctx, 95, 74, '#ff4d6d', 0.7);
      ctx.restore();
    }
    R(ctx, -100, 240, 200, 44, 22, screen === 'done' ? '#22a35a' : '#2f6fdf');
    if (screen === 'done') {
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(-150, -300, 300, 600);
      ctx.save(); ctx.translate(0, 0); ctx.scale(pop(k2), pop(k2)); check(ctx, 0, 0, 90); ctx.restore();
    }
  }
  ctx.restore();
  if (tap) { // นิ้วแตะ + วงกระเพื่อม (ไม่นับจำนวน)
    ctx.fillStyle = `rgba(47,111,223,${0.35 * (1 - (tap.ring || 0))})`; dot(ctx, tap.x, tap.y, 20 + 40 * (tap.ring || 0), ctx.fillStyle);
    pointHand(ctx, tap.x, tap.y, 1 - 0.12 * Math.sin(Math.PI * (tap.ring || 0)));
  }
  ctx.restore();
}
// มือชี้: ปลายนิ้วชี้อยู่ที่จุดแตะ เอียงมาจากล่างขวา + แขนเสื้อ (flat ไม่มีเส้นขอบ)
function pointHand(ctx, x, y, press = 1) {
  const skin = '#f8cba6', shade = '#eab38b', light = '#ffe0c7';
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5); ctx.scale(press, press);
  ctx.fillStyle = '#1fae5b'; ctx.beginPath(); ctx.roundRect(-34, 150, 92, 140, 18); ctx.fill(); // แขนเสื้อ
  ctx.fillStyle = '#17944c'; ctx.fillRect(-34, 150, 92, 16);                                   // ปลายแขนเสื้อ
  ctx.fillStyle = skin; ctx.beginPath();                                                        // ซิลลูเอตมือ
  ctx.moveTo(-15, 14); ctx.quadraticCurveTo(-15, -2, 0, -2); ctx.quadraticCurveTo(15, -2, 15, 14);
  ctx.lineTo(15, 62); ctx.bezierCurveTo(40, 58, 58, 72, 56, 100); ctx.bezierCurveTo(56, 136, 40, 156, 20, 158);
  ctx.lineTo(-24, 158); ctx.bezierCurveTo(-40, 140, -46, 112, -38, 92); ctx.bezierCurveTo(-32, 78, -22, 70, -15, 66);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = shade;                                                                        // ร่องนิ้วที่งอ
  for (const yy of [88, 112, 134]) { ctx.beginPath(); ctx.ellipse(36, yy, 18, 4, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = light; ctx.beginPath(); ctx.ellipse(-28, 112, 12, 26, -0.25, 0, Math.PI * 2); ctx.fill(); // นิ้วโป้ง
  ctx.beginPath(); ctx.roundRect(-8, 4, 16, 18, 7); ctx.fill();                                // เล็บ
  ctx.restore();
}
export function pin(ctx, x, y, color = '#ff4d6d', s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, -40, 26, Math.PI, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -40, 26, 0, Math.PI * 2); ctx.fill(); dot(ctx, 0, -40, 10, '#ffffff');
  ctx.restore();
}
export function check(ctx, x, y, r = 80) {
  dot(ctx, x, y, r, '#22c55e');
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = r * 0.18; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - r * 0.45, y); ctx.lineTo(x - r * 0.1, y + r * 0.35); ctx.lineTo(x + r * 0.5, y - r * 0.35); ctx.stroke();
}
/** ประกายวิบวับรอบจุด */
export function sparkles(ctx, { x = W / 2, y = 900, r = 300, t = 0, n = 8, k = 1 } = {}) {
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + t * 0.6, s = (10 + 12 * Math.abs(Math.sin(t * 4 + i))) * k;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 1.3;
    ctx.fillStyle = '#fff36b'; ctx.beginPath();
    ctx.moveTo(px, py - s * 2); ctx.quadraticCurveTo(px, py, px + s * 2, py); ctx.quadraticCurveTo(px, py, px, py + s * 2); ctx.quadraticCurveTo(px, py, px - s * 2, py); ctx.quadraticCurveTo(px, py, px, py - s * 2); ctx.fill();
  }
}
/** วิญญาณดวงเล็กลอยออกจากหัว (k 0..1 ออก แล้วกลับ) */
export function soulWisp(ctx, { x, y, k = 0, t = 0 } = {}) {
  if (k <= 0) return;
  const py = y - 160 * k, px = x + Math.sin(t * 6) * 20 * k;
  ctx.fillStyle = 'rgba(230,240,255,0.9)';
  ctx.beginPath(); ctx.arc(px, py, 34, Math.PI, 0); ctx.quadraticCurveTo(px + 34, py + 40, px, py + 70); ctx.quadraticCurveTo(px - 34, py + 40, px - 34, py); ctx.fill();
  dot(ctx, px - 11, py - 4, 5, '#2b2233'); dot(ctx, px + 11, py - 4, 5, '#2b2233');
}
/** ฟองความคิด (ภาพในหัว) inner(ctx) วาดในวง clip */
export function thoughtBubble(ctx, { x = W / 2, y = 600, r = 260, k = 1, tailX = null, tailY = null } = {}, inner) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop(k), pop(k));
  ctx.fillStyle = '#ffffff';
  if (tailX != null) { const dx = tailX - x, dy = tailY - y; for (const [f, rr] of [[0.62, 30], [0.8, 20], [0.93, 12]]) dot(ctx, dx * f, dy * f, rr, '#ffffff'); }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r - 16, 0, Math.PI * 2); ctx.clip();
  if (inner) inner(ctx, r - 16);
  ctx.restore(); ctx.restore();
}
