"use client";

import { getCourse } from "@/content/courses";
import { useHydrated, useStore } from "@/lib/store";
import { courseProgress } from "@/lib/progress";
import { ProgressBar } from "@/components/ui/primitives";

/** Progress bar under a featured course card, shown only when the learner has started it. */
export function CourseProgressPill({ courseId }: { courseId: string }) {
  const state = useStore();
  const hydrated = useHydrated();
  const course = getCourse(courseId);
  if (!hydrated || !course) return null;
  const p = courseProgress(state, course);
  if (!p.started) return null;
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-xs text-ink-muted">
        <span>Your progress</span>
        <span>
          {p.completed}/{p.total} lessons
        </span>
      </div>
      <ProgressBar value={p.pct} tone={p.pct === 1 ? "success" : "blue"} label={`${course.title} progress`} />
    </div>
  );
}
