// QA probe: เรนเดอร์ทุก 1/fps วินาที เก็บว่าตัวละครตัวไหนอยู่ตรงไหน ขยับปากไหม ช็อตไหน + ค่าเสียงพูด → jobs/<id>/qa/probe.json
// ใช้: node engine/qa/probe.mjs <jobId> [--fps 10]
import fs from 'node:fs';
import path from 'node:path';
import { openJob, ROOT } from '../render/browser.mjs';

export async function probe(jobId, fps = 10) {
  const { page, job, close } = await openJob(jobId);
  try {
    const frames = await page.evaluate(({ fps, total }) => {
      const out = [];
      for (let i = 0; i < Math.floor(total * fps); i++) out.push(window.__qaFrame(i / fps));
      return out;
    }, { fps, total: job.total });
    const dir = path.join(ROOT, 'jobs', jobId, 'qa');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'probe.json');
    fs.writeFileSync(file, JSON.stringify({ job: jobId, fps, voDur: job.voDur, total: job.total, frames }));
    return file;
  } finally { await close(); }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [jobId, ...rest] = process.argv.slice(2);
  const i = rest.indexOf('--fps');
  probe(jobId, i >= 0 ? Number(rest[i + 1]) : 10).then((f) => console.log(`probe: ${path.relative(ROOT, f)}`)).catch((e) => { console.error(e.message); process.exit(1); });
}
