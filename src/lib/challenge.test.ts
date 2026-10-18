import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/content/questions";
import type { Question } from "@/content/types";
import { buildChallengeOrder, CHALLENGE, CHALLENGE_TARGET, challengeProgress, dailyPace, squareState, STAGE_SIZE } from "./challenge";
import type { ChallengeState } from "./store";

const empty: ChallengeState = { answers: {}, retries: {}, targetDate: "" };

describe("challenge order", () => {
  it("uses every bank question once, up to 500, in a stable order", () => {
    expect(CHALLENGE.length).toBe(Math.min(QUESTIONS.length, CHALLENGE_TARGET));
    expect(new Set(CHALLENGE.map((q) => q.id)).size).toBe(CHALLENGE.length);
    expect(buildChallengeOrder().map((q) => q.id)).toEqual(CHALLENGE.map((q) => q.id));
  });

  it("gets harder from the first stage to the last", () => {
    const level = (qs: Question[]) => qs.reduce((s, q) => s + ({ Beginner: 0, Intermediate: 1, Advanced: 2 })[q.difficulty], 0) / qs.length;
    const first = CHALLENGE.slice(0, STAGE_SIZE);
    const last = CHALLENGE.slice(-STAGE_SIZE);
    expect(level(last)).toBeGreaterThan(level(first));
  });

  it("mixes topics: consecutive questions rarely share a subject", () => {
    let repeats = 0;
    for (let i = 1; i < CHALLENGE.length; i++) if (CHALLENGE[i].topic === CHALLENGE[i - 1].topic) repeats++;
    expect(repeats / CHALLENGE.length).toBeLessThan(0.05);
  });
});

describe("challenge progress", () => {
  const [q0, q1, q2] = CHALLENGE;

  it("starts with only the first question unlocked", () => {
    const p = challengeProgress(empty);
    expect(p.answered).toBe(0);
    expect(p.currentIndex).toBe(0);
    expect(squareState(empty, 0, 0)).toBe("current");
    expect(squareState(empty, 1, 0)).toBe("locked");
  });

  it("unlocks the next question after an answer, right or wrong, and lists misses", () => {
    const s: ChallengeState = {
      answers: { [q0.id]: { result: "correct", at: "x" }, [q1.id]: { result: "incorrect", at: "x" } },
      retries: {},
      targetDate: "",
    };
    const p = challengeProgress(s);
    expect(p.answered).toBe(2);
    expect(p.currentIndex).toBe(2);
    expect(p.accuracy).toBe(0.5);
    expect(p.missed.map((q) => q.id)).toEqual([q1.id]);
    expect(squareState(s, 1, 2)).toBe("missed");
    expect(squareState(s, 2, 2)).toBe("current");
    expect(q2).toBeDefined();
  });

  it("clears a miss once it is retried correctly", () => {
    const s: ChallengeState = { answers: { [q0.id]: { result: "incorrect", at: "x" } }, retries: { [q0.id]: { result: "correct", at: "y" } }, targetDate: "" };
    expect(challengeProgress(s).missed).toHaveLength(0);
    expect(squareState(s, 0, 1)).toBe("retried");
  });

  it("computes the daily pace to a recruiting date", () => {
    expect(dailyPace(300, "2026-11-30", "2026-10-31")).toEqual({ days: 30, perDay: 10 });
    expect(dailyPace(300, "", "2026-10-31")).toBeNull();
    expect(dailyPace(300, "2026-10-01", "2026-10-31")).toBeNull();
  });
});
