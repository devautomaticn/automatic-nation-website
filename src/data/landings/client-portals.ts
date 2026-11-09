/**
 * Copy for the client portals landing (/lp/client-portals/).
 *
 * Target keywords: "airtable client portal" (40/mo US, CPC ~$14), "airtable
 * portal" (320, ~$3), "custom client portal" (40, ~$46). DataForSEO
 * 2026-11-09. Plan: Internal-Work/Marketing/an-conversion-strategy-2026-10.md,
 * landing #4. /best-client-portal-software/ already ranks and feeds this page.
 *
 * The SERP opens with Airtable's own Portals add-on ($120/mo for 15 guests on
 * Team, per Airtable's help centre via the 2026-11-09 SERP), then Softr /
 * Noloco. This page has to say when those are enough.
 *
 * The case is the Uno en Uno portal, anonymised, described only from its
 * README (UeU/uno-en-uno-portal, 2026-11-06): Next.js + Supabase, Airtable stays
 * the source of truth, per-user interfaces, conflict check, audit log, cash
 * flow view. No user or seat counts until the client confirms them.
 */
import type { Feature } from '../../components/sections/FeatureGrid.astro';
import type { UseCase } from '../../components/sections/UseCases.astro';
import type { FaqItem } from '../../components/sections/Faq.astro';

export const seo = {
  title: 'Airtable Client Portal, Custom-Built — Automatic Nation',
  description:
    'A custom client portal on top of your Airtable base: your clients and staff log in without Airtable seats, see only their records, and every edit is logged.',
};

export const hero = {
  eyebrow: 'Client portals',
  title: 'A portal on your Airtable base, for people who will never open Airtable.',
  sub: 'Clients, suppliers and staff log in to a portal built for the job they do. Airtable stays the source of truth underneath, every record is checked against what that user is allowed to see, and every change is logged.',
  sub2: 'Fixed scope, fixed price. You own the code and the accounts.',
  ctaLabel: 'Book a portal call',
  ctaSecondaryLabel: 'See the process',
};

export const symptoms = {
  eyebrow: 'Sound familiar?',
  title: 'When sharing the base stops working.',
  items: [
    {
      eyebrow: 'Seats',
      title: 'Paying for seats people barely use',
      body: 'Everyone who needs to see or edit a few records gets a full Airtable seat, or a share link that shows more than it should.',
    },
    {
      eyebrow: 'Access',
      title: 'Filtered views are not permissions',
      body: 'A view filtered to one client is a convenience, not a lock. The moment the data is sensitive, you need each record checked on the server, not hidden in the interface.',
    },
    {
      eyebrow: 'Fit',
      title: 'Portal builders hit a wall',
      body: 'Airtable Portals, Softr and the like are quick to start. Then you need data from two bases, a view they do not offer, or a rule about who can edit what, and the builder runs out.',
    },
  ] satisfies Feature[],
};

export const work = {
  eyebrow: 'What we have built',
  title: 'A portal in front, Airtable behind.',
  linkLabel: 'Talk through your portal',
  items: [
    {
      stack: ['NEXT.JS', 'AIRTABLE', 'SUPABASE'],
      title: 'Airtable interfaces for people without Airtable',
      body: 'A distribution business gives staff the screens they work in (purchases, contacts, contracts, price lists) without Airtable accounts. The portal reads and writes the base directly; Supabase only handles logins, permissions and the audit log.',
      metric: 'Each user sees only the interfaces assigned to them',
    },
    {
      stack: ['NEXT.JS', 'AIRTABLE'],
      title: 'Edits that never overwrite each other',
      body: 'If someone changed a field in Airtable that a portal user was also editing, nothing is overwritten. The portal shows both values and the user chooses.',
      metric: 'Every write logged with old and new value',
    },
    {
      stack: ['NEXT.JS', 'AIRTABLE', 'SUPABASE'],
      title: 'A cash flow view Airtable cannot draw',
      body: 'Daily liquidity, pending payments and the weekly and monthly flow, combining the Airtable base with the treasury spreadsheet finance already keeps, in a layout no Airtable interface supports. This is where a custom portal earns its cost.',
      metric: 'Airtable and the treasury sheet in one view',
    },
  ] satisfies UseCase[],
};

export const strip = {
  text: 'Not sure if you need a custom portal or just Airtable Portals? That is the first call.',
  ctaLabel: 'Book a call',
};

export const faq = {
  eyebrow: 'Questions',
  title: 'What people ask before building a portal.',
  items: [
    {
      q: 'Why not just use Airtable Portals or Softr?',
      a: "Use them if they fit. They are quicker to set up and cheaper to start. A custom portal is worth it when you need data from more than one base, permissions checked record by record, a screen those tools cannot build, or more users than their pricing makes sensible. We'll tell you which side of that line you are on.",
    },
    {
      q: 'Do we have to leave Airtable?',
      a: 'No. Airtable stays the source of truth and your team keeps working in it. The portal reads and writes the same base, so formulas, rollups and automations keep running.',
    },
    {
      q: 'What happens when we rename a field in Airtable?',
      a: 'Nothing breaks. The portal refers to every table and field by its Airtable ID, not its name.',
    },
    {
      q: 'Who owns the result?',
      a: 'You do: the code, the hosting accounts, the database and the documentation. A retainer for changes and new screens is optional.',
    },
  ] satisfies FaqItem[],
};

export const closing = {
  eyebrow: 'Start with a call',
  title: 'Tell us who needs in, and what they need to see.',
  body: "We look at your base, the people who need access and what each of them does, and come back with a fixed-scope proposal. If Airtable Portals or a builder covers it, that's in the answer too.",
  ctaLabel: 'Book a portal call',
  note: 'Fixed price · Written scope · No obligation',
};
