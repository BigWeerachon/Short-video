---
name: post
description: โพสต์ทั่วไป — สร้างโพสต์เพจ Facebook ที่ไม่ใช่วิดีโอ เช่น โปรโมท ข่าวสาร กิจกรรม พร้อมคำบรรยายภาพประกอบ ใช้เมื่อผู้ใช้สั่ง "โพสต์" "โพสต์โปรโมท" "ข่าวสาร" "กิจกรรม" หรือ /post
---

# /post — โพสต์ทั่วไปเพจ Facebook

1. **marketer** ถามเฉพาะสิ่งที่ขาด (ประเภท promo/news/event, ข้อเท็จจริง: ราคา วันที่ เงื่อนไข) — ห้ามแต่งตัวเลข/โปรเอง
2. เขียน `posts/<YYYYMMDD-slug>/post.json` = {kind, text, hashtags[], image_brief}
   - text: hook บรรทัดแรก, เนื้อหาสั้น อ่านง่ายบนมือถือ, CTA + www.paakin.com
   - image_brief: ภาพที่ควรใช้ (ขนาด 1080×1350), ข้อความบนภาพ ≤ 8 คำ
3. ตรวจ `python -m engine.content.captions validate-post posts/<...>/post.json`
4. **librarian** `python -m engine.content.library add posts/<...>/library.json` = `{"entry": {"title","type": promo|news|event,"status": "ready"}}` + set `library/<id>` ในออฟฟิศ
5. ส่งผู้ใช้: ข้อความพร้อมคัดลอก + image_brief · ถามว่าจะให้ gen ใหม่/ปรับโทนไหม
