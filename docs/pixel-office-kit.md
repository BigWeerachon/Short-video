# Pixel Office Kit: คู่มือสร้าง "ออฟฟิศพิกเซล" แสดงการทำงานของทีม AI Agent

คู่มือนี้อธิบายวิธีสร้างหน้าออฟฟิศพิกเซลแบบเดียวกับ PAAKIN Studio ตั้งแต่ศูนย์จนใช้งานได้จริง ได้แก่
- แผนที่ออฟฟิศมุมมองด้านบนเฉียงแบบเกม
- พนักงานนั่งประจำโต๊ะ
- คนที่กำลังทำงานมีบอลลูน "…"
- ตอนส่งงาน คนส่งและคนรับเดินไปประชุมกันพร้อมบอลลูนข้อความส่งงานจริง
- ระหว่างวันพนักงานลุกไปตู้น้ำ กาแฟ หรือคุยโต๊ะเพื่อน
- การ์ดความคืบหน้า แท็บคลังงาน และแท็บรายงาน
- ข้อมูลสดผ่านฐานข้อมูลของ Artifact บน claude.ai

> **ข้อบังคับ: ผู้นำไปใช้ต้องกำหนด agent ของตัวเองเท่านั้น**
> คู่มือนี้ไม่มีรายชื่อ agent ตั้งต้นให้ใช้ ระบบอ่านรายชื่อจาก `office.config.js` ที่คุณเขียนเอง (หัวข้อ 3)
> ถ้าไม่มีไฟล์นี้ หรือรายชื่อว่าง หน้าจะแสดงข้อความ "ยังไม่ได้กำหนด agent" และไม่วาดพนักงานเลย
> ห้ามคัดลอกรายชื่อ agent จากโปรเจกต์อื่นมาใช้แทน

---

## 0. สิ่งที่ต้องมี

