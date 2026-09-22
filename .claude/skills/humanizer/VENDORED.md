# Vendored, not ours

`SKILL.md` and `LICENSE` in this directory are copied verbatim from
**https://github.com/blader/humanizer** (MIT, © 2025 Siqi Chen), version 3.0.0,
vendored 2026-09-21. Its own source is Wikipedia's "Signs of AI writing".

**Do not edit `SKILL.md`.** It is upstream code; local changes would be lost on
any update and make it impossible to tell ours from theirs. Everything specific
to Automatic Nation lives in `.claude/skills/seo-voice/`, which runs after this
one and overrides it where they disagree.

To update: re-download `SKILL.md` and `LICENSE` from the repo, diff, and check
that `seo-voice` still contradicts nothing it needs to.

Why vendored rather than installed as a plugin: the pipeline's four stages are
committed to this repo so the whole team runs the same ones (see the `.gitignore`
note). A skill that only exists on one laptop is a stage nobody else can run,
and that applies to a borrowed skill as much as our own.
