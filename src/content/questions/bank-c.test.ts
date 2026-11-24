import { describe, expect, it } from "vitest";
import { COURSES, getLesson } from "../courses";
import type { Question, TopicId } from "../types";
import { BANK_C } from "./bank-c";
import { CORE_QUESTIONS } from "./bank-core";
import { MARKETS_QUESTIONS } from "./bank-markets";

/* Batch C of the 500 Challenge: per-topic counts it adds and the whole-bank totals it must reach. */
const ADDED: Partial<Record<TopicId, number>> = {
  markets: 24,
  "fixed-income": 22,
  derivatives: 19,
  macro: 20,
  quant: 14,
  "brain-teasers": 24,
  strategy: 11,
};
const TARGETS: Partial<Record<TopicId, number>> = {
  markets: 30,
  "fixed-income": 30,
  derivatives: 25,
  macro: 25,
  quant: 20,
  "brain-teasers": 30,
  strategy: 15,
};

function countByTopic(qs: Question[]) {
  const m = new Map<string, number>();
  qs.forEach((q) => m.set(q.topic, (m.get(q.topic) ?? 0) + 1));
  return m;
}

describe("bank C", () => {
  it("has unique, prefixed ids that do not clash with the rest of the content", () => {
    const ids = BANK_C.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id.startsWith("c-"), id).toBe(true));
    const learn = COURSES.flatMap((c) => [...c.lessons.flatMap((l) => l.check), ...c.assessment]);
    const others = new Set([...CORE_QUESTIONS, ...MARKETS_QUESTIONS, ...learn].map((q) => q.id));
    ids.forEach((id) => expect(others.has(id), id).toBe(false));
  });

  it("has well-formed questions", () => {
    for (const q of BANK_C) {
      expect(q.prompt.length, q.id).toBeGreaterThan(10);
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
      expect(q.tracks.length, q.id).toBeGreaterThan(0);
      expect(q.minutes, q.id).toBeGreaterThan(0);
      if (q.format === "mcq") {
        expect(q.options!.length, q.id).toBeGreaterThanOrEqual(3);
        expect(new Set(q.options).size, q.id).toBe(q.options!.length);
        expect(q.answer!, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer!, q.id).toBeLessThan(q.options!.length);
      }
      if (q.format === "numeric") {
        expect(Number.isFinite(q.numeric?.value), q.id).toBe(true);
        expect(q.numeric!.tolerance, q.id).toBeGreaterThanOrEqual(0);
      }
      if (q.format === "open") {
        expect(q.modelAnswer!.length, q.id).toBeGreaterThan(40);
        expect(q.keyPoints!.length, q.id).toBeGreaterThanOrEqual(3);
        expect(q.keyPoints!.length, q.id).toBeLessThanOrEqual(5);
      }
      if (q.format === "multistep") {
        expect(q.steps!.length, q.id).toBeGreaterThanOrEqual(2);
        for (const s of q.steps!) {
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
    const added = countByTopic(BANK_C);
    expect(Object.fromEntries(added)).toEqual(ADDED);
    expect(BANK_C.length).toBe(134);
  });

  it("brings the bank to the 500 Challenge targets for its topics", () => {
    const all = countByTopic([...CORE_QUESTIONS, ...MARKETS_QUESTIONS, ...BANK_C]);
    for (const [topic, target] of Object.entries(TARGETS)) expect(all.get(topic), topic).toBe(target);
  });

  it("keeps the format mix: mostly auto-graded, about 10% open, a few multistep", () => {
    const n = BANK_C.length;
    const auto = BANK_C.filter((q) => q.format === "mcq" || q.format === "numeric").length;
    const open = BANK_C.filter((q) => q.format === "open").length;
    const multi = BANK_C.filter((q) => q.format === "multistep").length;
    expect(auto / n).toBeGreaterThanOrEqual(0.8);
    expect(open / n).toBeGreaterThan(0.07);
    expect(open / n).toBeLessThan(0.13);
    expect(multi).toBeGreaterThanOrEqual(3);
  });

  it("spreads MCQ answers across option positions", () => {
    const answers = BANK_C.flatMap((q) =>
      q.format === "mcq" ? [q.answer!] : (q.steps ?? []).filter((s) => s.format === "mcq").map((s) => s.answer!),
    );
    const counts = [0, 1, 2, 3].map((i) => answers.filter((a) => a === i).length);
    counts.forEach((n) => expect(n / answers.length).toBeGreaterThan(0.15));
    counts.forEach((n) => expect(n / answers.length).toBeLessThan(0.35));
  });
});
