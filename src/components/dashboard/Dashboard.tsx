"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BookOpen, Briefcase, CircleCheck, CircleDashed, Flame, MessagesSquare, NotebookPen, Settings, Target, Trophy } from "lucide-react";
import { COURSES, lessonHref } from "@/content/courses";
import { TOPICS } from "@/content/taxonomy";
import { BQ_CATEGORIES } from "@/content/behaviourals/questions";
import { useHydrated, useStore } from "@/lib/store";
import { courseProgress, hasAnyProgress, nextLesson, practiceStats, recentActivity, streak, weakestTopic } from "@/lib/progress";
import { challengeProgress } from "@/lib/challenge";
import { STORY_CATEGORIES } from "@/components/behaviourals/StoryBank";
import { fmtRelative } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader, LocalDataNote, ProgressBar } from "@/components/ui/primitives";

const KIND_ICON = { lesson: BookOpen, practice: Target, interview: MessagesSquare, application: Briefcase, assessment: Trophy };

export function Dashboard() {
  const state = useStore();
  const hydrated = useHydrated();
  const d = useMemo(
    () => ({
      next: nextLesson(state),
      stats: practiceStats(state),
      streak: streak(state),
      challenge: challengeProgress(state.challenge),
      covered: new Set(state.stories.flatMap((x) => x.categories)),
      activity: recentActivity(state, 8),
      weak: weakestTopic(state),
      courses: COURSES.map((c) => ({ c, p: courseProgress(state, c) })),
    }),
    [state],
  );

  if (!hydrated) return <div className="h-96 animate-pulse rounded-3xl bg-white/60" />;
  const name = state.profile.name.trim();
  const fresh = !hasAnyProgress(state);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Your dashboard</p>
          <h1 className="font-serif text-4xl sm:text-5xl">{name ? `Welcome back, ${name}.` : fresh ? "Welcome to FinanceGo." : "Welcome back."}</h1>
          <p className="mt-2 text-ink-muted">
            {fresh ? "Here is where your progress will live. Start anywhere: a lesson, a practice set or a mock interview." : "Here is where you are and what to do next."}
          </p>
        </div>
        <Link href="/settings/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-electric">
          <Settings className="h-4 w-4" /> {name ? "Profile & data" : "Add your name"}
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <p className="eyebrow mb-2">Continue learning</p>
          <h2 className="font-serif text-2xl">{d.next.lesson.title}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {d.next.course.title} · {d.next.lesson.minutes} min
          </p>
          <p className="mt-3 text-sm text-ink">{d.next.lesson.summary}</p>
          <ButtonLink href={lessonHref(d.next.course.id, d.next.lesson.id)} className="mt-5">
            {d.next.resume ? "Continue" : "Start"} <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Card>
        <Card className="p-6">
          <p className="eyebrow mb-2">Recommended practice</p>
          {d.weak ? (
            <>
              <h2 className="text-lg font-semibold text-navy">{TOPICS[d.weak.topic].label}</h2>
              <p className="mt-1 text-sm text-ink-muted">Your lowest-accuracy topic so far ({Math.round(d.weak.accuracy * 100)}%).</p>
              <ButtonLink href={`/practice/session/?mode=topic&topic=${d.weak.topic}`} variant="secondary" className="mt-4">
                Practise it
              </ButtonLink>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-navy">Quick Practice</h2>
              <p className="mt-1 text-sm text-ink-muted">Five mixed questions. A recommendation appears once you have answered a few in each topic.</p>
              <ButtonLink href="/practice/session/?mode=quick" variant="secondary" className="mt-4">
                Start
              </ButtonLink>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Target className="h-4 w-4" /> Questions answered
          </p>
          <p className="mt-1 text-2xl font-semibold text-navy">{d.stats.attempted}</p>
          <p className="text-xs text-ink-muted">{d.stats.accuracy === null ? "—" : `${Math.round(d.stats.accuracy * 100)}% accuracy`}</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Flame className="h-4 w-4" /> Streak
          </p>
          <p className="mt-1 text-2xl font-semibold text-navy">{d.streak.current} days</p>
          <p className="text-xs text-ink-muted">Best {d.streak.best}</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <MessagesSquare className="h-4 w-4" /> Mock interviews
          </p>
          <p className="mt-1 text-2xl font-semibold text-navy">{state.interviews.length}</p>
          <p className="text-xs text-ink-muted">{state.interviews.length ? `Last ${fmtRelative(state.interviews[state.interviews.length - 1].at)}` : "None yet"}</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Trophy className="h-4 w-4" /> 500 Challenge
          </p>
          <p className="mt-1 text-2xl font-semibold text-navy">
            {d.challenge.answered}/{d.challenge.total}
          </p>
          <p className="text-xs text-ink-muted">{d.challenge.missed.length} to repeat</p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6">
          <CardHeader title="Learning progress" action={<Link href="/learn/" className="text-sm text-electric hover:underline">All courses</Link>} />
          <ul className="mt-4 space-y-4">
            {d.courses.map(({ c, p }) => (
              <li key={c.id}>
                <div className="flex justify-between text-sm">
                  <Link href={`/learn/${c.id}/`} className="truncate text-ink hover:text-electric">
                    {c.title}
                  </Link>
                  <span className="figure shrink-0 pl-2 text-ink-muted">
                    {p.completed}/{p.total}
                  </span>
                </div>
                <ProgressBar value={p.pct} tone={p.pct === 1 ? "success" : "blue"} className="mt-1.5" label={`${c.title} progress`} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <CardHeader title="500 Challenge" action={<Link href="/challenge/" className="text-sm text-electric hover:underline">Open</Link>} />
          <p className="mt-4 text-3xl font-semibold text-navy">
            {d.challenge.answered}
            <span className="text-base font-normal text-ink-muted"> / {d.challenge.total} answered</span>
          </p>
          <ProgressBar value={d.challenge.total ? d.challenge.answered / d.challenge.total : 0} className="mt-3" label="500 Challenge progress" />
          <p className="mt-2 text-sm text-ink-muted">
            {d.challenge.accuracy === null ? "No answers yet." : `${Math.round(d.challenge.accuracy * 100)}% correct so far.`} {d.challenge.missed.length} missed question
            {d.challenge.missed.length === 1 ? "" : "s"} to repeat.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href={d.challenge.done ? "/challenge/" : "/challenge/play/"} size="sm">
              {d.challenge.answered ? "Continue" : "Start"} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            {d.challenge.missed.length > 0 && (
              <ButtonLink href="/challenge/play/?mode=missed" variant="secondary" size="sm">
                Repeat missed
              </ButtonLink>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader title="Behaviourals" action={<Link href="/behaviourals/" className="text-sm text-electric hover:underline">Open</Link>} />
          <p className="mt-4 flex items-center gap-2 text-sm text-ink">
            <NotebookPen className="h-4 w-4 text-electric" /> {state.stories.length} stor{state.stories.length === 1 ? "y" : "ies"} in your story bank
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink">
            <MessagesSquare className="h-4 w-4 text-electric" /> {state.interviews.filter((r) => r.format === "behavioral").length} behavioural mock interviews
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            {STORY_CATEGORIES.map((c) => (
              <li key={c} className="flex items-center gap-1.5 text-ink">
                {d.covered.has(c) ? <CircleCheck className="h-3.5 w-3.5 shrink-0 text-success" /> : <CircleDashed className="h-3.5 w-3.5 shrink-0 text-line-strong" />}
                <span className="truncate">{BQ_CATEGORIES[c]}</span>
              </li>
            ))}
          </ul>
          <ButtonLink href="/behaviourals/stories/" variant="secondary" size="sm" className="mt-4">
            {state.stories.length ? "Add a story" : "Write your first story"}
          </ButtonLink>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader title="Recent activity" />
        {d.activity.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Nothing yet. Your lessons, practice and interviews will appear here.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {d.activity.map((a, i) => {
              const Icon = KIND_ICON[a.kind];
              return (
                <li key={i}>
                  <Link href={a.href} className="flex items-center gap-3 py-2.5 text-sm hover:text-electric">
                    <Icon className="h-4 w-4 shrink-0 text-electric" />
                    <span className="flex-1 text-ink">{a.label}</span>
                    <span className="shrink-0 text-xs text-ink-muted">{fmtRelative(a.at)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <LocalDataNote />
    </div>
  );
}
