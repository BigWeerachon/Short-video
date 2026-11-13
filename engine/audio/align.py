"""จับเวลาวลีในบทกับเสียงพากย์ (silencedetect + DP) — คู่มือขั้นที่ 1"""
import argparse, json, math, pathlib, re, subprocess
from .io import duration, dump

MAX_PH, MAX_CH = 6, 8


def split_phrases(text: str, max_chars=40) -> list:
    out = []
    for tok in re.findall(r"[^\s,.!?…]+[,.!?…]*", text):
        k = math.ceil(len(tok) / max_chars)
        size = math.ceil(len(tok) / k)
        out += [tok[i:i + size] for i in range(0, len(tok), size)]
    return out


def speech_chunks(audio_path, noise_db=-36, min_sil=0.1) -> list:
    err = subprocess.run(["ffmpeg", "-v", "info", "-i", str(audio_path), "-af",
                          f"silencedetect=n={noise_db}dB:d={min_sil}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(v) for v in re.findall(r"silence_start: ([\d.]+)", err)]
    ends = [float(v) for v in re.findall(r"silence_end: ([\d.]+)", err)]
    total = duration(audio_path)
    sil = list(zip(starts, ends + [total] * (len(starts) - len(ends))))
    chunks, t = [], 0.0
    for s, e in sil:
        if s - t > 0.03:
            chunks.append((round(t, 3), round(s, 3)))
        t = e
    if total - t > 0.03:
        chunks.append((round(t, 3), round(total, 3)))
    return chunks


def _place(phrases, group_chunks):
    """แบ่งเวลาพูดจริง (ข้ามช่วงเงียบ) ตามสัดส่วนตัวอักษร"""
    speech = sum(e - s for s, e in group_chunks)
    total = sum(len(p) for p in phrases)

    def at(v):  # speech-time → real time
        for s, e in group_chunks:
            if v <= e - s + 1e-9:
                return s + v
            v -= e - s
        return group_chunks[-1][1]
    out, acc = [], 0.0
    for p in phrases:
        a = acc
        acc += speech * len(p) / total
        out.append({"w": p, "s": round(at(a), 3), "e": round(at(acc), 3)})
    # ห้ามเริ่มบนช่วงเงียบท้าย chunk: ถ้า s ตรงขอบจบ chunk ให้เลื่อนไป chunk ถัดไป
    for o in out:
        for (s, e), nxt in zip(group_chunks, group_chunks[1:]):
            if abs(o["s"] - e) < 1e-6:
                o["s"] = nxt[0]
    return out


def align(phrases, chunks, sil_penalty=1.0) -> list:
    n, m = len(phrases), len(chunks)
    rate = sum(map(len, phrases)) / sum(e - s for s, e in chunks)
    INF = float("inf")
    dp = [[INF] * (m + 1) for _ in range(n + 1)]
    bp = [[None] * (m + 1) for _ in range(n + 1)]
    dp[0][0] = 0.0
    for i in range(n + 1):
        for j in range(m + 1):
            c0 = dp[i][j]
            if c0 == INF:
                continue
            if j < m:  # ข้าม chunk (เสียงไอ/รบกวน)
                c = c0 + 2.0 * (chunks[j][1] - chunks[j][0]) + 0.5
                if c < dp[i][j + 1]:
                    dp[i][j + 1], bp[i][j + 1] = c, (i, j, False)
            for di in range(1, min(MAX_PH, n - i) + 1):
                chars = sum(len(p) for p in phrases[i:i + di])
                for dj in range(1, min(MAX_CH, m - j) + 1):
                    grp = chunks[j:j + dj]
                    sp = sum(e - s for s, e in grp)
                    gap = sum(b[0] - a[1] for a, b in zip(grp, grp[1:]))
                    c = c0 + abs(chars / rate - sp) + sil_penalty * gap * (dj - 1) / max(di, 1)
                    if c < dp[i + di][j + dj]:
                        dp[i + di][j + dj], bp[i + di][j + dj] = c, (i, j, True)
    i, j, groups = n, m, []
    while (i, j) != (0, 0):
        pi, pj, real = bp[i][j]
        if real:
            groups.append((phrases[pi:i], chunks[pj:j]))
        i, j = pi, pj
    out = []
    for ph, ch in reversed(groups):
        out += _place(ph, ch)
    return out


def timing_table(words, every=1) -> str:
    rows = [f"{k:>3} {w['s']:7.2f}–{w['e']:7.2f}  {w['w']}" for k, w in enumerate(words)][::every]
    warn = [f"⚠ วลี {k} สั้นผิดปกติ" for k, w in enumerate(words) if w["e"] - w["s"] < 0.025 * len(w["w"])]
    return "\n".join(rows + warn)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script"); ap.add_argument("audio"); ap.add_argument("out_dir")
    ap.add_argument("--sil-penalty", type=float, default=1.0)
    ap.add_argument("--noise-db", type=float, default=-36)
    a = ap.parse_args()
    from .envelope import envelope
    out = pathlib.Path(a.out_dir)
    words = align(split_phrases(pathlib.Path(a.script).read_text(encoding="utf-8")),
                  speech_chunks(a.audio, a.noise_db), a.sil_penalty)
    env = envelope(a.audio)
    dump(words, out / "words.json"); dump(env, out / "env.json")
    (out / "timing.js").write_text("window.WORDS=" + json.dumps(words, ensure_ascii=False) +
                                   ";\nwindow.ENV=" + json.dumps(env) + f";\nwindow.VO_DUR={duration(a.audio):.3f};\n", encoding="utf-8")
    print(timing_table(words))


if __name__ == "__main__":
    main()
