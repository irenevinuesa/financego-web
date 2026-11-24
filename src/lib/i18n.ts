/**
 * Languages. Every page lives under /en/… and /es/… (app/[lang]); "/" sends visitors to
 * the right one. Components keep their own small EN/ES dictionaries next to their code.
 */
import type { Lang } from "@/content/types";

export type { Lang };
export const LANGS: Lang[] = ["en", "es"];
export const DEFAULT_LANG: Lang = "en";

export const LANG_NAMES: Record<Lang, string> = { en: "English", es: "Español" };
/** BCP 47 tags for dates, numbers and <html lang>. */
export const LOCALES: Record<Lang, string> = { en: "en-GB", es: "es-ES" };

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "es";
}

const PREFIX = /^\/(en|es)(?=\/|$)/;

/** "/practice/" → "/es/practice/". Leaves external, hash, already-prefixed and asset URLs alone. */
export function localizePath(href: string, lang: Lang): string {
  if (!href.startsWith("/") || href.startsWith("//") || PREFIX.test(href) || href.startsWith("/_next")) return href;
  return `/${lang}${href === "/" ? "/" : href}`;
}

/** "/es/practice/" → "/practice/". */
export function stripLang(pathname: string): string {
  const rest = pathname.replace(PREFIX, "");
  return rest === "" ? "/" : rest;
}

export function langOfPath(pathname: string): Lang {
  const m = pathname.match(PREFIX);
  return m ? (m[1] as Lang) : DEFAULT_LANG;
}

/** Picks the dictionary for a language: `t(lang, { en: "Hello", es: "Hola" })`. */
export function t<T>(lang: Lang, text: Record<Lang, T>): T {
  return text[lang];
}
