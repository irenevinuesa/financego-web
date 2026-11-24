import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchPage } from "@/components/search/SearchPage";
import { getLang } from "@/lib/server-lang";

const TEXT = {
  en: {
    metaTitle: "Search",
    metaDescription: "Search FinanceGo courses, lessons, concepts, practice questions, tools and career guides.",
    title: "Find anything",
    home: "Home",
  },
  es: {
    metaTitle: "Buscar",
    metaDescription: "Busca cursos, lecciones, conceptos, preguntas de práctica, herramientas y guías de carrera de FinanceGo.",
    title: "Encuentra lo que buscas",
    home: "Inicio",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const tx = TEXT[await getLang()];
  return { title: tx.metaTitle, description: tx.metaDescription };
}

export default async function Page() {
  const tx = TEXT[await getLang()];
  return (
    <>
      <PageHeader eyebrow={tx.metaTitle} title={tx.title} crumbs={[{ href: "/", label: tx.home }, { label: tx.metaTitle }]} />
      <div className="container-page mt-8 max-w-4xl">
        <Suspense fallback={<div className="h-14 animate-pulse rounded-2xl bg-white" />}>
          <SearchPage />
        </Suspense>
      </div>
    </>
  );
}
