# PAAKIN Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `Short-video` repo into a Claude Code studio that can:
- produce PAAKIN 2D story clips (MP4 9:16)
- write captions for 4 platforms and general Facebook posts
- store finished work in a categorized library
- show progress in a mobile pixel-office Artifact

**Architecture:**
- **Repo-as-studio.** `CLAUDE.md` holds the rules and knowledge files hold the lessons. `.claude/agents` holds the 10 roles, each pinned to a model. `.claude/skills` holds the commands.
- **Shared engine, written once.** `engine/audio` is Python (alignment, music, SFX, mix). `engine/web` is a canvas player (rig, subtitles, camera, end card). `engine/render` is Node (Playwright frames piped to ffmpeg). A clip only adds `jobs/<id>/shots.js`.
- **Office.** A single-file Artifact. Its `db` capability stores state. Agents write to it with ArtifactData at stage ends.

**Tech Stack:** Python 3 + numpy + pytest, Node 22 (`node --test`), Playwright Chromium, ffmpeg, vanilla JS canvas, Kanit woff2 (@fontsource), claude.ai Artifact + db capability.

**Spec:** `docs/superpowers/specs/2026-11-13-paakin-studio-design.md`

## Global Constraints
- Video: 1080×1920, 30fps, libx264 crf 20, yuv420p, `+faststart`.
- Every clip ends with the end card (`assets/brand/end_card.png`) plus end voice, appended after the VO (~7 s), in one mixed audio file.
- No watermark logo. No noise SFX (whoosh, wind, waves, breath). Tonal SFX only.
- Mix levels: voice 1.0, music 0.42 × duck 0.45 while speaking, sfx 0.42, peak-normalize 0.97.
- Subtitles: 46px, single line, dark translucent box, keywords in yellow (`#FFD43B`). Split with `Intl.Segmenter('th',{granularity:'word'})`. Max width 940px with auto-shrink. Subtitle zone y > 1650; main content above it.
- Visual style: 2D flat vector, bright colours, no outlines. Not pixel art (pixel art is only for the office).
- Never add decorative text that was not asked for.
- Models: the ceiling is **Opus with `effort: low`**. Fable is never used for production. Roles follow spec §5.
- All user-facing text is in Thai.

## Review Focus
1. **Thai script without spaces** (one long run). The phrase splitter must still split on Thai punctuation and length (≤ 40 chars per phrase), not return one phrase. Test in Task 3.
2. **VO with a long pause or cough** (a gap of 3 s or more). Alignment must leave the phrases around it uncorrupted: no phrase under 0.25 s per 10 chars. Test in Task 3.
3. **Phone autoplay.** The player must use exactly one `<audio>` element. If `readyState>=1` at load, treat audio as present. Test in Task 5.
4. **Very long text overlays** (a 60-char title). They must shrink to ≤ 940px and never overflow. Test in Task 5.
5. **Clip > 15 MB.** The library must store a path or chat reference, never fail the upload. Test in Task 9.

---

### Task 1: Studio rules, knowledge, and policy checker

**Files:**
- Create: `CLAUDE.md`, `knowledge/manual.md`, `knowledge/lessons.md`, `README.md`, `scripts/check_policy.py`, `.gitignore`
- Test: `tests/test_policy.py`

**Interfaces:**
- Produces:
  - `check_policy.py`: `load_agents(dir) -> list[dict]` (frontmatter dicts) and `violations(agents) -> list[str]`.
  - CLI: `python scripts/check_policy.py` exits 1 on any violation.
  - `lessons.md` row format: `| id | ปัญหา | วิธีแก้ | แท็กตำแหน่ง | วันที่ |`.

- [ ] Step 1: Write `tests/test_policy.py` with these tests:
  - `test_fable_forbidden`: an agent with `model: fable` produces a violation.
  - `test_opus_requires_low`: `model: opus` without `effort: low` produces a violation.
  - `test_sonnet_ok`: `sonnet`, `haiku`, and `opus`+`low` produce no violation.
  - `test_unknown_model`: any other value produces a violation.
