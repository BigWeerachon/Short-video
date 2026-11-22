"""ดนตรีประกอบตามอารมณ์ (สดใส น่ารัก) — สังเคราะห์ด้วย numpy"""
import numpy as np
from .synth import note_hz, tone, pluck, put

# mood: bpm, root(midi), chord degrees (major/minor offsets), lead wave, pattern
MOODS = ["cute", "bright", "sunset", "spooky", "science", "tense", "chase", "sad", "warm", "outro", "ukulele"]
MAJ = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]]        # I IV V I
POP = [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]]      # I V vi IV
MIN = [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]]       # i iv III v
DIM = [[0, 3, 6], [1, 4, 7], [0, 3, 6], [-1, 3, 6]]
CFG = {
    "cute":    dict(bpm=110, root=67, prog=MAJ, wave="tri", arp=[0, 1, 2, 1], drone=False),
    "bright":  dict(bpm=124, root=67, prog=POP, wave="tri", arp=[0, 1, 2, 3], drone=False),
    "sunset":  dict(bpm=92, root=64, prog=POP, wave="soft", arp=[0, 2, 1, 2], drone=False),
    "spooky":  dict(bpm=84, root=62, prog=MIN, wave="soft", arp=[0, 2, 1, 2], drone=True),
    "science": dict(bpm=118, root=65, prog=MAJ, wave="pluck", arp=[0, 2, 1, 2, 0, 1, 2, 3], drone=False),
    "tense":   dict(bpm=100, root=60, prog=DIM, wave="soft", arp=[0, 1, 0, 2], drone=True),
    "chase":   dict(bpm=150, root=62, prog=MIN, wave="tri", arp=[0, 1, 2, 1, 0, 2, 1, 2], drone=False),
    "sad":     dict(bpm=72, root=60, prog=MIN, wave="soft", arp=[0, 1, 2, 1], drone=False),
    "warm":    dict(bpm=96, root=65, prog=POP, wave="soft", arp=[0, 1, 2, 1], drone=False),
    "outro":   dict(bpm=104, root=67, prog=POP, wave="tri", arp=[0, 1, 2, 3], drone=False),
}


# ---- ukulele pop (Karplus-Strong สาย GCEA, ไม่มี noise) ----
UKE_STRINGS = [67, 60, 64, 69]  # G4 C4 E4 A4 (re-entrant)
# I V vi IV ในคีย์ C: (เฟร็ตแต่ละสาย G C E A, โน้ตเบส midi)
UKE_PROG = [([0, 0, 0, 3], 36), ([0, 2, 3, 2], 31), ([2, 0, 0, 0], 33), ([2, 0, 1, 0], 29)]
_KS = {}


def karplus(hz, dur, sr, decay=0.996):
    """Karplus-Strong แบบ vectorize เป็นบล็อก — เริ่มจากพัลส์ไม่ใช่ noise (ลำดับ tonal กำหนดแน่นอน)"""
    key = (round(hz, 2), round(dur, 3), sr)
    if key in _KS:
        return _KS[key]
    N = max(int(sr / hz), 2)
    n = max(int(dur * sr), N)
    x = np.arange(N) / N
    blk = np.sin(2 * np.pi * x) + 0.6 * np.sin(4 * np.pi * x + 0.7) + 0.35 * np.sin(6 * np.pi * x + 1.9)  # ฮาร์มอนิกคงที่
    blk -= blk.mean()
    out = [blk]
    while sum(len(b) for b in out) < n:
        prev = out[-1]
        out.append(decay * 0.5 * (prev + np.roll(prev, 1)))
    y = np.concatenate(out)[:n]
    y = y / max(np.abs(y).max(), 1e-9)
    y *= np.minimum(1, np.arange(n) / (0.002 * sr))
    y[-int(0.02 * sr):] *= np.linspace(1, 0, int(0.02 * sr))
    _KS[key] = y
    return y


def _tick(sr, hz=5200, dur=0.03, gain=1.0):
    t = np.arange(int(dur * sr)) / sr
    y = (np.sin(2 * np.pi * hz * t) + 0.5 * np.sin(2 * np.pi * hz * 1.51 * t)) * np.exp(-t * 180)
    return gain * y


def _block(sr, hz=880, dur=0.09):
    t = np.arange(int(dur * sr)) / sr
    f = hz * (1 + 0.25 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-t * 45)


