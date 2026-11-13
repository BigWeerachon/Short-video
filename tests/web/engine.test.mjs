import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampCam, makeTiming, W, H } from '../../engine/web/core.js';
import { ik2 } from '../../engine/web/rig.js';
import { layoutSub, fitText, SUB } from '../../engine/web/subs.js';

const fakeCtx = () => {
  const c = { font: '700 46px Kanit' };
  c.measureText = (s) => ({ width: [...s].length * parseFloat(/(\d+)px/.exec(c.font)[1]) * 0.55 });
  return c;
};

test('ik2 reaches reachable target, elbow on bendSign side', () => {
  for (const bend of [1, -1]) {
    const sh = { x: 0, y: 0 }, tg = { x: 60, y: 40 };
    const { elbow, hand } = ik2(sh, tg, 50, 50, bend);
    assert.ok(Math.hypot(hand.x - tg.x, hand.y - tg.y) < 1e-6);
    assert.ok(Math.abs(Math.hypot(elbow.x, elbow.y) - 50) < 1e-6);
    const cross = tg.x * elbow.y - tg.y * elbow.x;
    assert.equal(Math.sign(cross), bend);
  }
});

test('ik2 clamps unreachable target to full extension', () => {
  const { hand } = ik2({ x: 0, y: 0 }, { x: 500, y: 0 }, 50, 40, 1);
  assert.ok(Math.abs(hand.x - 90) < 1e-6 && Math.abs(hand.y) < 1e-6);
});

test('clampCam never exposes canvas edge', () => {
  for (const zoom of [0.5, 1, 1.2, 2]) for (const x of [-500, 0, 540, 2000]) for (const y of [-500, 960, 3000]) {
    const c = clampCam({ x, y, zoom });
    assert.ok(c.zoom >= 1);
    const hw = W / 2 / c.zoom, hh = H / 2 / c.zoom;
    assert.ok(c.x - hw >= -1e-9 && c.x + hw <= W + 1e-9 && c.y - hh >= -1e-9 && c.y + hh <= H + 1e-9);
  }
  assert.ok(clampCam({ x: 540, y: 960, zoom: 1 }, true).zoom >= 1.03);
});

test('makeTiming T and TW', () => {
  const { T, TW } = makeTiming([{ w: 'สวัสดีครับ', s: 1, e: 2 }, { w: 'แล้วเจอกับผี', s: 3, e: 5 }]);
  assert.equal(T(1), 3);
  assert.ok(TW(1, 'ผี') > 4.5 && TW(1, 'ผี') < 5);
  assert.equal(T(99), Infinity);
});

test('layoutSub never breaks inside a word and fits 940', () => {
  const ctx = fakeCtx();
  const text = 'ไม่มีเวลามาเถียงเรื่องสมองส่วนไหนแล้วครับเพราะผีกำลังวิ่งตามมาติดๆเลยทีเดียว';
  const words = [...new Intl.Segmenter('th', { granularity: 'word' }).segment(text)].map((s) => s.segment);
  const { pages, size } = layoutSub(text, ['ผี'], ctx);
  assert.ok(size <= SUB.size);
  const flat = pages.map((p) => p.map((s) => s.text).join(''));
  assert.equal(flat.join(''), text);
  let i = 0;
  for (const pg of flat) { // each page boundary is a word boundary
    let acc = '';
    while (acc.length < pg.length) acc += words[i++];
    assert.equal(acc, pg);
  }
  ctx.font = `700 ${size}px Kanit`;
  for (const pg of flat) assert.ok(ctx.measureText(pg).width <= SUB.maxW);
  assert.ok(pages.flat().some((s) => s.yellow && s.text.includes('ผี')));
});

test('fitText shrinks a 60-char title under 940', () => {
  const ctx = fakeCtx();
  const t = 'ก'.repeat(60);
  const s = fitText(ctx, t, 940, 80);
  ctx.font = `700 ${s}px Kanit`;
  assert.ok(ctx.measureText(t).width <= 940 && s < 80);
});
