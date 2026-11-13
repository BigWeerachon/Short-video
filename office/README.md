# ออฟฟิศพิกเซล (Artifact)

- URL: https://claude.ai/artifact/RtbKxpcQYLqzEgKCsFgWuy (เปิดในแอป Claude บนมือถือได้)
- ซอร์ส: `office/index.html` (การ์ด/แท็บ/ข้อมูล) + `office/world/` (แผนที่และตัวละครจากโปรเจกต์ fst-pixel-game)
- สร้างไฟล์เผยแพร่: `node scripts/build_office.mjs` → `office/office.html` แล้วเผยแพร่ด้วย Artifact tool (`file_path` = office/office.html, `url` = ด้านบน)
- แผนที่: ห้องผู้อำนวยการ · ห้องประชุม · ห้องตัดต่อ & เสียง · โถงทำงาน — พนักงาน 10 ตำแหน่งนั่งประจำที่
- เมื่อ `jobs.role` เปลี่ยน: คนส่งถือแฟ้ม + คนรับ เดินไปเจอกันที่ห้องประชุม คุยตาม `jobs.note` แล้วแยกกลับโต๊ะ
- ชีวิตประจำวัน: ทุก 5–12 วิ คนว่างจะลุกไปตู้น้ำ/กาแฟ/เครื่องพิมพ์ หรือเดินไปคุยโต๊ะเพื่อน (รันในเบราว์เซอร์ ไม่ใช้ token) · คนที่กำลังทำมีบอลลูน "…" และป้ายห้องเป็นสีโลโก้
- capability: `db` กฎ `{path:"", read:"view", write:"admin"}` → ทุกคนที่เปิดได้อ่าน, เขียนได้เฉพาะเจ้าของ/Editor (และ Claude ผ่าน ArtifactData)

## โครงข้อมูล (db)
| collection | doc id | ฟิลด์ |
|---|---|---|
| `jobs` | `<jobId>` | title, role (ตำแหน่งที่ทำอยู่), stage (ข้อความไทย), status `active|done`, progress 0–1, updated (ISO), timeline[{stage, role, eta, done}], tokens{budget, used} |
| `library` | `<libraryId>` | เหมือน `library/index.json` + `captions` (ตาม `engine/content/captions.py`) |
| `reports` | `<jobId>` | jobId, title, date (YYYY-MM-DD), text |
| `lessons` | `<Lxx>` | text, role, date |

หน้าเว็บแสดง: งานที่ `updated` ล่าสุด 1 งาน · คลัง 200 รายการ · รายงาน 20 · บทเรียน 10
