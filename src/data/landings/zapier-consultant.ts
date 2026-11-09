/**
 * Copy for the Zapier consultant landing (/lp/zapier-consultant/), the
 * "Outgrown Zapier" page.
 *
 * Target keyword: "zapier consultant" (90/mo US, CPC ~$48), secondaries
 * "zapier expert" (70, ~$47) and "zapier alternative" (110, ~$36).
 * DataForSEO 2026-11-09. Plan: Internal-Work/Marketing/an-conversion-strategy-2026-10.md,
 * landing #3.
 *
 * Two claims this page must not make: that we are a certified Zapier
 * partner, or that a specific client moved off Zapier. Neither is on record.
 * The cases are the ones already published on the blog and home page.
 * The pricing comparison is the one in /n8n-review/.
 */
import type { Feature } from '../../components/sections/FeatureGrid.astro';
import type { UseCase } from '../../components/sections/UseCases.astro';
import type { FaqItem } from '../../components/sections/Faq.astro';

export const seo = {
  title: 'Zapier Consultant for Teams That Outgrew It — Automatic Nation',
  description:
    'A Zapier consultant who will tell you which Zaps to keep and which to move. We rebuild the expensive, multi-step ones in n8n, with alerts when they fail. Fixed scope, fixed price.',
};

export const hero = {
  eyebrow: 'Zapier consulting',
  title: 'Outgrown Zapier? Keep the simple Zaps. Move the rest.',
  sub: 'We go through your Zaps, keep the ones Zapier does well, and rebuild the long, branching, expensive ones in n8n, under your own account, with alerts when something fails.',
  sub2: 'First system live in under 4 weeks. Fixed scope, fixed price.',
  ctaLabel: 'Book a Zapier review',
  ctaSecondaryLabel: 'See the process',
};

export const symptoms = {
  eyebrow: 'Sound familiar?',
  title: 'The three signs a Zapier account has outgrown itself.',
  items: [
    {
      eyebrow: 'Cost',
      title: 'The bill grows with every step you add',
      body: 'Zapier counts a task for each action step that runs, so a long Zap multiplies its own cost on every trigger. The Zaps that do the most work are the ones that cost the most to run.',
    },
    {
      eyebrow: 'Logic',
      title: 'Paths, filters and Formatter steps stacked ten deep',
      body: 'Every lookup between two systems became another step. Nobody can say what the Zap does any more without opening it, and nobody wants to.',
    },
    {
      eyebrow: 'Reach',
      title: 'The one API call Zapier does not have',
      body: 'The built-in app covers the common actions. Your process needs the one it does not expose, so a person does that part by hand.',
    },
  ] satisfies Feature[],
};

export const work = {
  eyebrow: 'What we build when Zapier runs out',
  title: 'Multi-step workflows that would cost a fortune in tasks.',
  linkLabel: 'Walk us through your Zaps',
  items: [
    {
      stack: ['AIRTABLE', 'N8N', 'QUICKBOOKS'],
      title: 'Orders into invoices and purchase orders',
      body: 'A dozen lookups per order to translate every class and department into its QuickBooks ID, then a branch to invoice or PO. One run, however many steps.',
      metric: 'Replaced re-keying every order by hand',
    },
    {
      stack: ['META', 'CLAUDE', 'AIRTABLE', 'N8N'],
      title: 'WhatsApp agent that answers from your data',
      body: 'Verify the sender against Airtable, then let Claude reply from that customer’s own records, with a console where the team can take over. Sequence matters, and it runs in order every time.',
      metric: 'Customer verified before a word is sent',
    },
    {
      stack: ['GMAIL', 'CLAUDE', 'AIRTABLE'],
      title: 'Inbox agent that files every attachment',
      body: 'One shared inbox receives invoices and documents from every department. Each one is read, classified and logged where it belongs.',
      metric: 'Filed on arrival, not at month-end',
    },
    {
      stack: ['AIRTABLE', 'CLAUDE', 'N8N'],
      title: 'Lead database migrated & deduplicated',
      body: 'Years of leads from spreadsheets and an old CRM, matched and merged in batches. A one-off job like this is a poor fit for per-task pricing.',
      metric: '5,000 leads consolidated and deduplicated',
    },
  ] satisfies UseCase[],
};

export const strip = {
  text: 'Not sure which of your Zaps are worth moving? That is the first call.',
  ctaLabel: 'Book a call',
};

export const faq = {
  eyebrow: 'Questions',
  title: 'What people ask before moving off Zapier.',
  items: [
    {
      q: 'Do we have to leave Zapier completely?',
      a: 'No, and usually you should not. A two-step Zap that posts a form entry to Slack is exactly what Zapier is good at. We move the long, branching, high-volume ones and leave the rest where they are.',
    },
    {
      q: 'Why n8n and not Make?',
      a: 'n8n bills per run of the whole workflow, not per step, it can call any API directly, and it can be self-hosted under your own account. For the multi-system workflows we build, that makes it the cheaper and more flexible option. If Make fits you better, we will say so.',
    },
    {
      q: 'Will anything stop working while you move it?',
      a: 'No. We build the new workflow alongside the live Zap, test it on real data, and switch over in one step. The Zap stays on until the replacement has proven itself.',
    },
    {
      q: 'Who owns the result?',
      a: 'You do: the n8n instance, the credentials, the workflows and the documentation, under your own accounts. A retainer for changes and monitoring is optional.',
    },
  ] satisfies FaqItem[],
};

export const closing = {
  eyebrow: 'Start with a review',
  title: 'Show us your Zapier account. We will tell you what to move.',
  body: "We look at which Zaps cost the most and break the most, and come back with a fixed-scope proposal for the ones worth moving. If the answer is that Zapier is fine for you, we'll tell you that too.",
  ctaLabel: 'Book a Zapier review',
  note: 'Fixed price · Written scope · No obligation',
};