- [ ] Step 2: Run `pytest tests/test_policy.py -q`. Expected: FAIL (module missing).
- [ ] Step 3: Implement `check_policy.py`. Parse the YAML frontmatter by hand (lines between `---`), so there is no pyyaml dependency.
- [ ] Step 4: Run `pytest tests/test_policy.py -q`. Expected: PASS.
- [ ] Step 5: Write the content files:
  - `CLAUDE.md` (Thai): the 8 permanent rules from manual §2, the model policy, "read the lessons rows tagged with your role before working", and the job folder layout `jobs/<YYYYMMDD-slug>/`.
  - `knowledge/manual.md`: the user's full manual, verbatim.
  - `knowledge/lessons.md`: the 13 rows from manual §6, each tagged with roles.
- [ ] Step 6: Commit with message `feat: studio rules, knowledge base, model policy checker`.

### Task 2: The 10 agents

**Files:**
- Create: `.claude/agents/{director,writer,sound,film-director,animator,editor,critic,marketer,planner,librarian}.md`
- Test: `tests/test_policy.py::test_repo_agents`

**Interfaces:**
- Consumes: `load_agents`, `violations` (Task 1).
- Produces: agent names exactly as the filenames above.
  - Each file's frontmatter has `name`, `description` (Thai, says when to use), `model`, optional `effort`, and `tools`.
  - Models per spec §5: director/film-director/animator/critic = `opus` + `effort: low`; writer/sound/marketer/planner = `sonnet`; editor/librarian = `haiku`.

- [ ] Step 1: Add `test_repo_agents`. It asserts that all 10 files exist, `violations(load_agents('.claude/agents')) == []`, and `critic` has the `Read` tool (needed to view images).
- [ ] Step 2: Run it. Expected: FAIL.
- [ ] Step 3: Write each agent body (≤ 40 lines). Each body covers: its room, inputs and outputs (files under `jobs/<id>/`), which lessons tags it must read, its handoff file `jobs/<id>/handoff.md` (≤ 15 lines), and "report status to office at stage end".
  - The director body adds: timeline table, token budget per stage, gates (VO-timing approval by user, critic max 2 loops), and the final report format.
- [ ] Step 4: Run the test. Expected: PASS.
- [ ] Step 5: Commit with message `feat: studio team agents with model policy`.

### Task 3: Audio alignment and mouth envelope

**Files:**
- Create: `engine/audio/align.py`, `engine/audio/envelope.py`, `engine/audio/__init__.py`
- Test: `tests/audio/test_align.py`, `tests/audio/conftest.py` (synthesises tone bursts with numpy and writes a wav via ffmpeg)

**Interfaces:**
- Produces:
  - `split_phrases(text: str, max_chars=40) -> list[str]`
  - `speech_chunks(audio_path, noise_db=-36, min_sil=0.1) -> list[tuple[float,float]]`
  - `align(phrases, chunks, sil_penalty=1.0) -> list[dict(w,s,e)]`
  - `envelope(audio_path, fps=30) -> list[int]` (values 0–9)
  - CLI: `python -m engine.audio.align script.txt vo.mp3 out_dir` writes `words.json` and `env.json`, and prints a table of key timings.

- [ ] Step 1: Write the tests:
  - `test_split_spaces`: `"ก ข, ค"` gives 2 or more phrases.
  - `test_split_no_space`: a 120-char Thai run gives ≥3 phrases, each ≤40.
  - `test_chunks`: 3 bursts give 3 chunks within ±0.05 s.
  - `test_align_monotonic`: phrases come out in order, with `s<e`.
  - `test_align_long_pause`: bursts with a 3 s gap give no phrase whose duration < 0.025·len(w).
  - `test_envelope_range`: length = ceil(dur·30) and all values are in 0..9.
- [ ] Step 2: Run `pytest tests/audio -q`. Expected: FAIL.
- [ ] Step 3: Implement.
  - `speech_chunks` parses `ffmpeg silencedetect` stderr.
  - `align` is a DP over (phrase i, chunk j). It assigns contiguous phrase groups to contiguous chunk groups and minimises |Σchars·rate − Σspeech dur| + `sil_penalty`·(silence spanned). The rate is total chars / total speech.
  - Within a group, time is split by character share.
  - `envelope` computes RMS per 1/30 s, then scales by its 95th percentile to 0–9.
- [ ] Step 4: Run tests. Expected: PASS.
- [ ] Step 5: Commit with message `feat: phrase alignment and mouth envelope`.

