import { describe, expect, it } from "vitest";
import { ALL_COURSES, COURSES, FEATURED_COURSE_IDS, getLesson } from "./courses";
import { QOTD_POOL, QUESTIONS, getQuestion, questionOfTheDay } from "./questions";
import { CAREER_GUIDES } from "./careers/guides";
import { ILLUSTRATIVE_SCENARIOS, ROADMAPS } from "./careers/resources";
import { TOOLS } from "./tools";
import { TOPIC_IDS } from "./taxonomy";
import type { Question, TopicId } from "./types";

const allLearnQuestions = COURSES.flatMap((c) => [...c.lessons.flatMap((l) => l.check), ...c.assessment]);

function validate(q: Question) {
  expect(q.prompt.length, q.id).toBeGreaterThan(10);
  expect(q.explanation.length, q.id).toBeGreaterThan(10);
  if (q.format === "mcq") {
    expect(q.options?.length, q.id).toBeGreaterThanOrEqual(2);
    expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
    expect(q.answer!, q.id).toBeLessThan(q.options!.length);
  }
  if (q.format === "numeric") {
    expect(Number.isFinite(q.numeric?.value), q.id).toBe(true);
    expect(q.numeric!.tolerance, q.id).toBeGreaterThanOrEqual(0);
  }
  if (q.format === "open") {
    expect(q.modelAnswer?.length, q.id).toBeGreaterThan(40);
    expect(q.keyPoints?.length, q.id).toBeGreaterThanOrEqual(3);
  }
  if (q.format === "multistep") {
    expect(q.steps?.length, q.id).toBeGreaterThanOrEqual(2);
    for (const s of q.steps!) {
      if (s.format === "mcq") expect(s.answer!).toBeLessThan(s.options!.length);
      else expect(Number.isFinite(s.numeric?.value)).toBe(true);
    }
  }
  if (q.lesson) expect(getLesson(q.lesson.courseId, q.lesson.lessonId), `${q.id} lesson link`).toBeDefined();
}

/** Section targets for the 500 Challenge (500 in total). */
const SECTION_TARGETS: Record<TopicId, number> = {
  accounting: 55,
  valuation: 55,
  "corporate-finance": 25,
  ma: 45,
  lbo: 45,
  "capital-markets": 30,
  industries: 35,
  restructuring: 15,
  markets: 30,
  "fixed-income": 30,
  derivatives: 25,
  macro: 25,
  "credit-risk": 20,
  quant: 20,
  "brain-teasers": 30,
  strategy: 15,
};

describe("question bank", () => {
  it("has exactly 500 questions, split by the section targets", () => {
    expect(QUESTIONS.length).toBe(500);
    expect(Object.values(SECTION_TARGETS).reduce((a, b) => a + b, 0)).toBe(500);
    for (const t of TOPIC_IDS) expect(QUESTIONS.filter((q) => q.topic === t).length, t).toBe(SECTION_TARGETS[t]);
  });

  it("has unique ids across the bank, lesson checks and assessments", () => {
    const ids = [...QUESTIONS, ...allLearnQuestions].map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has well-formed questions", () => {
    [...QUESTIONS, ...allLearnQuestions].forEach(validate);
  });

  it("covers every format and at least four questions per topic", () => {
    const formats = new Set(QUESTIONS.map((q) => q.format));
    expect([...formats].sort()).toEqual(["mcq", "multistep", "numeric", "open"]);
    const byTopic = new Map<string, number>();
    QUESTIONS.forEach((q) => byTopic.set(q.topic, (byTopic.get(q.topic) ?? 0) + 1));
    expect(byTopic.size).toBe(TOPIC_IDS.length);
    byTopic.forEach((n) => expect(n).toBeGreaterThanOrEqual(4));
  });

  it("only uses auto-gradable questions for the question of the day", () => {
    for (const id of QOTD_POOL) {
      const q = getQuestion(id);
      expect(q, id).toBeDefined();
      expect(["mcq", "numeric"]).toContain(q!.format);
    }
    expect(questionOfTheDay("2026-10-17").id).toBe(questionOfTheDay("2026-10-17").id);
  });
});

describe("courses", () => {
  it("has unique course and lesson ids and featured courses that exist", () => {
    const ids = ALL_COURSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    FEATURED_COURSE_IDS.forEach((id) => expect(ids).toContain(id));
    for (const c of COURSES) {
      const lessonIds = c.lessons.map((l) => l.id);
      expect(new Set(lessonIds).size).toBe(lessonIds.length);
      expect(lessonIds).not.toContain("assessment");
      expect(c.lessonCount).toBe(c.lessons.length);
      c.lessons.forEach((l) => expect(l.check.length).toBeGreaterThanOrEqual(2));
    }
  });
});

describe("career and tool links", () => {
  it("links only to existing questions, courses and tools", () => {
    for (const s of ILLUSTRATIVE_SCENARIOS) for (const q of s.sampleQuestions) if (q.practiceId) expect(getQuestion(q.practiceId), q.practiceId).toBeDefined();
    for (const g of CAREER_GUIDES) for (const id of g.courses) expect(ALL_COURSES.some((c) => c.id === id), `${g.slug}: ${id}`).toBe(true);
    for (const r of ROADMAPS)
      for (const s of r.steps) {
        const m = /^\/learn\/([^/]+)\/(?:([^/]+)\/)?$/.exec(s.href);
        if (m) {
          expect(ALL_COURSES.some((c) => c.id === m[1]), s.href).toBe(true);
          if (m[2]) expect(getLesson(m[1], m[2]), s.href).toBeDefined();
        }
        const t = /^\/tools\/([^/]+)\/$/.exec(s.href);
        if (t) expect(TOOLS.find((x) => x.slug === t[1])?.status, s.href).toBe("available");
      }
  });
});
