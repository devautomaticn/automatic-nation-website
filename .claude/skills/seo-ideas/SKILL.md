---
name: seo-ideas
description: Stage 1 of the SEO content pipeline. Research winnable keywords with DataForSEO and propose a batch of content ideas as Idea rows in the Notion board, each with a brief, for a human to approve. Use when asked to generate content ideas, plan the week's or month's posts, find keyword opportunities, or "run the ideas stage".
---

# Stage 1 — generate ideas

Produce a batch of **specific, briefed, winnable** content ideas and write them
to Notion as `Stage = Idea`. A human approves them in Notion; you never approve
your own ideas.

Default batch: **one week = 3 ideas (2 New post + 1 Refresh)**. One month = 12
(8 + 4). Ask which if it was not said.

## Read first, every run

1. `seo/strategy.md` — the rules. Rules 1–3 are binding, not advisory.
2. `seo/keyword-map.tsv` — what the site already ranks for and which URL owns
   it. **Every proposal is checked against this**; a keyword already owned by a
   page becomes a Refresh of that page or is dropped.
3. The most recent `seo/baseline-*.md`.
4. The board, so you do not re-propose something already on it *or already
   rejected*:

```
mcp__claude_ai_Notion__notion-query-data-sources
  mode: sql
  data_source_urls: ["collection://2baeb42e-299b-4bde-a891-9972a2d7544b"]
  query: SELECT "Title","Stage","Target keyword","Slug" FROM "collection://2baeb42e-299b-4bde-a891-9972a2d7544b"
```

A `Rejected` row is a permanent no. Never propose that keyword again.

## Start from the Strategies table

Ideas are generated **from strategies**, not from a blank page. Every idea exists
to test a bet, and the bet decides what gets researched.

```
mcp__claude_ai_Notion__notion-query-data-sources
  mode: sql
  data_source_urls: ["collection://e3055eb4-6d92-43ce-91f4-c1b1d47b9061"]
  query: SELECT url,"Name","Type","Hypothesis","Primary metric","Target","Channel" FROM "collection://e3055eb4-6d92-43ce-91f4-c1b1d47b9061" WHERE "Status" IN ('Planned','Running')
```

- Split the batch across the Planned and Running rows whose `Channel` includes
  SEO. A Running strategy with fewer than its intended posts gets priority.
- Read each strategy's hypothesis before researching: an idea that would not
  move that strategy's `Primary metric` does not belong in its batch.
- An idea that fits no strategy is still allowed if the data is strong, but say
  so in its brief, and suggest a new strategy row rather than creating one. The
  table is the team's to shape; propose, don't add.
- Backlog rows are **not** generated from. They wait for a human to promote them.

When you write each idea to the board, set its `Strategy` relation to the
strategy page URL (`"Strategy": "[\"<url>\"]"`). The link is two-way, so the
strategy row lists every post made for it, and `/seo-report` can judge the
strategy by the posts it produced.

Strategies table: https://app.notion.com/p/daecab2ed9274dd2a5b9f290d31c96f6
Competitors table: https://app.notion.com/p/76324edf739143a28ac98722e15c9d67
(read the rows linked to a strategy before researching it)

## Research

Work from the site's own data outward, not from a blank page.

**For Refresh candidates** — the cheapest wins, and `keyword-map.tsv` already
holds them. Filter it: position 8–30, volume ≥ 40, intent commercial or
informational. Those rows are the shortlist; pick the one where the gap between
what the page says and what the SERP rewards is largest.

**For New post candidates**, use DataForSEO:

- `dataforseo_labs_google_keyword_ideas` / `..._keyword_suggestions` — seed with
  terms from the service (`airtable consultant`, `n8n workflow`, `airtable
  automation`, a real use case from the home page) and filter
  `keyword_info.search_volume > 30`, `keyword_properties.keyword_difficulty <= 25`.
- `dataforseo_labs_search_intent` — drop navigational terms. They are people
  looking for Airtable, not for us.
- `serp_organic_live_advanced` — **required before proposing.** Rule 1 is a
  claim about the live first page, and KD alone does not test it. Look at the
  ten results: if eight are vendor docs, Reddit, and DR-80 publishers, the
  keyword fails no matter what KD says.

Responses are large. Pipe them through `jq` to a small table instead of reading
them whole; if a tool result is written to a file because it exceeded the
limit, aggregate that file with `jq` rather than reading it in chunks.

## Score

```
score = (volume / 10) × intent_weight × position_bonus ÷ max(KD, 5)
```

`intent_weight`: transactional 3.0 · commercial 2.5 · informational 1.0 ·
navigational 0 (drop it). `position_bonus`: 3.0 if the site already ranks 8–20
for it, 2.0 if 21–30, 1.0 otherwise. Round to one decimal.

The score orders the batch. It does not decide it — a strong idea that fails
rule 2 ("only we could have written this") is dropped whatever it scores.

## Write a brief for each idea

The brief is what stage 3 writes from, so a vague brief produces a generic post
and wastes the slot. Each Notion page body gets:

```markdown
## Why this one
The opportunity in two or three sentences: what the SERP looks like now, what
is missing from it, and why this site can take it.

## Target
- Primary keyword: `x` — {volume}/mo, KD {kd}, currently position {n or "not ranking"}
- Secondary: `y`, `z`
- Intent: {informational | commercial | transactional}

## What the page must do
The reader's actual question, and what they should be able to DO after reading.

## Angle only we have
The specific first-hand thing — the base structure, the formula, the automation
recipe, the number from a real build. Name it concretely. "Our experience" is
not an angle; "the three-table structure we use for client inventory bases,
with the rollup that makes stock counts self-maintaining" is.

## Outline
- H2 …
- H2 …

## Must beat
The top 3 URLs today, and the one thing each is missing.

## Internal links
- Two to four existing posts, as root-relative paths with trailing slashes.
- Two existing posts that should gain a link TO this one once it is live.
```

## Write to Notion

`mcp__claude_ai_Notion__notion-create-pages`, parent
`{"type":"data_source_id","data_source_id":"2baeb42e-299b-4bde-a891-9972a2d7544b"}`,
one page per idea, `content` = the brief above.

Properties: `Title`, `Stage: "Idea"`, `Type`, `Target keyword`, `Volume`, `KD`,
`Current position`, `Intent`, `Score`, `Slug`, `Brief` (one line).

**Slug rules.** New post: lowercase, hyphens, no stop-word padding, ideally the
keyword; it must not collide with `RESERVED_SLUGS` in `src/lib/blog.ts` or with
an existing directory in `src/content/blog/` — posts live at the site root, so a
collision is a real conflict, not a nuisance. Refresh: **the existing slug,
unchanged.**

Leave `Publish date` and `Live URL` empty. Stage 4 sets those.

## Report back

A compact table — title, type, keyword, volume, KD, current position, score —
and the board link. Then stop. Say plainly that nothing proceeds until a human
sets rows to `Approved`, and that setting a row to `Rejected` blocks that
keyword permanently.

Board: https://app.notion.com/p/7fab09d9d487475590ce483e8f2979a6
