import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { ChallengePlay } from "@/components/challenge/ChallengePlay";

export const metadata: Metadata = { title: "500 Challenge · Play" };

export default function ChallengePlayPage() {
  return (
    <div className="container-page max-w-3xl pt-8">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/technicals/", label: "Technicals" },
          { href: "/challenge/", label: "500 Challenge" },
          { label: "Play" },
        ]}
        className="mb-6"
      />
      <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-cream" />}>
        <ChallengePlay />
      </Suspense>
    </div>
  );
}
