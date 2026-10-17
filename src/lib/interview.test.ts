import { describe, expect, it } from "vitest";
import { INTERVIEW_ITEMS } from "@/content/interview/items";
import { evaluateAnswer, extractNumbers, getItem, normalize, selectItems, summarize } from "./interview";

describe("text helpers", () => {
  it("normalises case and accents", () => {
    expect(normalize("Valoración DISMINUYE")).toBe("valoracion disminuye");
  });

  it("extracts numbers in English and Spanish formats", () => {
    expect(extractNumbers("MOIC of 2.6x")).toEqual([2.6]);
    expect(extractNumbers("un MOIC de 2,6x")).toEqual([2.6]);
    expect(extractNumbers("break-even at 1,000 members")).toContain(1000);
    expect(extractNumbers("1.000 socios")).toContain(1000);
    expect(extractNumbers("1,250,000 and 3.000.000,5")).toEqual([1250000, 3000000.5]);
    expect(extractNumbers("precio cae −3,5%")).toEqual([-3.5]);
  });
});

describe("answer evaluation", () => {
  const dcf = getItem("iv-dcf-wacc")!;

  it("treats the spec example as a strong answer and asks the deeper follow-up", () => {
    const r = evaluateAnswer("The valuation decreases.", dcf.concepts, dcf.minConcepts);
    expect(r.strong).toBe(true);
    expect(r.hits).toContain("direction");
  });

  it("does not credit an answer that misses the key concept", () => {
    const r = evaluateAnswer("It goes up because the discount rate is used.", dcf.concepts, dcf.minConcepts);
    expect(r.strong).toBe(false);
  });

  it("matches Spanish answers", () => {
    const r = evaluateAnswer("La valoración disminuye porque el descuento es mayor.", dcf.concepts, dcf.minConcepts);
    expect(r.strong).toBe(true);
    expect(r.hits).toEqual(expect.arrayContaining(["direction", "discounting"]));
  });

  it("grades numeric items by tolerance", () => {
    const lbo = getItem("iv-paper-lbo")!;
    expect(evaluateAnswer("Equity in 250, out 650, so 2.6x", lbo.concepts, lbo.minConcepts, lbo.numeric).numericCorrect).toBe(true);
    expect(evaluateAnswer("About 3x", lbo.concepts, lbo.minConcepts, lbo.numeric).numericCorrect).toBe(false);
  });

  it("scores structure and clarity heuristically", () => {
    const strong = evaluateAnswer(
      "First, the valuation falls because the discount rate is higher. Second, the terminal value is hit hardest, since it sits furthest in the future.",
      dcf.concepts,
      dcf.minConcepts,
    );
    const weak = evaluateAnswer("down", dcf.concepts, dcf.minConcepts);
    expect(strong.structure).toBeGreaterThan(weak.structure);
    expect(strong.clarity).toBeGreaterThan(weak.clarity);
  });
});

describe("session selection", () => {
  it("returns the requested number of items", () => {
    const { items } = selectItems({ track: "investment-banking", difficulty: "Intermediate", length: 5, type: "technical", topics: [], lang: "en", timer: false });
    expect(items).toHaveLength(5);
    expect(new Set(items.map((i) => i.id)).size).toBe(5);
  });

  it("relaxes filters and reports it when too few items match", () => {
    const { items, relaxed } = selectItems({ track: "consulting", difficulty: "Advanced", length: 8, type: "pitch", topics: ["derivatives"], lang: "en", timer: false });
    expect(items).toHaveLength(8);
    expect(relaxed.length).toBeGreaterThan(0);
  });

  it("puts a single behavioural question first in mixed interviews", () => {
    for (let s = 0; s < 10; s++) {
      const { items } = selectItems({ track: "private-equity", difficulty: "Beginner", length: 8, type: "mixed", topics: [], lang: "en", timer: false });
      const behavioural = items.filter((i) => i.format === "behavioral");
      expect(behavioural.length).toBeLessThanOrEqual(1);
      if (behavioural.length) expect(items[0].format).toBe("behavioral");
    }
  });

  it("summarises turns", () => {
    const item = getItem("iv-dcf-wacc")!;
    const ev = evaluateAnswer("The valuation decreases", item.concepts, item.minConcepts);
    const s = summarize([{ itemId: item.id, stage: "main", question: "q", answer: "The valuation decreases", evaluation: ev }], "en");
    expect(s.answered).toBe(1);
    expect(s.strongItems).toContain(item.id);
  });
});

describe("interview content", () => {
  it("has unique ids, valid patterns and both languages", () => {
    const ids = new Set<string>();
    for (const item of INTERVIEW_ITEMS) {
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
      for (const text of [item.prompt, item.modelAnswer, item.followUp.deeper, item.followUp.probe, item.followUpModelAnswer]) {
        expect(text.en.length).toBeGreaterThan(5);
        expect(text.es.length).toBeGreaterThan(5);
      }
      for (const c of [...item.concepts, ...item.followUp.concepts]) {
        for (const p of c.patterns) expect(() => new RegExp(p)).not.toThrow();
      }
    }
  });
});
