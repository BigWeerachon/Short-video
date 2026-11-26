import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../../engine/web/scenes.js';
import { drawChar } from '../../engine/web/rig.js';
import { CAST } from '../../engine/web/cast.js';

// ctx ปลอม: ทุกเมธอดเป็น no-op, measureText ประมาณความกว้าง
const fakeCtx = () => {
  const grad = { addColorStop() {} };
  const base = { font: '700 40px Kanit', measureText: (s) => ({ width: [...s].length * 20 }), createLinearGradient: () => grad, getTransform: () => null };
  return new Proxy(base, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
};

test('new hotel cast members exist and draw', () => {
  for (const id of ['owner', 'reception', 'traveler']) {
    assert.ok(CAST[id]);
    assert.doesNotThrow(() => drawChar(fakeCtx(), id, { x: 540, y: 1600, mode: 'sit' }));
    assert.doesNotThrow(() => drawChar(fakeCtx(), id, { x: 540, y: 1600 }));
  }
});

test('hotel props draw without throwing', () => {
  const c = fakeCtx();
  assert.doesNotThrow(() => {
    for (const k of ['lobby', 'living', 'office', 'back', 'navy', 'front']) S.bizRoom(c, k);
    S.hotelFront(c, { shield: 0.5, gray: 1 }); S.barChart(c, { k: 0.5 }); S.iconBrand(c, { fade: 0.5 });
    S.spinner(c, { t: 1 }); S.xIcon(c, 0, 0); S.counter(c); S.notebook(c, { open: 0 }); S.notebook(c); S.fileIcon(c, 0, 0);
    S.monitor(c, {}, () => {}); S.laptop(c, {}, (cc, w, h) => S.siteMock(cc, w, h, { k: 0.5 }));
    const cal = S.roomCalendar(c, { cells: { '1,1': '#f00' } }); assert.ok(cal.cell(1, 1).x > 0);
    S.syncLine(c, { x1: 0, y1: 0, x2: 100, y2: 100, t: 1 }); S.goldCheck(c, 0, 0); S.gear(c, 0, 0); S.growthChart(c, { k: 1 });
    S.heart(c, 0, 0); S.keyCard(c, 0, 0); S.thinkIcon(c, 0, 0); S.sofa(c); S.bizDesk(c); S.star(c, 0, 0); S.coin(c, 0, 0);
    S.phoneScreen(c, { screen: 'custom', draw: () => {}, tap: { x: 0, y: 0, ring: 0.5, sleeve: '#e6e9f0' } });
  });
});

test('headerCard fits text inside card width', () => {
  const c = fakeCtx();
  const text = 'นักท่องเที่ยวจองที่พักผ่านมือถือเป็นหลัก พึ่งตัวกลางอย่างเดียว อาจเสียกำไรและตัวตนของแบรนด์!';
  const r = S.headerCard(c, text, { w: 980 });
  assert.equal(r.lines.join('').replace(/\s/g, ''), text.replace(/\s/g, ''));
  c.font = `700 ${r.size}px Kanit`;
  for (const l of r.lines) assert.ok(c.measureText(l).width <= 980 - 68);
});

test('rain/bus-stop/throat props draw without throwing', () => {
  const c = fakeCtx();
  assert.doesNotThrow(() => {
    S.rain(c, { t: 1.3 }); S.walkerShadow(c, { walk: 2 }); S.throatCross(c, { pill: 0.5, gulp: 0.4, t: 1 }); S.throatCross(c, { k: 0 });
    S.clock(c, { a: 3 }); S.busStopBench(c); S.bigGlass(c, { fill: 0.3, tilt: 0.5 });
  });
});
