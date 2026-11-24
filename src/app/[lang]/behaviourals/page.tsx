import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { BEHAVIOURAL_QUESTIONS } from "@/content/behaviourals/questions";
import { GUIDE_SECTIONS, WHAT_THEY_TEST } from "@/content/behaviourals/guide";
import { BEHAVIOURALS_LINKS } from "@/components/layout/nav";
import { PageHeader } from "@/components/layout/PageHeader";
import { getLang } from "@/lib/server-lang";
import { BehaviouralsProgress } from "@/components/behaviourals/BehaviouralsProgress";
import { Card } from "@/components/ui/primitives";

const TEXT = {
  en: {
    metaDescription: "Prepare for behavioural and fit interviews: the STAR method, a question library, and your own story bank.",
    title: "Tell your story with structure",
    description:
      "Behavioural and fit questions decide as many offers as technicals. Learn what interviewers test, prepare your stories once, then practise saying them out loud.",
    home: "Home",
    details: (n: number) => [
      `${n} questions with what interviewers look for, a structure and pitfalls`,
      "Write your STAR stories once and map them to question categories",
    ],
    open: (label: string) => `Open ${label}`,
    testingEyebrow: "What interviewers are testing",
    testingTitle: "Four things behind every behavioural question",
    guideNav: "Guide sections",
    theGuide: "The guide",
    guideOf: (i: number, n: number) => `Guide · ${i} of ${n}`,
    illustrative: "An illustrative example, not a real candidate's answer.",
    ready: "Ready to practise?",
    readyBody: "Write your first story, then check it against the question library.",
    openStories: "Open the story bank",
    library: "Question library",
  },
  es: {
    metaDescription: "Prepárate para entrevistas behavioural y de fit: el método STAR, una biblioteca de preguntas y tu propio banco de historias.",
    title: "Cuenta tu historia con estructura",
    description:
      "Las preguntas behavioural y de fit deciden tantas ofertas como los technicals. Aprende qué evalúan los entrevistadores, prepara tus historias una vez y practica contándolas en voz alta.",
    home: "Inicio",
    details: (n: number) => [
      `${n} preguntas con lo que buscan los entrevistadores, una estructura y errores a evitar`,
      "Escribe tus historias STAR una vez y asígnalas a las categorías de preguntas",
    ],
    open: (label: string) => `Abrir ${label}`,
    testingEyebrow: "Qué evalúan los entrevistadores",
    testingTitle: "Cuatro cosas detrás de cada pregunta behavioural",
    guideNav: "Secciones de la guía",
    theGuide: "La guía",
    guideOf: (i: number, n: number) => `Guía · ${i} de ${n}`,
    illustrative: "Un ejemplo ilustrativo, no la respuesta de un candidato real.",
    ready: "¿Listo para practicar?",
    readyBody: "Escribe tu primera historia y compárala con la biblioteca de preguntas.",
    openStories: "Abrir el banco de historias",
    library: "Biblioteca de preguntas",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: "Behaviourals", description: TEXT[lang].metaDescription };
}

const AREAS = ["questions", "stories"] as const;

export default async function BehaviouralsPage() {
  const lang = await getLang();
  const tx = TEXT[lang];
  const details = tx.details(BEHAVIOURAL_QUESTIONS.length);

  return (
    <>
      <PageHeader
        eyebrow="Behaviourals"
        title={tx.title}
        description={<p>{tx.description}</p>}
        crumbs={[{ href: "/", label: tx.home }, { label: "Behaviourals" }]}
        scene="london"
      />

      <section className="container-page pt-12">
        <div className="grid gap-5 md:grid-cols-2">
          {BEHAVIOURALS_LINKS.slice(1).map((l, i) => {
            const Icon = l.icon;
            return (
              <Link key={l.href} href={l.href} className="group flex flex-col rounded-3xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-navy/40 hover:shadow-lift">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-serif text-2xl text-navy">{l.label[lang]}</h2>
                <p className="mt-2 text-ink">{l.description[lang]}.</p>
                <p className="mt-1 text-sm text-ink-muted">{details[i]}</p>
                <div className="mt-auto">
                  <BehaviouralsProgress area={AREAS[i]} />
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-navy">
                    {tx.open(l.label[lang])} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-16 bg-navy py-14 text-white">
        <div className="container-page">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ice">{tx.testingEyebrow}</p>
          <h2 className="mt-2 font-serif text-3xl text-white sm:text-4xl">{tx.testingTitle}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHAT_THEY_TEST.map((t) => (
              <div key={t.title.en} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <p className="font-semibold text-white">{t.title[lang]}</p>
                <p className="mt-2 text-sm leading-relaxed text-ice-soft/85">{t.body[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="guide" className="container-page mt-14 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label={tx.guideNav} className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{tx.theGuide}</p>
            <ol className="mt-3 space-y-1 border-l border-line">
              {GUIDE_SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-ink-muted hover:border-navy hover:text-navy">
                    {s.title[lang]}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="min-w-0 space-y-14">
          {GUIDE_SECTIONS.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
              <p className="eyebrow mb-2">{tx.guideOf(i + 1, GUIDE_SECTIONS.length)}</p>
              <h2 id={`${s.id}-h`} className="font-serif text-3xl leading-tight">
                {s.title[lang]}
              </h2>
              <p className="mt-3 max-w-3xl text-[1.05rem] leading-relaxed text-ink">{s.intro[lang]}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {s.points.map((p) => (
                  <Card key={p.title.en} className="p-5">
                    <p className="flex items-center gap-2 font-semibold text-navy">
                      <CircleCheck className="h-4 w-4 shrink-0 text-electric" /> {p.title[lang]}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">{p.body[lang]}</p>
                  </Card>
                ))}
              </div>
              {s.example && (
                <div className="mt-5 rounded-2xl border border-ice bg-cream p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{s.example.label[lang]}</p>
                  <ul className="mt-3 space-y-2 text-[0.95rem] leading-relaxed text-ink">
                    {s.example.lines.map((l) => (
                      <li key={l.en}>{l[lang]}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-ink-muted">{tx.illustrative}</p>
                </div>
              )}
            </section>
          ))}

          <Card className="flex flex-wrap items-center justify-between gap-4 border-navy/20 bg-ice-soft/60 p-6">
            <div>
              <p className="font-semibold text-navy">{tx.ready}</p>
              <p className="mt-1 text-sm text-ink-muted">{tx.readyBody}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/behaviourals/stories/" className="inline-flex h-10 items-center rounded-full bg-electric px-5 text-sm font-medium text-white hover:bg-electric-dark">
                {tx.openStories}
              </Link>
              <Link href="/behaviourals/questions/" className="inline-flex h-10 items-center rounded-full border border-line-strong bg-white px-5 text-sm font-medium text-navy hover:border-electric">
                {tx.library}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
