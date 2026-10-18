import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COURSES } from "@/content/courses";
import { QUESTIONS } from "@/content/questions";
import { TOPIC_IDS } from "@/content/taxonomy";
import { itemsForScope } from "@/content/interview";
import { CHALLENGE } from "@/lib/challenge";
import { TECHNICALS_LINKS } from "@/components/layout/nav";
import { PageHeader } from "@/components/layout/PageHeader";
import { TechnicalsProgress } from "@/components/technicals/TechnicalsProgress";

export const metadata: Metadata = {
  title: "Technicals",
  description: "Everything for technical finance interviews: theory courses, practice by section, the 500 Challenge and mock interviews.",
};

const AREAS = ["learn", "practice", "challenge", "interview"] as const;

export default function TechnicalsPage() {
  const details = [
    `${COURSES.length} complete courses with interactive lessons and final assessments`,
    `${QUESTIONS.length} questions in ${TOPIC_IDS.length} sections, with explanations`,
    `${CHALLENGE.length} questions in one mixed path that unlocks as you go`,
    `${itemsForScope("technical").length} scripted questions with follow-ups, in English or Spanish`,
  ];
  const steps = ["Learn the theory", "Drill it by section", "Prove it in the 500 Challenge", "Say it out loud in a mock interview"];

  return (
    <>
      <PageHeader
        eyebrow="Technicals"
        title="Master the technical interview"
        description={<p>Learn the theory, drill it section by section, work through the 500 Challenge, then put it all together in a mock interview.</p>}
        crumbs={[{ href: "/", label: "Home" }, { label: "Technicals" }]}
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
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Step {i + 1}</p>
                    <h2 className="font-serif text-2xl text-navy">{l.label}</h2>
                  </div>
                </div>
                <p className="mt-4 text-ink">{l.description}.</p>
                <p className="mt-1 text-sm text-ink-muted">{details[i]}</p>
                <TechnicalsProgress area={AREAS[i]} />
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-navy">
                  Open {l.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-16 bg-navy py-14 text-white">
        <div className="container-page">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ice">How to use it</p>
          <h2 className="mt-2 font-serif text-3xl text-white sm:text-4xl">A path that builds on itself</h2>
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
