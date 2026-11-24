import { describe, expect, it } from "vitest";
import { cleanText, conceptFor, NEWS_SOURCES, parseFeedDate, parseRss, selectNews, startOfYesterday, truncate, type NewsItem, type NewsSource } from "./news";

const src: NewsSource = { id: "t", name: "Test Wire", url: "https://example.test/rss", category: "markets" };

const feed = `<?xml version="1.0"?><rss><channel><title>Markets</title>
<item><title><![CDATA[Stocks rally as Fed&apos;s Williams hints at pause]]></title>
  <link>https://example.test/a</link><pubDate>Tue, 24 Nov 2026 13:33:49 GMT</pubDate>
  <description>&lt;p&gt;Equities rose &amp;amp; yields fell after comments.&lt;/p&gt;</description></item>
<item><title>No link here</title><pubDate>Tue, 24 Nov 2026 13:00:00 GMT</pubDate></item>
<item><title>Bad date</title><link>https://example.test/b</link><pubDate>someday</pubDate></item>
<item><title>Central bank speech</title><link><![CDATA[https://example.test//press/c]]></link><pubDate>Tue, 24 Nov 2026 12:00:00 +0100</pubDate></item>
</channel></rss>`;

describe("RSS parsing", () => {
  it("reads titles, links, dates and teasers, and skips broken items", () => {
    const items = parseRss(feed, src);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe("Stocks rally as Fed's Williams hints at pause");
    expect(items[0].teaser).toBe("Equities rose & yields fell after comments.");
    expect(items[0].publishedAt).toBe("2026-11-24T13:33:49.000Z");
    expect(items[1].url).toBe("https://example.test/press/c");
    expect(items[1].publishedAt).toBe("2026-11-24T11:00:00.000Z");
    expect(items[0].category).toBe("markets");
  });

  it("handles the date formats the feeds use", () => {
    expect(parseFeedDate("2026-11-24 13:42:37", true)!.toISOString()).toBe("2026-11-24T13:42:37.000Z");
    expect(parseFeedDate("<![CDATA[Fri, 20 Nov 2026 21:15:00 GMT]]>")!.toISOString()).toBe("2026-11-20T21:15:00.000Z");
    expect(parseFeedDate("Mon, 23 Nov 2026 10:00:00 Z")!.toISOString()).toBe("2026-11-23T10:00:00.000Z");
    expect(parseFeedDate("")).toBeNull();
  });

  it("cleans markup and shortens teasers on a word boundary", () => {
    expect(cleanText("<b>Hi</b> &#8217; there &#x2014; ok")).toBe("Hi ’ there — ok");
    const t = truncate("one two three four five six seven", 15);
    expect(t.endsWith("…")).toBe(true);
    expect(t.length).toBeLessThanOrEqual(16);
    expect(truncate("short", 15)).toBe("short");
  });
});

describe("daily selection", () => {
  const now = new Date("2026-11-24T15:00:00Z");
  const mk = (id: string, title: string, hoursAgo: number, category: NewsItem["category"] = "markets"): NewsItem => ({
    id,
    title,
    teaser: "",
    url: `https://example.test/${id}`,
    publishedAt: new Date(now.getTime() - hoursAgo * 3_600_000).toISOString(),
    source: "Test",
    category,
  });

  it("keeps recent news, newest first, without duplicate headlines", () => {
    const items = [mk("a", "Oil jumps", 2), mk("b", "Oil Jumps!", 1), mk("c", "Old news", 100), mk("d", "Gold dips", 5), mk("e", "Yen slides", 3), mk("f", "Dow up", 4)];
    const out = selectNews(items, now);
    expect(out.map((i) => i.id)).toEqual(["b", "e", "f", "d"]);
  });

  it("still shows the latest few when a category is quiet, and ignores future-dated items", () => {
    const items = [mk("x", "Fed statement", 200, "central-banks"), mk("y", "ECB speech", 400, "central-banks"), mk("z", "Future", -5, "central-banks")];
    expect(selectNews(items, now).map((i) => i.id)).toEqual(["x", "y"]);
  });
});

describe("news day (Madrid time)", () => {
  it("starts at 00:00 yesterday in Madrid, in winter and in summer", () => {
    // 9:00 in Madrid in November is 08:00 UTC; yesterday's midnight is 23:00 UTC two days back.
    expect(startOfYesterday(new Date("2026-11-24T08:00:00Z")).toISOString()).toBe("2026-11-22T23:00:00.000Z");
    // In July Madrid is UTC+2.
    expect(startOfYesterday(new Date("2026-07-15T07:00:00Z")).toISOString()).toBe("2026-07-13T22:00:00.000Z");
    // Just after midnight UTC it is already the next day in Madrid.
    expect(startOfYesterday(new Date("2026-11-24T23:30:00Z")).toISOString()).toBe("2026-11-23T23:00:00.000Z");
  });

  it("handles the clock change (last Sunday of March)", () => {
    // Monday 30 March 2026, 9:00 Madrid (UTC+2) → Sunday 29 March 00:00 was still UTC+1.
    expect(startOfYesterday(new Date("2026-03-30T07:00:00Z")).toISOString()).toBe("2026-03-28T23:00:00.000Z");
  });

  it("includes yesterday's headlines but not the day before", () => {
    const now = new Date("2026-11-24T08:00:00Z");
    const at = (iso: string, id: string): NewsItem => ({ id, title: id, teaser: "", url: `https://example.test/${id}`, publishedAt: iso, source: "T", category: "markets" });
    const items = ["2026-11-24T07:00:00Z", "2026-11-23T18:00:00Z", "2026-11-23T12:00:00Z", "2026-11-22T23:30:00Z", "2026-11-22T22:30:00Z", "2026-11-21T10:00:00Z"].map((d, i) => at(d, `n${i}`));
    // n3 is 00:30 yesterday in Madrid (in); n4 is 23:30 the day before (out).
    expect(selectNews(items, now).map((i) => i.id)).toEqual(["n0", "n1", "n2", "n3"]);
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
