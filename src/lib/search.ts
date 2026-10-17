/**
 * Local search over FinanceGo's static content (MVP). Everything is indexed at
 * build time; nothing leaves the browser.
 */

import { CAREER_GUIDES } from "@/content/careers/guides";
import { ROADMAPS } from "@/content/careers/resources";
import { ALL_COURSES, COURSES, lessonHref } from "@/content/courses";
import { QUESTIONS } from "@/content/questions";
import { CATEGORIES, TOPICS } from "@/content/taxonomy";
import { TOOLS } from "@/content/tools";
import { normalize } from "./text";

export type SearchType = "Course" | "Lesson" | "Question" | "Tool" | "Career" | "Resource";

export interface SearchEntry {
  type: SearchType;
  title: string;
  description: string;
  href: string;
  /** Extra text that is searched but not shown. */
  body: string;
  badge?: string;
}

function blocksText(blocks: { type: string; [k: string]: unknown }[]): string {
  return blocks
    .map((b) => {
      if (b.type === "p" || b.type === "h") return String(b.text);
      if (b.type === "list") return (b.items as string[]).join(" ");
      if (b.type === "callout") return `${b.title} ${b.text}`;
      if (b.type === "example") return String(b.title);
      if (b.type === "table") return (b.rows as string[][]).flat().join(" ");
      return "";
    })
    .join(" ");
}

function buildIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const c of ALL_COURSES) {
    entries.push({
      type: "Course",
      title: c.title,
      description: c.summary,
      href: `/learn/${c.id}/`,
      body: `${CATEGORIES[c.category].label} ${c.difficulty} ${(c.plannedOutline ?? []).join(" ")}`,
      badge: c.status === "planned" ? "In development" : CATEGORIES[c.category].label,
    });
  }

  for (const course of COURSES) {
    for (const l of course.lessons) {
      entries.push({
        type: "Lesson",
        title: l.title,
        description: l.summary,
        href: lessonHref(course.id, l.id),
        body: `${course.title} ${l.objectives.join(" ")} ${blocksText(l.blocks as never)}`,
        badge: course.title,
      });
    }
  }

  for (const q of QUESTIONS) {
    entries.push({
      type: "Question",
      title: q.prompt.length > 110 ? `${q.prompt.slice(0, 107)}…` : q.prompt,
      description: `${TOPICS[q.topic].label} · ${q.difficulty}`,
      href: `/practice/q/${q.id}/`,
      body: `${q.context ?? ""} ${q.explanation} ${(q.options ?? []).join(" ")}`,
      badge: TOPICS[q.topic].label,
    });
  }

  for (const t of TOOLS) {
    entries.push({
      type: "Tool",
      title: t.title,
      description: t.summary,
      href: t.status === "available" ? `/tools/${t.slug}/` : "/tools/",
      body: t.category,
      badge: t.status === "available" ? t.category : "Planned",
    });
  }

  for (const g of CAREER_GUIDES) {
    entries.push({
      type: "Career",
      title: g.title,
      description: g.tagline,
      href: `/career/${g.slug}/`,
      body: `${g.whatTheyDo} ${g.skills.join(" ")} ${g.interviewTopics.join(" ")}`,
      badge: "Career guide",
    });
  }

  for (const r of ROADMAPS) {
    entries.push({ type: "Resource", title: r.title, description: r.summary, href: `/career/roadmaps/#${r.slug}`, body: r.steps.map((s) => `${s.title} ${s.detail}`).join(" "), badge: "Roadmap" });
  }

  entries.push(
    { type: "Resource", title: "CV and cover letter guide", description: "Structure, finance bullet examples and common mistakes.", href: "/career/cv/", body: "resume curriculum cover letter bullets", badge: "Career resource" },
    { type: "Resource", title: "Networking templates", description: "Cold emails, LinkedIn notes and follow-ups.", href: "/career/networking/", body: "networking email linkedin coffee chat informational interview", badge: "Career resource" },
    { type: "Resource", title: "Illustrative interview scenarios", description: "What common interview formats look like.", href: "/career/interview-scenarios/", body: "superday first round case study assessment centre", badge: "Career resource" },
    { type: "Resource", title: "Recruitment checklists", description: "Interactive checklists from applications to offers.", href: "/career/checklists/", body: "checklist preparation recruiting applications offer", badge: "Career resource" },
  );

  return entries;
}

let INDEX: SearchEntry[] | null = null;
export function getIndex(): SearchEntry[] {
  if (!INDEX) INDEX = buildIndex();
  return INDEX;
}

export function search(query: string, opts: { types?: SearchType[]; limit?: number } = {}): SearchEntry[] {
  const q = normalize(query).trim();
  if (q.length < 2) return [];
  const terms = q.split(/\s+/).filter((t) => t.length > 1);
  const scored: { entry: SearchEntry; score: number }[] = [];

  for (const entry of getIndex()) {
    if (opts.types && opts.types.length && !opts.types.includes(entry.type)) continue;
    const title = normalize(entry.title);
    const desc = normalize(entry.description);
    const body = normalize(entry.body);
    let score = 0;
    let allMatched = true;
    for (const term of terms) {
      const inTitle = title.includes(term);
      const inDesc = desc.includes(term);
      const inBody = body.includes(term);
      if (!inTitle && !inDesc && !inBody) {
        allMatched = false;
        break;
      }
      score += (inTitle ? 6 : 0) + (inDesc ? 3 : 0) + (inBody ? 1 : 0);
      if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(title)) score += 3;
    }
    if (!allMatched) continue;
    if (title.includes(q)) score += 10;
    if (entry.type === "Course" || entry.type === "Tool" || entry.type === "Career") score += 2;
    scored.push({ entry, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, opts.limit ?? 50).map((s) => s.entry);
}
