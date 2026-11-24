import type { MetadataRoute } from "next";
import { CAREER_GUIDES } from "@/content/careers/guides";
import { ALL_COURSES, COURSES } from "@/content/courses";
import { QUESTIONS } from "@/content/questions";
import { TOPIC_IDS } from "@/content/taxonomy";
import { TOOLS } from "@/content/tools";
import { BASE_PATH } from "@/lib/base-path";
import { LANGS } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

/** Public pages worth indexing. Personal pages (dashboard, settings, sessions, search) are left out. */
function paths(): { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] {
  const main = ["/", "/technicals/", "/behaviourals/", "/brain-teasers/", "/tools/", "/news/", "/planner/", "/career/", "/learn/", "/practice/", "/challenge/"];
  const secondary = [
    "/technicals/interview/",
    "/behaviourals/questions/",
    "/behaviourals/stories/",
    "/career/checklists/",
    "/career/cv/",
    "/career/interview-scenarios/",
    "/career/networking/",
    "/career/roadmaps/",
    "/about/",
    "/help/",
    "/privacy/",
    "/terms/",
    "/disclaimer/",
  ];
  return [
    ...main.map((path) => ({ path, priority: path === "/" ? 1 : 0.9, changeFrequency: path === "/news/" ? ("daily" as const) : ("weekly" as const) })),
    ...secondary.map((path) => ({ path, priority: 0.6, changeFrequency: "monthly" as const })),
    ...ALL_COURSES.map((c) => ({ path: `/learn/${c.id}/`, priority: 0.7, changeFrequency: "monthly" as const })),
    ...COURSES.flatMap((c) => c.lessons.map((l) => ({ path: `/learn/${c.id}/${l.id}/`, priority: 0.7, changeFrequency: "monthly" as const }))),
    ...TOPIC_IDS.map((t) => ({ path: `/practice/${t}/`, priority: 0.6, changeFrequency: "monthly" as const })),
    ...QUESTIONS.map((q) => ({ path: `/practice/q/${q.id}/`, priority: 0.4, changeFrequency: "yearly" as const })),
    ...TOOLS.filter((t) => t.status === "available").map((t) => ({ path: `/tools/${t.slug}/`, priority: 0.7, changeFrequency: "monthly" as const })),
    ...CAREER_GUIDES.map((g) => ({ path: `/career/${g.slug}/`, priority: 0.7, changeFrequency: "monthly" as const })),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (lang: string, path: string) => `${SITE_URL}${BASE_PATH}/${lang}${path}`;
  return paths().flatMap(({ path, priority, changeFrequency }) =>
    LANGS.map((lang) => ({
      url: url(lang, path),
      changeFrequency,
      priority,
      alternates: { languages: { ...Object.fromEntries(LANGS.map((l) => [l, url(l, path)])), "x-default": url("en", path) } },
    })),
  );
}
