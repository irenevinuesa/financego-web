/**
 * The 500 Challenge: every Practice question in one fixed, mixed order, split
 * into 10 stages of 50. Difficulty rises stage by stage, topics rotate so two
 * consecutive questions never share a subject (whenever the pool allows), and
 * answering a question unlocks the next. Missed questions can be retried.
 */

import { QUESTIONS } from "@/content/questions";
import type { Difficulty, Question, TopicId } from "@/content/types";
import type { ChallengeAnswer, ChallengeState } from "./store";

export const CHALLENGE_TARGET = 500;
export const STAGE_SIZE = 50;

export const STAGES = [
  { title: "First steps", blurb: "Core definitions and the logic behind them." },
  { title: "Foundations", blurb: "The three statements, discounting and simple multiples." },
  { title: "Building blocks", blurb: "Cash flow, cost of capital and how markets react." },
  { title: "Core technicals", blurb: "The questions every first round covers." },
  { title: "Halfway", blurb: "Linking ideas across accounting, valuation and deals." },
  { title: "Going deeper", blurb: "Trickier mechanics and second-order effects." },
  { title: "Advanced", blurb: "Multi-step problems and interview traps." },
  { title: "Pressure test", blurb: "Harder maths and judgement calls." },
  { title: "Final round", blurb: "What senior interviewers push on." },
  { title: "Superday ready", blurb: "The hardest questions in the bank." },
];

const LEVEL: Record<Difficulty, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };

/** Stable pseudo-random number in [0, 1) from a string. */
function hashUnit(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * Greedy interleave: always take the next question from the topic with the most
 * remaining questions that differs from the previous topic, so subjects stay mixed.
 */
function interleave(pool: Question[], previousTopic: TopicId | null): Question[] {
  const byTopic = new Map<TopicId, Question[]>();
  for (const q of pool) byTopic.set(q.topic, [...(byTopic.get(q.topic) ?? []), q]);
  const out: Question[] = [];
  let prev = previousTopic;
  while (out.length < pool.length) {
    const candidates = [...byTopic.entries()].filter(([, qs]) => qs.length > 0).sort((a, b) => b[1].length - a[1].length || (a[0] < b[0] ? -1 : 1));
    const pick = candidates.find(([t]) => t !== prev) ?? candidates[0];
    const q = pick[1].shift()!;
    out.push(q);
    prev = q.topic;
  }
  return out;
}

/** The full challenge order (deterministic). Uses up to 500 questions from the bank. */
export function buildChallengeOrder(questions: Question[] = QUESTIONS): Question[] {
  // Rank by difficulty with a stable jitter so stages overlap a little in difficulty.
  const ranked = [...questions].sort((a, b) => {
    const ra = LEVEL[a.difficulty] + hashUnit(a.id) * 1.15;
    const rb = LEVEL[b.difficulty] + hashUnit(b.id) * 1.15;
    return ra - rb || (a.id < b.id ? -1 : 1);
  });
  const selected = ranked.slice(0, CHALLENGE_TARGET);
  const order: Question[] = [];
  for (let start = 0; start < selected.length; start += STAGE_SIZE) {
    const stage = selected.slice(start, start + STAGE_SIZE).sort((a, b) => hashUnit(`${a.id}#`) - hashUnit(`${b.id}#`));
    order.push(...interleave(stage, order.length ? order[order.length - 1].topic : null));
  }
  return order;
}

export const CHALLENGE: Question[] = buildChallengeOrder();
const POSITION = new Map(CHALLENGE.map((q, i) => [q.id, i]));

export function challengePosition(qid: string): number | undefined {
  return POSITION.get(qid);
}

export function stageOf(index: number) {
  return Math.floor(index / STAGE_SIZE);
}

/* ───────────── Progress ───────────── */

export type SquareState = "correct" | "missed" | "self" | "current" | "locked" | "retried";

function isMiss(a: ChallengeAnswer | undefined) {
  return a ? a.result === "incorrect" || (a.result === "self" && (a.selfScore ?? 0) < 0.5) : false;
}

export function challengeProgress(state: ChallengeState, order: Question[] = CHALLENGE) {
  const answered = order.filter((q) => state.answers[q.id]).length;
  // The current question is the first one not yet answered: everything before it is unlocked.
  const currentIndex = order.findIndex((q) => !state.answers[q.id]);
  const done = currentIndex === -1;
  const graded = order.filter((q) => state.answers[q.id] && state.answers[q.id].result !== "self");
  const correct = graded.filter((q) => state.answers[q.id].result === "correct").length;
  const missed = order.filter((q) => isMiss(state.answers[q.id]) && state.retries[q.id]?.result !== "correct" && !(state.retries[q.id]?.result === "self" && (state.retries[q.id]?.selfScore ?? 0) >= 0.5));

  const stages = Array.from({ length: Math.ceil(order.length / STAGE_SIZE) }, (_, s) => {
    const qs = order.slice(s * STAGE_SIZE, (s + 1) * STAGE_SIZE);
    const ans = qs.filter((q) => state.answers[q.id]);
    const g = ans.filter((q) => state.answers[q.id].result !== "self");
    return {
      index: s,
      ...STAGES[s],
      total: qs.length,
      answered: ans.length,
      accuracy: g.length ? g.filter((q) => state.answers[q.id].result === "correct").length / g.length : null,
    };
  });

  const byTopic = new Map<TopicId, { correct: number; total: number }>();
  for (const q of graded) {
    const t = byTopic.get(q.topic) ?? { correct: 0, total: 0 };
    t.total++;
    if (state.answers[q.id].result === "correct") t.correct++;
    byTopic.set(q.topic, t);
  }

  return {
    total: order.length,
    answered,
    currentIndex: done ? order.length : currentIndex,
    done,
    accuracy: graded.length ? correct / graded.length : null,
    missed,
    stages,
    byTopic,
  };
}

export function squareState(state: ChallengeState, index: number, currentIndex: number, order: Question[] = CHALLENGE): SquareState {
  const q = order[index];
  const a = state.answers[q.id];
  if (!a) return index === currentIndex ? "current" : "locked";
  if (isMiss(a)) return state.retries[q.id]?.result === "correct" ? "retried" : "missed";
  return a.result === "self" ? "self" : "correct";
}

/** Questions per day needed to finish by the target date (null when no date is set or it has passed). */
export function dailyPace(remaining: number, targetDate: string, today: string): { days: number; perDay: number } | null {
  if (!targetDate || remaining <= 0) return null;
  const days = Math.round((new Date(`${targetDate}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 86_400_000);
  if (days < 1) return null;
  return { days, perDay: Math.ceil(remaining / days) };
}
