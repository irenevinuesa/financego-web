import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Calculator, CircleCheck, Clock, Construction, GraduationCap, Target } from "lucide-react";
import { ALL_COURSES, COURSES, getCourse, getCourseMeta, lessonHref } from "@/content/courses";
import { CATEGORIES, SKILLS, TOPICS } from "@/content/taxonomy";
import type { TopicId } from "@/content/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseCard, fmtMinutes } from "@/components/learn/CourseCard";
import { LessonNav } from "@/components/learn/LessonClient";
import { CourseStartButton } from "@/components/learn/CourseStart";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Card, DifficultyBadge } from "@/components/ui/primitives";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_COURSES.map((c) => ({ courseId: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const { courseId } = await params;
  const c = getCourseMeta(courseId);
  return { title: c?.title ?? "Course", description: c?.summary };
}

const CATEGORY_TOPICS: Record<string, TopicId[]> = {
  foundations: ["accounting", "corporate-finance"],
  "corporate-finance": ["corporate-finance", "valuation"],
  valuation: ["valuation"],
  "ib-ma": ["ma", "lbo"],
  markets: ["markets", "fixed-income", "derivatives"],
  macro: ["macro", "markets"],
  "pe-hf": ["lbo", "valuation"],
  quant: ["quant", "brain-teasers"],
};

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const meta = getCourseMeta(courseId);
  if (!meta) notFound();
  const course = getCourse(courseId);
  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/technicals/", label: "Technicals" },
    { href: "/learn/", label: "Learn" },
    { label: meta.title },
  ];

  /* ───────────── Planned course ───────────── */
  if (!course) {
    const topics = CATEGORY_TOPICS[meta.category] ?? [];
    return (
      <>
        <PageHeader
          eyebrow={CATEGORIES[meta.category].label}
          title={meta.title}
          description={<p>{meta.summary}</p>}
          crumbs={crumbs}
          scene={meta.scene}
        >
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge tone="warning">
              <Construction className="h-3.5 w-3.5" /> In development
            </Badge>
            <DifficultyBadge level={meta.difficulty} />
            <span className="text-sm text-ink-muted">
              Planned: {meta.lessonCount} lessons · about {fmtMinutes(meta.minutes)}
            </span>
          </div>
        </PageHeader>
        <div className="container-page mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Card className="p-6 sm:p-8">
            <h2 className="font-serif text-2xl">This course is being written</h2>
            <p className="mt-2 text-ink-muted">
              Its lessons are not available yet, so there is nothing to start here. We would rather show you an honest outline than a placeholder button.
            </p>
            {meta.plannedOutline && (
              <>
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-ink-muted">Planned outline</h3>
                <ol className="mt-3 space-y-2">
                  {meta.plannedOutline.map((o, i) => (
                    <li key={o} className="flex items-center gap-3 rounded-xl border border-dashed border-line-strong px-4 py-3 text-sm text-ink">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream text-xs text-ink-muted">{i + 1}</span>
                      {o}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </Card>
          <div className="space-y-5">
            <Card className="p-6">
              <h2 className="font-semibold text-navy">What you can do today</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {topics.map((t) => (
                  <li key={t}>
                    <Link href={`/practice/session/?mode=topic&topic=${t}`} className="flex items-center gap-2 text-electric hover:underline">
                      <Target className="h-4 w-4" /> Practise {TOPICS[t].label} questions
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/tools/" className="flex items-center gap-2 text-electric hover:underline">
                    <Calculator className="h-4 w-4" /> Use the financial tools
                  </Link>
                </li>
              </ul>
            </Card>
            <div>
              <p className="mb-3 text-sm font-semibold text-navy">Available courses</p>
              <div className="grid gap-4">
                {COURSES.slice(0, 2).map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ───────────── Available course ───────────── */
  return (
    <>
      <PageHeader eyebrow={CATEGORIES[course.category].label} title={course.title} description={<p>{course.summary}</p>} crumbs={crumbs} scene={course.scene}>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
          <DifficultyBadge level={course.difficulty} />
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {fmtMinutes(course.minutes)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" /> {course.lessons.length} lessons + final assessment
          </span>
        </div>
        <div className="mt-6">
          <CourseStartButton courseId={course.id} />
        </div>
      </PageHeader>

      <div className="container-page mt-12 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-10">
          <section>
            <h2 className="font-serif text-2xl">Course overview</h2>
            <p className="mt-3 text-[1.05rem] leading-relaxed text-ink">{course.overview}</p>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="flex items-center gap-2 font-semibold text-navy">
                <GraduationCap className="h-5 w-5 text-electric" /> Learning objectives
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-ink">
                {course.objectives.map((o) => (
                  <li key={o} className="flex gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {o}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-navy">Prerequisites</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink">
                {course.prerequisites.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <h3 className="mt-5 font-semibold text-navy">Skills it builds</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {course.skills.map((s) => (
                  <Badge key={s} tone="blue">
                    {SKILLS[s].label}
                  </Badge>
                ))}
              </div>
            </Card>
          </section>

          <section>
            <h2 className="font-serif text-2xl">Lessons</h2>
            <ol className="mt-5 space-y-3">
              {course.lessons.map((l, i) => (
                <li key={l.id}>
                  <Link href={lessonHref(course.id, l.id)} className="group flex items-start gap-4 rounded-2xl border border-line bg-white p-5 shadow-card transition-colors hover:border-electric/60">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ice-soft font-semibold text-navy">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-navy group-hover:text-electric">{l.title}</span>
                      <span className="mt-1 block text-sm text-ink-muted">{l.summary}</span>
                      <span className="mt-2 block text-xs text-ink-muted">
                        {l.minutes} min · {l.check.length}-question knowledge check
                      </span>
                    </span>
                    <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-ink-muted group-hover:text-electric" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href={`/learn/${course.id}/assessment/`} className="group flex items-start gap-4 rounded-2xl border border-navy/20 bg-navy p-5 text-white shadow-card">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 font-semibold">★</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">Final assessment</span>
                    <span className="mt-1 block text-sm text-ice-soft/85">
                      {course.assessment.length} questions across the course. Score 70% or more to complete the course.
                    </span>
                  </span>
                  <ArrowRight className="mt-2 h-4 w-4 shrink-0" />
                </Link>
              </li>
            </ol>
          </section>
        </div>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <LessonNav courseId={course.id} />
          <Card className="p-5 text-sm">
            <p className="font-semibold text-navy">Practise alongside</p>
            <p className="mt-1 text-ink-muted">Reinforce each lesson with questions from the Practice bank.</p>
            <ButtonLink href={`/practice/session/?mode=topic&topic=${course.skills[0] === "accounting" ? "accounting" : "valuation"}`} variant="secondary" size="sm" className="mt-3">
              Start a practice set
            </ButtonLink>
          </Card>
        </aside>
      </div>
    </>
  );
}
