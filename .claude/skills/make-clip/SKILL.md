---
name: make-clip
description: สร้างคลิป — ผลิตคลิปเล่าเรื่อง 2D แนวตั้งโฆษณา PAAKIN จากบท (.txt) และเสียงพากย์ ElevenLabs (.mp3) ที่ผู้ใช้แนบ ใช้เมื่อผู้ใช้สั่ง "สร้างคลิป" หรือ /make-clip
---

# /make-clip — สร้างคลิป

ต้องมี: บท `.txt` + เสียงพากย์ `.mp3` จาก ElevenLabs (ผู้ใช้แนบ) — ถ้าไม่มีเสียง ให้ขอ ห้ามสังเคราะห์เอง (L16)
ทุกขั้นส่งงานให้ agent ตามชื่อด้วย Agent tool (`subagent_type` = ชื่อ) — เซสชันหลักไม่ทำงานแทน
ส่งต่อกันด้วย `jobs/<id>/handoff.md` เท่านั้น · จบแต่ละขั้นอัปเดตออฟฟิศตาม `engine/office/status.md`

1. **director** — สร้าง `jobs/<YYYYMMDD-slug>/` คัดลอกไฟล์แนบเป็น `script.txt`, `vo.mp3`; ถามผู้ใช้ข้อเดียวถ้า brief ไม่ระบุ: เร่งเสียง 1.1x ไหม
   เขียน `brief.md` + timeline + งบ token; set `jobs/<id>` ในออฟฟิศ
2. **sound** — `python -m engine.audio.align jobs/<id>/script.txt jobs/<id>/vo.mp3 jobs/<id>` แล้วตรวจคำเตือนวลีสั้น
3. **GATE (ผู้ใช้)** — director ส่งตารางเวลาสำคัญ (ทุก ~5 วลี + ทุกชื่อตัวละคร/คำแอ็กชัน) ให้ผู้ใช้ยืนยันก่อนทำภาพ
   ผู้ใช้แก้ → sound ปรับ `--sil-penalty`/`mutes` แล้ววนข้อ 2
4. **sound** — เขียน `audio_plan.json` (ดนตรีตามอารมณ์ + SFX tonal ตรงคำ) → `python -m engine.audio.mix jobs/<id>/audio_plan.json`
5. **film-director** — `shotlist.md` ผูกทุกแอ็กชันกับ `T(i)`/`TW(i,'คำ')`
6. **animator** — `shots.js` (ดู `jobs/_demo/shots.js` เป็นแบบ) → `node engine/render/contact.mjs <id> --every 4` ดูเอง 1 รอบ
7. **critic** — `node engine/render/contact.mjs <id> --every 3` → `review.md` ผ่าน/ไม่ผ่าน
   ไม่ผ่าน → animator แก้เฉพาะช็อตที่ระบุ (สูงสุด 2 รอบ) → ยังไม่ผ่าน director ตัดสิน/ถามผู้ใช้
8. **editor** — `node engine/render/export.mjs <id>` (รันเบื้องหลัง) → ตรวจ ffprobe → ส่ง `out.mp4` ให้ผู้ใช้ (SendUserFile)
9. **marketer** — `captions.json` 4 แพลตฟอร์ม → `python -m engine.content.captions validate jobs/<id>/captions.json`
10. **librarian** — อัปโหลด out.mp4 เข้าออฟฟิศ (asset) แล้วตั้ง library.video_url ตาม engine/office/status.md · `python -m engine.content.library add jobs/<id>/library.json` — ไฟล์ = `{"entry": {"title","type","series","characters","mood","paakin_feature","status"}, "mp4": "jobs/<id>/out.mp4", "captions": "jobs/<id>/captions.json"}` (mp4 >15MB ระบบใส่ mp4_ref ให้เอง หรือระบุ `"mp4_ref"` เอง) (สถานะ `ready`) + batch ออฟฟิศ (job done + library + report)
11. **director → report** — `report.md` ส่งผู้ใช้: ไฟล์, timeline จริง, token เทียบงบ, บทเรียนใหม่, สิ่งที่ผู้ใช้ต้องทำ (กดโพสต์ 4 แพลตฟอร์ม แล้วบอก `/report posted <id> <platform>`)
- commit + push งาน (ไม่รวม mp4) ทุกครั้งที่จบงาน
