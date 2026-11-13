"""ตรวจนโยบายโมเดล: สูงสุด Opus effort low, ห้าม Fable ในงานผลิต"""
import pathlib
import sys

ALLOWED = {"sonnet", "haiku", "opus"}


def parse_frontmatter(text: str) -> dict:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}
    out = {}
    for line in lines[1:]:
        if line.strip() == "---":
            break
        if ":" in line and not line.startswith((" ", "\t", "-")):
            k, v = line.split(":", 1)
            out[k.strip()] = v.strip().strip('"\'')
    return out


def load_agents(directory) -> list:
    return [dict(parse_frontmatter(p.read_text(encoding="utf-8")), _file=p.name)
            for p in sorted(pathlib.Path(directory).glob("*.md"))]


def violations(agents) -> list:
    errs = []
    for ag in agents:
        who = ag.get("name") or ag.get("_file")
        model = ag.get("model", "").lower()
        if model not in ALLOWED:
            errs.append(f"{who}: โมเดล '{model}' ไม่อนุญาต (ใช้ได้ sonnet/haiku/opus+low)")
        elif model == "opus" and ag.get("effort", "").lower() != "low":
            errs.append(f"{who}: opus ต้องตั้ง effort: low")
    return errs


if __name__ == "__main__":
    root = pathlib.Path(__file__).resolve().parents[1]
    errs = violations(load_agents(root / ".claude" / "agents"))
    for e in errs:
        print("✗", e)
    print("✓ นโยบายโมเดลผ่าน" if not errs else f"พบ {len(errs)} ข้อผิด")
    sys.exit(1 if errs else 0)