### Task 4: Music, tonal SFX, mix

**Files:**
- Create: `engine/audio/music.py`, `engine/audio/sfx.py`, `engine/audio/mix.py`
- Test: `tests/audio/test_mix.py`

**Interfaces:**
- Consumes: `words.json` format (Task 3).
- Produces:
  - `MOODS = ["cute","bright","sunset","spooky","science","tense","chase","sad","warm","outro"]`
  - `music(segments: list[dict(mood,start,end)], sr=44100) -> np.ndarray`
  - `SFX` dict name→fn. Names: `step, boom, sting, theremin, boing, squeal, heartbeat, wah, click, fanfare, chime, sparkle, bell`.
  - `mix(vo_path, end_voice_path, music_segs, sfx_events: list[dict(name,t)], out_path) -> float` (returns total duration)
  - CLI: `python -m engine.audio.mix jobs/<id>/audio_plan.json`

- [ ] Step 1: Write the tests:
  - `test_moods_render`: each mood gives finite audio of the right length.
  - `test_sfx_tonal`: every SFX has spectral flatness < 0.3. This automatically enforces "no noise".
  - `test_ducking`: music RMS while the voice is active is ≤ 0.5× music RMS in silence.
  - `test_peak`: max |out| is within 0.97±0.005.
  - `test_end_voice_appended`: duration = vo + end voice ± 0.05.
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement with additive sine/triangle synthesis and ADSR envelopes. The duck envelope comes from the VO RMS, smoothed over 150 ms. Output is mp3 via ffmpeg.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit with message `feat: mood music, tonal sfx, ducked mix with end voice`.

### Task 5: Canvas engine (player, rig, subtitles, camera, end card)

**Files:**
- Create:
  - `engine/web/player.html` (canvas, ▶/⏸, restart, seek, subs toggle, one `<audio>`)
  - `engine/web/core.js` (timing, shots, camera, transport, `window.renderAt`)
  - `engine/web/rig.js` (IK, character drawing, expressions, walk)
  - `engine/web/subs.js`
  - `engine/web/scenes.js` (sky gradients, mountain/pine layers, tent, studio desk, title capsule, info card, phone mockup, end card)
  - `engine/web/cast.js` (the gang: narrator purple, Bem 1.28× green, Meen pink, twins orange with younger blue cap, Nat white shirt + blue tie + glasses)
  - `engine/web/fonts/kanit-thai-700.woff2`, `kanit-latin-700.woff2`
- Test: `tests/web/*.test.mjs` (`node --test`), `tests/web/player.spec.mjs` (Playwright)

**Interfaces:**
- Produces (globals, ES modules):
  - `T(i)` and `TW(i, word)`
  - `shot(start, drawFn)`
  - `clampCam({x,y,zoom}) -> {x,y,zoom}`; zoom ≥ 1 always, ≥ 1.03 when shaking.
  - `ik2(shoulder, target, l1, l2, bendSign) -> {elbow, hand}`
  - `drawChar(ctx, castId, pose)` where `pose={x,y,scale,expr,talk,mode:'stand'|'sit'|'walk'|'sleep',arms:{l,r},armsFront,walkPhase,prop}`
  - `EXPRS=['happy','smug','scared','shock','sad','cry','laugh','pale','angry','sleep']`
  - `layoutSub(text, keywords, ctx) -> {lines:[segments], size}`
  - `fitText(ctx, text, maxW, size) -> size`
  - `window.renderAt(t)`
  - A job loads via `player.html?job=<id>&t=<sec>`. That reads `jobs/<id>/timing.js` (`window.WORDS`, `window.ENV`), `jobs/<id>/shots.js`, and `jobs/<id>/mix.mp3`.

- [ ] Step 1: Write the unit tests:
  - `ik2` reaches the target when reachable, puts the elbow on the `bendSign` side, and clamps when out of reach.
  - `clampCam` never exposes the canvas edge across a zoom/pan grid.
  - `layoutSub` never breaks inside a Segmenter word, and its width ≤ 940.
  - `fitText` with a 60-char string gives width ≤ 940.
