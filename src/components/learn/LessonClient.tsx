"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, CircleCheck, RotateCcw } from "lucide-react";
import type { Question } from "@/content/types";
import { getCourse, lessonHref } from "@/content/courses";
import { actions, lessonKey, useHydrated, useStore } from "@/lib/store";
import { courseProgress } from "@/lib/progress";
import { cn } from "@/lib/cn";
import { QuestionCard, type QuestionOutcome } from "@/components/practice/QuestionCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/primitives";

/** Counts active study time (tab visible and recent interaction) and saves it in 30-second batches. */
export function StudyTimer() {
  const pending = useRef(0);
  const lastActive = useRef(Date.now());
  useEffect(() => {
    const touch = () => (lastActive.current = Date.now());
    const events = ["mousemove", "keydown", "scroll", "touchstart", "pointerdown"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const tick = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastActive.current < 120_000) pending.current += 5;
    }, 5000);
    const flush = setInterval(() => {
      if (pending.current > 0) {
        actions.addStudySeconds(pending.current);
        pending.current = 0;
      }
    }, 30_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      clearInterval(tick);
      clearInterval(flush);
      if (pending.current > 0) actions.addStudySeconds(pending.current);
      pending.current = 0;
    };
  }, []);
  return null;
}

export function VisitLesson({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  useEffect(() => {
    actions.visitLesson(courseId, lessonId);
  }, [courseId, lessonId]);
  return null;
}

/** Sidebar list of the course's lessons with completion ticks. */
export function LessonNav({ courseId, currentLessonId }: { courseId: string; currentLessonId?: string }) {
  const state = useStore();
  const hydrated = useHydrated();
  const course = getCourse(courseId)!;
  const p = courseProgress(state, course);
  return (
    <nav aria-label="Course lessons" className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{course.title}</p>
      {hydrated && (
        <div className="mt-2">
          <ProgressBar value={p.pct} tone={p.pct === 1 ? "success" : "blue"} label="Course progress" />
          <p className="mt-1 text-xs text-ink-muted">
            {p.completed} of {p.total} lessons complete
          </p>
        </div>
      )}
      <ol className="mt-3 space-y-1">
        {course.lessons.map((l, i) => {
          const done = hydrated && Boolean(state.lessons[lessonKey(courseId, l.id)]);
          const current = l.id === currentLessonId;
          return (
            <li key={l.id}>
              <Link
                href={lessonHref(courseId, l.id)}
                aria-current={current ? "page" : undefined}
                className={cn("flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors", current ? "bg-ice-soft font-medium text-navy" : "text-ink hover:bg-cream")}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.65rem]",
                    done ? "border-success bg-success text-white" : current ? "border-electric text-electric" : "border-line-strong text-ink-muted",
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span>{l.title}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <Link href={`/learn/${courseId}/assessment/`} className="flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm text-ink hover:bg-cream">
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.65rem]",
                hydrated && p.assessmentPassed ? "border-success bg-success text-white" : "border-line-strong text-ink-muted",
              )}
            >
              {hydrated && p.assessmentPassed ? <Check className="h-3 w-3" /> : "★"}
            </span>
            <span>Final assessment</span>
          </Link>
        </li>
      </ol>
    </nav>
  );
}

/** Knowledge check at the end of a lesson, plus the "complete lesson" action. */
export function KnowledgeCheck({ courseId, lessonId, questions, nextHref, nextLabel }: { courseId: string; lessonId: string; questions: Question[]; nextHref: string; nextLabel: string }) {
  const state = useStore();
  const hydrated = useHydrated();
  const [results, setResults] = useState<Record<string, QuestionOutcome>>({});
  const [round, setRound] = useState(0);
  const completed = hydrated ? state.lessons[lessonKey(courseId, lessonId)] : undefined;
  const answered = Object.keys(results).length;
  const correct = useMemo(() => Object.values(results).filter((r) => r.result === "correct").length, [results]);
  const allAnswered = answered === questions.length;

  return (
    <section aria-labelledby="check-heading" className="rounded-3xl border border-line bg-cream-deep/50 p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Knowledge check</p>
          <h2 id="check-heading" className="font-serif text-2xl text-navy">
            Check your understanding
          </h2>
          <p className="mt-1 text-sm text-ink-muted">Answer all {questions.length} questions to complete the lesson. Your answers count towards your skills profile.</p>
        </div>
        <p className="text-sm font-medium text-navy">
          {answered}/{questions.length} answered
        </p>
      </div>
      <div className="mt-5 space-y-4" key={round}>
        {questions.map((q, i) => (
          <QuestionCard key={q.id} question={q} number={i + 1} source="lesson" compact onAnswered={(o) => setResults((r) => ({ ...r, [q.id]: o }))} />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5">
        {completed && !allAnswered ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-medium text-success-ink">
              <CircleCheck className="h-5 w-5" /> Lesson completed · knowledge check {completed.checkCorrect}/{completed.checkTotal}
            </p>
            <ButtonLink href={nextHref}>
              {nextLabel} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        ) : allAnswered ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-navy">
                You scored {correct}/{questions.length}
              </p>
              <p className="text-sm text-ink-muted">{correct === questions.length ? "Excellent. You're ready for the next lesson." : "Review the explanations above, then continue, or retry the check."}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setResults({});
                  setRound((r) => r + 1);
                }}
              >
                <RotateCcw className="h-4 w-4" /> Retry
              </Button>
              {completed ? (
                <ButtonLink href={nextHref}>
                  {nextLabel} <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              ) : (
                <Button onClick={() => actions.completeLesson(courseId, lessonId, correct, questions.length)}>
                  <Check className="h-4 w-4" /> Mark lesson complete
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">Answer every question above to unlock “Mark lesson complete”.</p>
        )}
        {completed && allAnswered && (
          <p className="mt-3 flex items-center gap-2 text-sm text-success-ink">
            <CircleCheck className="h-4 w-4" /> Saved to your Tracker.
          </p>
        )}
      </div>
    </section>
  );
}
