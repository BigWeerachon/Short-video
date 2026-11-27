import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../../engine/web/scenes.js';
import { drawChar, ARM, EXPRS, propTip, setClock } from '../../engine/web/rig.js';
import { CAST } from '../../engine/web/cast.js';

// ctx ปลอม: บันทึก fillText เพื่อยืนยันว่าไม่มีตัวอักษรในภาพ (L12 L17 L22)
const fakeCtx = (log = []) => {
  const grad = { addColorStop() {} };
  const base = { font: '700 40px Kanit', measureText: (s) => ({ width: [...s].length * 20 }), createLinearGradient: () => grad, getTransform: () => null,
    fillText: (s) => log.push(s), strokeText: (s) => log.push(s) };
  return new Proxy(base, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
};

test('7-day cast: shirt colors per day and distinct looks', () => {
  const ids = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  assert.deepEqual(S.DAY7_IDS, ids);
  ids.forEach((id, i) => assert.equal(CAST[id].shirt, S.DAY7[i]));
  assert.equal(new Set(ids.map((id) => CAST[id].hair)).size, 7, 'ทรงผมไม่ซ้ำกัน');
  assert.ok(CAST.pal.skin, 'ตัวประกอบเงามีสีผิวของตัวเอง');
});

test('7-day cast draws in every mode/expression without text', () => {
  setClock(1.2, 5);
  for (const id of ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'pal']) for (const expr of EXPRS.filter((e) => e !== 'sleep')) for (const mode of ['stand', 'sit', 'walk']) {
    const log = [];
    assert.doesNotThrow(() => drawChar(fakeCtx(log), id, { mode, expr, lean: 0.2, headDy: 5, headphones: '#22c55e', eyes: 'normal', shades: false, talk: true }));
    assert.equal(log.length, 0, `${id} ${expr} มีตัวอักษร`);
  }
});

test('held props attach to hands (L23) and draw without text', () => {
  const log = [];
  const props = [{ type: 'calendarBig', unroll: 0.5 }, { type: 'suitcase' }, { type: 'magnifier' }, { type: 'calculator', press: 3 }, { type: 'selfieStick', flash: 0.5 },
    { type: 'receipt' }, { type: 'sunglasses' }, { type: 'pillow' }, { type: 'wheel' }];
  for (const prop of props) assert.doesNotThrow(() => drawChar(fakeCtx(log), 'mon', { arms: { l: 'hug', r: 'magnify' }, prop }));
  assert.equal(log.length, 0);
  const arm = { hand: { x: 100, y: -200 }, elbow: { x: 60, y: -170 } };
  const tip = propTip(arm, 50);
  assert.ok(Math.abs(Math.hypot(tip.x - 100, tip.y + 200) - 50) < 1e-9, 'ปลายของถือห่างมือตามความยาวด้าม');
  assert.ok(tip.x > 100 && tip.y < -200, 'ต่อแนวแขนจากศอกผ่านมือ');
});

test('new arm poses keep elbows out/down (L03)', () => {
  for (const k of ['selfie', 'magnify', 'calc', 'drag', 'thumb', 'unroll', 'hug', 'stop', 'swat', 'wheel']) {
    assert.ok(ARM[k], k); assert.ok(['out', 'down'].includes(ARM[k].bend), k);
  }
});

test('7-day scenes draw without text', () => {
  const log = [], c = fakeCtx(log);
  assert.doesNotThrow(() => {
    S.stripes7(c, { t: 1 }); S.qShape(c, 0, 0); S.provinceMap(c, { k: 0.5 }); S.hotelIcon(c, 0, 0); S.bedIcon(c, 0, 0);
    S.toneRoom(c, { books: true, board: true, dust: 1 }); S.briefcaseIcon(c, 0, 0); S.flowers(c, { t: 1 }); S.pinkNightRoad(c, { scroll: 300 });
    S.bulb(c, 0, 0); S.nightRoom(c, { moon: 0.5 }); S.suitcaseBox(c, { stuff: 0.5, lid: 0 }); S.suitcaseBox(c, { lid: 1 });
    S.carInterior(c, { view: 'front', light: (cc) => S.trafficLight(cc, {}) }); S.carInterior(c, { view: 'back', night: false }); S.steeringWheel(c);
    S.houseSign(c); S.cobweb(c, { k: 1 }); S.marbleTile(c); S.piggy(c, 0, 0); S.trophy(c, 0, 0); S.promoCard(c, { glow: 1 });
    S.partyRoom(c, { spin: 1, villa: 1 }); S.storyRing(c); S.calendarIcon(c, { flip: 0.3 }); S.bossRoom(c, { spot: 1 }); S.bossChair(c);
    S.luxuryView(c, { curtain: 0.5 }); S.webBooking(c, { phone: 1, done: 0.5, tap: { x: 0, y: 228, ring: 0.5 }, speed: 1 }); S.bookedToast(c);
    S.refreshIcon(c, 0, 0); S.confetti7(c, { t: 1 }); S.shadows7(c, { k: 1 }); S.digitalRoom(c); S.flameShape(c, 0, 0); S.receiptStrip(c, 0, 0);
  });
  assert.equal(log.length, 0, `มีตัวอักษรในฉาก: ${log.join(',')}`);
  const b = S.webBookingBtn({ x: 540, y: 1150, s: 1 }); assert.ok(b.x === 900 && Math.abs(b.y - (1150 - 120 + 228 * 0.62)) < 1e-9);
});
