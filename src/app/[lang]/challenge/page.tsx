import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChallengeHub } from "@/components/challenge/ChallengeHub";

export const metadata: Metadata = {
  title: "500 Challenge",
  description: "500 finance interview questions in a fixed, mixed order. Answer one to unlock the next, and repeat the ones you miss.",
};

export default function ChallengePage() {
  return (
    <>
      <PageHeader
        eyebrow="Technicals · 500 Challenge"
        title="The 500 Challenge"
        description={
          <p>
            Five hundred interview questions in one mixed path, from first steps to Superday level. Answer a question to unlock the next, right or wrong; anything you miss
            goes to a list you can repeat until it sticks.
          </p>
        }
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/technicals/", label: "Technicals" },
          { label: "500 Challenge" },
        ]}
        scene="summit"
      />
      <div className="container-page mt-10">
        <ChallengeHub />
      </div>
    </>
  );
}
