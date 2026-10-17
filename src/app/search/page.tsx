import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchPage } from "@/components/search/SearchPage";

export const metadata: Metadata = { title: "Search", description: "Search FinanceGo courses, lessons, concepts, practice questions, tools and career guides." };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Search" title="Find anything" crumbs={[{ href: "/", label: "Home" }, { label: "Search" }]} />
      <div className="container-page mt-8 max-w-4xl">
        <Suspense fallback={<div className="h-14 animate-pulse rounded-2xl bg-white" />}>
          <SearchPage />
        </Suspense>
      </div>
    </>
  );
}
