// Export MP4: วนเฟรม 30fps → JPEG → ffmpeg image2pipe + mix.mp3 (คู่มือขั้นที่ 8)
// ใช้: node engine/render/export.mjs <jobId> [--seconds N] [--remux]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { openJob, ROOT } from './browser.mjs';

export async function exportJob(jobId, { seconds = null, batch = 10 } = {}) {
  const dir = path.join(ROOT, 'jobs', jobId);
  const { page, job, close } = await openJob(jobId);
  const total = seconds ? Math.min(seconds, job.total) : job.total;
  const frames = Math.round(total * job.fps);
  const out = path.join(dir, 'out.mp4');
  const proc = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(job.fps), '-c:v', 'mjpeg', '-i', '-',
    '-i', path.join(dir, 'mix.mp3'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', String(frames / job.fps), out],
  { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((ok, bad) => proc.on('close', (c) => (c === 0 ? ok() : bad(new Error(`ffmpeg exit ${c}`)))));
  try {
    const t0 = Date.now();
    for (let f = 0; f < frames; f += batch) {
      const urls = await page.evaluate(({ f, n, fps }) => {
        const c = document.getElementById('c');
        const res = [];
        for (let i = f; i < f + n; i++) { window.renderAt(i / fps); res.push(c.toDataURL('image/jpeg', 0.92)); }
        return res;
      }, { f, n: Math.min(batch, frames - f), fps: job.fps });
      for (const u of urls) {
        if (!proc.stdin.write(Buffer.from(u.slice(u.indexOf(',') + 1), 'base64'))) await new Promise((r) => proc.stdin.once('drain', r));
      }
      if (f % (job.fps * 10) === 0) process.stdout.write(`\r  เรนเดอร์ ${(f / job.fps).toFixed(0)}/${total.toFixed(0)} วิ (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
    proc.stdin.end();
    await done;
    process.stdout.write('\n');
  } finally { await close(); }
  return out;
}

/** แก้แค่เสียง: ใช้ภาพเดิม (-c:v copy) กับ mix.mp3 ใหม่ */
export async function remux(jobId) {
  const dir = path.join(ROOT, 'jobs', jobId);
  const out = path.join(dir, 'out.mp4'), tmp = path.join(dir, 'out.remux.mp4');
  if (!fs.existsSync(out)) throw new Error('ยังไม่มี out.mp4 — export ก่อน');
  await new Promise((ok, bad) => {
    const p = spawn('ffmpeg', ['-v', 'error', '-y', '-i', out, '-i', path.join(dir, 'mix.mp3'), '-map', '0:v', '-map', '1:a',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], { stdio: 'inherit' });
    p.on('close', (c) => (c === 0 ? ok() : bad(new Error(`ffmpeg exit ${c}`))));
  });
  fs.renameSync(tmp, out);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [jobId, ...rest] = process.argv.slice(2);
  const i = rest.indexOf('--seconds');
  const run = rest.includes('--remux') ? remux(jobId) : exportJob(jobId, { seconds: i >= 0 ? Number(rest[i + 1]) : null });
  run.then((f) => console.log(`✓ ${path.relative(ROOT, f)}`)).catch((e) => { console.error(e.message); process.exit(1); });
}
