import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, ListChecks, Mail, Map, MessagesSquare } from "lucide-react";
import { CAREER_GUIDES } from "@/content/careers/guides";
import { Scene } from "@/components/art/Scene";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, Card, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Career",
  description: "Career guides for finance roles, recruitment preparation resources, roadmaps and checklists.",
};

const RESOURCES = [
  { href: "/career/cv/", title: "CV & cover letter", text: "Structure, finance bullet examples, common mistakes and a cover letter framework.", icon: FileText },
  { href: "/career/networking/", title: "Networking", text: "Cold emails, LinkedIn notes, informational interviews and follow-ups.", icon: Mail },
  { href: "/career/interview-scenarios/", title: "Interview scenarios", text: "Illustrative walk-throughs of common interview formats, linked to practice.", icon: MessagesSquare },
  { href: "/career/roadmaps/", title: "Career roadmaps", text: "Step-by-step paths that connect Learn, Practice, Tools and Interview.", icon: Map },
  { href: "/career/checklists/", title: "Recruitment checklists", text: "Interactive checklists from applications to offers, saved in your browser.", icon: ListChecks },
];

export default function CareerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Career"
        title="Find your path in finance"
        description={<p>Understand what each role involves, how recruiting typically works, and exactly what to study and practise for it.</p>}
        crumbs={[{ href: "/", label: "Home" }, { label: "Career" }]}
        scene="summit"
      />

      <section className="container-page pt-12">
        <SectionHeading eyebrow="Career explorer" title="Ten career guides" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CAREER_GUIDES.map((g) => (
            <Link key={g.slug} href={`/career/${g.slug}/`} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <div className="h-28 overflow-hidden">
                <Scene name={g.scene} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-navy group-hover:text-electric">{g.title}</p>
                <p className="mt-1 text-sm text-ink-muted">{g.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pt-16">
        <SectionHeading eyebrow="Preparation resources" title="Get recruiting-ready" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r) => {
            const Icon = r.icon;
            return (
              <Link key={r.href} href={r.href} className="group flex gap-4 rounded-2xl border border-line bg-white p-5 shadow-card hover:border-electric/50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ice-soft text-electric">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-navy group-hover:text-electric">{r.title}</span>
                  <span className="mt-1 block text-sm text-ink-muted">{r.text}</span>
                </span>
              </Link>
            );
          })}
          <Card className="flex gap-4 border-dashed p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-ink-muted">
              <CalendarDays className="h-5 w-5" />
            </span>
            <span>
              <span className="flex flex-wrap items-center gap-2 font-semibold text-navy">
                Recruitment calendar <Badge tone="outline">Planned · V3</Badge>
              </span>
              <span className="mt-1 block text-sm text-ink-muted">
                Verified deadlines with sources and update dates. Until then, track your own dates in the{" "}
                <Link href="/tracker/applications/" className="text-electric hover:underline">
                  Application Tracker
                </Link>
                . FinanceGo will never show invented vacancies or deadlines.
              </span>
            </span>
          </Card>
        </div>
      </section>

      <section className="container-page pt-16">
        <Card className="flex flex-wrap items-center justify-between gap-4 bg-navy p-6 text-white sm:p-8">
          <div>
            <p className="font-serif text-2xl text-white">Not sure which path fits?</p>
            <p className="mt-1 text-ice-soft/85">Start with Finance 101 and a mixed practice set, then read two or three guides side by side.</p>
          </div>
          <Link href="/learn/finance-101/" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-navy hover:bg-ice-soft">
            Start Finance 101 <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </section>
    </>
  );
}
