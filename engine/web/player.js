// ตัวเล่น: โหลดงาน → วาดทุกเฟรมจากเวลา (deterministic) ใช้ทั้ง preview และ export
import { W, H, FPS, clamp, prog, makeTiming, clampCam, createShots } from './core.js';
import * as scenes from './scenes.js';
import { drawChar, setClock, EXPRS, qaLog } from './rig.js';
import { CAST } from './cast.js';
import { layoutSub, drawSub } from './subs.js';

const qs = new URLSearchParams(location.search);
const jobId = qs.get('job') || '_demo';
const JOB = `../../jobs/${jobId}/`;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const audio = document.getElementById('a');

const loadScript = (src) => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => bad(new Error(`โหลดไม่ได้ ${src}`)); document.head.appendChild(s); });
const loadImg = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });

const state = { subsOn: qs.get('subs') !== '0', keywords: [], voDur: 0, endDur: 7, total: 0, playing: false, t: 0, hasAudio: false };

async function boot() {
  await Promise.all([document.fonts.load('700 40px Kanit', 'กขค abc'), document.fonts.load('500 40px Kanit', 'กขค abc')]);
  await loadScript(`${JOB}timing.js`);
  const words = window.WORDS || [];
  const env = window.ENV || [];
  state.voDur = window.VO_DUR || (words.length ? words[words.length - 1].e + 0.4 : 5);
  state.endDur = window.END_DUR || 7;
  const [logo, endImg] = await Promise.all([loadImg('../../assets/brand/logo.png'), loadImg('../../assets/brand/end_card.png')]);
  const timing = makeTiming(words);
  const shots = createShots();
  const api = {
    ...timing, ...scenes, shot: shots.shot, drawChar, CAST, EXPRS, W, H, prog, clamp, logo, words,
    keywords: (list) => { state.keywords = list; },
  };
  const mod = await import(`${JOB}shots.js`);
  mod.default(api);
  state.total = state.voDur + state.endDur;

  window.renderAt = (t) => {
    state.t = t;
    setClock(t, env[Math.floor(t * FPS)] || 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (t >= state.voDur) { scenes.endCard(ctx, endImg, (t - state.voDur) / 0.8); return; }
    const s = shots.at(t);
    if (s) {
      const camSpec = typeof s.cam === 'function' ? s.cam(s.lt, t) : s.cam;
      const cam = clampCam(camSpec || {}, !!(camSpec && camSpec.shake));
      const sh = camSpec && camSpec.shake ? { x: Math.sin(t * 47) * 8, y: Math.cos(t * 53) * 8 } : { x: 0, y: 0 };
      ctx.save();
      ctx.translate(W / 2, H / 2); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-cam.x + sh.x, -cam.y + sh.y);
      s.draw(ctx, s.lt, t, s);
      ctx.restore();
      if (s.overlay) s.overlay(ctx, s.lt, t, s); // ข้อความ/การ์ดที่ไม่ขยับตามกล้อง
    } else { scenes.sky(ctx, 'studio'); }
    if (state.subsOn) drawSubtitle(words, t);
  };
  // QA: วาดเฟรมแล้วคืนข้อมูลตัวละคร/ช็อต/ค่าปากจากเสียง (ใช้โดย engine/qa/probe.mjs)
  const shotStarts = shots.list.map((x) => x.start).filter(Number.isFinite).sort((a, b) => a - b);
  window.__qaFrame = (t) => {
    qaLog.on = true; qaLog.items = [];
    window.renderAt(t);
    qaLog.on = false;
    const s = t < state.voDur ? shots.at(t) : null;
    return { t: +t.toFixed(3), shot: s ? shotStarts.indexOf(s.start) + 1 : 0, shotStart: s ? +s.start.toFixed(3) : null,
      endCard: t >= state.voDur, voice: env[Math.floor(t * FPS)] || 0, chars: qaLog.items };
  };
  window.JOB = { id: jobId, total: state.total, voDur: state.voDur, fps: FPS };
  setupTransport();
  window.renderAt(Number(qs.get('t') || 0));
  window.READY = true;
}

const subCache = new Map();
function drawSubtitle(words, t) {
  const i = words.findIndex((w, k) => t >= w.s && t < (words[k + 1] ? Math.min(words[k + 1].s, w.e + 0.6) : w.e + 0.6));
  if (i < 0) return;
  if (!subCache.has(i)) subCache.set(i, layoutSub(words[i].w, state.keywords, ctx));
  const { pages, size } = subCache.get(i);
  const w = words[i];
  const page = Math.min(pages.length - 1, Math.floor(clamp((t - w.s) / (w.e - w.s), 0, 0.999) * pages.length));
  drawSub(ctx, pages[page], size, W);
}

function setupTransport() {
  const $ = (id) => document.getElementById(id);
  audio.src = `${JOB}mix.mp3`;
  const markAudio = () => { state.hasAudio = true; };
  if (audio.readyState >= 1) markAudio(); // เคยพลาด loadedmetadata → เสียงหาย (L08)
  audio.addEventListener('loadedmetadata', markAudio);
  audio.addEventListener('error', () => { state.hasAudio = false; });
  const seek = $('seek');
  let last = performance.now();
  const loop = (now) => {
    const dt = (now - last) / 1000; last = now;
    if (state.playing) {
      if (state.hasAudio && audio.readyState >= 1) state.t = audio.currentTime; else state.t += dt;
      if (state.t >= state.total) { state.playing = false; state.t = state.total; }
      window.renderAt(state.t);
      seek.value = String(state.t / state.total * 1000);
      $('time').textContent = fmt(state.t) + ' / ' + fmt(state.total);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  $('play').onclick = () => {
    state.playing = !state.playing;
    $('play').textContent = state.playing ? '⏸' : '▶';
    if (state.playing) { audio.currentTime = state.t; audio.play().catch(() => {}); } else audio.pause(); // เล่นทุกครั้งที่กด ▶
  };
  $('restart').onclick = () => { state.t = 0; audio.currentTime = 0; window.renderAt(0); };
  seek.oninput = () => { state.t = Number(seek.value) / 1000 * state.total; audio.currentTime = state.t; window.renderAt(state.t); };
  $('subs').onclick = () => { state.subsOn = !state.subsOn; window.renderAt(state.t); };
  window.__state = state;
}

const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
boot().catch((e) => { document.body.dataset.error = e.message; console.error(e); });
