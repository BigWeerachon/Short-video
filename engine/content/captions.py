"""แคปชั่น 4 แพลตฟอร์ม + โพสต์ทั่วไปเพจ Facebook: schema และตัวตรวจ

captions.json = {
  youtube:   {title, description, tags[]},
  facebook:  {text, hashtags[]},
  tiktok:    {text, hashtags[]},
  instagram: {text, hashtags[]},
  cta, best_time
}
post.json = {kind: promo|news|event, text, hashtags[], image_brief}
"""
import json, sys

LIMITS = {"youtube_title": 100, "youtube_desc": 5000, "tiktok": 2200, "instagram": 2200,
          "instagram_hashtags": 30, "facebook": 63206}
PLATFORMS = ("youtube", "facebook", "tiktok", "instagram")
POST_KINDS = ("promo", "news", "event")
LINK = "paakin.com"


def _full(p: dict) -> str:
    return (p.get("text", "") + " " + " ".join(p.get("hashtags", []))).strip()


def validate(c: dict) -> list:
    errs = [f"ขาดแพลตฟอร์ม {p}" for p in PLATFORMS if p not in c]
    if errs:
        return errs
    yt = c["youtube"]
    if len(yt.get("title", "")) > LIMITS["youtube_title"]:
        errs.append(f"YouTube title ยาวเกิน {LIMITS['youtube_title']} ตัวอักษร")
    if "#Shorts" not in yt.get("title", ""):
        errs.append("YouTube title ต้องมี #Shorts")
    if len(yt.get("description", "")) > LIMITS["youtube_desc"]:
        errs.append("YouTube description ยาวเกิน")
    if LINK not in yt.get("description", ""):
        errs.append("YouTube description ต้องมี paakin.com")
    for p in ("facebook", "tiktok", "instagram"):
        full = _full(c[p])
        if len(full) > LIMITS[p]:
            errs.append(f"{p} ยาวเกิน {LIMITS[p]} ตัวอักษร (รวมแฮชแท็ก)")
        if LINK not in c[p].get("text", ""):
            errs.append(f"{p} ต้องมี paakin.com")
    if len(c["instagram"].get("hashtags", [])) > LIMITS["instagram_hashtags"]:
        errs.append("instagram แฮชแท็กเกิน 30")
    return errs


def validate_post(p: dict) -> list:
    errs = []
    if p.get("kind") not in POST_KINDS:
        errs.append(f"kind ต้องเป็น {'/'.join(POST_KINDS)}")
    if LINK not in p.get("text", ""):
        errs.append("โพสต์ต้องมี paakin.com")
    if len(_full(p)) > LIMITS["facebook"]:
        errs.append("โพสต์ยาวเกิน")
    return errs


def main(argv):
    if len(argv) != 3 or argv[1] not in ("validate", "validate-post"):
        print("ใช้: python -m engine.content.captions validate|validate-post <file.json>")
        return 2
    data = json.loads(open(argv[2], encoding="utf-8").read())
    errs = validate(data) if argv[1] == "validate" else validate_post(data)
    for e in errs:
        print("✗", e)
    print("✓ ผ่าน" if not errs else f"พบ {len(errs)} ข้อ")
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
