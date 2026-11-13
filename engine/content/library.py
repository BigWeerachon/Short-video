"""คลังงานแยกหมวด: library/<YYYY-MM>/<id>-<slug>/meta.json + library/index.json

หมวด: type, series, characters, mood, paakin_feature, status (+ วันที่โพสต์แต่ละแพลตฟอร์ม)
MP4 ไม่ commit เข้า git (.gitignore) — ไฟล์ ≤15MB เก็บ path ไว้ให้อัปโหลดเข้าออฟฟิศ, ใหญ่กว่านั้นต้องมี mp4_ref
"""
import datetime as dt, json, pathlib, re, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
TYPES = ("story_clip", "promo", "news", "event")
STATUSES = ("draft", "review", "ready", "posted")
PLATFORMS = ("youtube", "facebook", "tiktok", "instagram")
MAX_ASSET = 15 * 1024 * 1024


def _index_path():
    return ROOT / "library" / "index.json"


def _load():
    p = _index_path()
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else []


def _save(items):
    _index_path().parent.mkdir(parents=True, exist_ok=True)
    _index_path().write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8")


def _slug(s):
    return re.sub(r"[^\w฀-๿]+", "-", s).strip("-")[:40] or "item"


def add(entry: dict, mp4=None, mp4_ref=None, captions=None) -> str:
    if entry.get("type") not in TYPES:
        raise ValueError(f"type ต้องเป็น {TYPES}")
    status = entry.get("status", "draft")
    if status not in STATUSES:
        raise ValueError(f"status ต้องเป็น {STATUSES}")
    if mp4 and pathlib.Path(mp4).stat().st_size > MAX_ASSET and not mp4_ref:
        mp4_ref = "ไฟล์ใหญ่เกิน 15MB — ส่งให้ผู้ใช้ในแชทแล้ว ไม่ได้เก็บในคลัง"
    now = dt.datetime.now()
    items = _load()
    n = sum(1 for e in items if e["id"].startswith(now.strftime("%Y%m%d"))) + 1
    eid = f"{now:%Y%m%d}-{n:02d}"
    folder = ROOT / "library" / f"{now:%Y-%m}" / f"{eid}-{_slug(entry['title'])}"
    folder.mkdir(parents=True, exist_ok=True)
    files = {"mp4": None, "mp4_ref": mp4_ref, "captions": None, "folder": str(folder.relative_to(ROOT))}
    if mp4:
        mp4 = pathlib.Path(mp4)
        if mp4.stat().st_size <= MAX_ASSET:
            dst = folder / "clip.mp4"; shutil.copy(mp4, dst)
            files["mp4"] = str(dst.relative_to(ROOT))
    if captions:
        dst = folder / "captions.json"; shutil.copy(captions, dst)
        files["captions"] = str(dst.relative_to(ROOT))
    e = {"id": eid, "title": entry["title"], "type": entry["type"], "series": entry.get("series"),
         "characters": entry.get("characters", []), "mood": entry.get("mood"), "paakin_feature": entry.get("paakin_feature"),
         "status": status, "posted": {p: None for p in PLATFORMS}, "files": files, "created": now.isoformat(timespec="seconds")}
    (folder / "meta.json").write_text(json.dumps(e, ensure_ascii=False, indent=1), encoding="utf-8")
    _save(items + [e])
    return eid


def query(character=None, **filters) -> list:
    out = []
    for e in _load():
        if character and character not in e.get("characters", []):
            continue
        if all(e.get(k) == v for k, v in filters.items()):
            out.append(e)
    return out


def set_status(eid, status, platform=None):
    if status not in STATUSES:
        raise ValueError(f"status ต้องเป็น {STATUSES}")
    items = _load()
    for e in items:
        if e["id"] == eid:
            e["status"] = status
            if platform:
                if platform not in PLATFORMS:
                    raise ValueError(f"platform ต้องเป็น {PLATFORMS}")
                e["posted"][platform] = dt.date.today().isoformat()
            meta = ROOT / e["files"]["folder"] / "meta.json"
            if meta.parent.exists():
                meta.write_text(json.dumps(e, ensure_ascii=False, indent=1), encoding="utf-8")
            _save(items)
            return e
    raise KeyError(eid)


def main(argv):
    cmd = argv[1] if len(argv) > 1 else ""
    if cmd == "add":
        spec = json.loads(open(argv[2], encoding="utf-8").read())
        entry = spec.get("entry", spec)  # รับทั้ง {"entry":{...},"mp4":...} และ entry แบบแบน
        print(add(entry, spec.get("mp4"), spec.get("mp4_ref"), spec.get("captions")))
    elif cmd == "status":
        plat = argv[argv.index("--platform") + 1] if "--platform" in argv else None
        print(json.dumps(set_status(argv[2], argv[3], plat), ensure_ascii=False))
    elif cmd == "list":
        for e in query(**dict(a.split("=", 1) for a in argv[2:])):
            print(f"{e['id']}  [{e['type']}/{e['status']}]  {e['title']}")
    else:
        print("ใช้: python -m engine.content.library add <spec.json> | status <id> <status> [--platform p] | list [key=value]")
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
