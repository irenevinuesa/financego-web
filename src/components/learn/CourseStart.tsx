"use client";

import { ArrowRight } from "lucide-react";
import { getCourse, lessonHref } from "@/content/courses";
import { lessonKey, useHydrated, useStore } from "@/lib/store";
import { courseProgress } from "@/lib/progress";
import { ButtonLink } from "@/components/ui/Button";

/** “Start course” / “Continue” / “Review course”, depending on local progress. */
export function CourseStartButton({ courseId }: { courseId: string }) {
  const state = useStore();
  const hydrated = useHydrated();
  const course = getCourse(courseId)!;
  const p = courseProgress(state, course);
  const next = course.lessons.find((l) => !state.lessons[lessonKey(courseId, l.id)]);

  if (!hydrated || !p.started) {
    return (
      <ButtonLink href={lessonHref(courseId, course.lessons[0].id)} size="lg">
        Start the course <ArrowRight className="h-4 w-4" />
      </ButtonLink>
    );
  }
  if (next) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <ButtonLink href={lessonHref(courseId, next.id)} size="lg">
          Continue: {next.title} <ArrowRight className="h-4 w-4" />
        </ButtonLink>
        <span className="text-sm text-ink-muted">
          {p.completed}/{p.total} lessons complete
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ButtonLink href={`/learn/${courseId}/assessment/`} size="lg">
        {p.assessmentPassed ? "Review the assessment" : "Take the final assessment"} <ArrowRight className="h-4 w-4" />
      </ButtonLink>
      <span className="text-sm text-ink-muted">All lessons complete{p.assessmentPassed ? " · course passed" : ""}</span>
    </div>
  );
}
