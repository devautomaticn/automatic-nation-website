---
name: seo-publish
description: Stage 4 of the SEO content pipeline. Take content-approved posts, assign publish dates, merge them to main so they go live automatically on the scheduled day, and update the Notion board. Use when asked to schedule or publish approved posts, set the publishing calendar, or "run the publish stage".
---

# Stage 4 — schedule and publish

Take drafts a human has read and approved, give each a publish date, and merge
them so the site publishes itself on that date.

## How scheduling actually works here

The site is static Astro on GitHub Pages. A static build cannot hold a post back
on a timer, so two pieces do it together:

1. **`isLive` in `src/lib/blog.ts`** hides any post whose `published` date is in
   the future. All four `getCollection('blog', …)` call sites use it, so a
   future-dated post is absent from its route, the `/blogs/` index, the sitemap
   and the RSS feed. Absent, not a stub — Google must never see a placeholder at
   the URL the real article will occupy.
2. **The daily cron in `.github/workflows/deploy.yml`** (06:15 UTC) rebuilds and
   redeploys. That is the only thing that makes tomorrow arrive. Without it a
   scheduled post waits for the next unrelated push.

So: **merge now, dated later.** Nothing needs to run on the publish day.

## The work

Find what is ready:

```
mcp__claude_ai_Notion__notion-query-data-sources
  mode: sql
  data_source_urls: ["collection://2baeb42e-299b-4bde-a891-9972a2d7544b"]
  query: SELECT url,"Title","Slug","Type","date:Publish date:start" FROM "collection://2baeb42e-299b-4bde-a891-9972a2d7544b" WHERE "Stage" = 'Content review'
```

**Only rows a human moved.** A row still at `Drafting` has not been read by
anyone; do not publish it because the draft looks finished to you.

### Assign dates

Three posts a week, spread — Tuesday, Wednesday, Thursday. Never two on one
day: they compete for the same crawl and the same audience attention, and the
second one wastes the slot. Check what is already scheduled before adding:

```bash
grep -rh '^published:' src/content/blog/*/index.md | sort | tail -10
```

Respect a date already set in the brief. Otherwise take the next free slot.

### Prepare each post

```bash
git checkout main && git pull
git merge --no-ff content/{slug}
```

Then in `src/content/blog/{slug}/index.md`:

- remove `draft: true` (or set it `false`)
- **New post:** set `published:` to the assigned date
- **Refresh:** leave `published:` alone, set `updated:` to the publish date

### Activate the inbound links

The brief names two existing posts that should link **to** this one. `seo-write`
deliberately left them alone, because a live page must never carry a link to a
post that is not live yet.

Add them **only when the post goes live in this same build** — that is, when the
publish date is today or in the past. Edit the two posts named in the brief,
placing the link where it actually belongs in the sentence, not bolted onto the
end.

If the post is dated in the future, **skip this and leave the row `Scheduled`.**
Do it on a later run: sweep for rows that went live since last time and add
their inbound links then. `npm run check` fails loudly if you get this wrong, so
the failure mode is a red build, never a silent 404.

### Verify, then merge

```bash
npm run check    # includes seo/check-links.mjs — fails if a live page links
                 # to a post that is not live in this build
npm run build
```

Then confirm the gate is behaving — this is the step that catches a wrong date:

```bash
ls dist/{slug} 2>/dev/null \
  && echo "LIVE at next deploy" \
  || echo "HELD until $(grep '^published:' src/content/blog/{slug}/index.md)"
```

A post dated in the future **should** report HELD. If it says LIVE and you
meant to schedule it, the date is wrong or already past.

Commit and push to `main`. The push triggers a deploy; the post appears on its
date via the cron.

```bash
git push origin main
```

**Confirm with the user before the push** unless they have already said to go
ahead in this session. Pushing to `main` deploys to the live site.

### Update the board

Set `Publish date` on every row. Set `Stage`:

- **`Scheduled`** if the date is in the future.
- **`Published`** if it went live with this deploy — and set `Live URL` to
  `https://automaticnation.com/{slug}/`.

A `Scheduled` row becomes `Published` on the next run of this skill, or of
`/seo-report`, which sweeps for scheduled rows whose date has passed and checks
the URL actually answers.

## After a post goes live

- Verify the URL returns 200 and its `<title>` and meta description are right.
- Check it is in `https://automaticnation.com/sitemap-0.xml`.
- Submit the URL in Google Search Console. This is manual and worth doing —
  discovery is otherwise days slower.
- Record the publish in the Notion row so the next report can measure from it.

## If something is wrong after publishing

To pull a post back: set `draft: true`, commit, push. It disappears on the next
build. Do **not** delete the directory — the URL is indexed, and a deleted
directory becomes a 404 with no way back to the equity it earned.

Board: https://app.notion.com/p/7fab09d9d487475590ce483e8f2979a6
