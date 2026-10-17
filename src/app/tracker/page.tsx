import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { TrackerOverview } from "@/components/tracker/TrackerOverview";
import { TrackerTabs } from "@/components/tracker/TrackerTabs";

export const metadata: Metadata = {
  title: "Tracker",
  description: "Track your learning, skills, practice accuracy, mock interviews and recruitment applications.",
};

export default function TrackerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tracker"
        title="Your finance preparation, in one place"
        description={<p>Learning progress, skills built from real answers, practice accuracy, mock interviews and your recruitment pipeline. Every number comes from what you have done here.</p>}
        crumbs={[{ href: "/", label: "Home" }, { label: "Tracker" }]}
      >
        <div className="mt-6">
          <TrackerTabs />
        </div>
      </PageHeader>
      <div className="container-page mt-10">
        <TrackerOverview />
      </div>
    </>
  );
}
