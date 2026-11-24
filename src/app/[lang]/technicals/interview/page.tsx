import type { Metadata } from "next";
import { MOCK_LEVELS, MOCK_QUESTIONS } from "@/content/mock-interview";
import { MOCK_PASS_MARK } from "@/lib/mock-interview";
import { getLang } from "@/lib/server-lang";
import type { Lang } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { MockInterview } from "@/components/interview/MockInterview";

const TEXT = {
  en: {
    metaTitle: "Mock interview",
    metaDescription: "Rapid-fire numeric finance interview questions against the clock, in five levels.",
    eyebrow: "Technicals · Mock interview",
    title: "Answer against the clock",
    description: (questions: number, levels: number, mark: number) =>
      `${questions} short numeric questions in ${levels} levels, the kind interviewers fire at you to test your mental maths. Each question has its own time limit. Type a number: it is either right or wrong. Score ${mark}/10 to unlock the next level.`,
    home: "Home",
    technicals: "Technicals",
    crumb: "Mock interview",
  },
  es: {
    metaTitle: "Mock interview",
    metaDescription: "Preguntas numéricas rápidas de entrevistas de finanzas contra el reloj, en cinco niveles.",
    eyebrow: "Technicals · Mock interview",
    title: "Responde contra el reloj",
    description: (questions: number, levels: number, mark: number) =>
      `${questions} preguntas numéricas cortas en ${levels} niveles, del tipo que te lanzan los entrevistadores para poner a prueba tu cálculo mental. Cada pregunta tiene su propio límite de tiempo. Escribe un número: o está bien o está mal. Saca ${mark}/10 para desbloquear el siguiente nivel.`,
    home: "Inicio",
    technicals: "Technicals",
    crumb: "Mock interview",
  },
} satisfies Record<Lang, Record<string, unknown>>;

export async function generateMetadata(): Promise<Metadata> {
  const tx = TEXT[await getLang()];
  return { title: tx.metaTitle, description: tx.metaDescription };
}

export default async function MockInterviewPage() {
  const tx = TEXT[await getLang()];
  return (
    <>
      <PageHeader
        eyebrow={tx.eyebrow}
        title={tx.title}
        description={<p>{tx.description(MOCK_QUESTIONS.length, MOCK_LEVELS.length, MOCK_PASS_MARK)}</p>}
        crumbs={[
          { href: "/", label: tx.home },
          { href: "/technicals/", label: tx.technicals },
          { label: tx.crumb },
        ]}
        scene="nyc"
      />
      <div className="container-page mt-10">
        <MockInterview />
      </div>
    </>
  );
}
