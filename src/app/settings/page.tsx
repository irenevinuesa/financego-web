import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Settings } from "@/components/settings/Settings";

export const metadata: Metadata = { title: "Settings & data", description: "Your FinanceGo profile, data export, import and deletion." };

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Settings" title="Profile and data" crumbs={[{ href: "/", label: "Home" }, { label: "Settings" }]} />
      <div className="container-page mt-10 max-w-4xl">
        <Settings />
      </div>
    </>
  );
}
