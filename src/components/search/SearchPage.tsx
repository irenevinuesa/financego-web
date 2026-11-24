"use client";

import Link from "@/components/i18n/Link";
import { useRouter, useSearchParams } from "next/navigation";
import { localizePath } from "@/lib/i18n";
import { useLang } from "@/components/i18n/LangProvider";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { search, type SearchType } from "@/lib/search";
import { TYPE_ICONS, TYPE_LABELS } from "@/components/layout/SearchDialog";
import { Badge, Chip, EmptyState } from "@/components/ui/primitives";

const TYPES: SearchType[] = ["Section", "Course", "Lesson", "Question", "Behavioural", "Tool", "Career", "Resource"];

const TEXT = {
  en: {
    placeholder: "Search courses, lessons, concepts, questions, tools and careers…",
    search: "Search",
    all: "All",
    plural: (t: SearchType) => `${t}s`,
    tooShort: "Type at least two characters. Try “terminal value”, “working capital”, “duration” or “private equity”.",
    noResults: (q: string) => `No results for “${q}”`,
    noResultsHint: "Try a broader term, check the spelling, or remove a filter.",
    count: (n: number) => `${n} result${n === 1 ? "" : "s"}`,
  },
  es: {
    placeholder: "Busca cursos, lecciones, conceptos, preguntas, herramientas y carreras…",
    search: "Buscar",
    all: "Todo",
    plural: (t: SearchType) => PLURAL_ES[t],
    tooShort: "Escribe al menos dos caracteres. Prueba con «terminal value», «working capital», «duration» o «private equity».",
    noResults: (q: string) => `No hay resultados para «${q}»`,
    noResultsHint: "Prueba con un término más general, revisa la ortografía o quita algún filtro.",
    count: (n: number) => `${n} resultado${n === 1 ? "" : "s"}`,
  },
};

const PLURAL_ES: Record<SearchType, string> = {
  Section: "Secciones",
  Course: "Cursos",
  Lesson: "Lecciones",
  Question: "Preguntas",
  Behavioural: "Behaviourals",
  Tool: "Herramientas",
  Career: "Carreras",
  Resource: "Recursos",
};

export function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = useLang();
  const tx = TEXT[lang];
  const [q, setQ] = useState(params.get("q") ?? "");
  const [types, setTypes] = useState<SearchType[]>([]);
  const results = useMemo(() => search(q, { types, limit: 100 }), [q, types]);
  const counts = useMemo(() => {
    const all = search(q, { limit: 500 });
    return Object.fromEntries(TYPES.map((t) => [t, all.filter((r) => r.type === t).length])) as Record<SearchType, number>;
  }, [q]);

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(localizePath(`/search/?q=${encodeURIComponent(q.trim())}`, lang));
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tx.placeholder}
          aria-label={tx.search}
          autoFocus
          className="h-14 w-full rounded-2xl border border-line-strong bg-white pl-12 pr-4 text-base shadow-card focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20"
        />
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={types.length === 0} onClick={() => setTypes([])}>
          {tx.all}
        </Chip>
        {TYPES.map((t) => (
          <Chip key={t} active={types.includes(t)} onClick={() => setTypes((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}>
            {tx.plural(t)} {q.trim().length >= 2 && <span className="opacity-70">({counts[t]})</span>}
          </Chip>
        ))}
      </div>

      <div className="mt-8">
        {q.trim().length < 2 ? (
          <p className="text-sm text-ink-muted">{tx.tooShort}</p>
        ) : results.length === 0 ? (
          <EmptyState title={tx.noResults(q)}>{tx.noResultsHint}</EmptyState>
        ) : (
          <>
            <p className="mb-3 text-sm text-ink-muted">
              {tx.count(results.length)}
            </p>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {results.map((r, i) => {
                const Icon = TYPE_ICONS[r.type];
                return (
                  <li key={`${r.href}-${i}`}>
                    <Link href={r.href} className="flex items-start gap-4 px-5 py-4 hover:bg-cream/60">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ice-soft text-electric">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-navy">{r.title}</span>
                          {r.badge && <Badge tone={r.badge === "In development" || r.badge === "Planned" ? "warning" : "outline"}>{r.badge}</Badge>}
                        </span>
                        <span className="mt-0.5 block text-sm text-ink-muted">
                          {TYPE_LABELS[lang][r.type]} · {r.description}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
