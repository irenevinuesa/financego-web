import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { ArrowRight, Info } from "lucide-react";
import { ILLUSTRATIVE_SCENARIOS } from "@/content/careers/resources";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, Card } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Interview scenarios", description: "Illustrative walk-throughs of common finance interview formats, linked to practice questions." };

export default function ScenariosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Career · Resources"
        title="What interviews typically look like"
        description={<p>Structured walk-throughs of common formats, each linked to practice questions you can try now.</p>}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/career/", label: "Career" },
          { label: "Interview scenarios" },
        ]}
      />
      <div className="container-page mt-8 max-w-5xl">
        <p className="flex gap-2 rounded-xl border border-ice bg-ice-soft/50 px-4 py-3 text-sm text-navy">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          These are illustrative composite scenarios written by FinanceGo to show common formats. They are not reports from real candidates, and real processes vary by firm and
          year.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {ILLUSTRATIVE_SCENARIOS.map((s) => (
            <Card key={s.id} className="flex flex-col p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="navy">{s.track}</Badge>
                <Badge tone="outline">Illustrative</Badge>
              </div>
              <h2 className="mt-3 font-serif text-2xl">{s.title}</h2>
              <p className="mt-1 text-sm text-ink-muted">{s.format}</p>
              <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink-muted">Typical flow</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink">
                {s.stages.map((st) => (
                  <li key={st}>{st}</li>
                ))}
              </ol>
              <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink-muted">Practise these</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {s.sampleQuestions.map((q) => (
                  <li key={q.q}>
                    {q.practiceId ? (
                      <Link href={`/practice/q/${q.practiceId}/`} className="inline-flex items-start gap-1 text-electric hover:underline">
                        {q.q} <ArrowRight className="mt-1 h-3 w-3 shrink-0" />
                      </Link>
                    ) : (
                      q.q
                    )}
                  </li>
                ))}
              </ul>
              <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink-muted">Tips</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
                {s.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
