// ออเดอร์เที่ยงคืน — 37 ช็อตตาม shotlist.md (ไม่มีข้อความเพิ่มนอกจาก titleCapsule + logoCard)
export default function (S) {
  const { shot, T, TW, prog, clamp, drawChar, logo, W,
    neonStudio, desk, titleCapsule, logoCard, photoFrame, roadNight, motorcycle, mirrorView, hotelRoom, bed, blanket,
    clock0200, phoneScreen, sparkles, soulWisp, thoughtBubble, digitalSky, speedLines, sky, stars, pines, ground } = S;
  S.keywords(['เรื่องเล่าเขย่าขวัญ', 'ไรเดอร์', 'ตีสอง', 'ชุดขาว', 'แม่เจ้าโว้ย!', 'ถึงใบหู!', 'สติหลุด', 'พักอิน', 'ราคาประหยัด', 'ใกล้ที่สุด', 'ไม่กี่คลิก', 'ปลอดภัย']);
  const sin = Math.sin;
  const on = (t, a, d = 0.35) => prog(t, a, d);
  const N = (o) => ({ talk: true, ...o });
  const studio = (ctx, t, o = {}) => neonStudio(ctx, { t, ...o });
  const narr = (ctx, o) => drawChar(ctx, 'narrator', N({ x: 540, y: 1560, scale: 1.5, ...o }));
  const deskF = (ctx) => desk(ctx, 1420, '#ff8a3d');
  const room = (ctx) => { sky(ctx, 'night'); stars(ctx, 3, 30); ctx.fillStyle = '#26326a'; ctx.fillRect(0, 1380, W, 540); };
  const house = (ctx, t) => {
    sky(ctx, 'roadNight'); stars(ctx, 8, 40); pines(ctx, 1150, '#0b1130', 6, 10);
    ctx.fillStyle = '#3b3f63'; ctx.fillRect(560, 700, 460, 520);
    ctx.fillStyle = '#2a2d4a'; ctx.beginPath(); ctx.moveTo(530, 720); ctx.lineTo(790, 520); ctx.lineTo(1050, 720); ctx.fill();
    ctx.fillStyle = '#7a5a3a'; ctx.fillRect(730, 960, 130, 260);
    ctx.fillStyle = 'rgba(255,230,140,0.25)'; ctx.beginPath(); ctx.arc(795, 900, 120, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe58a'; ctx.beginPath(); ctx.arc(795, 900, 22, 0, Math.PI * 2); ctx.fill();
    ground(ctx, 1220, '#232843');
  };
  // ไรเดอร์บนรถ (มุมข้าง) — ขาวางบนเบาะ มือจับแฮนด์
  const ride = (ctx, t, o = {}) => {
    const { x = 540, y = 1560, s = 1, dir = 1, expr = 'happy', light = true, beam = 700, lean = 0, talk = false, shiver = 0, goose = 0, armsBar = true } = o;
    const m = motorcycle(ctx, { x, y, s, dir, t, light, beam, lean });
    drawChar(ctx, 'rider', { x: m.seat.x + dir * 30 * s, y: m.seat.y + 30 * s, scale: s * 0.95, mode: 'ride', dir, expr, talk, shiver, goose });
    return m;
  };
  const roadAt = (ctx, t, o = {}) => roadNight(ctx, { t, scroll: t * 600, ...o });

  // 1 สวัสดี
  shot(T(0), (ctx, lt, t) => { studio(ctx, t); narr(ctx, { expr: 'happy', arms: { r: 'wave' } }); deskF(ctx); });
  // 2 titleCapsule
  shot(T(1), (ctx, lt, t) => { studio(ctx, t, { flicker: true }); narr(ctx, { expr: 'laugh', arms: { l: 'cheer', r: 'cheer' } }); deskF(ctx); },
    { cam: (lt) => ({ x: 540, y: 1100, zoom: 1 + lt * 0.03 }), overlay: (ctx, lt, t) => { if (t < 4.4) titleCapsule(ctx, 'เรื่องเล่าเขย่าขวัญ', { y: 420, k: on(t, TW(1, 'เรื่องเล่า'), 0.4) }); } });
  // 3 ไฟหรี่
  shot(T(2), (ctx, lt, t) => { studio(ctx, t, { dim: on(t, TW(2, 'หลอน'), 0.6) }); narr(ctx, { y: 1620, scale: 1.8, expr: 'smug', arms: { r: 'point' } }); },
    { cam: { x: 540, y: 1100, zoom: 1.15 } });
  // 4 กรอบรูปไรเดอร์
  const frameInner = (ctx) => { ground(ctx, 820, '#7fcf98'); drawChar(ctx, 'rider', { x: 540, y: 900, scale: 1.2, expr: 'happy', arms: { l: 'wave', r: 'hold' } }); ctx.fillStyle = '#16b85a'; ctx.fillRect(560, 620, 110, 90); };
  shot(T(3), (ctx, lt, t) => {
    studio(ctx, t, { dim: 0.6 });
    photoFrame(ctx, { x: 720, y: 680, w: 480, h: 360, preset: 'day', k: on(t, TW(3, 'ไรเดอร์'), 0.4) }, frameInner);
    narr(ctx, { x: 290, y: 1600, scale: 1.3, expr: 'happy', arms: { r: { x: 120, y: -330, bend: 'down' } } }); deskF(ctx);
  });
  // 5 ซูมทะลุกรอบ
  shot(T(4), (ctx, lt, t) => {
    studio(ctx, t, { dim: 0.6 });
    photoFrame(ctx, { x: 720, y: 680, w: 480, h: 360, preset: 'night' }, (c) => { roadNight(c, { t, roadY: 820 }); });
    narr(ctx, { x: 290, y: 1600, scale: 1.3, expr: 'smug', arms: { l: 'shrug', r: 'shrug' } }); deskF(ctx);
  }, { cam: (lt) => ({ x: 720, y: 680, zoom: 1 + Math.pow(clamp(lt / 1.38, 0, 1), 2) * 3 }) });
  // 6 ตีสอง
  shot(T(5), (ctx, lt, t) => {
    room(ctx); clock0200(ctx, { x: 780, y: 560, s: 1, k: on(t, T(5), 0.35) });
    drawChar(ctx, 'rider', { x: 400, y: 1640, scale: 1.7, expr: 'sleep', arms: { r: 'phone' }, prop: { type: 'phone' }, talk: true });
  });
  // 7 จอแอปไรเดอร์
  shot(T(6), (ctx, lt, t) => {
    digitalSky(ctx, { t }); ctx.fillStyle = 'rgba(10,20,60,0.55)'; ctx.fillRect(0, 0, W, 1920);
    phoneScreen(ctx, { x: 540, y: 900, s: 1.7, screen: 'order', k: on(t, TW(6, 'ชานม'), 0.4), k2: on(t, TW(7, 'บ้านพัก'), 0.4) });
  });
  // 8 ถนนป่า pan + เสาไฟดับ
  shot(T(8), (ctx, lt, t) => {
    roadAt(ctx, t, { poles: t > TW(9, 'ไม่มีไฟ') - 0.6 });
    ride(ctx, t, { x: 300 + lt * 40, y: 1500, s: 0.6, beam: 600 });
  });
  // 9 บิดมอเตอร์ไซค์
  shot(T(10), (ctx, lt, t) => {
    const go = on(t, TW(10, 'บิด'), 0.6), cut = on(t, T(11), 0.5);
    roadAt(ctx, t, { speed: go * 0.5 });
    ctx.fillStyle = `rgba(5,8,25,${0.45 * (1 - cut)})`; ctx.fillRect(0, 0, W, 1920);
    ride(ctx, t, { x: 380 + go * 60, y: 1560, s: 1.1, beam: 500 + cut * 400, expr: 'angry', talk: true });
  });
  // 10 ขนลุก
  shot(T(12), (ctx, lt, t) => {
    roadAt(ctx, t * 0.3, { sway: 1 });
    const sh = on(t, TW(12, 'ขนลุก'), 0.2);
    drawChar(ctx, 'rider', { x: 540, y: 1800, scale: 2.4, expr: 'sweat', arms: { l: { x: -120, y: -190 }, r: { x: 120, y: -190 } }, talk: true, shiver: sh, goose: sh });
  });
  // 11 จู่ ๆ
  shot(T(13), (ctx, lt, t) => { roadAt(ctx, t * 0.3); drawChar(ctx, 'rider', { x: 540, y: 1800, scale: 2.4, expr: 'shock', talk: true }); },
    { cam: { x: 540, y: 960, zoom: 1.04, shake: true } });
  // 12 POV ผีในลำแสง
  const povBeam = (ctx) => {
    const g = ctx.createLinearGradient(0, 1920, 0, 1000);
    g.addColorStop(0, 'rgba(255,240,170,0.55)'); g.addColorStop(1, 'rgba(255,240,170,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(380, 1920); ctx.lineTo(150, 1100); ctx.lineTo(930, 1100); ctx.lineTo(700, 1920); ctx.fill();
  };
  shot(T(14), (ctx, lt, t) => {
    roadNight(ctx, { t, roadY: 1100 }); povBeam(ctx);
    drawChar(ctx, 'ghost', { x: 540, y: 1300, scale: 1.0, alpha: on(t, TW(14, 'ชุดขาว'), 0.8) });
  });
  // 13 โบกมือ เอียงคอ
  shot(T(15), (ctx, lt, t) => {
    roadNight(ctx, { t, roadY: 1100 }); povBeam(ctx);
    const odd = t > T(16) ? (Math.floor((t - T(16)) * 1.6) % 2 ? 0.35 : -0.35) : 0;
    drawChar(ctx, 'ghost', { x: 540, y: 1500, scale: 1.5, wave: t > TW(15, 'โบก') - 0.2, tilt: odd });
  });
  // 14 หักหลบ
  shot(T(17), (ctx, lt, t) => {
    roadAt(ctx, t, { speed: 0.3 });
    drawChar(ctx, 'ghost', { x: 820 - lt * 200, y: 1460, scale: 0.8 });
    ride(ctx, t, { x: 260 + lt * 120, y: 1640 + lt * 20, s: 0.85, lean: -0.18, expr: 'shock', talk: true });
  });
  // 15 หันมองกระจก
  shot(T(18), (ctx, lt, t) => {
    roadAt(ctx, t * 0.3);
    ctx.fillStyle = '#6b7290'; ctx.beginPath(); ctx.ellipse(860, 700, 150, 110, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1d2a5c'; ctx.beginPath(); ctx.ellipse(860, 700, 125, 88, 0, 0, Math.PI * 2); ctx.fill();
    drawChar(ctx, 'rider', { x: 480 - on(t, TW(18, 'หันกลับ'), 1) * 40, y: 1800, scale: 2.3, expr: 'scared', talk: true });
  });
  // 16–17 กระจกหลัง: ว่าง → ผีโผล่
  const mirror = (ctx, t, g) => {
    sky(ctx, 'roadNight'); mirrorView(ctx, { x: 540, y: 820, w: 860, h: 620 }, (c) => { roadNight(c, { t, roadY: 1250 }); });
    if (!g) return;
    ctx.save(); ctx.beginPath(); ctx.ellipse(540, 820, 430, 310, 0, 0, Math.PI * 2); ctx.clip();
    const k = prog(t, T(19), 0.2);
    drawChar(ctx, 'ghost', { x: 540, y: 1180 + (1 - k) * 200, scale: 1.4, smile: 1 });
    ctx.restore();
  };
  shot(TW(18, 'กระจก'), (ctx, lt, t) => mirror(ctx, t, false));
  shot(T(19), (ctx, lt, t) => mirror(ctx, t, true), { cam: (lt) => ({ x: 540, y: 960, zoom: 1.04, shake: lt < 0.6 }) });
  // 18 ผีลอยตาม
  shot(T(20), (ctx, lt, t) => {
    roadAt(ctx, t * 1.6, { speed: 0.7 });
    drawChar(ctx, 'ghost', { x: 250 + sin(t * 2) * 30, y: 1380, scale: 0.9, blow: 1, tilt: -0.2 });
    ride(ctx, t, { x: 700, y: 1600, s: 0.85, expr: 'shock', talk: true });
  });
  // 19 ยิ้มถึงหู
  shot(TW(21, 'รอยยิ้ม'), (ctx, lt, t) => {
    roadAt(ctx, t * 1.6, { speed: 0.5 });
    drawChar(ctx, 'ghost', { x: 540, y: 1900, scale: 3.0, smile: 0.3 + 0.7 * on(t, TW(21, 'ถึงใบหู'), 0.4) });
  });
  // 20 สติหลุด
  shot(T(22), (ctx, lt, t) => {
    roadAt(ctx, t * 0.5);
    drawChar(ctx, 'rider', { x: 540, y: 1820, scale: 2.4, expr: 'swirl', talk: true });
    const k = on(t, TW(22, 'สติ'), 0.5) * (1 - on(t, TW(22, 'สติ') + 0.9, 0.4));
    soulWisp(ctx, { x: 540, y: 1820 - 2.4 * 360, k, t });
  });
  // 21 มิดไมล์
  shot(T(23), (ctx, lt, t) => {
    roadAt(ctx, t * 3, { speed: 1 });
    drawChar(ctx, 'ghost', { x: 120 - lt * 260, y: 1380, scale: 0.6, alpha: 1 - on(t, T(23) + 0.6, 1) });
    ride(ctx, t, { x: 600, y: 1600, s: 0.95, expr: 'angry', lean: 0.08, talk: true });
  }, { cam: (lt) => ({ x: 540 + lt * 30, y: 960, zoom: 1.04 }) });
  // 22 ส่งของ → ขาสั่น
  shot(T(24), (ctx, lt, t) => {
    house(ctx, t);
    const after = t > TW(24, 'ขากลับ');
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(after ? 470 : 520, 1500, 90, 16, 0, 0, Math.PI * 2); ctx.fill();
    motorcycle(ctx, { x: 230, y: 1500, s: 0.8, light: false, t: 0 });
    if (!after) drawChar(ctx, 'rider', { x: 520, y: 1500, scale: 1.4, expr: 'sweat', arms: { r: { x: 110, y: -170, bend: 'down' } }, shiver: 0.6, talk: true });
    else drawChar(ctx, 'rider', { x: 470, y: 1500, scale: 1.4, expr: 'pale', shiver: 1.2, talk: true });
    if (!after) { ctx.fillStyle = '#16b85a'; ctx.fillRect(520 + 110 * 1.4 - 45, 1500 - 170 * 1.4 - 50, 90, 70); ctx.fillStyle = '#f6c9a2'; ctx.beginPath(); ctx.arc(520 + 154, 1500 - 238, 13 * 1.4, 0, Math.PI * 2); ctx.fill(); }
  });
  // 23 ไม่ไหว
  shot(T(25), (ctx, lt, t) => {
    house(ctx, t);
    const shake = t > TW(25, 'ไม่ไหว') ? sin(t * 14) * 40 : 0;
    drawChar(ctx, 'rider', { x: 540 + shake, y: 1880, scale: 2.4, expr: 'pale', talk: true });
  });
  // 24 แจ็กพอต bubble
  shot(T(26), (ctx, lt, t) => {
    house(ctx, t);
    drawChar(ctx, 'rider', { x: 340, y: 1880, scale: 2.2, expr: 'sweat', talk: true });
    thoughtBubble(ctx, { x: 720, y: 560, r: 250, k: on(t, TW(26, 'แจ็กพอต'), 0.4), tailX: 460, tailY: 1000 }, (c) => {
      c.fillStyle = '#1d2a5c'; c.fillRect(-300, -300, 600, 600);
      drawChar(c, 'ghost', { x: -80, y: 150, scale: 0.55, smile: 1 }); drawChar(c, 'ghost', { x: 90, y: 150, scale: 0.55, smile: 1, wave: true });
    });
  });
  // 25 หยิบมือถือ ฟ้าเปลี่ยน
  shot(T(27), (ctx, lt, t) => {
    const k = on(t, TW(27, 'หยิบ'), 0.6);
    digitalSky(ctx, { t }); ctx.fillStyle = `rgba(12,20,51,${1 - k})`; ctx.fillRect(0, 0, W, 1920);
    const ph = t > TW(27, 'หยิบ');
    drawChar(ctx, 'rider', { x: 540, y: 1700, scale: 2.0, expr: ph ? 'happy' : 'sweat', arms: ph ? { r: 'phone' } : {}, prop: ph ? { type: 'phone' } : null, talk: true });
  });
  // 26 เว็บโรงแรม + logoCard
  shot(T(28), (ctx, lt, t) => { digitalSky(ctx, { t }); phoneScreen(ctx, { x: 540, y: 1000, s: 1.6, screen: 'hotel', logo, k: on(t, T(28), 0.6), k2: 0 }); },
    { overlay: (ctx, lt, t) => logoCard(ctx, logo, { x: 540, y: 300, w: 560, k: on(t, T(29), 0.45) }) });
  // 27 การ์ดห้อง + หมุดใกล้ที่สุด
  shot(T(30), (ctx, lt, t) => {
    digitalSky(ctx, { t });
    const r = (lt % 1.2) / 1.2;
    phoneScreen(ctx, { x: 540, y: 960, s: 1.6, screen: 'hotel', logo, k: 1, k2: on(t, TW(30, 'ราคา'), 0.8), tap: { x: 0, y: 30, ring: r } });
  });
  // 28 sparkle + พยักหน้า
  shot(T(32), (ctx, lt, t) => {
    digitalSky(ctx, { t });
    const nod = t > T(33) ? Math.abs(sin((t - T(33)) * 8)) * 18 : 0;
    drawChar(ctx, 'rider', { x: 540, y: 1700 + nod, scale: 2.0, expr: 'laugh', arms: { r: 'phone' }, prop: { type: 'phone' }, talk: true });
    sparkles(ctx, { x: 540 + 2.0 * 22, y: 1700 - 2.0 * 210, r: 130, t, k: on(t, TW(32, 'สะอาดตา'), 0.4) });
  });
  // 29 แตะไม่กี่คลิก → ติ๊กถูก (วงแตะต่อเนื่อง ไม่นับจำนวน)
  shot(T(34), (ctx, lt, t) => {
    digitalSky(ctx, { t });
    const done = t > TW(34, 'ได้ห้อง');
    phoneScreen(ctx, { x: 540, y: 960, s: 1.6, screen: done ? 'done' : 'hotel', logo, k: 1, k2: done ? on(t, TW(34, 'ได้ห้อง'), 0.4) : 1, tap: done ? null : { x: 0, y: 262, ring: (lt % 0.5) / 0.5 } });
  });
  // 30 เข้าห้อง แอร์ฉ่ำ
  shot(T(35), (ctx, lt, t) => {
    hotelRoom(ctx, { t, cool: on(t, T(36), 0.4), door: true });
    bed(ctx, { x: 640, y: 1560, w: 640 });
    drawChar(ctx, 'rider', { x: 240, y: 1560, scale: 1.3, expr: 'happy', arms: { l: 'cheer', r: 'cheer' }, talk: true });
  });
  // 31 ซุกตัว
  shot(T(37), (ctx, lt, t) => {
    hotelRoom(ctx, { t, cool: 1 });
    bed(ctx, { x: 540, y: 1600, w: 900 });
    const k = on(t, TW(37, 'ซุกตัว'), 0.5);
    drawChar(ctx, 'rider', { x: 430, y: 1720, scale: 1.6, expr: k < 1 ? 'scared' : 'happy' });
    blanket(ctx, { x: 540, y: 1920, w: 900, top: 1450 - k * 120 });
  }, { cam: { x: 540, y: 1100, zoom: 1.2 } });
  // 32 หลับจนเช้า
  shot(T(38), (ctx, lt, t) => {
    hotelRoom(ctx, { t, dawn: on(t, TW(38, 'ฟ้าสว่าง'), 0.9) });
    bed(ctx, { x: 540, y: 1600, w: 900 });
    drawChar(ctx, 'rider', { x: 430, y: 1720, scale: 1.6, expr: t > TW(38, 'ฟ้าสว่าง') ? 'happy' : 'sleep' });
    blanket(ctx, { x: 540, y: 1920, w: 900, top: 1330 });
  });
  // 33 สอนใจ
  shot(T(39), (ctx, lt, t) => { studio(ctx, t, { bright: 1 }); narr(ctx, { expr: 'smug', arms: { r: 'up' } }); deskF(ctx); });
  // 34 bubble ไรเดอร์ / ผี / แตก
  shot(T(40), (ctx, lt, t) => {
    studio(ctx, t); narr(ctx, { x: 540, y: 1620, scale: 1.4, expr: t > T(42) ? 'sad' : 'scared', arms: { l: 'cheek', r: 'cheek' } }); deskF(ctx);
    const pk = on(t, TW(42, 'พัง'), 0.35);
    if (pk < 1) thoughtBubble(ctx, { x: 540, y: 640, r: 330 * (1 + pk * 0.3), k: on(t, TW(40, 'ไรเดอร์'), 0.4) * (1 - pk), tailX: 540, tailY: 1060 }, (c, rr) => {
      // ฉากเต็มจอ (1080×1920) ย่อให้คลุมเต็มวงกลม: ความกว้างเท่าเส้นผ่านศูนย์กลาง จัดกึ่งกลางที่ระดับถนน
      const s = (2 * rr) / 1080;
      c.save(); c.scale(s, s); c.translate(-540, -1250);
      roadNight(c, { t, scroll: t * 500 });
      c.restore();
    });
    if (pk < 1 && t > TW(40, 'ไรเดอร์')) {
      ctx.save(); ctx.translate(540, 640); ctx.scale(1 - pk, 1 - pk);
      ctx.beginPath(); ctx.arc(0, 0, 310, 0, Math.PI * 2); ctx.clip();
      ride(ctx, t, { x: 40, y: 220, s: 0.55, expr: 'scared', beam: 300 });
      if (t > TW(41, 'ผี')) drawChar(ctx, 'ghost', { x: -170, y: 160, scale: 0.45 * Math.min(1, S.prog(t, TW(41, 'ผี'), 0.3) * 1.2), smile: 1 });
      ctx.restore();
    }
  });
  // 35 ถือมือถือหันจอ
  shot(T(43), (ctx, lt, t) => { studio(ctx, t, { bright: 1 }); narr(ctx, { y: 1700, scale: 1.8, expr: 'laugh', arms: { r: { x: 70, y: -230, bend: 'down' } }, prop: { type: 'phone' } }); });
  // 36–37 logoCard ค้าง ชูนิ้ว ซูมออก
  const logoOv = (ctx, lt, t) => logoCard(ctx, logo, { x: 540, y: 520, w: 640, k: on(t, T(47), 0.45) });
  shot(T(46), (ctx, lt, t) => { studio(ctx, t, { bright: 1 }); narr(ctx, { y: 1700, scale: 1.8, expr: 'happy' }); }, { overlay: logoOv });
  shot(T(49), (ctx, lt, t) => {
    studio(ctx, t, { bright: 1.5 });
    narr(ctx, { expr: 'laugh', arms: t > TW(49, 'ปลอดภัย') ? { r: 'cheer' } : {} }); deskF(ctx);
  }, { cam: (lt) => ({ x: 540, y: 1100, zoom: 1.25 - clamp(lt / 3, 0, 1) * 0.25 }), overlay: logoOv });
}
