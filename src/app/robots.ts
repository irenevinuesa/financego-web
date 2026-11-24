import type { MetadataRoute } from "next";
import { BASE_PATH } from "@/lib/base-path";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const personal = ["dashboard", "settings", "account", "search", "practice/session", "challenge/play"].flatMap((p) => [`${BASE_PATH}/en/${p}/`, `${BASE_PATH}/es/${p}/`]);
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: personal }],
    sitemap: `${SITE_URL}${BASE_PATH}/sitemap.xml`,
  };
}
