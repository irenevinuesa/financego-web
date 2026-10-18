import type { Metadata } from "next";
import { Suspense } from "react";
import { itemsForScope } from "@/content/interview";
import { PageHeader } from "@/components/layout/PageHeader";
import { Simulator } from "@/components/interview/Simulator";
import { Badge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Technical mock interview",
  description: "Scripted technical finance interviews with adaptive follow-ups and structured feedback, in English or Spanish.",
};

export default function TechnicalInterviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Technicals · Mock interview"
        title="A demanding, constructive interviewer"
        description={
          <p>
            Choose a track, format and difficulty. The interviewer draws on {itemsForScope("technical").length} scripted technical, case, market and pitch questions,
            follows up on what you say, and ends with feedback on technical accuracy, structure, numbers and clarity. In English or Spanish.
          </p>
        }
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/technicals/", label: "Technicals" },
          { label: "Mock interview" },
        ]}
        scene="nyc"
      >
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="success">Available: scripted interviews</Badge>
          <Badge tone="outline">Planned: AI follow-ups and feedback</Badge>
          <Badge tone="outline">Planned: voice interviews</Badge>
        </div>
      </PageHeader>
      <div className="container-page mt-10">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />}>
          <Simulator scope="technical" />
        </Suspense>
      </div>
    </>
  );
}
