# วิธีอัปเดตออฟฟิศ (ใช้ token น้อยที่สุด)

ออฟฟิศ: https://claude.ai/artifact/RtbKxpcQYLqzEgKCsFgWuy — โครงข้อมูลดู `office/README.md`

กฎ
- อัปเดต **เฉพาะตอนจบแต่ละขั้น** (≈8–10 ครั้ง/คลิป) ห้ามอัปเดตระหว่างทำ
- ใช้ `ArtifactData` action `update` บน `jobs/<jobId>` ส่งเฉพาะฟิลด์ที่เปลี่ยน + `if_version` ที่ได้จากครั้งก่อน
  (ถ้าไม่รู้ version: `get` ก่อน 1 ครั้ง)
- เริ่มงาน (director): `set` `jobs/<jobId>` ครบทุกฟิลด์ status `active`
- จบขั้น: `update` → `role` = ตำแหน่งถัดไป, `note` (ข้อความส่งงานสั้น ≤ 30 ตัวอักษร จาก handoff.md เช่น "shot list 37 ช็อต ระวังฉากกระจก" — ตัวละครจะพูดประโยคนี้ตอนประชุมส่งงาน), `stage`, `progress`, `updated` (ISO ปัจจุบัน), `timeline` (mark done), `tokens.used`
- จบงาน (librarian): `batch` ครั้งเดียว = update job (`status: done`) + set `library/<id>` (พร้อม captions) + set `reports/<jobId>`
- บทเรียนใหม่ (librarian): set `lessons/<Lxx>` คู่กับการเพิ่มแถวใน `knowledge/lessons.md`
- เมื่อโพสต์แล้ว: update `library/<id>` → `status`, `posted.<platform>`
- วิดีโอ (≤15MB): อัปโหลดเข้าออฟฟิศด้วย Artifact tool `asset: true` (url = ออฟฟิศ, file_path = jobs/<id>/out.mp4) แล้ว update `library/<id>.video_url` = "/_blob/<id>" ที่ได้ — หน้าคลังงานจะมีปุ่ม "ดาวน์โหลดวิดีโอ"
- ปุ่ม "โพสต์ที่ …" ในคลังงาน = คัดลอกแคปชั่น + เปิดหน้าอัปโหลด; ผู้ใช้กด "โพสต์แล้ว?" เองในหน้า → library.posted/status อัปเดตอัตโนมัติ (ไม่ต้องสั่ง /report posted)
