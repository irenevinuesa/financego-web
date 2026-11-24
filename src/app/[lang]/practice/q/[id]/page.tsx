import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getQuestion, QUESTIONS } from "@/content/questions";
import { TOPICS } from "@/content/taxonomy";
import { PageHeader } from "@/components/layout/PageHeader";
import { SingleQuestion } from "@/components/practice/SingleQuestion";

export const dynamicParams = false;

export function generateStaticParams() {
  return QUESTIONS.map((q) => ({ id: q.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const q = getQuestion(id);
  return { title: q ? `${TOPICS[q.topic].label} question` : "Question", description: q?.prompt };
}

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = getQuestion(id);
  if (!q) notFound();
  const i = QUESTIONS.findIndex((x) => x.id === id);
  const prev = QUESTIONS[i - 1];
  const next = QUESTIONS[i + 1];

  return (
    <>
      <PageHeader
        eyebrow={`${TOPICS[q.topic].label} · Question ${i + 1} of ${QUESTIONS.length}`}
        title="Practice question"
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/practice/", label: "Practice" },
          { href: "/practice/#bank", label: "Question bank" },
          { label: TOPICS[q.topic].label },
        ]}
      />
      <div className="container-page mt-8 max-w-3xl">
        <SingleQuestion id={q.id} />
        <nav aria-label="Question navigation" className="mt-8 flex flex-wrap justify-between gap-3 text-sm">
          {prev ? (
            <Link href={`/practice/q/${prev.id}/`} className="inline-flex items-center gap-1 font-medium text-electric hover:underline">
              <ArrowLeft className="h-4 w-4" /> Previous question
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/practice/q/${next.id}/`} className="inline-flex items-center gap-1 font-medium text-electric hover:underline">
              Next question <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
