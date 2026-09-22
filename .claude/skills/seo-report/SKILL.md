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

## AI visibility

Search is splitting: some buyers ask Google, some ask an assistant. Check both.

**1. The recommendation prompt.** Re-run this **verbatim** every month, because a
changed prompt is a changed test:

```
ai_optimization_llm_response
  llm_type: chat_gpt, model_name: gpt-5.4, web_search: true
  user_prompt: "I run a small business and want to hire an agency to build our
  Airtable and n8n automations. Which agencies should I consider? Name specific
  companies and their websites."
```

Record whether Automatic Nation is named, who else is, and **what each
recommendation was sourced from**. On 22 Sep 2026 it named 8 agencies, all of
them from ecosystem.airtable.com or experts.n8n.io, and cited no blog post.
Add any new agency it names to the Competitors table.

**2. Citation share.** `ai_opt_llm_ment_agg_metrics` for automaticnation.com and
the top competitors, and `ai_opt_llm_ment_top_domains` for `airtable` and `n8n`,
to see which domains get cited on the informational questions.

Two facts from the first run that shape what is worth doing:

- On Google's AI answers for n8n, **YouTube is 59% of all citations** (28,059 of
  47,417), then Reddit, then n8n.io. Blogs barely feature.
- On ChatGPT for Airtable, citations go to Reddit, airtable.com and Wikipedia;
  among non-vendor sites only **softr.io** appears at any scale.

So do not report AI visibility as something blog posts alone can fix. Directory
listings win the hiring question; YouTube and Reddit win the informational ones.
Say that plainly when the numbers say it.

**What this does not prove:** one prompt, one model, one day. Answers vary run to
run. Report it as direction, never as a ranking, and never claim a booked call
came from an AI answer without attribution that shows it.

## Judge the strategies

Every Strategies row (`collection://e3055eb4-6d92-43ce-91f4-c1b1d47b9061`) with
`Stage` `Running` or `Measuring` gets a verdict pass:

- Measure its `Primary metric` only. The metric was chosen before the test on
  purpose; switching to whichever number moved is how a lost test gets reported
  as a win.
- Write the current number into `Result`, dated, against the `Baseline`.
- Stage moves you may make: `Running` → `Measuring` once all its content is
  live; `Measuring` → `Won`, `Lost` or `Inconclusive` once the `Test window`
  ends. SEO needs 6 to 8 weeks after publishing, so never call a verdict early.
  You never move anything to `Approved` or `Rejected`; those are human calls.
- A verdict requires `Learnings`: what we now believe that we did not before.
- If the metric cannot be measured (for example booked calls, with no per-post
  attribution), say so in `Result` rather than substituting a proxy.

Then look forward: if the numbers show an opportunity no strategy covers, create
it as a new row at `Stage = Idea` (see "Proposing new strategies" in
`seo-ideas`). List the `Idea` rows waiting on a human, sorted by ICE score, at
the end of the report so they don't sit unreviewed.

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
