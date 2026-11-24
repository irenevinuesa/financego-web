"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { localizePath } from "@/lib/i18n";
import { useLang } from "./LangProvider";

/**
 * next/link that keeps visitors in their language: "/practice/" becomes "/es/practice/"
 * on Spanish pages. Use it everywhere instead of next/link.
 */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const lang = useLang();
  return <NextLink href={typeof href === "string" ? localizePath(href, lang) : href} {...props} />;
}
