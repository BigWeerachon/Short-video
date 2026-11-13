---
name: report
description: รายงาน — สรุปสถานะงาน/สัปดาห์จากผู้อำนวยการ และบันทึกการโพสต์ (/report posted <id> <platform>) ใช้เมื่อผู้ใช้สั่ง "รายงาน" "สรุป" หรือ /report
---

# /report — รายงานผู้อำนวยการ

- `/report` เฉยๆ → **director** อ่าน `jobs/*/report.md` 7 วันล่าสุด + `python -m engine.content.library list` สรุปสั้น:
  งานเสร็จ / ค้าง / รอโพสต์ (แยกแพลตฟอร์ม) · token รวมเทียบงบ · บทเรียนใหม่ · แผนถัดไป
  แล้ว set `reports/week-<YYYY-Www>` ในออฟฟิศ
- `/report posted <id> <platform>` → **librarian** `python -m engine.content.library status <id> posted --platform <platform>`
  + update `library/<id>` ในออฟฟิศ (ทำได้หลายแพลตฟอร์มในครั้งเดียว)
