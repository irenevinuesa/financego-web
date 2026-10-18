import { describe, expect, it } from "vitest";
import { COURSES, getLesson } from "../courses";
import { TOPICS } from "../taxonomy";
import type { Question, TopicId } from "../types";
import { BANK_B } from "./bank-b";
import { CORE_QUESTIONS } from "./bank-core";
import { MARKETS_QUESTIONS } from "./bank-markets";

/** Questions batch B adds per topic, and the totals the whole bank must reach. */
const ADDED: Partial<Record<TopicId, number>> = {
  lbo: 40,
  "capital-markets": 30,
  industries: 35,
  restructuring: 15,
  "credit-risk": 14,
};
const TARGETS: Partial<Record<TopicId, number>> = {
  lbo: 45,
  "capital-markets": 30,
  industries: 35,
  restructuring: 15,
  "credit-risk": 20,
};

function countByTopic(qs: Question[]) {
  const m = new Map<TopicId, number>();
  qs.forEach((q) => m.set(q.topic, (m.get(q.topic) ?? 0) + 1));
  return m;
}

const learnIds = COURSES.flatMap((c) => [...c.lessons.flatMap((l) => l.check), ...c.assessment]).map((q) => q.id);

describe("question bank B", () => {
  it("has unique b- ids that do not clash with the rest of the content", () => {
    const ids = BANK_B.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id, id).toMatch(/^b-[a-z0-9-]+$/));
    const others = new Set([...CORE_QUESTIONS, ...MARKETS_QUESTIONS].map((q) => q.id).concat(learnIds));
    ids.forEach((id) => expect(others.has(id), id).toBe(false));
  });

  it("has well-formed questions", () => {
    for (const q of BANK_B) {
      expect(TOPICS[q.topic], q.id).toBeDefined();
      expect(q.tracks.length, q.id).toBeGreaterThan(0);
      expect(q.minutes, q.id).toBeGreaterThan(0);
      expect(q.prompt.length, q.id).toBeGreaterThan(10);
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
      if (q.format === "mcq") {
        expect(q.options?.length, q.id).toBeGreaterThanOrEqual(2);
        expect(new Set(q.options).size, q.id).toBe(q.options!.length);
        expect(Number.isInteger(q.answer), q.id).toBe(true);
        expect(q.answer!, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer!, q.id).toBeLessThan(q.options!.length);
      }
      if (q.format === "numeric") {
        expect(Number.isFinite(q.numeric?.value), q.id).toBe(true);
        expect(q.numeric!.tolerance, q.id).toBeGreaterThanOrEqual(0);
      }
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
          } else {
            expect(Number.isFinite(s.numeric?.value), q.id).toBe(true);
            expect(s.numeric!.tolerance, q.id).toBeGreaterThanOrEqual(0);
          }
        }
      }
      if (q.lesson) expect(getLesson(q.lesson.courseId, q.lesson.lessonId), `${q.id} lesson link`).toBeDefined();
    }
  });

  it("adds the planned number of questions per topic", () => {
    const counts = countByTopic(BANK_B);
    expect(Object.fromEntries(counts)).toEqual(ADDED);
  });

  it("brings the whole bank to the target per topic", () => {
    const counts = countByTopic([...CORE_QUESTIONS, ...MARKETS_QUESTIONS, ...BANK_B]);
    for (const [topic, target] of Object.entries(TARGETS)) expect(counts.get(topic as TopicId), topic).toBe(target);
  });

  it("keeps the agreed mix of formats, difficulties and answer positions", () => {
    const n = BANK_B.length;
    const share = (pred: (q: Question) => boolean) => BANK_B.filter(pred).length / n;
    expect(share((q) => q.format === "mcq" || q.format === "numeric")).toBeGreaterThanOrEqual(0.8);
    expect(share((q) => q.format === "open")).toBeGreaterThanOrEqual(0.07);
    expect(share((q) => q.format === "multistep")).toBeGreaterThan(0);
    expect(share((q) => q.difficulty === "Beginner")).toBeGreaterThanOrEqual(0.3);
    expect(share((q) => q.difficulty === "Intermediate")).toBeGreaterThanOrEqual(0.4);
    expect(share((q) => q.difficulty === "Advanced")).toBeGreaterThanOrEqual(0.15);
    // No option position should give the answer away.
    const mcqs = BANK_B.filter((q) => q.format === "mcq");
    for (let i = 0; i < 4; i++) expect(mcqs.filter((q) => q.answer === i).length / mcqs.length).toBeLessThan(0.4);
  });
});
