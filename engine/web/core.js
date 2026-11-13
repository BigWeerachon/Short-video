// เวลา ช็อต กล้อง — แกนกลางของ engine (คู่มือขั้นที่ 1, 2, 5)
export const W = 1080, H = 1920, FPS = 30;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const easeOut = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
export const easeInOut = (k) => { k = clamp(k, 0, 1); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
/** ความคืบหน้า 0..1 ของช่วง [t0, t0+dur] */
export const prog = (t, t0, dur) => clamp((t - t0) / dur, 0, 1);
/** เด้งเข้า (overshoot) สำหรับชื่อ/การ์ด */
export const pop = (k) => { k = clamp(k, 0, 1); const c = 1.70158 + 1; return 1 + c * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2); };

/** T(i) = เวลาเริ่มวลี i, TW(i,'คำ') = เวลาของคำย่อยในวลี (แบ่งตามตำแหน่งตัวอักษร) */
export function makeTiming(words) {
  const T = (i) => (words[i] ? words[i].s : Infinity);
  const E = (i) => (words[i] ? words[i].e : Infinity);
  const TW = (i, word) => {
    const w = words[i];
    if (!w) return Infinity;
    const k = w.w.indexOf(word);
    if (k < 0) return w.s;
    return w.s + (w.e - w.s) * (k / w.w.length);
  };
  /** หา index วลีแรกที่มีคำนี้ (ช่วยเขียน shot list) */
  const find = (word, from = 0) => words.findIndex((w, i) => i >= from && w.w.includes(word));
  return { T, E, TW, find };
}

/** กล้อง: ซูม ≥1 (สั่น ≥1.03) และไม่ให้เห็นขอบนอกฉาก */
export function clampCam({ x = W / 2, y = H / 2, zoom = 1 } = {}, shake = false) {
  const z = Math.max(zoom, shake ? 1.03 : 1);
  const hw = W / 2 / z, hh = H / 2 / z;
  return { x: clamp(x, hw, W - hw), y: clamp(y, hh, H - hh), zoom: z };
}

/** รายการช็อต: shot(start, draw, {cam}) — ช็อตจบเมื่อช็อตถัดไปเริ่ม */
export function createShots() {
  const list = [];
  const shot = (start, draw, opts = {}) => { list.push({ start, draw, ...opts }); };
  const at = (t) => {
    const sorted = list.filter((s) => Number.isFinite(s.start)).sort((a, b) => a.start - b.start);
    let cur = null, next = Infinity;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].start <= t) { cur = sorted[i]; next = sorted[i + 1] ? sorted[i + 1].start : Infinity; }
    }
    return cur ? { ...cur, end: next, lt: t - cur.start } : null;
  };
  return { shot, at, list };
}

/** ค่า random แบบคงที่ (ภาพเหมือนเดิมทุกครั้งที่ render) */
export function rand(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
