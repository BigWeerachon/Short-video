import numpy as np


def note_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def tone(hz, dur, sr, wave="sine", a=0.01, d=0.1, s=0.6, r=0.1, vib=0.0):
    n = max(int(dur * sr), 1)
    t = np.arange(n) / sr
    ph = 2 * np.pi * hz * t + (vib * np.sin(2 * np.pi * 5.5 * t) if vib else 0)
    if wave == "tri":
        y = 2 / np.pi * np.arcsin(np.sin(ph))
    elif wave == "soft":  # sine + เบาๆ ฮาร์มอนิก 2,3
        y = np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    else:
        y = np.sin(ph)
    return y * adsr(n, sr, a, d, s, r)


def adsr(n, sr, a, d, s, r):
    env = np.full(n, s, dtype=float)
    na, nd, nr = int(a * sr), int(d * sr), int(r * sr)
    na = min(na, n); env[:na] = np.linspace(0, 1, na, endpoint=False)
    nd = min(nd, n - na); env[na:na + nd] = np.linspace(1, s, nd, endpoint=False)
    nr = min(nr, n); env[n - nr:] *= np.linspace(1, 0, nr)
    return env


def pluck(hz, dur, sr, wave="tri"):
    return tone(hz, dur, sr, wave, a=0.005, d=dur * 0.6, s=0.15, r=dur * 0.3)


def put(buf, y, at, gain=1.0):
    i = int(at)
    if i >= len(buf):
        return
    y = y[: len(buf) - i]
    buf[i:i + len(y)] += gain * y
