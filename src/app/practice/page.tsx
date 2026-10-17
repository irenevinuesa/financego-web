import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, Clock, Layers, RotateCcw, Target, Zap } from "lucide-react";
import { QUESTIONS } from "@/content/questions";
import { TOPICS, TOPIC_IDS } from "@/content/taxonomy";
import { MODES, type PracticeMode } from "@/lib/practice";
import { PageHeader } from "@/components/layout/PageHeader";
import { PracticeBank } from "@/components/practice/PracticeBank";
import { ReviewCount } from "@/components/practice/ReviewCount";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Practice",
  description: "A finance question bank built on reasoning: multiple choice, numerical, open-ended, scenario and multi-step questions with explanations.",
};

const MODE_CARDS: { mode: PracticeMode; icon: typeof Zap; href: string }[] = [
  { mode: "quick", icon: Zap, href: "/practice/session/?mode=quick" },
  { mode: "standard", icon: Layers, href: "/practice/session/?mode=standard" },
  { mode: "timed", icon: Clock, href: "/practice/session/?mode=timed" },
  { mode: "topic", icon: Target, href: "/practice/session/?mode=topic" },
  { mode: "interview", icon: Briefcase, href: "/practice/session/?mode=interview" },
  { mode: "review", icon: RotateCcw, href: "/practice/session/?mode=review" },
];

export default function PracticePage() {
  const counts = TOPIC_IDS.map((t) => ({ t, n: QUESTIONS.filter((q) => q.topic === t).length }));
  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Practise the way interviews test you"
        description={
          <p>
            {QUESTIONS.length} questions across {TOPIC_IDS.length} topics that reward reasoning over memorisation. Every answer comes with an explanation, the relevant formula, common
            mistakes and a follow-up an interviewer might ask.
          </p>
        }
        crumbs={[{ href: "/", label: "Home" }, { label: "Practice" }]}
        scene="summit"
      />

      <section className="container-page pt-12">
        <SectionHeading eyebrow="Practice modes" title="Choose how you want to train" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODE_CARDS.map(({ mode, icon: Icon, href }) => (
            <Link key={mode} href={href} className="group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-electric/50">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ice-soft text-electric">
                  <Icon className="h-5 w-5" />
                </span>
                {mode === "review" && <ReviewCount />}
              </div>
              <h3 className="mt-4 font-semibold text-navy">{MODES[mode].title}</h3>
              <p className="mt-1 flex-1 text-sm text-ink-muted">{MODES[mode].description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-electric">
                Start <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pt-16">
        <SectionHeading eyebrow="By topic" title="Topic coverage" />
        <div className="mt-6 flex flex-wrap gap-2">
          {counts.map(({ t, n }) => (
            <Link key={t} href={`/practice/session/?mode=topic&topic=${t}`} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink hover:border-electric hover:text-electric">
              {TOPICS[t].label} <span className="rounded-full bg-cream px-1.5 text-xs text-ink-muted">{n}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pt-16" id="bank">
        <SectionHeading eyebrow="Question bank" title="Browse and filter" description="Filter by topic, difficulty, format, time, career track or your own history. Open any question, or practise the filtered set." />
        <div className="mt-6">
          <PracticeBank />
        </div>
        <p className="mt-6 text-xs text-ink-muted">
          Open-ended questions use a model answer and a transparent self-assessment checklist. FinanceGo does not pretend that keyword matching is an expert evaluation; AI-assisted
          feedback is planned for Version 2.
        </p>
      </section>
    </>
  );
}
