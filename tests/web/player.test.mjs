import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openJob } from '../../engine/render/browser.mjs';

test('player renders demo job with Thai font and a single audio element', async () => {
  const { page, job, close } = await openJob('_demo');
  try {
    assert.ok(job.total > job.voDur && job.voDur > 5);
    const r = await page.evaluate(() => {
      window.renderAt(1);
      const c = document.getElementById('c');
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      const colors = new Set();
      for (let i = 0; i < d.length; i += 4 * 997) colors.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
      return { colors: colors.size, font: document.fonts.check('700 40px Kanit', 'ก'), audios: document.querySelectorAll('audio').length };
    });
    assert.ok(r.colors > 20, `blank frame? ${r.colors}`);
    assert.equal(r.font, true);
    assert.equal(r.audios, 1);
  } finally { await close(); }
});

test('audio already loaded before listeners (readyState>=1) is still used', async () => {
  const init = () => { Object.defineProperty(HTMLMediaElement.prototype, 'readyState', { get: () => 1 }); };
  const { page, close } = await openJob('_demo', { init });
  try {
    assert.equal(await page.evaluate(() => window.__state.hasAudio), true);
  } finally { await close(); }
});
