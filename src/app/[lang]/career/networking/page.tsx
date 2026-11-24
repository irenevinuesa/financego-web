import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { NETWORKING } from "@/content/careers/resources";
import { PageHeader } from "@/components/layout/PageHeader";
import { CopyButton } from "@/components/career/CareerClient";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Networking", description: "Cold email and LinkedIn templates, informational interview questions and follow-ups." };

export default function NetworkingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Career · Resources"
        title="Networking that people reply to"
        description={<p>Short, specific and respectful of people's time. Personalise every bracket; never send a template unchanged.</p>}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/career/", label: "Career" },
          { label: "Networking" },
        ]}
      />
      <div className="container-page mt-10 grid max-w-6xl gap-10 lg:grid-cols-[1.5fr_1fr]">
        <section className="space-y-5">
          <h2 className="font-serif text-2xl">Templates</h2>
          {NETWORKING.templates.map((t) => (
            <Card key={t.title} className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-navy">{t.title}</h3>
                <CopyButton text={t.body} />
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-cream px-4 py-3 font-sans text-sm leading-relaxed text-ink">{t.body}</pre>
            </Card>
          ))}
        </section>
        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="font-semibold text-navy">Principles</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              {NETWORKING.principles.map((p) => (
                <li key={p} className="flex gap-2">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {p}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold text-navy">Questions for an informational interview</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink">
              {NETWORKING.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
