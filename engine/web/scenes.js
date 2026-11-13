// ฉากและองค์ประกอบ flat vector สีสด ไม่มีเส้นขอบ (คู่มือขั้นที่ 5)
import { W, H, rand, pop, clamp } from './core.js';
import { roundRectPath } from './rig.js';
import { fitText } from './subs.js';

export const SKIES = {
  night: ['#16204a', '#2b3a7a'], dusk: ['#3a2a6e', '#5d40a0'], day: ['#7cc8ff', '#d4f0ff'],
  sunset: ['#ff9f6b', '#ffd9a3'], studio: ['#4a2f8e', '#6b46b9'], warm: ['#ffe2bd', '#fff4e3'],
  blue: ['#3d7be0', '#7fb2ff'], mint: ['#c8f3e6', '#effcf7'],
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