- [ ] Step 2: Write the Playwright spec:
  - Load the demo job; `renderAt(1)` produces non-blank pixels.
  - Fonts are loaded (`document.fonts.check('700 40px Kanit','ก')`).
  - Exactly 1 `audio` element.
  - With the audio stubbed to `readyState=1` before load, the player uses the audio clock.
- [ ] Step 3: Run `node --test tests/web` and `npx playwright test tests/web --trace off`. Expected: FAIL.
- [ ] Step 4: Fetch the Kanit 700 woff2 files from `cdn.jsdelivr.net/npm/@fontsource/kanit@5.1.0/files/` into `engine/web/fonts/`.
- [ ] Step 5: Implement following manual §3 steps 3–5:
  - Elbows default outward; for hands-to-face poses, draw the arms over the head.
  - Sleeves are 14% darker than the body.
  - Walk is side-on with arms swinging against the legs.
  - Mouth moves from `ENV` only while `talk` is true.
  - Blink every 3–5 s.
  - Keep a breathing idle; no constant wiggle.
- [ ] Step 6: Run the tests. Expected: PASS.
- [ ] Step 7: Commit with message `feat: canvas engine with IK rig, thai subs, camera, end card`.

### Task 6: Render, contact sheet, export, demo job

**Files:**
- Create: `engine/render/export.mjs`, `engine/render/contact.mjs`, `jobs/_demo/{script.txt,shots.js,audio_plan.json}`, `scripts/make_demo_vo.py` (synthetic VO for the demo)
- Test: `tests/render/test_export.py`

**Interfaces:**
- Consumes: player URL contract (Task 5), `mix` CLI (Task 4), `align` CLI (Task 3).
- Produces:
  - `node engine/render/export.mjs <jobId> [--seconds N]` writes `jobs/<id>/out.mp4`.
  - `node engine/render/contact.mjs <jobId> --every 4` writes `jobs/<id>/contact.jpg` (6 columns, 270px wide, with a timestamp label).
  - `--remux` swaps in new audio using `-c:v copy`.

- [ ] Step 1: Write the tests:
  - `test_demo_export`: run the full demo pipeline for 6 s, then ffprobe shows 1080×1920, 30/1, h264, yuv420p, and an aac/mp3 audio stream.
  - `test_contact`: the contact sheet exists and its width is 1620.
  - `test_remux_fast`: remux finishes in < 10 s and the video stream hash is unchanged.
- [ ] Step 2: Run `pytest tests/render -q`. Expected: FAIL.
- [ ] Step 3: Implement export.
  - Launch Playwright Chromium.
  - For each frame: `renderAt(f/30)`, then `canvas.toDataURL('image/jpeg',.92)`, batched 10 frames per evaluate.
  - Pipe into `ffmpeg -f image2pipe -framerate 30 -i - -i mix.mp3 -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart -shortest`.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit with message `feat: frame export, contact sheet, remux, demo job`.

### Task 7: Captions and general posts

**Files:**
- Create: `engine/content/captions.py`, `engine/content/limits.py`
- Test: `tests/content/test_captions.py`

**Interfaces:**
- Produces:
  - `captions.json` schema: `{youtube:{title,description,tags[]}, facebook:{text,hashtags[]}, tiktok:{text,hashtags[]}, instagram:{text,hashtags[]}, cta, best_time}`
  - `validate(c: dict) -> list[str]`
  - `LIMITS={youtube_title:100, youtube_desc:5000, tiktok:2200, instagram:2200, instagram_hashtags:30, facebook:63206}`
  - Every caption must contain `paakin.com`. A YouTube title must contain `#Shorts`.
  - `post.json` (general FB post): `{kind:'promo'|'news'|'event', text, hashtags[], image_brief}`
  - `validate_post(p) -> list[str]`

- [ ] Step 1: Write tests for each limit, the missing link, missing `#Shorts`, and >30 IG hashtags; also check that a valid fixture passes.
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit with message `feat: caption and post schemas with platform limits`.

### Task 8: Library

**Files:**
- Create: `engine/content/library.py`, `library/index.json` (`[]`)
- Test: `tests/content/test_library.py`

