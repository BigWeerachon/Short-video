# handoff (sound, fix-clip)
- เพิ่มสไตล์ `ukulele` ใน engine/audio/music.py (Karplus-Strong GCEA, I-V-vi-IV, เบส + บล็อกไม้/ทิก tonal ไม่มี noise); พารามิเตอร์ต่อ segment: level, bpm, shift, gain
- audio_plan.json: ukulele ทั้งคลิป level 0.4/0.3/0.95/0.2/0.9 ตามฉาก; คง mutes, sfx, ducking, เสียงปิด
- mix.mp3 ยาว 78.28 วิ เท่าเดิม; pytest 66 ผ่าน
- ถัดไป: ให้ผู้ใช้ฟังอนุมัติ แล้ว render out.mp4 ใหม่ (เสียงเปลี่ยน)