| สิ่งที่ต้องมี | ใช้ทำอะไร |
|---|---|
| Claude Code (CLI, web หรือ cloud) | สร้างและรันระบบ |
| Node.js ≥ 22.18 | รัน pxl (วาดสไปรต์), สคริปต์ build และเทสต์ |
| Playwright + Chromium | เทสต์หน้าเว็บอัตโนมัติ (ใน Claude Code cloud ติดตั้งไว้แล้ว) |
| [claude-pxl](https://github.com/crsolver/claude-pxl) (MIT) | DSL วาดพิกเซลอาร์ตด้วยโค้ด → sprite sheet PNG + JSON |
| claude.ai Artifact ที่ประกาศ capability `db` | เผยแพร่หน้าเว็บ และเก็บสถานะงานแบบสด |
| ทีม agent ของคุณใน `.claude/agents/*.md` | ตำแหน่งที่จะไปนั่งในออฟฟิศ |

---

## 1. ภาพรวมสถาปัตยกรรม

```
┌──────────────── Claude Code session (orchestrator) ────────────────┐
│ เรียก agent ของคุณตามลำดับงาน (Agent tool, subagent_type = id)       │
│ จบแต่ละขั้น → ArtifactData.update(jobs/<jobId>, {role, note, ...})   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │  (db ของ Artifact)
┌───────────────────────────────▼─────────────────────────────────────┐
│ office.html (Artifact บน claude.ai เปิดได้ทั้งมือถือและคอม)           │
│  ├─ UI: หัวเว็บ · เมนูค้างด้านบน · การ์ดงาน · คลังงาน · รายงาน       │
│  ├─ world.js: แผนที่ + ตัวละคร + เดินหาทาง + พฤติกรรม (studio mode)  │
│  ├─ sheet (PNG base64 + JSON) จาก pxl                                │
│  └─ office.config.js: agent ของคุณ + ที่นั่ง + หน้าตา                │
└──────────────────────────────────────────────────────────────────────┘
```

หลักการสำคัญ:
1. **ใช้ token เฉพาะตอนอัปเดตสถานะ** แอนิเมชันทั้งหมดรันในเบราว์เซอร์ ระบบอัปเดตแค่ตอนจบแต่ละขั้น (ราว 200–400 token ต่อครั้ง)
2. **วาดแบบ deterministic จากสถานะ** สถานะคือ `role` ที่ทำงานอยู่ และ `note` ที่ใช้ตอนส่งงาน หน้าเว็บคำนวณการเดินเอง
3. **ทำเป็นไฟล์เดียว** สร้าง `office.html` ไฟล์เดียวที่ฝังสไปรต์และโค้ดไว้ เพราะ Artifact โหลดไฟล์จากโฮสต์อื่นไม่ได้

### โครงไฟล์

```
office-kit/
├── office.config.js        ← คุณเขียนเอง (agent, ที่นั่ง, หน้าตา, ห้อง)
├── art/office.px.js        ← สไปรต์ทั้งหมด (pxl)
├── art/out/game.png|json   ← ผลจาก pxl build
├── src/world.js            ← เอนจินแผนที่ + ตัวละคร (studio mode)
├── src/index.html          ← UI + จุดฝัง /*WORLD*/
├── scripts/build.mjs       ← รวมทุกอย่าง → dist/office.html
├── tests/office.test.mjs   ← เทสต์ Playwright + db จำลอง
└── docs/status-protocol.md ← คู่มือให้ agent อัปเดตสถานะ
```

---

## 2. ติดตั้ง

```bash
git clone --depth 1 https://github.com/crsolver/claude-pxl office-kit
```

```bash
cd office-kit && rm -rf .git docs/gallery && git init -b main && mkdir -p art src scripts tests
```

```bash
node bin/pxl.js build examples/basics.px.js --no-preview
```

ถ้าคำสั่งสุดท้ายพิมพ์ `sheet chars ...` แปลว่า pxl ใช้งานได้ อ่าน `SKILL.md` และ `reference.md` ของ pxl ก่อนวาดสไปรต์

---

## 3. `office.config.js` — กำหนด agent ของคุณ (บังคับ)

```js
// office.config.js — ทุกค่าในไฟล์นี้เป็นของคุณ ระบบไม่มีค่าตั้งต้นให้
window.OFFICE_CONFIG = {
  // ห้อง: [ชื่อที่แสดง, x กลางป้าย, y ป้าย] (พิกัดพิกเซลบนแผนที่)
  rooms: [
    ['<ห้อง A>', 64, 3], ['<ห้อง B>', 176, 3], ['<ห้อง C>', 288, 3], ['<โถงรวม>', 120, 131],
  ],
  // agent: id ต้องตรงกับ name ใน .claude/agents/<id>.md และ role ที่ orchestrator เขียนลง db
  agents: [
    // { id: '<agent-id>', name: '<ชื่อที่แสดง>', seat: { x: 55, y: 56, dir: 'down' },
    //   look: { hair: 'H', hairD: 'k', body: 'D', bodyD: 'b', leg: 'J', shoe: 'W', long?: true, messy?: true, collar?: true } },
  ],
  // จุดที่พนักงานเดินไปทำธุระ / จุดประชุม (ต้องเป็นช่องที่เดินได้)
  spots: { cooler: { x: 316, y: 186 }, coffee: { x: 300, y: 164 }, printer: { x: 258, y: 156 },
           meetA: { x: 160, y: 104 }, meetB: { x: 192, y: 104 } },
  chat:  ['<ประโยคคุยเล่น 1>', '<ประโยคคุยเล่น 2>'],   // คุยโต๊ะเพื่อน
  reply: ['<คำตอบ 1>', '<คำตอบ 2>'],
};
```

กฎ:
- `agents.length` ต้องมากกว่า 0 และ `id` ห้ามซ้ำ ถ้าผิด `world.js` จะขึ้น error บนการ์ด ไม่เดาค่าแทน
- `seat` ต้องอยู่บนเก้าอี้ที่วางไว้ใน `PROPS` (หัวข้อ 5)
  - `dir: 'up'` คือนั่งหันหลังเข้าจอคอม เก้าอี้อยู่ใต้โต๊ะ
  - `dir: 'down'` คือนั่งหันหน้าออก เก้าอี้อยู่เหนือโต๊ะ
- คีย์สีใน `look` ต้องมีอยู่ใน `pal({...})` ของ `art/office.px.js`
- จำนวนโต๊ะใน `PROPS` ต้องมากกว่าหรือเท่ากับจำนวน agent

**สร้างสไปรต์จาก config อัตโนมัติ:** `office.config.js` เป็นสคริปต์ฝั่งเบราว์เซอร์ ไฟล์ px.js จึงอ่านตรงๆ ไม่ได้ ให้ `scripts/build.mjs` อ่าน config แล้วเขียนไฟล์ `art/agents.gen.px.js` จากนั้นใน `art/office.px.js` เรียก `include("agents.gen.px.js")` (ดูหัวข้อ 8)

---

## 4. สไปรต์ (`art/office.px.js`)

ตั้งค่าหลัก: ไทล์ 16×16px, outline สีเข้ม `k`, และใช้ palette เดียวทั้งไฟล์

### 4.1 Palette (ปรับได้ แต่คีย์ต้องตรงกับ config)

```js
pal({
  k: "#1f1a24", s: "#f7c9a4", S: "#e2a582", p: "#f29a9a", e: "#2a1f2b",
  h: "#6b4329", H: "#47291a", t: "#3f8fd2", T: "#2c6aa3", j: "#3b4a6b", J: "#2c3650",
  w: "#fbf7ef", W: "#d9d3c8", m: "#34303d", M: "#25212c", n: "#2b2231",
  o: "#e0954a", O: "#b8702f", c: "#f6e3c4",
  a: "#d39a5e", A: "#b97f45", B: "#a06a36", f: "#ecc995", F: "#d6ad74",
  v: "#efe3cc", V: "#dccbad", u: "#8b5e3c", x: "#4c4256", X: "#3a3142",
  r: "#9c6338", R: "#74462a", y: "#c58a52",
  g: "#6fae6a", G: "#4f8a4d", q: "#5b7fc4", Q: "#445f9a", z: "#d0605a", Z: "#a8463f",
  l: "#a7b0bd", L: "#717a8a", P: "#c96f4a", Y: "#f6d36b", b: "#2b2d36", D: "#3b4a6b", d: "#7fb4ea",
})
```

### 4.2 ไทล์ (16×16 ไม่มี outline)

| ชื่อ | วาดอย่างไร |
|---|---|
| `t_floor_living` | `a` เต็ม + เส้นแนวนอน `A` ที่ y=3,7,11,15 + รอยต่อไม้แนวตั้งสลับตำแหน่ง |
| `t_floor_bed` | แบบเดียวกัน สี `f/F` (ไม้อ่อน) |
| `t_floor_carpet` | `q` เต็ม + สี่เหลี่ยม `Q` 8×8 ที่มุมซ้ายบนและมุมขวาล่าง (ลายตาราง) |
| `t_floor_studio` | `D` เต็ม + ขอบล่าง/ขวา `b` |
| `t_wall_top` | `x` เต็ม + เส้น `X` ด้านบนและล่าง |
| `t_wall_face` | `v` เต็ม + ขอบบน `X` + เส้น `V` ที่ y=9 + บัวผนัง `u` สูง 3px ด้านล่าง |

### 4.3 เฟอร์นิเจอร์ (ทุกชิ้นใช้ `outline: "k"`)

| ชื่อ | ขนาด (ก่อน outline) | จุดสำคัญ |
|---|---|---|
| `work_desk` | 30×22 | หน้าโต๊ะ `r/y`, จอ `b` มีหน้าจอ `d`, คีย์บอร์ด, แก้ว |
| `office_chair` | 12×14 | พนัก `b`, เบาะ `L` |
| `boss_desk` / `boss_chair` | 46×24 / 16×16 | โต๊ะใหญ่ + โคมไฟ |
| `meeting_table` | 64×28 | กระดาษ 3 แผ่น |
| `whiteboard` / `screen_tv` / `window` / `painting` / `clock` | ของติดผนัง | ไม่มีกล่องชน |
| `bookshelf`, `filing`, `printer`, `water_cooler`, `coffee_bar`, `edit_desk`, `speaker`, `sofa_small`, `plant`, `doormat`, `exit_door` | — | ดูตัวอย่างโค้ดใน `fst-pixel-game/art/house.px.js` |

### 4.4 ตัวละครจิบิ (ฟังก์ชันเดียวใช้กับทุก agent)

- ขนาด 14×22 (+outline = 16×24) หัวสูงราว 12px ตัว 6px ขา 4px
- วาด 5 ทิศ: `down`, `downside`, `side`, `upside`, `up` ทิศซ้ายใช้การกลับภาพในเกม จึงเดินได้ 8 ทิศ
- ทิศละ 4 เฟรมเดิน: ระยะก้าว `LEG = [0, 1, 0, -1]` และเฟรมคี่ตัวกระเด้งขึ้น 1px
- ตัวเลือกหน้าตา: `long` (ผมยาว), `messy` (ผมชี้), `collar` (ปกขาว), `apron` (ผ้ากันเปื้อน), `skirt`, `headband`

```js
const DIRS = ["down", "downside", "side", "upside", "up"]
function chibi(cv, L, dir, f) { /* ขา → ลำตัว → แขน → หัว → ผม → หน้า (ดูโค้ดเต็มใน house.px.js) */ }
// agents.gen.px.js (สร้างโดย build.mjs จาก config):
// for (const dir of DIRS) for (let f = 0; f < 4; f++)
//   sprite(`staff_<id>_${dir}_${f}`, { w: 14, h: 22, outline: "k" }, (cv) => chibi(cv, <look>, dir, f))

sheet("game", ["t_*", "<เฟอร์นิเจอร์ทุกชิ้น>", "staff_*", "maid_*"], { pad: 1 })
```

build ด้วย `node bin/pxl.js build art/office.px.js` แล้วดูผลที่ `art/out/_preview/game.png`

---

## 5. แผนที่และของ (`src/world.js`)

### 5.1 แผนที่ (ไทล์ 16px, 22×19 ช่อง = 352×304px)

```js
// # ผนัง · b c s l = พื้น 4 แบบ · E = ประตูทางออก
const MAP = [
  '######################',
  '#bbbbbb#cccccc#ssssss#',  // ×6 แถว: 3 ห้องด้านบน
  ...,
  '###ll#####ll#####ll###',  // ผนังกั้น + ประตู 3 ช่อง (กว้าง 2 ไทล์)
  '#llllllllllllllllllll#',  // ×10 แถว: โถงรวม
  ...,
  '#########EE###########',
];
const FLOOR = { b: 't_floor_bed', c: 't_floor_carpet', s: 't_floor_studio', l: 't_floor_living' };
```

กฎการวาดผนังแบบ 3/4:
- ไทล์ `#` ที่ไทล์ข้างล่างเป็นพื้น ให้วาด `t_wall_face` (หน้าผนัง)
- ไทล์ `#` อื่นวาด `t_wall_top`
- ถ้าไทล์ข้างบนของหน้าผนังเป็นพื้น หรือเป็นแถวบนสุด ให้วาดสันผนัง `#4c4256` สูง 5px ทับขอบบน (ผนังกั้นจะได้มีความหนา)

### 5.2 PROPS: `[sprite, x, y, ชนิด]`

- `'wall'` = ของติดผนัง วาดก่อนสิ่งอื่น ไม่มีกล่องชน
- `'floor'` = พรม/พรมเช็ดเท้า ไม่มีกล่องชน
- `[dx, dy, w, h]` = กล่องชนวัดจากมุมซ้ายบนของสไปรต์ ปกติเป็นแค่ส่วนล่างของของชิ้นนั้น

ตัวอย่างโต๊ะทำงาน + เก้าอี้ (โต๊ะละคู่):
```js
['work_desk', X, Y, [0, 10, 32, 14]], ['office_chair', X + 10, Y + 22, [0, 6, 14, 10]],
// ที่นั่งของ agent ที่หันหน้าเข้าโต๊ะ: seat = { x: X + 17, y: Y + 37, dir: 'up' }
```

### 5.3 ลำดับการวาด (สำคัญมาก ห้ามสลับ)

1. พื้นและผนังทุกไทล์
2. ประตูทางออก, ของ `'wall'`, ของ `'floor'`
3. ของที่มีกล่องชนทุกชิ้น และตัวละครทุกตัว **เรียงตามค่า y จากน้อยไปมาก**
   - ของ: `y = y_สไปรต์ + dy + h` (ขอบล่างของกล่องชน)
   - ตัวละครที่ยืนหรือเดิน: `y = เท้า`
   - **คนนั่งหันหลัง (`dir:'up'` และไม่ได้เดิน): `y = เท้า + 4`** ไม่งั้นพนักเก้าอี้จะวาดทับตัว
4. บอลลูน "…" ของคนที่ทำงานอยู่ (วาดบน canvas)
5. ป้ายห้องและบอลลูนคำพูด (เป็น HTML ซ้อนบน canvas ให้ตัวหนังสือไทยคมชัด)

ตำแหน่งตัวละคร: `(x, y)` คือ**กึ่งกลางเท้า** วาดสไปรต์ที่ `x - w/2, y - h + 1` และใส่เงาวงรีใต้เท้า

### 5.4 ตารางเดิน (nav grid) — จุดที่พลาดง่ายที่สุด

```js
// ช่อง 8px; ช่องเดินได้ถ้ากล่องตัวละครกึ่งกลางที่ (c*8+4, r*8+6) ไม่ชนผนังหรือของ
const probe = { hw: 4, hh: 5 };   // ⚠ ต้องเท่ากล่องตัวละครจริง ถ้าใหญ่กว่า ทางระหว่างเก้าอี้จะปิด
```

- หาทางด้วย BFS 4 ทิศบน nav
- `nearestWalkable(x, y)` หาช่องเดินได้ที่ใกล้ที่นั่งที่สุด (ที่นั่งอยู่ในกล่องชนของเก้าอี้ จึงเป็นช่องเดินไม่ได้)
- เส้นทางพนักงาน = `[ช่องใกล้ที่นั่ง, ...BFS, จุดหมาย]` ถ้า BFS หาทางไม่เจอ ให้**เดินตรงไปจุดหมาย** ห้ามยืนนิ่ง
- พนักงานเดินตามจุดในเส้นทางโดยไม่ตรวจชน (เส้นทางเลี่ยงของให้แล้ว) ความเร็ว 40px/วินาที เฟรมเดิน `floor(t*8)%4`
- เลือกทิศจากมุมการเดิน แบ่งเป็น 8 ช่วง ๆ ละ 45°: `0→side, 1→downside, 2→down, 3→downside(กลับภาพ), ±4→side(กลับภาพ), -1→upside, -2→up, -3→upside(กลับภาพ)`

---

## 6. พฤติกรรม (studio mode)

### 6.1 สถานะของพนักงานแต่ละคน
```js
{ id, name, x, y, dir, seat:{x,y,dir}, route:null|[], then:null|fn, plan:null|true,
  pause:0, afterPause:null|fn, walking:false, carry:false, speech:null|{text, until}, f, t }
```
- `goTo(p, pt, then)`: ตั้งเส้นทางแล้วตั้ง `plan = true` พอถึงที่หมายเรียก `then`
- `waitThen(p, sec, fn)`: ยืนรอตามเวลาแล้วเรียก `fn`
- `goHome(p)`: เดินกลับที่นั่ง พอถึงให้ตั้งตำแหน่งตรงกับที่นั่ง และตั้ง `plan = null`
- `speak(p, text, sec)`: ⚠ **ห้ามตั้งชื่อฟังก์ชันว่า `say`** ถ้ามีฟังก์ชัน `say` อื่นอยู่แล้ว ฟังก์ชันที่ประกาศทีหลังจะทับตัวแรกแบบเงียบๆ

### 6.2 คนที่กำลังทำงาน
`activeId` = agent ที่ `role` ตรงกัน คนนี้พิมพ์เร็วขึ้น (สลับเฟรมทุก 220ms แทน 900ms) และมีบอลลูน "…" จุดกระพริบ **ไม่ลุกเดินไปทำธุระ**

### 6.3 ส่งงาน = ประชุม (`setRole(role, active, note)`)
เมื่อ `role` ใหม่ไม่ตรงกับ `activeId` เดิม:
1. ยกเลิกงานค้างของทั้งสองคน (`route`, `pause`, `afterPause`, `then`)
2. คนส่ง `carry = true` (วาดแฟ้มที่มือ) แล้วเดินไป `spots.meetA` คนรับเดินไป `spots.meetB`
3. รอจนถึงครบทั้งคู่ แล้วหันหน้าเข้าหากัน (`side` / `side`+กลับภาพ)
4. คนส่งพูด `note` นาน 3.2 วินาที → รอ 3.4 วินาที → คนรับพูด "รับทราบ! เริ่มเลย" 2.2 วินาที → รอ 2.4 วินาที → ทั้งคู่ `goHome`
5. ตั้ง `activeId = id ใหม่`

### 6.4 ชีวิตประจำวัน (ทุก 5–12 วินาที)
- ทำเฉพาะเมื่อคนว่าง (ไม่มี `route`/`plan` และไม่ใช่ `activeId`) มีอย่างน้อย 2 คน และมีคนลุกอยู่แล้วไม่ถึง 3 คน
- โอกาส 45%: เดินไปคุยโต๊ะเพื่อน จุดยืนคือหน้าเก้าอี้เพื่อน พูดประโยคจาก `chat` 2.6 วินาที → เพื่อนตอบด้วย `reply` 1.8 วินาที → กลับที่นั่ง
- โอกาส 55%: เดินไปตู้น้ำ กาแฟ หรือเครื่องพิมพ์ พูดสั้นๆ 2.2 วินาที → กลับที่นั่ง

### 6.5 บอลลูนคำพูด (HTML)
```css
.office .say { position:absolute; transform:translate(-50%,-100%); font:500 11px Kanit;
  color:#2b2433; background:#fffdf6; border:2px solid #2b2433; border-radius:6px;
  padding:1px 7px; white-space:nowrap; pointer-events:none; }
.office .say::after { /* หางชี้ลง */ }
```
ตำแหน่งบอลลูนใช้หน่วย % ของแผนที่: `left = x/MW*100%`, `top = (y-30)/MH*100%` canvas ยืดตามความกว้างกล่องจึงไม่ต้องคำนวณ scale ใหม่

---

## 7. หน้า UI (`src/index.html`)

- **ธีม:** ดาร์คเทาอุ่นแบบ Claude (`--bg #262624`, `--surface #30302e`, `--ink #faf9f5`) สีเน้นตามแบรนด์ของคุณ
- **หัวเว็บ:** ชื่อสตูดิโอเป็นตัวหนังสือ และสถานะการเชื่อมต่อ ("กำลังเชื่อมต่อ…" / "อัปเดตสด" / "เชื่อมต่อข้อมูลไม่ได้")
- **เมนู 3 แท็บ: ⚠ ต้องเป็น `position: sticky; top: env(safe-area-inset-top)` ใต้หัวเว็บ** ห้ามใช้ `position: fixed; bottom: 0` เพราะในช่องแสดงผลของ claude.ai แถบล่างจะตกขอบมองไม่เห็น
- **แท็บออฟฟิศ:** กล่องแผนที่ (`position: relative`, canvas `width:100%`, `image-rendering:pixelated`) และการ์ดงาน (ชื่อ, ป้ายสถานะ, ข้อความขั้น, แถบคืบหน้า, token ใช้/งบ, ไทม์ไลน์ขั้น)
- **แท็บคลังงาน:** ปุ่มกรองหมวดพร้อมจำนวน การ์ดงาน (ไอคอนประเภท, สถานะ, สถานะ 4 แพลตฟอร์ม) และปุ่ม "ดูและคัดลอกแคปชั่น" → แท็บแพลตฟอร์ม + ข้อความ + จำนวนตัวอักษร + ปุ่มคัดลอก (`navigator.clipboard.writeText` ในตัวจัดการคลิก ถ้าไม่ได้ให้เลือกข้อความแทน)
- **แท็บรายงาน:** แยกบรรทัด `หัวข้อ: ค่า` เป็นแถว และไฮไลต์แถวที่มีคำว่า "ทำต่อ" ด้านล่างเป็นรายการบทเรียนล่าสุด
- **ทุกสถานะว่างต้องมีข้อความบอก** ห้ามปล่อยหน้าว่างเปล่า
- **escape ข้อมูลจาก db ทุกครั้ง** (`esc()`) ก่อนใส่ลง `innerHTML`

### เชื่อมฐานข้อมูล
```js
const db = window.claude && window.claude.use ? await window.claude.use('db') : null;
if (!db) { /* แสดง "ออฟไลน์" แล้วจบ */ }
db.collection('jobs').orderBy('updated','desc').limit(1).onSnapshot(s => { S.job = rows(s)[0]||null; renderJob(); onJob(); }, err);
db.collection('library').orderBy('created','desc').limit(200).onSnapshot(...);
db.collection('reports').orderBy('date','desc').limit(20).onSnapshot(...);
db.collection('lessons').orderBy('date','desc').limit(10).onSnapshot(...);
function onJob() { const r = S.job && S.job.status !== 'done' ? S.job.role : null; window.__game?.setRole(r, !!r, S.job?.note || ''); }
```
- ตั้ง timer 10 วินาที ถ้ายังไม่ได้ข้อมูลให้แสดง "ยังเชื่อมต่อข้อมูลไม่ได้"
- subscribe ครั้งเดียวต่อ query เท่านั้น ห้าม subscribe ในฟังก์ชัน render

---

## 8. Build และเผยแพร่

`scripts/build.mjs` ทำ 3 อย่างตามลำดับ:
1. อ่าน `office.config.js` ด้วย `vm.runInNewContext` แล้วตรวจกฎในหัวข้อ 3 ถ้าไม่ผ่านให้หยุด build และบอกว่าผิดข้อไหน จากนั้นเขียน `art/agents.gen.px.js` (ลูปสร้างสไปรต์ `staff_<id>_*`)
2. รัน `node bin/pxl.js build art/office.px.js --no-preview`
3. แทน `<script>/*WORLD*/</script>` ใน `src/index.html` ด้วย:
   ```html
   <script>window.SHEET=<game.json>;window.SHEET_SRC="data:image/png;base64,<game.png>";</script>
   <script><office.config.js></script>
   <script><src/world.js></script>
   ```
   แล้วเขียนเป็น `dist/office.html`

⚠ ตอนแทนข้อความ ใช้ `replace(token, () => text)` (ส่งเป็นฟังก์ชัน) ไม่ใช่ `replace(token, text)` เพราะ `$` ในโค้ดหรือ JSON จะถูกตีความเป็นรูปแบบพิเศษ

**เผยแพร่ครั้งแรก** (ใน Claude Code ที่มี Artifact tool):
```
Artifact publish  file_path=dist/office.html  icon="office"
  capabilities={"db":{"rules":[{"path":"","read":"view","write":"admin"}]}}
```
ครั้งต่อไปส่ง `file_path` เดิม (หรือส่ง `url` ถ้าเผยแพร่จากเซสชันอื่น) และ**ไม่ต้องส่ง** `capabilities` เพื่อคงค่าเดิมไว้

---

## 9. โปรโตคอลสถานะสำหรับ orchestrator (`docs/status-protocol.md`)

| collection | doc | ฟิลด์ |
|---|---|---|
| `jobs` | `<jobId>` | `title`, `role` (= agent id ที่ทำอยู่), `note` (≤30 ตัวอักษร ประโยคที่พูดตอนส่งงาน), `stage`, `status` (`active` / `done`), `progress` 0–1, `updated` (ISO), `timeline[{stage, role, eta, done}]`, `tokens{budget, used}` |
| `library` | `<id>` | `title`, `type`, `status`, `posted{...}`, `created`, `captions{...}` |
| `reports` | `<jobId>` | `title`, `date`, `text` (บรรทัดละ `หัวข้อ: ค่า`) |
| `lessons` | `<Lxx>` | `text`, `role`, `date` |

กฎสำหรับ orchestrator:
- **เริ่มงาน:** `set jobs/<id>` ใส่ข้อมูลครบทุกฟิลด์
- **จบแต่ละขั้น:** `update` เฉพาะฟิลด์ที่เปลี่ยน (`role`, `note`, `stage`, `progress`, `updated`, `timeline`, `tokens`) และส่ง `if_version` จากครั้งก่อนเสมอ
- **จบงาน:** ใช้ `batch` ครั้งเดียว = job `status: done` + `library` + `reports`
- **ห้ามอัปเดตระหว่างขั้น** (ไม่งั้นเปลือง token)
- **ใส่ไว้ใน `CLAUDE.md`:** `role` ต้องเป็น id ที่อยู่ใน `office.config.js` ทุกตัว ถ้าไม่ตรง หน้าเว็บจะไม่รู้จักและไม่มีใครขยับ

---

## 10. เทสต์ (ต้องผ่านก่อนเผยแพร่ทุกครั้ง)

ใช้ `node --test` + Playwright และแทน `window.claude.use('db')` ด้วยฐานข้อมูลจำลองผ่าน `page.addInitScript` เสิร์ฟไฟล์ผ่านเซิร์ฟเวอร์ในเครื่องที่ส่ง `content-type: text/html; charset=utf-8` ⚠ ถ้าไม่ระบุ charset ภาษาไทยจะกลายเป็นตัวอักษรเพี้ยน

| เทสต์ | ตรวจอะไร |
|---|---|
| ฐานข้อมูลว่าง | เห็นข้อความสถานะว่าง, เมนู 3 แท็บมองเห็น, หน้าไม่เลื่อนแนวนอนที่จอกว้าง 390px |
| config ว่าง | การ์ดแสดง "ยังไม่ได้กำหนด agent" และไม่มีพนักงานบนแผนที่ |
| งานที่ role = X | `__game.activeId === X` และป้ายห้องของ X ถูกไฮไลต์ |
| ส่งงาน X→Y พร้อม note | X เดินจริง (ออกห่างที่นั่งเกิน 4px), บอลลูนแสดง note ตรงตัวอักษร, X กลับมานั่งที่เดิมภายใน 40 วินาที, `activeId === Y` |
| ชีวิตประจำวัน | เรียก `__game.ambientNow()` แล้วภายใน 10 วินาทีมีคนลุกห่างที่นั่งเกิน 16px และมีบอลลูนคำพูดปรากฏ |
| คลังงาน | กดดูแคปชั่น → แท็บแพลตฟอร์ม → ปุ่มคัดลอก → ข้อความที่คัดลอกตรงกับที่ควรเป็น |
| ไม่มี error | ไม่มี `pageerror` ในทุกเทสต์ |

ก่อนเผยแพร่ เปิดหน้าที่ build แล้วด้วย Playwright ถ่ายภาพหน้าจอกว้าง 390px ดู 1 ครั้ง เพื่อเช็กลำดับการวาดและตำแหน่งบอลลูน

---

## 11. ปัญหาที่เคยเจอ และวิธีแก้

| อาการ | สาเหตุ | วิธีแก้ |
|---|---|---|
| ตัวละครไม่เดินเลย / ลุกนิดเดียวแล้วกลับ | probe ของ nav ใหญ่กว่าตัวละคร ทางระหว่างเก้าอี้ปิด | `probe = {hw:4, hh:5}` และเดินตรงเมื่อหาทางไม่เจอ |
| เมนูหายในช่องแสดงผลของ claude.ai | แถบเมนูเป็น `position: fixed; bottom: 0` | ใช้ sticky ด้านบน |
| ข้อความ "ห้ามออก" ไม่ขึ้น | ฟังก์ชัน `say` ซ้ำชื่อ | ตั้งชื่อ `speak` |
| หน้าโหลดแผนที่ไม่ได้ (`Unexpected token 'else'`) | แทรกคำสั่งไว้ระหว่าง `if {}` กับ `else` | รัน `node --check src/world.js` ทุกครั้งก่อน build |
| พนักเก้าอี้ทับคนนั่งหันหลัง | ค่า y ที่ใช้เรียงลำดับเท่ากัน | บวก 4 ให้คนนั่งหันหลัง |
| ภาษาไทยเพี้ยนในเทสต์ | ไม่ได้ระบุ charset | ส่ง `text/html; charset=utf-8` |
| บอลลูนไทยบน canvas อ่านไม่ออก | ฟอนต์ไทยขนาด 8px บน canvas แตก | ใช้บอลลูน HTML ซ้อนบน canvas |
| ใครก็แก้ข้อมูลได้ | ใช้กฎ db ตั้งต้น | กฎ `write: "admin"` ที่ root |

---

## 12. Checklist ส่งมอบ

- [ ] `office.config.js` มี agent ของคุณ ≥1 ตัว, `id` ตรงกับ `.claude/agents/*.md`, ที่นั่งอยู่บนเก้าอี้ทุกคน
- [ ] `node --check src/world.js` ผ่าน
- [ ] `node scripts/build.mjs` ผ่าน (รวมการตรวจ config)
- [ ] `node --test tests/*.test.mjs` ผ่านครบทุกข้อในหัวข้อ 10
- [ ] ดูภาพหน้าจอกว้าง 390px แล้ว 1 ครั้ง
- [ ] เผยแพร่ Artifact พร้อม `db` rules
- [ ] ใส่ลิงก์ Artifact และโปรโตคอลสถานะ (หัวข้อ 9) ลงใน `CLAUDE.md` ของโปรเจกต์
