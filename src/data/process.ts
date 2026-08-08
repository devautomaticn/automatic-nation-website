/**
 * The delivery timeline, rendered two ways by Process.astro: a Gantt from lg
 * up and stacked cards below it.
 *
 * One source for both renderings. Duplicating this prose in two markup blocks
 * is how the two drift apart, so both are generated from here.
 *
 * Everything is measured in weeks: `w` is the starting week (0-indexed) and
 * `ws` how many weeks it lasts. Lanes, pills and task lists are all derived
 * from those two numbers with the same formula, so a pill lines up with its
 * lane by construction rather than by two sets of numbers agreeing. (This
 * replaced a 24-column grid whose lines fell a few pixels off the lanes.)
 */
export interface Phase {
  /** Displayed in the badge. A string so '01' keeps its leading zero. */
  n: string;
  name: string;
  when: string;
  /** Starting week, 0-indexed. */
  w: number;
  /** Duration in weeks. */
  ws: number;
  /** Highlight — takes the accent tone. At most one. */
  hl?: boolean;
  body: string;
  tasks: string[];
}

/** One rounded lane per week, and one axis label centred under each. */
export interface Tick {
  t: string;
  /** Contingency rather than committed work — renders hatched. */
  buffer?: boolean;
}

export const PROCESS: Phase[] = [
  {
    n: '01', name: 'Discovery', when: 'Week 0', w: 0, ws: 1,
    body: '30 minutes. We map your current tools, the bottlenecks, and what "done" looks like. You leave with a written scope and fixed price.',
    tasks: ['Discovery call', 'Tools & bottlenecks', 'Written scope', 'Fixed price'],
  },
  {
    n: '02', name: 'Build', when: 'Weeks 1–3', w: 1, ws: 3,
    body: 'We build the system on Airtable + n8n + your existing stack. You see weekly demo videos; nothing is built in a vacuum.',
    tasks: ['System build', 'Weekly demo videos', 'Integration testing'],
  },
  {
    n: '03', name: 'Launch', when: 'Week 4', w: 4, ws: 1, hl: true,
    body: 'We deploy live, train your team, and ship documentation written for humans, not engineers.',
    tasks: ['Deploy live', 'Team training', 'Documentation'],
  },
  {
    n: '04', name: 'Maintain', when: 'Ongoing', w: 5, ws: 1,
    body: 'Optional retainer for changes, monitoring, and the next system. Most clients stay.',
    tasks: ['Monitoring', 'Changes & fixes', 'Next system'],
  },
];

/** Driven off the same index as the lanes, so a label can't drift off its lane. */
export const GANTT_TICKS: Tick[] = [
  { t: 'Week 0' },
  { t: 'Week 1' },
  { t: 'Week 2' },
  { t: 'Week 3' },
  { t: 'Week 4' },
  { t: 'Ongoing', buffer: true },
];
