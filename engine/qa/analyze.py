"""ตรวจจับความผิดปกติอัตโนมัติจาก qa/probe.json (+ audio_plan.json) → qa/auto_findings.json / .md

ตรวจ: ตัวละครสลับตัว/หาย/โผล่กลางช็อต · กระโดดตำแหน่ง · ตัวละครซ้ำในเฟรม · หลุดขอบ/ทับโซนซับ
      · ปากขยับแต่ไม่มีเสียง · มีเสียงพูดแต่ไม่มีใครขยับปาก · SFX ตกช่วงตัดช็อต/ฉากปิด
ใช้: python -m engine.qa.analyze <jobId>
"""
import json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
W, H, SUB_Y = 1080, 1920, 1700
OWNER = {"identity": "animator", "teleport": "animator", "duplicate": "animator", "crop": "animator",
         "lipsync": "animator", "voice-no-mouth": "film-director", "sfx": "sound"}


def ts(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def runs(frames, pred, min_len):
    """ช่วงต่อเนื่องที่ pred เป็นจริง ยาว ≥ min_len วินาที → [(start, end)]"""
    out, start, last = [], None, None
    for f in frames:
        if pred(f):
            start = f["t"] if start is None else start
            last = f["t"]
        elif start is not None:
            if last - start >= min_len:
                out.append((start, last))
            start = None
    if start is not None and last - start >= min_len:
        out.append((start, last))
    return out


def analyze(probe, plan=None):
    fps = probe["fps"]
    frames = [f for f in probe["frames"] if not f["endCard"] and f["shot"]]
    F = []

    def add(kind, t0, t1, shot, sev, msg):
        F.append({"kind": kind, "start": round(t0, 2), "end": round(t1, 2), "shot": shot, "severity": sev, "owner": OWNER[kind], "msg": msg})

    # 1–3: ภายในช็อตเดียวกัน เทียบเฟรมติดกัน
    for a, b in zip(frames, frames[1:]):
        if a["shot"] != b["shot"]:
            continue
        ca, cb = [c["cast"] for c in a["chars"]], [c["cast"] for c in b["chars"]]
        gone, new = set(ca) - set(cb), set(cb) - set(ca)
        for g in gone:
            ga = next(c for c in a["chars"] if c["cast"] == g)
            swap = next((c for c in b["chars"] if c["cast"] in new and abs(c["x"] - ga["x"]) < 60 and abs(c["y"] - ga["y"]) < 60), None)
            if swap:
                add("identity", a["t"], b["t"], b["shot"], "สูง", f"{g} กลายเป็น {swap['cast']} ที่ตำแหน่งเดิมกลางช็อต (ตัวละครสลับตัว)")
            else:
                add("identity", a["t"], b["t"], b["shot"], "กลาง", f"{g} หายไปกลางช็อต — ตั้งใจหรือไม่?")
        for n in new - {s["cast"] for s in b["chars"] if any(abs(s["x"] - c["x"]) < 60 for c in a["chars"] if c["cast"] in gone)}:
            add("identity", a["t"], b["t"], b["shot"], "ต่ำ", f"{n} โผล่ขึ้นกลางช็อต — เช็กว่าตรงคำพูด")
    # 2: วาร์ป = ระยะกระโดดสูงผิดปกติเทียบกับเฟรมรอบข้าง (การซูม/แพนกล้องที่ลื่นไหลจะไม่ถูกนับ)
    def track(cast, shot):
        return [(f["t"], next(c for c in f["chars"] if c["cast"] == cast)) for f in frames
                if f["shot"] == shot and [c["cast"] for c in f["chars"]].count(cast) == 1]
    for shot in sorted({f["shot"] for f in frames}):
        for cast in sorted({c["cast"] for f in frames if f["shot"] == shot for c in f["chars"]}):
            tr = track(cast, shot)
            d = [((b[1]["x"] - a[1]["x"]) ** 2 + (b[1]["y"] - a[1]["y"]) ** 2) ** 0.5 for a, b in zip(tr, tr[1:])]
            for i, j in enumerate(d):
                around = sorted(d[max(0, i - 3):i] + d[i + 1:i + 4]) or [0]
                med = around[len(around) // 2]
                if j > 0.12 * W * (10 / fps) and j > 4 * max(med, 8):
                    add("teleport", tr[i][0], tr[i + 1][0], shot, "สูง", f"{cast} กระโดดตำแหน่งกะทันหัน (ภาพกระตุก/วาร์ป)")
    # ซ้ำในเฟรม · หลุดขอบ · ทับซับ (รวมเป็นช่วง)
    for kind, pred, sev, msg in [
        ("duplicate", lambda f: len({c["cast"] for c in f["chars"]}) < len(f["chars"]), "กลาง", "ตัวละครเดียวกันโผล่ 2 ตัวในเฟรม"),
        ("crop", lambda f: any((c["x"] < 0 or c["x"] > W or c["y"] - c["h"] < 0) and c["h"] < 900 for c in f["chars"]), "กลาง", "ตัวละครหลุดขอบจอ/หัวขาด"),
        ("crop", lambda f: any(c["y"] - 0.35 * c["h"] > SUB_Y for c in f["chars"]), "ต่ำ", "ตัวละครลงไปอยู่ในโซนซับ (y>1700)"),
    ]:
        for s0, s1 in runs(frames, pred, 0):
            shot = next(f["shot"] for f in frames if f["t"] == s0)
            add(kind, s0, s1, shot, sev, msg)
    # 4: ลิปซิงก์
    for s0, s1 in runs(frames, lambda f: any(c["talk"] for c in f["chars"]) and f["voice"] == 0, 0.6):
        shot = next(f["shot"] for f in frames if f["t"] == s0)
        add("lipsync", s0, s1, shot, "สูง", "ปากขยับแต่ไม่มีเสียงพูด")
    for s0, s1 in runs(frames, lambda f: f["voice"] >= 4 and f["chars"] and not any(c["talk"] for c in f["chars"]), 1.0):
        shot = next(f["shot"] for f in frames if f["t"] == s0)
        narr = any(c["cast"] == "narrator" for f in frames if s0 <= f["t"] <= s1 for c in f["chars"])
        add("voice-no-mouth", s0, s1, shot, "กลาง" if narr else "ต่ำ",
            "มีเสียงพูด แต่ไม่มีตัวละครในภาพขยับปาก" + ("" if narr else " (อาจเป็นเสียงบรรยายนอกจอ — ยืนยันว่าตั้งใจ)"))
    # 5: SFX
    cuts = sorted({f["shotStart"] for f in frames if f["shotStart"] is not None})
    for ev in (plan or {}).get("sfx", []):
        t = ev["t"]
        if t >= probe["voDur"]:
            add("sfx", t, t, 0, "กลาง", f"SFX {ev['name']} ตกในฉากปิด")
        near = min(cuts, key=lambda c: abs(c - t)) if cuts else None
        if near is not None and 0.05 < near - t < 0.25:
            add("sfx", t, t, 0, "ต่ำ", f"SFX {ev['name']} ดังก่อนตัดช็อตใหม่ {round(near - t, 2)} วิ — อาจไม่ตรงภาพ")
    # รวมรายการซ้ำที่ติดกัน
    F.sort(key=lambda x: (x["start"], x["kind"]))
    merged = []
    for f in F:
        m = merged[-1] if merged else None
        if m and m["kind"] == f["kind"] and m["msg"] == f["msg"] and f["start"] - m["end"] <= 0.25:
            m["end"] = f["end"]
        else:
            merged.append(f)
    return merged


def to_md(findings):
    rows = ["| เวลา | ช็อต | หมวด | อาการ | ความรุนแรง | ส่งให้ |", "|---|---|---|---|---|---|"]
    for f in findings:
        span = ts(f["start"]) if f["end"] - f["start"] < 0.2 else f"{ts(f['start'])}–{ts(f['end'])}"
        rows.append(f"| {span} | {f['shot'] or '-'} | {f['kind']} | {f['msg']} | {f['severity']} | {f['owner']} |")
    return "\n".join(rows) if findings else "ไม่พบความผิดปกติจากการตรวจอัตโนมัติ"


def main(job):
    d = ROOT / "jobs" / job
    probe = json.loads((d / "qa" / "probe.json").read_text(encoding="utf-8"))
    plan_p = d / "audio_plan.json"
    plan = json.loads(plan_p.read_text(encoding="utf-8")) if plan_p.exists() else None
    found = analyze(probe, plan)
    (d / "qa" / "auto_findings.json").write_text(json.dumps(found, ensure_ascii=False, indent=1), encoding="utf-8")
    (d / "qa" / "auto_findings.md").write_text(to_md(found) + "\n", encoding="utf-8")
    print(to_md(found))


if __name__ == "__main__":
    main(sys.argv[1])
