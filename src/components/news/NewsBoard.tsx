"use client";

import Link from "@/components/i18n/Link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, GraduationCap, Search } from "lucide-react";
import { conceptFor, NEWS_CATEGORIES, NEWS_CATEGORY_IDS, type NewsCategory, type NewsItem } from "@/lib/news";
import { normalize } from "@/lib/text";
import { cn } from "@/lib/cn";
import { Card, Chip, EmptyState } from "@/components/ui/primitives";
import { useLang } from "@/components/i18n/LangProvider";
import { LOCALES, type Lang } from "@/lib/i18n";

const TEXT = {
  en: {
    all: "All",
    search: "Search headlines",
    emptyTitle: "No headlines match",
    emptyBody: "Try another category or search term.",
    learn: "Learn the concept",
    readOn: (source: string) => `Read on ${source}`,
    opens: "(opens the original article)",
    justNow: "just now",
    minsAgo: (n: number) => `${n} min ago`,
    hoursAgo: (n: number) => `${n} h ago`,
  },
  es: {
    all: "Todo",
    search: "Buscar titulares",
    emptyTitle: "Ningún titular coincide",
    emptyBody: "Prueba con otra categoría u otro término de búsqueda.",
    learn: "Aprende el concepto",
    readOn: (source: string) => `Leer en ${source}`,
    opens: "(abre el artículo original)",
    justNow: "ahora mismo",
    minsAgo: (n: number) => `hace ${n} min`,
    hoursAgo: (n: number) => `hace ${n} h`,
  },
} satisfies Record<Lang, unknown>;

/** Relative times depend on the viewer's clock, so they appear after mount to keep the first render stable. */
function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

function when(iso: string, now: number | null, lang: Lang) {
  const tx = TEXT[lang];
  const t = new Date(iso);
  if (now === null) return t.toISOString().slice(11, 16) + " UTC";
  const mins = Math.round((now - t.getTime()) / 60_000);
  if (mins < 1) return tx.justNow;
  if (mins < 60) return tx.minsAgo(mins);
  const hours = Math.round(mins / 60);
  if (hours < 24) return tx.hoursAgo(hours);
  return t.toLocaleDateString(LOCALES[lang], { day: "numeric", month: "short" });
}

export function NewsBoard({ items }: { items: NewsItem[] }) {
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const [query, setQuery] = useState("");
  const now = useNow();
  const lang = useLang();
  const tx = TEXT[lang];

  const counts = useMemo(() => {
    const c = new Map<NewsCategory, number>();
    for (const i of items) c.set(i.category, (c.get(i.category) ?? 0) + 1);
    return c;
  }, [items]);

  const q = normalize(query.trim());
  const list = items.filter((i) => (category === "all" || i.category === category) && (!q || normalize(`${i.title} ${i.teaser} ${i.source}`).includes(q)));
  const [lead, ...rest] = list;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            {tx.all} · {items.length}
          </Chip>
          {NEWS_CATEGORY_IDS.filter((c) => counts.get(c)).map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {NEWS_CATEGORIES[c][lang]} · {counts.get(c)}
            </Chip>
          ))}
        </div>
        <label className="relative">
          <span className="sr-only">{tx.search}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tx.search}
            className="h-10 w-60 rounded-full border border-line-strong bg-white pl-9 pr-4 text-sm text-navy outline-none focus:border-electric"
          />
        </label>
      </div>

      {!lead ? (
        <EmptyState title={tx.emptyTitle}>{tx.emptyBody}</EmptyState>
      ) : (
        <>
          <LeadStory item={lead} now={now} />
          <ul className="grid gap-4 md:grid-cols-2">
            {rest.map((i) => (
              <li key={i.id}>
                <StoryCard item={i} now={now} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Meta({ item, now, light }: { item: NewsItem; now: number | null; light?: boolean }) {
  const lang = useLang();
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs", light ? "text-ice-soft/85" : "text-ink-muted")}>
      <span className={cn("font-semibold uppercase tracking-wider", light ? "text-ice" : "text-electric")}>{item.source}</span>
      <span aria-hidden>·</span>
      <span>{NEWS_CATEGORIES[item.category][lang]}</span>
      <span aria-hidden>·</span>
      <time dateTime={item.publishedAt} suppressHydrationWarning>
        {when(item.publishedAt, now, lang)}
      </time>
    </p>
  );
}

function ConceptLink({ item, light }: { item: NewsItem; light?: boolean }) {
  const lang = useLang();
  const concept = conceptFor(item);
  if (!concept) return null;
  return (
    <Link
      href={concept.href}
      className={cn("inline-flex items-center gap-1.5 text-xs font-semibold hover:underline", light ? "text-ice" : "text-navy")}
    >
      <GraduationCap className="h-3.5 w-3.5" /> {TEXT[lang].learn}: {concept.label[lang]} <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

function LeadStory({ item, now }: { item: NewsItem; now: number | null }) {
  const lang = useLang();
  return (
    <article className="rounded-3xl bg-navy p-6 text-white shadow-lift sm:p-8">
      <Meta item={item} now={now} light />
      <h2 className="mt-3 max-w-3xl font-serif text-3xl leading-tight text-white sm:text-4xl">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {item.title}
        </a>
      </h2>
      {item.teaser && <p className="mt-3 max-w-2xl text-ice-soft/90">{item.teaser}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-white hover:underline">
          {TEXT[lang].readOn(item.source)} <ArrowUpRight className="h-4 w-4" />
        </a>
        <ConceptLink item={item} light />
      </div>
    </article>
  );
}

function StoryCard({ item, now }: { item: NewsItem; now: number | null }) {
  const lang = useLang();
  return (
    <Card className="flex h-full flex-col p-5">
      <Meta item={item} now={now} />
      <h3 className="mt-2 text-[1.05rem] font-semibold leading-snug text-navy">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {item.title}
          <ArrowUpRight className="ml-1 inline h-3.5 w-3.5 text-ink-muted" aria-label={TEXT[lang].opens} />
        </a>
      </h3>
      {item.teaser && <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.teaser}</p>}
      <div className="mt-auto pt-3">
        <ConceptLink item={item} />
      </div>
    </Card>
  );
}
