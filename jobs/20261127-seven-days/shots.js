// คนเกิด 7 วัน จองโรงแรม — 24 ช็อต (+end card อัตโนมัติ) ไม่มีตัวอักษร/ตัวเลขในภาพ (L12 L17 L22)
// ของถือทั้งหมดเป็น prop ของ rig ผูกมือ (L23) · แตะจอใช้ tap ใน phoneScreen (L20) · ปากปิดทุกช็อตยกเว้น #16
export default function (S) {
  const { shot, T, E, TW, prog, clamp, drawChar, logo, W, H } = S;
  S.keywords(['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์', 'พักอิน']);
  const P = (t, a, d = 0.4) => prog(t, a, d);
  const eo = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
  const ei = (k) => { k = clamp(k, 0, 1); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const pop = (k) => { k = clamp(k, 0, 1); return 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2); };
  const IDS = S.DAY7_IDS, COL = S.DAY7;
  const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

  // whip pan: เนื้อหาพุ่งจากขวาเข้ากลาง + เส้นความเร็ว 0.3 วิแรก
  const whip = (bg, draw) => (ctx, lt, t, s) => {
    const k = eo(lt / 0.3);
    R(ctx, 0, 0, W, H, bg);
    ctx.save(); ctx.translate((1 - k) * 760, 0); draw(ctx, lt, t, s); ctx.restore();
    if (k < 1) { ctx.fillStyle = `rgba(255,255,255,${0.75 * (1 - k)})`; for (let i = 0; i < 14; i++) ctx.fillRect(((i * 197) % 900) - 200 + k * 300, 120 + i * 120, 520, 12); }
  };
  // จอจองโรงแรม (ไม่มีตัวอักษร): แถบหัว รูป เส้นเทา ปุ่ม done=ติ๊กถูก
  const bookScreen = (done = 0, opt = {}) => (c) => {
    c.fillStyle = opt.bg || '#ffffff'; c.fillRect(-150, -300, 300, 600);
    c.fillStyle = opt.head || '#2f6fdf'; c.fillRect(-150, -300, 300, 70);
    c.fillStyle = '#9fd8f7'; c.beginPath(); c.roundRect(-125, -205, 250, 150, 16); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-125, -80); c.lineTo(-30, -160); c.lineTo(125, -100); c.lineTo(125, -60); c.lineTo(-125, -60); c.fill();
    c.fillStyle = '#c8d3e3'; for (let i = 0; i < 4; i++) { c.beginPath(); c.roundRect(-125, -30 + i * 44, i % 2 ? 170 : 240, 16, 8); c.fill(); }
    c.fillStyle = opt.btn || '#f6b860'; c.beginPath(); c.roundRect(-100, 200, 200, 56, 28); c.fill();
    if (done > 0) { c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(-150, -300, 300, 600); c.save(); c.scale(pop(done), pop(done)); S.check(c, 0, 0, 90); c.restore(); }
  };
  const BTN = { x: 0, y: 228 };
  const tapAt = (t, t0, sleeve, d = 0.45) => (t >= t0 - 0.25 && t < t0 + d + 0.35 ? { ...BTN, ring: P(t, t0, d), sleeve } : null);

  // 1 แผนที่ต่างจังหวัด → หมุด → เงา 7 สี → ไอคอนเตียง + ?
  shot(T(0), (ctx, lt, t) => {
    S.provinceMap(ctx, { k: P(t, T(0), 0.8), t });
    const kp = P(t, T(1), 0.4);
    S.shadows7(ctx, { x: 560, y: 1040, k: P(t, T(2), 0.9), r: 300 });
    if (kp > 0) S.pin(ctx, 560, 1080 - 60 * (1 - pop(kp)), '#ff4d6d', 3 * pop(kp));
    const kb = P(t, T(3), 0.4);
    if (kb > 0) {
      ctx.save(); ctx.translate(560, 720); ctx.scale(pop(kb), pop(kb));
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(-210, -150, 420, 260, 50); ctx.fill();
      S.bedIcon(ctx, -50, 30, 1.3, '#2f6fdf'); ctx.restore();
      S.qShape(ctx, 720 + Math.sin(t * 6) * 6, 650, 1.3, '#ef4444', P(t, T(3) + 0.2, 0.35));
    }
  });

  // 2 แถบ 7 สี ทั้ง 7 เด้งเข้า → โพสพร้อมกัน ประกาย
  const row7 = (ctx, t, t0, posed, extra = {}) => {
    IDS.forEach((id, i) => {
      const k = P(t, t0 + i * 0.18, 0.35); if (k <= 0) return;
      const x = 112 + i * 142, y = i % 2 ? 1500 : 1320, sc = 0.8 * pop(k);
      const pose = posed
        ? [{ l: 'hips', r: 'cheer' }, { l: 'cheer', r: 'cheer' }, { l: 'hips', r: 'point' }, { l: 'thumb', r: 'hips' }, { l: 'wave', r: 'cheer' }, { l: 'fold', r: 'fold' }, { l: 'hips', r: 'point' }][i]
        : { l: 'down', r: 'down' };
      drawChar(ctx, id, { x, y: y - (posed ? Math.abs(Math.sin(t * 6 + i)) * 20 : 0), scale: sc, expr: posed ? (i === 5 ? 'bliss' : 'grin') : 'smug', arms: pose, ...extra });
    });
  };
  shot(T(4), (ctx, lt, t) => {
    S.stripes7(ctx, { t });
    row7(ctx, t, T(4), t >= T(5));
    if (t >= T(5)) S.sparkles(ctx, { x: 540, y: 1050, r: 420, t, n: 10, k: P(t, T(5), 0.4) });
  }, { cam: (lt, t) => ({ x: 540, y: 1150, zoom: 1 + 0.03 * ei(P(t, T(5), 1.2)) }) });

  // 3 ห้องเหลือง mon ดันแว่น → กางปฏิทินยาวถึงพื้น
  shot(T(6), whip('#fdf0b0', (ctx, lt, t) => {
    S.toneRoom(ctx, { color: COL[0], t });
    const push = t < T(6) + 1.1 && t > T(6) + 0.35;
    const u = P(t, T(7), 0.75);
    drawChar(ctx, 'mon', { x: 360, y: 1560, scale: 1.25, expr: u > 0 ? 'grin' : 'smug',
      arms: { l: push ? { x: 22, y: -300, bend: 'down' } : 'hips', r: t >= T(7) ? 'unroll' : 'down' },
      prop: t >= T(7) ? { type: 'calendarBig', unroll: u, len: 1000 } : null });
  }));

  // 4 close mon + มือถือ: กระเป๋าทำงาน ? → กระพริบ → แตะจอง ติ๊กถูก ดอกไม้
  shot(T(8), (ctx, lt, t) => {
    S.toneRoom(ctx, { color: COL[0], t });
    const ok = P(t, T(10) + 0.45, 0.4);
    drawChar(ctx, 'mon', { x: 280, y: 1820, scale: 1.7, expr: ok > 0 ? 'bliss' : 'happy', arms: { l: 'hold', r: ok > 0 ? 'cheer' : 'hips' } });
    const kb = P(t, T(8), 0.4);
    if (kb > 0 && ok <= 0) {
      const blink = t >= T(9) ? (Math.sin(t * 16) > 0 ? 1 : 0.25) : 1;
      ctx.globalAlpha = blink; S.briefcaseIcon(ctx, 260, 880, 1.3 * pop(kb)); ctx.globalAlpha = 1;
      S.qShape(ctx, 420, 820, 1.1, '#ef4444', kb);
    }
    S.phoneScreen(ctx, { x: 740, y: 900, s: 0.85, screen: 'custom', draw: bookScreen(ok), tap: tapAt(t, T(10), COL[0]) });
    S.flowers(ctx, { x: 300, y: 1250, r: 260, t, k: ok });
  });

  // 5 ถนนชมพูกลางคืน tue วิ่งเข้ามา ตาเป็นไฟ เปลวไฟรอบตัว
  shot(T(11), whip('#3a2a6e', (ctx, lt, t) => {
    S.pinkNightRoad(ctx, { scroll: t * 900, t });
    const x = 540 + (1 - eo(P(t, T(11), 0.6))) * -500;
    const fire = t >= T(12);
    if (fire) for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + t * 4; S.flameShape(ctx, x + Math.cos(a) * 230, 1300 + Math.sin(a) * 260, 2.4, t + i, '#ff7a1a', '#ffd23f'); }
    drawChar(ctx, 'tue', { x, y: 1560 - Math.abs(Math.sin(t * 14)) * 24, scale: 1.3, mode: 'walk', walkPhase: t * 14, expr: fire ? 'fire' : 'grin' });
  }));

  // 6 nightRoom พระจันทร์ต่ำ→สูง tue ดีดจากเตียง หลอดไฟ → ยัดเสื้อลงกระเป๋า ปิดปึ้ง
  shot(T(13), (ctx, lt, t) => {
    S.nightRoom(ctx, { moon: P(t, T(13), T(15) - T(13)), t });
    S.bed(ctx, { x: 330, y: 1560, w: 520 });
    const jump = Math.sin(Math.PI * P(t, T(13), 0.5)) * 140;
    const pack = t >= T(14);
    const lid = 1 - P(t, T(14) + 0.4, 0.15);
    S.suitcaseBox(ctx, { x: 790, y: 1560, s: 0.8, stuff: P(t, T(14), 0.4), lid: pack ? lid : 1 });
    const pump = pack && lid > 0 ? Math.sin(t * 30) * 30 : 0;
    drawChar(ctx, 'tue', { x: 480, y: 1580 - jump, scale: 1.2, expr: pack ? 'fire' : 'starry',
      arms: pack ? { l: 'hips', r: { x: 132, y: -150 + pump, bend: 'down' } } : { l: 'cheer', r: 'cheer' } });
    S.bulb(ctx, 480, 820 - jump, 1, P(t, T(13) + 0.15, 0.35), t);
  });

  // 7 ในรถกลางคืน: พุ่ง → ไฟแดงชะลอ → แตะจอง ป้ายบ้านพักโผล่
  shot(T(15), (ctx, lt, t) => {
    const slow = P(t, T(16), 0.8);
    const scroll = (t - T(15)) * 600 - slow * (t - T(16)) * 600 * 0.9;
    const red = t >= T(16);
    S.carInterior(ctx, { view: 'front', t, scroll: Math.max(0, scroll) * 2, light: (c) => {
      if (red) S.trafficLight(c, { x: 820, y: 560, s: 0.75 * pop(P(t, T(16), 0.4)), state: 'red' });
      S.houseSign(c, { x: 240, y: 640, s: 0.8, k: P(t, T(17) + 0.25, 0.35) });
    } });
    const book = t >= T(17);
    drawChar(ctx, 'tue', { x: 330, y: 1700, scale: 1.25, mode: 'sit', expr: book ? 'grin' : (red ? 'smug' : 'happy'),
      arms: { l: 'wheel', r: 'wheel' }, prop: { type: 'wheel', rot: red ? 0 : Math.sin(t * 3) * 0.08 } });
    const pk = P(t, T(17) - 0.2, 0.3);
    if (pk > 0) S.phoneScreen(ctx, { x: 790, y: 1240, s: 0.62 * pop(pk), rot: -0.08, screen: 'custom', draw: bookScreen(P(t, T(17) + 0.5, 0.3)), tap: tapAt(t, T(17) + 0.05, COL[1], 0.4) });
  }, { cam: (lt, t) => { const z = ei(P(t, T(17) - 0.3, 0.6)); return { x: 540 + 120 * z, y: 1000 + 120 * z, zoom: 1 + 0.18 * z }; } });

  // 8 ห้องเขียว wed นั่งโต๊ะ แว่นขยาย ตาหรี่ → ดาวรีวิวลอยวน
  const wedDesk = (ctx) => { R(ctx, 0, 1500, W, 40, '#15803d'); R(ctx, 60, 1540, W - 120, 400, '#1f9a4c'); };
  shot(T(18), whip('#c8f0d6', (ctx, lt, t) => {
    S.toneRoom(ctx, { color: COL[2], t, books: true });
    drawChar(ctx, 'wed', { x: 560, y: 1620, scale: 1.3, mode: 'sit', expr: 'happy', arms: { l: 'hold', r: 'magnify' }, prop: { type: 'magnifier' } });
    wedDesk(ctx);
    const k = P(t, T(19), 0.4);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + t * 1.5; S.star(ctx, 560 + Math.cos(a) * 230, 760 + Math.sin(a) * 70, 44 * pop(k), '#facc15'); }
  }));

  // 9 close จอรีวิว แว่นขยายไล่บรรทัด → ซูมรูปห้องน้ำ → กระเบื้องหินอ่อนเต็มเฟรม
  const reviewScreen = (c) => {
    c.fillStyle = '#ffffff'; c.fillRect(-150, -300, 300, 600); c.fillStyle = '#22c55e'; c.fillRect(-150, -300, 300, 60);
    c.fillStyle = '#ece7df'; c.beginPath(); c.roundRect(-125, -220, 250, 120, 14); c.fill();
    c.strokeStyle = 'rgba(150,150,170,0.6)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-110, -200); c.bezierCurveTo(-40, -230, 20, -120, 110, -150); c.stroke();
    for (let i = 0; i < 8; i++) { c.fillStyle = i % 3 === 0 ? '#facc15' : '#c8d3e3'; c.beginPath(); c.roundRect(-125, -70 + i * 44, i % 3 === 0 ? 90 : 230 - (i % 2) * 60, 16, 8); c.fill(); }
  };
  shot(T(20), (ctx, lt, t) => {
    const z = P(t, T(21), 0.5);
    if (t < T(21) + 0.5) {
      S.toneRoom(ctx, { color: COL[2], t, books: true });
      S.phoneScreen(ctx, { x: 560, y: 1180, s: 0.8, screen: 'custom', draw: reviewScreen });
      const k = ei(P(t, T(20), T(21) - T(20)));
      drawChar(ctx, 'wed', { x: 230, y: 1760, scale: 1.45, expr: 'happy', arms: { l: 'down', r: { x: 128 + 10 * k, y: -312 + 70 * k, bend: 'down' } }, prop: { type: 'magnifier', r: 46 } });
    } else {
      S.marbleTile(ctx, { t, shine: P(t, T(21) + 0.5, 0.4) });
      drawChar(ctx, 'wed', { x: 300, y: 1800, scale: 1.6, expr: 'starry', eyes: 'normal', arms: { l: 'cheek', r: 'cheek' } });
    }
  }, { cam: (lt, t) => { const z = ei(P(t, T(21), 0.5)); return t < T(21) + 0.5 ? { x: 560, y: 1180 - 210 * z, zoom: 1 + 2 * z } : { x: 540, y: 960, zoom: 1 }; } });

  // 10 ห้องฝุ่น ใยแมงมุมงอก → เพื่อนลากกระเป๋าเดินผ่านโบกมือลา wed หันตามเหวอ
  shot(T(22), (ctx, lt, t) => {
    S.toneRoom(ctx, { color: COL[2], t, books: true, dust: 1 });
    const wk = P(t, T(23), 1.5), walking = t >= T(23) && wk < 1;
    if (t >= T(23)) drawChar(ctx, 'pal', { x: 140 + wk * 1020, y: 1480, scale: 0.8, mode: 'walk', walkPhase: t * 9, dir: 1, expr: 'happy',
      arms: { l: 'wave', r: 'drag' }, prop: { type: 'suitcase', color: '#facc15' } });
    const turn = t >= T(23) + 0.5;
    drawChar(ctx, 'wed', { x: 540, y: 1620, scale: 1.3, mode: 'sit', dir: turn ? -1 : 1, expr: turn ? 'shock' : 'happy', eyes: turn ? 'normal' : undefined,
      arms: { l: 'hold', r: 'magnify' }, prop: { type: 'magnifier' } });
    wedDesk(ctx);
    S.cobweb(ctx, { x: 60, y: 1500, r: 520, k: P(t, T(22), 1.0), ang: -Math.PI / 3, spread: Math.PI / 2.2 });
    S.cobweb(ctx, { x: 1020, y: 1500, r: 380, k: P(t, T(22) + 0.3, 0.9), ang: -Math.PI * 0.7, spread: Math.PI / 2.5 });
    if (walking) S.sparkles(ctx, { x: 160 + wk * 1000, y: 1150, r: 90, t, n: 4, k: 0.6 });
  });

  // 11 ห้องส้ม กระดานกราฟ thu ดันแว่นกลม → กระปุกออมสิน+เหรียญเด้ง
  shot(T(24), whip('#ffe0c2', (ctx, lt, t) => {
    S.toneRoom(ctx, { color: COL[3], t, board: true });
    const push = t > T(24) + 0.3 && t < T(25);
    drawChar(ctx, 'thu', { x: 720, y: 1580, scale: 1.25, expr: 'smug', arms: { l: 'hips', r: push ? { x: 22, y: -300, bend: 'down' } : 'point' } });
    const k = P(t, T(25), 0.35);
    if (k > 0) { S.piggy(ctx, 300, 1000, 1.1 * pop(k)); for (let i = 0; i < 3; i++) { const kk = P(t, T(25) + 0.1 + i * 0.1, 0.3); S.coin(ctx, 220 + i * 90, 860 - 80 * Math.sin(Math.PI * kk), 30 * pop(kk)); } }
  }));

  // 12 close โต๊ะ thu กดเครื่องคิดเลข ตาวน → การ์ด 3 ใบสลับ → ใบหนึ่งเรือง ถ้วยรางวัล ชูหมัด
  shot(T(26), (ctx, lt, t) => {
    S.toneRoom(ctx, { color: COL[3], t });
    const sh = P(t, T(27), 1.0), win = P(t, T(28), 0.4);
    const cards = [COL[4], COL[1], COL[2]];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + ei(sh) * Math.PI * 6;
      const cx = sh > 0 && sh < 1 ? 540 + Math.cos(a) * 260 : 280 + i * 260, cy = sh > 0 && sh < 1 ? 700 + Math.sin(a) * 90 : 700;
      S.promoCard(ctx, { x: cx, y: cy, color: cards[i], glow: i === 1 ? win : 0, s: 0.85 * (i === 1 ? 1 + 0.15 * pop(win) : 1) });
    }
    S.trophy(ctx, 540, 450, 1, P(t, T(28) + 0.15, 0.4));
    if (win > 0) S.sparkles(ctx, { x: 540, y: 600, r: 220, t, n: 7, k: win });
    const pressing = win <= 0;
    const press = Math.floor(t * 9);
    drawChar(ctx, 'thu', { x: 540, y: 1700, scale: 1.45, expr: pressing ? 'swirl' : 'grin',
      arms: { l: { x: -16, y: -120, bend: 'down' }, r: pressing ? { x: -26 + (press % 3) * 16, y: -158 - (press % 2) * 12, bend: 'down' } : 'cheer' },
      prop: { type: 'calculator', hand: 'l', press: pressing ? press : null, glow: !pressing } });
    R(ctx, 0, 1560, W, 40, '#c2410c'); R(ctx, 40, 1600, W - 80, 400, '#ea7a2c');
  }, { cam: { x: 540, y: 1060, zoom: 1.04 } });

  // 13 ปาร์ตี้ฟ้า fri เต้น → ดิสโก้หมุน → วิลล่าสว่าง → เซลฟี่แฟลช → สตอรี่หัวใจ
  shot(T(29), whip('#1c3f7a', (ctx, lt, t) => {
    S.partyRoom(ctx, { t, spin: P(t, T(30), 0.5), villa: P(t, T(31), 0.6) });
    const selfie = t >= T(32);
    const beat = Math.sin(t * 9);
    drawChar(ctx, 'fri', { x: 440, y: 1600 - Math.abs(beat) * 26, scale: 1.4, expr: 'grin',
      arms: selfie ? { l: 'hips', r: 'selfie' } : { l: beat > 0 ? 'cheer' : 'hips', r: beat > 0 ? 'hips' : 'cheer' },
      prop: selfie ? { type: 'selfieStick', len: 130, flash: Math.max(0, 1 - P(t, T(32) + 0.25, 0.3)) * (t > T(32) + 0.25 ? 1 : 0) } : null });
    S.storyRing(ctx, { x: 800, y: 560, r: 120, k: P(t, T(33), 0.3) });
  }));

  // 14 close fri ยิ้มแห้ง: ใบเสร็จลอยมา ปัดทิ้ง → ปฏิทินพลิก ใบเสร็จตกใส่ ตาโต เหงื่อตก
  shot(T(34), (ctx, lt, t) => {
    S.partyRoom(ctx, { t, spin: 1, villa: 1 });
    const swat = P(t, T(34) + 0.45, 0.35);
    const inK = eo(P(t, T(34), 0.45));
    const hit = t >= T(35) + 0.35;
    drawChar(ctx, 'fri', { x: 520, y: 1800, scale: 1.7, expr: hit ? 'sweat' : 'smug', eyes: hit ? 'big' : undefined,
      arms: { l: 'hips', r: t >= T(34) + 0.3 && swat < 1 ? 'swat' : 'down' } });
    if (swat < 1) S.receiptStrip(ctx, 1000 - 300 * inK - 900 * eo(swat), 700 - 200 * eo(swat), 300, 0.3 - 2.5 * swat);
    S.calendarIcon(ctx, { x: 820, y: 520, s: 1, k: P(t, T(35), 0.3), flip: (t * 3) % 1 });
    const fall = eo(P(t, T(35) + 0.05, 0.3));
    if (t >= T(35)) S.receiptStrip(ctx, 710 - 40 * (1 - fall), -300 + 1462 * fall, 380, 0.3 + 1.2 * fall); // ตกพาดหัว
  });

  // 15 เบาะหลังรถเพื่อน sat เอนชิล หูฟัง → ยืดตัว → ปัดปฏิทินจองทิ้ง → กอดหมอนซบหน้าต่าง
  shot(T(36), whip('#2e3460', (ctx, lt, t) => {
    S.carInterior(ctx, { view: 'back', t, scroll: t * 500, night: false });
    const stretch = t >= T(37) && t < T(38), hug = t >= T(39);
    const lean = hug ? 0.28 * eo(P(t, T(39), 0.4)) : stretch ? -0.12 : -0.2;
    const swat = t >= T(38) + 0.3 && t < T(39);
    drawChar(ctx, 'sat', { x: 620, y: 1330, scale: 1.55, mode: 'sit', lean, expr: hug ? 'bliss' : 'happy', headphones: '#22c55e',
      arms: hug ? { l: 'hug', r: 'hug' } : stretch ? { l: 'up', r: 'up' } : swat ? { l: 'fold', r: 'swat' } : { l: 'fold', r: 'fold' },
      prop: hug ? { type: 'pillow' } : null });
    const ck = P(t, T(38), 0.4), fly = P(t, T(38) + 0.4, 0.5);
    if (ck > 0 && fly < 1) S.calendarIcon(ctx, { x: 980 - 120 * eo(ck) + 500 * eo(fly), y: 760 - 300 * eo(fly), s: 0.8, k: ck });
    drawChar(ctx, 'pal', { x: 190, y: 1720, scale: 1.1, mode: 'sit', expr: 'happy', arms: { l: 'wheel', r: 'wheel' }, prop: { type: 'wheel' } });
  }));

  // 16 close sat เงยหน้าถาม (talk เฉพาะ T41) ? เด้ง เพื่อนเหงื่อตก
  shot(T(40), (ctx, lt, t) => {
    S.carInterior(ctx, { view: 'back', t, scroll: t * 500, night: true });
    const ask = t >= T(41);
    const talk = t >= T(41) && t < E(41);
    drawChar(ctx, 'sat', { x: 660, y: 1400, scale: 1.75, mode: 'sit', expr: ask ? 'happy' : 'happy', eyes: t >= T(40) + 0.3 ? 'normal' : undefined, headDy: -10, talk,
      headphones: '#22c55e', arms: { l: 'down', r: ask ? 'shrug' : 'down' } });
    S.qShape(ctx, 860, 560, 1.4, '#facc15', P(t, T(41) + 0.1, 0.35));
    drawChar(ctx, 'pal', { x: 200, y: 1760, scale: 1.25, mode: 'sit', expr: ask ? 'sweat' : 'happy', arms: { l: 'wheel', r: 'wheel' }, prop: { type: 'wheel' } });
  });

  // 17 ห้องรับรองแดง-ทอง sun นั่งเก้าอี้บอส แว่นดำ → ชี้นิ้วสั่ง สปอตไลต์
  shot(T(43), whip('#7a1a2a', (ctx, lt, t) => {
    const cmd = t >= T(44);
    S.bossRoom(ctx, { spot: P(t, T(44), 0.4) });
    S.bossChair(ctx, { x: 540, y: 1460, s: 1.1 });
    drawChar(ctx, 'sun', { x: 540, y: 1480, scale: 1.3, mode: 'sit', expr: cmd ? 'smug' : 'happy', arms: { l: 'hold', r: cmd ? 'point' : 'hold' } });
  }));

  // 18 ห้องหรูเปิดม่าน → วิวทะเล → แตะจอง+โอน 2 จังหวะ → ยกมือห้าม มาดบอส
  shot(T(45), (ctx, lt, t) => {
    S.luxuryView(ctx, { curtain: ei(P(t, T(45), 0.8)), sunK: P(t, T(46), 0.5), t });
    const stop = t >= T(48);
    drawChar(ctx, 'sun', { x: 300, y: 1760, scale: 1.45, expr: 'smug', arms: { l: 'hold', r: stop ? 'stop' : 'hold' } });
    const ph = P(t, T(47) - 0.3, 0.3);
    if (ph > 0) {
      const t1 = T(47), t2 = T(47) + 0.55;
      const tap = tapAt(t, t1, COL[6], 0.35) || tapAt(t, t2, COL[6], 0.35);
      S.phoneScreen(ctx, { x: 750, y: 1180, s: 0.62 * pop(ph), screen: 'custom', draw: bookScreen(P(t, t2 + 0.35, 0.3), { btn: t >= t1 + 0.35 ? '#22c55e' : '#f6b860' }), tap });
    }
  }, { cam: (lt, t) => { const z = ei(P(t, T(47) - 0.4, 0.6)); return { x: 540 + 60 * z, y: 1000 + 200 * z, zoom: 1 + 0.15 * z }; } });

  // 19 ทั้ง 7 วุ่นวายตามนิสัย → ดาวหมุนเหนือหัว
  const chaos = [
    { id: 'mon', x: 150, y: 1060, arms: { l: 'hips', r: 'unroll' }, prop: { type: 'calendarBig', unroll: 1, len: 380 }, expr: 'smug' },
    { id: 'tue', x: 410, y: 1060, mode: 'walk', expr: 'fire' },
    { id: 'wed', x: 670, y: 1060, arms: { l: 'hold', r: 'magnify' }, prop: { type: 'magnifier' }, expr: 'happy' },
    { id: 'thu', x: 930, y: 1060, arms: { l: { x: -16, y: -120, bend: 'down' }, r: { x: -10, y: -160, bend: 'down' } }, prop: { type: 'calculator', hand: 'l' }, expr: 'swirl' },
    { id: 'fri', x: 200, y: 1500, arms: { l: 'hips', r: 'selfie' }, prop: { type: 'selfieStick', len: 120 }, expr: 'grin' },
    { id: 'sat', x: 540, y: 1470, mode: 'sit', lean: 0.2, arms: { l: 'hug', r: 'hug' }, prop: { type: 'pillow' }, expr: 'bliss', headphones: '#22c55e' },
    { id: 'sun', x: 880, y: 1500, arms: { l: 'hips', r: 'point' }, expr: 'smug' },
  ];
  shot(T(49), (ctx, lt, t) => {
    S.stripes7(ctx, { t: t * 3 });
    const hard = t >= T(50);
    chaos.forEach((c, i) => {
      const k = P(t, T(49) + i * 0.12, 0.35); if (k <= 0) return;
      const sc = (i < 4 ? 0.9 : 1.0) * pop(k), j = hard ? Math.sin(t * 20 + i) * 8 : 0;
      drawChar(ctx, c.id, { ...c, x: c.x + j, y: c.y - (hard ? Math.abs(Math.sin(t * 8 + i)) * 16 : 0), scale: sc, walkPhase: t * 14 });
      if (hard) for (let s = 0; s < 3; s++) { const a = t * 6 + s * 2.1; S.star(ctx, c.x + Math.cos(a) * 60, c.y - 300 * sc - 40 + Math.sin(a) * 18, 16 * P(t, T(50), 0.3), '#facc15'); }
    });
  }, { cam: (lt, t) => ({ x: 540, y: 1100, zoom: 1.02, shake: t >= T(50) }) });

  // 20 โทนฟ้าดิจิทัล webBooking สว่างกลาง → เฟือง → logoCard ที่ "พักอิน" → พยักหน้า ชูนิ้วโป้ง
  const ring7 = (ctx, t, opt) => {
    IDS.forEach((id, i) => {
      const x = 90 + i * 150, y = i % 2 ? 1700 : 1610;
      drawChar(ctx, id, { x, y: y - (opt.jump ? Math.abs(Math.sin(t * 7 + i)) * 50 : 0), scale: 0.78, expr: opt.expr || 'starry', eyes: id === 'sat' ? 'normal' : undefined,
        headDy: opt.nod ? Math.max(0, Math.sin(opt.nod * Math.PI * 2)) * 14 : 0, shades: id === 'sun' ? undefined : undefined,
        arms: opt.arms ? opt.arms(i) : { l: 'down', r: 'down' } });
    });
  };
  shot(T(51), (ctx, lt, t) => {
    S.digitalRoom(ctx, { t });
    const k = P(t, T(51), 0.6);
    ctx.globalAlpha = clamp(k * 2, 0, 1);
    S.webBooking(ctx, { x: 540, y: 1220, s: 1.0, k, logo, t });
    ctx.globalAlpha = 1;
    const gk = P(t, T(52), 0.4);
    if (gk > 0) { S.gear(ctx, 930, 1000, 60 * pop(gk), t * 2); S.gear(ctx, 1000, 900, 36 * pop(gk), -t * 3, '#2f6fdf'); }
    const nod = P(t, T(54), 0.6);
    ring7(ctx, t, { nod: nod > 0 && nod < 1 ? nod : 0, expr: nod > 0 ? 'grin' : 'starry', arms: nod > 0 ? (i) => ({ l: 'down', r: 'thumb' }) : null });
    S.logoCard(ctx, logo, { x: 540, y: 520, w: 640, k: P(t, TW(53, 'พักอิน'), 0.45) });
  });

  // 21 close webBooking โหลดไว → มือถือเด้งข้าง → tue แตะจอง
  shot(T(55), (ctx, lt, t) => {
    S.digitalRoom(ctx, { t });
    const wb = { x: 450, y: 1130, s: 1.05 };
    S.webBooking(ctx, { ...wb, k: P(t, T(55), 0.35), speed: 1 - P(t, T(55) + 0.4, 0.5), phone: P(t, T(56), 0.4), logo, t,
      tap: tapAt(t, T(57), COL[1], 0.4), done: P(t, T(57) + 0.45, 0.3) });
    drawChar(ctx, 'mon', { x: 150, y: 1660, scale: 0.85, expr: 'grin', arms: { l: 'down', r: 'cheer' } });
    drawChar(ctx, 'tue', { x: 540, y: 1690, scale: 0.85, expr: t >= T(57) + 0.5 ? 'starry' : 'grin', arms: { l: 'down', r: 'hips' } });
    drawChar(ctx, 'fri', { x: 960, y: 1680, scale: 0.85, expr: 'grin', arms: { l: 'cheer', r: 'down' } });
  });

  // 22 หลังบ้าน ตารางห้องสลับสีเรียลไทม์ → จุดสัญญาณกระพริบ รีเฟรชหมุน
  shot(T(58), (ctx, lt, t) => {
    S.digitalRoom(ctx, { t });
    const cells = {}; const tick = Math.floor(t * 3);
    for (let c = 0; c < 7; c++) for (let r = 0; r < 4; r++) cells[`${c},${r}`] = ((c * 5 + r * 3 + tick) % 4 === 0) ? '#9aa2c4' : '#22c55e';
    S.roomCalendar(ctx, { x: 540, y: 880, w: 900, h: 620, cells });
    if (t >= T(59)) {
      S.refreshIcon(ctx, 900, 500, 50 * pop(P(t, T(59), 0.3)), t * 5);
      for (let i = 0; i < 4; i++) { const on = Math.sin(t * 10 + i * 1.6) > 0; ctx.fillStyle = on ? '#22c55e' : 'rgba(34,197,94,0.25)'; ctx.beginPath(); ctx.arc(180 + i * 60, 500, 16, 0, Math.PI * 2); ctx.fill(); }
    }
    drawChar(ctx, 'thu', { x: 260, y: 1600, scale: 0.95, expr: 'grin', arms: { l: 'hips', r: 'point' } });
    drawChar(ctx, 'wed', { x: 820, y: 1600, scale: 0.95, expr: 'starry', eyes: 'normal', arms: { l: 'cheek', r: 'thumb' } });
  });

  // 23 แบ่งซ้ายขวา: mon แตะจองสงบ / tue หอบแตะจอง ทั้งคู่ติ๊กถูก
  shot(T(60), (ctx, lt, t) => {
    S.digitalRoom(ctx, { t });
    R(ctx, 0, 0, 540, H, 'rgba(250,204,21,0.18)'); R(ctx, 540, 0, 540, H, 'rgba(244,114,182,0.18)'); R(ctx, 532, 0, 16, H, '#ffffff');
    S.phoneScreen(ctx, { x: 270, y: 760, s: 0.7, screen: 'custom', draw: bookScreen(P(t, T(60) + 0.75, 0.3)), tap: tapAt(t, T(60) + 0.3, COL[0], 0.4) });
    S.phoneScreen(ctx, { x: 810, y: 760, s: 0.7, screen: 'custom', draw: bookScreen(P(t, T(61) + 0.35, 0.3)), tap: tapAt(t, T(61), COL[1], 0.35) });
    drawChar(ctx, 'mon', { x: 270, y: 1640, scale: 1, expr: t >= T(60) + 0.8 ? 'bliss' : 'happy', arms: { l: 'hold', r: 'down' } });
    drawChar(ctx, 'tue', { x: 810, y: 1640 - Math.abs(Math.sin(t * 12)) * 18, scale: 1, mode: 'walk', walkPhase: t * 14, expr: t >= T(61) + 0.4 ? 'grin' : 'sweat' });
  });

  // 24 webBooking กลาง 7 ตัวเชียร์ กระโดด → แจ้งเตือนจองเด้งทีละใบ → logoCard + คอนเฟตตี
  shot(T(62), (ctx, lt, t) => {
    S.digitalRoom(ctx, { t });
    S.webBooking(ctx, { x: 540, y: 1250, s: 0.95, k: 1, logo, t });
    const spots = [[230, 640], [850, 700], [200, 960], [880, 1000], [540, 560]];
    spots.forEach(([x, y], i) => S.bookedToast(ctx, { x, y: y + 80, s: 0.75, k: P(t, T(62) + i * 0.18, 0.3), color: COL[i] }));
    ring7(ctx, t, { jump: true, expr: 'grin', arms: (i) => ({ l: 'cheer', r: 'cheer' }) });
    const lk = P(t, T(63), 0.4);
        S.logoCard(ctx, logo, { x: 540, y: 820, w: 700, k: lk });
    S.confetti7(ctx, { t: t - T(63), k: lk });
  });
  // end card: player วาดเองหลัง VO_DUR
}
