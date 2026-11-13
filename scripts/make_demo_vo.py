"""สร้างเสียงพากย์จำลอง (โทนเสียง) สำหรับงานตัวอย่าง _demo เท่านั้น — งานจริงใช้ไฟล์ ElevenLabs ของผู้ใช้"""
import pathlib, subprocess, sys
import numpy as np

SR = 22050


def main(script, out):
    lines = [l.strip() for l in pathlib.Path(script).read_text(encoding="utf-8").splitlines() if l.strip()]
    parts = [np.zeros(int(0.4 * SR))]
    for i, l in enumerate(lines):
        dur = len(l) / 11.0
        t = np.arange(int(dur * SR)) / SR
        syl = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 3.2 * t))
        parts += [0.45 * syl * np.sin(2 * np.pi * (180 + 20 * (i % 3)) * t), np.zeros(int(0.45 * SR))]
    x = np.concatenate(parts)
    pcm = (x * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-c:a", "libmp3lame", "-q:a", "4", out], input=pcm, check=True)


if __name__ == "__main__":
    main(*sys.argv[1:3])
