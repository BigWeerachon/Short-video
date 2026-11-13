import numpy as np, pytest
from engine.audio.music import MOODS, music
from engine.audio.sfx import SFX
from engine.audio.mix import mix
from engine.audio.io import decode, duration
from .conftest import write_wav, bursts

SR = 44100


def flatness(x):
    p = np.abs(np.fft.rfft(x * np.hanning(len(x)))) ** 2 + 1e-12
    return float(np.exp(np.mean(np.log(p))) / np.mean(p))


@pytest.mark.parametrize("mood", MOODS)
def test_moods_render(mood):
    y = music([{"mood": mood, "start": 0, "end": 3}], sr=SR)
    assert len(y) == 3 * SR and np.isfinite(y).all() and np.abs(y).max() > 0.01


@pytest.mark.parametrize("name", sorted(SFX))
def test_sfx_tonal(name):
    y = SFX[name](SR)
    assert np.abs(y).max() > 0.01
    assert flatness(y) < 0.3, name


@pytest.fixture
def files(tmp_path):
    vo, end = tmp_path / "vo.wav", tmp_path / "end.wav"
    write_wav(vo, bursts([(1.0, 3.0)]))   # 3.5 s
    write_wav(end, bursts([(0.1, 1.5)]))  # 2.0 s
    return vo, end, tmp_path


def test_end_voice_appended(files):
    vo, end, d = files
    total = mix(vo, end, [{"mood": "bright", "start": 0, "end": 3.5}], [], d / "m.mp3")
    assert abs(duration(d / "m.mp3") - (3.5 + 2.0)) < 0.08
    assert abs(total - 5.5) < 0.05


def test_peak(files):
    vo, end, d = files
    mix(vo, end, [{"mood": "bright", "start": 0, "end": 3.5}], [{"name": "chime", "t": 0.5}], d / "m.wav")
    assert abs(np.abs(decode(d / "m.wav", SR)).max() - 0.97) < 0.01


def test_ducking(files):
    vo, end, d = files
    from engine.audio.mix import duck_curve
    v = decode(vo, SR)
    g = duck_curve(v, SR)
    assert g[int(2.0 * SR)] <= 0.5 and g[int(0.3 * SR)] > 0.9
