import sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from check_policy import load_agents, violations


def a(**kw):
    d = {"name": "x"}
    d.update(kw)
    return d


def test_fable_forbidden():
    assert violations([a(model="fable")])


def test_opus_requires_low():
    assert violations([a(model="opus")])
    assert violations([a(model="opus", effort="medium")])


def test_sonnet_ok():
    assert violations([a(model="sonnet"), a(model="haiku"), a(model="opus", effort="low")]) == []


def test_unknown_model():
    assert violations([a(model="gpt")])
    assert violations([a()])


AGENTS = ["director", "writer", "sound", "film-director", "animator", "editor",
          "critic", "marketer", "planner", "librarian"]


def test_repo_agents():
    d = ROOT / ".claude" / "agents"
    for n in AGENTS:
        assert (d / f"{n}.md").exists(), n
    ags = load_agents(d)
    assert violations(ags) == []
    critic = next(x for x in ags if x["name"] == "critic")
    assert "Read" in critic["tools"]


SKILLS = ["make-clip", "fix-clip", "captions", "post", "plan-week", "report", "remember"]


def test_skills():
    from check_policy import parse_frontmatter
    d = ROOT / ".claude" / "skills"
    for n in SKILLS:
        fm = parse_frontmatter((d / n / "SKILL.md").read_text(encoding="utf-8"))
        assert fm.get("name") == n and fm.get("description"), n
    body = (d / "make-clip" / "SKILL.md").read_text(encoding="utf-8")
    order = ["director", "sound", "GATE", "film-director", "animator", "critic", "editor", "marketer", "librarian", "report"]
    pos = [body.index(k) for k in order]
    assert pos == sorted(pos)
