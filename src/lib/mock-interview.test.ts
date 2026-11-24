import { describe, expect, it } from "vitest";
import { MOCK_LEVELS, MOCK_QUESTIONS } from "@/content/mock-interview";
import { gradeMock, isMockLevelUnlocked, MOCK_PASS_MARK, mockLevelsPassed } from "./mock-interview";
import { sanitizeState } from "./store";

describe("mock interview content", () => {
  it("has 50 questions in 5 levels of 10, with unique ids", () => {
    expect(MOCK_LEVELS.map((l) => l.level)).toEqual([1, 2, 3, 4, 5]);
    for (const l of MOCK_LEVELS) expect(l.questions).toHaveLength(10);
    expect(MOCK_QUESTIONS).toHaveLength(50);
    expect(new Set(MOCK_QUESTIONS.map((q) => q.id)).size).toBe(50);
  });

  it("gives every question a usable answer and a time limit that varies", () => {
    for (const q of MOCK_QUESTIONS) {
      expect(Number.isFinite(q.answer)).toBe(true);
      expect(q.tolerance).toBeGreaterThanOrEqual(0);
      expect(q.seconds).toBeGreaterThanOrEqual(10);
      // Typing the exact answer is always graded correct.
      expect(gradeMock(q, String(q.answer))).toBe(true);
    }
    expect(new Set(MOCK_QUESTIONS.map((q) => q.seconds)).size).toBeGreaterThan(3);
  });

  it("has English and Spanish text for every level and question", () => {
    for (const l of MOCK_LEVELS) {
      for (const text of [l.title, l.blurb]) {
        expect(text.en.trim()).not.toBe("");
        expect(text.es.trim()).not.toBe("");
      }
    }
    for (const q of MOCK_QUESTIONS) {
      for (const text of [q.prompt, q.explanation]) {
        expect(text.en.trim()).not.toBe("");
        expect(text.es.trim()).not.toBe("");
      }
    }
  });
});

describe("grading", () => {
  const byId = (id: string) => MOCK_QUESTIONS.find((q) => q.id === id)!;

  it("accepts units and formatting, and rejects wrong or blank answers", () => {
    expect(gradeMock(byId("m1-02"), "25%")).toBe(true);
    expect(gradeMock(byId("m1-04"), "$1,210")).toBe(true);
    expect(gradeMock(byId("m1-03"), "−4")).toBe(true);
    expect(gradeMock(byId("m1-03"), "4")).toBe(false);
    expect(gradeMock(byId("m1-01"), "")).toBe(false);
    expect(gradeMock(byId("m1-01"), "abc")).toBe(false);
  });

  it("uses the tolerance for approximate answers", () => {
    expect(gradeMock(byId("m4-02"), "25")).toBe(true);
    expect(gradeMock(byId("m4-02"), "30")).toBe(false);
    expect(gradeMock(byId("m5-02"), "907.03")).toBe(true);
  });
});

describe("unlocking", () => {
  const r = (best: number) => ({ best, last: best, attempts: 1, lastAt: "" });

  it("opens level 1 always and each next level after a pass", () => {
    expect(isMockLevelUnlocked({}, 1)).toBe(true);
    expect(isMockLevelUnlocked({}, 2)).toBe(false);
    expect(isMockLevelUnlocked({ "1": r(MOCK_PASS_MARK - 1) }, 2)).toBe(false);
    expect(isMockLevelUnlocked({ "1": r(MOCK_PASS_MARK) }, 2)).toBe(true);
    expect(mockLevelsPassed({ "1": r(10), "2": r(7), "3": r(3) })).toBe(2);
  });

  it("keeps saved results through sanitizeState and defaults to none", () => {
    expect(sanitizeState({ version: 1 }).mock).toEqual({});
    expect(sanitizeState({ version: 1, mock: { "1": r(8) } }).mock["1"].best).toBe(8);
  });
});
