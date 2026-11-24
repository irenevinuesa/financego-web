import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Settings } from "@/components/settings/Settings";
import { getLang } from "@/lib/server-lang";

const TEXT = {
  en: {
    metaTitle: "Settings & data",
    metaDescription: "Your FinanceGo profile, data export, import and deletion.",
    eyebrow: "Settings",
    title: "Profile and data",
    home: "Home",
  },
  es: {
    metaTitle: "Ajustes y datos",
    metaDescription: "Tu perfil de FinanceGo y la exportación, importación y eliminación de tus datos.",
    eyebrow: "Ajustes",
    title: "Perfil y datos",
    home: "Inicio",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const tx = TEXT[await getLang()];
  return { title: tx.metaTitle, description: tx.metaDescription };
}

export default async function SettingsPage() {
  const tx = TEXT[await getLang()];
  return (
    <>
      <PageHeader eyebrow={tx.eyebrow} title={tx.title} crumbs={[{ href: "/", label: tx.home }, { label: tx.eyebrow }]} />
      <div className="container-page mt-10 max-w-4xl">
        <Settings />
      </div>
    </>
  );
}
