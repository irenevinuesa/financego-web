import { lang as rootLang } from "next/root-params";
import { DEFAULT_LANG, isLang, type Lang } from "./i18n";

/** The page language in Server Components, from the [lang] root segment. */
export async function getLang(): Promise<Lang> {
  const value = await rootLang();
  return isLang(value) ? value : DEFAULT_LANG;
}
