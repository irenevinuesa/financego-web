import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Clock, ListOrdered, Repeat, Zap } from "lucide-react";
import { QUESTIONS } from "@/content/questions";
import { TOPICS, TOPIC_IDS } from "@/content/taxonomy";
import type { TopicId } from "@/content/types";
import { getCourse, lessonHref } from "@/content/courses";
import { sectionInfo } from "@/content/practice-sections";
import { PageHeader } from "@/components/layout/PageHeader";
import { PracticeBank } from "@/components/practice/PracticeBank";
import { SectionProgress } from "@/components/practice/SectionProgress";
import { sectionIcon } from "@/components/practice/sectionIcons";
import { Card, SectionHeading } from "@/components/ui/primitives";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPIC_IDS.map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const t = TOPICS[section as TopicId];
  return { title: t ? `${t.label} · Practice` : "Practice", description: sectionInfo(section).intro };
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const topic = section as TopicId;
  const meta = TOPICS[topic];
  if (!meta) notFound();
  const info = sectionInfo(topic);
  const Icon = sectionIcon(topic);
  const n = QUESTIONS.filter((q) => q.topic === topic).length;
  const lessons = info.lessons
    .map((ref) => {
      const c = getCourse(ref.courseId);
      const l = c?.lessons.find((x) => x.id === ref.lessonId);
      return c && l ? { href: lessonHref(c.id, l.id), title: l.title, course: c.title } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const starts = [
    { href: `/practice/session/?mode=quick&topic=${topic}`, label: "Quick practice", detail: "5 questions", icon: Zap },
    { href: `/practice/session/?mode=timed&topic=${topic}`, label: "Timed challenge", detail: "10 questions in 12 minutes", icon: Clock },
    { href: `/practice/session/?mode=topic&topic=${topic}`, label: "All in order", detail: `${n} questions, easiest first`, icon: ListOrdered },
    { href: `/practice/session/?mode=review&topic=${topic}`, label: "Repeat missed", detail: "The ones you got wrong", icon: Repeat },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Technicals · Practice"
        title={meta.label}
        description={<p>{info.intro}</p>}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/technicals/", label: "Technicals" },
          { href: "/practice/", label: "Practice" },
          { label: meta.label },
        ]}
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white">
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-sm text-ink-muted">{n} questions in this section</span>
        </div>
      </PageHeader>

      <div className="container-page mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section>
          <SectionHeading eyebrow="Start" title="How do you want to practise?" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {starts.map(({ href, label, detail, icon: I }) => (
              <Link key={label} href={href} className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-card transition-colors hover:border-navy/50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ice-soft text-navy">
                  <I className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-navy">{label}</span>
                  <span className="block text-sm text-ink-muted">{detail}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-navy" />
              </Link>
            ))}
          </div>
        </section>
        <aside className="space-y-5">
          <Card className="p-5">
            <p className="mb-3 font-semibold text-navy">Your progress</p>
            <SectionProgress topic={topic} variant="full" />
          </Card>
          {info.focus.length > 0 && (
            <Card className="p-5">
              <p className="font-semibold text-navy">What interviewers focus on</p>
              <ul className="mt-2 space-y-1.5 text-sm text-ink">
                {info.focus.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {lessons.length > 0 && (
            <Card className="p-5">
              <p className="flex items-center gap-2 font-semibold text-navy">
                <BookOpen className="h-4 w-4" /> Learn the theory first
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {lessons.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-navy underline-offset-2 hover:underline">
                      {l.title}
                    </Link>
                    <span className="block text-xs text-ink-muted">{l.course}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>

      <section className="container-page mt-14">
        <SectionHeading eyebrow="Questions" title={`All ${meta.label} questions`} />
        <div className="mt-6">
          <PracticeBank fixedTopic={topic} />
        </div>
      </section>
    </>
  );
}
