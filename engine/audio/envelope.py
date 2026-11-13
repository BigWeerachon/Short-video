"""envelope ปาก 30fps (RMS → 0–9)"""
import math
import numpy as np
from .io import decode, duration


def envelope(audio_path, fps=30, sr=22050) -> list:
    x = decode(audio_path, sr)
    n = math.ceil(duration(audio_path) * fps)
    hop = sr / fps
    rms = np.array([np.sqrt(np.mean(x[int(i * hop):int((i + 1) * hop)] ** 2)) if int(i * hop) < len(x) else 0.0
                    for i in range(n)])
    nz = rms[rms > 1e-4]
    ref = np.percentile(nz, 95) if len(nz) else 1.0
    return [int(v) for v in np.clip(np.round(rms / ref * 9), 0, 9)]
