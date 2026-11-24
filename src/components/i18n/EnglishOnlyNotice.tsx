"use client";

import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { stripLang } from "@/lib/i18n";
import { useLang } from "./LangProvider";

/** Sections translated into Spanish. Everything else (courses, practice, career guides, tools) is English for now. */
const TRANSLATED = [
  /^\/$/,
  /^\/technicals\/(interview\/)?$/,
  /^\/behaviourals\/$/,
  /^\/brain-teasers\/$/,
  /^\/tools\/$/,
  /^\/news\/$/,
  /^\/planner\/$/,
  /^\/dashboard\/$/,
  /^\/(about|help|privacy|terms|disclaimer|settings)\/$/,
];

export function isTranslated(path: string) {
  return TRANSLATED.some((r) => r.test(path));
}

/** On Spanish pages whose content is still English, says so plainly. */
export function EnglishOnlyNotice() {
  const lang = useLang();
  const path = stripLang(usePathname() ?? "/");
  if (lang !== "es" || isTranslated(path)) return null;
  return (
    <div className="border-b border-ice bg-ice-soft/70">
      <p className="container-page flex items-center gap-2 py-2 text-sm text-navy">
        <Languages className="h-4 w-4 shrink-0" /> Este contenido está disponible solo en inglés por ahora. Los menús y el resto de la web están en español.
      </p>
    </div>
  );
}
