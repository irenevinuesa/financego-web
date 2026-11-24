import type { ReactNode } from "react";
import { getLang } from "@/lib/server-lang";
import { PageHeader } from "./PageHeader";

const TEXT = {
  en: { updated: "Last updated", home: "Home" },
  es: { updated: "Última actualización", home: "Inicio" },
};

export async function LegalPage({ title, eyebrow, updated, children }: { title: string; eyebrow: string; updated: string; children: ReactNode }) {
  const tx = TEXT[await getLang()];
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={
          <p className="text-sm">
            {tx.updated}: {updated}
          </p>
        }
        crumbs={[{ href: "/", label: tx.home }, { label: title }]}
      />
      <div className="container-page mt-10 max-w-3xl space-y-6 text-[1.02rem] leading-relaxed text-ink [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </>
  );
}
