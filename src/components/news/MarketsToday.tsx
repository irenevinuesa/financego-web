import Link from "@/components/i18n/Link";
import { ArrowRight, ArrowUpRight, GraduationCap } from "lucide-react";
import { conceptFor, NEWS_CATEGORIES, NEWS_TIME_ZONE, type NewsItem } from "@/lib/news";
import { cn } from "@/lib/cn";
import { SectionHeading } from "@/components/ui/primitives";
import { LOCALES, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/server-lang";

const TEXT = {
  en: {
    eyebrow: "Markets news",
    title: "What is moving the markets",
    description: "A selection of market headlines. Each one links to the FinanceGo concept behind it.",
    all: "All headlines",
    opens: "(opens the original article)",
  },
  es: {
    eyebrow: "Noticias de mercados",
    title: "Qué está moviendo los mercados",
    description: "Una selección de titulares de mercados. Cada uno enlaza con el concepto de FinanceGo que hay detrás.",
    all: "Todos los titulares",
    opens: "(abre el artículo original)",
  },
} satisfies Record<Lang, Record<string, string>>;

const time = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleString(LOCALES[lang], { weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: NEWS_TIME_ZONE });

/** Home page band: the latest headlines, one from each of the busiest categories. */
export async function MarketsToday({ items }: { items: NewsItem[] }) {
  const lang = await getLang();
  const tx = TEXT[lang];
  const picks: NewsItem[] = [];
  for (const i of items) {
    if (picks.length === 4) break;
    if (!picks.some((p) => p.category === i.category)) picks.push(i);
  }
  if (picks.length < 2) return null;

  return (
    <section className="container-page pt-20 sm:pt-28">
      <SectionHeading
        eyebrow={tx.eyebrow}
        title={tx.title}
        description={tx.description}
        action={
          <Link href="/news/" className="inline-flex items-center gap-1 text-sm font-semibold text-electric hover:underline">
            {tx.all} <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {picks.map((item, n) => {
          const concept = conceptFor(item);
          const lead = n === 0;
          return (
            <article key={item.id} className={cn("flex flex-col rounded-2xl p-5 shadow-card", lead ? "bg-navy text-white" : "border border-line bg-white")}>
              <p className={cn("text-xs", lead ? "text-ice-soft/85" : "text-ink-muted")}>
                <span className={cn("font-semibold uppercase tracking-wider", lead ? "text-ice" : "text-electric")}>{item.source}</span> · {NEWS_CATEGORIES[item.category][lang]} ·{" "}
                {time(item.publishedAt, lang)}
              </p>
              <h3 className={cn("mt-2 font-semibold leading-snug", lead ? "font-serif text-xl text-white" : "text-navy")}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {item.title}
                  <ArrowUpRight className={cn("ml-1 inline h-3.5 w-3.5", lead ? "text-ice" : "text-ink-muted")} aria-label={tx.opens} />
                </a>
              </h3>
              {concept && (
                <Link href={concept.href} className={cn("mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-semibold hover:underline", lead ? "text-ice" : "text-navy")}>
                  <GraduationCap className="h-3.5 w-3.5" /> {concept.label[lang]}
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
