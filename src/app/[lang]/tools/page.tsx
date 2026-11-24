import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { ArrowRight, Calculator, ChartLine, Coins, Landmark, Percent, Scale } from "lucide-react";
import { TOOL_CATEGORIES, TOOL_CATEGORY_LABELS, TOOLS } from "@/content/tools";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, SectionHeading } from "@/components/ui/primitives";
import { getLang } from "@/lib/server-lang";

const TEXT = {
  en: {
    metaDescription: "Working financial calculators: WACC, DCF, compound interest and bond pricing, with charts, interpretation and CSV export.",
    title: "Financial tools that actually calculate",
    description:
      "Every tool runs real formulas on your inputs, with tested calculations, charts, interpretation, stated assumptions and CSV export. Nothing here is a screenshot or uses invented market data.",
    home: "Home",
    availableNow: "Available now",
    workingTools: (n: number) => `${n} working tools`,
    openTool: "Open tool",
    roadmap: "Roadmap",
    plannedTools: "Planned tools",
    plannedDescription: "These tools are designed but not built yet. They are listed so you know what is coming; none of them is clickable.",
    planned: "Planned",
    disclaimer: "All tools are educational. Outputs depend entirely on your assumptions and are not investment advice.",
  },
  es: {
    metaDescription: "Calculadoras financieras que funcionan de verdad: WACC, DCF, interés compuesto y precio de bonos, con gráficos, interpretación y exportación a CSV.",
    title: "Herramientas financieras que calculan de verdad",
    description:
      "Cada herramienta aplica fórmulas reales a tus datos, con cálculos testeados, gráficos, interpretación, supuestos explícitos y exportación a CSV. Nada aquí es una captura ni usa datos de mercado inventados.",
    home: "Inicio",
    availableNow: "Disponibles ya",
    workingTools: (n: number) => `${n} herramientas operativas`,
    openTool: "Abrir herramienta",
    roadmap: "Roadmap",
    plannedTools: "Herramientas previstas",
    plannedDescription: "Estas herramientas están diseñadas pero aún no construidas. Las mostramos para que sepas qué viene; ninguna es clicable.",
    planned: "Prevista",
    disclaimer: "Todas las herramientas son educativas. Los resultados dependen por completo de tus supuestos y no constituyen asesoramiento de inversión.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: "Tools", description: TEXT[lang].metaDescription };
}

const ICONS: Record<string, typeof Calculator> = {
  wacc: Percent,
  dcf: ChartLine,
  "compound-interest": Coins,
  "bond-pricing": Landmark,
};

export default async function ToolsPage() {
  const lang = await getLang();
  const tx = TEXT[lang];
  const available = TOOLS.filter((t) => t.status === "available");
  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title={tx.title}
        description={<p>{tx.description}</p>}
        crumbs={[{ href: "/", label: tx.home }, { label: "Tools" }]}
        scene="london"
      />

      <section className="container-page pt-12">
        <SectionHeading eyebrow={tx.availableNow} title={tx.workingTools(available.length)} />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {available.map((t) => {
            const Icon = ICONS[t.slug] ?? Calculator;
            return (
              <Link key={t.slug} href={`/tools/${t.slug}/`} className="group flex gap-5 rounded-2xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-electric/50 hover:shadow-lift">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="flex-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-electric">{TOOL_CATEGORY_LABELS[t.category][lang]}</span>
                  <span className="mt-1 block text-lg font-semibold text-navy group-hover:text-electric">{t.title[lang]}</span>
                  <span className="mt-1 block text-sm text-ink-muted">{t.summary[lang]}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-electric">
                    {tx.openTool} <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page pt-16">
        <SectionHeading eyebrow={tx.roadmap} title={tx.plannedTools} description={tx.plannedDescription} />
        <div className="mt-8 space-y-8">
          {TOOL_CATEGORIES.map((cat) => {
            const list = TOOLS.filter((t) => t.category === cat && t.status === "planned");
            if (!list.length) return null;
            return (
              <div key={cat}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">{TOOL_CATEGORY_LABELS[cat][lang]}</h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((t) => (
                    <li key={t.slug} className="rounded-2xl border border-dashed border-line-strong bg-white/50 p-5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-navy">{t.title[lang]}</p>
                        <Badge tone="outline">{t.planned ? `${tx.planned} · ${t.planned}` : tx.planned}</Badge>
                      </div>
                      <p className="mt-1.5 text-sm text-ink-muted">{t.summary[lang]}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-8 flex items-center gap-2 text-sm text-ink-muted">
          <Scale className="h-4 w-4" /> {tx.disclaimer}
        </p>
      </section>
    </>
  );
}
