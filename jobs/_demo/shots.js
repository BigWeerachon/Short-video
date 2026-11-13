// งานตัวอย่าง: แสดงความสามารถของ engine (ฉาก ตัวละคร ท่าทาง การ์ด มือถือ โลโก้)
export default function (S) {
  const { shot, T, TW, prog, drawChar, sky, stars, crescent, hills, pines, ground, tent, titleCapsule, bubble, phone, logoCard, infoCard, SKIES, logo, W } = S;
  S.keywords(['แก๊งซ่า', 'ไอ้เบิ้ม', 'กรี๊ด', 'พักอิน', 'สามคลิก']);

  const night = (ctx) => { sky(ctx, 'night'); stars(ctx, 11); crescent(ctx, 830, 300, 58, SKIES.night[0]); hills(ctx, 'night', 1180); pines(ctx, 1420, '#1b2550'); ground(ctx, 1440, '#262c52'); };

  // 0: เปิดเรื่อง — ภูเขากลางคืน กล้องค่อยๆ ซูม
  shot(T(0), (ctx, lt, t) => {
    night(ctx);
    tent(ctx, 330, 1450, 320, '#f08a3c', { glow: true }); tent(ctx, 760, 1450, 260, '#4f9be8');
    const gang = ['twinA', 'meen', 'narrator', 'bem', 'nat', 'twinB'];
    gang.forEach((id, i) => drawChar(ctx, id, { x: 150 + i * 156, y: 1600, scale: 0.7, expr: 'happy' }));
    titleCapsule(ctx, 'แก๊งซ่า', { y: 420, k: prog(t, TW(0, 'แก๊งซ่า'), 0.4) });
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1 + lt * 0.02 }) });

  // 1: ไอ้เบิ้ม — ชื่อเด้งตอนเอ่ยชื่อ
  shot(T(1), (ctx, lt, t) => {
    night(ctx);
    drawChar(ctx, 'bem', { x: 540, y: 1560, scale: 1.25, expr: t > TW(1, 'ใจปลาซิว') ? 'scared' : 'smug', arms: { l: 'hips', r: 'hips' } });
    titleCapsule(ctx, 'ไอ้เบิ้ม', { y: 420, bg: '#22a35a', fg: '#ffffff', k: prog(t, TW(1, 'ไอ้เบิ้ม'), 0.4) });
  }, { cam: { x: 540, y: 1150, zoom: 1.1 } });

  // 2: เสียงกรี๊ด — กล้องสั่น
  shot(T(2), (ctx, lt, t) => {
    night(ctx);
    drawChar(ctx, 'bem', { x: 420, y: 1600, scale: 1.1, expr: 'shock', arms: { l: 'cover-mouth', r: 'up' } });
    drawChar(ctx, 'twinB', { x: 760, y: 1600, scale: 1.0, expr: 'scared', arms: { l: 'scared', r: 'scared' } });
    if (t > TW(2, 'กรี๊ด')) bubble(ctx, 'กรี๊ดดดด!!', { x: 540, y: 620, k: prog(t, TW(2, 'กรี๊ด'), 0.3) });
  }, { cam: (lt) => ({ x: 540, y: 1150, zoom: 1.08, shake: lt > 1 && lt < 2.2 }) });

  // 3: นัทส่องไฟฉาย — ไฟฉายเล็งไปที่เงามืด ลำแสงออกจากหัวไฟฉาย
  shot(T(3), (ctx, lt, t) => {
    night(ctx);
    ctx.fillStyle = '#141a3a'; ctx.beginPath(); ctx.ellipse(880, 1300, 70, 150, 0, 0, Math.PI * 2); ctx.fill();
    const on = t > TW(3, 'ส่อง');
    drawChar(ctx, 'nat', { x: 330, y: 1600, scale: 1.15, expr: 'angry', prop: { type: 'flashlight', angle: -0.35, on } });
  }, { cam: { x: 600, y: 1150, zoom: 1.05 } });

  // 4–5: ยัยมีนเปิดพักอิน — มือถือ แตะ 3 ครั้งในวลี "สามคลิก"
  shot(T(4), (ctx, lt, t) => {
    sky(ctx, 'blue');
    drawChar(ctx, 'meen', { x: 230, y: 1600, scale: 1.05, expr: 'happy', arms: { r: 'phone' }, prop: { type: 'phone' }, talk: false });
    const click = TW(5, 'สามคลิก');
    const taps = [0, 0.45, 0.9].filter((d) => t > click + d).length;
    phone(ctx, { x: 680, y: 960, s: 1.15, step: taps >= 3 ? 2 : taps > 0 ? 1 : 0, logo });
    logoCard(ctx, logo, { x: 540, y: 300, w: 560, k: prog(t, TW(4, 'พักอิน'), 0.45) });
  });

  // 6: ปิดท้าย — การ์ดชวนไปเว็บไซต์ (ข้อความตรงกับที่พูด)
  shot(T(6), (ctx, lt, t) => {
    sky(ctx, 'mint');
    logoCard(ctx, logo, { x: 540, y: 520, w: 700, k: prog(t, T(6), 0.4) });
    infoCard(ctx, { x: 540, y: 900, title: 'www.paakin.com', accent: '#2f6fdf', k: prog(t, TW(6, 'ดอท'), 0.4) });
    drawChar(ctx, 'meen', { x: 360, y: 1600, scale: 1.0, expr: 'laugh', arms: { l: 'cheer', r: 'cheer' } });
    drawChar(ctx, 'bem', { x: 720, y: 1600, scale: 0.95, expr: 'happy', arms: { l: 'wave' } });
  });
}
