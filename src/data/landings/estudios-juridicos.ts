/**
 * Copy for the legal landing, in Spanish (es-AR, voseo).
 *
 * Built for the Legal Tech fair outreach on 2026-10-26: Mike messages each
 * firm privately with this URL, so the page has to work as a first touch for
 * a lawyer who has never heard of us. The booking widget is on the page
 * itself because /book-a-call/ is in English.
 *
 * Every use case below is something we have actually built. Don't add one we
 * haven't, and don't name the US firm: it is not our client to name.
 */
import type { Feature } from '../../components/sections/FeatureGrid.astro';
import type { UseCase } from '../../components/sections/UseCases.astro';
import type { FaqItem } from '../../components/sections/Faq.astro';

export const seo = {
  title: 'IA y automatización para estudios jurídicos | Automatic Nation',
  description:
    'Implementamos IA y automatizaciones a medida para estudios jurídicos: revisión y redacción de documentos, bots de WhatsApp, trámites en portales y firmas. Agendá una llamada.',
};

export const nav = [
  { label: 'Casos', href: '#casos' },
  { label: 'Cómo trabajamos', href: '#proceso' },
  { label: 'Preguntas', href: '#faq' },
] as const;

export const footerLinks = [
  ...nav,
  { label: 'Blog', href: '/blogs/' },
  { label: 'Contacto', href: '#book' },
] as const;

export const navCtaLabel = 'Agendar llamada';

export const hero = {
  eyebrow: 'Para estudios jurídicos',
  title: 'IA y automatización que entiende cómo trabaja un estudio.',
  sub: 'Venimos trabajando con estudios jurídicos y conocemos el día a día de una firma desde adentro. Implementamos herramientas a medida sobre lo que ya usan, sin cambiarles la forma de trabajar.',
  sub2: 'Alcance cerrado, precio cerrado, primer sistema andando en semanas.',
  ctaLabel: 'Agendá una llamada',
  ctaSecondaryLabel: 'Ver casos',
};

export const problems = {
  eyebrow: '¿Te suena?',
  title: 'Las horas que se van en tareas que no son abogacía.',
  items: [
    {
      eyebrow: 'Documentos',
      title: 'Escritos que se arman copiando y pegando',
      body: 'Cada contrato o escrito parte de un modelo viejo, se adapta a mano y se revisa a mano. Es lento y es donde se cuelan los errores.',
    },
    {
      eyebrow: 'Clientes',
      title: 'El WhatsApp del estudio no para',
      body: 'Consultas sobre el estado de un expediente, pedidos de documentación, turnos. Alguien del equipo contesta lo mismo diez veces por día.',
    },
    {
      eyebrow: 'Portales',
      title: 'Horas entrando a portales a mirar novedades',
      body: 'Revisar expedientes, cargar presentaciones y seguir trámites en cada portal es trabajo repetitivo que se puede delegar a un sistema.',
    },
  ] satisfies Feature[],
};

export const cases = {
  eyebrow: 'Lo que implementamos',
  title: 'Casos que ya construimos para el mundo legal.',
  linkLabel: 'Contanos tu caso',
  items: [
    {
      stack: ['CLAUDE', 'GOOGLE DOCS'],
      title: 'Revisión y redacción de documentos',
      body: 'Un asistente que redacta borradores a partir de los modelos y criterios del estudio, y revisa documentos marcando cláusulas, faltantes e inconsistencias antes de que los lea un abogado.',
      metric: 'El abogado revisa, no arranca de cero',
    },
    {
      stack: ['WHATSAPP', 'CLAUDE', 'AIRTABLE'],
      title: 'Bot de WhatsApp para clientes',
      body: 'Responde consultas frecuentes con la información del estudio, identifica al cliente, pide documentación y deriva a una persona cuando hace falta. El equipo ve cada conversación y puede intervenir.',
      metric: 'Respuesta inmediata, las 24 horas',
    },
    {
      stack: ['PORTALES', 'N8N', 'AIRTABLE'],
      title: 'Gestión de trámites en portales',
      body: 'Seguimiento automático de trámites y expedientes en portales oficiales: detecta novedades, registra plazos y avisa al responsable, en lugar de entrar a mirar uno por uno.',
      metric: 'Novedades que llegan solas',
    },
    {
      stack: ['FIRMA DIGITAL', 'N8N', 'GMAIL'],
      title: 'Gestión de firmas',
      body: 'Circuitos de firma que se arman solos: el documento sale para firmar, se hace el seguimiento de quién falta y la versión firmada queda archivada en su carpeta.',
      metric: 'Sin perseguir firmas por mail',
    },
  ] satisfies UseCase[],
};

export const process = {
  eyebrow: 'Cómo trabajamos',
  title: 'De la primera llamada a un sistema funcionando.',
  items: [
    {
      eyebrow: '01 · Diagnóstico',
      title: 'Una llamada para entender el estudio',
      body: 'Nos contás qué tareas se llevan más horas y con qué herramientas trabajan. Salís con una idea clara de qué conviene automatizar primero.',
    },
    {
      eyebrow: '02 · Propuesta',
      title: 'Alcance y precio cerrados',
      body: 'Te mandamos por escrito qué vamos a construir, en cuánto tiempo y cuánto cuesta. Sin horas facturadas ni sorpresas.',
    },
    {
      eyebrow: '03 · Implementación',
      title: 'Lo ponemos a andar con tu equipo',
      body: 'Construimos sobre las herramientas que ya usan, lo probamos con casos reales del estudio y capacitamos al equipo.',
    },
  ] satisfies Feature[],
};

export const strip = {
  text: '¿No sabés por dónde empezar? Para eso es la primera llamada.',
  ctaLabel: 'Agendar llamada',
};

export const faq = {
  eyebrow: 'Preguntas',
  title: 'Lo que suelen preguntar los estudios.',
  items: [
    {
      q: '¿Qué pasa con la confidencialidad de la información?',
      a: 'Es lo primero que definimos. Trabajamos sobre las cuentas y herramientas del estudio, con accesos que ustedes controlan, y diseñamos cada sistema para que la información de los clientes no salga de donde tiene que estar.',
    },
    {
      q: '¿Cuánto cuesta?',
      // No public range on purpose, same as the English FAQ.
      a: 'Depende de qué haya que construir, así que el precio lo definimos después de la primera llamada. Es un precio cerrado y lo tenés por escrito antes de empezar.',
    },
    {
      q: '¿Trabajan con estudios chicos?',
      a: 'Sí. Muchas veces el impacto es mayor en un estudio chico, donde pocas personas se reparten todas las tareas administrativas.',
    },
  ] satisfies FaqItem[],
};

export const booking = {
  eyebrow: 'Agendá una llamada',
  title: 'Charlemos 30 minutos.',
  lead: 'Contanos qué tareas se llevan más horas en el estudio. Te decimos qué automatizaríamos primero, cuánto lleva y cuánto cuesta. Sin compromiso.',
  fallbackText: 'El calendario necesita JavaScript. Podés agendar directamente en cal.com:',
  fallbackLabel: 'Abrir el calendario',
};
