import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { ArrowRight } from "lucide-react";
import { COURSES } from "@/content/courses";
import { QUESTIONS } from "@/content/questions";
import { TOPIC_IDS } from "@/content/taxonomy";
import { MOCK_LEVELS, MOCK_QUESTIONS } from "@/content/mock-interview";
import { CHALLENGE } from "@/lib/challenge";
import { TECHNICALS_LINKS } from "@/components/layout/nav";
import { PageHeader } from "@/components/layout/PageHeader";
import { getLang } from "@/lib/server-lang";
import { TechnicalsProgress } from "@/components/technicals/TechnicalsProgress";

const TEXT = {
  en: {
    metaDescription: "Everything for technical finance interviews: theory courses, practice by section, the 500 Challenge and a timed mock interview.",
    title: "Master the technical interview",
    description: "Learn the theory, drill it section by section, work through the 500 Challenge, then beat the clock in the mock interview.",
    home: "Home",
    details: (c: { courses: number; questions: number; sections: number; challenge: number; mock: number; levels: number }) => [
      `${c.courses} complete courses with interactive lessons and final assessments`,
      `${c.questions} questions in ${c.sections} sections, with explanations`,
      `${c.challenge} questions in one mixed path that unlocks as you go`,
      `${c.mock} numeric questions in ${c.levels} levels, each with its own time limit`,
    ],
    steps: ["Learn the theory", "Drill it by section", "Prove it in the 500 Challenge", "Beat the clock in the mock interview"],
    step: (n: number) => `Step ${n}`,
    open: (label: string) => `Open ${label}`,
    howTo: "How to use it",
    pathTitle: "A path that builds on itself",
  },
  es: {
    metaDescription: "Todo para las entrevistas técnicas de finanzas: cursos de teoría, práctica por secciones, el 500 Challenge y un Mock interview cronometrado.",
    title: "Domina la entrevista técnica",
    description: "Aprende la teoría, practícala sección a sección, completa el 500 Challenge y gana al reloj en el Mock interview.",
    home: "Inicio",
    details: (c: { courses: number; questions: number; sections: number; challenge: number; mock: number; levels: number }) => [
      `${c.courses} cursos completos con lecciones interactivas y evaluaciones finales`,
      `${c.questions} preguntas en ${c.sections} secciones, con explicaciones`,
      `${c.challenge} preguntas en un único recorrido mixto que se desbloquea a medida que avanzas`,
      `${c.mock} preguntas numéricas en ${c.levels} niveles, cada uno con su propio límite de tiempo`,
    ],
    steps: ["Aprende la teoría", "Practícala por secciones", "Demuéstralo en el 500 Challenge", "Gana al reloj en el Mock interview"],
    step: (n: number) => `Paso ${n}`,
    open: (label: string) => `Abrir ${label}`,
    howTo: "Cómo usarlo",
    pathTitle: "Un recorrido que se construye sobre sí mismo",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: "Technicals", description: TEXT[lang].metaDescription };
}

const AREAS = ["learn", "practice", "challenge", "interview"] as const;

export default async function TechnicalsPage() {
  const lang = await getLang();
  const tx = TEXT[lang];
  const details = tx.details({
    courses: COURSES.length,
    questions: QUESTIONS.length,
    sections: TOPIC_IDS.length,
    challenge: CHALLENGE.length,
    mock: MOCK_QUESTIONS.length,
    levels: MOCK_LEVELS.length,
  });
  const steps = tx.steps;

  return (
    <>
      <PageHeader
        eyebrow="Technicals"
        title={tx.title}
        description={<p>{tx.description}</p>}
        crumbs={[{ href: "/", label: tx.home }, { label: "Technicals" }]}
        scene="alps"
      />

      <section className="container-page pt-12">
        <div className="grid gap-5 md:grid-cols-2">
          {TECHNICALS_LINKS.map((l, i) => {
            const Icon = l.icon;
            return (
              <Link key={l.href} href={l.href} className="group flex flex-col rounded-3xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-navy/40 hover:shadow-lift sm:p-7">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{tx.step(i + 1)}</p>
                    <h2 className="font-serif text-2xl text-navy">{l.label[lang]}</h2>
                  </div>
                </div>
                <p className="mt-4 text-ink">{l.description[lang]}.</p>
                <p className="mt-1 text-sm text-ink-muted">{details[i]}</p>
                <TechnicalsProgress area={AREAS[i]} />
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-navy">
                  {tx.open(l.label[lang])} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-16 bg-navy py-14 text-white">
        <div className="container-page">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ice">{tx.howTo}</p>
          <h2 className="mt-2 font-serif text-3xl text-white sm:text-4xl">{tx.pathTitle}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <span className="font-serif text-4xl text-ice">{i + 1}</span>
                <p className="mt-2 font-medium text-white">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
