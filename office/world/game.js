// fst-pixel-game — เกมในบ้าน มุมมองด้านบนเฉียง (bird's-eye 3/4)
// ต้องมี window.SHEET_IMG (Image) และ window.SHEET (JSON จาก pxl) ก่อนเรียก start()
(() => {
  const T = 16;
  // # ผนัง · b ห้องผู้อำนวยการ · c ห้องประชุม · s ห้องตัดต่อ/เสียง · l โถงทำงาน · E ประตูทางออก
  const MAP = [
    '######################',
    '#bbbbbb#cccccc#ssssss#',
    '#bbbbbb#cccccc#ssssss#',
    '#bbbbbb#cccccc#ssssss#',
    '#bbbbbb#cccccc#ssssss#',
    '#bbbbbb#cccccc#ssssss#',
    '#bbbbbb#cccccc#ssssss#',
    '###ll#####ll#####ll###',
    '#llllllllllllllllllll#',
    '#llllllllllllllllllll#',
    '#llllllllllllllllllll#',
    '#llllllllllllllllllll#',
    '#llllllllllllllllllll#',
    '#llllllllllllllllllll#',
    '#llllllllllllllllllll#',
    '#llllllllllllllllllll#',
    '#llllllllllllllllllll#',
    '#llllllllllllllllllll#',
    '#########EE###########',
  ];
  const COLS = MAP[0].length, ROWS = MAP.length, MW = COLS * T, MH = ROWS * T;
  const tileAt = (c, r) => (r < 0 || c < 0 || r >= ROWS || c >= COLS ? '#' : MAP[r][c]);
  const isWall = (ch) => ch === '#' || ch === 'E';
  const FLOOR = { b: 't_floor_bed', c: 't_floor_carpet', s: 't_floor_studio', l: 't_floor_living' };
  const LABELS = [['ห้องผู้อำนวยการ', 64, 3], ['ห้องประชุม', 176, 3], ['ห้องตัดต่อ & เสียง', 288, 3], ['โถงทำงาน', 120, 131]];

  // ---- ของในบ้าน: [ชื่อสไปรต์, x, y, ชนิด] ชนิด: floor = พื้น(เดินทับได้), wall = ติดผนัง, หรือกล่องชนเป็น [dx,dy,w,h] จากมุมซ้ายบนของสไปรต์
  const PROPS = [
    // ห้องผู้อำนวยการ
    ['window', 24, 1, 'wall'], ['painting', 82, 2, 'wall'],
    ['bookshelf', 74, 6, [0, 18, 32, 20]], ['boss_chair', 47, 38, [2, 8, 14, 8]], ['boss_desk', 30, 50, [0, 8, 48, 16]],
    ['plant', 18, 86, [2, 14, 12, 10]], ['sofa_small', 68, 88, [0, 6, 36, 14]],
    // ห้องประชุม
    ['whiteboard', 134, 1, 'wall'], ['screen_tv', 180, 1, 'wall'],
    ['office_chair', 150, 34, [0, 6, 14, 10]], ['office_chair', 170, 34, [0, 6, 14, 10]], ['office_chair', 190, 34, [0, 6, 14, 10]],
    ['meeting_table', 143, 48, [0, 2, 66, 24]],
    ['office_chair', 150, 78, [0, 6, 14, 10]], ['office_chair', 170, 78, [0, 6, 14, 10]], ['office_chair', 190, 78, [0, 6, 14, 10]],
    ['plant', 206, 90, [2, 14, 12, 10]],
    // ห้องตัดต่อ & เสียง
    ['speaker', 245, 12, [0, 10, 12, 10]], ['edit_desk', 264, 18, [0, 8, 46, 16]], ['speaker', 318, 12, [0, 10, 12, 10]],
    ['office_chair', 268, 42, [0, 6, 14, 10]], ['office_chair', 294, 42, [0, 6, 14, 10]], ['filing', 246, 82, [0, 12, 16, 12]], ['plant', 318, 88, [2, 14, 12, 10]],
    // โถงทำงาน
    ['clock', 100, 115, 'wall'], ['painting', 222, 114, 'wall'],
    ['doormat', 146, 272, 'floor'],
    ['work_desk', 36, 150, [0, 10, 32, 14]], ['office_chair', 46, 172, [0, 6, 14, 10]],
    ['work_desk', 70, 150, [0, 10, 32, 14]], ['office_chair', 80, 172, [0, 6, 14, 10]],
    ['work_desk', 104, 150, [0, 10, 32, 14]], ['office_chair', 114, 172, [0, 6, 14, 10]],
    ['work_desk', 166, 150, [0, 10, 32, 14]], ['office_chair', 176, 172, [0, 6, 14, 10]],
    ['work_desk', 200, 150, [0, 10, 32, 14]], ['office_chair', 210, 172, [0, 6, 14, 10]],
    ['work_desk', 36, 210, [0, 10, 32, 14]], ['office_chair', 46, 232, [0, 6, 14, 10]],
    ['work_desk', 70, 210, [0, 10, 32, 14]], ['office_chair', 80, 232, [0, 6, 14, 10]],
    ['work_desk', 104, 210, [0, 10, 32, 14]], ['office_chair', 114, 232, [0, 6, 14, 10]],
    ['work_desk', 166, 210, [0, 10, 32, 14]], ['office_chair', 176, 232, [0, 6, 14, 10]],
    ['work_desk', 200, 210, [0, 10, 32, 14]], ['office_chair', 210, 232, [0, 6, 14, 10]],
    ['printer', 250, 134, [0, 6, 20, 12]], ['coffee_bar', 286, 128, [0, 10, 42, 18]], ['water_cooler', 322, 158, [0, 16, 14, 12]],
    ['sofa_small', 282, 232, [0, 6, 36, 14]], ['plant', 18, 262, [2, 14, 12, 10]], ['plant', 318, 262, [2, 14, 12, 10]],
  ];
  // พนักงาน: [รหัสสไปรต์, ชื่อตำแหน่ง, x, y(เท้า), ทิศ]
  const STAFF = [
    ['director', 'ผู้อำนวยการสตูดิโอ', 55, 56, 'down'],
    ['film', 'ผู้กำกับ', 177, 49, 'down'], ['critic', 'นักวิจารณ์', 177, 93, 'up'],
    ['editor', 'ช่างตัดต่อ', 275, 57, 'up'], ['sound', 'วิศวกรเสียง', 301, 57, 'up'],
    ['writer', 'ผู้เขียนบท', 53, 187, 'up'], ['animator', 'นักแอนิเมต', 87, 187, 'up'],
    ['marketer', 'นักการตลาด', 183, 187, 'up'], ['planner', 'นักวางแผนคอนเทนต์', 217, 187, 'up'],
    ['librarian', 'บรรณารักษ์', 121, 247, 'up'],
    ['qav', 'QA ภาพนิ่ง', 53, 247, 'up'], ['qam', 'QA การเคลื่อนไหว', 87, 247, 'up'], ['qaa', 'QA เสียง-ภาพ', 183, 247, 'up'],
  ].map(([id, name, x, y, dir], i) => ({ id, name, x, y, dir, seat: { x, y, dir }, phase: i * 0.37, route: null, walking: false, flip: false, f: 0, t: 0, pause: 0 }));
  const ROLE_TO_STAFF = { director: 'director', writer: 'writer', sound: 'sound', 'film-director': 'film', animator: 'animator', editor: 'editor', critic: 'critic', marketer: 'marketer', planner: 'planner', librarian: 'librarian', 'qa-visual': 'qav', 'qa-motion': 'qam', 'qa-av': 'qaa' };
  let activeId = null, studio = false;
  const EXIT = { x: 9 * T, y: 18 * T, w: 32, h: 16 };

  let sheet, img, ctx, cv, solids = [], nav, navW, navH;
  const fr = (n) => sheet.frames[n].frame;
  function draw(name, x, y, flip = false) {
    const f = fr(name);
    if (!flip) { ctx.drawImage(img, f.x, f.y, f.w, f.h, Math.round(x), Math.round(y), f.w, f.h); return; }
    ctx.save(); ctx.translate(Math.round(x) + f.w, Math.round(y)); ctx.scale(-1, 1);
    ctx.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h); ctx.restore();
  }

  // ---- ชน ----
  function buildSolids() {
    solids = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (isWall(tileAt(c, r))) solids.push({ x: c * T, y: r * T, w: T, h: T, exit: tileAt(c, r) === 'E' });
    for (const [n, x, y, k] of PROPS) if (Array.isArray(k)) solids.push({ x: x + k[0], y: y + k[1], w: k[2], h: k[3] });
  }
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const box = (e, x = e.x, y = e.y) => ({ x: x - e.hw, y: y - e.hh, w: e.hw * 2, h: e.hh });
  function blocked(e, x, y, others = []) {
    const b = box(e, x, y);
    for (const s of solids) if (hit(b, s)) return s;
    for (const o of others) if (o !== e && hit(b, box(o))) return o;
    return null;
  }

  // ---- ตารางเดิน (ช่อง 8px) สำหรับ NPC ----
  function buildNav() {
    navW = MW / 8; navH = MH / 8; nav = new Uint8Array(navW * navH);
    const probe = { hw: 4, hh: 5 };
    for (let r = 0; r < navH; r++) for (let c = 0; c < navW; c++) nav[r * navW + c] = blocked(probe, c * 8 + 4, r * 8 + 6) ? 0 : 1;
  }
  function path(from, to) {
    const K = (c, r) => r * navW + c, prev = new Int32Array(navW * navH).fill(-1), s = K(from.c, from.r), g = K(to.c, to.r);
    if (!nav[g]) return null;
    const q = [s]; prev[s] = s;
    for (let i = 0; i < q.length; i++) {
      const k = q[i]; if (k === g) break;
      const c = k % navW, r = (k / navW) | 0;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc, nr = r + dr, nk = K(nc, nr);
        if (nc >= 0 && nr >= 0 && nc < navW && nr < navH && nav[nk] && prev[nk] < 0) { prev[nk] = k; q.push(nk); }
      }
    }
    if (prev[g] < 0) return null;
    const out = [];
    for (let k = g; k !== s; k = prev[k]) out.unshift({ x: (k % navW) * 8 + 4, y: ((k / navW) | 0) * 8 + 6 });
    return out;
  }
  const cellOf = (e) => ({ c: Math.max(0, Math.min(navW - 1, Math.floor(e.x / 8))), r: Math.max(0, Math.min(navH - 1, Math.floor((e.y - 6) / 8 + 0.5))) });
  function randomTarget(e, maxD) {
    const here = cellOf(e);
    for (let tries = 0; tries < 40; tries++) {
      const c = here.c + Math.round((Math.random() * 2 - 1) * maxD), r = here.r + Math.round((Math.random() * 2 - 1) * maxD);
      if (c < 0 || r < 0 || c >= navW || r >= navH || !nav[r * navW + c]) continue;
      const p = path(here, { c, r });
      if (p && p.length > 2) return p;
    }
    return null;
  }

  // ---- ตัวละคร ----
  const hero = { kind: 'hero', x: 168, y: 250, hw: 4, hh: 5, dir: 'up', flip: false, f: 0, t: 0, moving: false };
  const maid = { kind: 'maid', x: 230, y: 256, hw: 4, hh: 5, dir: 'down', flip: false, f: 0, t: 0, moving: false, wait: 1, route: null };
  const actors = [hero, maid];

  function face(e, vx, vy) {
    const a = Math.atan2(vy, vx), s = Math.round(a / (Math.PI / 4)); // -4..4
    const m = { 0: ['side', false], 1: ['downside', false], 2: ['down', false], 3: ['downside', true], 4: ['side', true], '-4': ['side', true], '-1': ['upside', false], '-2': ['up', false], '-3': ['upside', true] }[s];
    e.dir = m[0]; e.flip = m[1];
  }
  function move(e, vx, vy, dt) {
    const nx = e.x + vx * dt, ny = e.y + vy * dt;
    let moved = false, touched = null;
    const bx = blocked(e, nx, e.y, actors); if (!bx) { e.x = nx; moved = true; } else touched = bx;
    const by = blocked(e, e.x, ny, actors); if (!by) { e.y = ny; moved = true; } else touched = touched || by;
    return { moved, touched };
  }

  // ---- อินพุต ----
  const keys = new Set();
  const joy = { on: false, dx: 0, dy: 0 };
  addEventListener('keydown', (e) => { keys.add(e.key.toLowerCase()); if (e.key.startsWith('Arrow')) e.preventDefault(); });
  addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

  // ---- ข้อความ ----
  let msgTimer = 0;
  function say(text) { const el = document.getElementById('msg'); el.textContent = text; el.hidden = false; msgTimer = 2.4; }

  function update(dt) {
    updateStaff(dt);
    if (studio) { npc(maid, dt, 34, 14, () => 1 + Math.random() * 2.5); return; }
    // ผู้เล่น: 8 ทิศ (ทแยงได้)
    let ix = 0, iy = 0;
    if (keys.has('arrowleft') || keys.has('a')) ix -= 1; if (keys.has('arrowright') || keys.has('d')) ix += 1;
    if (keys.has('arrowup') || keys.has('w')) iy -= 1; if (keys.has('arrowdown') || keys.has('s')) iy += 1;
    if (joy.on) { ix = joy.dx; iy = joy.dy; }
    const mag = Math.hypot(ix, iy);
    hero.moving = mag > 0.15;
    if (hero.moving) {
      const sp = 78 * Math.min(1, mag);
      const vx = ix / Math.max(mag, 1) * sp, vy = iy / Math.max(mag, 1) * sp;
      face(hero, vx, vy);
      const { touched } = move(hero, vx, vy, dt);
      if (touched && touched.exit && msgTimer <= 0.6) say('ยังไม่อนุญาตให้ออกจากออฟฟิศ');
    }
    animate(hero, dt, 9);
    npc(maid, dt, 34, 14, () => 1 + Math.random() * 2.5);
    if (msgTimer > 0) { msgTimer -= dt; if (msgTimer <= 0) document.getElementById('msg').hidden = true; }
  }
  function animate(e, dt, fps) { if (e.moving) { e.t += dt; e.f = Math.floor(e.t * fps) % 4; } else { e.f = 0; e.t = 0; } }
  function follow(e, sp, dt) {
    const p = e.route[0], dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy);
    if (d < 1.5) { e.route.shift(); return; }
    face(e, dx, dy);
    const { moved } = move(e, dx / d * sp, dy / d * sp, dt);
    if (!moved) { e.stuck = (e.stuck || 0) + dt; if (e.stuck > 0.6) { e.route = null; e.stuck = 0; e.wait = 0.4 + Math.random(); } } else e.stuck = 0;
  }
  function npc(e, dt, sp, range, idle) {
    if (e.route && e.route.length) { e.moving = true; follow(e, sp, dt); if (e.route && !e.route.length) { e.route = null; e.wait = idle(); } }
    else { e.moving = false; e.wait -= dt; if (e.wait <= 0) { e.route = randomTarget(e, range); if (!e.route) e.wait = 0.5; } }
    animate(e, dt, 7);
  }
  // ---- โหมดสตูดิโอ: พนักงานเดินเอาแฟ้มไปส่งงาน ----
  function nearestWalkable(x, y) {
    let best = null, bd = 1e9;
    for (let r = 0; r < navH; r++) for (let c = 0; c < navW; c++) if (nav[r * navW + c]) {
      const px = c * 8 + 4, py = r * 8 + 6, d = (px - x) ** 2 + (py - y) ** 2;
      if (d < bd) { bd = d; best = { c, r, x: px, y: py }; }
    }
    return best;
  }
  function staffRoute(p, to) {
    const a = nearestWalkable(p.x, p.y), b = nearestWalkable(to.x, to.y);
    const mid = path({ c: a.c, r: a.r }, { c: b.c, r: b.r }) || [{ x: b.x, y: b.y }];
    return [{ x: a.x, y: a.y }, ...mid];
  }
  // ขั้นตอนของพนักงาน: เดินไปจุดหนึ่ง → ทำอะไรสักอย่าง → เดินกลับที่นั่ง
  const SPOTS = { cooler: { x: 316, y: 186 }, printer: { x: 258, y: 156 }, coffee: { x: 300, y: 164 }, meetA: { x: 160, y: 104 }, meetB: { x: 192, y: 104 } };
  const CHAT = ['กาแฟหน่อย ☕', 'ไอเดียใหม่!', 'ช็อตนี้สวยมาก', 'ประชุมกี่โมง?', 'บทใหม่มาแล้ว', 'พักสายตาแป๊บ', 'ซับไม่ล้นแล้วนะ', 'ลูกค้าชอบแน่', 'เพลงนี้ติดหู', 'ส่งไฟล์ให้แล้ว'];
  const REPLY = ['เยี่ยมเลย!', 'โอเค!', 'จริงด้วย', 'เดี๋ยวดูให้', '555', 'ได้เลย'];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const idle = (p) => !p.route && !p.plan && p.id !== activeId;
  function speak(p, text, dur) { p.speech = { text, until: performance.now() + dur * 1000 }; }
  function goTo(p, pt, then) { p.route = [...staffRoute(p, pt), { x: pt.x, y: pt.y }]; p.then = then; p.plan = true; }
  function goHome(p) { p.carry = false; goTo(p, p.seat, () => { p.x = p.seat.x; p.y = p.seat.y; p.dir = p.seat.dir; p.flip = false; p.plan = null; }); }
  function waitThen(p, sec, fn) { p.pause = sec; p.afterPause = fn; }

  // (ข) ส่งงานต่อ = สองคนเดินไปเจอกันที่ห้องประชุม คุยตามโน้ตส่งงานจริง แล้วแยกย้าย
  let note = '';
  function setRole(role, active = true, handoffNote = '') {
    const id = active ? ROLE_TO_STAFF[role] || null : null;
    if (handoffNote) note = handoffNote;
    if (id && activeId && id !== activeId) {
      const from = STAFF.find((s) => s.id === activeId), to = STAFF.find((s) => s.id === id);
      if (from && to) meet(from, to, note || 'ส่งงานต่อนะ', 'รับทราบ! เริ่มเลย');
    }
    activeId = id;
  }
  function meet(a, b, lineA, lineB) {
    for (const p of [a, b]) { p.route = null; p.pause = 0; p.afterPause = null; p.then = null; }
    let arrived = 0;
    const talk = () => {
      if (++arrived < 2) return;
      a.dir = 'side'; a.flip = false; b.dir = 'side'; b.flip = true;
      speak(a, lineA, 3.2);
      waitThen(a, 3.4, () => { speak(b, lineB, 2.2); waitThen(b, 2.4, () => { goHome(a); goHome(b); }); });
    };
    a.carry = true;
    goTo(a, SPOTS.meetA, talk); goTo(b, SPOTS.meetB, talk);
  }

  // (ก) ชีวิตประจำวัน: สุ่มคนว่างลุกไปตู้น้ำ/กาแฟ/เครื่องพิมพ์ หรือเดินไปคุยโต๊ะเพื่อน
  let ambientIn = 3;
  function ambient() {
    const free = STAFF.filter(idle);
    if (free.length < 2 || STAFF.filter((p) => p.plan).length >= 3) return;
    const p = pick(free);
    if (Math.random() < 0.45) {
      const q = pick(free.filter((x) => x !== p));
      const near = { x: q.seat.x + (q.seat.dir === 'up' ? 0 : 14), y: q.seat.y + (q.seat.dir === 'up' ? 14 : 16) };
      goTo(p, near, () => { p.dir = 'up'; speak(p, pick(CHAT), 2.6); waitThen(p, 2.8, () => { speak(q, pick(REPLY), 1.8); waitThen(p, 2.0, () => goHome(p)); }); });
    } else {
      const [spot, line] = pick([[SPOTS.cooler, 'น้ำเย็นชื่นใจ'], [SPOTS.coffee, 'กาแฟหน่อย ☕'], [SPOTS.printer, 'ปริ้นต์สคริปต์']]);
      goTo(p, spot, () => { p.dir = 'up'; speak(p, line, 2.2); waitThen(p, 2.6, () => goHome(p)); });
    }
  }
  function updateStaff(dt) {
    ambientIn -= dt;
    if (ambientIn <= 0) { ambient(); ambientIn = 5 + Math.random() * 7; }
    for (const p of STAFF) {
      if (p.pause > 0) { p.pause -= dt; p.walking = false; if (p.pause <= 0 && p.afterPause) { const f = p.afterPause; p.afterPause = null; f(); } continue; }
      if (!p.route) continue;
      if (!p.route.length) { p.route = null; p.walking = false; const f = p.then; p.then = null; if (f) f(); continue; }
      const q = p.route[0], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy), v = 40 * dt;
      p.walking = true; face(p, dx, dy); p.t += dt; p.f = Math.floor(p.t * 8) % 4;
      if (d <= v) { p.x = q.x; p.y = q.y; p.route.shift(); } else { p.x += dx / d * v; p.y += dy / d * v; }
    }
  }
  // บอลลูนคำพูด (HTML ให้อ่านภาษาไทยได้คมชัด)
  const sayEls = new Map();
  function placeSpeech() {
    const host = studio ? cv.parentElement : document.body, now = performance.now();
    for (const p of STAFF) {
      let el = sayEls.get(p.id);
      const on = p.speech && p.speech.until > now;
      if (!on) { if (el) el.hidden = true; continue; }
      if (!el) { el = document.createElement('div'); el.className = 'say'; host.appendChild(el); sayEls.set(p.id, el); }
      el.hidden = false; el.textContent = p.speech.text;
      const x = p.x, y = p.y - 30;
      if (studio) { el.style.left = (x / MW * 100) + '%'; el.style.top = (y / MH * 100) + '%'; }
      else { el.style.left = (x - Math.round(cam.x)) * view.scale + 'px'; el.style.top = (y - Math.round(cam.y)) * view.scale + 'px'; }
    }
  }
  function bubble(x, y, time) {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 8, y - 6, 16, 9); ctx.fillRect(x - 9, y - 5, 18, 7); ctx.fillRect(x - 1, y + 3, 3, 2);
    const k = Math.floor(time / 300) % 3;
    for (let i = 0; i < 3; i++) { ctx.fillStyle = i === k ? '#2f6fdf' : '#9aa3bd'; ctx.fillRect(x - 5 + i * 4, y - 2, 2, 2); }
  }

  // ---- วาด ----
  let view = { w: 200, h: 300, scale: 2 }, cam = { x: 0, y: 0 };
  function resize() {
    if (studio) { view = { scale: cv.clientWidth / MW || 1, w: MW, h: MH }; cv.width = MW; cv.height = MH; ctx.imageSmoothingEnabled = false; return; }
    const W = innerWidth, H = innerHeight;
    const scale = Math.max(1, Math.floor(Math.min(W / 190, H / 210)));
    view = { scale, w: Math.ceil(W / scale), h: Math.ceil(H / scale) };
    cv.width = view.w; cv.height = view.h;
    cv.style.width = view.w * scale + 'px'; cv.style.height = view.h * scale + 'px';
    ctx.imageSmoothingEnabled = false;
  }
  function spriteOf(e) {
    return `${e.kind}_${e.dir}_${e.f}`;
  }
  let labelEls = [];
  function placeLabels() {
    if (!labelEls.length) labelEls = LABELS.map(([t]) => { const d = document.createElement('div'); d.className = 'room'; d.textContent = t; (studio ? cv.parentElement : document.body).appendChild(d); return d; });
    LABELS.forEach(([, x, y], i) => {
      const el = labelEls[i];
      if (studio) { el.style.left = (x / MW * 100) + '%'; el.style.top = (y / MH * 100) + '%'; return; }
      el.style.left = (x - Math.round(cam.x)) * view.scale + 'px'; el.style.top = (y - Math.round(cam.y)) * view.scale + 'px';
    });
    if (studio) { const act = STAFF.find((s) => s.id === activeId); labelEls.forEach((el, i) => el.classList.toggle('on', !!act && roomOf(act.seat) === i)); }
  }
  function roomOf(pt) { if (pt.y > 120) return 3; return pt.x < 112 ? 0 : pt.x < 224 ? 1 : 2; }
  function render(time) {
    if (studio) { cam.x = 0; cam.y = 0; placeLabels(); }
    else renderCam();
    placeSpeech();
    drawWorld(time);
  }
  function renderCam() {
    // กล้องตามผู้เล่น (ถ้าแผนที่เล็กกว่าจอ วางกึ่งกลาง)
    const cx = MW <= view.w ? (MW - view.w) / 2 : Math.max(0, Math.min(MW - view.w, hero.x - view.w / 2));
    const cy = MH <= view.h ? (MH - view.h) / 2 : Math.max(0, Math.min(MH - view.h, hero.y - 12 - view.h / 2));
    cam.x += (cx - cam.x) * 0.2; cam.y += (cy - cam.y) * 0.2;
    placeLabels();
    const near = STAFF.reduce((b, p) => { const d = Math.hypot(p.x - hero.x, p.y - hero.y); return d < 34 && (!b || d < b.d) ? { p, d } : b; }, null);
    const tag = document.getElementById('tag');
    if (near) { tag.hidden = false; tag.textContent = near.p.name; tag.style.left = (near.p.x - Math.round(cam.x)) * view.scale + 'px'; tag.style.top = (near.p.y - 30 - Math.round(cam.y)) * view.scale + 'px'; } else tag.hidden = true;
  }
  function drawWorld(time) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1b1722'; ctx.fillRect(0, 0, view.w, view.h);
    ctx.setTransform(1, 0, 0, 1, -Math.round(cam.x), -Math.round(cam.y));
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const ch = tileAt(c, r), x = c * T, y = r * T;
      if (FLOOR[ch]) { draw(FLOOR[ch], x, y); continue; }
      const below = tileAt(c, r + 1);
      if (ch === 'E') { draw('t_floor_living', x, y); continue; }
      if (FLOOR[below]) {
        draw('t_wall_face', x, y);
        if (FLOOR[tileAt(c, r - 1)] || isWall(tileAt(c - 1, r - 1)) || r === 0) { ctx.fillStyle = '#4c4256'; ctx.fillRect(x, y, T, 5); ctx.fillStyle = '#3a3142'; ctx.fillRect(x, y + 4, T, 1); } // สันผนัง
      } else draw('t_wall_top', x, y);
    }
    draw('exit_door', EXIT.x, EXIT.y);
    for (const [n, x, y, k] of PROPS) if (k === 'wall' || k === 'floor') draw(n, x, y);
    const list = PROPS.filter((p) => Array.isArray(p[3])).map(([n, x, y, k]) => ({ y: y + k[1] + k[3], n, x, py: y }))
      .concat((studio ? [maid] : actors).map((e) => ({ y: e.y, e })))
      .concat(STAFF.map((p) => ({ y: p.y + (!p.walking && p.dir === 'up' ? 4 : 0), p })));
    list.sort((a, b) => a.y - b.y);
    for (const it of list) {
      if (it.n) { draw(it.n, it.x, it.py); continue; }
      if (it.p) {
        const p = it.p;
        if (p.walking || p.pause > 0 || p.plan) {
          const n = `staff_${p.id}_${p.dir}_${p.walking ? p.f : 0}`, fm = fr(n);
          ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(Math.round(p.x), Math.round(p.y) - 1, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill();
          draw(n, p.x - fm.w / 2, p.y - fm.h + 1, p.flip);
          if (p.carry) { ctx.fillStyle = '#5b6278'; ctx.fillRect(Math.round(p.x) + 4, Math.round(p.y) - 14, 7, 8); ctx.fillStyle = '#fbf7ef'; ctx.fillRect(Math.round(p.x) + 5, Math.round(p.y) - 13, 5, 6); }
        } else {
          const typing = p.id === activeId, f = typing ? Math.floor(time / 220 + p.phase * 3) % 2 : Math.floor(time / 900 + p.phase * 3) % 2;
          const n = `staff_${p.id}_${p.dir}_${f}`, fm = fr(n); draw(n, p.x - fm.w / 2, p.y - fm.h + 1);
          if (typing) bubble(Math.round(p.x), Math.round(p.y) - 28, time);
        }
        continue;
      }
      const e = it.e, f = fr(spriteOf(e));
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(Math.round(e.x), Math.round(e.y) - 1, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      draw(spriteOf(e), e.x - f.w / 2, e.y - f.h + 1, e.flip);
    }
  }

  // ---- จอยสติ๊กบนมือถือ ----
  function setupTouch() {
    const pad = document.getElementById('joy'), knob = pad.querySelector('i');
    let id = null, ox = 0, oy = 0;
    const R = 44;
    const end = () => { id = null; joy.on = false; joy.dx = joy.dy = 0; pad.classList.remove('on'); knob.style.transform = ''; };
    addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' || id !== null || e.target.closest('#msg')) return;
      id = e.pointerId; ox = e.clientX; oy = e.clientY; joy.on = true;
      pad.style.left = ox - 56 + 'px'; pad.style.top = oy - 56 + 'px'; pad.classList.add('on');
    });
    addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      let dx = e.clientX - ox, dy = e.clientY - oy; const d = Math.hypot(dx, dy);
      if (d > R) { dx = dx / d * R; dy = dy / d * R; }
      joy.dx = dx / R; joy.dy = dy / R; knob.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    addEventListener('pointerup', (e) => { if (e.pointerId === id) end(); });
    addEventListener('pointercancel', (e) => { if (e.pointerId === id) end(); });
  }

  window.startGame = function (opts = {}) {
    img = window.SHEET_IMG; sheet = window.SHEET; studio = !!opts.studio;
    cv = document.getElementById('game'); ctx = cv.getContext('2d');
    buildSolids(); buildNav(); resize(); addEventListener('resize', resize); if (!studio) setupTouch();
    let last = performance.now();
    const loop = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); render(now); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    window.__game = { ambientNow: () => ambient(), hero, maid, STAFF, solids, blocked: (e) => !!blocked(e, e.x, e.y), say, keys, setRole, get activeId() { return activeId; } };
  };
})();
