"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CategoryId, CourseMeta, Difficulty } from "@/content/types";
import { CATEGORIES, CATEGORY_IDS, DIFFICULTIES } from "@/content/taxonomy";
import { normalize } from "@/lib/text";
import { Chip, EmptyState, Select } from "@/components/ui/primitives";
import { CourseCard } from "./CourseCard";

export function Catalog({ courses }: { courses: CourseMeta[] }) {
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [status, setStatus] = useState<"all" | "available" | "planned">("all");
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    const term = normalize(q.trim());
    return new Set(
      courses
        .filter((c) => (category === "all" || c.category === category) && (difficulty === "all" || c.difficulty === difficulty) && (status === "all" || c.status === status))
        .filter((c) => !term || normalize(`${c.title} ${c.summary} ${(c.plannedOutline ?? []).join(" ")}`).includes(term))
        .map((c) => c.id),
    );
  }, [courses, category, difficulty, status, q]);

  return (
    <div>
      <div className="sticky top-[4.25rem] z-20 -mx-4 border-b border-line bg-cream/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-white/90 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter courses…"
              aria-label="Filter courses"
              className="h-9 w-full rounded-full border border-line-strong bg-white pl-9 pr-3 text-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20"
            />
          </div>
          <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | "all")} className="h-9 w-auto rounded-full" aria-label="Difficulty">
            <option value="all">All levels</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="h-9 w-auto rounded-full" aria-label="Availability">
            <option value="all">All courses</option>
            <option value="available">Available now</option>
            <option value="planned">In development</option>
          </Select>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            All categories
          </Chip>
          {CATEGORY_IDS.map((id) => (
            <Chip key={id} active={category === id} onClick={() => setCategory(id)} className="shrink-0">
              {CATEGORIES[id].label}
            </Chip>
          ))}
        </div>
      </div>
      <div className="mt-8">
        {visible.size === 0 ? (
          <EmptyState title="No courses match these filters">Try another category or clear the search.</EmptyState>
        ) : (
          <div className="space-y-14">
            {CATEGORY_IDS.filter((id) => courses.some((c) => c.category === id && visible.has(c.id))).map((id) => {
              const list = courses.filter((c) => c.category === id && visible.has(c.id));
              const available = list.filter((c) => c.status === "available").length;
              return (
                <section key={id} aria-labelledby={`cat-${id}`}>
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h2 id={`cat-${id}`} className="font-serif text-2xl text-navy sm:text-3xl">
                        {CATEGORIES[id].label}
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm text-ink-muted">{CATEGORIES[id].blurb}</p>
                    </div>
                    <p className="text-xs text-ink-muted">
                      {available} available · {list.length - available} in development
                    </p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((c) => (
                      <CourseCard key={c.id} course={c} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
