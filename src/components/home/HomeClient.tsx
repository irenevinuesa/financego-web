"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Flame, MessagesSquare, Target, Trophy } from "lucide-react";
import { COURSES, lessonHref } from "@/content/courses";
import { questionOfTheDay } from "@/content/questions";
import { localDate, useHydrated, useStore } from "@/lib/store";
import { courseProgress, hasAnyProgress, nextLesson, practiceStats, streak } from "@/lib/progress";
import { challengeProgress } from "@/lib/challenge";
import { fmtDate } from "@/lib/format";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card, ProgressBar } from "@/components/ui/primitives";


export function QuestionOfTheDay() {
  const hydrated = useHydrated();
  const today = hydrated ? localDate() : "";
  const q = useMemo(() => (today ? questionOfTheDay(today) : null), [today]);
  if (!q) {
    return <div className="h-72 animate-pulse rounded-2xl border border-line bg-white" aria-label="Loading today's question" />;
  }
  return (
    <div>
      <p className="mb-3 text-sm text-ink-muted">{fmtDate(today, { weekday: "long", day: "numeric", month: "long" })}</p>
      <QuestionCard key={q.id} question={q} source="qotd" />
    </div>
  );
}

export function ProgressPreview() {
  const state = useStore();
  const hydrated = useHydrated();
  const derived = useMemo(() => {
    const stats = practiceStats(state);
    const inProgress = COURSES.map((c) => ({ c, p: courseProgress(state, c) })).filter((x) => x.p.started && x.p.pct < 1);
    return { stats, inProgress, streak: streak(state), challenge: challengeProgress(state.challenge), next: nextLesson(state) };
  }, [state]);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-3xl bg-white/60" />;

  if (!hasAnyProgress(state)) {
    return (
      <Card className="grid gap-6 overflow-hidden p-6 sm:p-8 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div>
          <p className="eyebrow mb-2">Your progress</p>
          <h3 className="font-serif text-3xl leading-tight">Start tracking. No sign-up needed.</h3>
          <p className="mt-3 text-ink-muted">
            Complete a lesson or answer a question and FinanceGo starts building your dashboard: courses in progress, accuracy by section, your 500 Challenge
            progress and your interview stories. Everything is saved privately in this browser.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={lessonHref(derived.next.course.id, derived.next.lesson.id)}>
              Start your first lesson <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/challenge/" variant="secondary">
              Start the 500 Challenge
            </ButtonLink>
          </div>
          <p className="mt-4 text-xs text-ink-muted">Accounts with cross-device sync are planned for Version 2.</p>
        </div>
        <ul className="space-y-3 text-sm">
          {["Courses in progress", "Questions answered and accuracy", "500 Challenge progress", "Behavioural story bank", "Recommended next lesson"].map((t) => (
            <li key={t} className="flex items-center gap-3 rounded-xl bg-cream/70 px-4 py-3 text-ink">
              <span className="h-2 w-2 rounded-full bg-electric" /> {t}
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  const { stats, inProgress, challenge, next } = derived;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        <p className="eyebrow mb-2">Recommended next lesson</p>
        <h3 className="font-serif text-2xl">{next.lesson.title}</h3>
        <p className="mt-1 text-sm text-ink-muted">
          {next.course.title} · {next.lesson.minutes} min
        </p>
        <p className="mt-3 text-sm text-ink">{next.lesson.summary}</p>
        <ButtonLink href={lessonHref(next.course.id, next.lesson.id)} className="mt-5">
          {next.resume ? "Continue learning" : "Start lesson"} <ArrowRight className="h-4 w-4" />
        </ButtonLink>
        {inProgress.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {inProgress.slice(0, 2).map(({ c, p }) => (
              <Link key={c.id} href={`/learn/${c.id}/`} className="rounded-xl border border-line p-3 hover:border-electric">
                <p className="text-sm font-medium text-navy">{c.title}</p>
                <ProgressBar value={p.pct} className="mt-2" label={`${c.title} progress`} />
                <p className="mt-1 text-xs text-ink-muted">
                  {p.completed}/{p.total} lessons
                </p>
              </Link>
            ))}
          </div>
        )}
      </Card>
      <div className="grid gap-4">
        <Card className="grid grid-cols-2 gap-4 p-5">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Target className="h-3.5 w-3.5" /> Questions answered
            </p>
            <p className="mt-1 text-2xl font-semibold text-navy">{stats.attempted}</p>
            <p className="text-xs text-ink-muted">{stats.accuracy === null ? "No graded answers yet" : `${Math.round(stats.accuracy * 100)}% accuracy`}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Flame className="h-3.5 w-3.5" /> Learning streak
            </p>
            <p className="mt-1 text-2xl font-semibold text-navy">
              {derived.streak.current} day{derived.streak.current === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-ink-muted">Best: {derived.streak.best}</p>
          </div>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
            <Trophy className="h-4 w-4 text-electric" /> 500 Challenge
          </p>
          <p className="mt-2 text-2xl font-semibold text-navy">
            {challenge.answered}
            <span className="text-base font-normal text-ink-muted">/{challenge.total}</span>
          </p>
          <ProgressBar value={challenge.total ? challenge.answered / challenge.total : 0} className="mt-2" label="500 Challenge progress" />
          <p className="mt-1.5 text-xs text-ink-muted">
            {challenge.missed.length} to repeat{challenge.accuracy === null ? "" : ` · ${Math.round(challenge.accuracy * 100)}% correct`}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <Link href={challenge.done ? "/challenge/" : "/challenge/play/"} className="inline-flex items-center gap-1 text-sm font-medium text-electric hover:underline">
              {challenge.answered ? "Continue" : "Start"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/technicals/interview/" className="inline-flex items-center gap-1 text-sm font-medium text-electric hover:underline">
              <MessagesSquare className="h-3.5 w-3.5" /> Mock interview
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
