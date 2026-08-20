/**
 * Hand-written alt text, keyed by `<slug>/<NN>` (and `<slug>/hero`).
 *
 * WordPress shipped 94 of its 148 media items with empty alt_text, so most of
 * the migrated images arrive without any. This file is the human answer, and it
 * is READ ON EVERY RUN and never written to — which is what makes re-running the
 * migration safe. Without it, a re-run after a conversion fix would silently
 * destroy the whole review pass.
 *
 * Write what the image SHOWS, for someone who cannot see it. An empty string is
 * a legitimate answer for a purely decorative image — better than a generated
 * pseudo-caption like "screenshot of Airtable", which reads as noise and cannot
 * be skipped.
 *
 * All 55 images from out/alt-todo.tsv are now answered. The empty ones below are
 * a DECISION, not an omission: see the block comment above them.
 */
export const ALT_TEXT = {
  // ── Body screenshots: informative, so they get real descriptions ───────
  "a-guide-to-more-accurate-date-differences-in-airtable/01": "Reference table pairing each unit specifier with its abbreviation: milliseconds is ms, seconds is s, minutes is m, hours is h, days is d, weeks is w, months is a capital M, quarters is a capital Q and years is y.",
  "a-guide-to-more-accurate-date-differences-in-airtable/02": "The Formatting tab of a Months (decimal) formula field, with Decimal places set to 2 so the result keeps two decimals instead of rounding to a whole month.",
  "airtable-revision-history/01": "The base header with the Data tab selected, alongside Automations, Interfaces and Forms.",
  "airtable-revision-history/02": "A grid row with the expand-record button highlighted \u2014 the arrows that appear on hover, just left of the record name.",
  "airtable-revision-history/03": "An expanded record with the activity dropdown open, listing All activity, Revision history, All comments, Record comments, Comments on attachments and Comments with attachments, with Revision history ticked.",
  "airtable-revision-history/04": "The revision history panel of an expanded record, showing a two-week retention notice and two edits to the Name field, the most recent replacing Test Example with Test Example 2.",
  "airtables-ai-field-a-quick-guide/03": "A Link to Clients field with 'Use AI to show top matches when selecting a record' switched on, which reveals field pickers for both the Contacts and the Clients table.",
  "airtables-ai-field-a-quick-guide/04": "A Long text field with 'Generate values with AI' switched on, offering a choice between starting from a template and starting from scratch.",
  "airtables-count-field-how-to-use-it-and-why-its-a-game-changer/01": "A Count field named Complete & High Priority Tasks, counting linked Tasks records filtered to those where Status is Complete and Priority is High.",
  "airtables-grouping-feature-a-quick-guide/01": "The Group by panel with two levels configured, Status and then Assignee, each ordered first to last.",
  "airtables-rollup-field-a-quick-guide/01": "The add-field menu in a Projects table with 'roll' typed into the search box and the Rollup field type highlighted in the results.",
  "airtables-rollup-field-a-quick-guide/02": "The rollup configuration with the Tasks table chosen as the rollup source.",
  "airtables-rollup-field-a-quick-guide/03": "The rollup configuration with Task Duration in hours chosen as the field to roll up.",
  "airtables-rollup-field-a-quick-guide/04": "The rollup configuration with SUM(values) entered as the aggregation formula.",
  "airtables-rollup-field-a-quick-guide/05": "The rollup configuration with record conditions switched on, limiting the rollup to linked tasks whose Status is Complete.",
  "airtables-rollup-field-a-quick-guide/06": "The Tasks table showing three completed tasks linked to projects, with durations of 15, 1 and 5 hours.",
  "airtables-rollup-field-a-quick-guide/07": "The Projects table with the finished rollup column, totalling 15 hours for Project A, 6 for Project B and 0 for Project C.",
  "enhancing-flexibility-in-airtable-with-autopopulating-date-fields/01": "A Date field configuration with the default option switched on and set to Current date.",
  "how-marketing-agencies-can-leverage-airtable-to-streamline-their-business/01": "Isometric illustration of a laptop ringed by marketing tools: a megaphone, an envelope, a clock, a magnifying glass, chat bubbles and a pencil.",

  // ── Heroes that carry information beyond the title ────────────────────
  "enhancing-airtable-with-custom-features-a-practical-guide/hero": "Video thumbnail: a browser showing an Airtable interface page of colour-coded record panels, with the presenter's webcam inset in the corner.",
  "what-automation-tool-suits-your-business/hero": "Title card carrying the logos of the three tools the post compares: Zapier, Make and n8n.",

  // ── Title-card heroes: deliberately empty ─────────────────────────────
  //
  // These 34 heroes are title cards — the post title set in large type over a
  // decorative illustration. `[slug].astro` renders `<h1>{title}</h1>` immediately
  // above the hero image, so describing the card would make a screen reader
  // announce the same sentence twice in a row, with no way to skip the second.
  //
  // Empty alt is the correct answer for an image whose only content is already
  // adjacent text. They are listed rather than omitted so the next person can
  // see the decision was made, and so out/alt-todo.tsv comes back clean.
  "agency-project-management-software/hero": "",
  "airtable-automation-delete-record/hero": "",
  "airtable-automation-limits-what-you-need-to-know/hero": "",
  "airtable-benefits-why-this-tool-is-a-game-changer/hero": "",
  "airtable-database-ultimate-guide-to-smarter-organization/hero": "",
  "airtable-deep-match-ai-powered-automatic-record-linking/hero": "",
  "airtable-field-types-a-friendly-guide-to-unlock-the-power-of-your-data/hero": "",
  "airtable-login-troubles-quick-fixes-to-access-your-account/hero": "",
  "airtable-pricing-compare-plans-and-choose-the-best-one/hero": "",
  "airtables-ai-field-a-quick-guide/hero": "",
  "airtables-count-field-how-to-use-it-and-why-its-a-game-changer/hero": "",
  "airtables-grouping-feature-a-quick-guide/hero": "",
  "airtables-lookup-field-a-quick-guide/hero": "",
  "airtables-rollup-field-a-quick-guide/hero": "",
  "airtables-views-a-quick-guide/hero": "",
  "asana-airtable-integration-streamline-task-management-easily/hero": "",
  "best-client-portal-software/hero": "",
  "best-crm-for-small-business/hero": "",
  "best-database-software-for-small-business/hero": "",
  "best-erp-software-for-small-business/hero": "",
  "best-free-crm-software-for-small-business/hero": "",
  "best-practices-for-building-airtable-interfaces/hero": "",
  "fillout-forms-vs-airtable-forms-which-one-should-you-use-with-airtable/hero": "",
  "how-to-build-a-crm-system/hero": "",
  "how-to-create-a-form-in-airtable-4-easy-methods/hero": "",
  "how-to-export-data-from-airtable-a-simple-step-by-step-guide/hero": "",
  "how-to-improve-operational-efficiency/hero": "",
  "how-to-manage-multiple-projects-simultaneously/hero": "",
  "how-to-use-airtable-step-by-step-guide-for-beginners/hero": "",
  "is-airtable-a-crm-key-insights-for-your-business/hero": "",
  "smb-marketing-automation-work-smarter-not-harder/hero": "",
  "streamline-procurement-like-a-pro-how-airtable-transforms-purchase-workflows/hero": "",
  "what-is-a-relational-database/hero": "",
  "what-is-workflow-automation/hero": "",
};
