import type { Metadata } from "next";
import { CircleCheck, Clock } from "lucide-react";
import { Cover, HandArrow } from "@/components/art/Cover";
import { LogoMark } from "@/components/layout/Logo";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Card, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "About", description: "FinanceGo's mission, principles and roadmap." };

const PRINCIPLES = [
  ["Learning by doing", "Every important concept connects to an exercise, a model, a case or an interview question."],
  ["Progressive difficulty", "Fundamentals first, then technicals, then judgement."],
  ["Immediate feedback", "You learn why an answer is right or wrong, not just whether it is."],
  ["Connected experience", "Learn, Practice, Interview, Tools, Tracker and Career reinforce one another."],
  ["Professional credibility", "Accurate, tested formulas and honest limitations."],
  ["Real functionality", "No decorative buttons, fake data or invented statistics."],
];

const V1 = [
  "Six complete courses with interactive lessons, knowledge checks and final assessments",
  "A question bank with five formats, filters and six practice modes",
  "A scripted interview simulator in English and Spanish with rule-based feedback",
  "WACC, DCF, compound interest and bond pricing tools with tested formulas",
  "A tracker for learning, skills, practice, interviews, applications and goals",
  "Ten career guides, roadmaps, templates and interactive checklists",
];

const V2 = ["User accounts and cross-device sync", "More courses and learning paths", "AI-assisted interview follow-ups and feedback", "Portfolio analytics and trading comparables", "Calendar integration"];
const V3 = ["Voice interviews and coaching", "Advanced LBO, M&A and options models", "Real company case studies with sourced data", "Verified recruiting timelines", "Personalised study plans"];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About FinanceGo"
        title="Bridging finance theory and practice"
        description={
          <p>
            FinanceGo helps university students and young analysts learn finance, apply it, and prepare for technical interviews in investment banking, private equity, markets,
            asset management and consulting.
          </p>
        }
        crumbs={[{ href: "/", label: "Home" }, { label: "About" }]}
      />

      <section className="container-page mt-12 grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <SectionHeading eyebrow="Our view" title="Finance is a skill, not a glossary" />
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink">
            Most finance content explains definitions. Interviews and jobs test whether you can reason: what happens to value when rates rise, why two multiples disagree, whether a
            deal creates value. FinanceGo is built around that kind of reasoning, with interactive models, immediate feedback and structured paths from fundamentals to interview
            readiness.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/learn/">Start learning</ButtonLink>
            <ButtonLink href="/help/" variant="secondary">
              Help & contact
            </ButtonLink>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md pb-12">
          <Cover name="alps" className="aspect-[4/3] rounded-[2rem] shadow-lift">
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <LogoMark className="h-20 w-20 shadow-lift ring-1 ring-white/20" />
              <p className="font-serif text-2xl text-cream">Learn Finance. Think Bigger. Go Further.</p>
            </div>
          </Cover>
          <div className="absolute bottom-0 left-6 flex items-end gap-1 text-navy">
            <HandArrow className="mb-4 h-8 w-12 -scale-x-100 rotate-[200deg] text-electric" />
            <p className="font-hand text-2xl">Small steps. Big opportunities.</p>
          </div>
        </div>
      </section>

      <section className="container-page mt-20">
        <SectionHeading eyebrow="Principles" title="How FinanceGo is built" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map(([t, d]) => (
            <Card key={t} className="p-5">
              <p className="font-semibold text-navy">{t}</p>
              <p className="mt-1 text-sm text-ink-muted">{d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page mt-20">
        <SectionHeading eyebrow="Roadmap" title="What works today, and what is planned" description="Planned items are not implemented yet. We list them so you know what to expect, never to suggest they exist." />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Card className="p-6">
            <Badge tone="success">Version 1 · available now</Badge>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {V1.map((x) => (
                <li key={x} className="flex gap-2">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {x}
                </li>
              ))}
            </ul>
          </Card>
          {[
            ["Version 2 · planned", V2],
            ["Version 3 · planned", V3],
          ].map(([label, items]) => (
            <Card key={label as string} className="border-dashed p-6">
              <Badge tone="outline">{label as string}</Badge>
              <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                {(items as string[]).map((x) => (
                  <li key={x} className="flex gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0" /> {x}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page mt-20">
        <Card className="p-6 sm:p-8">
          <h2 className="font-serif text-2xl">Content quality</h2>
          <p className="mt-3 text-ink">
            Every calculator formula is unit-tested, worked examples are checked for numerical consistency, and lessons separate assumptions from facts. FinanceGo does not invent
            market prices, company financials, recruiting deadlines or interview reports. Where a scenario is illustrative, it says so. All graphics, including the contour-line
            patterns, are original to FinanceGo.
          </p>
        </Card>
      </section>
    </>
  );
}
