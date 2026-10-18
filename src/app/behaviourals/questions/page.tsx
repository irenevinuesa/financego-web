import type { Metadata } from "next";
import { BEHAVIOURAL_QUESTIONS, BQ_CATEGORY_IDS } from "@/content/behaviourals/questions";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuestionLibrary } from "@/components/behaviourals/QuestionLibrary";

export const metadata: Metadata = {
  title: "Behavioural question library",
  description: "Common behavioural and fit interview questions by category, with what interviewers look for, a structure, pitfalls and an outline to adapt.",
};

export default function BehaviouralQuestionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Behaviourals · Question library"
        title="The questions you will be asked"
        description={
          <p>
            {BEHAVIOURAL_QUESTIONS.length} common questions in {BQ_CATEGORY_IDS.length} categories. Open one to see what interviewers look for, how to structure your answer,
            the usual pitfalls and an outline to adapt with your own experience.
          </p>
        }
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/behaviourals/", label: "Behaviourals" },
          { label: "Question library" },
        ]}
      />
      <div className="container-page mt-10 max-w-4xl">
        <QuestionLibrary />
      </div>
    </>
  );
}
