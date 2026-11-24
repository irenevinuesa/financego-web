import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { ArrowRight, Briefcase, Clock, Layers, RotateCcw, Zap } from "lucide-react";
import { QUESTIONS } from "@/content/questions";
import { TOPICS, TOPIC_IDS } from "@/content/taxonomy";
import { sectionInfo } from "@/content/practice-sections";
import { MODES, type PracticeMode } from "@/lib/practice";
import { PageHeader } from "@/components/layout/PageHeader";
import { PracticeBank } from "@/components/practice/PracticeBank";
import { ReviewCount } from "@/components/practice/ReviewCount";
import { SectionProgress } from "@/components/practice/SectionProgress";
import { SECTION_ORDER, sectionIcon } from "@/components/practice/sectionIcons";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Practice",
  description: "Finance interview questions by section: accounting, valuation, M&A, private equity, capital markets and more, with instant feedback.",
};

const MIXED: { mode: PracticeMode; icon: typeof Zap; href: string }[] = [
  { mode: "quick", icon: Zap, href: "/practice/session/?mode=quick" },
  { mode: "standard", icon: Layers, href: "/practice/session/?mode=standard" },
  { mode: "timed", icon: Clock, href: "/practice/session/?mode=timed" },
  { mode: "interview", icon: Briefcase, href: "/practice/session/?mode=interview" },
  { mode: "review", icon: RotateCcw, href: "/practice/session/?mode=review" },
];

export default function PracticePage() {
  const sections = [...TOPIC_IDS].sort((a, b) => {
    const ia = SECTION_ORDER.indexOf(a);
    const ib = SECTION_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return (
    <>
      <PageHeader
        eyebrow="Technicals · Practice"
        title="Practice by section"
        description={
          <p>
            {QUESTIONS.length} interview questions in {sections.length} sections. Pick a section to drill it, or mix everything. Every answer comes with the explanation, the formula
            and the mistakes interviewers look for.
          </p>
        }
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/technicals/", label: "Technicals" },
          { label: "Practice" },
        ]}
        scene="nyc"
      />

      <section className="container-page pt-12">
        <SectionHeading eyebrow="Sections" title="Choose a section" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((t) => {
            const Icon = sectionIcon(t);
            const n = QUESTIONS.filter((q) => q.topic === t).length;
            return (
              <Link key={t} href={`/practice/${t}/`} className="group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-navy/40 hover:shadow-lift">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-ice-soft px-2.5 py-0.5 text-xs font-medium text-navy">{n} questions</span>
                </div>
                <h3 className="mt-4 font-semibold text-navy">{TOPICS[t].label}</h3>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-muted">{sectionInfo(t).intro}</p>
                <SectionProgress topic={t} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-16 bg-ice-soft/60 py-14">
        <div className="container-page">
          <SectionHeading eyebrow="Mixed practice" title="Or mix every section" description="Sessions draw from the whole bank, unanswered questions first." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {MIXED.map(({ mode, icon: Icon, href }) => (
              <Link key={mode} href={href} className="group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-navy/40">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ice-soft text-navy">
                    <Icon className="h-4 w-4" />
                  </span>
                  {mode === "review" && <ReviewCount />}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-navy">{MODES[mode].title}</h3>
                <p className="mt-1 flex-1 text-xs text-ink-muted">{MODES[mode].description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-navy">
                  Start <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-muted">
            Want a structured path instead? The{" "}
            <Link href="/challenge/" className="font-medium text-navy underline-offset-2 hover:underline">
              500 Challenge
            </Link>{" "}
            takes you through the whole bank in order, one question at a time.
          </p>
        </div>
      </section>

      <section className="container-page pt-14" id="bank">
        <SectionHeading eyebrow="All questions" title="Browse and filter" description="Filter by section, difficulty, format, time, career track or your own history." />
        <div className="mt-6">
          <PracticeBank />
        </div>
        <p className="mt-6 text-xs text-ink-muted">
          Open-ended questions use a model answer and a transparent self-assessment checklist; FinanceGo does not pretend keyword matching is an expert evaluation.
        </p>
      </section>
    </>
  );
}
