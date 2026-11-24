import { describe, expect, it } from "vitest";
import { TEASER_CATEGORIES, TEASER_CATEGORY_IDS, TEASER_DIFFICULTIES, TEASER_DIFFICULTY_LABELS, TEASERS } from "./brain-teasers";
import { isWithinTolerance, parseNumericInput } from "@/lib/format";
import { sanitizeState } from "@/lib/store";
import { LANGS } from "@/lib/i18n";

describe("brain teasers", () => {
  it("has unique ids and covers every category", () => {
    expect(TEASERS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(TEASERS.map((t) => t.id)).size).toBe(TEASERS.length);
    for (const c of TEASER_CATEGORY_IDS) expect(TEASERS.filter((t) => t.category === c).length).toBeGreaterThanOrEqual(5);
  });

  it("gives every teaser a hint and a solution, and numeric answers that check", () => {
    for (const t of TEASERS) {
      for (const lang of LANGS) {
        expect(t.hint[lang].length).toBeGreaterThan(10);
        expect(t.solution[lang].length).toBeGreaterThan(20);
      }
      if (t.answer) {
        const parsed = parseNumericInput(String(t.answer.value));
        expect(parsed).not.toBeNull();
        expect(isWithinTolerance(parsed!, t.answer.value, t.answer.tolerance)).toBe(true);
      }
    }
  });

  it("has English and Spanish text for every category, difficulty and teaser", () => {
    for (const lang of LANGS) {
      for (const c of TEASER_CATEGORY_IDS) {
        expect(TEASER_CATEGORIES[c].label[lang].trim()).not.toBe("");
        expect(TEASER_CATEGORIES[c].blurb[lang].trim()).not.toBe("");
      }
      for (const d of TEASER_DIFFICULTIES) expect(TEASER_DIFFICULTY_LABELS[d][lang].trim()).not.toBe("");
      for (const t of TEASERS) {
        for (const text of [t.title, t.prompt, t.hint, t.answerText, t.solution]) expect(text[lang].trim()).not.toBe("");
      }
    }
  });

  it("keeps the arithmetic in the answers right", () => {
    const val = (id: string) => TEASERS.find((t) => t.id === id)!.answer!.value;
    expect(val("bt-mm-37x43")).toBe(37 * 43);
    expect(val("bt-mm-65sq")).toBe(65 ** 2);
    expect(val("bt-mm-99sq")).toBe(99 ** 2);
    expect(val("bt-mm-125x48")).toBe(125 * 48);
    expect(val("bt-lg-chessboard")).toBe([1, 2, 3, 4, 5, 6, 7, 8].reduce((s, k) => s + k * k, 0));
    expect(val("bt-ev-all-faces")).toBeCloseTo(6 * [1, 2, 3, 4, 5, 6].reduce((s, k) => s + 1 / k, 0), 1);
    let p = 1;
    for (let i = 0; i < 23; i++) p *= (365 - i) / 365;
    expect(val("bt-birthday-23")).toBeCloseTo((1 - p) * 100, 0);
  });

  it("stores solved teasers safely", () => {
    expect(sanitizeState({ version: 1 }).teasersSolved).toEqual([]);
    expect(sanitizeState({ version: 1, teasersSolved: ["a", 3, "b"] }).teasersSolved).toEqual(["a", "b"]);
  });
});
