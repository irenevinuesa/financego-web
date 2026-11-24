import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PracticeSession } from "@/components/practice/PracticeSession";

export const metadata: Metadata = { title: "Practice session" };

export default function PracticeSessionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Practice session"
        title="Focus mode"
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/practice/", label: "Practice" },
          { label: "Session" },
        ]}
      />
      <div className="container-page mt-8 max-w-3xl">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl border border-line bg-white" />}>
          <PracticeSession />
        </Suspense>
      </div>
    </>
  );
}
