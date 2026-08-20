/**
 * The shared vocabulary the primitives are built from. Importing these instead
 * of re-spelling the unions in each component means a new tone or size is added
 * in one place, and a typo is a build error rather than a class that silently
 * resolves to nothing.
 *
 * ── Why every component writes `Astro.props as Props` ──
 * Astro's inference of `Astro.props` from `interface Props` is unreliable here:
 * in several components it resolves to `Record<string, any>` instead, which
 * silently drops the types on every destructured variable. The cast pins the
 * type down on the component's own side.
 *
 * It costs nothing in safety. Destructuring a name that isn't in `Props` is
 * still an error, and the *caller* side is checked independently by Astro's
 * generated component types — `<Chip tone="bogus">` fails `astro check` either
 * way. Uniform on purpose: mixing casts and annotations invites someone to
 * "fix" the annotation back and get an unexplained failure.
 */

/** Light or dark ground. Decides text, border and eyebrow colours together. */
export type Tone = 'paper' | 'ink';

/** Text emphasis within a tone. */
export type TextTone = 'mute' | 'dim' | 'faint';

/** Container measures — see --container-* in global.css. */
export type Width = 'page' | 'narrow' | 'prose' | 'article';

/** Vertical rhythm — see --spacing-section* in global.css. */
export type SectionSize = 'lg' | 'sm' | 'xs' | 'none';

/** Card padding. */
export type Pad = 'sm' | 'md' | 'lg' | 'none';

/** Button sizes: sm = strips · md = navbar · lg = hero and closing CTA. */
export type ControlSize = 'sm' | 'md' | 'lg';

/** Named display steps. Each carries size, leading, tracking and weight. */
export type DisplayScale = 'display-sm' | 'display-md' | 'display-xl';

/** A call to action. One shape everywhere a button is configured by data. */
export interface Cta {
  label: string;
  href: string;
  external?: boolean;
}
