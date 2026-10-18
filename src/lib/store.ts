"use client";

/**
 * Local progress store. Everything a learner does in the MVP is saved in this
 * browser's localStorage under one key. There are no accounts and nothing is
 * sent to a server. Clearing site data deletes it, which the UI says clearly.
 */

import { useSyncExternalStore } from "react";
import type { Difficulty, InterviewFormat, Lang, TopicId, TrackId } from "@/content/types";

export const STORAGE_KEY = "financego:v1";
const MAX_ATTEMPTS = 3000;

export interface LessonProgress {
  completedAt: string;
  checkCorrect: number;
  checkTotal: number;
}

export interface AssessmentResult {
  bestScore: number;
  lastScore: number;
  attempts: number;
  lastAt: string;
  passed: boolean;
}

export type AttemptSource = "practice" | "lesson" | "assessment" | "qotd" | "challenge";
export type AttemptResult = "correct" | "incorrect" | "self";

export interface Attempt {
  qid: string;
  topic: TopicId;
  difficulty: Difficulty;
  source: AttemptSource;
  result: AttemptResult;
  /** Share of key points the learner ticked when self-assessing an open answer. */
  selfScore?: number;
  at: string;
  ms?: number;
}

export interface InterviewScores {
  technical: number;
  structure: number;
  numerical: number | null;
  clarity: number;
}

export interface InterviewRecord {
  id: string;
  at: string;
  track: TrackId;
  format: InterviewFormat | "mixed";
  difficulty: Difficulty;
  lang: Lang;
  questionCount: number;
  answered: number;
  durationSec: number;
  scores: InterviewScores;
  weakConcepts: string[];
  topics: TopicId[];
}

export const APP_STAGES = [
  "interested",
  "applied",
  "online-assessment",
  "first-round",
  "final-round",
  "offer",
  "rejected",
  "withdrawn",
] as const;
export type AppStage = (typeof APP_STAGES)[number];

export const STAGE_LABELS: Record<AppStage, string> = {
  interested: "Interested",
  applied: "Applied",
  "online-assessment": "Online Assessment",
  "first-round": "First Round",
  "final-round": "Final Round",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export interface Application {
  id: string;
  company: string;
  role: string;
  division: string;
  location: string;
  /** YYYY-MM-DD */
  appliedOn: string;
  stage: AppStage;
  /** YYYY-MM-DD */
  nextInterview: string;
  notes: string;
  outcome: string;
  createdAt: string;
  updatedAt: string;
}

export type GoalType = "course" | "questions" | "interviews" | "custom";

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  target: number;
  courseId?: string;
  topic?: TopicId | "any";
  /** Only used by custom goals, which the learner updates by hand. */
  manualProgress: number;
  /** YYYY-MM-DD */
  deadline: string;
  createdAt: string;
}

/* ───────────── 500 Challenge & story bank ───────────── */

export interface ChallengeAnswer {
  result: AttemptResult;
  selfScore?: number;
  at: string;
}

export interface ChallengeState {
  /** First answer to each challenge question, keyed by question id. */
  answers: Record<string, ChallengeAnswer>;
  /** Latest retry of a missed question; a correct retry clears it from the Missed list. */
  retries: Record<string, ChallengeAnswer>;
  /** Optional recruiting date (YYYY-MM-DD) used to compute the daily pace. */
  targetDate: string;
}

export interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  learning: string;
  /** Behavioural question categories this story can answer. */
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  name: string;
  track: TrackId | "";
  interviewLang: Lang;
}

export interface StoreState {
  version: 1;
  createdAt: string;
  profile: Profile;
  lessons: Record<string, LessonProgress>;
  assessments: Record<string, AssessmentResult>;
  attempts: Attempt[];
  interviews: InterviewRecord[];
  applications: Application[];
  goals: Goal[];
  checklists: Record<string, string[]>;
  /** Seconds of active study per local date (YYYY-MM-DD). */
  study: Record<string, number>;
  lastLesson?: { courseId: string; lessonId: string; at: string };
  challenge: ChallengeState;
  stories: Story[];
}

export function emptyState(): StoreState {
  return {
    version: 1,
    createdAt: "",
    profile: { name: "", track: "", interviewLang: "en" },
    lessons: {},
    assessments: {},
    attempts: [],
    interviews: [],
    applications: [],
    goals: [],
    checklists: {},
    study: {},
    challenge: { answers: {}, retries: {}, targetDate: "" },
    stories: [],
  };
}

const SERVER_SNAPSHOT = emptyState();

