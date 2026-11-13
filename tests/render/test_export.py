import json, pathlib, shutil, subprocess, time
import pytest
ROOT = pathlib.Path(__file__).resolve().parents[2]
JOB = ROOT / "jobs" / "_test_export"


@pytest.fixture(scope="module", autouse=True)
def temp_job():
    """คัดลอกงานตัวอย่างเป็นงานชั่วคราว — ไม่เขียนทับ jobs/_demo"""
    shutil.rmtree(JOB, ignore_errors=True)
    shutil.copytree(ROOT / "jobs" / "_demo", JOB, ignore=shutil.ignore_patterns("out.mp4", "contact.jpg"))
    yield
    shutil.rmtree(JOB, ignore_errors=True)


def probe(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(p)],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def vhash(p):
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-map", "0:v", "-c", "copy", "-f", "md5", "-"],
                         capture_output=True, text=True, check=True).stdout
    return out.strip()


def test_demo_export_and_remux():
    subprocess.run(["node", "engine/render/export.mjs", "_test_export"], cwd=ROOT, check=True, timeout=300)
    out = JOB / "out.mp4"
    info = probe(out)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = [s for s in info["streams"] if s["codec_type"] == "audio"]
    assert (v["width"], v["height"], v["r_frame_rate"], v["codec_name"], v["pix_fmt"]) == (1080, 1920, "30/1", "h264", "yuv420p")
    mix = float(probe(JOB / "mix.mp3")["format"]["duration"])
    assert a and abs(float(info["format"]["duration"]) - mix) < 0.2
    before = vhash(out)
    t0 = time.time()
    subprocess.run(["node", "engine/render/export.mjs", "_test_export", "--remux"], cwd=ROOT, check=True, timeout=60)
    assert time.time() - t0 < 10
    assert vhash(out) == before


def test_remux_refuses_changed_audio_length():
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(JOB / "mix.mp3"), "-t", "15", str(JOB / "short.mp3")], check=True)
    (JOB / "short.mp3").replace(JOB / "mix.mp3")
    r = subprocess.run(["node", "engine/render/export.mjs", "_test_export", "--remux"], cwd=ROOT, capture_output=True, text=True)
    assert r.returncode != 0 and "export ใหม่" in (r.stderr + r.stdout)


def test_contact():
    subprocess.run(["node", "engine/render/contact.mjs", "_test_export", "--every", "5"], cwd=ROOT, check=True, timeout=120)
    w = probe(JOB / "contact.jpg")["streams"][0]["width"]
    assert w == 1620
