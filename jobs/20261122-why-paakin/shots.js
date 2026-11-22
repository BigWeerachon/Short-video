// ทำไมต้องพักอิน — 26 ช็อตตาม shotlist.md (ข้อความในภาพมีแค่ H1–H4; UI ใช้แท่ง/ไอคอน L12)
export default function (S) {
  const { shot, T, TW, prog, clamp, drawChar, logo, W, H,
    headerCard, bizRoom, hotelFront, barChart, coin, iconBrand, star, spinner, xIcon, counter, notebook,
    fileIcon, monitor, laptop, siteMock, roomCalendar, syncLine, goldCheck, gear, growthChart, heart, keyCard, thinkIcon,
    sofa, bizDesk, phoneScreen, logoCard, check, sparkles } = S;
  S.keywords(['พักอิน', 'สมาร์ทโฟน', 'กำไร', 'แบรนด์', 'เว็บไซต์', 'จองที่อื่น', 'ห้องซ้ำ', 'ตกหล่น', 'ระบบจองตรง', 'ระบบหลังบ้าน', 'ที่เดียว', 'แข็งแรง', 'เชื่อมั่น', 'มั่นคง', 'วางใจ']);

  const H1 = 'นักท่องเที่ยวจองที่พักผ่านมือถือเป็นหลัก พึ่งตัวกลางอย่างเดียว อาจเสียกำไรและตัวตนของแบรนด์!';
  const H2 = 'เว็บช้า จองยาก ไม่รองรับมือถือ = เสียลูกค้าทันที หลังบ้านไม่เรียลไทม์ = เสี่ยงห้องซ้ำและตกหล่น!';
  const H3 = 'พัฒนาเว็บไซต์ ระบบจองตรง และระบบหลังบ้านกับ "พักอิน" หน้าบ้านสวยจองลื่น หลังบ้านครบวงจร ลดงานซ้ำซ้อน!';
  const H4 = 'ระบบแข็งแรง เว็บไซต์น่าเชื่อถือ มีเวลาดูแลแขกเต็มที่ ยกระดับระบบโรงแรมให้เติบโตมั่นคง วางใจ "พักอิน"';
  const NAVY = '#1e2a5a', SKYB = '#38bdf8', GOLD = '#f6b860';
  const on = (t, a, d = 0.4) => prog(t, a, d);
  const R = (ctx, x, y, w, h, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
  const sleeve = '#e6e9f0';
  // ทรานสิชัน (overlay ไม่ขยับตามกล้อง)
  const fadeFrom = (ctx, t, t0, color, d = 0.5) => { const a = 1 - prog(t, t0, d); if (a > 0) { ctx.fillStyle = color; ctx.globalAlpha = a; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; } };
  const slideFrom = (ctx, t, t0, dir = -1, d = 0.45) => { const k = prog(t, t0, d); if (k < 1) { ctx.fillStyle = NAVY; ctx.fillRect(dir < 0 ? -W * k : W * k, 0, W, H); } };
  const hdr = (text, t0) => (ctx, lt, t) => headerCard(ctx, text, { k: on(t, t0, 0.5) });
  const hold = (text) => (ctx) => headerCard(ctx, text, { k: 1 });
  const ov = (...fs) => (ctx, lt, t) => fs.forEach((f) => f(ctx, lt, t));

  // ===== ฉาก 1 บริบท =====
  // 1 traveler ในล็อบบี้
  shot(T(0), (ctx, lt, t) => {
    bizRoom(ctx, 'lobby');
    drawChar(ctx, 'traveler', { x: 540, y: 1580, scale: 1.45, expr: 'happy', arms: { r: 'phone' }, prop: { type: 'phone' } });
  }, { cam: (lt) => ({ x: 540, y: 1150, zoom: 1 + lt * 0.03 }), overlay: ov(hdr(H1, T(0) + 0.2), (ctx, lt, t) => fadeFrom(ctx, t, T(0), NAVY, 0.6)) });

  // 2 close มือถือ — การ์ดห้อง + แตะปุ่มส้ม
  shot(T(1), (ctx, lt, t) => {
    bizRoom(ctx, 'lobby');
    const lit = on(t, TW(1, 'สมาร์ทโฟน'), 0.4), tp = T(1) + 0.8;
    phoneScreen(ctx, { x: 540, y: 1110, s: 0.78, screen: 'custom', draw: (c) => {
      c.globalAlpha = 0.3 + 0.7 * lit;
      R(c, -150, -300, 300, 60, 0, NAVY);
      for (let i = 0; i < 3; i++) { const yy = -210 + i * 140 - 40 * lit; R(c, -125, yy, 250, 120, 16, '#eaf4ff'); R(c, -112, yy + 12, 96, 96, 12, '#9fd8f7'); R(c, 0, yy + 24, 100, 14, 7, '#c8d3e3'); R(c, 0, yy + 52, 64, 14, 7, '#c8d3e3'); }
      R(c, -90, 225, 180, 50, 25, GOLD); c.globalAlpha = 1;
    }, tap: t > tp - 0.3 ? { x: 0, y: 250, ring: prog(t, tp, 0.5), sleeve } : null });
  }, { cam: { x: 540, y: 1110, zoom: 1.05 }, overlay: hold(H1) });

  // 3 หน้าโรงแรม + ไอคอนตัวกลาง
  shot(T(2), (ctx, lt, t) => {
    bizRoom(ctx, 'front');
    hotelFront(ctx, { x: 600, y: 1540, s: 0.95, sign: on(t, T(2) + 0.2, 0.4) });
    const mk = on(t, T(3), 0.45); // การ์ดแอปจองทั่วไป (ไม่มีชื่อ/ข้อความ) ย่อ ไม่บังโรงแรมทั้งหมด
    if (mk > 0) { ctx.save(); ctx.translate(860, 1080); ctx.scale(mk, mk);
      R(ctx, -150, -210, 300, 420, 30, '#6b7499'); R(ctx, -130, -190, 260, 60, 14, '#8a93b5');
      for (let i = 0; i < 3; i++) { R(ctx, -130, -110 + i * 100, 260, 84, 14, '#ffffff'); R(ctx, -118, -100 + i * 100, 64, 64, 10, '#c8d3e3'); R(ctx, -40, -90 + i * 100, 140, 12, 6, '#d5dbe8'); R(ctx, -40, -62 + i * 100, 90, 12, 6, '#d5dbe8'); }
      ctx.restore(); }
    drawChar(ctx, 'owner', { x: 200, y: 1600, scale: 1.2, expr: t > T(3) ? 'sweat' : 'happy' });
  }, { cam: (lt) => ({ x: 540 + Math.min(lt, 2) * 20, y: 1100, zoom: 1.08 }), overlay: hold(H1) });

  // 4 กราฟกำไร
  shot(T(4), (ctx, lt, t) => {
    bizRoom(ctx, 'navy');
    const k = on(t, TW(4, 'กำไร'), 0.8);
    barChart(ctx, { x: 660, y: 1500, w: 560, h: 760, bars: [{ h: 0.95, color: '#6b7499' }, { h: 0.3, color: GOLD }], k });
    for (let i = 0; i < 4; i++) { const u = ((t - TW(4, 'กำไร')) * 0.7 + i / 4) % 1; if (k > 0.5) { ctx.globalAlpha = 1 - u; coin(ctx, 860 + u * 160, 1260 - u * 420, 30); ctx.globalAlpha = 1; } }
    drawChar(ctx, 'owner', { x: 220, y: 1600, scale: 1.2, expr: 'sweat', arms: { r: 'point' } });
  }, { overlay: hold(H1) });

  // 5 แบรนด์จาง
  shot(T(5), (ctx, lt, t) => {
    bizRoom(ctx, 'navy');
    iconBrand(ctx, { x: 680, y: 1060, s: 1.2, fade: on(t, TW(5, 'แบรนด์'), 1.2) });
    drawChar(ctx, 'owner', { x: 240, y: 1600, scale: 1.25, expr: 'sad' });
  }, { cam: { x: 540, y: 1100, zoom: 1.05 }, overlay: hold(H1) });

  // ===== ฉาก 2 ปัญหา =====
  // 6 traveler นั่งโซฟาคิด
  shot(T(7), (ctx, lt, t) => {
    bizRoom(ctx, 'living'); sofa(ctx, { x: 540, y: 1580, w: 600 });
    drawChar(ctx, 'traveler', { x: 540, y: 1520, scale: 1.25, mode: 'sit', expr: 'happy', arms: { r: 'phone', l: 'cheek' }, prop: { type: 'phone' } });
    thinkIcon(ctx, 760, 760, on(t, T(7) + 0.3), t);
  }, { overlay: ov(hdr(H2, T(7) + 0.2), (ctx, lt, t) => slideFrom(ctx, t, T(7), -1)) });

  // 7 ช่องค้นหา + แตะ
  const phoneAt = (ctx, draw, tap) => phoneScreen(ctx, { x: 540, y: 1110, s: 0.78, screen: 'custom', draw, tap });
  shot(T(8), (ctx, lt, t) => {
    bizRoom(ctx, 'living');
    const tp = T(8) + 0.3, res = on(t, tp + 0.4, 0.6);
    phoneAt(ctx, (c) => {
      R(c, -150, -300, 300, 60, 0, NAVY); R(c, -125, -220, 250, 56, 28, '#e3e8f2'); c.fillStyle = '#8a95ad'; c.beginPath(); c.arc(-95, -192, 12, 0, 7); c.fill();
      for (let i = 0; i < 4; i++) { c.globalAlpha = clamp(res * 4 - i, 0, 1); R(c, -125, -130 + i * 90 - 30 * (1 - res), 250, 70, 14, '#f2f4f8'); R(c, -110, -118 + i * 90 - 30 * (1 - res), 140, 14, 7, '#c8d3e3'); }
      c.globalAlpha = 1;
    }, t > tp - 0.3 ? { x: 0, y: -192, ring: prog(t, tp, 0.5), sleeve } : null);
  }, { cam: { x: 540, y: 1110, zoom: 1.05 }, overlay: hold(H2) });

  // 8 ไม่เจอเว็บไซต์ทางการ
  shot(T(9), (ctx, lt, t) => {
    bizRoom(ctx, 'living');
    const k = on(t, TW(9, 'เว็บไซต์'), 0.5);
    phoneAt(ctx, (c) => {
      R(c, -150, -300, 300, 60, 0, NAVY); R(c, -125, -220, 250, 56, 28, '#e3e8f2');
      if (k < 1) spinner(c, { x: 0, y: 20, r: 50, t }); // ผลลัพธ์ว่าง: โหลดแล้วจอว่าง
    });
    drawChar(ctx, 'traveler', { x: 150, y: 1600, scale: 0.9, expr: 'sweat' });
  }, { overlay: hold(H2) });

  // 9 ฟอร์มซับซ้อน → spinner → หน้าเว็บล้นจอ
  shot(T(10), (ctx, lt, t) => {
    bizRoom(ctx, 'living');
    phoneAt(ctx, (c) => {
      R(c, -150, -300, 300, 60, 0, '#8a95ad');
      if (t < T(12)) {
        for (let i = 0; i < 6; i++) R(c, -125 + i * 8, -220 + i * 70, 250 - i * 16, 54, 10, i % 2 ? '#e3e8f2' : '#d5dbe8');
        if (t > T(11)) { c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(-150, -300, 300, 600); spinner(c, { x: 0, y: 0, r: 56, t }); }
      } else {
        c.save(); c.scale(1.6, 1.6); for (let i = 0; i < 9; i++) R(c, -120, -170 + i * 34, 300, 10, 5, '#c8d3e3'); R(c, -120, -180, 260, 60, 8, '#9fd8f7'); c.restore();
      }
    });
    drawChar(ctx, 'traveler', { x: 150, y: 1600, scale: 0.9, expr: 'sweat' });
  }, { cam: (lt) => ({ x: 540, y: 1110, zoom: 1 + Math.min(lt, 2.5) * 0.03 }), overlay: hold(H2) });

  // 10 กดออก X → โรงแรมอื่นสีเทา
  shot(T(13), (ctx, lt, t) => {
    bizRoom(ctx, 'living'); sofa(ctx, { x: 300, y: 1600, w: 420 });
    const tp = TW(14, 'จองที่อื่น');
    drawChar(ctx, 'traveler', { x: 300, y: 1540, scale: 1.0, mode: 'sit', expr: 'sad', arms: { r: 'phone' }, prop: { type: 'phone' } });
    phoneScreen(ctx, { x: 760, y: 1110, s: 0.62, screen: 'custom', draw: (c) => {
      if (t < tp + 0.25) { R(c, -150, -300, 300, 60, 0, '#8a95ad'); for (let i = 0; i < 6; i++) R(c, -125, -220 + i * 70, 250, 54, 10, '#e3e8f2'); xIcon(c, 105, -270, 26); }
      else { c.globalAlpha = prog(t, tp + 0.25, 0.4); hotelFront(c, { x: 0, y: 180, s: 0.4, gray: 1, sign: 1 }); c.globalAlpha = 1; }
    }, tap: t > tp - 0.3 && t < tp + 0.8 ? { x: 105, y: -270, ring: prog(t, tp, 0.5), sleeve } : null });
  }, { overlay: hold(H2) });

  // 11 reception จองสำเร็จ → จดมือ
  shot(T(15), (ctx, lt, t) => {
    bizRoom(ctx, 'back');
    const write = t > TW(16, 'จดมือ');
    drawChar(ctx, 'reception', { x: 540, y: 1330, scale: 1.2, expr: write ? 'sweat' : 'happy', arms: write ? { r: { x: 60, y: -150, bend: 'down' } } : {} });
    counter(ctx, { x: 540, y: 1600, w: 820, h: 300 });
    goldCheck(ctx, 820, 900, 56, on(t, T(15) + 0.2) * (t < T(16) + 0.4 ? 1 : 0));
    if (write) notebook(ctx, { x: 560, y: 1240, s: 0.8, write: ((t - TW(16, 'จดมือ')) * 0.8) % 1 });
  }, { cam: (lt) => ({ x: 540, y: 1150 - Math.max(0, 0.4 - lt) * 200, zoom: 1.05 }), overlay: ov(hold(H2), (ctx, lt, t) => slideFrom(ctx, t, T(15), 1, 0.35)) });

  // 12 โต๊ะหลังบ้าน: แฟ้มสลับ 2 จอ → ปฏิทินเทา + นาฬิกา
  shot(T(17), (ctx, lt, t) => {
    bizRoom(ctx, 'back');
    const blank = () => {};
    monitor(ctx, { x: 290, y: 860, w: 360, h: 230 }, blank);
    monitor(ctx, { x: 790, y: 860, w: 360, h: 230 }, t > T(18) ? (c, w, h) => { for (let r = 0; r < 3; r++) for (let q = 0; q < 5; q++) R(c, -w / 2 + 14 + q * 66, -h / 2 + 16 + r * 70, 56, 58, 8, '#c4c9d4'); } : blank);
    for (let i = 0; i < 3; i++) { const u = ((t - T(17)) * 0.9 + i / 3) % 1; fileIcon(ctx, 290 + 500 * (i % 2 ? 1 - u : u), 760 - Math.sin(u * Math.PI) * 140, 0.6, i ? SKYB : GOLD, u - 0.5); }
    if (t > T(18)) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(540, 700, 48, 0, 7); ctx.fill(); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(540, 700); ctx.lineTo(540 + Math.cos(t * 3) * 32, 700 + Math.sin(t * 3) * 32); ctx.moveTo(540, 700); ctx.lineTo(562, 712); ctx.stroke(); }
    bizDesk(ctx, { x: 540, y: 1180, w: 1000 });
    drawChar(ctx, 'owner', { x: 300, y: 1600, scale: 1.05, expr: 'sweat', arms: { l: 'shrug', r: 'shrug' } });
    drawChar(ctx, 'reception', { x: 780, y: 1600, scale: 1.0, expr: 'sweat' });
  }, { cam: (lt) => ({ x: 560 - Math.min(lt, 2) * 10, y: 1100, zoom: 1.08 }), overlay: hold(H2) });

  // 13 ปฏิทินห้องซ้ำ/ตกหล่น
  shot(T(19), (ctx, lt, t) => {
    bizRoom(ctx, 'back');
    const cal = roomCalendar(ctx, { x: 620, y: 960, w: 720, h: 520, cells: { '1,0': '#9fd8f7', '4,2': '#9fd8f7', '5,1': '#9fd8f7' } });
    const d = TW(19, 'ห้องซ้ำ'), f = TW(19, 'ตกหล่น');
    const c = cal.cell(3, 1), sh = t > T(20) ? Math.sin(t * 40) * 4 : 0;
    if (t > d) { const k = on(t, d, 0.35); R(ctx, c.x - c.w / 2 - 10 * k + sh, c.y - c.h / 2 - 8 * k, c.w, c.h, 10, '#ef4444'); R(ctx, c.x - c.w / 2 + 10 * k + sh, c.y - c.h / 2 + 8 * k, c.w, c.h, 10, '#f87171'); }
    if (t > f) { const c2 = cal.cell(5, 3), u = prog(t, f, 0.8); ctx.globalAlpha = 1 - u; R(ctx, c2.x - c2.w / 2, c2.y - c2.h / 2 + u * 260, c2.w, c2.h, 10, GOLD); ctx.globalAlpha = 1; }
    drawChar(ctx, 'owner', { x: 280, y: 1620, scale: 1.0, expr: 'sweat', arms: t > d ? { r: { x: 30, y: -330, bend: 'down' } } : {} });
  }, { cam: (lt) => ({ x: 600, y: 1050, zoom: 1.05 + Math.min(lt, 2) * 0.03 }), overlay: hold(H2) });

  // ===== ฉาก 3 พักอิน =====
  // 14 owner มั่นใจ มอง laptop
  shot(T(21), (ctx, lt, t) => {
    bizRoom(ctx, 'office');
    bizDesk(ctx, { x: 640, y: 1330, w: 700 });
    laptop(ctx, { x: 700, y: 1300, w: 440, h: 280 }, (c, w, h) => siteMock(c, w, h, { k: 1, btn: 0, logo }));
    drawChar(ctx, 'owner', { x: 250, y: 1600, scale: 1.25, expr: 'happy', arms: { l: 'hips', r: 'hips' } });
  }, { overlay: ov(hdr(H3, T(21) + 0.4), (ctx, lt, t) => fadeFrom(ctx, t, T(21), '#ffffff', 0.6)) });

  // 15 laptop หน้าเว็บประกอบตัว → ปุ่มจอง → เชื่อมหลังบ้าน
  shot(T(22), (ctx, lt, t) => {
    bizRoom(ctx, 'office');
    laptop(ctx, { x: 540, y: 1360, w: 760, h: 480 }, (c, w, h) => siteMock(c, w, h, { k: on(t, TW(22, 'เว็บไซต์'), 1.2), btn: on(t, T(23), 0.4), logo }));
    if (t > T(24)) { const k = on(t, T(24), 0.6); syncLine(ctx, { x1: 540, y1: 800, x2: 900, y2: 660, t, k }); gear(ctx, 920, 640, 50 * k, t, SKYB); }
  }, { cam: (lt) => ({ x: 540, y: 1150, zoom: 1.02 + Math.min(lt, 3) * 0.02 }), overlay: hold(H3) });

  // 16 logo card
  shot(T(25), (ctx, lt, t) => {
    bizRoom(ctx, 'office');
    sparkles(ctx, { x: 540, y: 1080, r: 360, t, k: on(t, T(25) + 0.2) });
    logoCard(ctx, logo, { x: 540, y: 1080, w: 720, k: on(t, T(25), 0.45) });
  }, { overlay: hold(H3) });

  // 17 owner พยักหน้า reception ยิ้ม + เฟืองหมุนเข้ากัน
  shot(T(28), (ctx, lt, t) => {
    bizRoom(ctx, 'office');
    const k = on(t, T(28), 0.5);
    gear(ctx, 450, 820, 90 * k, t * 1.2, SKYB); gear(ctx, 610, 900, 70 * k, -t * 1.5 + 0.3, GOLD);
    hotelFront(ctx, { x: 540, y: 1040, s: 0.16 * k, sign: 0 });
    drawChar(ctx, 'owner', { x: 300, y: 1600, scale: 1.15, expr: 'happy', arms: { r: 'point' } });
    drawChar(ctx, 'reception', { x: 780, y: 1600, scale: 1.1, expr: 'happy' });
  }, { overlay: hold(H3) });

  // 18 มือถือหน้าเว็บโรงแรม → กดจอง → checkmark
  shot(T(30), (ctx, lt, t) => {
    bizRoom(ctx, 'lobby');
    const tp = TW(33, 'กดจอง') + 0.15, done = t > tp + 0.3;
    phoneAt(ctx, (c) => {
      R(c, -150, -300, 300, 60, 0, NAVY);
      if (logo) { const lw = 110; c.drawImage(logo, -lw / 2, -292, lw, lw * logo.naturalHeight / logo.naturalWidth); }
      const sl = t < T(31) ? 0 : t < T(32) ? 1 : 2, x0 = -sl * 270 + (t > T(31) ? 0 : -on(t, T(30), 0.6) * 0);
      for (let i = 0; i < 3; i++) { R(c, -125 + i * 270 + x0, -220, 250, 200, 18, ['#9fd8f7', '#7cc8f0', '#b9e4fa'][i]); R(c, -125 + i * 270 + x0, -80, 250, 60, 0, '#ffffff'); }
      R(c, -125, 10, 250, 16, 8, '#e3e8f2'); R(c, -125, 46, 180, 16, 8, '#e3e8f2'); R(c, -125, 82, 210, 16, 8, '#e3e8f2');
      R(c, -100, 200, 200, 60, 30, GOLD);
      if (done) { c.fillStyle = 'rgba(255,255,255,0.92)'; c.fillRect(-150, -300, 300, 600); goldCheck(c, 0, 0, 90, prog(t, tp + 0.3, 0.4)); }
    }, t > tp - 0.3 && t < tp + 0.7 ? { x: 0, y: 230, ring: prog(t, tp, 0.5), sleeve } : null);
  }, { cam: { x: 540, y: 1110, zoom: 1.05 }, overlay: hold(H3) });

  // 19 sync มือถือ → dashboard
  shot(T(34), (ctx, lt, t) => {
    bizRoom(ctx, 'office');
    phoneScreen(ctx, { x: 180, y: 900, s: 0.42, screen: 'custom', draw: (c) => { R(c, -150, -300, 300, 600, 0, '#ffffff'); goldCheck(c, 0, 0, 90, 1); } });
    const merged = on(t, T(35), 0.6);
    monitor(ctx, { x: 680, y: 900, w: 520, h: 330 }, (c, w, h) => {
      const g = 14 * (1 - merged);
      for (let i = 0; i < 4; i++) { const cx = (i % 2 ? 1 : -1) * (w / 4 + g * 3), cy = (i < 2 ? -1 : 1) * (h / 4 + g * 2); R(c, cx - w / 4 + 10, cy - h / 4 + 10, w / 2 - 20, h / 2 - 20, 12, [SKYB, GOLD, '#9fd8f7', '#c8d3e3'][i]); }
    });
    syncLine(ctx, { x1: 240, y1: 800, x2: 500, y2: 780, t, k: on(t, T(34), 0.6) });
    bizDesk(ctx, { x: 640, y: 1170, w: 760 });
    drawChar(ctx, 'reception', { x: 680, y: 1600, scale: 1.1, mode: 'sit', expr: 'happy' });
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.05 }), overlay: ov(hold(H3), (ctx, lt, t) => slideFrom(ctx, t, T(34), 1, 0.35)) });

  // 20 ปฏิทินเรียบร้อย + แถบอัปเดต + แฟ้มยุบ สมุดปิด
  shot(T(36), (ctx, lt, t) => {
    bizRoom(ctx, 'office');
    const g = on(t, T(36), 1.0), cells = {};
    for (let c = 0; c < 7; c++) for (let r = 0; r < 4; r++) if ((c + r * 7) / 28 < g) cells[`${c},${r}`] = (c + r) % 3 ? '#86efac' : '#bbf7d0';
    roomCalendar(ctx, { x: 540, y: 900, w: 760, h: 480, cells });
    if (t > T(37)) { const u = on(t, T(37), 0.7); R(ctx, 200, 1180, 680, 22, 11, '#e3e8f2'); R(ctx, 200, 1180, 680 * u, 22, 11, SKYB); }
    const shrink = 1 - on(t, T(38), 0.6);
    for (let i = 0; i < 3; i++) if (shrink > 0) fileIcon(ctx, 820 + i * 14, 1360 - i * 22, 0.7 * shrink, i % 2 ? SKYB : GOLD, 0.1 * i);
    notebook(ctx, { x: 300, y: 1370, s: 0.6, open: t > T(38) + 0.4 ? 0 : 1 });
    drawChar(ctx, 'reception', { x: 560, y: 1620, scale: 0.75, expr: 'happy', arms: { r: 'hold' } });
  }, { overlay: hold(H3) });

  // ===== ฉาก 4 ผลลัพธ์ =====
  // 21 โรงแรมทั้งหลัง โล่ฟ้า
  shot(T(39), (ctx, lt, t) => {
    bizRoom(ctx, 'front');
    hotelFront(ctx, { x: 620, y: 1540, s: 0.95, sign: 1, shield: on(t, T(39) + 0.3, 0.8) });
    drawChar(ctx, 'owner', { x: 190, y: 1600, scale: 1.2, expr: 'happy', arms: { l: 'hips', r: 'hips' } });
  }, { cam: (lt) => ({ x: 540, y: 960, zoom: 1.25 - 0.25 * prog(lt, 0, 0.8) }), overlay: hdr(H4, T(39) + 0.3) });

  // 22 รีวิวดาว
  shot(T(40), (ctx, lt, t) => {
    bizRoom(ctx, 'lobby');
    const k0 = TW(40, 'เว็บไซต์');
    phoneAt(ctx, (c) => {
      R(c, -150, -300, 300, 60, 0, NAVY);
      for (let r = 0; r < 3; r++) { R(c, -125, -200 + r * 150, 250, 120, 16, '#f2f4f8'); c.fillStyle = '#c8d3e3'; c.beginPath(); c.arc(-90, -160 + r * 150, 22, 0, 7); c.fill();
        for (let i = 0; i < 5; i++) { const kk = clamp((t - k0) * 4 - r * 2 - i * 0.6, 0, 1); if (kk > 0) { c.save(); c.translate(-50 + i * 38, -160 + r * 150); c.scale(kk, kk); star(c, 0, 0, 16, GOLD); c.restore(); } }
        R(c, -110, -120 + r * 150, 200, 12, 6, '#d5dbe8'); }
    });
  }, { cam: { x: 540, y: 1110, zoom: 1.05 }, overlay: hold(H4) });

  // 23 ล็อบบี้ ยื่นคีย์การ์ด
  shot(T(41), (ctx, lt, t) => {
    bizRoom(ctx, 'lobby');
    const give = on(t, T(41) + 0.3, 0.6);
    drawChar(ctx, 'owner', { x: 160, y: 1600, scale: 0.95, expr: 'happy', arms: { l: 'wave' } });
    drawChar(ctx, 'reception', { x: 420, y: 1600, scale: 1.0, expr: 'happy', arms: { r: { x: 60 + 60 * give, y: -190, bend: 'down' } } });
    keyCard(ctx, 420 + (60 + 60 * give) + 20, 1600 - 190 - 6, 0.7);
    const nod = t > T(42) ? Math.max(0, Math.sin((t - T(42)) * 6)) * 6 : 0;
    drawChar(ctx, 'traveler', { x: 760, y: 1600 + nod, scale: 1.05, expr: t > T(42) ? 'laugh' : 'happy', dir: -1, arms: { l: { x: -110, y: -190, bend: 'down' } } });
    if (t > T(42)) { const k = on(t, T(42), 0.5); ctx.save(); ctx.translate(760, 1170 - k * 50); ctx.scale(k, k); heart(ctx, 0, 0, 34); ctx.restore(); }
  }, { overlay: hold(H4) });

  // 24 กราฟเติบโต
  shot(T(44), (ctx, lt, t) => {
    bizRoom(ctx, 'navy');
    growthChart(ctx, { x: 600, y: 1420, w: 760, h: 680, k: on(t, T(44), 2.2), arrow: on(t, T(45), 0.5) });
    drawChar(ctx, 'owner', { x: 170, y: 1620, scale: 1.0, expr: 'happy', arms: { r: 'point' } });
  }, { cam: (lt) => ({ x: 540, y: 1100 - Math.min(lt, 2.4) * 40, zoom: 1.12 }), overlay: hold(H4) });

  // 25 logo card + ตัวละครสามคน ซูมออกช้า
  shot(T(46), (ctx, lt, t) => {
    bizRoom(ctx, 'office');
    sparkles(ctx, { x: 540, y: 900, r: 330, t, k: on(t, T(46) + 0.2) });
    logoCard(ctx, logo, { x: 540, y: 900, w: 680, k: on(t, T(46), 0.45) });
    drawChar(ctx, 'owner', { x: 540, y: 1600, scale: 0.95, expr: 'happy' });
    drawChar(ctx, 'reception', { x: 260, y: 1600, scale: 0.9, expr: 'happy', arms: { r: 'wave' } });
    drawChar(ctx, 'traveler', { x: 820, y: 1600, scale: 0.92, expr: 'happy', dir: -1 });
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.1 - 0.1 * prog(lt, 0, 2.2) }), overlay: hold(H4) });
  // 26 end card: player วาดเองหลัง VO_DUR
}
