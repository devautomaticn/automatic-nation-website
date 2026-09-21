---
name: seo-voice
description: The Automatic Nation house voice, extracted from the site's own landing copy, plus the final editing pass for any blog draft. Use after writing or rewriting a post, together with the humanizer skill, or whenever asked to make a draft sound like the site rather than like an AI.
---

# The house voice

Run this **after** `humanizer`. That skill removes what makes prose sound
machine-written; this one puts back what makes it sound like Automatic Nation.
Where the two disagree, this file wins — it is the voice sample, and the
humanizer's own instructions say a sample overrides its defaults.

## The sample

This is not invented. It is the copy in `src/data/landings/`, which is the
sharpest writing on the site and the voice buyers meet first. **Read
`src/data/landings/airtable-consulting.ts` and `home.ts` before editing a
draft.** What follows is what they do, with their own sentences as evidence.

### It names the failure, concretely

> Someone exports a CSV every morning and pastes it into a base. That person is
> your integration layer, and they are also your single point of failure.

> Automation runs cap out, a script times out, and the record just never
> updates. No alert, no retry — the first signal is someone asking where their
> order went.

Not "inefficiencies in your workflow". A person, a morning, a CSV. When a draft
describes a problem in the abstract, replace the abstraction with the scene.

### It measures in things you can check

> CSV exports: 0

> Failures surfaced in <1 minute

> Training time: one 20-minute walkthrough

> 5,000 leads consolidated and deduplicated

Real units, small numbers, verifiable. Never "significantly faster", "boost
productivity", "save countless hours". If a number is not known, describe the
mechanism instead — do not reach for an adverb.

### It says the unflattering thing

> If the answer is that you don't need us, that's in the report too.

> Then we'll say so in the audit. Sometimes the answer is a real database with
> Airtable as the interface, and sometimes it's that your base is fine and the
> automations are the problem.

> You do — the base, the workspace, the automations and the documentation, all
> under your own account. We never hold the keys.

This is the most distinctive thing about the voice and the easiest to lose.
Every draft should contain at least one place where the obvious sales move is
declined. It is also what beats thin competitor pages on a commercial SERP.

### It uses the second person and the present tense

> Your Airtable base outgrew the person who built it.

> Tables grew one column at a time. Now a rename breaks four automations and two
> interfaces, so nothing gets renamed and the workarounds pile up.

"You", "your base", "your team". Not "organizations", not "businesses today",
not "one might".

### It ends flat

> Not sure whether it needs a rebuild or a repair? The audit tells you.

No crescendo, no "In conclusion", no inspirational close. State the thing and
stop.

## Punctuation, specifically

**No em dashes. None.** Also no en dashes, and no spaced hyphen (" - ") standing
in for one. This is a hard rule, decided 2026-09-21, and `seo/check-copy.mjs`
fails `npm run check` on any of them in pipeline copy.

This skill used to say the opposite: the landing copy uses dashes, so "keep them
at a moderate rate". In practice a moderate rate kept reading as machine-written,
and every pass let a few more back in. A ban is easier to hold than a ratio.

The landing copy in `src/data/landings/` still has dashes. It is the voice sample
for *what* to say, not for punctuation, and it is out of scope for the gate.

**How to remove one without making the sentence worse.** Don't swap it for a
comma; that is how you get a comma pile-up ("The agent answers from Airtable,
the same base that verifies who they are, and every thread…"). Rewrite:

- An aside in the middle → split into two sentences, or restructure so the aside
  becomes the main clause.
- A dash introducing a list or an explanation → a colon.
- A dash before a punchline → a full stop. The punchline gets its own sentence.
- A genuinely parenthetical detail → parentheses, sparingly.

Worked examples, from the first two posts:

> ~~Someone owns that — and if nobody has been named, the answer is nobody.~~
> Someone owns that. If nobody has been named, the answer is nobody.

> ~~The tables, the links between them, the views someone thought were worth
> building — that is the value.~~
> The value is in the tables, the links between them, and the views someone
> thought were worth building.

> ~~Templates ship with a generic status — Not started, In progress, Done.~~
> Templates ship with a generic status: Not started, In progress, Done.

**Straight quotes, not curly.** Both skills agree.

## The pass

Work on the draft in `src/content/blog/{slug}/index.md`, in this order.

1. **Run `humanizer` first.** All 25 patterns. Do not skip the structural ones
   in section A — "not X but Y", one-line closers and staged run-ups are the
   tells that survive every other edit.

2. **Then check this file's five traits.** For each, find the place in the draft
   where it is missing:
   - An abstraction that should be a scene.
   - A vague claim that should be a number, or should become a mechanism.
   - The absent unflattering sentence. Add it.
   - Third person that should be second.
   - A closing paragraph that swells. Cut it back.

3. **Read the first 100 words aloud.** This is where drafts are worst and where
   readers leave. If it defines a category the reader already searched for, cut
   it and start at the second paragraph — that is almost always the real opener.

4. **Check the claims survive.** The edit must not change a single fact. If a
   sentence got sharper by getting less true, revert it. This is the failure
   mode of every voice pass and it matters more here than the voice does.

## Never, in this corpus

Beyond the humanizer's list, these are specific to what is already on this site
and must not be added to:

- **"game-changer"** — the existing corpus has worn it out.
- **"In today's fast-paced business landscape"**, "Have you ever wondered",
  "unlock the power of", "delve", "navigate the complexities of", "robust",
  "seamless", "leverage" as a verb where "use" works.
- **"In conclusion"** as a heading or an opener. The migrated posts do this and
  it is one of the tells that dates them.
- **Keyword padding.** The old templates post said "Airtable workflow
  automation" and "Airtable process optimization" in consecutive paragraphs.
  Google has not rewarded that in a decade and it reads like a machine.
- **An H2 immediately restated as the first sentence under it.** Humanizer
  pattern 24, and the corpus is full of it.

## What not to touch

- **Technical accuracy.** If you do not know whether an Airtable behaviour is
  real, cut the sentence rather than smoothing it.
- **Internal links and their anchor text**, which are placed deliberately.
- **Frontmatter.** `description` is capped at 160 by zod; a voice edit that
  lengthens it fails the build.
- **Anything in a quote from a client.** Ryan Alexander's testimonial on the home
  page is carried over verbatim from the live site and is not yours to improve.
