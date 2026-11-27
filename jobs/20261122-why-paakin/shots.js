// ทำไมต้องพักอิน — 26 ช็อต; ไม่มีการ์ดหัวข้อ ด้านบนใช้แอนิเมชันไอคอน (ไม่มีข้อความ L12/L17)
export default function (S) {
  const { shot, T, TW, prog, clamp, drawChar, logo, W, H,
    bizRoom, hotelFront, barChart, coin, iconBrand, star, spinner, xIcon, counter, notebook,
    fileIcon, monitor, laptop, siteMock, roomCalendar, syncLine, goldCheck, gear, growthChart, heart, keyCard, thinkIcon,
    sofa, bizDesk, phoneScreen, logoCard, check, sparkles } = S;
  S.keywords(['พักอิน', 'สมาร์ทโฟน', 'กำไร', 'แบรนด์', 'เว็บไซต์', 'จองที่อื่น', 'ห้องซ้ำ', 'ตกหล่น', 'ระบบจองตรง', 'ระบบหลังบ้าน', 'ที่เดียว', 'แข็งแรง', 'เชื่อมั่น', 'มั่นคง', 'วางใจ']);

  const NAVY = '#1e2a5a', SKYB = '#38bdf8', GOLD = '#f6b860';
  const on = (t, a, d = 0.4) => prog(t, a, d);
  const R = (ctx, x, y, w, h, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
  const sleeve = '#e6e9f0';
  // ทรานสิชัน (overlay ไม่ขยับตามกล้อง)
  const fadeFrom = (ctx, t, t0, color, d = 0.5) => { const a = 1 - prog(t, t0, d); if (a > 0) { ctx.fillStyle = color; ctx.globalAlpha = a; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; } };
  const slideFrom = (ctx, t, t0, dir = -1, d = 0.45) => { const k = prog(t, t0, d); if (k < 1) { ctx.fillStyle = NAVY; ctx.fillRect(dir < 0 ? -W * k : W * k, 0, W, H); } };
  const ov = (...fs) => (ctx, lt, t) => fs.forEach((f) => f(ctx, lt, t));

  // ===== แอนิเมชันโซนบน (screen space y≈170–600) แทนการ์ดหัวข้อ =====
  const pop = (t, t0, d = 0.45) => { const k = prog(t, t0, d); return k <= 0 ? 0 : k >= 1 ? 1 : 1 + Math.sin(k * Math.PI) * 0.25 * (1 - k) + (k - 1) * 0.0 - (1 - k) * (1 - k) * 0.6; };
  const bob = (t, i, a = 14) => Math.sin(t * 2.2 + i * 1.7) * a;
  const at = (ctx, x, y, sc, f) => { if (sc <= 0) return; sc *= 1.6; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); f(ctx); ctx.restore(); };
  const miniPhone = (c, col = SKYB) => { R(c, -46, -80, 92, 160, 18, NAVY); R(c, -38, -66, 76, 128, 8, '#ffffff'); R(c, -30, -56, 60, 34, 6, col); R(c, -30, -14, 60, 10, 5, '#c8d3e3'); R(c, -30, 4, 40, 10, 5, '#c8d3e3'); R(c, -22, 34, 44, 16, 8, GOLD); };
  const appCard = (c, col = '#9fd8f7') => { R(c, -80, -56, 160, 112, 20, '#ffffff'); R(c, -64, -40, 56, 56, 12, col); R(c, 4, -34, 60, 12, 6, '#c8d3e3'); R(c, 4, -12, 40, 12, 6, '#c8d3e3'); R(c, -64, 28, 128, 14, 7, '#eaf4ff'); };
  const grayApp = (c) => { R(c, -70, -70, 140, 140, 30, '#6b7499'); R(c, -44, -44, 88, 30, 10, '#8a93b5'); R(c, -44, 0, 88, 14, 7, '#c8d3e3'); R(c, -44, 26, 56, 14, 7, '#c8d3e3'); };
  const mag = (c, col = '#ffffff') => { c.strokeStyle = col; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 44, 0, 7); c.stroke(); c.beginPath(); c.moveTo(32, 32); c.lineTo(76, 76); c.stroke(); };
  const clock = (c, t, col = '#ef4444') => { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, 56, 0, 7); c.fill(); c.strokeStyle = col; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(t * 3) * 40, Math.sin(t * 3) * 40); c.moveTo(0, 0); c.lineTo(Math.cos(t * 0.4) * 24, Math.sin(t * 0.4) * 24); c.stroke(); };
  const calIcon = (c, blink) => { R(c, -70, -60, 140, 130, 18, '#ffffff'); R(c, -70, -60, 140, 34, 18, '#ef4444'); for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) R(c, -54 + q * 40, -12 + r * 38, 28, 28, 6, r === 0 && q === 1 && blink ? '#ef4444' : '#d5dbe8'); };
  const arrowUp = (c, col = '#4ade80') => { c.fillStyle = col; c.beginPath(); c.moveTo(0, -80); c.lineTo(56, -16); c.lineTo(20, -16); c.lineTo(20, 70); c.lineTo(-20, 70); c.lineTo(-20, -16); c.lineTo(-56, -16); c.closePath(); c.fill(); };
  const arrowDn = (c) => { c.save(); c.rotate(Math.PI); arrowUp(c, '#ef4444'); c.restore(); };
  const shield = (c) => { c.fillStyle = SKYB; c.beginPath(); c.moveTo(0, -80); c.lineTo(66, -54); c.quadraticCurveTo(66, 40, 0, 84); c.quadraticCurveTo(-66, 40, -66, -54); c.closePath(); c.fill(); check(c, 0, 0, 34); };
  const flowDots = (ctx, t, x1, x2, y, col = SKYB, n = 6, k = 1) => { for (let i = 0; i < n; i++) { const u = ((t * 0.6) + i / n) % 1; ctx.globalAlpha = k * Math.sin(u * Math.PI); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x1 + (x2 - x1) * u, y - Math.sin(u * Math.PI) * 40, 12, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; };
  const rise = (ctx, t, t0, f, n = 5, x0 = 200, x1 = 880, y0 = 600, y1 = 190) => { const k = prog(t, t0, 0.6); for (let i = 0; i < n; i++) { const u = ((t - t0) * 0.35 + i / n) % 1; ctx.globalAlpha = k * Math.sin(u * Math.PI); f(ctx, x0 + (x1 - x0) * ((i * 0.37) % 1), y0 + (y1 - y0) * u, i); } ctx.globalAlpha = 1; };
  const FX = {
    phones: (s0) => (ctx, lt, t) => [260, 540, 820].forEach((x, i) => at(ctx, x, 380 + bob(t, i), pop(t, s0 + 0.2 + i * 0.25) * (i === 1 ? 1.4 : 1.1), miniPhone)),
    apps: (s0) => (ctx, lt, t) => { [240, 540, 840].forEach((x, i) => at(ctx, x, 380 + bob(t, i, 18), pop(t, s0 + 0.15 + i * 0.2), (c) => appCard(c, ['#9fd8f7', '#b9e4fa', '#7cc8f0'][i]))); star(ctx, 540 + Math.cos(t * 2) * 330, 230 + Math.sin(t * 2) * 30, 18 * prog(t, s0 + 0.8), GOLD); },
    middle: (s0) => (ctx, lt, t) => { at(ctx, 820, 380 + bob(t, 0), pop(t, s0 + 0.3), grayApp); at(ctx, 240, 380, pop(t, s0 + 0.1), miniPhone); flowDots(ctx, t, 300, 740, 380, GOLD, 6, prog(t, s0 + 0.7)); },
    loss: (s0) => (ctx, lt, t) => { rise(ctx, t, s0 + 0.2, (c, x, y) => coin(c, x, y, 28), 6, 160, 920, 200, 580); at(ctx, 540, 380 + bob(t, 0, 10), pop(t, s0 + 0.5), arrowDn); },
    think: (s0) => (ctx, lt, t) => at(ctx, 540 + Math.cos(t * 1.4) * 260, 380 + Math.sin(t * 2.8) * 60, pop(t, s0 + 0.2), (c) => mag(c, '#ffffff')),
    search: (s0) => (ctx, lt, t) => { at(ctx, 540 + Math.sin(t * 1.8) * 300, 380, pop(t, s0 + 0.1), (c) => mag(c, NAVY)); for (let i = 0; i < 4; i++) R(ctx, 170 + i * 190, 520, 150, 20, 10, `rgba(30,42,90,${0.25 * prog(t, s0 + 0.4 + i * 0.15)})`); },
    nosite: (s0) => (ctx, lt, t) => { spinner(ctx, { x: 400, y: 380, r: 70, t, color: NAVY }); at(ctx, 680, 380 + bob(t, 1), pop(t, s0 + 1.0), (c) => xIcon(c, 0, 0, 56)); },
    slow: (s0) => (ctx, lt, t) => { at(ctx, 300, 380 + bob(t, 0), pop(t, s0 + 0.1), (c) => clock(c, t)); spinner(ctx, { x: 560, y: 380, r: 60, t: t * 0.4, color: '#8a95ad' }); at(ctx, 800, 380 + bob(t, 2), pop(t, s0 + 0.5), (c) => { c.save(); c.rotate(Math.PI / 2); miniPhone(c, '#c8d3e3'); c.restore(); }); },
    leave: (s0) => (ctx, lt, t) => { at(ctx, 300, 380, pop(t, s0 + 0.2), (c) => xIcon(c, 0, 0, 60)); const u = prog(t, s0 + 0.5, 1.2); at(ctx, 560 + 320 * u, 380 + bob(t, 1), 1 - 0.2 * u, (c) => { c.globalAlpha = 1 - 0.3 * u; c.save(); c.scale(0.9, 0.9); appCard(c, '#c4c9d4'); c.restore(); c.globalAlpha = 1; }); },
    write: (s0) => (ctx, lt, t) => rise(ctx, t, s0 + 0.2, (c, x, y, i) => fileIcon(c, x, y, 0.5, i % 2 ? SKYB : GOLD, Math.sin(t + i) * 0.3), 5, 180, 900, 600, 190),
    files: (s0) => (ctx, lt, t) => { for (let i = 0; i < 4; i++) { const a = t * 1.3 + i * Math.PI / 2; fileIcon(ctx, 540 + Math.cos(a) * 300, 380 + Math.sin(a) * 120, 0.55 * prog(t, s0 + 0.1 * i), i % 2 ? SKYB : GOLD, Math.sin(a) * 0.3); } },
    clash: (s0) => (ctx, lt, t) => { const bl = Math.sin(t * 8) > 0; at(ctx, 540, 380 + Math.sin(t * 30) * (t > s0 + 0.5 ? 3 : 0), pop(t, s0 + 0.1) * 1.3, (c) => calIcon(c, bl)); [260, 820].forEach((x, i) => at(ctx, x, 380 + bob(t, i), pop(t, s0 + 0.4 + i * 0.2) * (bl ? 1 : 0.85), (c) => xIcon(c, 0, 0, 44))); },
    gears: (s0) => (ctx, lt, t) => { const k = prog(t, s0 + 0.3, 0.6); gear(ctx, 430, 360, 80 * k, t, SKYB); gear(ctx, 570, 430, 60 * k, -t * 1.33 + 0.3, GOLD); sparkles(ctx, { x: 500, y: 390, r: 260, t, k }); },
    sync: (s0) => (ctx, lt, t) => { at(ctx, 220, 380 + bob(t, 0), pop(t, s0 + 0.1), miniPhone); flowDots(ctx, t, 290, 760, 380, SKYB, 7, prog(t, s0 + 0.4)); gear(ctx, 840, 380, 64 * prog(t, s0 + 0.6, 0.5), t, GOLD); },
    stars: (s0) => (ctx, lt, t) => { for (let i = 0; i < 6; i++) { const a = t * 0.8 + i * Math.PI / 3; star(ctx, 540 + Math.cos(a) * 380, 360 + Math.sin(a) * 120, 26 * prog(t, s0 + 0.2 + i * 0.1), i % 2 ? GOLD : '#ffffff'); } },
    hearts: (s0) => (ctx, lt, t) => rise(ctx, t, s0 + 0.2, (c, x, y, i) => (i % 2 ? heart(c, x, y, 30) : star(c, x, y, 26, GOLD)), 7),
    checks: (s0) => (ctx, lt, t) => { [240, 440, 640, 840].forEach((x, i) => at(ctx, x, 380 + bob(t, i, 12), 1, (c) => goldCheck(c, 0, 0, 52, prog(t, s0 + 0.2 + i * 0.3, 0.4)))); },
    greens: (s0) => (ctx, lt, t) => { for (let i = 0; i < 5; i++) at(ctx, 180 + i * 180, 380 + bob(t, i, 10), pop(t, s0 + 0.2 + i * 0.25), (c) => { c.fillStyle = '#86efac'; c.beginPath(); c.arc(0, 0, 50, 0, 7); c.fill(); check(c, 0, 0, 30); }); },
    shield: (s0) => (ctx, lt, t) => { at(ctx, 540, 370 + bob(t, 0, 10), pop(t, s0 + 0.4) * 1.3, shield); for (let i = 0; i < 6; i++) { const a = t * 0.9 + i * Math.PI / 3; star(ctx, 540 + Math.cos(a) * 260, 370 + Math.sin(a) * 140, 20 * prog(t, s0 + 0.8), GOLD); } },
    grow: (s0) => (ctx, lt, t) => { at(ctx, 540, 390 + bob(t, 0, 16), pop(t, s0 + 0.3) * 1.3, (c) => arrowUp(c)); rise(ctx, t, s0 + 0.5, (c, x, y) => coin(c, x, y, 26), 6, 160, 920); },
  };

  // ===== ฉาก 1 บริบท =====
  // 1 traveler ในล็อบบี้
  shot(T(0), (ctx, lt, t) => {
    bizRoom(ctx, 'lobby');
    drawChar(ctx, 'traveler', { x: 540, y: 1580, scale: 1.45, expr: 'happy', arms: { r: 'phone' }, prop: { type: 'phone' } });
  }, { cam: (lt) => ({ x: 540, y: 1150, zoom: 1 + lt * 0.03 }), overlay: ov(FX.phones(T(0)), (ctx, lt, t) => fadeFrom(ctx, t, T(0), NAVY, 0.6)) });

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
  }, { cam: { x: 540, y: 1110, zoom: 1.05 }, overlay: FX.apps(T(1)) });

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
  }, { cam: (lt) => ({ x: 540 + Math.min(lt, 2) * 20, y: 1100, zoom: 1.08 }), overlay: FX.middle(T(2)) });

  // 4 กราฟกำไร + แบรนด์จาง (ช็อตเดียว T(4)→T(7) ไม่ตัดภาพ)
  shot(T(4), (ctx, lt, t) => {
    bizRoom(ctx, 'navy');
    const tg = TW(4, 'กำไร'), tb = TW(5, 'แบรนด์');
    const g0 = T(4) + 0.3, k = on(t, g0, Math.max(0.6, tg - g0 - 0.1));
    const m = on(t, tb, 0.9); // กราฟเลื่อน/ย่อขึ้นซ้ายบน
    const s = 1 - 0.35 * m, gx = 660 - 180 * m, gy = 1500 - 230 * m;
    ctx.save(); ctx.translate(gx, gy); ctx.scale(s, s);
    barChart(ctx, { x: 0, y: 0, w: 560, h: 760, bars: [{ h: 0.95, color: '#6b7499' }, { h: 0.3, color: GOLD }], k });
    if (t > tg) for (let i = 0; i < 4; i++) { const u = ((t - tg) * 0.7 + i / 4) % 1; ctx.globalAlpha = clamp((t - tg) * 3, 0, 1) * (1 - u); coin(ctx, 200 + u * 160, -240 - u * 420, 30); ctx.globalAlpha = 1; }
    ctx.restore();
    const ma = on(t, tb + 0.6, 0.5); if (ma > 0) { ctx.globalAlpha = ma; iconBrand(ctx, { x: 820, y: 1300, s: 0.9, fade: on(t, tb + 0.4, 1.2) }); ctx.globalAlpha = 1; }
    drawChar(ctx, 'owner', { x: 220, y: 1600, scale: 1.2, expr: t > tb ? 'sad' : 'sweat', arms: t > tb ? {} : { r: 'point' } });
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1 + Math.min(lt, 5.2) * 0.012 }), overlay: FX.loss(T(4)) });

  // ===== ฉาก 2 ปัญหา =====
  // 6 traveler นั่งโซฟาคิด
  shot(T(7), (ctx, lt, t) => {
    bizRoom(ctx, 'living'); sofa(ctx, { x: 540, y: 1580, w: 600 });
    drawChar(ctx, 'traveler', { x: 540, y: 1520, scale: 1.25, mode: 'sit', expr: 'happy', arms: { r: 'phone', l: 'cheek' }, prop: { type: 'phone' } });
    thinkIcon(ctx, 760, 760, on(t, T(7) + 0.3), t);
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.02 + Math.min(lt, 4) * 0.012 }), overlay: ov(FX.think(T(7)), (ctx, lt, t) => slideFrom(ctx, t, T(7), -1)) });

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
  }, { cam: { x: 540, y: 1110, zoom: 1.05 }, overlay: FX.search(T(8)) });

  // 8 ไม่เจอเว็บไซต์ทางการ
  shot(T(9), (ctx, lt, t) => {
    bizRoom(ctx, 'living');
    const k = on(t, TW(9, 'เว็บไซต์'), 0.5);
    phoneAt(ctx, (c) => {
      R(c, -150, -300, 300, 60, 0, NAVY); R(c, -125, -220, 250, 56, 28, '#e3e8f2');
      if (k < 1) spinner(c, { x: 0, y: 20, r: 50, t }); // ผลลัพธ์ว่าง: โหลดแล้วจอว่าง
    });
    drawChar(ctx, 'traveler', { x: 150, y: 1600, scale: 0.9, expr: 'sweat' });
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.02 + Math.min(lt, 4) * 0.012 }), overlay: FX.nosite(T(9)) });

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
  }, { cam: (lt) => ({ x: 540, y: 1110, zoom: 1 + Math.min(lt, 2.5) * 0.03 }), overlay: FX.slow(T(10)) });

  // 10 กดออก X → โรงแรมอื่นสีเทา
  shot(T(13), (ctx, lt, t) => {
    bizRoom(ctx, 'living'); sofa(ctx, { x: 300, y: 1600, w: 420 });
    const tp = TW(14, 'จองที่อื่น');
    drawChar(ctx, 'traveler', { x: 300, y: 1540, scale: 1.0, mode: 'sit', expr: 'sad', arms: { r: 'phone' }, prop: { type: 'phone' } });
    phoneScreen(ctx, { x: 760, y: 1110, s: 0.62, screen: 'custom', draw: (c) => {
      if (t < tp + 0.25) { R(c, -150, -300, 300, 60, 0, '#8a95ad'); for (let i = 0; i < 6; i++) R(c, -125, -220 + i * 70, 250, 54, 10, '#e3e8f2'); xIcon(c, 105, -270, 26); }
      else { c.globalAlpha = prog(t, tp + 0.25, 0.4); hotelFront(c, { x: 0, y: 180, s: 0.4, gray: 1, sign: 1 }); c.globalAlpha = 1; }
    }, tap: t > tp - 0.3 && t < tp + 0.8 ? { x: 105, y: -270, ring: prog(t, tp, 0.5), sleeve } : null });
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.02 + Math.min(lt, 4) * 0.012 }), overlay: FX.leave(T(13)) });

  // 11 reception จองสำเร็จ → จดมือ
  shot(T(15), (ctx, lt, t) => {
    bizRoom(ctx, 'back');
    const write = t > TW(16, 'จดมือ');
    drawChar(ctx, 'reception', { x: 540, y: 1330, scale: 1.2, expr: write ? 'sweat' : 'happy', arms: write ? { r: { x: 60, y: -150, bend: 'down' } } : {} });
    counter(ctx, { x: 540, y: 1600, w: 820, h: 300 });
    goldCheck(ctx, 820, 900, 56, on(t, T(15) + 0.2) * (t < T(16) + 0.4 ? 1 : 0));
    if (write) notebook(ctx, { x: 560, y: 1240, s: 0.8, write: ((t - TW(16, 'จดมือ')) * 0.8) % 1 });
  }, { cam: (lt) => ({ x: 540, y: 1150 - Math.max(0, 0.4 - lt) * 200, zoom: 1.05 }), overlay: ov(FX.write(T(15)), (ctx, lt, t) => slideFrom(ctx, t, T(15), 1, 0.35)) });

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
  }, { cam: (lt) => ({ x: 560 - Math.min(lt, 2) * 10, y: 1100, zoom: 1.08 }), overlay: FX.files(T(17)) });

  // 13 ปฏิทินห้องซ้ำ/ตกหล่น
  shot(T(19), (ctx, lt, t) => {
    bizRoom(ctx, 'back');
    const cal = roomCalendar(ctx, { x: 620, y: 960, w: 720, h: 520, cells: { '1,0': '#9fd8f7', '4,2': '#9fd8f7', '5,1': '#9fd8f7' } });
    const d = TW(19, 'ห้องซ้ำ'), f = TW(19, 'ตกหล่น');
    const c = cal.cell(3, 1), sh = t > T(20) ? Math.sin(t * 40) * 4 : 0;
    if (t > d) { const k = on(t, d, 0.35); R(ctx, c.x - c.w / 2 - 10 * k + sh, c.y - c.h / 2 - 8 * k, c.w, c.h, 10, '#ef4444'); R(ctx, c.x - c.w / 2 + 10 * k + sh, c.y - c.h / 2 + 8 * k, c.w, c.h, 10, '#f87171'); }
    if (t > f) { const c2 = cal.cell(5, 3), u = prog(t, f, 0.8); ctx.globalAlpha = 1 - u; R(ctx, c2.x - c2.w / 2, c2.y - c2.h / 2 + u * 260, c2.w, c2.h, 10, GOLD); ctx.globalAlpha = 1; }
    drawChar(ctx, 'owner', { x: 280, y: 1620, scale: 1.0, expr: 'sweat', arms: t > d ? { r: { x: 30, y: -330, bend: 'down' } } : {} });
  }, { cam: (lt) => ({ x: 600, y: 1050, zoom: 1.05 + Math.min(lt, 2) * 0.03 }), overlay: FX.clash(T(19)) });

  // ===== ฉาก 3 พักอิน =====
  // 14 owner มั่นใจ มอง laptop
  shot(T(21), (ctx, lt, t) => {
    bizRoom(ctx, 'office');
    bizDesk(ctx, { x: 640, y: 1330, w: 700 });
    laptop(ctx, { x: 700, y: 1300, w: 440, h: 280 }, (c, w, h) => siteMock(c, w, h, { k: 1, btn: 0, logo }));
    drawChar(ctx, 'owner', { x: 250, y: 1600, scale: 1.25, expr: 'happy', arms: { l: 'hips', r: 'hips' } });
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.02 + Math.min(lt, 4) * 0.012 }), overlay: ov(FX.gears(T(21)), (ctx, lt, t) => fadeFrom(ctx, t, T(21), '#ffffff', 0.6)) });

  // 15 laptop หน้าเว็บประกอบตัว → ปุ่มจอง → เชื่อมหลังบ้าน
  shot(T(22), (ctx, lt, t) => {
    bizRoom(ctx, 'office');
    laptop(ctx, { x: 540, y: 1360, w: 760, h: 480 }, (c, w, h) => siteMock(c, w, h, { k: on(t, TW(22, 'เว็บไซต์'), 1.2), btn: on(t, T(23), 0.4), logo }));
    if (t > T(24)) { const k = on(t, T(24), 0.6); syncLine(ctx, { x1: 540, y1: 800, x2: 900, y2: 660, t, k }); gear(ctx, 920, 640, 50 * k, t, SKYB); }
  }, { cam: (lt) => ({ x: 540, y: 1150, zoom: 1.02 + Math.min(lt, 3) * 0.02 }), overlay: FX.sync(T(22)) });

  // 16 logo card
  shot(T(25), (ctx, lt, t) => {
    bizRoom(ctx, 'office');
    sparkles(ctx, { x: 540, y: 1080, r: 360, t, k: on(t, T(25) + 0.2) });
    logoCard(ctx, logo, { x: 540, y: 1080, w: 720, k: on(t, T(25), 0.45) });
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.02 + Math.min(lt, 4) * 0.012 }), overlay: FX.stars(T(25)) });

  // 17 owner พยักหน้า reception ยิ้ม + เฟืองหมุนเข้ากัน
  shot(T(28), (ctx, lt, t) => {
    bizRoom(ctx, 'office');
    const k = on(t, T(28), 0.5);
    gear(ctx, 450, 820, 90 * k, t * 1.2, SKYB); gear(ctx, 610, 900, 70 * k, -t * 1.5 + 0.3, GOLD);
    hotelFront(ctx, { x: 540, y: 1040, s: 0.16 * k, sign: 0 });
    drawChar(ctx, 'owner', { x: 300, y: 1600, scale: 1.15, expr: 'happy', arms: { r: 'point' } });
    drawChar(ctx, 'reception', { x: 780, y: 1600, scale: 1.1, expr: 'happy' });
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.02 + Math.min(lt, 4) * 0.012 }), overlay: FX.hearts(T(28)) });

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
  }, { cam: { x: 540, y: 1110, zoom: 1.05 }, overlay: FX.checks(T(30)) });

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
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.05 }), overlay: ov(FX.sync(T(34)), (ctx, lt, t) => slideFrom(ctx, t, T(34), 1, 0.35)) });

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
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.02 + Math.min(lt, 4) * 0.012 }), overlay: FX.greens(T(36)) });

  // ===== ฉาก 4 ผลลัพธ์ =====
  // 21 โรงแรมทั้งหลัง โล่ฟ้า
  shot(T(39), (ctx, lt, t) => {
    bizRoom(ctx, 'front');
    hotelFront(ctx, { x: 620, y: 1540, s: 0.95, sign: 1, shield: on(t, T(39) + 0.3, 0.8) });
    drawChar(ctx, 'owner', { x: 190, y: 1600, scale: 1.2, expr: 'happy', arms: { l: 'hips', r: 'hips' } });
  }, { cam: (lt) => ({ x: 540, y: 960, zoom: 1.25 - 0.25 * prog(lt, 0, 0.8) }), overlay: FX.shield(T(39)) });

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
  }, { cam: { x: 540, y: 1110, zoom: 1.05 }, overlay: FX.stars(T(40)) });

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
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.02 + Math.min(lt, 4) * 0.012 }), overlay: FX.hearts(T(41)) });

  // 24 กราฟเติบโต
  shot(T(44), (ctx, lt, t) => {
    bizRoom(ctx, 'navy');
    growthChart(ctx, { x: 600, y: 1420, w: 760, h: 680, k: on(t, T(44), 2.2), arrow: on(t, T(45), 0.5) });
    drawChar(ctx, 'owner', { x: 170, y: 1620, scale: 1.0, expr: 'happy', arms: { r: 'point' } });
  }, { cam: (lt) => ({ x: 540, y: 1100 - Math.min(lt, 2.4) * 40, zoom: 1.12 }), overlay: FX.grow(T(44)) });

  // 25 logo card + ตัวละครสามคน ซูมออกช้า
  shot(T(46), (ctx, lt, t) => {
    bizRoom(ctx, 'office');
    sparkles(ctx, { x: 540, y: 900, r: 330, t, k: on(t, T(46) + 0.2) });
    logoCard(ctx, logo, { x: 540, y: 900, w: 680, k: on(t, T(46), 0.45) });
    drawChar(ctx, 'owner', { x: 540, y: 1600, scale: 0.95, expr: 'happy' });
    drawChar(ctx, 'reception', { x: 260, y: 1600, scale: 0.9, expr: 'happy', arms: { r: 'wave' } });
    drawChar(ctx, 'traveler', { x: 820, y: 1600, scale: 0.92, expr: 'happy', dir: -1 });
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.1 - 0.1 * prog(lt, 0, 2.2) }), overlay: FX.hearts(T(46)) });
  // 26 end card: player วาดเองหลัง VO_DUR
}
