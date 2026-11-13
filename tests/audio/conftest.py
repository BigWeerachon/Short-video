import subprocess, numpy as np, pytest
SR = 22050


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1",
                    "-i", "-", str(path)], input=pcm, check=True)


def bursts(spec, sr=SR):
    """spec: list of (start, end) seconds of tone; total length = last end + 0.5"""
    n = int((spec[-1][1] + 0.5) * sr)
    x = np.zeros(n)
    for s, e in spec:
        t = np.arange(int(s * sr), int(e * sr))
        x[t] = 0.5 * np.sin(2 * np.pi * 220 * t / sr)
    return x


@pytest.fixture
def make_audio(tmp_path):
    def _m(spec, name="a.wav"):
        p = tmp_path / name
        write_wav(p, bursts(spec))
        return p
    return _m
