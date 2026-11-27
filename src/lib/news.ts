/**
 * Market news: a fixed selection of headlines from public RSS feeds, saved in
 * src/content/news-snapshot.json. It is not refreshed; the page always shows these.
 * We only show the headline, a short teaser, the source and a link to the original.
 */

import snapshot from "@/content/news-snapshot.json";
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

/** Dates on the page are shown in Madrid time. */
export const NEWS_TIME_ZONE = "Europe/Madrid";

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

/* ───────────── The saved headlines ───────────── */

export interface NewsResult {
  items: NewsItem[];
  /** When the headlines were collected (ISO timestamp). */
  collectedAt: string;
}

/** The saved selection, newest first. */
export function getNews(): NewsResult {
  const items = (snapshot.items as NewsItem[]).slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return { items, collectedAt: snapshot.fetchedAt };
}
