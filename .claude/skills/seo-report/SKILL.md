---
name: seo-report
description: Measure how automaticnation.com is performing in search against the recorded baseline — rankings, traffic, which posts moved, which stalled — and recommend what the next batch should target. Use when asked how the site or the blog is doing in SEO, for a monthly or weekly SEO report, or "run the SEO report".
---

# Measure

Answer one question: **is this working, and what should change?** This is what
feeds the next run of `seo-ideas` and what closes out scheduled rows.

## Compare against the recorded baseline

Read the most recent `seo/baseline-*.md` and `seo/keyword-map.tsv`. Every number
you report is a delta against those files, never a figure floating on its own —
"257 keywords" means nothing; "257 → 291, +34" is the report.

Pull today's numbers:

- `dataforseo_labs_google_domain_rank_overview` — keywords, ETV, position bands
- `dataforseo_labs_google_relevant_pages` — traffic per page
- `dataforseo_labs_google_ranked_keywords` (limit 300) — the full keyword set

The keyword pull exceeds the response limit and is written to a file. **Do not
read it in chunks** — aggregate it with `jq`, the same way `keyword-map.tsv` was
built, and say in the report that the figures are computed from the complete
file rather than a sampled read.

Regenerate the map, keeping the old one so movement is visible:

```bash
cp seo/keyword-map.tsv seo/keyword-map.$(date +%Y-%m-%d).tsv
# then rebuild seo/keyword-map.tsv from the new pull
join -t$'\t' -j1 <(sort old) <(sort new)   # or a small python diff
```

## Report

Lead with the answer, not the methodology.

1. **Did it move?** Keywords, ETV, and the position bands, each as `was → now`.
   The top-3 count is the headline number for this site.
2. **Per published post.** Every post published since the baseline: its
   keywords, best position, ETV. A post 8+ weeks old with no keywords in the
   top 50 did not work — say so plainly and say what you think went wrong.
   Refreshes are the clearest signal available, because the before is known.
3. **New striking distance.** Anything that entered 4–20 since last time; those
   are the next refresh candidates.
4. **What slipped.** Rankings that fell out of the top 30.
5. **What to do next**, concretely, as input to the next `seo-ideas` run.

Be honest about lag: nothing published inside 6–8 weeks has had time to rank,
and reporting early movement as success teaches the wrong lesson. Say "too
early to tell" when it is.

## Judge the strategies

Every row in the Strategies table
(`collection://e3055eb4-6d92-43ce-91f4-c1b1d47b9061`) with Status `Running` or
`Measuring` gets a verdict pass:

- Measure its `Primary metric` only. The metric was chosen before the test on
  purpose; switching to whichever number moved is how a lost test gets reported
  as a win.
- Write the current number into `Result`, dated, against the `Baseline`.
- Status moves: `Running` → `Measuring` once all its content is live;
  `Measuring` → `Won`, `Lost` or `Inconclusive` once the `Test window` ends.
  SEO needs 6 to 8 weeks after publishing, so do not call a verdict earlier.
- A verdict requires `Learnings`: what we now believe that we did not before.
- If a strategy's metric cannot be measured (for example booked calls, with no
  per-post attribution), say so in `Result` rather than substituting a proxy.

Recommend promotions from Backlog by ICE score, but leave the promoting to a
human.

## Sweep the board

Close out rows whose date has passed:

```
query: SELECT url,"Title","Slug","date:Publish date:start" FROM "collection://2baeb42e-299b-4bde-a891-9972a2d7544b" WHERE "Stage" = 'Scheduled'
```

For each whose date is past, check `https://automaticnation.com/{slug}/`
actually answers, then set `Stage = Published` and `Live URL`. A scheduled row
whose date has passed but whose URL 404s is a **failed publication** — most
likely the daily cron is disabled, which GitHub does silently after 60 days
without commits. Report it loudly; it means the whole schedule has stopped.

## Write it down

Append a dated section to `seo/performance-log.md` (create it if absent) —
short, one block per run, so trend is readable without re-querying an API. When
a full quarter has passed, write a fresh `seo/baseline-{date}.md` and measure
against that from then on.

If the user asks for something shareable, offer a published artifact rather than
a wall of terminal text.

Board: https://app.notion.com/p/7fab09d9d487475590ce483e8f2979a6
