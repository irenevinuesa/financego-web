import { MOCK_LEVELS, type MockQuestion } from "@/content/mock-interview";
import { isWithinTolerance, parseNumericInput } from "./format";
import type { MockLevelResult } from "./store";

/** Correct answers out of 10 needed to pass a level and unlock the next one. */
export const MOCK_PASS_MARK = 7;

/** True when what the learner typed is the right number. Blank or unreadable input is wrong. */
export function gradeMock(question: MockQuestion, raw: string): boolean {
  const n = parseNumericInput(raw);
  return n !== null && isWithinTolerance(n, question.answer, question.tolerance);
}

/** Level 1 is always open; every other level opens once the previous one is passed. */
export function isMockLevelUnlocked(results: Record<string, MockLevelResult>, level: number): boolean {
  if (level <= 1) return true;
  return (results[String(level - 1)]?.best ?? 0) >= MOCK_PASS_MARK;
}

export function mockLevelsPassed(results: Record<string, MockLevelResult>): number {
  return MOCK_LEVELS.filter((l) => (results[String(l.level)]?.best ?? 0) >= MOCK_PASS_MARK).length;
}

/** Shortest and longest time limit in a level, in seconds. */
export function mockTimeRange(level: number): [number, number] {
  const secs = MOCK_LEVELS.find((l) => l.level === level)?.questions.map((q) => q.seconds) ?? [0];
  return [Math.min(...secs), Math.max(...secs)];
}
