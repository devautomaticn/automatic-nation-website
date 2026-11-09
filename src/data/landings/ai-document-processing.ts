/**
 * Copy for the AI document processing landing (/lp/ai-document-processing/).
 *
 * Target keyword: "invoice processing automation" (260/mo US, CPC ~$147),
 * secondaries "ai invoice processing" (110, ~$232), "ai email automation"
 * (170, ~$56) and "ai document processing" (2,400, but spiky and mostly
 * platform shoppers). DataForSEO 2026-11-09. Plan:
 * Internal-Work/Marketing/an-conversion-strategy-2026-10.md, landing #2.
 *
 * The SERP is AP software vendors. The angle is the one they cannot take:
 * not another platform seat, a pipeline built into the inbox and the systems
 * the client already uses, including local tax formats.
 *
 * Cases are anonymised and describe only what is live:
 * - Supplier invoices → Airtable → monthly tax files: Uno en Uno
 *   (UeU/procesar facturas, wf-ingesta + wf-generacion-mensual).
 * - Inbox agent: the home page use case.
 * - The ByS invoice classifier is NOT here: it had not been run on real
 *   invoices as of 2026-11-09. Add it once it has, with its measured numbers.
 * No volumes or accuracy figures until a client confirms them.
 */
import type { Feature } from '../../components/sections/FeatureGrid.astro';
import type { UseCase } from '../../components/sections/UseCases.astro';
import type { FaqItem } from '../../components/sections/Faq.astro';

export const seo = {
  title: 'AI Invoice & Document Processing — Automatic Nation',
  description:
    'Invoice processing automation built into the inbox and systems you already use: AI reads every PDF, checks it, and writes it where it belongs. Fixed scope, fixed price.',
};

export const hero = {
  eyebrow: 'AI document processing',
  title: 'Every invoice read, checked and filed the moment it arrives.',
  sub: 'We build the pipeline between your inbox and your books: AI reads each PDF, validates the fields that cannot be wrong, and writes the result into Airtable, QuickBooks or whatever you already run.',
  sub2: 'No new platform to adopt. First system live in under 4 weeks, fixed price.',
  ctaLabel: 'Book a document review',
  ctaSecondaryLabel: 'See the process',
};

export const symptoms = {
  eyebrow: 'Sound familiar?',
  title: 'Where the hours go before a document reaches your books.',
  items: [
    {
      eyebrow: 'Data entry',
      title: 'Someone retypes every PDF',
      body: 'Supplier, tax ID, date, totals, tax lines. Every invoice is a few minutes of typing and one chance to swap two digits that matter.',
    },
    {
      eyebrow: 'The inbox',
      title: 'Attachments pile up until month-end',
      body: 'Invoices, statements and receipts land in one shared inbox. Nobody files them as they arrive, so closing the month starts with a dig.',
    },
    {
      eyebrow: 'Fit',
      title: 'The AP tools do not fit how you work',
      body: 'Your tax rules, your categories, your accounting system. Off-the-shelf software wants you to change the process to match the product.',
    },
  ] satisfies Feature[],
};

export const work = {
  eyebrow: 'What we have built',
  title: 'Document pipelines running on our clients’ own stack.',
  linkLabel: 'Walk us through your documents',
  items: [
    {
      stack: ['GMAIL', 'CLAUDE', 'N8N', 'AIRTABLE'],
      title: 'Supplier invoices into records and tax filings',
      body: 'Each PDF that reaches the suppliers inbox becomes a record, one per attachment, linked to the supplier by tax ID. On the 5th of every month the tax-authority files and the ledger PDF are generated from those records.',
      metric: 'Monthly tax files built with no retyping',
    },
    {
      stack: ['GMAIL', 'CLAUDE', 'AIRTABLE'],
      title: 'Inbox agent that files every attachment',
      body: 'One shared inbox receives vendor invoices and internal documents from every department. Each one is read, classified and logged where it belongs.',
      metric: 'Filed on arrival, not at month-end',
    },
    {
      stack: ['AIRTABLE', 'N8N', 'QUICKBOOKS'],
      title: 'Records into invoices and purchase orders',
      body: 'The other direction: an order closed in Airtable becomes a QuickBooks invoice or PO, with every class and department translated to its QuickBooks ID first.',
      metric: 'Replaced re-keying every order by hand',
    },
  ] satisfies UseCase[],
};

export const strip = {
  text: 'Send us a sample of the documents you retype. We will tell you what can be automated.',
  ctaLabel: 'Book a call',
};

export const faq = {
  eyebrow: 'Questions',
  title: 'What people ask about automating invoices.',
  items: [
    {
      q: 'How accurate is the extraction?',
      a: 'We measure it on your own documents before anything goes live, and we report two numbers together: how many fields were filled and how many of those were right. Fields where one wrong digit is costly, like tax IDs and totals, are cross-checked against the text layer of the PDF. When the model is not sure, it leaves the field empty for a person instead of guessing.',
    },
    {
      q: 'Should we just buy an AP automation tool?',
      a: 'Sometimes, yes. If your process is standard and the tool integrates with your accounting system, buy it. We are the better fit when your documents, tax rules or systems are specific enough that a product would make you change how you work.',
    },
    {
      q: 'What about documents that are not invoices?',
      a: 'Same pipeline. Bank statements, receipts, purchase orders and contracts all go through the same steps: classify, extract, validate, write. The first call is usually about which documents cost you the most time.',
    },
    {
      q: 'Who owns the result?',
      a: 'You do: the workflows, the prompts, the accounts and the documentation, under your own accounts. A retainer for changes and monitoring is optional.',
    },
  ] satisfies FaqItem[],
};

export const closing = {
  eyebrow: 'Start with your documents',
  title: 'Show us a month of invoices. We will show you what can run itself.',
  body: "We look at the documents you receive, where they need to end up and which fields cannot be wrong, and come back with a fixed-scope proposal. If an off-the-shelf tool fits you better, that's in the answer too.",
  ctaLabel: 'Book a document review',
  note: 'Fixed price · Written scope · No obligation',
};
