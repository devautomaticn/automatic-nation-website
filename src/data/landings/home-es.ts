/**
 * Copy for the Spanish home at /es/ (es-AR, voseo).
 *
 * A translation of home.ts, not a different page: the navbar's EN/ES switch
 * promises "this same page in the other language", so a claim added or
 * dropped here breaks that promise. Change both files together.
 *
 * The section ids stay the English ones (#templates, #process, #faq, #book):
 * other code and the migrated posts already link to them.
 */
import type { Feature } from '../../components/sections/FeatureGrid.astro';
import type { UseCase } from '../../components/sections/UseCases.astro';
import type { FaqItem } from '../../components/sections/Faq.astro';

export { closingDeco } from './home';

export const seo = {
  title: 'Automatic Nation | Agencia de automatización e integraciones',
  description:
    'Construimos integraciones a medida y flujos automatizados con Airtable, n8n y más de 900 apps. Más de 1.500 flujos entregados. Agendá una llamada.',
};

export const nav = [
  { label: 'Casos', href: '#templates' },
  { label: 'Proceso', href: '#process' },
  { label: 'Preguntas', href: '#faq' },
] as const;

export const footerLinks = [
  ...nav,
  { label: 'Blog', href: '/blogs/' },
  { label: 'Contacto', href: '#book' },
] as const;

export const navCtaLabel = 'Agendar llamada';

export const hero = {
  sub: 'Construimos integraciones a medida y flujos automatizados sobre más de 900 plataformas populares.',
  sub2: 'Primer sistema andando en menos de 4 semanas, alcance cerrado, precio cerrado.',
  ctaLabel: 'Agendá una consulta gratis',
};

/** The well's HUD, uppercased by tetris.js. */
export const tetrisText = { cleared: 'filas completas', apps: '+900 apps', next: 'sigue' };

export const audience = {
  eyebrow: 'Para quién es',
  title: 'Esto rinde más rápido si…',
  items: [
    {
      eyebrow: 'Equipos de operaciones',
      title: 'Copian y pegan entre 5 o más herramientas todos los días',
      body: 'Tu equipo sabe dónde está el cuello de botella. Lo que no tuvo es tiempo para resolverlo. Lo definimos en una sola llamada y lo construimos en semanas, no en trimestres.',
    },
    {
      eyebrow: 'Fundadores',
      title: 'Tu equipo pierde más de 10 horas por semana en trabajo manual',
      body: 'Es un medio tiempo que ya estás pagando en tiempo perdido. Te lo devolvemos con un presupuesto cerrado y sin sumar gente.',
    },
    {
      eyebrow: 'Usuarios avanzados',
      title: 'Ya te quedó chico Zapier o tu Airtable casero',
      body: 'Conocés las herramientas. Lo que no tenés es tiempo para armar el sistema correcto desde cero. Seguimos desde donde llegaste.',
    },
  ] satisfies Feature[],
};