# ตำแหน่ง strum ในห้อง (8 ช่อง 1/8) ตามความหนาแน่น: (ช่อง, ทิศ D/U, น้ำหนัก)
UKE_PATTERNS = [
    (0.0, [(0, "D", 1.0), (4, "D", 0.8)]),
    (0.35, [(0, "D", 1.0), (2, "D", 0.7), (4, "D", 0.9), (6, "U", 0.6)]),
    (0.65, [(0, "D", 1.0), (2, "D", 0.8), (3, "U", 0.6), (5, "U", 0.6), (6, "D", 0.8), (7, "U", 0.55)]),
]


def _render_ukulele(dur, sr, level=0.6, bpm=116, shift=0, gain=1.0):
    n = int(dur * sr)
    buf = np.zeros(n + 2 * sr)
    beat = 60 / bpm
    step = beat / 2
    bar = 4 * beat
    pat = [p for lv, p in UKE_PATTERNS if level >= lv][-1]
    for b in range(int(dur // bar) + 1):
        frets, bass = UKE_PROG[b % 4]
        t0 = b * bar
        for slot, d, w in pat:
            t = t0 + slot * step
            order = range(4) if d == "D" else range(3, -1, -1)
            for j, si in enumerate(order):
                hz = note_hz(UKE_STRINGS[si] + frets[si] + shift)
                put(buf, karplus(hz, 1.4, sr), (t + j * 0.011) * sr, 0.2 * w * gain)
        put(buf, tone(note_hz(bass + shift + 12), beat * 1.6, sr, "sine", a=0.01, d=0.3, s=0.4, r=0.2), t0 * sr, 0.3 * gain)
        if level >= 0.35:
            put(buf, tone(note_hz(bass + shift + 19), beat * 1.2, sr, "sine", a=0.01, d=0.25, s=0.3, r=0.2), (t0 + 2 * beat) * sr, 0.18 * gain)
        if level >= 0.35:
            for k in (2, 6):  # บล็อกไม้ tonal จังหวะ 2 และ 4
                put(buf, _block(sr), (t0 + k * step) * sr, 0.16 * gain)
        if level >= 0.65:
            for k in range(1, 8, 2):  # ทิก shaker แบบ tonal ที่ออฟบีต
                put(buf, _tick(sr), (t0 + k * step) * sr, 0.07 * gain)
    return buf[:n]


def _render(mood, dur, sr, **opt):
    if mood == "ukulele":
        return _render_ukulele(dur, sr, **opt)
    c = CFG[mood]
    n = int(dur * sr)
    buf = np.zeros(n + sr)
    beat = 60 / c["bpm"]
    step = beat / 2
    bar = 4 * beat
    t, k = 0.0, 0
    while t < dur:
        chord = c["prog"][int(t // bar) % len(c["prog"])]
        notes = chord + [chord[0] + 12]
        deg = notes[c["arp"][k % len(c["arp"])] % len(notes)]
        hz = note_hz(c["root"] + deg)
        y = pluck(hz, step * 1.8, sr) if c["wave"] in ("tri", "pluck") else tone(hz, step * 1.6, sr, "soft", a=0.02, d=0.2, s=0.4, r=0.2)
        put(buf, y, t * sr, 0.22)
        if k % 4 == 0:  # bass
            put(buf, tone(note_hz(c["root"] - 24 + chord[0]), beat * 1.8, sr, "sine", a=0.01, d=0.3, s=0.5, r=0.2), t * sr, 0.3)
        t += step; k += 1
    if c["drone"]:
        tt = np.arange(len(buf)) / sr
        buf += 0.08 * np.sin(2 * np.pi * note_hz(c["root"] - 12) * tt) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * tt))
    return buf[:n]


def music(segments, sr=44100, xfade=0.3) -> np.ndarray:
    total = max(s["end"] for s in segments)
    out = np.zeros(int(total * sr))
    for s in segments:
        a, b = int(s["start"] * sr), int(s["end"] * sr)
        opt = {k: s[k] for k in ("level", "bpm", "shift", "gain") if k in s}
        y = _render(s["mood"], (b - a) / sr + xfade, sr, **opt)
        f = int(xfade * sr)
        y[:f] *= np.linspace(0, 1, f)
        y[-f:] *= np.linspace(1, 0, f)
        seg = y[: len(out) - a]
        out[a:a + len(seg)] += seg
    return out
