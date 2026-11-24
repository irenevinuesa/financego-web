"use client";

import Link from "@/components/i18n/Link";
import { useState } from "react";
import { ArrowRight, Award, RotateCcw } from "lucide-react";
import type { Question } from "@/content/types";
import { getCourse, NEXT_COURSE } from "@/content/courses";
import { actions, useHydrated, useStore } from "@/lib/store";
import { FeedbackPanel, QuestionCard, type QuestionOutcome } from "@/components/practice/QuestionCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/primitives";
import { RichText } from "@/components/math/RichText";
import { cn } from "@/lib/cn";

const PASS = 0.7;

export function Assessment({ courseId, questions }: { courseId: string; questions: Question[] }) {
  const state = useStore();
  const hydrated = useHydrated();
  const [results, setResults] = useState<Record<string, QuestionOutcome>>({});
  const [submitted, setSubmitted] = useState(false);
  const [round, setRound] = useState(0);
  const answered = Object.keys(results).length;
  const correct = Object.values(results).filter((r) => r.result === "correct").length;
  const score = questions.length ? correct / questions.length : 0;
  const prior = hydrated ? state.assessments[courseId] : undefined;
  const nextCourse = NEXT_COURSE[courseId] ? getCourse(NEXT_COURSE[courseId]) : undefined;

  const submit = () => {
    actions.recordAssessment(courseId, score, PASS);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    const passed = score >= PASS;
    return (
      <div className="space-y-6">
        <Card className={cn("p-6 sm:p-8", passed ? "border-success/40" : "border-warning-ink/30")}>
          <div className="flex flex-wrap items-center gap-5">
            <span className={cn("flex h-16 w-16 items-center justify-center rounded-2xl", passed ? "bg-success-soft text-success-ink" : "bg-warning-soft text-warning-ink")}>
              <Award className="h-8 w-8" />
            </span>
            <div>
              <p className="text-3xl font-semibold text-navy">{Math.round(score * 100)}%</p>
              <p className="text-sm text-ink-muted">
                {correct} of {questions.length} correct · pass mark {PASS * 100}%
              </p>
            </div>
          </div>
          <p className="mt-4 text-ink">
            {passed
              ? "You passed. The course is marked complete in your Tracker."
              : "Not yet. Review the explanations below, revisit the lessons they link to, and try again. Only your best score is kept."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setResults({});
                setSubmitted(false);
                setRound((r) => r + 1);
              }}
            >
              <RotateCcw className="h-4 w-4" /> Retake
            </Button>
            {passed && nextCourse && (
              <ButtonLink href={`/learn/${nextCourse.id}/`}>
                Next course: {nextCourse.title} <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            )}
            <ButtonLink href="/dashboard/" variant="ghost">
              View your dashboard
            </ButtonLink>
          </div>
        </Card>

        <h2 className="font-serif text-2xl">Review</h2>
        {questions.map((q, i) => {
          const r = results[q.id];
          return (
            <Card key={q.id} className="p-5 sm:p-6">
              <p className="font-semibold text-navy">
                <span className="mr-1.5 text-ink-muted">{i + 1}.</span>
                <RichText text={q.prompt} />
              </p>
              <FeedbackPanel question={q} correct={r ? r.result === "correct" : false} compact />
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4" key={round}>
      {prior && (
        <p className="rounded-xl bg-ice-soft/60 px-4 py-3 text-sm text-navy">
          Previous best: <strong>{Math.round(prior.bestScore * 100)}%</strong> over {prior.attempts} attempt{prior.attempts === 1 ? "" : "s"}
          {prior.passed ? " · passed" : ""}. A new attempt never lowers your best score.
        </p>
      )}
      {questions.map((q, i) => (
        <QuestionCard key={q.id} question={q} number={i + 1} source="assessment" compact deferFeedback onAnswered={(o) => setResults((r) => ({ ...r, [q.id]: o }))} />
      ))}
      <Card className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm text-ink">
          {answered}/{questions.length} answered{answered < questions.length ? " · answer every question to submit" : ""}
        </p>
        <Button onClick={submit} disabled={answered < questions.length}>
          Submit assessment
        </Button>
      </Card>
      <p className="text-xs text-ink-muted">
        Answers lock as you go and feedback appears after you submit. Lost? Go back to the{" "}
        <Link href={`/learn/${courseId}/`} className="text-electric hover:underline">
          course overview
        </Link>
        .
      </p>
    </div>
  );
}
