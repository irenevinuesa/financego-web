import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROADMAPS } from "@/content/careers/resources";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Career roadmaps", description: "Step-by-step preparation paths that connect courses, practice, tools and interviews." };

export default function RoadmapsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Career · Resources"
        title="Career roadmaps"
        description={<p>Each roadmap is a sequence of concrete steps across Learn, Practice, Tools and the Interview Simulator.</p>}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/career/", label: "Career" },
          { label: "Roadmaps" },
        ]}
      />
      <div className="container-page mt-10 max-w-5xl space-y-8">
        <nav aria-label="Roadmaps" className="flex flex-wrap gap-2">
          {ROADMAPS.map((r) => (
            <a key={r.slug} href={`#${r.slug}`} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink hover:border-electric hover:text-electric">
              {r.title}
            </a>
          ))}
        </nav>
        {ROADMAPS.map((r) => (
          <Card key={r.slug} id={r.slug} className="scroll-mt-24 p-6 sm:p-8">
            <h2 className="font-serif text-2xl">{r.title}</h2>
            <p className="mt-1 text-ink-muted">{r.summary}</p>
            <ol className="relative mt-6 space-y-4 border-l-2 border-ice pl-6">
              {r.steps.map((s, i) => (
                <li key={s.title} className="relative">
                  <span className="absolute -left-[2.15rem] flex h-6 w-6 items-center justify-center rounded-full bg-electric text-xs font-semibold text-white">{i + 1}</span>
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3">
                    <div>
                      <p className="font-semibold text-navy">{s.title}</p>
                      <p className="text-sm text-ink-muted">{s.detail}</p>
                    </div>
                    <Link href={s.href} className="inline-flex items-center gap-1 text-sm font-medium text-electric hover:underline">
                      {s.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>
    </>
  );
}
