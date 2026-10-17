import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, TriangleAlert } from "lucide-react";
import { COURSES, getLesson, lessonHref } from "@/content/courses";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { LessonBlocks } from "@/components/learn/LessonBlocks";
import { KnowledgeCheck, LessonNav, StudyTimer, VisitLesson } from "@/components/learn/LessonClient";
import { RichText } from "@/components/math/RichText";
import { Card } from "@/components/ui/primitives";

export const dynamicParams = false;

export function generateStaticParams() {
  return COURSES.flatMap((c) => c.lessons.map((l) => ({ courseId: c.id, lessonId: l.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ courseId: string; lessonId: string }> }): Promise<Metadata> {
  const { courseId, lessonId } = await params;
  const found = getLesson(courseId, lessonId);
  return { title: found ? `${found.lesson.title} · ${found.course.title}` : "Lesson", description: found?.lesson.summary };
}

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params;
  const found = getLesson(courseId, lessonId);
  if (!found) notFound();
  const { course, lesson, index } = found;
  const prev = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const nextHref = next ? lessonHref(course.id, next.id) : `/learn/${course.id}/assessment/`;
  const nextLabel = next ? `Next: ${next.title}` : "Final assessment";

  return (
    <>
      <StudyTimer />
      <VisitLesson courseId={course.id} lessonId={lesson.id} />
      <div className="container-page pt-8">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/learn/", label: "Learn" },
            { href: `/learn/${course.id}/`, label: course.title },
            { label: `Lesson ${index + 1}` },
          ]}
        />
      </div>

      <div className="container-page mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="min-w-0">
          <header className="animate-fade-up">
            <p className="eyebrow mb-3">
              Lesson {index + 1} of {course.lessons.length} · {course.title}
            </p>
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{lesson.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">{lesson.summary}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <Clock className="h-4 w-4" /> {lesson.minutes} min
            </p>
            <Card className="mt-6 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">By the end of this lesson you can</p>
              <ul className="mt-2 grid gap-1.5 text-sm text-ink sm:grid-cols-2">
                {lesson.objectives.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
                    {o}
                  </li>
                ))}
              </ul>
            </Card>
          </header>

          <div className="mt-10">
            <LessonBlocks blocks={lesson.blocks} />
          </div>

          <section aria-labelledby="mistakes-heading" className="mt-12 rounded-2xl border border-warning-ink/15 bg-warning-soft/50 p-5 sm:p-6">
            <h2 id="mistakes-heading" className="flex items-center gap-2 font-semibold text-navy">
              <TriangleAlert className="h-5 w-5 text-warning-ink" /> Common interview mistakes
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.95rem] text-ink">
              {lesson.mistakes.map((m) => (
                <li key={m}>
                  <RichText text={m} />
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-12">
            <KnowledgeCheck courseId={course.id} lessonId={lesson.id} questions={lesson.check} nextHref={nextHref} nextLabel={nextLabel} />
          </div>

          <nav aria-label="Lesson navigation" className="mt-10 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={lessonHref(course.id, prev.id)} className="group rounded-2xl border border-line bg-white p-4 hover:border-electric/60">
                <span className="flex items-center gap-1 text-xs text-ink-muted">
                  <ArrowLeft className="h-3.5 w-3.5" /> Previous
                </span>
                <span className="mt-1 block font-medium text-navy group-hover:text-electric">{prev.title}</span>
              </Link>
            ) : (
              <Link href={`/learn/${course.id}/`} className="group rounded-2xl border border-line bg-white p-4 hover:border-electric/60">
                <span className="flex items-center gap-1 text-xs text-ink-muted">
                  <ArrowLeft className="h-3.5 w-3.5" /> Course overview
                </span>
                <span className="mt-1 block font-medium text-navy group-hover:text-electric">{course.title}</span>
              </Link>
            )}
            <Link href={nextHref} className="group rounded-2xl border border-electric/30 bg-ice-soft/50 p-4 text-right hover:border-electric">
              <span className="flex items-center justify-end gap-1 text-xs text-ink-muted">
                Recommended next <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="mt-1 block font-medium text-navy group-hover:text-electric">{next ? next.title : "Final assessment"}</span>
            </Link>
          </nav>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <LessonNav courseId={course.id} currentLessonId={lesson.id} />
          </div>
        </aside>
      </div>
    </>
  );
}
