"""mix: VO + เสียงปิดท้าย + ดนตรี (ducking) + SFX → ไฟล์เดียว (lessons L08, L09)"""
import argparse, json, pathlib, subprocess, tempfile
import numpy as np
from .io import decode
from .music import music
from .sfx import SFX

VOICE, MUSIC, DUCK, FX, PEAK = 1.0, 0.42, 0.45, 0.42, 0.97


def duck_curve(v, sr, win=0.02, smooth=0.15) -> np.ndarray:
    w = int(win * sr)
    n = int(np.ceil(len(v) / w))
    rms = np.array([np.sqrt(np.mean(v[i * w:(i + 1) * w] ** 2)) for i in range(n)])
    active = (rms > 0.02).astype(float)
    k = max(int(smooth / win), 1)
    active = np.convolve(active, np.ones(k) / k, mode="same")
    active = np.maximum(active, (rms > 0.02))
    g = 1 - (1 - DUCK) * np.clip(active, 0, 1)
    return np.repeat(g, w)[: len(v)]


def _atempo(path, factor):
    out = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(path), "-af", f"atempo={factor}", out], check=True)
    return out


def mix(vo_path, end_voice_path, music_segs, sfx_events, out_path, sr=44100, atempo=1.0, mutes=()) -> float:
    if atempo != 1.0:
        vo_path = _atempo(vo_path, atempo)
    vo = decode(vo_path, sr)
    for s, e in mutes:  # เสียงไอ ฯลฯ (L13)
        vo[int(s * sr):int(e * sr)] = 0
    voice = np.concatenate([vo, decode(end_voice_path, sr)])
    n = len(voice)
    segs = [dict(s) for s in music_segs]
    last = max(segs, key=lambda s: s["end"])
    last["end"] = n / sr
    m = music(segs, sr)[:n]
    m = np.pad(m, (0, n - len(m)))
    fx = np.zeros(n)
    for ev in sfx_events:
        y = SFX[ev["name"]](sr) * ev.get("gain", 1.0)
        i = int(ev["t"] * sr)
        if i < n:
            y = y[: n - i]
            fx[i:i + len(y)] += y
    out = VOICE * voice + MUSIC * m * duck_curve(voice, sr) + FX * fx
    out *= PEAK / max(np.abs(out).max(), 1e-9)
    pcm = (out * 32767).astype("<i2").tobytes()
    codec = ["-c:a", "libmp3lame", "-b:a", "192k"] if str(out_path).endswith(".mp3") else []
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(sr), "-ac", "1", "-i", "-",
                    *codec, str(out_path)], input=pcm, check=True)
    return n / sr


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plan")
    plan_path = pathlib.Path(ap.parse_args().plan)
    p = json.loads(plan_path.read_text(encoding="utf-8"))
    d = plan_path.parent
    root = pathlib.Path(__file__).resolve().parents[2]
    total = mix(d / p.get("vo", "vo.mp3"), root / p.get("end_voice", "assets/brand/end_voice_from_clip.mp3"),
                p["music"], p.get("sfx", []), d / "mix.mp3", atempo=p.get("atempo", 1.0), mutes=p.get("mutes", []))
    _write_durations(d, total, root / p.get("end_voice", "assets/brand/end_voice_from_clip.mp3"))
    print(f"mix.mp3 ยาว {total:.2f} วิ (รวมเสียงปิด)")


def _write_durations(d, total, end_voice):
    """บันทึก END_DUR ลง timing.js ให้ player รู้ว่าฉากปิดเริ่มเมื่อไร"""
    from .io import duration
    tj = d / "timing.js"
    if not tj.exists():
        return
    end = duration(end_voice)
    lines = [l for l in tj.read_text(encoding="utf-8").splitlines() if not l.startswith(("window.END_DUR", "window.VO_DUR"))]
    lines += [f"window.VO_DUR={total - end:.3f};", f"window.END_DUR={end:.3f};"]
    tj.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
