---
name: seo-write
description: Stage 3 of the SEO content pipeline. Take Approved ideas from the Notion board and write the actual blog posts into src/content/blog/ as drafts, then move them to Content review. Use when asked to write the approved posts, draft this week's content, or "run the writing stage".
---

# Stage 3 — write the approved content

Turn `Stage = Approved` rows into real posts in the repo, committed on a branch,
left as `draft: true` for a human to read. You do not publish and you do not
approve your own writing.

## Pick up the work

```
mcp__claude_ai_Notion__notion-query-data-sources
  mode: sql
  data_source_urls: ["collection://2baeb42e-299b-4bde-a891-9972a2d7544b"]
  query: SELECT url,"Title","Type","Target keyword","Slug","Volume","KD","Current position","Intent" FROM "collection://2baeb42e-299b-4bde-a891-9972a2d7544b" WHERE "Stage" = 'Approved'
```

Then `notion-fetch` each row's page to read its brief — the brief is the spec.
Set each row to `Drafting` as you start it, and handle **one post per session**
where possible. A compacted context halfway through a 2,000-word draft produces
a post that contradicts its own first half.

Read `seo/strategy.md` before the first draft, and read **three existing posts**
in `src/content/blog/` in full. The corpus is the voice specification; no
description of a voice substitutes for reading it.

## Where a post lives

```
src/content/blog/{slug}/index.md      ← the directory name IS the URL
src/content/blog/{slug}/hero.webp     ← optional, referenced as ./hero.webp
```

The post answers at `https://automaticnation.com/{slug}/` — root level, trailing
slash. `src/content.config.ts` explains why the directory name is load-bearing.

## Frontmatter

```yaml
---
title: "The H1 and the <title>"
description: One sentence, max 160 characters — the build FAILS above it.
published: 2026-09-30
draft: true
---
```

- `description` is capped at 160 by zod on purpose: past ~160 Google truncates,
  so an over-long one is a silent quality bug. Count the characters.
- `published` — for a New post, the date from the brief or today; stage 4 resets
  it to the scheduled date anyway. **For a Refresh, do not touch `published`**;
  add `updated: {today}` instead. The post did not come into existence today.
- `draft: true` on every post you write. Stage 4 clears it.
- `wpId` — **omit it.** It is optional, and it means "came from WordPress". A
  post born here has no WordPress ID and must not invent one.
- `hero` / `heroAlt` — only if a real image exists. `heroAlt` empty is allowed
  but a written one is better; 55 were backfilled by hand, don't add to the pile.

## Writing

**Length follows the SERP, not a quota.** Check what ranks and match the depth
the question actually needs. The corpus runs 150–6,181 words. A 900-word post
that answers completely beats a 2,400-word post with 1,500 words of preamble.

**Structure.** One H1 (the `title`, not repeated in the body). H2s that are
real sections, H3s only where a section genuinely subdivides. The primary
keyword in the title, the first 100 words, and one H2 — naturally, and nowhere
else on purpose.

**Rule 2 is the job.** The "Angle only we have" section of the brief is the
reason the post exists. It goes in the body as a concrete, checkable thing — the
actual field configuration, the actual formula, the actual automation trigger.
A post that reads like it was written by someone who has never built the thing
has failed regardless of word count or keyword placement.

**Never invent:** client names, metrics, case-study outcomes, quotes, dates,
prices, or Airtable behaviour you have not verified. If the brief calls for a
number nobody gave you, write the mechanism without the number and flag it in
your report as needing a real figure.

**Voice:** second person, plain sentences, concrete nouns. The full
specification with worked examples is the `seo-voice` skill — read it before
drafting, not only when editing, because writing in the voice is cheaper than
retrofitting it. Do not open with a definition of a category the reader already
knows; they searched for it.

**Formatting** available via `src/lib/rehype-prose.ts`: headings, lists, tables,
blockquotes, fenced code with Shiki (`github-dark`). Body images are referenced
relatively — `![alt](./01.webp)` — so Astro's pipeline resolves them; an
absolute `/images/...` path breaks under the build. Every body image needs alt
text; the build warns per missing one.

**Internal links:** 2–4 **outbound**, root-relative with a trailing slash, e.g.
`/airtable-field-types-a-friendly-guide-to-unlock-the-power-of-your-data/`.
Verify each target directory exists before writing the link.

**Do not add the inbound links yet.** The brief names two existing posts that
should link *to* this one, and that matters — a page with no inbound links is
the last one Google reaches. But those posts are live the moment they merge,
while this one is a draft and may be dated a week out, so adding them here puts
a 404 on two live pages. `seo-publish` adds them on the day the post goes live.
`npm run check` fails if you do it early; that gate is the reminder.

