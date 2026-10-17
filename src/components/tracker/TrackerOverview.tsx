"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Award, BookOpen, Briefcase, CalendarDays, ChevronLeft, ChevronRight, CircleCheck, CircleX, Clock, Flame, GraduationCap, MessagesSquare, Target, Trash } from "lucide-react";
import { COURSES, lessonHref } from "@/content/courses";
import { SKILLS, TOPICS, TRACKS } from "@/content/taxonomy";
import type { TopicId } from "@/content/types";
import { actions, localDate, STAGE_LABELS, useHydrated, useStore } from "@/lib/store";
import {
  courseProgress,
  frequentlyMissed,
  goalProgress,
  graded,
  incorrectQuestionIds,
  MIN_SKILL_EVIDENCE,
  nextLesson,
  practiceStats,
  skillScores,
  streak,
  studyLastDays,
  totalStudySeconds,
  upcomingInterviews,
  weakestTopic,
} from "@/lib/progress";
import { fmtDate, fmtDuration, fmtRelative } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Card, CardHeader, EmptyState, LocalDataNote, ProgressBar, Stat } from "@/components/ui/primitives";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";

function Section({ id, eyebrow, title, children, action }: { id: string; eyebrow: string; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">{eyebrow}</p>
          <h2 className="font-serif text-3xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ───────────── Calendar ───────────── */

function MonthCalendar({ events }: { events: { date: string; label: string; kind: "interview" | "goal" }[] }) {
  const [offset, setOffset] = useState(0);
  const today = localDate();
  const base = new Date();
  const first = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const startDay = (first.getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((startDay + daysInMonth) / 7) * 7 }, (_, i) => {
    const d = i - startDay + 1;
    if (d < 1 || d > daysInMonth) return null;
    return localDate(new Date(first.getFullYear(), first.getMonth(), d));
  });
  const byDay = new Map<string, typeof events>();
  events.forEach((e) => byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold text-navy">{first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
        <div className="flex gap-1">
          <button type="button" onClick={() => setOffset((o) => o - 1)} className="rounded-full p-1.5 hover:bg-cream" aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setOffset((o) => o + 1)} className="rounded-full p-1.5 hover:bg-cream" aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[0.7rem] text-ink-muted">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const ev = day ? byDay.get(day) ?? [] : [];
          return (
            <div
              key={i}
              className={cn("min-h-12 rounded-lg p-1 text-left", day ? "bg-cream/60" : "", day === today && "ring-2 ring-electric")}
              title={ev.map((e) => e.label).join("\n") || undefined}
            >
              {day && <span className="block text-xs text-ink">{Number(day.slice(8))}</span>}
              <div className="mt-0.5 flex flex-wrap gap-0.5">
                {ev.map((e, j) => (
                  <span key={j} className={cn("h-1.5 w-1.5 rounded-full", e.kind === "interview" ? "bg-electric" : "bg-chart-2")} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-electric" /> Interview
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-chart-2" /> Goal deadline
        </span>
      </div>
    </div>
  );
}

/* ───────────── Overview ───────────── */

export function TrackerOverview() {
  const state = useStore();
  const hydrated = useHydrated();
  const d = useMemo(() => {
    const stats = practiceStats(state);
    const courses = COURSES.map((c) => ({ c, p: courseProgress(state, c) }));
    const lessonsDone = Object.keys(state.lessons).length;
    const lessonsTotal = COURSES.reduce((s, c) => s + c.lessons.length, 0);
    const coursesPassed = courses.filter((x) => x.p.pct === 1 && x.p.assessmentPassed).length;
    const skills = skillScores(state);
    const st = streak(state);
    const interviews = [...state.interviews].reverse();
    const activeApps = state.applications.filter((a) => !["offer", "rejected", "withdrawn"].includes(a.stage));
    const upcoming = upcomingInterviews(state);
    const missed = frequentlyMissed(state);
    const recent = graded(state).slice(-12);
    const weak = weakestTopic(state);
    const next = nextLesson(state);
    const study7 = studyLastDays(state, 7);
    const topicRows = (Object.entries(stats.byTopic) as [TopicId, { correct: number; total: number }][])
      .map(([t, v]) => ({ topic: TOPICS[t].label, accuracy: Math.round((v.correct / v.total) * 100), n: v.total }))
      .sort((a, b) => b.n - a.n);
    const milestones = [
      { label: "Completed your first lesson", done: lessonsDone >= 1 },
      { label: "Completed a full course and passed its assessment", done: coursesPassed >= 1 },
      { label: "Answered 25 questions", done: stats.attempted >= 25 },
      { label: "Answered 100 questions", done: stats.attempted >= 100 },
      { label: "Completed a mock interview", done: state.interviews.length >= 1 },
      { label: "Reached a 7-day learning streak", done: st.best >= 7 },
    ];
    return { stats, courses, lessonsDone, lessonsTotal, coursesPassed, skills, st, interviews, activeApps, upcoming, missed, recent, weak, next, study7, topicRows, milestones };
  }, [state]);

  if (!hydrated) return <div className="h-96 animate-pulse rounded-3xl bg-white/60" />;

  const skillData = d.skills.filter((s) => s.score !== null).map((s) => ({ skill: SKILLS[s.skill].short, score: Math.round((s.score ?? 0) * 100), n: s.total }));
  const events = [
    ...state.applications.filter((a) => a.nextInterview).map((a) => ({ date: a.nextInterview, label: `${a.company}: interview`, kind: "interview" as const })),
    ...state.goals.filter((g) => g.deadline).map((g) => ({ date: g.deadline, label: `Goal due: ${g.title}`, kind: "goal" as const })),
  ];
  const incorrect = incorrectQuestionIds(state).length;

  return (
    <div className="space-y-16">
      {/* KPIs */}
      <div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Lessons completed" value={`${d.lessonsDone}/${d.lessonsTotal}`} hint={`${d.coursesPassed} course${d.coursesPassed === 1 ? "" : "s"} completed`} icon={<BookOpen className="h-4 w-4" />} />
          <Stat
            label="Questions answered"
            value={d.stats.attempted}
            hint={d.stats.accuracy === null ? "No graded answers yet" : `${Math.round(d.stats.accuracy * 100)}% accuracy (auto-graded)`}
            icon={<Target className="h-4 w-4" />}
          />
          <Stat label="Study time" value={fmtDuration(totalStudySeconds(state))} hint={`${fmtDuration(d.study7.reduce((s, x) => s + x.seconds, 0))} in the last 7 days`} icon={<Clock className="h-4 w-4" />} />
          <Stat label="Learning streak" value={`${d.st.current} day${d.st.current === 1 ? "" : "s"}`} hint={`Best: ${d.st.best}`} icon={<Flame className="h-4 w-4" />} />
          <Stat label="Mock interviews" value={state.interviews.length} hint={d.interviews[0] ? `Last ${fmtRelative(d.interviews[0].at)}` : "None yet"} icon={<MessagesSquare className="h-4 w-4" />} />
          <Stat label="Active applications" value={d.activeApps.length} hint={`${state.applications.length} tracked in total`} icon={<Briefcase className="h-4 w-4" />} />
          <Stat label="Upcoming interviews" value={d.upcoming.length} hint={d.upcoming[0] ? `Next: ${d.upcoming[0].company}, ${fmtDate(d.upcoming[0].nextInterview, { day: "numeric", month: "short" })}` : "None scheduled"} icon={<CalendarDays className="h-4 w-4" />} />
          <Stat label="Goals" value={state.goals.length} hint={`${state.goals.filter((g) => goalProgress(g, state).done).length} achieved`} icon={<Award className="h-4 w-4" />} />
        </div>
        <LocalDataNote className="mt-4" />
      </div>

      {/* Recommendations */}
      <Card className="grid gap-4 p-6 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Next lesson</p>
          <p className="mt-1 font-semibold text-navy">{d.next.lesson.title}</p>
          <Link href={lessonHref(d.next.course.id, d.next.lesson.id)} className="mt-1 inline-flex items-center gap-1 text-sm text-electric hover:underline">
            {d.next.resume ? "Continue" : "Start"} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Focus area</p>
          {d.weak ? (
            <>
              <p className="mt-1 font-semibold text-navy">
                {TOPICS[d.weak.topic].label} · {Math.round(d.weak.accuracy * 100)}% accuracy
              </p>
              <Link href={`/practice/session/?mode=topic&topic=${d.weak.topic}`} className="mt-1 inline-flex items-center gap-1 text-sm text-electric hover:underline">
                Practise this topic <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : (
            <p className="mt-1 text-sm text-ink-muted">Answer at least 3 questions in a topic to get a focus recommendation.</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Interview prep</p>
          {d.upcoming[0] ? (
            <>
              <p className="mt-1 font-semibold text-navy">
                {d.upcoming[0].company} on {fmtDate(d.upcoming[0].nextInterview, { day: "numeric", month: "short" })}
              </p>
              <Link href="/interview/" className="mt-1 inline-flex items-center gap-1 text-sm text-electric hover:underline">
                Run a mock interview <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-ink-muted">No interviews scheduled.</p>
              <Link href="/tracker/applications/" className="mt-1 inline-flex items-center gap-1 text-sm text-electric hover:underline">
                Add an application <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </Card>

      {/* Learning */}
      <Section id="learning" eyebrow="Learning tracker" title="Courses and milestones">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Card className="divide-y divide-line">
            {d.courses.map(({ c, p }) => (
              <div key={c.id} className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <Link href={`/learn/${c.id}/`} className="font-semibold text-navy hover:text-electric">
                    {c.title}
                  </Link>
                  <ProgressBar value={p.pct} tone={p.pct === 1 ? "success" : "blue"} className="mt-2" label={`${c.title} progress`} />
                  <p className="mt-1 text-xs text-ink-muted">
                    {p.completed}/{p.total} lessons · assessment {p.bestScore === null ? "not taken" : `best ${Math.round(p.bestScore * 100)}%${p.assessmentPassed ? " (passed)" : ""}`}
                  </p>
                </div>
                {p.pct === 1 && p.assessmentPassed ? <Badge tone="success">Completed</Badge> : p.started ? <Badge tone="blue">In progress</Badge> : <Badge tone="outline">Not started</Badge>}
              </div>
            ))}
          </Card>
          <div className="space-y-5">
            <Card className="p-5">
              <CardHeader title="Milestones" description="Unlocked from your real activity." />
              <ul className="mt-3 space-y-2 text-sm">
                {d.milestones.map((m) => (
                  <li key={m.label} className={cn("flex items-center gap-2", m.done ? "text-navy" : "text-ink-muted")}>
                    {m.done ? <CircleCheck className="h-4 w-4 text-success" /> : <span className="h-4 w-4 rounded-full border-2 border-line-strong" />}
                    {m.label}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <ChartFrame title="Study time, last 7 days" table={{ headers: ["Day", "Minutes"], rows: d.study7.map((s) => [fmtDate(s.day, { weekday: "short", day: "numeric" }), s.minutes]) }}>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={d.study7.map((s) => ({ ...s, label: fmtDate(s.day, { weekday: "short" }) }))} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                      <CartesianGrid {...gridProps} />
                      <XAxis dataKey="label" {...axisProps} />
                      <YAxis {...axisProps} allowDecimals={false} width={40} />
                      <Tooltip cursor={{ fill: "rgba(29,112,176,0.06)" }} content={({ active, payload }) => (active && payload?.length ? <TooltipBox rows={[{ label: "minutes", value: String((payload[0].payload as { minutes: number }).minutes), color: C.s1 }]} /> : null)} />
                      <Bar dataKey="minutes" fill={C.s1} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartFrame>
              <p className="mt-2 text-xs text-ink-muted">Counted while a lesson, practice or interview page is open and you are active.</p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Skills */}
      <Section id="skills" eyebrow="Skills tracker" title="Your skills profile">
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            {skillData.length >= 3 ? (
              <ChartFrame title="Accuracy by skill (auto-graded answers)" table={{ headers: ["Skill", "Accuracy", "Answers"], rows: skillData.map((s) => [s.skill, `${s.score}%`, s.n]) }}>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillData} outerRadius="72%">
                      <PolarGrid stroke={C.grid} />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: C.tick, fontSize: 12 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Tooltip content={({ active, payload }) => (active && payload?.length ? <TooltipBox title={(payload[0].payload as { skill: string }).skill} rows={[{ label: "accuracy", value: `${(payload[0].payload as { score: number }).score}%`, color: C.s1 }]} /> : null)} />
                      <Radar dataKey="score" stroke={C.s1} strokeWidth={2} fill={C.s1} fillOpacity={0.12} isAnimationActive={false} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </ChartFrame>
            ) : (
              <EmptyState icon={<GraduationCap className="h-5 w-5" />} title="Not enough data for a radar yet">
                Skill scores come only from questions you have actually answered. Answer at least {MIN_SKILL_EVIDENCE} auto-graded questions in three or more skill areas.
              </EmptyState>
            )}
          </Card>
          <Card className="p-5">
            <CardHeader title="Skill by skill" description={`A score appears after ${MIN_SKILL_EVIDENCE} auto-graded answers. Includes lesson checks and assessments.`} />
            <ul className="mt-4 space-y-3">
              {d.skills.map((s) => (
                <li key={s.skill}>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink">{SKILLS[s.skill].label}</span>
                    <span className="figure text-ink-muted">{s.score === null ? `${s.total}/${MIN_SKILL_EVIDENCE} answers` : `${Math.round(s.score * 100)}% · ${s.total} answers`}</span>
                  </div>
                  <ProgressBar value={s.score ?? 0} className="mt-1.5" label={`${SKILLS[s.skill].label} accuracy`} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* Practice */}
      <Section
        id="practice"
        eyebrow="Practice tracker"
        title="Accuracy and patterns"
        action={
          incorrect > 0 ? (
            <ButtonLink href="/practice/session/?mode=review" variant="secondary" size="sm">
              Review {incorrect} incorrect <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          ) : undefined
        }
      >
        {d.stats.attempted === 0 ? (
          <EmptyState icon={<Target className="h-5 w-5" />} title="No practice yet" action={<ButtonLink href="/practice/session/?mode=quick">Start a quick practice</ButtonLink>}>
            Your accuracy by topic, difficulty progression and most-missed concepts appear here.
          </EmptyState>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Card className="p-5">
              <ChartFrame title="Accuracy by topic" subtitle="Auto-graded answers only" table={{ headers: ["Topic", "Accuracy", "Answers"], rows: d.topicRows.map((t) => [t.topic, `${t.accuracy}%`, t.n]) }}>
                <div style={{ height: Math.max(160, d.topicRows.length * 34 + 30) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={d.topicRows} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 0 }} barCategoryGap="30%">
                      <CartesianGrid stroke={C.grid} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} {...axisProps} tickFormatter={(x) => `${x}%`} />
                      <YAxis type="category" dataKey="topic" {...axisProps} width={130} tick={{ ...axisProps.tick, fontSize: 11 }} />
                      <Tooltip cursor={{ fill: "rgba(29,112,176,0.06)" }} content={({ active, payload }) => (active && payload?.length ? <TooltipBox title={(payload[0].payload as { topic: string }).topic} rows={[{ label: `of ${(payload[0].payload as { n: number }).n} answers`, value: `${(payload[0].payload as { accuracy: number }).accuracy}%`, color: C.s1 }]} /> : null)} />
                      <Bar dataKey="accuracy" fill={C.s1} radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartFrame>
            </Card>
            <div className="space-y-5">
              <Card className="p-5">
                <CardHeader title="By difficulty" />
                <ul className="mt-3 space-y-3">
                  {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => {
                    const t = d.stats.byDifficulty[lvl];
                    return (
                      <li key={lvl}>
                        <div className="flex justify-between text-sm">
                          <span>{lvl}</span>
                          <span className="figure text-ink-muted">{t ? `${Math.round((t.correct / t.total) * 100)}% · ${t.total}` : "—"}</span>
                        </div>
                        <ProgressBar value={t ? t.correct / t.total : 0} className="mt-1.5" label={`${lvl} accuracy`} />
                      </li>
                    );
                  })}
                </ul>
              </Card>
              <Card className="p-5">
                <CardHeader title="Recent answers" description="Last 12 auto-graded answers, oldest first" />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {d.recent.map((a, i) => (
                    <span key={i} title={`${TOPICS[a.topic].label}: ${a.result}`}>
                      {a.result === "correct" ? <CircleCheck className="h-5 w-5 text-success" /> : <CircleX className="h-5 w-5 text-error" />}
                    </span>
                  ))}
                </div>
                {d.stats.selfAssessed > 0 && (
                  <p className="mt-3 text-xs text-ink-muted">
                    Plus {d.stats.selfAssessed} self-assessed open answer{d.stats.selfAssessed === 1 ? "" : "s"} (average {Math.round((d.stats.selfAverage ?? 0) * 100)}% of key points).
                  </p>
                )}
              </Card>
            </div>
            {d.missed.length > 0 && (
              <Card className="p-5 lg:col-span-2">
                <CardHeader title="Frequently missed" description="Questions you have answered incorrectly most often" />
                <ul className="mt-3 divide-y divide-line">
                  {d.missed.map((m) => (
                    <li key={m.qid} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                      <span className="min-w-0 flex-1 truncate text-ink">{m.prompt}</span>
                      <span className="flex items-center gap-3">
                        <Badge tone="error">
                          missed {m.misses}×
                        </Badge>
                        <Link href={`/practice/q/${m.qid}/`} className="text-electric hover:underline">
                          Retry
                        </Link>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </Section>

      {/* Interviews */}
      <Section id="interviews" eyebrow="Interview tracker" title="Mock interview history">
        {d.interviews.length === 0 ? (
          <EmptyState icon={<MessagesSquare className="h-5 w-5" />} title="No mock interviews yet" action={<ButtonLink href="/interview/">Start a mock interview</ButtonLink>}>
            Completed interviews appear here with their rule-based scores and the concepts you missed.
          </EmptyState>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-line bg-cream/60 text-left text-xs text-ink-muted">
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Track · type</th>
                  <th className="px-4 py-2.5 font-medium">Technical</th>
                  <th className="px-4 py-2.5 font-medium">Structure</th>
                  <th className="px-4 py-2.5 font-medium">Numbers</th>
                  <th className="px-4 py-2.5 font-medium">Clarity</th>
                  <th className="px-4 py-2.5 font-medium">Weak concepts</th>
                  <th className="px-2 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {d.interviews.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-ink">{fmtDate(r.at)}</td>
                    <td className="px-4 py-3 text-ink">
                      {TRACKS[r.track]?.label ?? r.track} · {r.format} · {r.difficulty} · {r.lang.toUpperCase()}
                    </td>
                    <td className="figure px-4 py-3">{Math.round(r.scores.technical * 100)}%</td>
                    <td className="figure px-4 py-3">{Math.round(r.scores.structure * 100)}%</td>
                    <td className="figure px-4 py-3">{r.scores.numerical === null ? "n/a" : `${Math.round(r.scores.numerical * 100)}%`}</td>
                    <td className="figure px-4 py-3">{Math.round(r.scores.clarity * 100)}%</td>
                    <td className="px-4 py-3 text-xs text-ink-muted">{r.weakConcepts.slice(0, 3).join("; ") || "—"}</td>
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() => window.confirm("Delete this interview from your history?") && actions.deleteInterview(r.id)}
                        className="rounded-full p-1.5 text-ink-muted hover:bg-error-soft hover:text-error-ink"
                        aria-label="Delete interview record"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-4 py-3 text-xs text-ink-muted">Scores are rule-based practice indicators, not expert assessments or hiring predictions.</p>
          </Card>
        )}
      </Section>

      {/* Applications & calendar */}
      <Section
        id="applications"
        eyebrow="Recruitment"
        title="Applications and calendar"
        action={
          <ButtonLink href="/tracker/applications/" variant="secondary" size="sm">
            Manage applications <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        }
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <Card className="p-5">
            <CardHeader title="Pipeline" />
            {state.applications.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">No applications yet. Add them in the Application Tracker to see your pipeline here.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {(Object.keys(STAGE_LABELS) as (keyof typeof STAGE_LABELS)[]).map((s) => {
                  const n = state.applications.filter((a) => a.stage === s).length;
                  return (
                    <li key={s} className="flex items-center gap-3 text-sm">
                      <span className="w-36 shrink-0 text-ink">{STAGE_LABELS[s]}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
                        <span className="block h-full rounded-full bg-electric" style={{ width: `${(n / state.applications.length) * 100}%` }} />
                      </span>
                      <span className="figure w-6 text-right text-ink-muted">{n}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
          <Card className="p-5">
            <MonthCalendar events={events} />
          </Card>
        </div>
      </Section>
    </div>
  );
}
