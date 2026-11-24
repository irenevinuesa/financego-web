import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Checklists } from "@/components/career/CareerClient";

export const metadata: Metadata = { title: "Recruitment checklists", description: "Interactive recruitment preparation checklists, from applications to offers." };

export default function ChecklistsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Career · Resources"
        title="Recruitment checklists"
        description={<p>Tick items off as you go. Your progress is saved in this browser.</p>}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/career/", label: "Career" },
          { label: "Checklists" },
        ]}
      />
      <div className="container-page mt-10 max-w-5xl">
        <Checklists />
      </div>
    </>
  );
}