**CTA:** one, after the first real payoff, linking `/book-a-call/`. Never the
cal.com URL. The template renders `PostCta` on its own; don't duplicate it.

## A Refresh is a rewrite, not a patch

Same slug, same directory, same `published`. Read the existing post and the
current top 3 for the keyword, then rewrite what is losing — usually the intro,
the structure, and the absence of anything first-hand. Keep any section that is
genuinely good. Set `updated`. **Never rename the directory**; that discards an
indexed URL and everything it earned.

## The editing pass — not optional

A first draft is not the deliverable. Before verifying, run both editing skills
over `src/content/blog/{slug}/index.md`, in this order:

1. **`humanizer`** — 25 catalogued AI tells, vendored from
   github.com/blader/humanizer. The structural ones in its section A are the
   ones that survive every other edit: "not X but Y", one-line dramatic closers,
   staged run-ups, arguing with objections nobody raised.
2. **`seo-voice`** — the house voice, extracted from `src/data/landings/`. It
   overrides the humanizer wherever they conflict, because it is the voice
   sample. In particular it keeps em dashes at the rate the landing copy uses
   them rather than stripping them to zero.

The order matters. Humanizer makes prose neutral; `seo-voice` makes it ours.
Running them the other way round sands off the thing you just added.

One rule governs both: **the edit must not change a single fact.** If a sentence
got sharper by getting less true, revert it.

## Verify before you hand it over

```bash
npm run check    # zod frontmatter + types, then seo/check-links.mjs.
                 # A 161-char description fails here. So does a live page
                 # linking to a post that is not live yet.
npm run build    # catches broken image paths and route collisions
```

Then confirm by hand:
- description ≤ 160 characters
- slug not in `RESERVED_SLUGS` (`src/lib/blog.ts`) and not an existing directory
- every internal link points at a directory that exists
- no invented facts

Commit on a branch, one commit per post:

```bash
git checkout -b content/{slug}
git add src/content/blog/{slug} {any edited posts}
git commit    # subject: "content: {title}"
```

Do not merge and do not push to `main`.

## Hand back — the draft goes IN the Notion page

**Approval happens in Notion, so the text has to be readable in Notion.** A row
that says "draft is on branch X" is not reviewable: it asks the approver to
clone a repo or start a dev server to do the one job the board exists for. Do
not do that to them.

`notion-update-page` with `insert_content` at `{"type":"start"}`, so the draft
sits above the brief. Include:

- A short header: word count, the file path and branch that remain the source
  of truth, and a line saying that if they edit in Notion they should say so and
  you will sync it back.
- The final title, the meta description **with its character count** (`141/160`),
  and the URL. For a Refresh, say explicitly that the URL is unchanged.
- The full body.

Two adjustments, because Notion is not the site:

- **Demote the headings one level** — `##` in the post becomes `###` here, so
  they sit under the "Draft v1" header rather than competing with it.
- **Internal links do not resolve in Notion.** Render the anchor text in bold
  instead of linking it, and list the real targets in one italic line at the
  end. A Notion page full of dead `/slug/` links reads like a broken draft.
- An image referenced as `./01.webp` will not render. Replace it with an italic
  note saying where it sits and what its alt text is.

**Re-syncing a draft that is already in the card? Fetch the card first.**
People edit the draft in Notion during review — that is what the card is for.
Before replacing it, `notion-fetch` the page and compare its draft text with the
version you last posted. Anything that differs is a human edit: **merge it into
the repo file first**, commit it as its own commit, and only then rebuild the
card from the file. Say in the card which edits you merged. Overwriting a
reviewer's edit with your own older text is the worst thing this stage can do,
and it happened once already: a reviewer removed a client example in the card
while the editing pass was running on the repo copy.

Rebuild with `replace_content` rather than sentence-level `update_content`.
Notion normalises text slightly (quotes, spacing, table markup), so patching
sentence by sentence fails on the first mismatch and the whole batch is
rejected. When rebuilding, keep the original brief below the draft verbatim.

Then set `Stage` to `Content review` and add a second block with anything
needing a human decision — a number you would not invent, a claim you could not
verify, a tone call that is theirs to make. Be specific about what you need
from them; "please review" wastes the round trip.

Finally report: what you wrote, and that it is waiting on a read **in Notion**.

Board: https://app.notion.com/p/7fab09d9d487475590ce483e8f2979a6
