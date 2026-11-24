import type { Metadata } from "next";
import { CircleCheck, Clock } from "lucide-react";
import { Cover, HandArrow } from "@/components/art/Cover";
import { LogoMark } from "@/components/layout/Logo";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Card, SectionHeading } from "@/components/ui/primitives";
import { getLang } from "@/lib/server-lang";

const TEXT = {
  en: {
    metaTitle: "About",
    metaDescription: "FinanceGo's mission, principles and roadmap.",
    eyebrow: "About FinanceGo",
    title: "Bridging finance theory and practice",
    intro:
      "FinanceGo helps university students and young analysts learn finance, apply it, and prepare for technical interviews in investment banking, private equity, markets, asset management and consulting.",
    home: "Home",
    crumb: "About",
    viewEyebrow: "Our view",
    viewTitle: "Finance is a skill, not a glossary",
    view: "Most finance content explains definitions. Interviews and jobs test whether you can reason: what happens to value when rates rise, why two multiples disagree, whether a deal creates value. FinanceGo is built around that kind of reasoning, with interactive models, immediate feedback and structured paths from fundamentals to interview readiness.",
    start: "Start learning",
    help: "Help & contact",
    tagline: "Learn Finance. Think Bigger. Go Further.",
    hand: "Small steps. Big opportunities.",
    principlesEyebrow: "Principles",
    principlesTitle: "How FinanceGo is built",
    roadmapEyebrow: "Roadmap",
    roadmapTitle: "What works today, and what is planned",
    roadmapDescription: "Planned items are not implemented yet. We list them so you know what to expect, never to suggest they exist.",
    v1: "Version 1 · available now",
    v2: "Version 2 · planned",
    v3: "Version 3 · planned",
    qualityTitle: "Content quality",
    quality:
      "Every calculator formula is unit-tested, worked examples are checked for numerical consistency, and lessons separate assumptions from facts. FinanceGo does not invent market prices, company financials, recruiting deadlines or interview reports. Where a scenario is illustrative, it says so. All graphics, including the contour-line patterns, are original to FinanceGo.",
    principles: [
      ["Learning by doing", "Every important concept connects to an exercise, a model, a case or an interview question."],
      ["Progressive difficulty", "Fundamentals first, then technicals, then judgement."],
      ["Immediate feedback", "You learn why an answer is right or wrong, not just whether it is."],
      ["Connected experience", "Learn, Practice, the mock interview, Tools, the Planner and Career reinforce one another."],
      ["Professional credibility", "Accurate, tested formulas and honest limitations."],
      ["Real functionality", "No decorative buttons, fake data or invented statistics."],
    ],
    V1: [
      "Six complete courses with interactive lessons, knowledge checks and final assessments",
      "Practice by section, with five question formats, filters and six practice modes",
      "The 500 Challenge: 500 mixed questions that unlock one by one, with a missed list to repeat",
      "A timed mock interview: 50 numeric questions in five levels",
      "43 brain teasers with hints and worked solutions",
      "A behavioural guide, question library and STAR story bank",
      "Twelve working tools, from WACC and DCF to a paper LBO, comps and option pricing",
      "An interview planner that turns your interview date into a day-by-day calendar",
      "Daily markets news, each headline linked to the concept behind it",
      "A dashboard for learning, practice, the challenge, your plan and your stories",
      "Ten career guides, roadmaps, templates and interactive checklists",
    ],
    V2: ["User accounts and cross-device sync", "More courses and learning paths", "Every course and question in Spanish", "AI-assisted interview feedback", "Portfolio analytics from your own return series"],
    V3: ["Voice interviews and coaching", "Full LBO and merger models", "Real company case studies with sourced data", "Verified recruiting timelines", "Live market data"],
  },
  es: {
    metaTitle: "Sobre FinanceGo",
    metaDescription: "La misión, los principios y la hoja de ruta de FinanceGo.",
    eyebrow: "Sobre FinanceGo",
    title: "Uniendo la teoría y la práctica de las finanzas",
    intro:
      "FinanceGo ayuda a estudiantes universitarios y analistas jóvenes a aprender finanzas, aplicarlas y prepararse para entrevistas técnicas en banca de inversión, private equity, mercados, gestión de activos y consultoría.",
    home: "Inicio",
    crumb: "Sobre FinanceGo",
    viewEyebrow: "Nuestra visión",
    viewTitle: "Las finanzas son una habilidad, no un glosario",
    view: "La mayoría del contenido sobre finanzas explica definiciones. Las entrevistas y los trabajos ponen a prueba si sabes razonar: qué le pasa al valor cuando suben los tipos, por qué dos múltiplos no coinciden, si una operación crea valor. FinanceGo se basa en ese tipo de razonamiento, con modelos interactivos, feedback inmediato y rutas estructuradas desde los fundamentos hasta estar listo para la entrevista.",
    start: "Empieza a aprender",
    help: "Ayuda y contacto",
    tagline: "Learn Finance. Think Bigger. Go Further.",
    hand: "Pequeños pasos. Grandes oportunidades.",
    principlesEyebrow: "Principios",
    principlesTitle: "Cómo está construido FinanceGo",
    roadmapEyebrow: "Hoja de ruta",
    roadmapTitle: "Qué funciona hoy y qué está previsto",
    roadmapDescription: "Lo previsto todavía no está implementado. Lo indicamos para que sepas qué esperar, nunca para dar a entender que ya existe.",
    v1: "Versión 1 · disponible ya",
    v2: "Versión 2 · prevista",
    v3: "Versión 3 · prevista",
    qualityTitle: "Calidad del contenido",
    quality:
      "Todas las fórmulas de las calculadoras tienen pruebas unitarias, se comprueba la coherencia numérica de los ejemplos resueltos y las lecciones separan las hipótesis de los hechos. FinanceGo no se inventa cotizaciones, datos financieros de empresas, plazos de selección ni experiencias de entrevistas. Cuando un escenario es ilustrativo, se indica. Todos los gráficos, incluidos los patrones de curvas de nivel, son originales de FinanceGo.",
    principles: [
      ["Aprender haciendo", "Cada concepto importante se conecta con un ejercicio, un modelo, un caso o una pregunta de entrevista."],
      ["Dificultad progresiva", "Primero los fundamentos, después los technicals y, por último, el criterio."],
      ["Feedback inmediato", "Aprendes por qué una respuesta es correcta o incorrecta, no solo si lo es."],
      ["Experiencia conectada", "Learn, Practice, el Mock interview, Tools, el Planner y Career se refuerzan entre sí."],
      ["Credibilidad profesional", "Fórmulas exactas y probadas, y limitaciones expuestas con honestidad."],
      ["Funcionalidad real", "Sin botones decorativos, datos falsos ni estadísticas inventadas."],
    ],
    V1: [
      "Seis cursos completos con lecciones interactivas, comprobaciones de conocimientos y evaluaciones finales",
      "Practice por secciones, con cinco formatos de pregunta, filtros y seis modos de práctica",
      "El 500 Challenge: 500 preguntas variadas que se desbloquean una a una, con una lista de falladas para repetir",
      "Un Mock interview cronometrado: 50 preguntas numéricas en cinco niveles",
      "43 Brain Teasers con pistas y soluciones explicadas",
      "Una guía de Behaviourals, una biblioteca de preguntas y un banco de historias STAR",
      "Doce herramientas operativas, desde WACC y DCF hasta un LBO en papel, comparables y valoración de opciones",
      "Un Planner de entrevistas que convierte la fecha de tu entrevista en un calendario día a día",
      "Noticias de mercados diarias, con cada titular enlazado al concepto que hay detrás",
      "Un Dashboard para el aprendizaje, la práctica, el reto, tu plan y tus historias",
      "Diez guías de carrera, hojas de ruta, plantillas y listas de comprobación interactivas",
    ],
    V2: ["Cuentas de usuario y sincronización entre dispositivos", "Más cursos y rutas de aprendizaje", "Todos los cursos y preguntas en español", "Feedback de entrevistas asistido por IA", "Análisis de cartera a partir de tus propias series de rentabilidad"],
    V3: ["Entrevistas por voz y coaching", "Modelos completos de LBO y de fusiones", "Casos prácticos de empresas reales con datos citados", "Calendarios de selección verificados", "Datos de mercado en tiempo real"],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const tx = TEXT[await getLang()];
  return { title: tx.metaTitle, description: tx.metaDescription };
}

export default async function AboutPage() {
  const tx = TEXT[await getLang()];
  return (
    <>
      <PageHeader
        eyebrow={tx.eyebrow}
        title={tx.title}
        description={
          <p>{tx.intro}</p>
        }
        crumbs={[{ href: "/", label: tx.home }, { label: tx.crumb }]}
      />

      <section className="container-page mt-12 grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <SectionHeading eyebrow={tx.viewEyebrow} title={tx.viewTitle} />
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink">{tx.view}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/learn/">{tx.start}</ButtonLink>
            <ButtonLink href="/help/" variant="secondary">
              {tx.help}
            </ButtonLink>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md pb-12">
          <Cover name="alps" className="aspect-[4/3] rounded-[2rem] shadow-lift">
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <LogoMark className="h-20 w-20 shadow-lift ring-1 ring-white/20" />
              <p className="font-serif text-2xl text-cream">{tx.tagline}</p>
            </div>
          </Cover>
          <div className="absolute bottom-0 left-6 flex items-end gap-1 text-navy">
            <HandArrow className="mb-4 h-8 w-12 -scale-x-100 rotate-[200deg] text-electric" />
            <p className="font-hand text-2xl">{tx.hand}</p>
          </div>
        </div>
      </section>

      <section className="container-page mt-20">
        <SectionHeading eyebrow={tx.principlesEyebrow} title={tx.principlesTitle} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tx.principles.map(([t, d]) => (
            <Card key={t} className="p-5">
              <p className="font-semibold text-navy">{t}</p>
              <p className="mt-1 text-sm text-ink-muted">{d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page mt-20">
        <SectionHeading eyebrow={tx.roadmapEyebrow} title={tx.roadmapTitle} description={tx.roadmapDescription} />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Card className="p-6">
            <Badge tone="success">{tx.v1}</Badge>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {tx.V1.map((x) => (
                <li key={x} className="flex gap-2">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {x}
                </li>
              ))}
            </ul>
          </Card>
          {[
            [tx.v2, tx.V2],
            [tx.v3, tx.V3],
          ].map(([label, items]) => (
            <Card key={label as string} className="border-dashed p-6">
              <Badge tone="outline">{label as string}</Badge>
              <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                {(items as string[]).map((x) => (
                  <li key={x} className="flex gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0" /> {x}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page mt-20">
        <Card className="p-6 sm:p-8">
          <h2 className="font-serif text-2xl">{tx.qualityTitle}</h2>
          <p className="mt-3 text-ink">{tx.quality}</p>
        </Card>
      </section>
    </>
  );
}