**Interfaces:**
- Produces:
  - `add(entry: dict) -> str` (returns the id)
  - `query(**filters) -> list[dict]`
  - `set_status(id, status, platform=None)`
  - Entry fields: `id, title, type('story_clip'|'promo'|'news'|'event'), series, characters[], mood, paakin_feature, status('draft'|'review'|'ready'|'posted'), posted{youtube,facebook,tiktok,instagram: date|null}, files{mp4, mp4_ref, captions}, created`
  - Files go to `library/<YYYY-MM>/<id>-<slug>/`.
  - MP4 > 15 MB: kept with `mp4_ref` set to the chat/session note, and not committed. `.gitignore` covers `library/**/*.mp4`.

- [ ] Step 1: Write the tests:
  - add then query by type, series, and status.
  - `set_status` with a platform fills the date.
  - A 16 MB dummy mp4 leads to `mp4_ref` set and the file not staged.
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit with message `feat: categorized content library`.

### Task 9: Commands (skills)

**Files:**
- Create: `.claude/skills/{make-clip,fix-clip,captions,post,plan-week,report,remember}/SKILL.md`
- Test: `tests/test_policy.py::test_skills`

**Interfaces:**
- Consumes: agent names (Task 2), every CLI from Tasks 3–8, office status calls (Task 10).
- Produces: each SKILL.md has a Thai `description` that names its Thai trigger:
  - `make-clip` = สร้างคลิป
  - `fix-clip` = แก้คลิป
  - `captions` = แคปชั่น (supports "gen ใหม่" and per-platform edits)
  - `post` = โพสต์ทั่วไป
  - `plan-week` = วางแผนสัปดาห์
  - `report` = รายงาน
  - `remember` = จำไว้ (appends a lessons row immediately)

- [ ] Step 1: Write `test_skills`. All 7 exist with frontmatter `name` and `description`. `make-clip` mentions each pipeline stage in order: director, sound, a gate, film-director, animator, critic, editor, marketer, librarian, then the report.
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Write the skills. Each is ≤ 60 lines and contains exact commands, not prose.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit with message `feat: studio commands`.

### Task 10: Pixel office Artifact

**Files:**
- Create: `office/index.html`, `office/README.md` (records the artifact URL and db schema), `engine/office/status.md` (how agents post status)
- Test: `tests/office/office.spec.mjs` (Playwright with a stubbed `window.claude` db)

**Interfaces:**
- Produces:
  - db collections:
    - `jobs`: `{id,title,stage,role,progress,timeline[{stage,eta,done}],tokens{budget,used}}`
    - `library`: mirror of the library entries plus captions
    - `reports`: `{jobId,text,date}`
    - `lessons`: `{id,text,role,date}`
  - Room ids: `director, writer, sound, film-director, animator, editor, critic, marketing, library`.
  - When `jobs.role` changes, the character walks from the previous room to the new one.

- [ ] Step 1: Load the `artifact-capabilities` and `artifact-design` skills. Record the db call signatures in `office/README.md`.
- [ ] Step 2: Write the Playwright spec at a 390×844 viewport:
  - There is no horizontal scroll.
  - The 3 bottom tabs are visible.
  - Seeding a job with `role:'animator'` puts that character in the animator room after 3 s.
  - The library tab's "คัดลอก" button writes the platform caption to the clipboard.
  - The page renders with an empty db (empty-state text shows).
- [ ] Step 3: Run. Expected: FAIL.
- [ ] Step 4: Build the page.
  - Mobile-first, clean, light theme with a dark-mode token set.
  - The pixel art is drawn on canvas with `image-rendering: pixelated`.
  - The room grid is 3×3.
  - Animation runs in the browser only.
- [ ] Step 5: Run. Expected: PASS.
- [ ] Step 6: Publish via Artifact (icon `office`). Put the URL into `office/README.md` and `CLAUDE.md`, seeded with the demo job.
- [ ] Step 7: Commit with message `feat: mobile pixel office artifact`.

### Task 11: End-to-end check, push, PR

- [ ] Step 1: Run `pytest -q && node --test tests/web && npx playwright test --trace off && python scripts/check_policy.py`. Expected: all pass.
- [ ] Step 2: Run the demo through `/make-clip` instructions manually. Confirm `out.mp4`, `contact.jpg`, `captions.json`, the library entry, and the office update.
- [ ] Step 3: Push `big/loving-goldberg-2383v9` and open a draft PR to `main`.
