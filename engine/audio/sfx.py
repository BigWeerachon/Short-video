"""SFX แบบโน้ตดนตรี/tonal เท่านั้น (ห้าม noise — lessons L15)"""
import numpy as np
from .synth import note_hz, tone, pluck


def _cat(*parts, gap=0.0, sr=44100):
    g = np.zeros(int(gap * sr))
    out = []
    for p in parts:
        out += [p, g]
    return np.concatenate(out[:-1])


def _sweep(f0, f1, dur, sr, wave="sine"):
    t = np.arange(int(dur * sr)) / sr
    f = np.geomspace(f0, f1, len(t))
    ph = 2 * np.pi * np.cumsum(f) / sr
    y = np.sin(ph) if wave == "sine" else 2 / np.pi * np.arcsin(np.sin(ph))
    return y * np.hanning(len(t)) ** 0.5


SFX = {
    "step": lambda sr: tone(140, 0.09, sr, a=0.002, d=0.06, s=0.1, r=0.02),
    "boom": lambda sr: _sweep(110, 45, 0.6, sr),
    "sting": lambda sr: sum(tone(note_hz(m), 0.9, sr, "soft", a=0.005, d=0.3, s=0.4, r=0.4) for m in (60, 61, 66)) / 3,
    "theremin": lambda sr: tone(note_hz(72), 1.4, sr, "sine", a=0.2, d=0.2, s=0.8, r=0.4, vib=6.0),
    "boing": lambda sr: _sweep(180, 520, 0.35, sr) ,
    "squeal": lambda sr: _sweep(800, 1600, 0.3, sr),
    "heartbeat": lambda sr: _cat(tone(60, 0.12, sr, a=0.005, d=0.08, s=0.2, r=0.03),
                                 tone(55, 0.12, sr, a=0.005, d=0.08, s=0.2, r=0.03), gap=0.12, sr=sr),
    "wah": lambda sr: _sweep(500, 300, 0.7, sr, "tri"),
    "click": lambda sr: tone(1800, 0.04, sr, a=0.003, d=0.02, s=0.3, r=0.015),
    "fanfare": lambda sr: _cat(*[pluck(note_hz(m), 0.18, sr) for m in (67, 72, 76)], tone(note_hz(79), 0.5, sr, "tri", r=0.2), sr=sr),
    "chime": lambda sr: tone(note_hz(84), 0.8, sr, "sine", a=0.003, d=0.5, s=0.2, r=0.3) + 0.5 * tone(note_hz(91), 0.8, sr, a=0.003, d=0.4, s=0.1, r=0.3),
    "sparkle": lambda sr: _cat(*[tone(note_hz(m), 0.09, sr, a=0.003, d=0.06, s=0.2, r=0.02) for m in (84, 88, 91, 96)], sr=sr),
    "bell": lambda sr: tone(note_hz(76), 1.5, sr, "soft", a=0.003, d=1.0, s=0.1, r=0.5),
}
