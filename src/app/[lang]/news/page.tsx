import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { ArrowRight } from "lucide-react";
import { getNews, NEWS_SOURCES, NEWS_TIME_ZONE } from "@/lib/news";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewsBoard } from "@/components/news/NewsBoard";
import { Card } from "@/components/ui/primitives";
import { LOCALES, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/server-lang";

const TEXT = {
  en: {
    metaTitle: "Markets news",
    metaDescription: "A selection of market headlines from the FT, CNBC, Investing.com and central banks, each linked to the FinanceGo concept behind it.",
    eyebrow: "Markets news",
    title: "Markets in the news",
    intro:
      "A selection of market headlines from the Financial Times, CNBC, Investing.com and the Fed, ECB and Bank of England. Read them like an interviewer would ask you to: what happened, why it matters, and what it means for prices. Each story links to the FinanceGo page that explains the idea behind it.",
    home: "Home",
    news: "News",
    updated: "Headlines collected on",
    at: "at",
    madrid: "(Madrid)",
    summary: (n: number, sources: number) => `${n} headlines from ${sources} sources.`,
    drill: "Interview drill",
    drillQuestion: "\u201cTell me about something you read in the markets this week.\u201d",
    prompts: [
      "Pick one headline and explain in 60 seconds what it means for equities, bonds and the dollar.",
      "Which sector wins and which loses from today's biggest story? Why?",
      "If the central bank surprised the market, what happens to the yield curve?",
    ],
    practice: "Markets practice",
    aboutTitle: "About these headlines",
    about: (publishers: number) =>
      `Headlines and short summaries come from the public RSS feeds of ${publishers} publishers and belong to them; every story links to the original. FinanceGo does not write or check them, and nothing here is investment advice.`,
  },
  es: {
    metaTitle: "Noticias de mercados",
    metaDescription: "Una selección de titulares de mercados del FT, CNBC, Investing.com y los bancos centrales, cada uno enlazado con el concepto de FinanceGo que hay detrás.",
    eyebrow: "Noticias de mercados",
    title: "Los mercados en las noticias",
    intro:
      "Una selección de titulares de mercados del Financial Times, CNBC, Investing.com y la Fed, el BCE y el Banco de Inglaterra. Léelos como te pediría un entrevistador: qué ha pasado, por qué importa y qué supone para los precios. Cada noticia enlaza con la página de FinanceGo que explica la idea que hay detrás.",
    home: "Inicio",
    news: "Noticias",
    updated: "Titulares recopilados el",
    at: "a las",
    madrid: "(hora de Madrid)",
    summary: (n: number, sources: number) => `${n} titulares de ${sources} fuentes.`,
    drill: "Simulacro de entrevista",
    drillQuestion: "«Háblame de algo que hayas leído sobre los mercados esta semana».",
    prompts: [
      "Elige un titular y explica en 60 segundos qué supone para la renta variable, los bonos y el dólar.",
      "¿Qué sector gana y cuál pierde con la gran noticia del día? ¿Por qué?",
      "Si el banco central ha sorprendido al mercado, ¿qué le pasa a la curva de tipos?",
    ],
    practice: "Practica mercados",
    aboutTitle: "Sobre estos titulares",
    about: (publishers: number) =>
      `Los titulares y los breves resúmenes proceden de los feeds RSS públicos de ${publishers} medios y les pertenecen; cada noticia enlaza con el original. FinanceGo no los redacta ni los verifica, y nada de lo que aparece aquí es asesoramiento de inversión.`,
  },
} satisfies Record<Lang, unknown>;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: TEXT[lang].metaTitle, description: TEXT[lang].metaDescription };
}

export default async function NewsPage() {
  const lang = await getLang();
  const tx = TEXT[lang];
  const { items, collectedAt } = getNews();
  const sources = new Set(items.map((i) => i.source)).size;
  const date = new Date(collectedAt);

  return (
    <>
      <PageHeader
        eyebrow={tx.eyebrow}
        title={tx.title}
        description={<p>{tx.intro}</p>}
        crumbs={[{ href: "/", label: tx.home }, { label: tx.news }]}
        scene="london"
      />
      <div className="container-page mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <p className="mb-5 text-sm text-ink-muted">
            {tx.updated}{" "}
            <time dateTime={collectedAt}>
              {date.toLocaleDateString(LOCALES[lang], { weekday: "long", day: "numeric", month: "long", timeZone: NEWS_TIME_ZONE })} {tx.at}{" "}
              {date.toLocaleTimeString(LOCALES[lang], { hour: "2-digit", minute: "2-digit", timeZone: NEWS_TIME_ZONE })} {tx.madrid}
            </time>{" "}
            · {tx.summary(items.length, sources)}
          </p>
          <NewsBoard items={items} />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
          <Card className="p-5">
            <p className="eyebrow">{tx.drill}</p>
            <p className="mt-2 font-semibold text-navy">{tx.drillQuestion}</p>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              {tx.prompts.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-electric" /> {p}
                </li>
              ))}
            </ul>
            <Link href="/practice/markets/" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-electric hover:underline">
              {tx.practice} <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
          <Card className="p-5 text-xs leading-relaxed text-ink-muted">
            <p className="font-semibold text-navy">{tx.aboutTitle}</p>
            <p className="mt-1.5">{tx.about(new Set(NEWS_SOURCES.map((s) => s.name)).size)}</p>
          </Card>
        </aside>
      </div>
    </>
  );
}
