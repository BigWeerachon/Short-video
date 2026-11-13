import math
from engine.audio.align import split_phrases, speech_chunks, align
from engine.audio.envelope import envelope


def test_split_spaces():
    assert len(split_phrases("ก ข, ค")) >= 2


def test_split_no_space():
    text = "กาลครั้งหนึ่งนานมาแล้ว" * 6  # 132 chars, no spaces
    ps = split_phrases(text)
    assert len(ps) >= 3
    assert all(len(p) <= 40 for p in ps)
    assert "".join(ps) == text


def test_chunks(make_audio):
    ch = speech_chunks(make_audio([(0.5, 1.5), (2.0, 3.0), (3.6, 4.2)]))
    assert len(ch) == 3
    for (s, e), (es, ee) in zip(ch, [(0.5, 1.5), (2.0, 3.0), (3.6, 4.2)]):
        assert abs(s - es) < 0.05 and abs(e - ee) < 0.05


def test_align_monotonic(make_audio):
    phrases = ["หนึ่งสองสาม", "สี่ห้าหกเจ็ด", "แปดเก้า"]
    ch = speech_chunks(make_audio([(0.2, 1.4), (1.8, 3.4), (3.8, 4.6)]))
    out = align(phrases, ch)
    assert [o["w"] for o in out] == phrases
    for a, b in zip(out, out[1:]):
        assert a["s"] < a["e"] <= b["s"] < b["e"]


def test_align_long_pause(make_audio):
    phrases = ["ประโยคแรกยาวพอสมควร", "ประโยคที่สองยาวพอกัน", "หลังหยุดยาวสามวินาที", "ประโยคสุดท้าย"]
    spec = [(0.2, 1.6), (1.9, 3.3), (6.4, 7.8), (8.1, 9.0)]
    out = align(phrases, speech_chunks(make_audio(spec)))
    for o in out:
        assert o["e"] - o["s"] >= 0.025 * len(o["w"]), o
    assert out[2]["s"] > 6.0


def test_envelope_range(make_audio):
    p = make_audio([(0.2, 1.0)])
    env = envelope(p)
    assert len(env) == math.ceil(1.5 * 30)
    assert all(0 <= v <= 9 for v in env) and max(env) >= 7
