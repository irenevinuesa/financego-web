import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Goals } from "@/components/tracker/Goals";
import { TrackerTabs } from "@/components/tracker/TrackerTabs";

export const metadata: Metadata = { title: "Goals · Tracker", description: "Set learning and preparation goals with deadlines." };

export default function GoalsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tracker · Goals"
        title="Personal goals"
        description={<p>Set concrete targets with deadlines. Course, question and interview goals update automatically from your activity.</p>}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/tracker/", label: "Tracker" },
          { label: "Goals" },
        ]}
      >
        <div className="mt-6">
          <TrackerTabs />
        </div>
      </PageHeader>
      <div className="container-page mt-10">
        <Goals />
      </div>
    </>
  );
}
