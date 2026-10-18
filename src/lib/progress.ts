/**
 * Derived views over the local store: course completion, accuracy, skills,
 * streaks, goals and activity. Pure functions, so they are easy to test.
 */

import { COURSES, getCourse, lessonHref } from "@/content/courses";
import { findAnyQuestion, getQuestion } from "@/content/questions";
import { SKILL_IDS, TOPICS } from "@/content/taxonomy";
import type { Course, Difficulty, Lesson, SkillId, TopicId } from "@/content/types";
import { localDate, lessonKey, STAGE_LABELS, type Application, type Attempt, type Goal, type StoreState } from "./store";

export interface CourseProgress {
  completed: number;
  total: number;
  pct: number;
  started: boolean;
  assessmentPassed: boolean;
  bestScore: number | null;
}

export function courseProgress(state: StoreState, course: Course): CourseProgress {
  const completed = course.lessons.filter((l) => state.lessons[lessonKey(course.id, l.id)]).length;
  const a = state.assessments[course.id];
  return {
    completed,
    total: course.lessons.length,
    pct: course.lessons.length ? completed / course.lessons.length : 0,
    started: completed > 0 || state.lastLesson?.courseId === course.id || Boolean(a),
    assessmentPassed: a?.passed ?? false,
    bestScore: a ? a.bestScore : null,
  };
}

/** The lesson a learner should open next. */
export function nextLesson(state: StoreState): { course: Course; lesson: Lesson; resume: boolean } {
  const firstIncomplete = (course: Course) => course.lessons.find((l) => !state.lessons[lessonKey(course.id, l.id)]);
  if (state.lastLesson) {
    const course = getCourse(state.lastLesson.courseId);
    if (course) {
      const lesson = firstIncomplete(course);
      if (lesson) return { course, lesson, resume: true };
    }
  }
  for (const course of COURSES) {
    const p = courseProgress(state, course);
    const lesson = firstIncomplete(course);
    if (p.started && lesson) return { course, lesson, resume: true };
  }
  for (const course of COURSES) {
    const lesson = firstIncomplete(course);
    if (lesson) return { course, lesson, resume: false };
  }
  return { course: COURSES[0], lesson: COURSES[0].lessons[0], resume: false };
}

/* ───────────── Attempts and accuracy ───────────── */

export interface Tally {
  correct: number;
  total: number;
}

const accuracy = (t: Tally) => (t.total ? t.correct / t.total : null);

export function graded(state: StoreState): Attempt[] {
  return state.attempts.filter((a) => a.result !== "self");
}

export function practiceStats(state: StoreState) {
  const g = graded(state);
  const byTopic = {} as Record<TopicId, Tally>;
  const byDifficulty = {} as Record<Difficulty, Tally>;
  for (const a of g) {
    byTopic[a.topic] ??= { correct: 0, total: 0 };
    byTopic[a.topic].total++;
    if (a.result === "correct") byTopic[a.topic].correct++;
    byDifficulty[a.difficulty] ??= { correct: 0, total: 0 };
    byDifficulty[a.difficulty].total++;
    if (a.result === "correct") byDifficulty[a.difficulty].correct++;
  }
  const correct = g.filter((a) => a.result === "correct").length;
  const selfAssessed = state.attempts.filter((a) => a.result === "self");
  return {
    attempted: state.attempts.length,
    graded: g.length,
    correct,
    accuracy: g.length ? correct / g.length : null,
    selfAssessed: selfAssessed.length,
    selfAverage: selfAssessed.length ? selfAssessed.reduce((s, a) => s + (a.selfScore ?? 0), 0) / selfAssessed.length : null,
    byTopic,
    byDifficulty,
    uniqueQuestions: new Set(state.attempts.map((a) => a.qid)).size,
  };
}

/** Latest attempt for each question id. */
export function latestAttempts(state: StoreState): Map<string, Attempt> {
  const m = new Map<string, Attempt>();
  for (const a of state.attempts) m.set(a.qid, a);
  return m;
}

