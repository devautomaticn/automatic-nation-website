/**
 * Copy for the Airtable consulting landing.
 *
 * This file is the template for every new landing: copy it, rewrite the
 * strings, then pick sections in the matching .astro page. Nothing here is
 * structural — the shapes are enforced by the section components' own types,
 * so a missing field fails the build rather than rendering an empty element.
 */
import type { Feature } from '../../components/sections/FeatureGrid.astro';
import type { UseCase } from '../../components/sections/UseCases.astro';
import type { FaqItem } from '../../components/sections/Faq.astro';

export const seo = {
  title: 'Airtable Consulting — Automatic Nation',
  description:
    'Airtable bases that hold up under real operations: schema design, automations, interfaces, and the integrations that keep them fed. Fixed scope, fixed price.',
};

export const hero = {
  eyebrow: 'Airtable consulting',
  title: 'Your Airtable base outgrew the person who built it.',
  sub: 'We redesign the schema, replace the brittle automations, and connect it to the systems it should have been talking to all along.',
  sub2: 'Audit in a week. Rebuild in three. Fixed scope, fixed price.',
  ctaLabel: 'Book an Airtable audit',
  ctaSecondaryLabel: 'See the process',
};

export const symptoms = {
  eyebrow: 'Sound familiar?',
  title: "The three ways an Airtable base stops scaling.",
  items: [
    {
      eyebrow: 'Schema',
      title: 'Linked records that nobody dares change',
      body: 'Tables grew one column at a time. Now a rename breaks four automations and two interfaces, so nothing gets renamed and the workarounds pile up.',
    },
    {
      eyebrow: 'Automations',
      title: 'Silent failures you find out about from a client',
      body: 'Automation runs cap out, a script times out, and the record just never updates. No alert, no retry — the first signal is someone asking where their order went.',
    },
    {
      eyebrow: 'Integrations',
      title: 'A human being the integration',
      body: 'Someone exports a CSV every morning and pastes it into a base. That person is your integration layer, and they are also your single point of failure.',
    },
  ] satisfies Feature[],
};

export const work = {
  eyebrow: 'What we build',
  title: 'Airtable as the system of record, not the scratch pad.',
  linkLabel: 'Talk through your base',
  items: [
    {
      stack: ['AIRTABLE', 'N8N', 'POSTGRES'],
      title: 'Schema redesign & migration',
      body: 'A normalised base with real linked-record structure, migrated without downtime and without asking your team to re-enter anything.',
      metric: 'Rebuilt in place — no re-entry',
    },
    {
      stack: ['AIRTABLE', 'SLACK', 'SENTRY'],
      title: 'Automations that report their own failures',
      body: 'Every automation gets a retry path and an alert. When something breaks you hear it from Slack, not from a customer.',
      metric: 'Failures surfaced in <1 minute',
    },
    {
      stack: ['AIRTABLE', 'STRIPE', 'HUBSPOT'],
      title: 'Two-way sync with the rest of your stack',
      body: 'Billing, CRM and the base stay in agreement. No nightly export, no reconciliation pass, no CSV.',
      metric: 'CSV exports: 0',
    },
    {
      stack: ['AIRTABLE', 'INTERFACES'],
      title: 'Interfaces your team will actually open',
      body: 'Role-scoped interfaces built around the jobs people do, so nobody needs to understand the schema to file a request.',
      metric: 'Training time: one 20-minute walkthrough',
    },
  ] satisfies UseCase[],
};

export const strip = {
  text: 'Not sure whether it needs a rebuild or a repair? The audit tells you.',
  ctaLabel: 'Book an audit',
};

export const faq = {
  eyebrow: 'Questions',
  title: 'What people ask about an Airtable rebuild.',
  items: [
    {
      q: 'Do we have to stop using the base while you work?',
      a: 'No. We build alongside the live base and cut over in one step, usually outside working hours. Your team keeps working in the meantime.',
    },
    {
      q: 'What if Airtable is the wrong tool for us?',
      a: "Then we'll say so in the audit. Sometimes the answer is a real database with Airtable as the interface, and sometimes it's that your base is fine and the automations are the problem.",
    },
    {
      q: 'Who owns the result?',
      a: 'You do — the base, the workspace, the automations and the documentation, all under your own account. We never hold the keys.',
    },
  ] satisfies FaqItem[],
};

export const closing = {
  eyebrow: 'Start with the audit',
  title: 'One week to find out what your base is really costing you.',
  body: "We go through the schema, the automations and the integrations, and come back with a written scope and a fixed price. If the answer is that you don't need us, that's in the report too.",
  ctaLabel: 'Book an Airtable audit',
  note: 'Fixed price · Written scope · No obligation',
};
