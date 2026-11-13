"""ดนตรีประกอบตามอารมณ์ (สดใส น่ารัก) — สังเคราะห์ด้วย numpy"""
import numpy as np
from .synth import note_hz, tone, pluck, put

# mood: bpm, root(midi), chord degrees (major/minor offsets), lead wave, pattern
MOODS = ["cute", "bright", "sunset", "spooky", "science", "tense", "chase", "sad", "warm", "outro"]
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


def _render(mood, dur, sr):
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
        y = _render(s["mood"], (b - a) / sr + xfade, sr)
        f = int(xfade * sr)
        y[:f] *= np.linspace(0, 1, f)
        y[-f:] *= np.linspace(1, 0, f)
        seg = y[: len(out) - a]
        out[a:a + len(seg)] += seg
    return out
