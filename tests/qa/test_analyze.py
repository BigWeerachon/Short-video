from engine.qa.analyze import analyze


def fr(t, shot, chars, voice=0):
    return {"t": round(t, 2), "shot": shot, "shotStart": 0.0, "endCard": False, "voice": voice, "chars": chars}


def ch(cast, x, y=1500, talk=False, h=380):
    return {"cast": cast, "x": x, "y": y, "h": h, "talk": talk, "expr": "happy", "mode": "stand", "flip": False}


def probe(frames):
    return {"fps": 10, "voDur": 99, "frames": frames}


def test_identity_swap_mid_shot():
    f = [fr(i / 10, 1, [ch("rider", 400)]) for i in range(5)] + [fr(0.5 + i / 10, 1, [ch("narrator", 405)]) for i in range(5)]
    out = analyze(probe(f))
    assert any(x["kind"] == "identity" and x["severity"] == "สูง" and abs(x["start"] - 0.4) < 0.01 for x in out)


def test_teleport_spike_but_not_smooth_pan():
    xs = [100 + i * 20 for i in range(10)]
    xs[6] += 500  # spike
    out = analyze(probe([fr(i / 10, 1, [ch("ghost", x)]) for i, x in enumerate(xs)]))
    tel = [x for x in out if x["kind"] == "teleport"]
    assert tel and all(x["owner"] == "animator" for x in tel)
    smooth = analyze(probe([fr(i / 10, 1, [ch("ghost", 100 + i * 60)]) for i in range(10)]))
    assert not [x for x in smooth if x["kind"] == "teleport"]


def test_lipsync_mouth_without_voice():
    f = [fr(i / 10, 2, [ch("narrator", 540, talk=True)], voice=0) for i in range(10)]
    out = analyze(probe(f))
    assert any(x["kind"] == "lipsync" and x["severity"] == "สูง" for x in out)


def test_clean_clip_has_no_findings():
    f = [fr(i / 10, 1, [ch("narrator", 540, talk=True)], voice=6) for i in range(20)]
    assert analyze(probe(f)) == []


def test_sfx_on_end_card_routed_to_sound():
    out = analyze({"fps": 10, "voDur": 5, "frames": [fr(0, 1, [])]}, {"sfx": [{"name": "chime", "t": 6}]})
    assert any(x["kind"] == "sfx" and x["owner"] == "sound" for x in out)
