import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { getLang } from "@/lib/server-lang";
import type { Lang } from "@/lib/i18n";

const TEXT = {
  en: {
    description: "Your FinanceGo dashboard: continue learning, practice recommendations, the 500 Challenge, interviews and your story bank.",
    home: "Home",
  },
  es: {
    description: "Tu Dashboard de FinanceGo: sigue aprendiendo, recomendaciones de práctica, el 500 Challenge, entrevistas y tu banco de historias.",
    home: "Inicio",
  },
} satisfies Record<Lang, Record<string, string>>;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: "Dashboard", description: TEXT[lang].description };
}

export default async function DashboardPage() {
  const lang = await getLang();
  return (
    <div className="container-page pt-8">
      <Breadcrumbs items={[{ href: "/", label: TEXT[lang].home }, { label: "Dashboard" }]} className="mb-6" />
      <Dashboard />
    </div>
  );
}
