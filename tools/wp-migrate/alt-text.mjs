/**
 * Hand-written alt text, keyed by `<slug>/<NN>` (and `<slug>/hero`).
 *
 * WordPress shipped 94 of its 148 media items with empty alt_text, so most of
 * the migrated images arrive without any. This file is the human answer, and it
 * is READ ON EVERY RUN and never written to — which is what makes re-running the
 * migration safe. Without it, a re-run after a conversion fix would silently
 * destroy the whole review pass.
 *
 * Anything missing here stays empty in the markdown; see out/alt-todo.tsv for
 * the outstanding list and the machine-derived suggestion for each one.
 *
 * Write what the image SHOWS, for someone who cannot see it. An empty string is
 * a legitimate answer for a purely decorative image — better than a generated
 * pseudo-caption like "screenshot of Airtable", which reads as noise and cannot
 * be skipped.
 */
export const ALT_TEXT = {
  // 'airtable-revision-history/01': 'The Airtable data layer with the Data tab selected',
};
