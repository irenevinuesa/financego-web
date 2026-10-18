/* Practice-session building: modes, filters and queue selection. */

import { QUESTIONS, matchesType, type QuestionTypeFilter } from "@/content/questions";
import type { Difficulty, Question, TopicId, TrackId } from "@/content/types";
import type { Attempt } from "./store";

export type PracticeMode = "quick" | "standard" | "timed" | "topic" | "interview" | "review" | "custom";

export const MODES: Record<PracticeMode, { title: string; description: string; size: number | null; minutes?: number }> = {
  quick: { title: "Quick Practice", description: "Five questions across topics. Ten minutes, good for a daily habit.", size: 5 },
  standard: { title: "Standard Practice", description: "Fifteen questions, mixed formats and difficulties.", size: 15 },
  timed: { title: "Timed Challenge", description: "Ten auto-graded questions against a 12-minute clock, like an online test.", size: 10, minutes: 12 },
  topic: { title: "Topic Mastery", description: "Every question in one topic, from easiest to hardest.", size: null },
  interview: { title: "Interview Preparation", description: "Questions tagged for a career track, weighted towards traps, cases and open answers.", size: 10 },
  review: { title: "Review Incorrect Answers", description: "Questions you most recently got wrong, until you get them right.", size: null },
  custom: { title: "Filtered Practice", description: "The questions that match your filters in the question bank.", size: 20 },
};

export interface BankFilters {
  topic?: TopicId | "";
  difficulty?: Difficulty | "";
  type?: QuestionTypeFilter | "";
  track?: TrackId | "";
  maxMinutes?: number;
  status?: "" | "unanswered" | "completed" | "incorrect";
}

export function applyFilters(questions: Question[], f: BankFilters, latest: Map<string, Attempt>): Question[] {
  return questions.filter((q) => {
    if (f.topic && q.topic !== f.topic) return false;
    if (f.difficulty && q.difficulty !== f.difficulty) return false;
    if (f.type && !matchesType(q, f.type)) return false;
    if (f.track && !q.tracks.includes(f.track)) return false;
    if (f.maxMinutes && q.minutes > f.maxMinutes) return false;
    const a = latest.get(q.id);
    if (f.status === "unanswered" && a) return false;
    if (f.status === "completed" && !a) return false;
    if (f.status === "incorrect" && a?.result !== "incorrect") return false;
    return true;
  });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIFF_ORDER: Record<Difficulty, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };

/** Unanswered questions first, then the rest, each group shuffled. */
function freshFirst(pool: Question[], latest: Map<string, Attempt>) {
  return [...shuffle(pool.filter((q) => !latest.has(q.id))), ...shuffle(pool.filter((q) => latest.has(q.id)))];
}

export function buildQueue(mode: PracticeMode, filters: BankFilters, latest: Map<string, Attempt>, incorrectIds: string[]): Question[] {
  const filtered = applyFilters(QUESTIONS, filters, latest);
  switch (mode) {
    case "quick":
    case "standard":
      return freshFirst(filtered, latest).slice(0, MODES[mode].size!);
    case "timed":
      return freshFirst(
        filtered.filter((q) => q.format === "mcq" || q.format === "numeric"),
        latest,
      ).slice(0, MODES.timed.size!);
    case "topic":
      return [...filtered].sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);
    case "interview": {
      const weight = (q: Question) => (q.kinds?.includes("trap") ? 3 : 0) + (q.format === "open" || q.format === "multistep" ? 2 : 0) + (q.kinds?.includes("case") ? 1 : 0) + Math.random() * 2;
      return [...filtered].sort((a, b) => weight(b) - weight(a)).slice(0, MODES.interview.size!);
    }
    case "review":
      return shuffle(QUESTIONS.filter((q) => incorrectIds.includes(q.id) && (!filters.topic || q.topic === filters.topic)));
    case "custom":
      return filtered.slice(0, MODES.custom.size!);
  }
}
