"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BookOpen, CircleCheck, CircleDot, CircleX, Clock, Flag, RotateCcw, SkipForward } from "lucide-react";
import type { QuestionTypeFilter } from "@/content/questions";
import { getCourse, lessonHref } from "@/content/courses";
import { TOPICS, TOPIC_IDS, TRACKS, TRACK_IDS } from "@/content/taxonomy";
import type { Difficulty, Question, TopicId, TrackId } from "@/content/types";
import { useHydrated, useStore } from "@/lib/store";
import { incorrectQuestionIds, latestAttempts } from "@/lib/progress";
import { buildQueue, MODES, type BankFilters, type PracticeMode } from "@/lib/practice";
import { cn } from "@/lib/cn";
import { QuestionCard, type QuestionOutcome } from "./QuestionCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, EmptyState, ProgressBar } from "@/components/ui/primitives";
import { StudyTimer } from "@/components/learn/LessonClient";

type Result = QuestionOutcome | "skipped";

function readMode(v: string | null): PracticeMode {
  return v && v in MODES ? (v as PracticeMode) : "quick";
}

/** Topic or track chooser for modes that need one. */
function Picker({ mode }: { mode: "topic" | "interview" }) {
  return (
    <Card className="p-6 sm:p-8">
      <h2 className="font-serif text-2xl">{mode === "topic" ? "Choose a topic to master" : "Choose a career track"}</h2>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {mode === "topic"
          ? TOPIC_IDS.map((t) => (
              <Link key={t} href={`/practice/session/?mode=topic&topic=${t}`} className="rounded-xl border border-line px-4 py-3 text-sm font-medium text-navy hover:border-electric hover:text-electric">
                {TOPICS[t].label}
              </Link>
            ))
          : TRACK_IDS.map((t) => (
              <Link key={t} href={`/practice/session/?mode=interview&track=${t}`} className="rounded-xl border border-line px-4 py-3 text-sm font-medium text-navy hover:border-electric hover:text-electric">
                {TRACKS[t].label}
              </Link>
            ))}
      </div>
    </Card>
  );
}

