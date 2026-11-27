import Link from "@/components/i18n/Link";
import { ArrowRight, BookOpen, Briefcase, Calculator, CalendarDays, Puzzle, CircleCheck, MessagesSquare, Target, Trophy, UsersRound } from "lucide-react";
import { ALL_COURSES, FEATURED_COURSE_IDS } from "@/content/courses";
import { Cover, HandArrow } from "@/components/art/Cover";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/primitives";
import { CourseCard } from "@/components/learn/CourseCard";
import { ProgressPreview, QuestionOfTheDay } from "@/components/home/HomeClient";
import { WaccEv } from "@/components/learn/widgets/valuation";
import { CHALLENGE_TARGET, STAGES, STAGE_SIZE } from "@/lib/challenge";
import { getNews } from "@/lib/news";
import { MarketsToday } from "@/components/news/MarketsToday";
import type { Lang } from "@/lib/i18n";
import { getLang } from "@/lib/server-lang";

type L = Record<Lang, string>;

const PATHS: { href: string; title: string; text: L; icon: typeof Target; cta: L }[] = [
  {
    href: "/technicals/",
    title: "Technicals",
    text: {
      en: "Theory courses, practice by section, the 500 Challenge and a timed mock interview.",
      es: "Cursos de teoría, práctica por secciones, el 500 Challenge y un Mock interview cronometrado.",
    },
    icon: Target,
    cta: { en: "Master the technicals", es: "Domina los technicals" },
  },
  {
    href: "/behaviourals/",
    title: "Behaviourals",
    text: { en: "The STAR method, a library of fit questions, and your own story bank.", es: "El método STAR, una biblioteca de preguntas de fit y tu propio banco de historias." },
    icon: UsersRound,
    cta: { en: "Prepare your stories", es: "Prepara tus historias" },
  },
  {
    href: "/brain-teasers/",
    title: "Brain Teasers",
    text: {
      en: "Probability, expected value, mental maths and logic puzzles, with hints and worked solutions.",
      es: "Probabilidad, valor esperado, cálculo mental y acertijos de lógica, con pistas y soluciones paso a paso.",
    },
    icon: Puzzle,
    cta: { en: "Solve a teaser", es: "Resuelve un teaser" },
  },
  {
    href: "/tools/",
    title: "Tools",
    text: {
      en: "Working WACC, DCF, bond and compounding tools that calculate real results from your assumptions.",
      es: "Herramientas de WACC, DCF, bonos e interés compuesto que calculan resultados reales a partir de tus hipótesis.",
    },
    icon: Calculator,
    cta: { en: "Open the toolkit", es: "Abre las herramientas" },
  },
  {
    href: "/planner/",
    title: "Planner",
    text: {
      en: "Enter your interview date and get a day-by-day calendar of what to study on FinanceGo until the big day.",
      es: "Introduce la fecha de tu entrevista y obtén un calendario día a día de qué estudiar en FinanceGo hasta el gran día.",
    },
    icon: CalendarDays,
    cta: { en: "Plan my prep", es: "Planifica mi preparación" },
  },
  {
    href: "/career/",
    title: "Career",
    text: {
      en: "In-depth guides to ten finance careers: the day-to-day, teams, skills, recruiting and exits.",
      es: "Guías en profundidad sobre diez carreras en finanzas: el día a día, los equipos, las habilidades, el recruiting y las salidas.",
    },
    icon: Briefcase,
    cta: { en: "Explore careers", es: "Explora carreras" },
  },
];

/** Spanish names for the ten 500 Challenge stages (src/lib/challenge.ts STAGES, same order). */
const STAGE_TITLES_ES = [
  "Primeros pasos",
  "Fundamentos",
  "Piezas clave",
  "Technicals esenciales",
  "Mitad del camino",
  "Más a fondo",
  "Avanzado",
  "Prueba de presión",
  "Ronda final",
  "Listo para el Superday",
];

