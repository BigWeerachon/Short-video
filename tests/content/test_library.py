import json, subprocess, pytest
from engine.content import library as lib


@pytest.fixture
def root(tmp_path, monkeypatch):
    (tmp_path / "library").mkdir()
    (tmp_path / "library" / "index.json").write_text("[]")
    subprocess.run(["git", "init", "-q", str(tmp_path)], check=True)
    monkeypatch.setattr(lib, "ROOT", tmp_path)
    return tmp_path


def entry(**kw):
    e = {"title": "ศึกผีภูกระดึง", "type": "story_clip", "series": "แก๊งซ่า", "characters": ["bem", "meen"],
         "mood": "spooky", "paakin_feature": "booking", "status": "draft"}
    e.update(kw)
    return e


def test_add_and_query(root):
    a = lib.add(entry())
    lib.add(entry(title="โปรปีใหม่", type="promo", series=None, status="ready"))
    assert lib.query(type="story_clip")[0]["id"] == a
    assert [e["title"] for e in lib.query(status="ready")] == ["โปรปีใหม่"]
    assert lib.query(series="แก๊งซ่า", character="bem")[0]["id"] == a
    assert any(root.glob(f"library/*/{a}-*/meta.json"))


def test_set_status_platform_date(root):
    a = lib.add(entry())
    lib.set_status(a, "posted", platform="tiktok")
    e = lib.query(id=a)[0]
    assert e["status"] == "posted" and e["posted"]["tiktok"] and e["posted"]["youtube"] is None


def test_invalid_type(root):
    with pytest.raises(ValueError):
        lib.add(entry(type="meme"))


def test_large_mp4_not_committed(root, tmp_path):
    big = tmp_path / "big.mp4"
    with open(big, "wb") as f:
        f.truncate(16 * 1024 * 1024)
    a = lib.add(entry(), mp4=big, mp4_ref="ส่งในแชท session X")
    e = lib.query(id=a)[0]
    assert e["files"]["mp4_ref"] == "ส่งในแชท session X" and e["files"]["mp4"] is None
    small = tmp_path / "s.mp4"; small.write_bytes(b"x" * 1000)
    b = lib.add(entry(title="สั้น"), mp4=small)
    assert lib.query(id=b)[0]["files"]["mp4"].endswith(".mp4")


def test_large_mp4_without_ref_does_not_fail(root, tmp_path):
    big = tmp_path / "big.mp4"
    with open(big, "wb") as f:
        f.truncate(16 * 1024 * 1024)
    a = lib.add(entry(), mp4=big)
    e = lib.query(id=a)[0]
    assert e["files"]["mp4"] is None and e["files"]["mp4_ref"]


def test_cli_accepts_flat_entry(root, tmp_path):
    import sys
    f = tmp_path / "e.json"; f.write_text(json.dumps(entry(), ensure_ascii=False), encoding="utf-8")
    assert lib.main(["x", "add", str(f)]) == 0
    assert lib.query(type="story_clip")
