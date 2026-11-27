import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { startServer } from '../../engine/render/browser.mjs';

execFileSync('node', ['scripts/build_office.mjs']);

const require = createRequire(import.meta.url);

// ฐานข้อมูลจำลองแทน claude.use('db')
const fakeDb = (seed) => {
  window.__copied = null;
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (t) => { window.__copied = t; } } });
  const coll = (name) => {
    const q = { orderBy: () => q, limit: () => q, onSnapshot: (next) => { setTimeout(() => next({ metadata: { fromCache: false }, docs: (seed[name] || []).map((d) => ({ id: d.id, data: () => d })) }), 50); return () => {}; } };
    return q;
  };
  window.claude = { use: async (n) => (n === 'db' ? { collection: coll } : null) };
};

async function open(seed) {
  const { chromium } = require('playwright');
  const { server, port } = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(fakeDb, seed);
  await page.goto(`http://127.0.0.1:${port}/office/office.html`);
  await page.waitForTimeout(300);
  return { page, close: async () => { await browser.close(); server.close(); } };
}

const CAPS = { youtube: { title: 'ผี #Shorts', description: 'paakin.com', tags: ['ผี'] }, facebook: { text: 'เฟซ paakin.com', hashtags: ['#PAAKIN'] },
  tiktok: { text: 'ติ๊กต็อก paakin.com', hashtags: ['#ผี'] }, instagram: { text: 'ไอจี paakin.com', hashtags: [] } };

test('empty db shows empty states, 3 tabs, no horizontal scroll', async () => {
  const { page, close } = await open({});
  try {
    assert.match(await page.textContent('#jobCard'), /ยังไม่มีงาน/);
    for (const t of ['ออฟฟิศ', 'คลังงาน', 'รายงาน']) assert.ok(await page.getByRole('tab', { name: t }).isVisible());
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  } finally { await close(); }
});

test('job handoff: active room follows role and characters return home', async () => {
  const job = { id: 'j1', title: 'ศึกผีภูกระดึง', role: 'animator', stage: 'วาดฉาก', status: 'active', progress: 0.5, updated: '2026-11-13T10:00',
    timeline: [{ stage: 'เสียง', role: 'sound', done: true }, { stage: 'ฉาก', role: 'animator', eta: '14:00' }], tokens: { budget: 400000, used: 120000 } };
  const { page, close } = await open({ jobs: [job] });
  try {
    await page.waitForTimeout(3000);
    assert.equal(await page.evaluate(() => window.__office.activeRoom()), 'animator');
    assert.equal(await page.evaluate(() => window.__game.activeId), 'animator');
    assert.equal(await page.locator('.office .room.on').textContent(), 'โถงทำงาน');
    assert.match(await page.textContent('#jobCard'), /50%/);
  } finally { await close(); }
});

test('library copy button copies the platform caption', async () => {
  const lib = [{ id: '20261113-01', title: 'ศึกผีภูกระดึง', type: 'story_clip', status: 'ready', created: '2026-11-13', posted: { tiktok: '2026-11-13' }, captions: CAPS }];
  const { page, close } = await open({ library: lib });
  try {
    await page.getByRole('tab', { name: 'คลังงาน' }).click();
    await page.waitForTimeout(150);
    await page.locator('[data-seg="tiktok"]').click();
    await page.locator('a.go').evaluate((a) => a.addEventListener('click', (e) => e.preventDefault()));
    await page.locator('a.go').click();
    assert.equal(await page.evaluate(() => window.__copied), 'ติ๊กต็อก paakin.com\n\n#ผี');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  } finally { await close(); }
});

test('post button copies the caption and links to the platform upload page', async () => {
  const lib = [{ id: '20261113-01', title: 'x', type: 'story_clip', status: 'ready', created: '2026-11-13', posted: {}, captions: CAPS }];
  const { page, close } = await open({ library: lib });
  try {
    await page.getByRole('tab', { name: 'คลังงาน' }).click();
    await page.locator('[data-seg="tiktok"]').click();
    const go = page.locator('a.go');
    assert.equal(await go.getAttribute('href'), 'https://www.tiktok.com/tiktokstudio/upload');
    assert.equal(await go.getAttribute('target'), '_blank');
    await go.evaluate((a) => a.addEventListener('click', (e) => e.preventDefault()));
    await go.click();
    assert.equal(await page.evaluate(() => window.__copied), 'ติ๊กต็อก paakin.com\n\n#ผี');
  } finally { await close(); }
});