export function PracticeSession() {
  const params = useSearchParams();
  const state = useStore();
  const hydrated = useHydrated();
  const mode = readMode(params.get("mode"));
  const paramsKey = params.toString();
  const filters: BankFilters = useMemo(
    () => ({
      topic: (params.get("topic") as TopicId) || "",
      difficulty: (params.get("difficulty") as Difficulty) || "",
      type: (params.get("type") as QuestionTypeFilter) || "",
      track: (params.get("track") as TrackId) || "",
      maxMinutes: Number(params.get("maxMinutes") ?? 0) || 0,
      status: (params.get("status") as BankFilters["status"]) || "",
    }),
    // Keyed on the URL string so re-renders never rebuild the queue mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paramsKey],
  );

  const [queue, setQueue] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [finished, setFinished] = useState(false);
  const [seed, setSeed] = useState(0);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const snapshot = useRef(state);
  snapshot.current = state;

  // Build the queue once the browser state is available (and again on restart).
  useEffect(() => {
    if (!hydrated) return;
    const s = snapshot.current;
    const q = buildQueue(mode, filters, latestAttempts(s), incorrectQuestionIds(s));
    setQueue(q);
    setIndex(0);
    setResults({});
    setFinished(false);
    setDeadline(mode === "timed" && q.length ? Date.now() + (MODES.timed.minutes ?? 12) * 60_000 : null);
  }, [hydrated, mode, filters, seed]);

  useEffect(() => {
    if (!deadline || finished) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [deadline, finished]);

  const remaining = deadline ? Math.max(0, deadline - now) : null;
  useEffect(() => {
    if (remaining === 0 && !finished) setFinished(true);
  }, [remaining, finished]);

  const needsPicker = (mode === "topic" && !filters.topic) || (mode === "interview" && !filters.track);
  const title = MODES[mode].title + (mode === "topic" && filters.topic ? `: ${TOPICS[filters.topic].label}` : mode === "interview" && filters.track ? `: ${TRACKS[filters.track].label}` : "");

  if (needsPicker) return <Picker mode={mode as "topic" | "interview"} />;
  if (!queue) return <div className="h-80 animate-pulse rounded-2xl border border-line bg-white" aria-label="Preparing your session" />;

  if (queue.length === 0) {
    return (
      <EmptyState
        title={mode === "review" ? "Nothing to review" : "No questions match"}
        action={
          <ButtonLink href="/practice/" variant="secondary">
            Back to Practice
          </ButtonLink>
        }
      >
        {mode === "review" ? "You have no questions whose latest answer was wrong. Practise more and any misses will appear here." : "Try a different combination of filters."}
      </EmptyState>
    );
  }

  const current = queue[index];
  const currentResult = current ? results[current.id] : undefined;

  /* ───────────── Summary ───────────── */
  if (finished || index >= queue.length) {
    const graded = queue.filter((q) => {
      const r = results[q.id];
      return r && r !== "skipped" && r.result !== "self";
    });
    const correct = graded.filter((q) => (results[q.id] as QuestionOutcome).result === "correct").length;
    const byTopic = new Map<TopicId, { c: number; n: number }>();
    graded.forEach((q) => {
      const t = byTopic.get(q.topic) ?? { c: 0, n: 0 };
      t.n++;
      if ((results[q.id] as QuestionOutcome).result === "correct") t.c++;
      byTopic.set(q.topic, t);
    });
    const missed = queue.filter((q) => {
      const r = results[q.id];
      return r && r !== "skipped" && r.result === "incorrect";
    });
    const lessons = new Map<string, { href: string; title: string }>();
    missed.forEach((q) => {
      if (!q.lesson) return;
      const c = getCourse(q.lesson.courseId);
      const l = c?.lessons.find((x) => x.id === q.lesson!.lessonId);
      if (c && l) lessons.set(l.id, { href: lessonHref(c.id, l.id), title: `${l.title} (${c.title})` });
    });
    return (
      <div className="space-y-6">
        <StudyTimer />
        <Card className="p-6 sm:p-8">
          <p className="eyebrow mb-2">Session complete{remaining === 0 ? " · time is up" : ""}</p>
          <h2 className="font-serif text-3xl">
            {graded.length ? `${correct} / ${graded.length} correct` : "Session finished"}
          </h2>
          <p className="mt-2 text-ink-muted">
            {graded.length ? `${Math.round((correct / graded.length) * 100)}% accuracy on auto-graded questions.` : "No auto-graded answers in this session."}{" "}
            {Object.values(results).filter((r) => r !== "skipped" && r.result === "self").length > 0 && "Open answers were self-assessed and are tracked separately."}
          </p>
          {byTopic.size > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[...byTopic.entries()].map(([t, v]) => (
                <div key={t}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-ink">{TOPICS[t].label}</span>
                    <span className="figure text-ink-muted">
                      {v.c}/{v.n}
                    </span>
                  </div>
                  <ProgressBar value={v.c / v.n} tone={v.c === v.n ? "success" : "blue"} label={`${TOPICS[t].label} accuracy`} />
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => setSeed((s) => s + 1)}>
              <RotateCcw className="h-4 w-4" /> Practise again
            </Button>
            {missed.length > 0 && (
              <ButtonLink href="/practice/session/?mode=review" variant="secondary">
                Review incorrect answers
              </ButtonLink>
            )}
            <ButtonLink href="/tracker/#practice" variant="ghost">
              See your progress
            </ButtonLink>
          </div>
        </Card>
        {lessons.size > 0 && (
          <Card className="p-6">
            <h3 className="flex items-center gap-2 font-semibold text-navy">
              <BookOpen className="h-5 w-5 text-electric" /> Suggested lessons
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {[...lessons.values()].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-electric hover:underline">
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {queue.map((q, i) => {
              const r = results[q.id];
              return (
                <li key={q.id}>
                  <Link href={`/practice/q/${q.id}/`} className="flex items-start gap-3 px-5 py-3 text-sm hover:bg-cream/70">
                    <span className="mt-0.5">
                      {!r || r === "skipped" ? (
                        <span className="block h-5 w-5 rounded-full border-2 border-dashed border-line-strong" title="Skipped" />
                      ) : r.result === "correct" ? (
                        <CircleCheck className="h-5 w-5 text-success" />
                      ) : r.result === "incorrect" ? (
                        <CircleX className="h-5 w-5 text-error" />
                      ) : (
                        <CircleDot className="h-5 w-5 text-electric" />
                      )}
                    </span>
                    <span className="flex-1 text-ink">
                      <span className="text-ink-muted">{i + 1}. </span>
                      {q.prompt}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    );
  }

  /* ───────────── In progress ───────────── */
  const answeredCount = Object.keys(results).length;
  const mm = remaining !== null ? Math.floor(remaining / 60000) : 0;
  const ss = remaining !== null ? Math.floor((remaining % 60000) / 1000) : 0;

  return (
    <div className="space-y-5">
      <StudyTimer />
      <Card className="sticky top-[4.5rem] z-10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-navy">{title}</p>
            <p className="text-xs text-ink-muted">
              Question {index + 1} of {queue.length} · {answeredCount} answered
            </p>
          </div>
          <div className="flex items-center gap-2">
            {remaining !== null && (
              <span className={cn("figure inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", remaining < 60_000 ? "bg-error-soft text-error-ink" : "bg-ice-soft text-navy")} aria-live="polite">
                <Clock className="h-4 w-4" /> {mm}:{String(ss).padStart(2, "0")}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => setFinished(true)}>
              <Flag className="h-4 w-4" /> End session
            </Button>
          </div>
        </div>
        <ProgressBar value={answeredCount / queue.length} className="mt-3" label="Session progress" />
      </Card>

      <QuestionCard key={`${seed}-${current.id}`} question={current} source="practice" onAnswered={(o) => setResults((r) => ({ ...r, [current.id]: o }))} />

      <div className="flex flex-wrap justify-between gap-3">
        {!currentResult ? (
          <Button
            variant="ghost"
            onClick={() => {
              setResults((r) => ({ ...r, [current.id]: "skipped" }));
              setIndex((i) => i + 1);
            }}
          >
            <SkipForward className="h-4 w-4" /> Skip
          </Button>
        ) : (
          <span />
        )}
        {currentResult && (
          <Button onClick={() => setIndex((i) => i + 1)}>
            {index + 1 < queue.length ? (
              <>
                Next question <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              "See results"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
