// แถบเฟรมต่อเนื่องสำหรับตรวจการเคลื่อนไหว: เรนเดอร์ช่วงเวลา [from, to] ที่ fps กำหนด → ภาพกริดพร้อมเวลา
// ใช้: node engine/qa/strips.mjs <jobId> <from> <to> [--fps 6] [--out name]
import fs from 'node:fs';
import path from 'node:path';
import { openJob, ROOT } from '../render/browser.mjs';

export async function strip(jobId, from, to, { fps = 6, out = null, cellW = 216 } = {}) {
  const { page, close } = await openJob(jobId, { subs: false });
  try {
    const times = []; for (let t = from; t <= to + 1e-6; t += 1 / fps) times.push(+t.toFixed(3));
    const url = await page.evaluate(({ times, cellW }) => {
      const src = document.getElementById('c'), cols = Math.min(6, times.length), cellH = Math.round(cellW * 16 / 9);
      const o = document.createElement('canvas'); o.width = cols * cellW; o.height = Math.ceil(times.length / cols) * cellH;
      const g = o.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, o.width, o.height);
      times.forEach((t, i) => { window.renderAt(t); const x = (i % cols) * cellW, y = Math.floor(i / cols) * cellH;
        g.drawImage(src, x, y, cellW, cellH); g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(x, y, 70, 22); g.fillStyle = '#fff'; g.font = '700 15px Kanit'; g.fillText(t.toFixed(2) + 's', x + 5, y + 16); });
      return o.toDataURL('image/jpeg', 0.85);
    }, { times, cellW });
    const dir = path.join(ROOT, 'jobs', jobId, 'qa'); fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${out || `strip_${from.toFixed(1)}-${to.toFixed(1)}`}.jpg`);
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
    return file;
  } finally { await close(); }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [jobId, a, b, ...rest] = process.argv.slice(2);
  const opt = (k, d) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : d; };
  strip(jobId, Number(a), Number(b), { fps: Number(opt('--fps', 6)), out: opt('--out', null) })
    .then((f) => console.log(`strip: ${path.relative(ROOT, f)}`)).catch((e) => { console.error(e.message); process.exit(1); });
}
