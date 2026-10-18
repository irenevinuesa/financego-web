import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StoryBank } from "@/components/behaviourals/StoryBank";

export const metadata: Metadata = {
  title: "Story bank",
  description: "Write your behavioural interview stories in STAR form once, map them to question categories and see which categories you still need to cover.",
};

export default function StoriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Behaviourals · Story bank"
        title="Your stories, ready to tell"
        description={<p>Write six to eight stories in STAR form, tag the questions each one answers, and check which categories you still need. Everything stays in this browser.</p>}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/behaviourals/", label: "Behaviourals" },
          { label: "Story bank" },
        ]}
      />
      <div className="container-page mt-10">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />}>
          <StoryBank />
        </Suspense>
      </div>
    </>
  );
}
