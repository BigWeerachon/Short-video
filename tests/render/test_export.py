import hashlib, json, pathlib, subprocess, time
ROOT = pathlib.Path(__file__).resolve().parents[2]
JOB = ROOT / "jobs" / "_demo"


def probe(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(p)],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def vhash(p):
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-map", "0:v", "-c", "copy", "-f", "md5", "-"],
                         capture_output=True, text=True, check=True).stdout
    return out.strip()


def test_demo_export_and_remux():
    subprocess.run(["node", "engine/render/export.mjs", "_demo", "--seconds", "6"], cwd=ROOT, check=True, timeout=300)
    out = JOB / "out.mp4"
    info = probe(out)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = [s for s in info["streams"] if s["codec_type"] == "audio"]
    assert (v["width"], v["height"], v["r_frame_rate"], v["codec_name"], v["pix_fmt"]) == (1080, 1920, "30/1", "h264", "yuv420p")
    assert a and abs(float(info["format"]["duration"]) - 6) < 0.2
    before = vhash(out)
    t0 = time.time()
    subprocess.run(["node", "engine/render/export.mjs", "_demo", "--remux"], cwd=ROOT, check=True, timeout=60)
    assert time.time() - t0 < 10
    assert vhash(out) == before


def test_contact():
    subprocess.run(["node", "engine/render/contact.mjs", "_demo", "--every", "5"], cwd=ROOT, check=True, timeout=120)
    w = probe(JOB / "contact.jpg")["streams"][0]["width"]
    assert w == 1620
