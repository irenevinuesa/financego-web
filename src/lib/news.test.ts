import { describe, expect, it } from "vitest";
import { conceptFor, getNews, NEWS_CATEGORY_IDS, NEWS_SOURCES } from "./news";

describe("saved headlines", () => {
  const { items, collectedAt } = getNews();

  it("are a fixed selection with a collection date", () => {
    expect(items.length).toBeGreaterThan(20);
    expect(Number.isNaN(new Date(collectedAt).getTime())).toBe(false);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it("are complete, newest first and from known categories", () => {
    for (const i of items) {
      expect(i.title.length).toBeGreaterThan(0);
      expect(i.url.startsWith("https://")).toBe(true);
      expect(NEWS_CATEGORY_IDS).toContain(i.category);
      expect(new Date(i.publishedAt).getTime()).toBeLessThanOrEqual(new Date(collectedAt).getTime());
    }
    const dates = items.map((i) => i.publishedAt);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});

describe("learning links", () => {
  it("points headlines at the related FinanceGo page", () => {
    expect(conceptFor({ title: "Pfizer agrees $40bn acquisition of biotech", teaser: "" })!.label.en).toBe("M&A Fundamentals");
    expect(conceptFor({ title: "Treasury yields climb", teaser: "" })!.label.en).toBe("Fixed Income");
    expect(conceptFor({ title: "ECB holds interest rates", teaser: "" })!.label.en).toBe("Macro practice");
    expect(conceptFor({ title: "Nvidia earnings beat estimates", teaser: "" })!.label.en).toBe("Accounting Fundamentals");
    expect(conceptFor({ title: "A quiet day", teaser: "" })).toBeNull();
    expect(conceptFor({ title: "ECB holds interest rates", teaser: "" })!.label.es).toBe("Practica macro");
  });
});

describe("sources", () => {
  it("are unique https feeds", () => {
    expect(new Set(NEWS_SOURCES.map((s) => s.id)).size).toBe(NEWS_SOURCES.length);
    for (const s of NEWS_SOURCES) expect(s.url.startsWith("https://")).toBe(true);
  });
});
