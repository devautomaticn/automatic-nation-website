/**
 * Copy for the n8n agency landing (/lp/n8n-agency/).
 *
 * Target keyword: "n8n agency" (720/mo US, CPC ~$6, DataForSEO 2026-11-09),
 * with "n8n consultant" / "n8n expert" as secondaries. Plan:
 * Internal-Work/Marketing/an-conversion-strategy-2026-10.md, landing #1.
 *
 * Every case below is one already published on the blog (/what-is-n8n-used-for/)
 * or the home page. Don't add a metric here that a client hasn't confirmed.
 */
import type { Feature } from '../../components/sections/FeatureGrid.astro';
import type { UseCase } from '../../components/sections/UseCases.astro';
import type { FaqItem } from '../../components/sections/Faq.astro';

export const seo = {
  title: 'n8n Agency — Automatic Nation',
  description:
    'An n8n agency for workflows that run in production: built, hosted and monitored, with alerts when something fails. 1,500+ workflows shipped. Fixed scope, fixed price.',
};

export const hero = {
  eyebrow: 'n8n agency',
  title: 'n8n workflows that tell you when they stop.',
  sub: 'We design, build and run n8n workflows that connect the systems your team re-types data between: Airtable, QuickBooks, your CRM, your inbox, WhatsApp.',
  sub2: 'First system live in under 4 weeks. Fixed scope, fixed price.',
  ctaLabel: 'Book an n8n call',
  ctaSecondaryLabel: 'See the process',
};

export const symptoms = {
  eyebrow: 'Sound familiar?',
  title: 'Getting a workflow to run once is the easy part.',
  items: [
    {
      eyebrow: 'Silent failures',
      title: 'A token expired five weeks ago',
      body: 'One node started returning an error and nothing told anyone. Orders kept arriving in the shop and stopped arriving in accounting, and the first person to notice was whoever closed the books.',
    },
    {
      eyebrow: 'Inherited workflows',
      title: 'Nobody knows what the big one does',
      body: 'Someone built it, someone left. It has forty nodes, no error workflow and no run log, and the team is afraid to open it.',
    },
    {
      eyebrow: 'Outgrown Zapier',
      title: 'Paying per task for logic that needs branches',
      body: 'Lookups, loops, retries and an API the built-in app does not cover. n8n handles all of it, and self-hosted it has no per-task bill.',
    },
  ] satisfies Feature[],
};

export const work = {
  eyebrow: 'What we have built with n8n',
  title: 'n8n carries the data. The work is deciding what it should do.',
  linkLabel: 'Talk through your workflow',
  items: [
    {
      stack: ['AIRTABLE', 'N8N', 'QUICKBOOKS'],
      title: 'Orders into invoices and purchase orders',
      body: 'An order closed in Airtable becomes a QuickBooks invoice or PO, with every class and department translated to its QuickBooks ID before anything is posted.',
      metric: 'Replaced re-keying every order by hand',
    },
    {
      stack: ['META', 'CLAUDE', 'AIRTABLE', 'N8N'],
      title: 'WhatsApp agent that answers from your data',
      body: 'n8n checks who the sender is against Airtable and only then lets Claude reply from that customer’s own records. The team can watch every thread and take over.',
      metric: 'Customer verified before a word is sent',
    },
    {
      stack: ['AIRTABLE', 'CLAUDE', 'N8N'],
      title: 'Lead database migrated & deduplicated',
      body: 'Years of leads from spreadsheets and an old CRM, run through matching rules in batches and consolidated into one enriched base.',
      metric: '5,000 leads consolidated and deduplicated',
    },
    {
      stack: ['CHROME', 'AIRTABLE', 'N8N'],
      title: 'Product capture from any vendor site',
      body: 'A browser extension clips a product and n8n normalises it before it reaches the project. A price that will not parse is flagged, never written as a blank.',
      metric: 'One click from vendor page to project',
    },
  ] satisfies UseCase[],
};

export const strip = {
  text: 'Have n8n workflows nobody has looked at since launch? That is a good first call.',
  ctaLabel: 'Book a call',
};

export const faq = {
  eyebrow: 'Questions',
  title: 'What people ask before hiring an n8n agency.',
  items: [
    {
      q: 'n8n Cloud or self-hosted?',
      a: 'Whichever is cheaper for your volume once you count the hours. Self-hosted has no licence fee, but someone has to run, back up and upgrade the server. We work out both columns with you and say so when the answer is the cheapest Cloud plan.',
    },
    {
      q: 'Can you take over workflows someone else built?',
      a: 'Yes, and it is a lot of our n8n work. We read what exists, add the error handling and run log it is missing, and rebuild only what is actually broken.',
    },
    {
      q: 'Who owns the workflows and the instance?',
      a: 'You do: the n8n instance, the credentials, the workflows and the documentation, under your own accounts. A retainer for changes and monitoring is optional.',
    },
    {
      q: 'Is it worth hiring an agency for one workflow?',
      a: 'Often not. If the job is one workflow with two steps, a template, Zapier or a freelancer is the better fit, and we will tell you so on the call.',
    },
  ] satisfies FaqItem[],
};

export const closing = {
  eyebrow: 'Ready when you are',
  title: 'Walk us through the process your team re-types.',
  body: "We'll tell you what we'd build in n8n first, what it costs and how long it takes, in a fixed-scope proposal you can say yes or no to.",
  ctaLabel: 'Book an n8n call',
  note: 'Fixed price · Written scope · No obligation',
};