/** Question-bank questions whose most recent auto-graded attempt was wrong. */
export function incorrectQuestionIds(state: StoreState): string[] {
  const latest = new Map<string, Attempt>();
  for (const a of graded(state)) latest.set(a.qid, a);
  return [...latest.values()].filter((a) => a.result === "incorrect" && getQuestion(a.qid)).map((a) => a.qid);
}

export function frequentlyMissed(state: StoreState, limit = 5): { qid: string; misses: number; prompt: string; topic: TopicId }[] {
  const misses = new Map<string, number>();
  for (const a of graded(state)) if (a.result === "incorrect") misses.set(a.qid, (misses.get(a.qid) ?? 0) + 1);
  return [...misses.entries()]
    .map(([qid, n]) => {
      const q = findAnyQuestion(qid);
      return q ? { qid, misses: n, prompt: q.prompt, topic: q.topic } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.misses - a.misses)
    .slice(0, limit);
}

/* ───────────── Skills ───────────── */

export const MIN_SKILL_EVIDENCE = 3;

export interface SkillScore extends Tally {
  skill: SkillId;
  score: number | null;
}

/** Skill scores come only from auto-graded answers; below a minimum sample size they are not shown. */
export function skillScores(state: StoreState): SkillScore[] {
  const tallies = Object.fromEntries(SKILL_IDS.map((s) => [s, { correct: 0, total: 0 }])) as Record<SkillId, Tally>;
  for (const a of graded(state)) {
    const skill = TOPICS[a.topic]?.skill;
    if (!skill) continue;
    tallies[skill].total++;
    if (a.result === "correct") tallies[skill].correct++;
  }
  return SKILL_IDS.map((skill) => ({
    skill,
    ...tallies[skill],
    score: tallies[skill].total >= MIN_SKILL_EVIDENCE ? accuracy(tallies[skill]) : null,
  }));
}

/* ───────────── Activity, streaks and time ───────────── */

function dayOf(iso: string) {
  return localDate(new Date(iso));
}

export function activeDays(state: StoreState): Set<string> {
  const days = new Set<string>();
  Object.values(state.lessons).forEach((l) => days.add(dayOf(l.completedAt)));
  state.attempts.forEach((a) => days.add(dayOf(a.at)));
  state.interviews.forEach((i) => days.add(dayOf(i.at)));
  Object.entries(state.study).forEach(([d, s]) => {
    if (s >= 60) days.add(d);
  });
  return days;
}

function shiftDay(day: string, delta: number) {
  const d = new Date(`${day}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return localDate(d);
}

/** Current streak counts today, or ends yesterday if today has no activity yet. */
export function streak(state: StoreState, today = localDate()): { current: number; best: number } {
  const days = activeDays(state);
  let current = 0;
  let cursor = days.has(today) ? today : shiftDay(today, -1);
  while (days.has(cursor)) {
    current++;
    cursor = shiftDay(cursor, -1);
  }
  let best = 0;
  const sorted = [...days].sort();
  let run = 0;
  let prev = "";
  for (const d of sorted) {
    run = prev && shiftDay(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return { current, best: Math.max(best, current) };
}

export function totalStudySeconds(state: StoreState) {
  return Object.values(state.study).reduce((s, x) => s + x, 0);
}

export function studyLastDays(state: StoreState, days = 7, today = localDate()): { day: string; minutes: number; seconds: number }[] {
  return Array.from({ length: days }, (_, i) => {
    const day = shiftDay(today, i - days + 1);
    const seconds = state.study[day] ?? 0;
    return { day, minutes: Math.round(seconds / 60), seconds };
  });
}

export interface ActivityItem {
  at: string;
  kind: "lesson" | "practice" | "interview" | "application" | "assessment";
  label: string;
  href: string;
}

export function recentActivity(state: StoreState, limit = 8): ActivityItem[] {
  const items: ActivityItem[] = [];
  for (const [key, l] of Object.entries(state.lessons)) {
    const [courseId, lessonId] = key.split("/");
    const course = getCourse(courseId);
    const lesson = course?.lessons.find((x) => x.id === lessonId);
    if (course && lesson) items.push({ at: l.completedAt, kind: "lesson", label: `Completed “${lesson.title}”`, href: lessonHref(courseId, lessonId) });
  }
  for (const [courseId, a] of Object.entries(state.assessments)) {
    const course = getCourse(courseId);
    if (course) items.push({ at: a.lastAt, kind: "assessment", label: `${course.title} assessment: ${Math.round(a.lastScore * 100)}%`, href: `/learn/${courseId}/assessment/` });
  }
  // Group practice attempts by day so the feed is not flooded.
  const practiceByDay = new Map<string, { at: string; n: number; correct: number }>();
  for (const a of state.attempts.filter((x) => x.source === "practice" || x.source === "qotd")) {
    const d = dayOf(a.at);
    const cur = practiceByDay.get(d) ?? { at: a.at, n: 0, correct: 0 };
    cur.n++;
    if (a.result === "correct") cur.correct++;
    if (a.at > cur.at) cur.at = a.at;
    practiceByDay.set(d, cur);
  }
  for (const p of practiceByDay.values()) items.push({ at: p.at, kind: "practice", label: `Answered ${p.n} practice question${p.n === 1 ? "" : "s"}`, href: "/practice/" });
  for (const i of state.interviews) items.push({ at: i.at, kind: "interview", label: `${i.format === "behavioral" ? "Behavioural" : "Technical"} mock interview completed (${i.answered} answers)`, href: i.format === "behavioral" ? "/behaviourals/interview/" : "/technicals/interview/" });
  return items.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit);
}

/* ───────────── Goals & applications ───────────── */

export function goalProgress(goal: Goal, state: StoreState): { current: number; target: number; pct: number; done: boolean } {
  let current = 0;
  let target = Math.max(1, goal.target);
  if (goal.type === "course" && goal.courseId) {
    const course = getCourse(goal.courseId);
    if (course) {
      target = course.lessons.length;
      current = course.lessons.filter((l) => state.lessons[lessonKey(course.id, l.id)]).length;
    }
  } else if (goal.type === "questions") {
    current = state.attempts.filter((a) => a.at >= goal.createdAt && (goal.topic === "any" || !goal.topic || a.topic === goal.topic)).length;
  } else if (goal.type === "interviews") {
    current = state.interviews.filter((i) => i.at >= goal.createdAt).length;
  } else {
    current = goal.manualProgress;
  }
  const pct = Math.min(1, current / target);
  return { current: Math.min(current, target), target, pct, done: current >= target };
}

export function upcomingInterviews(state: StoreState, today = localDate()): Application[] {
  return state.applications
    .filter((a) => a.nextInterview && a.nextInterview >= today && !["rejected", "withdrawn", "offer"].includes(a.stage))
    .sort((a, b) => (a.nextInterview < b.nextInterview ? -1 : 1));
}

export function hasAnyProgress(state: StoreState) {
  return (
    Object.keys(state.lessons).length > 0 ||
    state.attempts.length > 0 ||
    state.interviews.length > 0 ||
    Object.keys(state.challenge.answers).length > 0 ||
    state.stories.length > 0
  );
}

/** Weakest topic with enough evidence, to recommend practice. */
export function weakestTopic(state: StoreState): { topic: TopicId; accuracy: number } | null {
  const { byTopic } = practiceStats(state);
  const candidates = (Object.entries(byTopic) as [TopicId, Tally][])
    .filter(([, t]) => t.total >= 3)
    .map(([topic, t]) => ({ topic, accuracy: t.correct / t.total }))
    .sort((a, b) => a.accuracy - b.accuracy);
  return candidates[0] ?? null;
}