export const useCases = {
  eyebrow: 'Cómo se ve en la práctica',
  title: 'Flujos reales que construimos. Adaptá uno o traé el tuyo.',
  linkLabel: 'Mirá cómo armaríamos el tuyo',
  items: [
    {
      stack: ['CHROME', 'AIRTABLE', 'N8N'],
      title: 'Captura de productos desde cualquier sitio de proveedor',
      body: 'Una extensión de navegador que guarda un producto (proveedor, precio, imagen, especificaciones) directo en el Airtable del estudio. Se terminó copiar especificaciones a una planilla y esperar que lleguen bien.',
      metric: 'Un clic de la página del proveedor al proyecto',
    },
    {
      stack: ['AIRTABLE', 'CLAUDE', 'N8N'],
      title: 'Base de leads migrada y enriquecida',
      body: 'Años de leads repartidos entre planillas y un CRM viejo, consolidados en una sola base: sin duplicados, normalizados y enriquecidos con datos de empresa para que valga la pena trabajar la lista.',
      metric: '5.000 leads consolidados y sin duplicados',
    },
    {
      stack: ['GMAIL', 'CLAUDE', 'AIRTABLE'],
      title: 'Agente de correo que archiva cada adjunto',
      body: 'Una casilla compartida recibe adjuntos de todas las áreas (facturas de proveedores, documentos internos), lee cada uno, lo clasifica y lo registra donde corresponde.',
      metric: 'Archivado al llegar, no a fin de mes',
    },
    {
      stack: ['META', 'CLAUDE', 'AIRTABLE', 'N8N'],
      title: 'Agente de WhatsApp que responde con tus datos',
      body: 'Los clientes preguntan por WhatsApp y el agente responde desde Airtable, la misma base con la que verifica quiénes son antes de decir nada. Cada conversación llega a una consola web donde el equipo puede mirar, intervenir y ajustarlo.',
      metric: 'Cliente verificado antes de enviar una palabra',
    },
  ] satisfies UseCase[],
  // A testimonial is quoted, not translated: it stays in Ryan's words.
  quote: {
    text:
      'I had the privilege of working with Mike on a project that involved automating tasks using Airtable and other automation software. From start to finish, the experience was nothing short of remarkable.',
    name: 'Ryan Alexander',
    role: 'CEO',
    company: 'Permaplant',
  },
};

export const process = {
  eyebrow: 'Cómo trabajamos',
  title: 'Cuatro semanas de la primera llamada al sistema andando.',
  stat: '+1.500 flujos entregados · ~22 h ahorradas por semana · primera entrega en <4 semanas',
  bufferLabel: 'margen',
};

export const strip = {
  text: '¿No sabés qué conviene automatizar? Para eso es la primera llamada.',
  ctaLabel: 'Agendar llamada',
};

export const faq = {
  eyebrow: 'Preguntas',
  title: 'Lo que la gente pregunta antes de decir que sí.',
  items: [
    {
      q: '¿Cuánto cuesta un proyecto?',
      // No public range on purpose, same as home.ts.
      a: 'El precio es cerrado y se define de antemano: nada de horas facturadas ni sorpresas. Depende de cuántos sistemas e integraciones entren en el alcance, así que lo cotizamos después de la primera llamada. Tenés el número por escrito antes de que empiece cualquier trabajo.',
    },
    {
      q: '¿Y si ya tenemos algo a medio armar?',
      a: 'Es lo más común. Revisamos lo que hay, conservamos lo que funciona y rehacemos solo lo que te frena. No nos pagás para rehacer tu propio trabajo.',
    },
    {
      q: '¿Qué pasa después del lanzamiento?',
      a: 'Todo queda a tu nombre: las cuentas, los flujos, la documentación. Un abono para cambios y monitoreo es opcional, no una atadura.',
    },
  ] satisfies FaqItem[],
};

export const closing = {
  eyebrow: 'Cuando quieras',
  body: 'Mostranos cómo trabajan hoy. Te decimos qué automatizaríamos primero, cuánto cuesta y cuánto lleva. Sin presentaciones de venta: una propuesta de alcance cerrado a la que podés decir que sí o que no.',
  ctaLabel: 'Agendá tu llamada',
  note: 'Sin compromiso · Disponibilidad en la semana',
};

/** /es/agendar/, the Spanish /book-a-call/. */
export const booking = {
  seo: {
    title: 'Agendá una llamada | Automatic Nation',
    description: 'Elegí un horario para una llamada de 30 minutos. Contanos qué hace tu equipo a mano y te decimos cuánto cuesta dejar de hacerlo.',
  },
  eyebrow: 'Agendá una llamada',
  title: 'Reservá 30 minutos.',
  lead: 'Traé el proceso que más horas les consume. Lo mapeamos en vivo y te decimos qué hace falta para automatizarlo: alcance, plazos y precio. Sin presentaciones de venta, sin compromiso.',
  portraitCaption: 'Vas a hablar con Mike.',
  fallbackText: 'El calendario necesita JavaScript. Podés agendar directamente en cal.com:',
  fallbackLabel: 'Abrir el calendario',
};
