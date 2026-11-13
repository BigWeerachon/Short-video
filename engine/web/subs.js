// ซับไทย 46px บรรทัดเดียว ตัดคำด้วย Intl.Segmenter (คู่มือขั้นที่ 4, lessons L02, L11)
export const SUB = { size: 46, min: 34, maxW: 940, y: 1770, pad: 18, box: 'rgba(16,16,32,0.72)', yellow: '#FFD43B', white: '#ffffff', font: 'Kanit' };

const seg = () => new Intl.Segmenter('th', { granularity: 'word' });
const setFont = (ctx, size, weight = 700) => { ctx.font = `${weight} ${size}px ${SUB.font}`; };

/** ขนาดตัวอักษรที่ทำให้ text กว้างไม่เกิน maxW */
export function fitText(ctx, text, maxW, size, weight = 700) {
  let s = size;
  setFont(ctx, s, weight);
  while (s > 10 && ctx.measureText(text).width > maxW) { s -= 1; setFont(ctx, s, weight); }
  return s;
}

/**
 * แบ่งซับเป็นหน้า (แต่ละหน้า = 1 บรรทัด) ไม่ตัดกลางคำ
 * @returns {{pages: Array<Array<{text:string,yellow:boolean}>>, size:number}}
 */
export function layoutSub(text, keywords, ctx) {
  const words = [...seg().segment(text)].map((s) => s.segment);
  let size = SUB.size;
  setFont(ctx, size);
  while (size > SUB.min && ctx.measureText(text).width > SUB.maxW) { size -= 2; setFont(ctx, size); }
  const pages = [];
  let cur = '';
  for (const w of words) {
    if (cur && ctx.measureText(cur + w).width > SUB.maxW) { pages.push(cur); cur = w.trimStart(); } else cur += w;
  }
  if (cur) pages.push(cur);
  return { pages: pages.map((p) => markKeywords(p, keywords || [])), size };
}

function markKeywords(text, keywords) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    let hit = null;
    for (const k of keywords) if (k && text.startsWith(k, i) && (!hit || k.length > hit.length)) hit = k;
    if (hit) { out.push({ text: hit, yellow: true }); i += hit.length; continue; }
    const last = out[out.length - 1];
    if (last && !last.yellow) last.text += text[i]; else out.push({ text: text[i], yellow: false });
    i++;
  }
  return out;
}

/** วาดซับ 1 หน้า: กล่องพื้นเข้มโปร่ง + คำสำคัญสีเหลือง */
export function drawSub(ctx, page, size, W = 1080) {
  setFont(ctx, size);
  const full = page.map((s) => s.text).join('');
  const w = ctx.measureText(full).width;
  const bx = (W - w) / 2 - SUB.pad, bh = size + SUB.pad * 1.3, by = SUB.y - bh / 2;
  ctx.fillStyle = SUB.box;
  roundRect(ctx, bx, by, w + SUB.pad * 2, bh, 16); ctx.fill();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  let x = (W - w) / 2;
  for (const s of page) {
    ctx.fillStyle = s.yellow ? SUB.yellow : SUB.white;
    ctx.fillText(s.text, x, SUB.y + 2);
    x += ctx.measureText(s.text).width;
  }
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
