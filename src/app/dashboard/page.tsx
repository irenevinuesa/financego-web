import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = { title: "Dashboard", description: "Your FinanceGo dashboard: continue learning, practice recommendations, interviews, applications and goals." };

export default function DashboardPage() {
  return (
    <div className="container-page pt-8">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Dashboard" }]} className="mb-6" />
      <Dashboard />
    </div>
  );
}
