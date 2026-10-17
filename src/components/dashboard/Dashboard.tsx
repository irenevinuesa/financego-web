"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BookOpen, Briefcase, CalendarDays, Flame, MessagesSquare, Settings, Target, Trophy } from "lucide-react";
import { COURSES, lessonHref } from "@/content/courses";
import { TOPICS } from "@/content/taxonomy";
import { APP_STAGES, STAGE_LABELS, useHydrated, useStore } from "@/lib/store";
import { courseProgress, goalProgress, hasAnyProgress, nextLesson, practiceStats, recentActivity, streak, upcomingInterviews, weakestTopic } from "@/lib/progress";
import { fmtDate, fmtRelative } from "@/lib/format";
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
      upcoming: upcomingInterviews(state),
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
            <Briefcase className="h-4 w-4" /> Applications
          </p>
          <p className="mt-1 text-2xl font-semibold text-navy">{state.applications.length}</p>
          <p className="text-xs text-ink-muted">{state.applications.filter((a) => a.stage === "offer").length} offers</p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6">
          <CardHeader title="Learning progress" action={<Link href="/tracker/#learning" className="text-sm text-electric hover:underline">Details</Link>} />
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
          <CardHeader title="Upcoming interviews" action={<Link href="/tracker/applications/" className="text-sm text-electric hover:underline">Applications</Link>} />
          {d.upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No interview dates yet. Add them to applications to see them here and in your calendar.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {d.upcoming.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-ice-soft text-navy">
                    <span className="text-[0.6rem] uppercase">{fmtDate(a.nextInterview, { month: "short" })}</span>
                    <span className="text-sm font-semibold leading-none">{fmtDate(a.nextInterview, { day: "numeric" })}</span>
                  </span>
                  <span className="min-w-0 text-sm">
                    <span className="block truncate font-medium text-navy">{a.company}</span>
                    <span className="block truncate text-ink-muted">
                      {a.role} · {STAGE_LABELS[a.stage]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-ink-muted">Pipeline</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {APP_STAGES.map((s) => {
              const n = state.applications.filter((a) => a.stage === s).length;
              return n ? (
                <span key={s} className="rounded-full bg-cream px-2.5 py-1 text-xs text-ink">
                  {STAGE_LABELS[s]} · {n}
                </span>
              ) : null;
            })}
            {state.applications.length === 0 && <span className="text-xs text-ink-muted">Empty</span>}
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader title="Personal goals" action={<Link href="/tracker/goals/" className="text-sm text-electric hover:underline">Manage</Link>} />
          {state.goals.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No goals yet. Set one, such as “Complete the DCF course”, and it will update automatically.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {state.goals.slice(0, 4).map((g) => {
                const p = goalProgress(g, state);
                return (
                  <li key={g.id}>
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="truncate text-ink">{g.title}</span>
                      <span className="figure shrink-0 text-ink-muted">
                        {p.current}/{p.target}
                      </span>
                    </div>
                    <ProgressBar value={p.pct} tone={p.done ? "success" : "blue"} className="mt-1.5" label={g.title} />
                    {g.deadline && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                        <CalendarDays className="h-3 w-3" /> {fmtDate(g.deadline)}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader title="Recent activity" />
        {d.activity.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Nothing yet. Your lessons, practice, interviews and applications will appear here.</p>
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
