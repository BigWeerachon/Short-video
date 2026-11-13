---
name: captions
description: แคปชั่น — คิดคอนเทนต์และแคปชั่นตอนโพสต์ให้ YouTube Shorts, Facebook, TikTok, Instagram ในคลิกเดียว แก้หรือ gen ใหม่ทั้งหมด/เฉพาะแพลตฟอร์มได้ ใช้เมื่อผู้ใช้สั่ง "แคปชั่น" "gen ใหม่" หรือ /captions
---

# /captions — แคปชั่น 4 แพลตฟอร์ม

ส่งงานให้ **marketer** พร้อมข้อมูลขั้นต่ำ (ประหยัด token): `jobs/<id>/brief.md` + `script.txt` — ไม่ต้องส่ง shots/เสียง

- ครั้งแรก: เขียน `jobs/<id>/captions.json` ครบ 4 แพลตฟอร์ม + cta + best_time
- "gen ใหม่" ไม่ระบุแพลตฟอร์ม → เขียนใหม่ทั้งหมด (คนละมุมกับของเดิม)
- "gen ใหม่ tiktok" / "แก้ ig ให้สั้นลง" → แก้เฉพาะแพลตฟอร์มนั้น ห้ามแตะที่เหลือ
- ตรวจ: `python -m engine.content.captions validate jobs/<id>/captions.json` ต้อง ✓
- แสดงผลให้ผู้ใช้เป็นบล็อกแยกแพลตฟอร์ม (คัดลอกง่าย) และ update `library/<id>.captions` ในออฟฟิศ (ปุ่มคัดลอกบนมือถือ)
