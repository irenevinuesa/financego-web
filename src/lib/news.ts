/**
 * Market news from public RSS feeds. Headlines are fetched when the site is built
 * (and on every request in development). In production a scheduled job rebuilds the
 * site every morning at 9:00 Madrid time (.github/workflows/daily-news.yml).
 * We only show the headline, a short teaser, the source and a link to the original.
 */

import type { Lang } from "./i18n";

export const NEWS_CATEGORIES = {
  markets: { en: "Markets", es: "Mercados" },
  economy: { en: "Economy", es: "Economía" },
  "central-banks": { en: "Central banks", es: "Bancos centrales" },
  "fx-commodities": { en: "FX & commodities", es: "FX y materias primas" },
  companies: { en: "Companies & earnings", es: "Empresas y earnings" },
} as const satisfies Record<string, Record<Lang, string>>;

export type NewsCategory = keyof typeof NEWS_CATEGORIES;
export const NEWS_CATEGORY_IDS = Object.keys(NEWS_CATEGORIES) as NewsCategory[];

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  category: NewsCategory;
  /** Feeds that publish dates without a time zone; read as UTC. */
  naiveDatesUtc?: boolean;
}

export const NEWS_SOURCES: NewsSource[] = [
  { id: "ft-markets", name: "Financial Times", url: "https://www.ft.com/markets?format=rss", category: "markets" },
  { id: "cnbc-investing", name: "CNBC", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069", category: "markets" },
  { id: "inv-stocks", name: "Investing.com", url: "https://www.investing.com/rss/news_25.rss", category: "markets", naiveDatesUtc: true },
  { id: "cnbc-economy", name: "CNBC", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258", category: "economy" },
  { id: "ft-economy", name: "Financial Times", url: "https://www.ft.com/global-economy?format=rss", category: "economy" },
  { id: "inv-economy", name: "Investing.com", url: "https://www.investing.com/rss/news_14.rss", category: "economy", naiveDatesUtc: true },
  { id: "inv-indicators", name: "Investing.com", url: "https://www.investing.com/rss/news_95.rss", category: "economy", naiveDatesUtc: true },
  { id: "fed", name: "Federal Reserve", url: "https://www.federalreserve.gov/feeds/press_all.xml", category: "central-banks" },
  { id: "ecb", name: "European Central Bank", url: "https://www.ecb.europa.eu/rss/press.html", category: "central-banks" },
  { id: "boe", name: "Bank of England", url: "https://www.bankofengland.co.uk/rss/news", category: "central-banks" },
  { id: "inv-forex", name: "Investing.com", url: "https://www.investing.com/rss/news_1.rss", category: "fx-commodities", naiveDatesUtc: true },
  { id: "inv-commodities", name: "Investing.com", url: "https://www.investing.com/rss/news_11.rss", category: "fx-commodities", naiveDatesUtc: true },
  { id: "cnbc-earnings", name: "CNBC", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839135", category: "companies" },
  { id: "cnbc-finance", name: "CNBC", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664", category: "companies" },
  { id: "ft-companies", name: "Financial Times", url: "https://www.ft.com/companies?format=rss", category: "companies" },
];

export interface NewsItem {
  id: string;
  title: string;
  teaser: string;
  url: string;
  /** ISO timestamp. */
  publishedAt: string;
  source: string;
  category: NewsCategory;
}

/* ───────────── Parsing ───────────── */

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Text content of a tag: unwraps CDATA, strips markup, decodes entities and collapses whitespace. */
export function cleanText(raw: string): string {
  const unwrapped = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  // Decode first so escaped markup (&lt;p&gt;) is stripped too, then decode what is left.
  return decodeEntities(decodeEntities(unwrapped).replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1] : "";
}

export function parseFeedDate(raw: string, naiveUtc = false): Date | null {
  const s = cleanText(raw);
  if (!s) return null;
  // "2026-11-24 13:42:37" has no zone: treat it as UTC when the feed says so.
  const naive = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(s);
  const d = new Date(naive ? `${s.replace(" ", "T")}${naiveUtc ? "Z" : ""}` : s.replace(/ Z$/, " GMT"));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > max * 0.6 ? space : max).replace(/[,;:.\s]+$/, "")}…`;
}

const TEASER_MAX = 160;

/** Reads the items of an RSS 2.0 feed. Items without a title, a web link or a date are skipped. */
export function parseRss(xml: string, source: NewsSource): NewsItem[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  const out: NewsItem[] = [];
  for (const block of items) {
    const title = cleanText(tag(block, "title"));
    const url = cleanText(tag(block, "link")).replace(/^(https?:\/\/[^/]+)\/\//, "$1/");
    const date = parseFeedDate(tag(block, "pubDate") || tag(block, "dc:date"), source.naiveDatesUtc);
    if (!title || !/^https?:\/\//.test(url) || !date) continue;
    const teaser = truncate(cleanText(tag(block, "description")), TEASER_MAX);
    out.push({
      id: `${source.id}:${url}`,
      title,
      teaser: teaser === title ? "" : teaser,
      url,
      publishedAt: date.toISOString(),
      source: source.name,
      category: source.category,
    });
  }
  return out;
}

/* ───────────── Selection ───────────── */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** The news day follows Madrid time: the page is rebuilt every morning at 9:00 there. */
export const NEWS_TIME_ZONE = "Europe/Madrid";

/** Milliseconds by which `tz` is ahead of UTC at the instant `ts`. */
function zoneOffset(ts: number, tz: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(new Date(ts))
      .map((x) => [x.type, Number(x.value)]),
  );
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ts / 1000) * 1000;
}

/** 00:00 of the previous calendar day in `tz`, as a UTC instant. */
export function startOfYesterday(now: Date, tz = NEWS_TIME_ZONE): Date {
  const local = new Date(now.getTime() + zoneOffset(now.getTime(), tz));
  const guess = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - 1);
  // Correct by the offset at that midnight (it differs from today's around clock changes).
  return new Date(guess - zoneOffset(guess - zoneOffset(guess, tz), tz));
}

/** Central banks publish less often, so they look back further than "since yesterday". */
const CENTRAL_BANK_DAYS = 10;
const PER_CATEGORY = 16;
const MIN_PER_CATEGORY = 4;

const normTitle = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * The day's selection: everything since 00:00 yesterday (Madrid time), newest first,
 * duplicates removed and a balanced number per category. A category with too little
 * recent news still shows its latest few.
 */
export function selectNews(items: NewsItem[], now: Date): NewsItem[] {
  const seen = new Set<string>();
  const unique = [...items]
    .filter((i) => new Date(i.publishedAt).getTime() <= now.getTime() + HOUR)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .filter((i) => {
      const key = normTitle(i.title);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const since = startOfYesterday(now).getTime();
  return NEWS_CATEGORY_IDS.flatMap((c) => {
    const inCat = unique.filter((i) => i.category === c);
    const from = c === "central-banks" ? now.getTime() - CENTRAL_BANK_DAYS * DAY : since;
    const recent = inCat.filter((i) => new Date(i.publishedAt).getTime() >= from);
    return (recent.length >= MIN_PER_CATEGORY ? recent : inCat.slice(0, MIN_PER_CATEGORY)).slice(0, PER_CATEGORY);
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/* ───────────── Learning links ───────────── */

export interface NewsConcept {
  label: Record<Lang, string>;
  href: string;
}

/** Keyword rules that point a headline at the FinanceGo page explaining the idea behind it. First match wins. */
const CONCEPTS: { pattern: RegExp; concept: NewsConcept }[] = [
  { pattern: /\b(merger|acquisition|acquire[sd]?|takeover|buyout|bid for|deal to buy)\b/i, concept: { label: { en: "M&A Fundamentals", es: "M&A Fundamentals" }, href: "/learn/ma-fundamentals/" } },
  { pattern: /\b(private equity|lbo|leveraged)\b/i, concept: { label: { en: "Paper LBO tool", es: "Herramienta Paper LBO" }, href: "/tools/paper-lbo/" } },
  { pattern: /\b(bond|yield|treasur(y|ies)|gilt|bund|duration|credit spread)s?\b/i, concept: { label: { en: "Fixed Income", es: "Fixed Income" }, href: "/learn/fixed-income-course/" } },
  { pattern: /\b(fed|federal reserve|ecb|bank of england|central bank|interest rates?|rate (cut|hike)s?|monetary policy)\b/i, concept: { label: { en: "Macro practice", es: "Practica macro" }, href: "/practice/macro/" } },
  { pattern: /\b(inflation|cpi|gdp|recession|jobs report|payrolls|unemployment|pmi)\b/i, concept: { label: { en: "Macro practice", es: "Practica macro" }, href: "/practice/macro/" } },
  { pattern: /\b(earnings|revenue|profit|guidance|quarterly results|eps)\b/i, concept: { label: { en: "Accounting Fundamentals", es: "Accounting Fundamentals" }, href: "/learn/accounting-fundamentals/" } },
  { pattern: /\b(valuation|multiple|price target|undervalued|overvalued)\b/i, concept: { label: { en: "Trading Comparables", es: "Trading Comparables" }, href: "/learn/trading-comps/" } },
  { pattern: /\b(ipo|listing|share sale|rights issue|debt offering)\b/i, concept: { label: { en: "Capital Markets practice", es: "Practica mercados de capitales" }, href: "/practice/capital-markets/" } },
  { pattern: /\b(dollar|euro|yen|sterling|pound|currency|forex|fx)\b/i, concept: { label: { en: "Markets practice", es: "Practica mercados" }, href: "/practice/markets/" } },
  { pattern: /\b(oil|gold|copper|commodit(y|ies)|crude|brent|opec)\b/i, concept: { label: { en: "Markets practice", es: "Practica mercados" }, href: "/practice/markets/" } },
  { pattern: /\b(option|options|volatility|vix|derivative|futures)\b/i, concept: { label: { en: "Derivatives practice", es: "Practica derivados" }, href: "/practice/derivatives/" } },
  { pattern: /\b(stocks?|shares|equit(y|ies)|s&p|nasdaq|dow|index|rally|sell-off)\b/i, concept: { label: { en: "Markets practice", es: "Practica mercados" }, href: "/practice/markets/" } },
];

export function conceptFor(item: Pick<NewsItem, "title" | "teaser">): NewsConcept | null {
  const text = `${item.title} ${item.teaser}`;
  return CONCEPTS.find((c) => c.pattern.test(text))?.concept ?? null;
}

/* ───────────── Fetching ───────────── */

export interface NewsResult {
  items: NewsItem[];
  fetchedAt: string;
  /** Names of feeds that could not be read this time. */
  failed: NewsSource[];
}

async function fetchFeed(source: NewsSource): Promise<NewsItem[]> {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FinanceGo news reader)", Accept: "application/rss+xml, application/xml, text/xml" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return parseRss(await res.text(), source);
}

/** The home page and /news/ both load the news; share one fetch for a few minutes (one build, or one dev session). */
const CACHE_MS = 10 * 60 * 1000;
let cached: { at: number; result: Promise<NewsResult> } | null = null;

export function loadNews(): Promise<NewsResult> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.result;
  const result = fetchAllNews(new Date());
  cached = { at: Date.now(), result };
  return result;
}

async function fetchAllNews(now: Date): Promise<NewsResult> {
  const results = await Promise.allSettled(NEWS_SOURCES.map(fetchFeed));
  const failed: NewsSource[] = [];
  const items: NewsItem[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") items.push(...r.value);
    else failed.push(NEWS_SOURCES[i]);
  });
  return { items: selectNews(items, now), fetchedAt: now.toISOString(), failed };
}