const TEXT = {
  en: {
    eyebrow: "Learn Finance · Think Bigger · Go Further",
    h1: "Your future in finance starts here.",
    lead: "Learn the fundamentals. Master the technicals. Practice with real cases. Build your financial future.",
    startLearning: "Start Learning",
    explore: "Explore FinanceGo",
    sections: "Sections",
    sectionsValue: "Learn to Career",
    price: "Price",
    priceValue: "Free MVP",
    signUp: "Sign-up",
    signUpValue: "Not required",
    previewTitle: "FinanceGo product preview",
    previewQuestion: "What happens to a DCF valuation if the WACC increases?",
    previewAnswer: "It falls. Now, why does terminal value fall the most?",
    waccCalculator: "WACC Calculator",
    costOfEquity: "Cost of equity",
    afterTaxDebt: "After-tax debt",
    course: "Course",
    courseTitle: "Valuation Essentials: DCF",
    courseMeta: "6 lessons · interactive models · final assessment",
    handNote: "Small steps. Big opportunities.",
    pathEyebrow: "Choose your path",
    pathTitle: "Six ways to move forward",
    pathDescription: "Every concept you learn connects to an exercise, a model or an interview question. Start wherever you are.",
    challengeEyebrow: "The 500 Challenge",
    challengeTitle: (n: number) => `${n} questions. One at a time.`,
    challengeBody:
      "A single mixed path for recruiting season. Answer a question to unlock the next, right or wrong. Missed questions go to a list you can repeat until you get them.",
    startChallenge: "Start the challenge",
    stage: "Stage",
    featuredEyebrow: "Featured courses",
    featuredTitle: "Start with the essentials",
    featuredDescription: "Six complete courses are available today; the rest of the library is in development and clearly marked.",
    allCourses: "All courses",
    qotdEyebrow: "Question of the day",
    qotdTitle: "Think it through",
    qotdDescription: "One question a day that rewards reasoning over memorisation. Your answer is saved to your dashboard.",
    interviewEyebrow: "Interview challenge",
    interviewTitle: "Could you answer this live?",
    interviewer: "Interviewer",
    you: "You",
    q1: "What happens to a DCF valuation if the WACC increases?",
    a1: "The valuation decreases.",
    q2: "Correct. Why might a 100-basis-point increase in WACC produce a disproportionately large decline in terminal value?",
    interviewBody:
      "Interview Preparation drills the questions interviewers really ask, weighted towards traps, cases and open answers, with model answers to compare against.",
    startInterview: "Start Interview Preparation",
    toolEyebrow: "Featured tool",
    toolTitle: "See how rates, risk and leverage move value",
    toolDescription: "Move the sliders: this is the same maths that sits inside every DCF. Higher rates or beta raise WACC; moderate leverage lowers it.",
    fullWacc: "Full WACC Calculator",
    journeyEyebrow: "Your journey",
    journeyTitle: "Pick up where you left off",
  },
  es: {
    eyebrow: "Aprende finanzas · Piensa en grande · Llega más lejos",
    h1: "Tu futuro en finanzas empieza aquí.",
    lead: "Aprende los fundamentos. Domina los technicals. Practica con casos reales. Construye tu futuro financiero.",
    startLearning: "Empieza a aprender",
    explore: "Explora FinanceGo",
    sections: "Secciones",
    sectionsValue: "De Learn a Career",
    price: "Precio",
    priceValue: "MVP gratuito",
    signUp: "Registro",
    signUpValue: "No necesario",
    previewTitle: "Vista previa de FinanceGo",
    previewQuestion: "¿Qué le pasa a una valoración por DCF si sube el WACC?",
    previewAnswer: "Baja. Ahora, ¿por qué es el terminal value lo que más cae?",
    waccCalculator: "Calculadora de WACC",
    costOfEquity: "Coste del equity",
    afterTaxDebt: "Deuda después de impuestos",
    course: "Curso",
    courseTitle: "Valuation Essentials: DCF",
    courseMeta: "6 lecciones · modelos interactivos · evaluación final",
    handNote: "Pasos pequeños. Grandes oportunidades.",
    pathEyebrow: "Elige tu camino",
    pathTitle: "Seis formas de avanzar",
    pathDescription: "Cada concepto que aprendes se conecta con un ejercicio, un modelo o una pregunta de entrevista. Empieza desde donde estés.",
    challengeEyebrow: "El 500 Challenge",
    challengeTitle: (n: number) => `${n} preguntas. Una a una.`,
    challengeBody:
      "Un único recorrido mixto para la temporada de recruiting. Responde una pregunta para desbloquear la siguiente, aciertes o no. Las que falles van a una lista que puedes repetir hasta dominarlas.",
    startChallenge: "Empieza el reto",
    stage: "Etapa",
    featuredEyebrow: "Cursos destacados",
    featuredTitle: "Empieza por lo esencial",
    featuredDescription: "Hoy hay seis cursos completos disponibles; el resto de la biblioteca está en desarrollo y bien señalado.",
    allCourses: "Todos los cursos",
    qotdEyebrow: "Pregunta del día",
    qotdTitle: "Piénsalo bien",
    qotdDescription: "Una pregunta al día que premia el razonamiento por encima de la memoria. Tu respuesta se guarda en tu Dashboard.",
    interviewEyebrow: "Reto de entrevista",
    interviewTitle: "¿Sabrías responder esto en directo?",
    interviewer: "Entrevistador",
    you: "Tú",
    q1: "¿Qué le pasa a una valoración por DCF si sube el WACC?",
    a1: "La valoración baja.",
    q2: "Correcto. ¿Por qué una subida de 100 puntos básicos en el WACC puede provocar una caída desproporcionada del terminal value?",
    interviewBody:
      "Interview Preparation te entrena con las preguntas que de verdad hacen los entrevistadores, con más peso en trampas, casos y respuestas abiertas, y respuestas modelo para comparar.",
    startInterview: "Empieza Interview Preparation",
    toolEyebrow: "Herramienta destacada",
    toolTitle: "Mira cómo los tipos, el riesgo y el apalancamiento mueven el valor",
    toolDescription: "Mueve los controles: son las mismas matemáticas que hay dentro de cualquier DCF. Tipos o beta más altos suben el WACC; un apalancamiento moderado lo baja.",
    fullWacc: "Calculadora de WACC completa",
    journeyEyebrow: "Tu recorrido",
    journeyTitle: "Retoma donde lo dejaste",
  },
} satisfies Record<Lang, unknown>;

