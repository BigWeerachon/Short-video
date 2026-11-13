# ออฟฟิศพิกเซล (Artifact)

- URL: https://claude.ai/artifact/RtbKxpcQYLqzEgKCsFgWuy (เปิดในแอป Claude บนมือถือได้)
- ไฟล์: `office/index.html` — แก้แล้วเผยแพร่ด้วย Artifact tool (`file_path` = ไฟล์นี้, `url` = ด้านบน, ไม่ต้องส่ง capabilities เพื่อคงค่าเดิม)
- capability: `db` กฎ `{path:"", read:"view", write:"admin"}` → ทุกคนที่เปิดได้อ่าน, เขียนได้เฉพาะเจ้าของ/Editor (และ Claude ผ่าน ArtifactData)

## โครงข้อมูล (db)
| collection | doc id | ฟิลด์ |
|---|---|---|
| `jobs` | `<jobId>` | title, role (ตำแหน่งที่ทำอยู่), stage (ข้อความไทย), status `active|done`, progress 0–1, updated (ISO), timeline[{stage, role, eta, done}], tokens{budget, used} |
| `library` | `<libraryId>` | เหมือน `library/index.json` + `captions` (ตาม `engine/content/captions.py`) |
| `reports` | `<jobId>` | jobId, title, date (YYYY-MM-DD), text |
| `lessons` | `<Lxx>` | text, role, date |

หน้าเว็บแสดง: งานที่ `updated` ล่าสุด 1 งาน · คลัง 200 รายการ · รายงาน 20 · บทเรียน 10
