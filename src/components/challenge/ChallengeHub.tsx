"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarClock, Lock, Repeat, RotateCcw, Trophy } from "lucide-react";
import { TOPICS } from "@/content/taxonomy";
import { actions, localDate, useHydrated, useStore } from "@/lib/store";
import { CHALLENGE, CHALLENGE_TARGET, challengeProgress, dailyPace, squareState, STAGE_SIZE, type SquareState } from "@/lib/challenge";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader, Input, Label, LocalDataNote, ProgressBar } from "@/components/ui/primitives";
import { Cover } from "@/components/art/Cover";

const SQUARE: Record<SquareState, string> = {
  correct: "bg-navy",
  retried: "bg-navy/60",
  self: "bg-ice",
  missed: "bg-error",
  current: "bg-white ring-2 ring-navy ring-offset-1 animate-pulse",
  locked: "bg-line",
};

const LEGEND: { state: SquareState; label: string }[] = [
  { state: "correct", label: "Correct" },
  { state: "missed", label: "Missed" },
  { state: "retried", label: "Missed, then fixed" },
  { state: "self", label: "Self-assessed" },
  { state: "current", label: "Next up" },
  { state: "locked", label: "Locked" },
];

export function ChallengeHub() {
  const state = useStore();
  const hydrated = useHydrated();
  const [openStage, setOpenStage] = useState<number | null>(null);
  const p = useMemo(() => challengeProgress(state.challenge), [state.challenge]);
  const today = localDate();

  if (!hydrated) return <div className="h-96 animate-pulse rounded-3xl bg-cream" />;

  const currentStage = Math.min(Math.floor(p.currentIndex / STAGE_SIZE), p.stages.length - 1);
  const shownStage = openStage ?? currentStage;
  const pace = dailyPace(p.total - p.answered, state.challenge.targetDate, today);
  const topics = [...p.byTopic.entries()].map(([t, v]) => ({ t, ...v, acc: v.correct / v.total })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-8">
      {CHALLENGE.length < CHALLENGE_TARGET && (
        <p className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning-ink">
          {CHALLENGE.length} of the 500 questions are available right now; the rest are being written and will appear in this same challenge. Your progress is kept.
        </p>
      )}

      {/* Progress band */}
      <Cover name="alps" className="rounded-3xl shadow-lift">
        <div className="grid gap-6 p-6 text-white sm:p-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ice">
              <Trophy className="h-4 w-4" /> {p.done ? "Challenge complete" : `Stage ${currentStage + 1} of ${p.stages.length} · ${p.stages[currentStage]?.title}`}
            </p>
            <p className="mt-3 font-serif text-6xl leading-none text-white sm:text-7xl">
              {p.answered}
              <span className="text-3xl text-ice sm:text-4xl"> / {p.total}</span>
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={p.answered} aria-valuemin={0} aria-valuemax={p.total} aria-label="Challenge progress">
              <div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${(p.answered / Math.max(1, p.total)) * 100}%` }} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {!p.done && (
                <Link href="/challenge/play/" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-medium text-navy hover:bg-ice-soft">
                  {p.answered === 0 ? "Start with question 1" : `Continue: question ${p.currentIndex + 1}`} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {p.missed.length > 0 && (
                <Link href="/challenge/play/?mode=missed" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 font-medium text-white hover:bg-white/10">
                  <Repeat className="h-4 w-4" /> Repeat missed ({p.missed.length})
                </Link>
              )}
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-center">
            {[
              ["Accuracy", p.accuracy === null ? "—" : `${Math.round(p.accuracy * 100)}%`],
              ["Missed", String(p.missed.length)],
              ["Left", String(p.total - p.answered)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-white/10 px-3 py-3">
                <dt className="text-xs text-ice">{k}</dt>
                <dd className="mt-1 text-2xl font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Cover>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Stages and the map */}
        <Card className="p-5 sm:p-6">
          <CardHeader title="Your map of 500" description="Each square is a question. Answer one to unlock the next; click any unlocked square to revisit it." />
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted">
            {LEGEND.map((l) => (
              <span key={l.state} className="flex items-center gap-1.5">
                <span className={cn("h-3 w-3 rounded-[3px]", SQUARE[l.state].replace("animate-pulse", ""))} /> {l.label}
              </span>
            ))}
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {p.stages.map((s) => (
              <button
                key={s.index}
                type="button"
                onClick={() => setOpenStage(s.index)}
                aria-pressed={shownStage === s.index}
                className={cn(
                  "shrink-0 rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                  shownStage === s.index ? "border-navy bg-navy text-white" : "border-line bg-white text-ink hover:border-navy",
                )}
              >
                <span className="block font-semibold">Stage {s.index + 1}</span>
                <span className={shownStage === s.index ? "text-ice" : "text-ink-muted"}>
                  {s.answered}/{s.total}
                </span>
              </button>
            ))}
          </div>
          {p.stages[shownStage] && (
            <div className="mt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-navy">
                  Stage {shownStage + 1}: {p.stages[shownStage].title}
                </p>
                <p className="text-xs text-ink-muted">
                  {p.stages[shownStage].accuracy === null ? "No graded answers yet" : `${Math.round(p.stages[shownStage].accuracy! * 100)}% correct`}
                </p>
              </div>
              <p className="mt-1 text-sm text-ink-muted">{p.stages[shownStage].blurb}</p>
              <div className="mt-4 grid grid-cols-10 gap-1.5">
                {CHALLENGE.slice(shownStage * STAGE_SIZE, (shownStage + 1) * STAGE_SIZE).map((q, k) => {
                  const i = shownStage * STAGE_SIZE + k;
                  const st = squareState(state.challenge, i, p.currentIndex);
                  const label = `Question ${i + 1} · ${TOPICS[q.topic]?.label ?? q.topic} · ${st}`;
                  return st === "locked" ? (
                    <span key={q.id} title={label} aria-label={label} className={cn("flex aspect-square items-center justify-center rounded-[4px]", SQUARE[st])}>
                      <Lock className="h-2.5 w-2.5 text-ink-muted/50" />
                    </span>
                  ) : (
                    <Link key={q.id} href={`/challenge/play/?q=${q.id}`} title={label} aria-label={label} className={cn("aspect-square rounded-[4px] transition-transform hover:scale-110", SQUARE[st])} />
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <CardHeader title="Recruiting date" description="Set when your recruiting season starts and get a daily pace." />
            <div className="mt-4">
              <Label htmlFor="target">Finish by</Label>
              <Input id="target" type="date" value={state.challenge.targetDate} min={today} onChange={(e) => actions.setChallengeTarget(e.target.value)} />
            </div>
            {pace ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-ice-soft px-4 py-3 text-sm text-navy">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <strong>{pace.perDay} question{pace.perDay === 1 ? "" : "s"} a day</strong> for {pace.days} day{pace.days === 1 ? "" : "s"} gets you to {p.total}.
                </span>
              </p>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">{p.done ? "You have finished every question." : "Pick a future date to see your pace."}</p>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <CardHeader title="Accuracy by section" description="Auto-graded answers in the challenge" />
            {topics.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">Answer a few questions to see where you are strongest.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {topics.map((t) => (
                  <li key={t.t}>
                    <div className="flex justify-between text-sm">
                      <Link href={`/practice/${t.t}/`} className="text-ink hover:text-navy">
                        {TOPICS[t.t]?.label ?? t.t}
                      </Link>
                      <span className="figure text-ink-muted">
                        {Math.round(t.acc * 100)}% · {t.total}
                      </span>
                    </div>
                    <ProgressBar value={t.acc} className="mt-1.5" label={`${TOPICS[t.t]?.label ?? t.t} accuracy`} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {p.missed.length > 0 && (
            <Card className="p-5 sm:p-6">
              <CardHeader title={`Missed list (${p.missed.length})`} description="Repeat them until each one is right." />
              <ul className="mt-3 space-y-1.5 text-sm">
                {p.missed.slice(0, 6).map((q) => (
                  <li key={q.id}>
                    <Link href={`/challenge/play/?q=${q.id}`} className="line-clamp-1 text-ink hover:text-navy">
                      Q{(CHALLENGE.findIndex((x) => x.id === q.id) ?? 0) + 1} · {q.prompt}
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonLink href="/challenge/play/?mode=missed" variant="secondary" size="sm" className="mt-4">
                <Repeat className="h-4 w-4" /> Repeat all missed
              </ButtonLink>
            </Card>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <LocalDataNote />
        {p.answered > 0 && (
          <button
            type="button"
            onClick={() => window.confirm("Restart the challenge from question 1? Your answers in it will be cleared (your Practice history is kept).") && actions.resetChallenge()}
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-error-ink"
          >
            <RotateCcw className="h-4 w-4" /> Restart the challenge
          </button>
        )}
      </div>
    </div>
  );
}