export default async function HomePage() {
  const lang = await getLang();
  const tx = TEXT[lang];
  const { items: news } = getNews();
  const featured = FEATURED_COURSE_IDS.map((id) => ALL_COURSES.find((c) => c.id === id)!).filter(Boolean);

  return (
    <>
      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <p className="eyebrow mb-5">{tx.eyebrow}</p>
            <h1 className="font-serif text-[2.9rem] leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.4rem]">
              {tx.h1}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
              {tx.lead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/learn/" size="lg">
                {tx.startLearning} <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="#explore" variant="secondary" size="lg">
                {tx.explore}
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6 text-sm">
              <div>
                <dt className="text-ink-muted">{tx.sections}</dt>
                <dd className="mt-0.5 font-semibold text-navy">{tx.sectionsValue}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">{tx.price}</dt>
                <dd className="mt-0.5 font-semibold text-navy">{tx.priceValue}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">{tx.signUp}</dt>
                <dd className="mt-0.5 font-semibold text-navy">{tx.signUpValue}</dd>
              </div>
            </dl>
          </div>

          {/* Product preview: a contour panel in the logo's blue with three real parts of FinanceGo. */}
          <div className="relative mx-auto w-full max-w-xl pb-14 lg:max-w-none">
            <Cover name="alps" className="rounded-[2rem] shadow-lift" title={tx.previewTitle}>
              <span className="absolute -bottom-4 right-5 select-none font-serif text-[7rem] leading-none text-cream/10 sm:text-[9rem]">FG</span>

              {/* Cards flow in a column with staggered alignment, so they never overlap at any width. */}
              <div className="flex flex-col gap-4 p-5 sm:p-8">
                <div className="w-[92%] self-start rounded-2xl bg-white p-4 shadow-lift sm:w-[72%]">
                  <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-electric">
                    <MessagesSquare className="h-3.5 w-3.5" /> Interview Preparation
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-snug text-navy">{tx.previewQuestion}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success-ink">
                    <CircleCheck className="h-3.5 w-3.5 shrink-0" /> {tx.previewAnswer}
                  </p>
                </div>

                <div className="hidden w-[46%] self-end rounded-2xl bg-white p-4 shadow-lift sm:block">
                  <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-electric">
                    <Calculator className="h-3.5 w-3.5" /> {tx.waccCalculator}
                  </p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-navy">8.77%</p>
                  <dl className="mt-1.5 space-y-0.5 text-xs text-ink-muted">
                    <div className="flex justify-between gap-2">
                      <dt>{tx.costOfEquity}</dt>
                      <dd className="figure text-ink">10.60%</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>{tx.afterTaxDebt}</dt>
                      <dd className="figure text-ink">4.50%</dd>
                    </div>
                  </dl>
                </div>

                <div className="w-[92%] self-start rounded-2xl bg-white p-4 shadow-lift sm:ml-6 sm:w-[58%]">
                  <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-electric">
                    <BookOpen className="h-3.5 w-3.5" /> {tx.course}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-navy">{tx.courseTitle}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{tx.courseMeta}</p>
                  <div className="mt-2.5 flex gap-1" aria-hidden>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="h-1.5 flex-1 rounded-full bg-ice-soft" />
                    ))}
                  </div>
                </div>
              </div>
            </Cover>
            <div className="absolute bottom-0 right-2 flex items-end gap-1 text-navy sm:right-8">
              <HandArrow className="mb-5 h-9 w-14 -scale-x-100 rotate-[200deg] text-electric" />
              <p className="font-hand text-2xl leading-none sm:text-[1.7rem]">{tx.handNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Choose your path ───────────── */}
      <section id="explore" className="container-page pt-16 sm:pt-20">
        <SectionHeading eyebrow={tx.pathEyebrow} title={tx.pathTitle} description={tx.pathDescription} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PATHS.map((p) => {
            const Icon = p.icon;
            return (
              <Link key={p.href} href={p.href} className="group flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-electric/50 hover:shadow-lift">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-navy">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{p.text[lang]}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-electric">
                  {p.cta[lang]} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────────── Markets today ───────────── */}
      <MarketsToday items={news} />

      {/* ───────────── 500 Challenge band ───────────── */}
      <section className="mt-20 bg-navy py-16 text-white sm:mt-28 sm:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ice">
              <Trophy className="h-4 w-4" /> {tx.challengeEyebrow}
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-white sm:text-5xl">{tx.challengeTitle(CHALLENGE_TARGET)}</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ice-soft/85">
              {tx.challengeBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/challenge/" size="lg" variant="secondary" className="border-white/0">
                {tx.startChallenge} <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {STAGES.map((st, i) => (
              <li key={st.title} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-xs text-ice">
                  {tx.stage} {i + 1}
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug text-white">{lang === "es" ? (STAGE_TITLES_ES[i] ?? st.title) : st.title}</p>
                <p className="mt-1 text-xs text-ice-soft/70">
                  Q{i * STAGE_SIZE + 1}–{(i + 1) * STAGE_SIZE}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── Featured courses ───────────── */}
      <section className="container-page pt-20 sm:pt-28">
        <SectionHeading
          eyebrow={tx.featuredEyebrow}
          title={tx.featuredTitle}
          description={tx.featuredDescription}
          action={
            <ButtonLink href="/learn/" variant="secondary">
              {tx.allCourses} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          }
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {featured.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* ───────────── Question of the day + interview challenge ───────────── */}
      <section className="container-page grid gap-10 pt-20 sm:pt-28 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeading eyebrow={tx.qotdEyebrow} title={tx.qotdTitle} description={tx.qotdDescription} />
          <div className="mt-8">
            <QuestionOfTheDay />
          </div>
        </div>
        <div className="flex flex-col">
          <SectionHeading eyebrow={tx.interviewEyebrow} title={tx.interviewTitle} />
          <div className="mt-8 flex flex-1 flex-col rounded-3xl bg-navy p-6 text-white shadow-lift sm:p-8">
            <div className="space-y-4">
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-sm leading-relaxed">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ice">{tx.interviewer}</p>
                {tx.q1}
              </div>
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-electric px-4 py-3 text-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ice-soft">{tx.you}</p>
                {tx.a1}
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-sm leading-relaxed">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ice">{tx.interviewer}</p>
                {tx.q2}
              </div>
            </div>
            <p className="mt-6 text-sm text-ice-soft/80">
              {tx.interviewBody}
            </p>
            <div className="mt-auto pt-6">
              <ButtonLink href="/practice/session/?mode=interview" variant="secondary" className="border-white/0">
                {tx.startInterview} <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Featured tool ───────────── */}
      <section className="container-page pt-20 sm:pt-28">
        <SectionHeading
          eyebrow={tx.toolEyebrow}
          title={tx.toolTitle}
          description={tx.toolDescription}
          action={
            <ButtonLink href="/tools/wacc/" variant="secondary">
              {tx.fullWacc} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          }
        />
        <div className="mt-8">
          <WaccEv compact />
        </div>
      </section>

      {/* ───────────── Personal progress ───────────── */}
      <section className="container-page pt-20 sm:pt-28">
        <SectionHeading eyebrow={tx.journeyEyebrow} title={tx.journeyTitle} />
        <div className="mt-8">
          <ProgressPreview />
        </div>
      </section>
    </>
  );
}
