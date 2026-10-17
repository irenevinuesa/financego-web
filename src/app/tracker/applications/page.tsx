import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Applications } from "@/components/tracker/Applications";
import { TrackerTabs } from "@/components/tracker/TrackerTabs";

export const metadata: Metadata = { title: "Applications · Tracker", description: "Manage your finance recruitment applications in table or Kanban view." };

export default function ApplicationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tracker · Applications"
        title="Recruitment pipeline"
        description={<p>Add each application, move it through the stages, and keep interview dates and notes together. Drag cards in the Kanban view or change the stage from any card.</p>}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/tracker/", label: "Tracker" },
          { label: "Applications" },
        ]}
      >
        <div className="mt-6">
          <TrackerTabs />
        </div>
      </PageHeader>
      <div className="container-page mt-10">
        <Applications />
      </div>
    </>
  );
}
