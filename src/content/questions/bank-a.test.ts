import { describe, expect, it } from "vitest";
import { getLesson } from "../courses";
import type { Question, TopicId } from "../types";
import { BANK_A } from "./bank-a";
import { CORE_QUESTIONS } from "./bank-core";
import { MARKETS_QUESTIONS } from "./bank-markets";

/** Batch A brings these topics to their 500 Challenge totals. */
const TARGETS: Partial<Record<TopicId, number>> = { accounting: 55, valuation: 55, "corporate-finance": 25, ma: 45 };
const ADDED: Partial<Record<TopicId, number>> = { accounting: 48, valuation: 45, "corporate-finance": 20, ma: 37 };

function countByTopic(qs: Question[]) {
  const counts = new Map<TopicId, number>();
  for (const q of qs) counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1);
  return counts;
}

function checkNumeric(id: string, n: Question["numeric"]) {
  expect(Number.isFinite(n?.value), id).toBe(true);
  expect(n!.tolerance, id).toBeGreaterThanOrEqual(0);
  // A tolerance wider than the answer itself would accept almost anything.
  if (n!.value !== 0) expect(n!.tolerance, id).toBeLessThan(Math.abs(n!.value));
}

describe("BANK_A", () => {
  it("has 150 questions with unique, prefixed ids that do not clash with the existing banks", () => {
    expect(BANK_A).toHaveLength(150);
    const ids = BANK_A.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^a-(acc|val|cf|ma)-\d{3}$/));
    const existing = new Set([...CORE_QUESTIONS, ...MARKETS_QUESTIONS].map((q) => q.id));
    ids.forEach((id) => expect(existing.has(id), id).toBe(false));
  });

  it("adds the planned number of questions per topic and reaches the bank targets", () => {
    const added = countByTopic(BANK_A);
    expect(Object.fromEntries(added)).toEqual(ADDED);
    const whole = countByTopic([...CORE_QUESTIONS, ...MARKETS_QUESTIONS, ...BANK_A]);
    for (const [topic, target] of Object.entries(TARGETS)) expect(whole.get(topic as TopicId), topic).toBe(target);
  });

  it("has well-formed questions", () => {
    for (const q of BANK_A) {
      expect(q.prompt.length, q.id).toBeGreaterThan(10);
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
      expect(q.tracks.length, q.id).toBeGreaterThan(0);
      expect(q.minutes, q.id).toBeGreaterThan(0);
      if (q.format === "mcq") {
        expect(q.options?.length, q.id).toBeGreaterThanOrEqual(3);
        expect(new Set(q.options).size, q.id).toBe(q.options!.length);
        expect(Number.isInteger(q.answer), q.id).toBe(true);
        expect(q.answer!, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer!, q.id).toBeLessThan(q.options!.length);
      }
      if (q.format === "numeric") checkNumeric(q.id, q.numeric);
      if (q.format === "open") {
        expect(q.modelAnswer?.length, q.id).toBeGreaterThan(40);
        expect(q.keyPoints?.length, q.id).toBeGreaterThanOrEqual(3);
        expect(q.keyPoints!.length, q.id).toBeLessThanOrEqual(5);
      }
      if (q.format === "multistep") {
        expect(q.steps?.length, q.id).toBeGreaterThanOrEqual(2);
        for (const s of q.steps!) {
          expect(s.explanation.length, q.id).toBeGreaterThan(5);
          if (s.format === "mcq") {
            expect(s.answer!, q.id).toBeGreaterThanOrEqual(0);
            expect(s.answer!, q.id).toBeLessThan(s.options!.length);
          } else checkNumeric(q.id, s.numeric);
        }
      }
      if (q.lesson) expect(getLesson(q.lesson.courseId, q.lesson.lessonId), `${q.id} lesson link`).toBeDefined();
    }
  });

  it("keeps the agreed mix of formats and difficulties", () => {
    const share = (pred: (q: Question) => boolean) => BANK_A.filter(pred).length / BANK_A.length;
    expect(share((q) => q.format === "mcq" || q.format === "numeric")).toBeGreaterThanOrEqual(0.8);
    expect(share((q) => q.format === "open")).toBeGreaterThanOrEqual(0.08);
    expect(BANK_A.some((q) => q.format === "multistep")).toBe(true);
    expect(share((q) => q.difficulty === "Beginner")).toBeGreaterThanOrEqual(0.3);
    expect(share((q) => q.difficulty === "Advanced")).toBeGreaterThanOrEqual(0.15);
  });

  it("spreads MCQ answers across positions", () => {
    const positions = BANK_A.filter((q) => q.format === "mcq").map((q) => q.answer!);
    for (const p of [0, 1, 2, 3]) expect(positions.filter((x) => x === p).length, `position ${p}`).toBeGreaterThanOrEqual(8);
  });
});
