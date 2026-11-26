// ยาพาราติดคอ — 2 ช็อต (+end card อัตโนมัติ) ไม่มีข้อความในภาพ (L12 L22)
export default function (S) {
  const { shot, T, prog, clamp, drawChar, sky, ground, rain, walkerShadow, throatCross, clock, busStopBench, bigGlass } = S;
  const easeOut = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
  S.keywords(['ยาพารา', 'ติดคอ']);
  const P = (t, a, d = 0.4) => prog(t, a, d);
  const E = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

  // 1 ถนนกลางฝน → จับคอ + ภาพตัดขวาง
  shot(T(0), (ctx, lt, t) => {
    sky(ctx, 'night'); ctx.fillStyle = 'rgba(140,160,200,0.45)'; ctx.fillRect(0, 0, 1080, 1920);
    ground(ctx, 1380, '#4a5478'); ctx.fillStyle = '#5d6890'; ctx.fillRect(0, 1380, 1080, 40);
    walkerShadow(ctx, { x: 840 + lt * 40, y: 1400, s: 0.75 - lt * 0.06, walk: t * 6, a: 0.7 * (1 - P(t, T(1) + 0.2, 0.8) * 0.6) });
    const k = P(t, T(1), 0.35), g = P(t, T(1) + 0.55, 0.4);
    drawChar(ctx, 'traveler', { x: 380, y: 1600, scale: 1.4, expr: k > 0 ? 'sweat' : 'cry', talk: true,
      arms: { r: k > 0 ? { x: 14, y: -222 } : 'down', l: g > 0 ? { x: -40, y: -250 - 20 * g } : 'down' }, armsFront: k > 0 });
    if (g > 0) bigGlass(ctx, { x: 380 - 56 * 1.4, y: 1600 - 230 * 1.4, s: 0.45, fill: 0.7 - 0.4 * P(t, T(1) + 0.8, 0.8), tilt: 0.5 * g });
    rain(ctx, { t });
  }, { cam: (lt, t) => { const z = E(P(t, T(1), 0.6)); return { x: 540 - 140 * z, y: 1150 - 40 * z, zoom: 1 + 0.45 * z }; },
    overlay: (ctx, lt, t) => throatCross(ctx, { x: 720, y: 560, r: 250, k: P(t, T(1) + 0.15, 0.45), pill: 0.45, gulp: P(t, T(1) + 0.9, 0.7), t }) });

  // 2 ป้ายรถเมล์ นั่งรอ นาฬิกาหมุน → ดื่มแก้วใหญ่ ยาเด้งกลับ
  shot(T(2), (ctx, lt, t) => {
    sky(ctx, 'night'); ctx.fillStyle = 'rgba(140,160,200,0.45)'; ctx.fillRect(0, 0, 1080, 1920);
    ground(ctx, 1450, '#4a5478');
    busStopBench(ctx, { x: 540, y: 1560, w: 860 });
    clock(ctx, { x: 830, y: 640, r: 100, a: t * 9 });
    const d = P(t, T(3), 0.4), back = d > 0 && t > T(3) + 1.0;
    drawChar(ctx, 'traveler', { x: 520, y: 1330, scale: 1.25, mode: 'sit', expr: d > 0 ? 'pale' : 'sad', talk: true,
      arms: { r: d > 0 ? { x: 62, y: -250 } : { x: 14, y: -222 }, l: 'down' }, armsFront: true });
    if (d > 0) bigGlass(ctx, { x: 520 + 96 * 1.25, y: 1330 + (62 - 235) * 1.25, s: 0.55, fill: 0.85 - 0.6 * P(t, T(3) + 0.3, 0.9), tilt: -0.9 * d });
    rain(ctx, { t, a: 0.4, n: 60 });
  }, { cam: (lt, t) => { const z = E(P(t, T(3), 0.6)); return { x: 540 + 40 * z, y: 1150 - 10 * z, zoom: 1 + 0.35 * z }; },
    overlay: (ctx, lt, t) => {
      const s = T(3) + 0.3, down = P(t, s + 0.2, 0.35), up = P(t, s + 0.6, 0.4);
      const bounce = up > 0 ? Math.sin(up * Math.PI * 2) * 0.05 * (1 - up) : 0;
      throatCross(ctx, { x: 300, y: 520, r: 230, k: P(t, s, 0.4), pill: 0.45 + 0.28 * easeOut(down) - 0.28 * easeOut(up) + bounce, gulp: P(t, s + 0.1, 0.6), t });
    } });
  // end card: player วาดเองหลัง VO_DUR
}
