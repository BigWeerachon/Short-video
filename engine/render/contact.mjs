// contact sheet: เรนเดอร์เฟรมนิ่งทุก N วินาที → jobs/<id>/contact.jpg (6 คอลัมน์ กว้าง 270px/ช่อง พร้อมเวลา)
import fs from 'node:fs';
import path from 'node:path';
import { openJob, ROOT } from './browser.mjs';

export async function contactSheet(jobId, { every = 4, cols = 6, cellW = 270 } = {}) {
  const { page, job, close } = await openJob(jobId);
  try {
    const times = [];
    for (let t = 0.5; t < job.total; t += every) times.push(+t.toFixed(2));
    times.push(+(job.voDur + 2).toFixed(2)); // ตรวจฉากปิดเสมอ
    const url = await page.evaluate(async ({ times, cols, cellW }) => {
      const src = document.getElementById('c');
      const cellH = Math.round(cellW * 16 / 9);
      const rows = Math.ceil(times.length / cols);
      const out = document.createElement('canvas');
      out.width = cols * cellW; out.height = rows * cellH;
      const o = out.getContext('2d');
      o.fillStyle = '#000'; o.fillRect(0, 0, out.width, out.height);
      times.forEach((t, i) => {
        window.renderAt(t);
        const x = (i % cols) * cellW, y = Math.floor(i / cols) * cellH;
        o.drawImage(src, x, y, cellW, cellH);
        o.fillStyle = 'rgba(0,0,0,.65)'; o.fillRect(x, y, 74, 26);
        o.fillStyle = '#fff'; o.font = '700 18px Kanit'; o.fillText(`${t.toFixed(1)}s`, x + 6, y + 19);
      });
      return out.toDataURL('image/jpeg', 0.85);
    }, { times, cols, cellW });
    const file = path.join(ROOT, 'jobs', jobId, 'contact.jpg');
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
    return file;
  } finally { await close(); }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [jobId, ...rest] = process.argv.slice(2);
  const i = rest.indexOf('--every');
  const every = i >= 0 ? Number(rest[i + 1]) : 4;
  contactSheet(jobId, { every }).then((f) => console.log(`contact sheet: ${path.relative(ROOT, f)}`)).catch((e) => { console.error(e.message); process.exit(1); });
}
