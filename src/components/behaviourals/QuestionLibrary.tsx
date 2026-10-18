"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, NotebookPen, Search } from "lucide-react";
import { BEHAVIOURAL_QUESTIONS, BQ_CATEGORIES, BQ_CATEGORY_IDS, type BQCategory } from "@/content/behaviourals/questions";
import { useHydrated, useStore } from "@/lib/store";
import { Badge, Card, Chip, Input } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function QuestionLibrary() {
  const state = useStore();
  const hydrated = useHydrated();
  const [category, setCategory] = useState<BQCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const storiesByCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of state.stories) for (const c of s.categories) m.set(c, (m.get(c) ?? 0) + 1);
    return m;
  }, [state.stories]);

  const list = useMemo(() => {
    const q = norm(query.trim());
    return BEHAVIOURAL_QUESTIONS.filter((x) => (category === "all" || x.category === category) && (!q || norm(`${x.question} ${x.lookFor.join(" ")}`).includes(q)));
  }, [category, query]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions" aria-label="Search questions" className="pl-9" />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            All ({BEHAVIOURAL_QUESTIONS.length})
          </Chip>
          {BQ_CATEGORY_IDS.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {BQ_CATEGORIES[c]}
            </Chip>
          ))}
        </div>
      </div>

      <p className="text-sm text-ink-muted" aria-live="polite">
        {list.length} question{list.length === 1 ? "" : "s"}
      </p>

      <ul className="space-y-3">
        {list.map((q) => {
          const isOpen = open === q.id;
          const stories = storiesByCategory.get(q.category) ?? 0;
          return (
            <li key={q.id}>
              <Card className={cn("overflow-hidden transition-colors", isOpen && "border-navy/40")}>
                <button type="button" onClick={() => setOpen(isOpen ? null : q.id)} aria-expanded={isOpen} className="flex w-full items-start gap-4 p-5 text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-navy">{q.question}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone="blue">{BQ_CATEGORIES[q.category]}</Badge>
                      {hydrated && stories > 0 && (
                        <Badge tone="success">
                          {stories} stor{stories === 1 ? "y" : "ies"} ready
                        </Badge>
                      )}
                    </span>
                  </span>
                  <ChevronDown className={cn("mt-1 h-5 w-5 shrink-0 text-ink-muted transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="grid gap-5 border-t border-line bg-cream/60 p-5 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">What they look for</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
                        {q.lookFor.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">Structure</p>
                      <p className="mt-2 text-sm text-ink">{q.structure}</p>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">Pitfalls</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
                        {q.pitfalls.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Outline to adapt</p>
                      <ol className="mt-2 space-y-2 text-sm text-ink">
                        {q.outline.map((x, i) => (
                          <li key={x} className="flex gap-2 rounded-xl bg-white p-3">
                            <span className="font-semibold text-navy">{i + 1}.</span>
                            <span>{x}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="mt-2 text-xs text-ink-muted">Replace the [brackets] with your own experience.</p>
                      {q.followUps.length > 0 && (
                        <>
                          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">Likely follow-ups</p>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
                            {q.followUps.map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      <Link href={`/behaviourals/stories/?category=${q.category}`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-electric hover:underline">
                        <NotebookPen className="h-4 w-4" /> Write a story for this category
                      </Link>
                    </div>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
