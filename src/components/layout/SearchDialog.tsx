"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BookOpen, Calculator, Compass, FileText, GraduationCap, Search, Target, X } from "lucide-react";
import { search, type SearchType } from "@/lib/search";
import { cn } from "@/lib/cn";

export const TYPE_ICONS: Record<SearchType, typeof BookOpen> = {
  Course: GraduationCap,
  Lesson: BookOpen,
  Question: Target,
  Tool: Calculator,
  Career: Compass,
  Resource: FileText,
};

const SUGGESTIONS = ["WACC", "terminal value", "depreciation", "LBO", "duration", "accretion", "private equity"];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(query, { limit: 12 }), [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(0, results.length - 1)));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === "Enter") {
      if (results[active]) go(results[active].href);
      else if (query.trim()) go(`/search/?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-navy-deep/40 px-4 pt-[10vh] backdrop-blur-sm" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search FinanceGo"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-white shadow-lift animate-pop"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-5 w-5 shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, lessons, questions, tools, careers…"
            className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-muted/70"
            aria-label="Search query"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `sr-${active}` : undefined}
          />
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-ink-muted hover:bg-cream" aria-label="Close search">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim().length < 2 ? (
            <div className="p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Try</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => setQuery(s)} className="rounded-full border border-line px-3 py-1 text-sm text-ink hover:border-electric hover:text-electric">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-muted">No results for “{query}”. Try a broader term such as “valuation” or “bonds”.</p>
          ) : (
            <ul id="search-results" role="listbox">
              {results.map((r, i) => {
                const Icon = TYPE_ICONS[r.type];
                return (
                  <li key={`${r.type}-${r.href}-${i}`} id={`sr-${i}`} role="option" aria-selected={i === active}>
                    <Link
                      href={r.href}
                      onClick={onClose}
                      onMouseEnter={() => setActive(i)}
                      className={cn("flex items-start gap-3 rounded-xl px-3 py-2.5", i === active ? "bg-ice-soft" : "hover:bg-cream")}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-electric ring-1 ring-line">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-navy">{r.title}</span>
                        <span className="block truncate text-xs text-ink-muted">
                          {r.type} · {r.description}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {query.trim().length >= 2 && (
          <div className="border-t border-line px-4 py-2.5">
            <Link href={`/search/?q=${encodeURIComponent(query.trim())}`} onClick={onClose} className="inline-flex items-center gap-1 text-sm font-medium text-electric hover:underline">
              See all results with filters <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
