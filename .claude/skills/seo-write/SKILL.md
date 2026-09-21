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

**Voice:** second person, plain sentences, concrete nouns. Banned openers:
"In today's fast-paced business landscape", "Have you ever wondered", "unlock
the power of", "game-changer" (already overused in this corpus), "delve",
"navigate the complexities of". Do not open with a definition of a category the
reader already knows — they searched for it.

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

## Hand back

Set the Notion row to `Content review`, and add a comment on the page with the
branch name, the word count, and anything needing a human decision (a missing
real number, a claim you would not make up). Then report: what you wrote, where
it is, and that it is waiting on a read.

Board: https://app.notion.com/p/7fab09d9d487475590ce483e8f2979a6
