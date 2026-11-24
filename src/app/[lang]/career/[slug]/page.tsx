import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "@/components/i18n/Link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, BookOpen, CalendarCheck, ChevronDown, CircleAlert, CircleCheck, Info, MessagesSquare, Mic } from "lucide-react";
import { CAREER_GUIDES, CAREER_NOTE, PAY_NOTE, getCareer, practiceTopicLabel } from "@/content/careers/guides";
import { ALL_COURSES } from "@/content/courses";
import { Cover, coverInk } from "@/components/art/Cover";
import { CareerSectionNav, type NavSection } from "@/components/career/CareerSectionNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/learn/CourseCard";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export const dynamicParams = false;

export function generateStaticParams() {
  return CAREER_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getCareer(slug);
  return { title: g ? `${g.title} career guide` : "Career guide", description: g?.tagline };
}

const technicalPrepHref = (track: string) => `/practice/session/?mode=interview&track=${track}`;
const BEHAVIOURAL_PREP_HREF = "/behaviourals/questions/";

function GuideSection({ id, title, eyebrow, intro, children }: { id: string; title: string; eyebrow?: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-12 lg:scroll-mt-4">
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2 id={`${id}-title`} className="font-serif text-2xl leading-tight sm:text-[1.75rem]">
        {title}
      </h2>
      {intro && <p className="mt-3 max-w-3xl leading-relaxed text-ink">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Note({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <p className="mt-4 flex gap-2 rounded-xl bg-ice-soft px-4 py-3 text-sm text-navy">
      <span className="mt-0.5 shrink-0">{icon ?? <Info className="h-4 w-4" />}</span>
      <span>{children}</span>
    </p>
  );
}

export default async function CareerGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getCareer(slug);
  if (!g) notFound();
  const courses = g.courses.map((id) => ALL_COURSES.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  courses.sort((a, b) => (a.status === b.status ? 0 : a.status === "available" ? -1 : 1));
  const others = CAREER_GUIDES.filter((o) => o.slug !== g.slug);
  const light = coverInk(g.scene) === "light";

  const sections: NavSection[] = [
    { id: "overview", label: "Overview" },
    { id: "day", label: "A typical day" },
    { id: "team", label: "Team & seniority" },
    { id: "groups", label: g.groups.title },
    { id: "skills", label: "Skills" },
    { id: "recruiting", label: "Recruiting" },
    { id: "pay", label: "Pay structure" },
    { id: "pros", label: "Pros & challenges" },
    { id: "exits", label: "Exit opportunities" },
    { id: "stand-out", label: "How to stand out" },
    { id: "prepare", label: "Prepare on FinanceGo" },
    { id: "glossary", label: "Glossary" },
    { id: "reading", label: "Reading" },
    { id: "faq", label: "FAQs" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Career guide"
        title={g.title}
        description={<p>{g.tagline}</p>}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/career/", label: "Career" },
          { label: g.title },
        ]}
        scene={g.scene}
        actions={
          <>
            <ButtonLink href={technicalPrepHref(g.track)}>
              <MessagesSquare className="h-4 w-4" /> Technical interview prep
            </ButtonLink>
            <ButtonLink href={BEHAVIOURAL_PREP_HREF} variant="secondary">
              <Mic className="h-4 w-4" /> Behavioural questions
            </ButtonLink>
          </>
        }
      />

      <div className="container-page mt-10 lg:mt-12 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        <CareerSectionNav sections={sections} />

        <div className="mt-8 min-w-0 space-y-14 lg:mt-0">
          <GuideSection id="overview" title="What the job is" intro={g.whatTheyDo}>
            <Card className="p-5 sm:p-6">
              <h3 className="font-semibold text-navy">Typical responsibilities</h3>
              <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm text-ink md:grid-cols-2">
                {g.responsibilities.map((r) => (
                  <li key={r} className="flex gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-electric" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
          </GuideSection>

          <GuideSection id="day" title="A typical day">
            <ol className="relative space-y-5 border-l-2 border-ice pl-6">
              {g.typicalDay.map((d) => (
                <li key={d.title} className="relative">
                  <span className="absolute -left-[1.94rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-electric ring-2 ring-ice" aria-hidden />
                  <Badge tone="blue">{d.when}</Badge>
                  <p className="mt-1.5 font-semibold text-navy">{d.title}</p>
                  <p className="mt-0.5 max-w-3xl text-sm leading-relaxed text-ink">{d.detail}</p>
                </li>
              ))}
            </ol>
            <Note>{g.dayNote}</Note>
          </GuideSection>

          <GuideSection id="team" title="Team structure and seniority" intro={g.team.intro}>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm font-medium text-navy" aria-label="Seniority ladder, junior to senior">
              {g.team.ladder.map((r, i) => (
                <span key={r.title} className="inline-flex items-center gap-1.5">
                  {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-ink-muted" aria-hidden />}
                  <span className="rounded-full bg-ice-soft px-2.5 py-0.5">{r.title.split(" / ")[0]}</span>
                </span>
              ))}
            </p>
            <ol className="mt-5 space-y-3">
              {g.team.ladder.map((r, i) => (
                <li key={r.title} className="flex gap-4 rounded-2xl border border-line bg-white p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-navy">{r.title}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted">{r.focus}</span>
                  </span>
                </li>
              ))}
            </ol>
            {g.team.note && <Note>{g.team.note}</Note>}
          </GuideSection>

          <GuideSection id="groups" title={g.groups.title} intro={g.groups.intro}>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.groups.items.map((it) => (
                <Card key={it.name} className="p-5">
                  <h3 className="font-semibold text-navy">{it.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink">{it.detail}</p>
                </Card>
              ))}
            </div>
          </GuideSection>

          <GuideSection id="skills" title="Skills employers look for">
            <div className="grid gap-4 sm:grid-cols-2">
              {g.skillsInDepth.map((s, i) => (
                <Card key={s.name} className="p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-2xl leading-none text-electric/40">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="font-semibold text-navy">{s.name}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink">{s.detail}</p>
                </Card>
              ))}
            </div>
          </GuideSection>

          <GuideSection id="recruiting" title="Recruiting timeline">
            <ol className="relative space-y-5 border-l-2 border-ice pl-6">
              {g.timeline.map((t) => (
                <li key={t.when} className="relative">
                  <span className="absolute -left-[1.94rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-navy ring-2 ring-ice" aria-hidden />
                  <p className="font-semibold text-navy">{t.when}</p>
                  <p className="mt-0.5 max-w-3xl text-sm leading-relaxed text-ink">{t.detail}</p>
                </li>
              ))}
            </ol>
            <Note icon={<CalendarCheck className="h-4 w-4" />}>
              {CAREER_NOTE} FinanceGo describes typical patterns only and does not list deadlines.
            </Note>

            <h3 className="mt-8 font-semibold text-navy">Typical stages of a process</h3>
            <ol className="mt-3 space-y-3">
              {g.process.map((p, i) => (
                <li key={p.step} className="flex gap-4 rounded-2xl border border-line bg-white p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-electric text-sm font-semibold text-white">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-navy">{p.step}</span>
                    <span className="mt-0.5 block text-sm text-ink-muted">{p.detail}</span>
                  </span>
                </li>
              ))}
            </ol>

            <h3 className="mt-8 font-semibold text-navy">Common interview topics</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {g.interviewTopics.map((t) => (
                <span key={t} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink">
                  {t}
                </span>
              ))}
            </div>
          </GuideSection>

          <GuideSection id="pay" title="How pay is structured" intro={g.pay.intro}>
            <Card className="divide-y divide-line">
              {g.pay.components.map((c) => (
                <div key={c.name} className="grid gap-1 p-4 sm:grid-cols-[11rem_1fr] sm:gap-4 sm:p-5">
                  <p className="font-semibold text-navy">{c.name}</p>
                  <p className="text-sm leading-relaxed text-ink">{c.detail}</p>
                </div>
              ))}
            </Card>
            <Note>{PAY_NOTE}</Note>
          </GuideSection>

          <GuideSection id="pros" title="Pros and challenges">
            <div className="grid gap-5 md:grid-cols-2">
              <Card className="p-5 sm:p-6">
                <h3 className="font-semibold text-navy">What people enjoy</h3>
                <ul className="mt-3 space-y-2.5 text-sm text-ink">
                  {g.pros.map((p) => (
                    <li key={p} className="flex gap-2">
                      <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-5 sm:p-6">
                <h3 className="font-semibold text-navy">What can be hard</h3>
                <ul className="mt-3 space-y-2.5 text-sm text-ink">
                  {g.challenges.map((c) => (
                    <li key={c} className="flex gap-2">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-ink" />
                      {c}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </GuideSection>

          <GuideSection id="exits" title="Exit opportunities">
            <div className="grid gap-4 sm:grid-cols-2">
              {g.exits.map((e) => (
                <div key={e.path} className="flex gap-3 rounded-2xl border border-line bg-white p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ice-soft text-electric">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-navy">{e.path}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted">{e.detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </GuideSection>

          <GuideSection id="stand-out" title="How to stand out">
            <Card className="bg-ice-soft/40 p-5 sm:p-6">
              <ol className="space-y-3">
                {g.standOut.map((s, i) => (
                  <li key={s} className="flex gap-3 text-ink">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-electric text-xs font-semibold text-white">{i + 1}</span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </GuideSection>

          <GuideSection id="prepare" title="Prepare on FinanceGo">
            <div className="overflow-hidden rounded-3xl shadow-lift">
              <Cover name={g.scene} className="w-full">
                <div className="p-6 sm:p-8">
                  <p className={cn("eyebrow", light ? "text-ice" : undefined)}>Interview preparation</p>
                  <p className={cn("mt-2 max-w-xl font-serif text-2xl leading-snug", light ? "text-white" : "text-navy")}>Practise both the technical and the behavioural side of {g.title} interviews.</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <ButtonLink href={technicalPrepHref(g.track)} variant={light ? "secondary" : "primary"}>
                      <MessagesSquare className="h-4 w-4" /> Technical interview prep
                    </ButtonLink>
                    <ButtonLink href={BEHAVIOURAL_PREP_HREF} variant={light ? "subtle" : "secondary"}>
                      <Mic className="h-4 w-4" /> Behavioural questions
                    </ButtonLink>
                  </div>
                </div>
              </Cover>
            </div>

            <h3 className="mt-8 font-semibold text-navy">Practice sections</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {g.practiceTopics.map((t) => (
                <Link
                  key={t}
                  href={`/practice/${t}/`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-navy hover:border-electric hover:text-electric"
                >
                  {practiceTopicLabel(t)} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>

            {courses.length > 0 && (
              <>
                <h3 className="mt-8 font-semibold text-navy">Recommended courses</h3>
                <div className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {courses.map((c) => (
                    <CourseCard key={c.id} course={c} />
                  ))}
                </div>
              </>
            )}

            <h3 className="mt-8 font-semibold text-navy">Suggested preparation roadmap</h3>
            <ol className="relative mt-4 space-y-6 border-l-2 border-ice pl-6">
              {g.roadmap.map((phase, i) => (
                <li key={phase.phase} className="relative">
                  <span className="absolute -left-[2.15rem] flex h-6 w-6 items-center justify-center rounded-full bg-electric text-xs font-semibold text-white">{i + 1}</span>
                  <p className="font-semibold text-navy">{phase.phase}</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink">
                    {phase.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </GuideSection>

          <GuideSection id="glossary" title="Glossary">
            <dl className="grid gap-x-8 gap-y-4 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2 sm:p-6">
              {g.glossary.map((t) => (
                <div key={t.term} className="min-w-0">
                  <dt className="font-semibold text-navy">{t.term}</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-ink">{t.definition}</dd>
                </div>
              ))}
            </dl>
          </GuideSection>

          <GuideSection id="reading" title="Recommended reading">
            <div className="grid gap-4 sm:grid-cols-2">
              {g.books.map((b) => (
                <Card key={b.title} className="flex gap-4 p-5">
                  <span className="flex h-12 w-9 shrink-0 items-center justify-center rounded-md bg-navy text-white shadow-card" aria-hidden>
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-serif text-lg leading-snug text-navy">{b.title}</span>
                    <span className="mt-0.5 block text-sm text-ink-muted">{b.author}</span>
                    <span className="mt-2 block text-sm leading-relaxed text-ink">{b.why}</span>
                  </span>
                </Card>
              ))}
            </div>
          </GuideSection>

          <GuideSection id="faq" title="Frequently asked questions">
            <div className="space-y-3">
              {g.faqs.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-line bg-white open:shadow-card">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-semibold text-navy sm:px-5 [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="px-4 pb-4 text-sm leading-relaxed text-ink sm:px-5">{f.a}</p>
                </details>
              ))}
            </div>
          </GuideSection>

          <section aria-labelledby="other-guides" className="border-t border-line pt-8">
            <h2 id="other-guides" className="font-semibold text-navy">
              Other career guides
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {others.map((o) => (
                <Link key={o.slug} href={`/career/${o.slug}/`} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink hover:border-electric hover:text-electric">
                  {o.title}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
