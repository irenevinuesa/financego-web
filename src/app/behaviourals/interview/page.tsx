import type { Metadata } from "next";
import { Suspense } from "react";
import { itemsForScope } from "@/content/interview";
import { PageHeader } from "@/components/layout/PageHeader";
import { Simulator } from "@/components/interview/Simulator";
import { Badge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Behavioural mock interview",
  description: "Scripted behavioural and fit interviews with follow-ups and feedback on structure and content, in English or Spanish.",
};

export default function BehaviouralInterviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Behaviourals · Mock interview"
        title="Practise your stories out loud"
        description={
          <p>
            The interviewer draws on {itemsForScope("behavioural").length} scripted behavioural questions, asks follow-ups, and ends with feedback on structure (STAR),
            content and clarity. In English or Spanish.
          </p>
        }
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/behaviourals/", label: "Behaviourals" },
          { label: "Mock interview" },
        ]}
        scene="london"
      >
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="success">Available: scripted interviews</Badge>
          <Badge tone="outline">Planned: AI follow-ups and feedback</Badge>
        </div>
      </PageHeader>
      <div className="container-page mt-10">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />}>
          <Simulator scope="behavioural" />
        </Suspense>
      </div>
    </>
  );
}
