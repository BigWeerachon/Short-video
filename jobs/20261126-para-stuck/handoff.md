# handoff → critic (แก้แขน)
- rig.js: เพิ่มท่า 'throat' (มือแตะลำคอใต้คาง ศอกกางออกข้างลำตัว, ใช้ elbow คงที่) และ 'drink' (bend out)
- rig.js: prop type 'glass' {hand:'l'|'r', fill, tilt 0..1} วาดยึดตำแหน่งมือ IK ทุกเฟรม ปากแก้วเอียงเข้าปาก; export ARM, glassPose
- shots.js: ช็อต 1 r='throat', l='drink'+glass; ช็อต 2 (นั่ง) r='throat'→'drink'+glass; เลิกใช้ bigGlass ลอย (ใน overlay ยังเป็น throatCross เดิม)
- เทสต์ใหม่ใน tests/web/engine.test.mjs ผ่าน 13/13
- ตรวจ: jobs/20261126-para-stuck/qa/arms_fix.jpg (0–7.5s fps2)
- ระวัง: ท่า throat มือแตะข้างลำคอ (x30) เพื่อให้แขนยาวสมส่วน
