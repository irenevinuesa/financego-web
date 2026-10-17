import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleCheck, MessagesSquare, Target } from "lucide-react";
import { CAREER_GUIDES, CAREER_NOTE, getCareer } from "@/content/careers/guides";
import { ALL_COURSES } from "@/content/courses";
import { TOPICS } from "@/content/taxonomy";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/learn/CourseCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/primitives";

export const dynamicParams = false;

export function generateStaticParams() {
  return CAREER_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getCareer(slug);
  return { title: g ? `${g.title} career guide` : "Career guide", description: g?.tagline };
}

export default async function CareerGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getCareer(slug);
  if (!g) notFound();
  const courses = g.courses.map((id) => ALL_COURSES.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  courses.sort((a, b) => (a.status === b.status ? 0 : a.status === "available" ? -1 : 1));

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
            <ButtonLink href={`/interview/?track=${g.track}`}>
              <MessagesSquare className="h-4 w-4" /> Practise a {g.title} interview
            </ButtonLink>
            <ButtonLink href={`/practice/session/?mode=interview&track=${g.track}`} variant="secondary">
              <Target className="h-4 w-4" /> Practice set
            </ButtonLink>
          </>
        }
      />

      <div className="container-page mt-12 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-12">
          <section>
            <h2 className="font-serif text-2xl">What professionals do</h2>
            <p className="mt-3 text-[1.05rem] leading-relaxed text-ink">{g.whatTheyDo}</p>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-semibold text-navy">Typical responsibilities</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink">
                {g.responsibilities.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-navy">Technical skills you need</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink">
                {g.skills.map((s) => (
                  <li key={s} className="flex gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <section>
            <h2 className="font-serif text-2xl">Recruitment process overview</h2>
            <ol className="mt-5 space-y-3">
              {g.process.map((p, i) => (
                <li key={p.step} className="flex gap-4 rounded-2xl border border-line bg-white p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">{i + 1}</span>
                  <span>
                    <span className="block font-semibold text-navy">{p.step}</span>
                    <span className="mt-0.5 block text-sm text-ink-muted">{p.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-ink-muted">{CAREER_NOTE}</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl">Common interview topics</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {g.interviewTopics.map((t) => (
                <span key={t} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink">
                  {t}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl">Recommended courses</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl">Suggested preparation roadmap</h2>
            <ol className="relative mt-6 space-y-6 border-l-2 border-ice pl-6">
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
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <p className="font-semibold text-navy">Recommended practice</p>
            <ul className="mt-3 space-y-2 text-sm">
              {g.practiceTopics.map((t) => (
                <li key={t}>
                  <Link href={`/practice/session/?mode=topic&topic=${t}`} className="flex items-center justify-between gap-2 text-electric hover:underline">
                    {TOPICS[t].label} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5 text-sm">
            <p className="font-semibold text-navy">Track your applications</p>
            <p className="mt-1 text-ink-muted">Keep every {g.title.toLowerCase()} application, stage and interview date in one place.</p>
            <ButtonLink href="/tracker/applications/" variant="secondary" size="sm" className="mt-3">
              Open the Application Tracker
            </ButtonLink>
          </Card>
          <Card className="p-5 text-sm">
            <p className="font-semibold text-navy">Other guides</p>
            <ul className="mt-2 space-y-1.5">
              {CAREER_GUIDES.filter((o) => o.slug !== g.slug)
                .slice(0, 5)
                .map((o) => (
                  <li key={o.slug}>
                    <Link href={`/career/${o.slug}/`} className="text-electric hover:underline">
                      {o.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
