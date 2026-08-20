/**
 * Copy for the home page. Structure lives in the .astro file; every string
 * lives here, so a new landing is a copy of this file plus a section list.
 *
 * Typed objects rather than JSON: you get autocomplete, and a missing or
 * misspelled field is a build error instead of an empty <p> on the live site.
 */
import type { Feature } from '../../components/sections/FeatureGrid.astro';
import type { UseCase } from '../../components/sections/UseCases.astro';
import type { FaqItem } from '../../components/sections/Faq.astro';
import type { Piece } from '../../components/deco/TetrominoDeco.astro';

export const seo = {
  title: 'Automatic Nation — Automation & Integrations Agency',
  description:
    'We build custom integrations and automated workflows across Airtable, n8n, and 900+ apps. 50+ workflows shipped. Book a discovery call.',
};

export const hero = {
  sub: 'We build custom integrations and automated workflows across 900+ popular platforms.',
  sub2: 'First system live in under 4 weeks, fixed scope, fixed price.',
  ctaLabel: 'Book a free consultation',
};

export const audience = {
  eyebrow: 'Who this is for',
  title: "This pays off fastest if you're…",
  items: [
    {
      eyebrow: 'Ops teams',
      title: 'Copy-pasting between 5+ tools every day',
      body: "Your team knows the bottleneck. You just haven't had time to fix it. We scope it in a single call and build it in weeks — not quarters.",
    },
    {
      eyebrow: 'Founders',
      title: 'Team burning >10 hours/week on manual work',
      body: "That's a part-time hire you're already paying for in wasted time. We give it back — on a fixed budget, without adding headcount.",
    },
    {
      eyebrow: 'Power users',
      title: 'Outgrown Zapier or your DIY Airtable setup',
      body: "You know the tools. You just don't have time to build the right system from scratch. We pick up where your DIY left off.",
    },
  ] satisfies Feature[],
};

export const useCases = {
  eyebrow: 'What it looks like in practice',
  title: "Real workflows we've built — adapt one or bring your own.",
  linkLabel: "See how we'd build yours",
  items: [
    {
      stack: ['CHROME', 'AIRTABLE', 'N8N'],
      title: 'Product capture from any vendor site',
      body: 'A browser extension that clips a product — vendor, price, image, specs — straight into the studio’s Airtable. No more copy-pasting a spec into a spreadsheet and hoping it lands.',
      metric: 'One click from vendor page to project',
    },
    {
      stack: ['AIRTABLE', 'CLAUDE', 'N8N'],
      title: 'Lead database migrated & enriched',
      body: 'Years of leads scattered across spreadsheets and an old CRM, consolidated into one base — deduplicated, normalized, and enriched with company data so the list is worth working.',
      metric: '5,000 leads consolidated and deduplicated',
    },
    {
      stack: ['GMAIL', 'CLAUDE', 'AIRTABLE'],
      title: 'Inbox agent that files every attachment',
      body: 'One shared inbox receives attachments from every department — vendor invoices, internal documents — reads each one, classifies it, and logs it where it belongs.',
      metric: 'Filed on arrival, not at month-end',
    },
    {
      stack: ['META', 'CLAUDE', 'AIRTABLE', 'N8N'],
      title: 'WhatsApp agent that answers from your data',
      body: 'Customers ask on WhatsApp and the agent answers from Airtable — the same base that verifies who they are before it says anything. Every thread lands in a web console where the team can watch, take over, and tune it.',
      metric: 'Customer verified before a word is sent',
    },
  ] satisfies UseCase[],
  // FILL IN BEFORE LAUNCH
  quote: {
    text: '[CLIENT QUOTE — to be filled in: one sentence on the time or money saved.]',
    name: '[Name]',
    role: '[Role]',
    company: '[Company]',
  },
};

export const process = {
  eyebrow: 'How it works',
  title: 'Four weeks from first call to live system.',
  stat: '50+ workflows shipped · ~22 hrs saved/week · <4 wks first delivery',
};

export const strip = {
  text: "Not sure what's worth automating? That's the first call.",
  ctaLabel: 'Book a call',
};

export const faq = {
  eyebrow: 'Questions',
  title: 'The things people ask before saying yes.',
  items: [
    {
      q: 'What does a project typically cost?',
      // FILL IN BEFORE LAUNCH
      a: 'Pricing is fixed and scoped up front — no hourly billing, no surprises. Most first systems land in the [FILL IN RANGE] range depending on the number of integrations. You get the number before any work starts.',
    },
    {
      q: 'What if we already have something half-built?',
      a: "That's the common case. We audit what exists, keep what works, and rebuild only what's holding you back. You're not paying us to redo your own work.",
    },
    {
      q: 'What happens after launch?',
      a: 'You own everything — the accounts, the workflows, the documentation. A retainer for changes and monitoring is optional, not a lock-in.',
    },
  ] satisfies FaqItem[],
};

export const closing = {
  eyebrow: 'Ready when you are',
  body: "Walk us through your stack. We'll tell you what we'd automate first, what it costs, and how long it takes. No pitch deck — just a fixed-scope proposal you can say yes or no to.",
  ctaLabel: 'Book your discovery call',
  note: 'No obligation · Same-week availability',
};

/**
 * Decoration layout for the closing CTA. Offsets are multiples of the 56px
 * cell so the pieces land on the section's background grid; `color` indexes
 * PALETTE. Negative offsets are exactly one cell, so even the bleed stays on a
 * grid line.
 */
export const closingDeco: { left: Piece[]; right: Piece[] } = {
  left: [
    { shape: 'O', color: 1, x: -56, y: 0 },
    { shape: 'J', color: 4, x: 56, y: 168 },
    { shape: 'S', color: 3, x: -56, y: 336 },
  ],
  right: [
    { shape: 'T', color: 2, x: 56, y: 56 },
    { shape: 'I', color: 0, x: 56, y: 224 },
    { shape: 'O', color: 1, x: 112, y: 504 },
  ],
};
