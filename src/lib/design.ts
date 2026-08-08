/**
 * The shared vocabulary the primitives are built from. Importing these instead
 * of re-spelling the unions in each component means a new tone or size is added
 * in one place, and a typo is a build error rather than a class that silently
 * resolves to nothing.
 *
 * (It also makes every primitive's frontmatter a real TS module. Astro only
 * infers `Astro.props` from `interface Props` in a module; a frontmatter with
 * no imports or exports is a script, and its props degrade to
 * `Record<string, any>` with no warning.)
 */

/** Light or dark ground. Decides text, border and eyebrow colours together. */
export type Tone = 'paper' | 'ink';

/** Text emphasis within a tone. */
export type TextTone = 'mute' | 'dim' | 'faint';

/** Container measures — see --container-* in global.css. */
export type Width = 'page' | 'narrow' | 'prose';

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
