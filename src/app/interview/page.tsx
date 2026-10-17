import type { Metadata } from "next";
import { Suspense } from "react";
import { INTERVIEW_ITEMS } from "@/content/interview/items";
import { PageHeader } from "@/components/layout/PageHeader";
import { Simulator } from "@/components/interview/Simulator";
import { Badge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Interview Simulator",
  description: "Scripted technical finance interviews with adaptive follow-ups and structured feedback, in English or Spanish.",
};

export default function InterviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Interview Simulator"
        title="A demanding, constructive interviewer"
        description={
          <p>
            Choose a track, format and difficulty. The interviewer draws on {INTERVIEW_ITEMS.length} scripted questions, follows up on what you say, and ends with feedback on technical
            accuracy, structure, numbers and clarity. Interviews run in English or Spanish.
          </p>
        }
        crumbs={[{ href: "/", label: "Home" }, { label: "Interview" }]}
        scene="nyc"
      >
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="success">Available: scripted interviews (MVP)</Badge>
          <Badge tone="outline">Planned V2: AI follow-ups and feedback</Badge>
          <Badge tone="outline">Planned V3: voice interviews</Badge>
        </div>
      </PageHeader>
      <div className="container-page mt-10">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />}>
          <Simulator />
        </Suspense>
      </div>
    </>
  );
}
