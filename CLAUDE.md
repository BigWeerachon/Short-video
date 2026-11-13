# PAAKIN Studio — กฎของสตูดิโอ

สตูดิโอผลิตคลิปเล่าเรื่อง 2D แนวตั้ง soft-sell PAAKIN (www.paakin.com) + แคปชั่น 4 แพลตฟอร์ม + โพสต์ทั่วไปเพจ Facebook
ตอบผู้ใช้เป็น **ภาษาไทย** เสมอ

## นโยบายโมเดล (ห้ามฝ่า)
- เพดานสูงสุด **Opus effort low** — ห้ามใช้ Fable และห้าม effort สูงกว่า low ในงานผลิตใดๆ (เซสชันหลักด้วย)
- Fable ใช้เฉพาะตอนพัฒนาโครงสร้างโปรเจกต์นี้เท่านั้น
- ส่งงานให้ตำแหน่งตาม `.claude/agents/` (ตรวจด้วย `python scripts/check_policy.py`)
- ส่งต่องานด้วยไฟล์สั้น (`jobs/<id>/handoff.md` ≤15 บรรทัด) ไม่ส่งประวัติแชท

## กฎถาวรทุกคลิป
1. ฉากปิด `assets/brand/end_card.png` + เสียงปิด ต่อท้าย VO (~7 วิ) รวมเป็นไฟล์เสียงเดียว
2. ไม่มีลายน้ำโลโก้
3. ห้าม SFX แนว noise — tonal เท่านั้น
4. ดนตรีสดใสน่ารัก เปลี่ยนตามอารมณ์ฉาก ducking ตอนพูด
5. เร่ง VO 1.1x เฉพาะเมื่อผู้ใช้สั่ง — ถ้าไม่ระบุให้ถาม
6. ภาพ 2D flat vector สีสด ไม่มีเส้นขอบ (ไม่ใช่ pixel art — pixel ใช้เฉพาะออฟฟิศ)
7. โลโก้ในฉากวางบนการ์ดขาวมุมมน กึ่งกลาง
8. ห้ามเติมข้อความที่ไม่ได้สั่ง
- **เสียงพากย์: ผู้ใช้แนบ mp3 จาก ElevenLabs มาทุกคลิป** ห้ามสังเคราะห์ VO เอง

## ความรู้
- คู่มือเต็ม: `knowledge/manual.md`
- บทเรียน: `knowledge/lessons.md` — **ก่อนเริ่มงานทุกตำแหน่งอ่านแถวที่มีแท็กตัวเอง**; ผู้ใช้ตำหนิ/สั่งแก้เมื่อไร → `/remember` บันทึกทันที

## โครงงาน
- งานคลิป: `jobs/<YYYYMMDD-slug>/` (script.txt, vo.mp3, words.json, env.json, timing.js, audio_plan.json, mix.mp3, shots.js, contact.jpg, out.mp4, captions.json, handoff.md, report.md)
- Engine กลาง: `engine/audio` (Python), `engine/web` (canvas player), `engine/render` (export)
- คลังงาน: `library/` ผ่าน `engine/content/library.py`
- คำสั่ง: `/make-clip` `/fix-clip` `/captions` `/post` `/plan-week` `/report` `/remember`
- ออฟฟิศพิกเซล: ดู `office/README.md` (URL + วิธีอัปเดตสถานะ)

## คำสั่งตรวจ
```bash
python -m pytest -q && node --test tests/web/*.test.mjs && python scripts/check_policy.py
```
