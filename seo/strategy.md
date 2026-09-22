# Editorial strategy

The standing decisions behind every idea and every draft. The skills in
`.claude/skills/seo-*` read this file; when strategy changes, change it **here**
and the four stages follow. Numbers below are from `baseline-2026-09-21.md`.

## What the site sells

An automation and integrations agency. Airtable, n8n, Claude, and glue between
900+ apps. Fixed scope, fixed price, first system live in under four weeks. The
conversion event is a booked call at `/book-a-call/` — nothing else counts.

Three buyers, taken verbatim from the home page, because a post that speaks to
none of them is a post that ranks and earns nothing:

- **Ops teams** copy-pasting between 5+ tools daily. They know the bottleneck.
- **Founders** whose team burns >10 hrs/week on manual work.
- **Power users** who outgrew Zapier or their own DIY Airtable base.

## The problem the numbers describe

61 posts. 257 ranked keywords. **Zero in the top 3, six in positions 4–10.**
The mass of the corpus sits at 21–70 — written, indexed, and invisible.

That is not a volume problem, and publishing three more posts a week of the
same kind will not fix it. It is a **match** problem in two parts:

1. **The head terms are not winnable.** `airtable templates`, `airtable
   database`, `what is airtable` — those SERPs are owned by airtable.com and by
   SaaS blogs with thousands of referring domains. A page ranking #29 there is
   not three improvements away from #3.
2. **The corpus is broad and thin.** Generic titles (`best crm for small
   business`) against generic competitors, with nothing on the page that only
   this agency could have written.

So the strategy is the opposite of the instinct:

> **Win narrow SERPs with pages only an agency that has shipped 1,500 workflows
> could write, and rescue the pages already within reach.**

## Three rules that decide everything

**1. Winnability before volume.** A keyword qualifies when KD ≤ 25 **and** the
first page contains at least two results that are not a major SaaS vendor's own
docs or a DR-70+ publisher. A 90/month keyword this site can own beats a
5,000/month keyword it cannot. Check the live SERP; do not trust KD alone.

**2. Every post carries something only we have.** A real base structure, a real
formula, a real automation recipe, a screenshot of the thing working, a number
from a real build. If a post could have been written by someone who has never
built the thing, it is not worth publishing here — that is the entire
difference between this blog and the ten competing pages.

**3. One page, one primary keyword.** Two posts aimed at the same term split
their own link equity and neither wins. Before proposing, check `keyword-map.tsv`
for a page that already owns it; if one exists, the answer is a Refresh, not a
new post.

## Refresh vs new post

The mix is **~2 new + 1 refresh per week**.

A **Refresh** is the higher-expected-value move on this domain today, because
positions 9–30 are the only place where a page is one honest improvement away
from traffic. Refresh candidates, from the baseline:

| Keyword | Vol | Pos | Page |
|---|---|---|---|
| airtable templates | 590 | 16 | `/airtable-templates-why-to-use-them-where-to-find-them/` |
| airtable rollup | 90 | 11 | `/airtables-rollup-field-a-quick-guide/` |
| airtable automation limits | 70 | 9 | `/airtable-automation-limits-what-you-need-to-know/` |
| asana vs airtable | 390 | 25 | `/asana-vs-airtable/` |
| airtable interfaces examples | 110 | 26 | `/best-practices-for-building-airtable-interfaces/` |
| how to download airtable to excel | 70 | 13 | `/how-to-export-airtable-to-excel/` |

**A Refresh never changes the slug.** The directory name is the live URL
(`src/content.config.ts` explains why). Rewriting the body and re-dating the
post is the whole move; renaming the folder silently discards an indexed URL
and everything it earned.

A Refresh sets `updated:` to today and **leaves `published:` alone**. The post
did not come into existence today.

## Where the audience actually is

Measured 22 Sep 2026, and it qualifies rule 1 rather than replacing it.

- Asked which agency to hire for Airtable and n8n, ChatGPT named 8 agencies and
  **every one came from the Airtable or n8n partner directory**. No blog post was
  cited. A post cannot win that question; a directory listing can.
- On Google's AI answers about n8n, **YouTube carries 59% of citations**, then
  Reddit, then n8n.io.
- On ChatGPT about Airtable, citations go to Reddit, airtable.com and Wikipedia.
  The only non-vendor site cited at scale is softr.io.

This does not change what we write, it bounds what writing can achieve.
Commercial "who should I hire" intent is won in directories. Informational
intent increasingly resolves inside an AI answer that cites video and forums.
The blog still earns classic organic clicks, which is why it exists, but do not
promise it will move AI visibility on its own.

## What not to write

- **Anything about Airtable's own pricing, plans, or limits as the main
  subject.** Those change without notice, the page goes stale within a quarter,
  and airtable.com wins the SERP anyway. (The existing pricing post stays; it is
  the top traffic page. It just does not get siblings.)
- **Listicles with no first-hand basis** — "10 best X tools" where we have used
  two of them. This is most of what is stuck at position 40 today.
- **Anything already owned by a page in `keyword-map.tsv`.** See rule 3.
- **News and launches.** No newsroom, no ability to be first, no compounding.

## Voice

Read three existing posts before drafting; the corpus is the specification.
In short: second person, plain sentences, concrete nouns. Explain the mechanism,
not the category. No "in today's fast-paced business landscape", no "unlock the
power of", no stacked rhetorical questions. **No em dashes at all** (enforced by
`seo/check-copy.mjs`). Where a step is genuinely fiddly, say so.

Spanish is not published. The site is English-only.

## The CTA

One per post, after the first real payoff and never in the opening, plus the
`PostCta` component the template already renders. Link `/book-a-call/` — this
site's own page, never the cal.com URL (see CLAUDE.md, "Settled").

## Internal linking

Two to four links per post, to posts that are genuinely adjacent, written as
root-relative paths with a trailing slash: `/airtable-field-types-a-friendly-guide-to-unlock-the-power-of-your-data/`.
This is the one lever that is fully under our control and it is the cheapest way
to move a page from 25 to 15. When publishing a new post, also **add a link to
it from two existing posts** — a new page with no internal links is a page
Google reaches last and trusts least.
