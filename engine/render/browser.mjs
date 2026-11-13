// เปิด player ใน Chromium แบบ headless ผ่านเซิร์ฟเวอร์ไฟล์ในเครื่อง
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.css': 'text/css' };

export function startServer(root = ROOT) {
  const server = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, port: server.address().port })));
}

/** เปิดงาน jobId แล้วรอจน player พร้อม (window.READY) */
export async function openJob(jobId, { subs = true, viewport = { width: 1080, height: 1920 }, init = null } = {}) {
  const { chromium } = require('playwright');
  const { server, port } = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  if (init) await page.addInitScript(init);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/engine/web/player.html?job=${encodeURIComponent(jobId)}&subs=${subs ? 1 : 0}`);
  await page.waitForFunction(() => window.READY || document.body.dataset.error, null, { timeout: 30000 });
  const err = await page.evaluate(() => document.body.dataset.error);
  if (err || errors.length) { await browser.close(); server.close(); throw new Error(err || errors.join('\n')); }
  const job = await page.evaluate(() => window.JOB);
  const close = async () => { await browser.close(); server.close(); };
  return { browser, page, port, job, close };
}
