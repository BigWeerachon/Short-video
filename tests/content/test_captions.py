import copy, json, subprocess, sys, pathlib
from engine.content.captions import validate, validate_post, LIMITS

GOOD = {
    "youtube": {"title": "ผีภูกระดึง แก๊งซ่าหนีตาย #Shorts", "description": "จองตรงที่ www.paakin.com", "tags": ["ผี", "paakin"]},
    "facebook": {"text": "คืนนั้นเราเจออะไร? จองที่พักง่ายๆ ที่ www.paakin.com", "hashtags": ["#PAAKIN"]},
    "tiktok": {"text": "ใครเคยกางเต็นท์แล้วเจอแบบนี้บ้าง 😱 paakin.com", "hashtags": ["#เรื่องผี", "#paakin"]},
    "instagram": {"text": "เรื่องเล่าขยาดขวัญ 👻 paakin.com", "hashtags": ["#paakin"]},
    "cta": "จองตรงที่ www.paakin.com",
    "best_time": "19:00–21:00",
}


def bad(**patch):
    c = copy.deepcopy(GOOD)
    for path, v in patch.items():
        plat, key = path.split("__")
        c[plat][key] = v
    return validate(c)


def test_good_passes():
    assert validate(GOOD) == []


def test_youtube_title_limit_and_shorts():
    assert bad(youtube__title="ก" * 95 + " #Shorts")
    assert bad(youtube__title="ไม่มีแท็ก paakin")


def test_platform_text_limits():
    assert bad(tiktok__text="ก" * (LIMITS["tiktok"] + 1) + "paakin.com")
    assert bad(instagram__text="ก" * (LIMITS["instagram"] + 1) + "paakin.com")


def test_missing_link():
    assert bad(facebook__text="ไม่มีลิงก์")
    assert bad(tiktok__text="ไม่มีลิงก์")


def test_ig_hashtag_limit():
    assert bad(instagram__hashtags=[f"#h{i}" for i in range(31)])


def test_missing_platform():
    c = copy.deepcopy(GOOD); del c["tiktok"]
    assert validate(c)


def test_post():
    ok = {"kind": "promo", "text": "โปรพิเศษ จองตรงที่ www.paakin.com", "hashtags": ["#PAAKIN"], "image_brief": "การ์ดโปร"}
    assert validate_post(ok) == []
    assert validate_post({**ok, "kind": "ad"})
    assert validate_post({**ok, "text": "ไม่มีลิงก์"})


def test_cli(tmp_path):
    f = tmp_path / "c.json"; f.write_text(json.dumps(GOOD, ensure_ascii=False), encoding="utf-8")
    r = subprocess.run([sys.executable, "-m", "engine.content.captions", "validate", str(f)], capture_output=True, text=True)
    assert r.returncode == 0, r.stdout + r.stderr
