import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { BEHAVIOURAL_QUESTIONS } from "@/content/behaviourals/questions";
import { GUIDE_SECTIONS, WHAT_THEY_TEST } from "@/content/behaviourals/guide";
import { itemsForScope } from "@/content/interview";
import { BEHAVIOURALS_LINKS } from "@/components/layout/nav";
import { PageHeader } from "@/components/layout/PageHeader";
import { BehaviouralsProgress } from "@/components/behaviourals/BehaviouralsProgress";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Behaviourals",
  description: "Prepare for behavioural and fit interviews: the STAR method, a question library, your own story bank and a behavioural mock interview.",
};

const AREAS = ["questions", "stories", "interview"] as const;

export default function BehaviouralsPage() {
  const details = [
    `${BEHAVIOURAL_QUESTIONS.length} questions with what interviewers look for, a structure and pitfalls`,
    "Write your STAR stories once and map them to question categories",
    `${itemsForScope("behavioural").length} scripted questions with follow-ups, in English or Spanish`,
  ];

  return (
    <>
      <PageHeader
        eyebrow="Behaviourals"
        title="Tell your story with structure"
        description={<p>Behavioural and fit questions decide as many offers as technicals. Learn what interviewers test, prepare your stories once, then practise saying them out loud.</p>}
        crumbs={[{ href: "/", label: "Home" }, { label: "Behaviourals" }]}
        scene="london"
      />

      <section className="container-page pt-12">
        <div className="grid gap-5 md:grid-cols-3">
          {BEHAVIOURALS_LINKS.slice(1).map((l, i) => {
            const Icon = l.icon;
            return (
              <Link key={l.href} href={l.href} className="group flex flex-col rounded-3xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-navy/40 hover:shadow-lift">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-serif text-2xl text-navy">{l.label}</h2>
                <p className="mt-2 text-ink">{l.description}.</p>
                <p className="mt-1 text-sm text-ink-muted">{details[i]}</p>
                <div className="mt-auto">
                  <BehaviouralsProgress area={AREAS[i]} />
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-navy">
                    Open {l.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-16 bg-navy py-14 text-white">
        <div className="container-page">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ice">What interviewers are testing</p>
          <h2 className="mt-2 font-serif text-3xl text-white sm:text-4xl">Four things behind every behavioural question</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHAT_THEY_TEST.map((t) => (
              <div key={t.title} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <p className="font-semibold text-white">{t.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ice-soft/85">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="guide" className="container-page mt-14 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="Guide sections" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">The guide</p>
            <ol className="mt-3 space-y-1 border-l border-line">
              {GUIDE_SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-ink-muted hover:border-navy hover:text-navy">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="min-w-0 space-y-14">
          {GUIDE_SECTIONS.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
              <p className="eyebrow mb-2">Guide · {i + 1} of {GUIDE_SECTIONS.length}</p>
              <h2 id={`${s.id}-h`} className="font-serif text-3xl leading-tight">
                {s.title}
              </h2>
              <p className="mt-3 max-w-3xl text-[1.05rem] leading-relaxed text-ink">{s.intro}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {s.points.map((p) => (
                  <Card key={p.title} className="p-5">
                    <p className="flex items-center gap-2 font-semibold text-navy">
                      <CircleCheck className="h-4 w-4 shrink-0 text-electric" /> {p.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">{p.body}</p>
                  </Card>
                ))}
              </div>
              {s.example && (
                <div className="mt-5 rounded-2xl border border-ice bg-cream p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{s.example.label}</p>
                  <ul className="mt-3 space-y-2 text-[0.95rem] leading-relaxed text-ink">
                    {s.example.lines.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-ink-muted">An illustrative example, not a real candidate&apos;s answer.</p>
                </div>
              )}
            </section>
          ))}

          <Card className="flex flex-wrap items-center justify-between gap-4 border-navy/20 bg-ice-soft/60 p-6">
            <div>
              <p className="font-semibold text-navy">Ready to practise?</p>
              <p className="mt-1 text-sm text-ink-muted">Write your first story, then test it in the behavioural mock interview.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/behaviourals/stories/" className="inline-flex h-10 items-center rounded-full bg-electric px-5 text-sm font-medium text-white hover:bg-electric-dark">
                Open the story bank
              </Link>
              <Link href="/behaviourals/interview/" className="inline-flex h-10 items-center rounded-full border border-line-strong bg-white px-5 text-sm font-medium text-navy hover:border-electric">
                Mock interview
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
