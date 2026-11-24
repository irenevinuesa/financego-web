"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LANG, type Lang } from "@/lib/i18n";

const LangContext = createContext<Lang>(DEFAULT_LANG);

/** Makes the page language available to Client Components (Server Components use next/root-params). */
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}
