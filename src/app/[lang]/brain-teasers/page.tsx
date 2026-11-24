import type { Metadata } from "next";
import { TEASER_CATEGORY_IDS, TEASERS } from "@/content/brain-teasers";
import { getLang } from "@/lib/server-lang";
import type { Lang } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { BrainTeasers } from "@/components/brain-teasers/BrainTeasers";

const TEXT = {
  en: {
    metaTitle: "Brain teasers",
    metaDescription:
      "Probability, expected value, mental maths, logic puzzles, sequences and market sizing: the brain teasers asked in trading, quant and consulting interviews.",
    eyebrow: "Brain teasers",
    title: "Think out loud, under pressure",
    description: (count: number, categories: number) =>
      `${count} brain teasers in ${categories} categories, the kind trading, quant and consulting interviewers use to see how you reason. Try each one first, take a hint if you are stuck, then read the worked solution. Interviewers care more about your approach than the final number.`,
    home: "Home",
    crumb: "Brain teasers",
    practice: "Timed practice set",
    mock: "Mock interview",
  },
  es: {
    metaTitle: "Brain Teasers",
    metaDescription:
      "Probabilidad, valor esperado, cálculo mental, acertijos de lógica, secuencias y market sizing: los brain teasers que se preguntan en entrevistas de trading, quant y consultoría.",
    eyebrow: "Brain Teasers",
    title: "Piensa en voz alta, bajo presión",
    description: (count: number, categories: number) =>
      `${count} brain teasers en ${categories} categorías, del tipo que usan los entrevistadores de trading, quant y consultoría para ver cómo razonas. Intenta resolver cada uno primero, pide una pista si te atascas y luego lee la solución paso a paso. A los entrevistadores les importa más tu enfoque que el número final.`,
    home: "Inicio",
    crumb: "Brain Teasers",
    practice: "Práctica con tiempo",
    mock: "Mock interview",
  },
} satisfies Record<Lang, Record<string, unknown>>;

export async function generateMetadata(): Promise<Metadata> {
  const tx = TEXT[await getLang()];
  return { title: tx.metaTitle, description: tx.metaDescription };
}

export default async function BrainTeasersPage() {
  const tx = TEXT[await getLang()];
  return (
    <>
      <PageHeader
        eyebrow={tx.eyebrow}
        title={tx.title}
        description={<p>{tx.description(TEASERS.length, TEASER_CATEGORY_IDS.length)}</p>}
        crumbs={[{ href: "/", label: tx.home }, { label: tx.crumb }]}
        scene="lake"
        actions={
          <>
            <ButtonLink href="/practice/session/?mode=standard&topic=brain-teasers">{tx.practice}</ButtonLink>
            <ButtonLink href="/technicals/interview/" variant="secondary">
              {tx.mock}
            </ButtonLink>
          </>
        }
      />
      <div className="container-page mt-10">
        <BrainTeasers />
      </div>
    </>
  );
}