/* ───────────── Helpers ───────────── */

export function lessonKey(courseId: string, lessonId: string) {
  return `${courseId}/${lessonId}`;
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Local calendar date as YYYY-MM-DD. */
export function localDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Accepts unknown JSON (from storage or an imported backup) and returns a valid state. */
export function sanitizeState(raw: unknown): StoreState {
  const base = emptyState();
  if (!isRecord(raw) || raw.version !== 1) return base;
  const profile = isRecord(raw.profile) ? raw.profile : {};
  const challenge = isRecord(raw.challenge) ? raw.challenge : {};
  return {
    version: 1,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
    profile: {
      name: typeof profile.name === "string" ? profile.name.slice(0, 60) : "",
      track: typeof profile.track === "string" ? (profile.track as TrackId | "") : "",
      interviewLang: profile.interviewLang === "es" ? "es" : "en",
    },
    lessons: isRecord(raw.lessons) ? (raw.lessons as StoreState["lessons"]) : {},
    assessments: isRecord(raw.assessments) ? (raw.assessments as StoreState["assessments"]) : {},
    attempts: Array.isArray(raw.attempts) ? (raw.attempts as Attempt[]).slice(-MAX_ATTEMPTS) : [],
    interviews: Array.isArray(raw.interviews) ? (raw.interviews as InterviewRecord[]) : [],
    applications: Array.isArray(raw.applications) ? (raw.applications as Application[]) : [],
    goals: Array.isArray(raw.goals) ? (raw.goals as Goal[]) : [],
    checklists: isRecord(raw.checklists) ? (raw.checklists as StoreState["checklists"]) : {},
    study: isRecord(raw.study) ? (raw.study as StoreState["study"]) : {},
    lastLesson: isRecord(raw.lastLesson) ? (raw.lastLesson as StoreState["lastLesson"]) : undefined,
    challenge: {
      answers: isRecord(challenge.answers) ? (challenge.answers as ChallengeState["answers"]) : {},
      retries: isRecord(challenge.retries) ? (challenge.retries as ChallengeState["retries"]) : {},
      targetDate: typeof challenge.targetDate === "string" ? challenge.targetDate : "",
    },
    stories: Array.isArray(raw.stories) ? (raw.stories as Story[]) : [],
  };
}

/* ───────────── Store core ───────────── */

let state: StoreState | null = null;
const listeners = new Set<() => void>();
let storageAvailable = true;

function load(): StoreState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeState(JSON.parse(raw)) : emptyState();
  } catch {
    storageAvailable = false;
    return emptyState();
  }
}

export function getState(): StoreState {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  if (state === null) state = load();
  return state;
}

function persist(next: StoreState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
}

export function update(mutator: (draft: StoreState) => StoreState) {
  const current = getState();
  const next = mutator(current);
  if (!next.createdAt) next.createdAt = new Date().toISOString();
  state = next;
  persist(next);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The whole state; derive views with useMemo so snapshots stay referentially stable. */
export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getState, () => SERVER_SNAPSHOT);
}

const noopSubscribe = () => () => {};
/** False during prerender and hydration, true once the browser state is readable. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function isStorageAvailable() {
  return storageAvailable;
}

/* ───────────── Actions ───────────── */

