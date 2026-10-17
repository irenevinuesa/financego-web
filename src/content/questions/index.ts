import { COURSES } from "../courses";
import type { Question, QuestionKind, TopicId } from "../types";
import { CORE_QUESTIONS } from "./bank-core";
import { MARKETS_QUESTIONS } from "./bank-markets";

/** The Practice question bank. */
export const QUESTIONS: Question[] = [...CORE_QUESTIONS, ...MARKETS_QUESTIONS];

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

/** Lesson knowledge checks and course assessments, indexed for lookups from attempts. */
const LEARN_QUESTIONS = new Map<string, Question>();
for (const course of COURSES) {
  for (const lesson of course.lessons) for (const q of lesson.check) LEARN_QUESTIONS.set(q.id, q);
  for (const q of course.assessment) LEARN_QUESTIONS.set(q.id, q);
}

export function getQuestion(id: string): Question | undefined {
  return BY_ID.get(id);
}

/** Looks a question up in the bank, then in lessons and assessments. */
export function findAnyQuestion(id: string): Question | undefined {
  return BY_ID.get(id) ?? LEARN_QUESTIONS.get(id);
}

export function questionsForTopic(topic: TopicId): Question[] {
  return QUESTIONS.filter((q) => q.topic === topic);
}

export type QuestionTypeFilter = "mcq" | "numeric" | "open" | "multistep" | "scenario" | "trap";

export const QUESTION_TYPE_LABELS: Record<QuestionTypeFilter, string> = {
  mcq: "Multiple choice",
  numeric: "Numerical",
  open: "Open-ended",
  multistep: "Multi-step case",
  scenario: "Scenario",
  trap: "Interview trap",
};

export function matchesType(q: Question, type: QuestionTypeFilter): boolean {
  if (type === "scenario" || type === "trap") return (q.kinds ?? []).includes(type as QuestionKind);
  return q.format === type;
}

/** Auto-gradable questions eligible for "Question of the day": they reward reasoning, not recall. */
export const QOTD_POOL = [
  "acc-interest-cash",
  "cf-mm-no-tax",
  "val-negative-ev",
  "ma-stock-deal-pe-rule",
  "fi-highest-duration",
  "der-vol-up",
  "cr-var-meaning",
  "q-correlation-zero",
  "acc-goodwill-impairment",
  "val-implied-price-comps",
  "ma-accretion-not-value",
  "fi-convexity",
  "mkt-fx-forward",
  "cf-npv-vs-irr",
  "bt-two-coins",
  "acc-inventory-writedown",
  "lbo-irr-rule-of-thumb",
  "q-bayes-test",
];

/** Deterministic pick for a calendar date (YYYY-MM-DD), so everyone sees the same question that day. */
export function questionOfTheDay(date: string): Question {
  let hash = 0;
  for (const ch of date) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const id = QOTD_POOL[hash % QOTD_POOL.length];
  return BY_ID.get(id)!;
}
