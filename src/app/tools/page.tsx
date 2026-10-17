import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, ChartLine, Coins, Landmark, Percent, Scale } from "lucide-react";
import { TOOL_CATEGORIES, TOOLS } from "@/content/tools";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Tools",
  description: "Working financial calculators: WACC, DCF, compound interest and bond pricing, with charts, interpretation and CSV export.",
};

const ICONS: Record<string, typeof Calculator> = {
  wacc: Percent,
  dcf: ChartLine,
  "compound-interest": Coins,
  "bond-pricing": Landmark,
};

export default function ToolsPage() {
  const available = TOOLS.filter((t) => t.status === "available");
  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Financial tools that actually calculate"
        description={
          <p>
            Every tool runs real formulas on your inputs, with tested calculations, charts, interpretation, stated assumptions and CSV export. Nothing here is a screenshot or uses
            invented market data.
          </p>
        }
        crumbs={[{ href: "/", label: "Home" }, { label: "Tools" }]}
        scene="london"
      />

      <section className="container-page pt-12">
        <SectionHeading eyebrow="Available now" title={`${available.length} working tools`} />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {available.map((t) => {
            const Icon = ICONS[t.slug] ?? Calculator;
            return (
              <Link key={t.slug} href={`/tools/${t.slug}/`} className="group flex gap-5 rounded-2xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-electric/50 hover:shadow-lift">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="flex-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-electric">{t.category}</span>
                  <span className="mt-1 block text-lg font-semibold text-navy group-hover:text-electric">{t.title}</span>
                  <span className="mt-1 block text-sm text-ink-muted">{t.summary}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-electric">
                    Open tool <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page pt-16">
        <SectionHeading eyebrow="Roadmap" title="Planned tools" description="These tools are designed but not built yet. They are listed so you know what is coming; none of them is clickable." />
        <div className="mt-8 space-y-8">
          {TOOL_CATEGORIES.map((cat) => {
            const list = TOOLS.filter((t) => t.category === cat && t.status === "planned");
            if (!list.length) return null;
            return (
              <div key={cat}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">{cat}</h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((t) => (
                    <li key={t.slug} className="rounded-2xl border border-dashed border-line-strong bg-white/50 p-5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-navy">{t.title}</p>
                        <Badge tone="outline">{t.planned ? `Planned · ${t.planned}` : "Planned"}</Badge>
                      </div>
                      <p className="mt-1.5 text-sm text-ink-muted">{t.summary}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-8 flex items-center gap-2 text-sm text-ink-muted">
          <Scale className="h-4 w-4" /> All tools are educational. Outputs depend entirely on your assumptions and are not investment advice.
        </p>
      </section>
    </>
  );
}