export const actions = {
  completeLesson(courseId: string, lessonId: string, checkCorrect: number, checkTotal: number) {
    update((s) => ({
      ...s,
      lessons: {
        ...s.lessons,
        [lessonKey(courseId, lessonId)]: { completedAt: new Date().toISOString(), checkCorrect, checkTotal },
      },
    }));
  },

  uncompleteLesson(courseId: string, lessonId: string) {
    update((s) => {
      const lessons = { ...s.lessons };
      delete lessons[lessonKey(courseId, lessonId)];
      return { ...s, lessons };
    });
  },

  visitLesson(courseId: string, lessonId: string) {
    update((s) => ({ ...s, lastLesson: { courseId, lessonId, at: new Date().toISOString() } }));
  },

  recordAssessment(courseId: string, score: number, passMark = 0.7) {
    update((s) => {
      const prev = s.assessments[courseId];
      return {
        ...s,
        assessments: {
          ...s.assessments,
          [courseId]: {
            bestScore: Math.max(score, prev?.bestScore ?? 0),
            lastScore: score,
            attempts: (prev?.attempts ?? 0) + 1,
            lastAt: new Date().toISOString(),
            passed: (prev?.passed ?? false) || score >= passMark,
          },
        },
      };
    });
  },

  recordAttempt(attempt: Omit<Attempt, "at">) {
    update((s) => ({
      ...s,
      attempts: [...s.attempts, { ...attempt, at: new Date().toISOString() }].slice(-MAX_ATTEMPTS),
    }));
  },

  saveInterview(record: InterviewRecord) {
    update((s) => ({ ...s, interviews: [...s.interviews, record] }));
  },

  deleteInterview(id: string) {
    update((s) => ({ ...s, interviews: s.interviews.filter((i) => i.id !== id) }));
  },

  addStudySeconds(seconds: number) {
    if (seconds <= 0) return;
    const day = localDate();
    update((s) => ({ ...s, study: { ...s.study, [day]: (s.study[day] ?? 0) + seconds } }));
  },

  upsertApplication(app: Omit<Application, "createdAt" | "updatedAt"> & { createdAt?: string }) {
    const now = new Date().toISOString();
    update((s) => {
      const exists = s.applications.some((a) => a.id === app.id);
      const record: Application = { ...app, createdAt: app.createdAt ?? now, updatedAt: now };
      return {
        ...s,
        applications: exists
          ? s.applications.map((a) => (a.id === app.id ? { ...record, createdAt: a.createdAt } : a))
          : [...s.applications, record],
      };
    });
  },

  setApplicationStage(id: string, stage: AppStage) {
    const now = new Date().toISOString();
    update((s) => ({
      ...s,
      applications: s.applications.map((a) => (a.id === id ? { ...a, stage, updatedAt: now } : a)),
    }));
  },

  deleteApplication(id: string) {
    update((s) => ({ ...s, applications: s.applications.filter((a) => a.id !== id) }));
  },

  upsertGoal(goal: Omit<Goal, "createdAt"> & { createdAt?: string }) {
    update((s) => {
      const exists = s.goals.some((g) => g.id === goal.id);
      const record: Goal = { ...goal, createdAt: goal.createdAt ?? new Date().toISOString() };
      return {
        ...s,
        goals: exists ? s.goals.map((g) => (g.id === goal.id ? { ...record, createdAt: g.createdAt } : g)) : [...s.goals, record],
      };
    });
  },

  deleteGoal(id: string) {
    update((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  },

  toggleChecklistItem(listId: string, itemId: string) {
    update((s) => {
      const current = s.checklists[listId] ?? [];
      const next = current.includes(itemId) ? current.filter((i) => i !== itemId) : [...current, itemId];
      return { ...s, checklists: { ...s.checklists, [listId]: next } };
    });
  },

  setProfile(profile: Partial<Profile>) {
    update((s) => ({ ...s, profile: { ...s.profile, ...profile } }));
  },

  /** Records the first answer to a challenge question (later answers are retries). */
  answerChallenge(qid: string, outcome: { result: AttemptResult; selfScore?: number }) {
    const at = new Date().toISOString();
    update((s) => {
      if (s.challenge.answers[qid]) return s;
      return { ...s, challenge: { ...s.challenge, answers: { ...s.challenge.answers, [qid]: { ...outcome, at } } } };
    });
  },

  retryChallenge(qid: string, outcome: { result: AttemptResult; selfScore?: number }) {
    const at = new Date().toISOString();
    update((s) => ({ ...s, challenge: { ...s.challenge, retries: { ...s.challenge.retries, [qid]: { ...outcome, at } } } }));
  },

  setChallengeTarget(date: string) {
    update((s) => ({ ...s, challenge: { ...s.challenge, targetDate: date } }));
  },

  resetChallenge() {
    update((s) => ({ ...s, challenge: { answers: {}, retries: {}, targetDate: s.challenge.targetDate } }));
  },

  upsertStory(story: Omit<Story, "createdAt" | "updatedAt"> & { createdAt?: string }) {
    const now = new Date().toISOString();
    update((s) => {
      const exists = s.stories.some((x) => x.id === story.id);
      const record: Story = { ...story, createdAt: story.createdAt ?? now, updatedAt: now };
      return { ...s, stories: exists ? s.stories.map((x) => (x.id === story.id ? { ...record, createdAt: x.createdAt } : x)) : [...s.stories, record] };
    });
  },

  deleteStory(id: string) {
    update((s) => ({ ...s, stories: s.stories.filter((x) => x.id !== id) }));
  },

  importState(raw: unknown): boolean {
    if (!isRecord(raw) || raw.version !== 1) return false;
    update(() => sanitizeState(raw));
    return true;
  },

  resetAll() {
    update(() => emptyState());
  },
};
