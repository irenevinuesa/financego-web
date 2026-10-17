import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { SITE } from "@/content/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Help & feedback", description: "Answers to common questions about FinanceGo, and how to get in touch." };

const FAQ: [string, React.ReactNode][] = [
  ["Do I need an account?", "No. The MVP works without sign-up. Your progress is saved in this browser's local storage. Accounts are planned for Version 2."],
  [
    "Will I lose my progress?",
    <>
      Possibly, if you clear your browser data, use a private window or switch device. Export a backup from{" "}
      <Link href="/settings/" className="text-electric hover:underline">
        Settings
      </Link>{" "}
      and import it in another browser to move your progress.
    </>,
  ],
  ["How are practice answers graded?", "Multiple-choice and numerical answers are graded automatically; numerical answers accept a small tolerance stated in each question. Open-ended answers are not auto-graded: you compare with a model answer and tick the key points you covered."],
  ["How does the Interview Simulator score me?", "With transparent rules: whether your answer mentions the key concepts (by keyword patterns), whether numbers are within tolerance, and simple checks on structure and length. These are practice indicators, not expert assessments or hiring predictions."],
  ["Where do skill scores come from?", "Only from auto-graded answers you have actually given, in practice, lesson checks and assessments. A skill shows a score once it has at least three answers."],
  ["Are the tools accurate?", "The formulas are unit-tested. The outputs depend entirely on the assumptions you enter, and each tool lists its assumptions and limitations. FinanceGo does not provide live market data."],
  ["Why are some courses “in development”?", "Six courses are complete today. The rest of the library is listed with its planned outline so you can see what is coming, but they cannot be started until they are written."],
  ["Does FinanceGo work on my phone?", "Yes. Every section is designed for phones, tablets and desktops."],
];

export default function HelpPage() {
  return (
    <>
      <PageHeader eyebrow="Help" title="Help and feedback" crumbs={[{ href: "/", label: "Home" }, { label: "Help" }]} />
      <div className="container-page mt-10 grid max-w-6xl gap-10 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <h2 className="font-serif text-2xl">Frequently asked questions</h2>
          <div className="mt-5 space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group rounded-2xl border border-line bg-white p-5 open:shadow-card">
                <summary className="cursor-pointer list-none font-semibold text-navy marker:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {q}
                    <span className="text-electric transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <div className="mt-3 text-sm leading-relaxed text-ink">{a}</div>
              </details>
            ))}
          </div>
        </section>
        <aside>
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-semibold text-navy">
              <Mail className="h-5 w-5 text-electric" /> Contact and feedback
            </h2>
            {SITE.contactEmail ? (
              <p className="mt-3 text-sm text-ink">
                Found a mistake or have a suggestion? Email{" "}
                <a href={`mailto:${SITE.contactEmail}?subject=FinanceGo%20feedback`} className="text-electric hover:underline">
                  {SITE.contactEmail}
                </a>
                . Please do not include personal financial information.
              </p>
            ) : (
              <p className="mt-3 text-sm text-ink">
                A feedback channel is not connected in this MVP yet, so there is no form here that would silently go nowhere. Once the site owner adds a contact address it will
                appear here.
              </p>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
