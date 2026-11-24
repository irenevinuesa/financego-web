import type { Metadata } from "next";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { CV_GUIDE } from "@/content/careers/resources";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "CV & cover letter", description: "How to structure a finance CV and cover letter, with bullet examples and common mistakes." };

export default function CvPage() {
  return (
    <>
      <PageHeader
        eyebrow="Career · Resources"
        title="CV and cover letter"
        description={<p>A finance CV is a one-page evidence file: every line should show what you did and what changed because of it.</p>}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/career/", label: "Career" },
          { label: "CV & cover letter" },
        ]}
      />
      <div className="container-page mt-10 max-w-4xl space-y-10">
        <section>
          <h2 className="font-serif text-2xl">CV structure</h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            {CV_GUIDE.structure.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-line bg-white p-4">
                <p className="font-semibold text-navy">
                  {i + 1}. {s.title}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="font-serif text-2xl">Writing strong bullets</h2>
          <p className="mt-2 rounded-xl bg-ice-soft/60 px-4 py-3 font-medium text-navy">{CV_GUIDE.bulletFormula}</p>
          <div className="mt-5 space-y-3">
            {CV_GUIDE.bullets.map((b) => (
              <Card key={b.weak} className="grid gap-3 p-4 md:grid-cols-2">
                <p className="flex gap-2 text-sm text-ink-muted">
                  <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-error" /> {b.weak}
                </p>
                <p className="flex gap-2 text-sm text-ink">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {b.strong}
                </p>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-muted">{CV_GUIDE.bulletNote}</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl">Common mistakes</h2>
          <ul className="mt-4 space-y-2">
            {CV_GUIDE.mistakes.map((m) => (
              <li key={m} className="flex gap-2 text-sm text-ink">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-ink" /> {m}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl">Cover letter framework</h2>
          <ol className="mt-5 space-y-3">
            {CV_GUIDE.coverLetter.map((c, i) => (
              <li key={c.title} className="flex gap-4 rounded-2xl border border-line bg-white p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">{i + 1}</span>
                <span>
                  <span className="block font-semibold text-navy">{c.title}</span>
                  <span className="mt-0.5 block text-sm text-ink-muted">{c.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
