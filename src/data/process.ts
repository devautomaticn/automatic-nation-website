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

/**
 * The same timeline in Spanish, for /es/. Same w/ws on purpose: only the
 * words differ, so the Gantt lines up exactly as it does on the English home.
 */
export const PROCESS_ES: Phase[] = [
  {
    n: '01', name: 'Diagnóstico', when: 'Semana 0', w: 0, ws: 1,
    body: '30 minutos. Mapeamos tus herramientas actuales, los cuellos de botella y qué significa "terminado". Salís con un alcance por escrito y un precio cerrado.',
    tasks: ['Llamada inicial', 'Herramientas y cuellos de botella', 'Alcance por escrito', 'Precio cerrado'],
  },
  {
    n: '02', name: 'Desarrollo', when: 'Semanas 1 a 3', w: 1, ws: 3,
    body: 'Construimos el sistema sobre Airtable, n8n y las herramientas que ya usás. Cada semana ves un video con el avance; nada se construye a ciegas.',
    tasks: ['Desarrollo del sistema', 'Videos de avance semanales', 'Pruebas de integración'],
  },
  {
    n: '03', name: 'Lanzamiento', when: 'Semana 4', w: 4, ws: 1, hl: true,
    body: 'Lo ponemos en producción, capacitamos a tu equipo y entregamos documentación escrita para personas, no para ingenieros.',
    tasks: ['Puesta en producción', 'Capacitación', 'Documentación'],
  },
  {
    n: '04', name: 'Mantenimiento', when: 'Continuo', w: 5, ws: 1,
    body: 'Un abono opcional para cambios, monitoreo y el próximo sistema. La mayoría de los clientes se queda.',
    tasks: ['Monitoreo', 'Cambios y ajustes', 'Próximo sistema'],
  },
];

export const GANTT_TICKS_ES: Tick[] = [
  { t: 'Semana 0' },
  { t: 'Semana 1' },
  { t: 'Semana 2' },
  { t: 'Semana 3' },
  { t: 'Semana 4' },
  { t: 'Continuo', buffer: true },
];
