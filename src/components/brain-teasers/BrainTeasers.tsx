"use client";

import { useMemo, useState } from "react";
import { CircleCheck, CircleX, Eye, Lightbulb, Shuffle } from "lucide-react";
import {
  TEASER_CATEGORIES,
  TEASER_CATEGORY_IDS,
  TEASER_DIFFICULTIES,
  TEASER_DIFFICULTY_LABELS,
  TEASERS,
  teaserUnitLabel,
  type Teaser,
  type TeaserCategory,
  type TeaserDifficulty,
} from "@/content/brain-teasers";
import { isWithinTolerance, parseNumericInput } from "@/lib/format";
import { actions, useHydrated, useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Chip, ProgressBar } from "@/components/ui/primitives";
import { useLang } from "@/components/i18n/LangProvider";
import type { Lang } from "@/lib/i18n";

const TEXT = {
  en: {
    solvedCount: (done: number, total: number) => `${done}/${total} solved`,
    categorySolved: (label: string) => `${label} solved`,
    allLevels: "All levels",
    hideSolved: "Hide solved",
    random: "Random teaser",
    empty: "Nothing left here. Clear a filter to see more teasers.",
    solved: "Solved",
    answerTo: (title: string) => `Your answer to ${title}`,
    yourAnswer: "Your answer",
    decimalNote: null as string | null,
    check: "Check",
    notQuite: "Not quite. Try again, or take a hint.",
    correct: "Correct: ",
    answer: "Answer: ",
    hint: "Hint",
    showSolution: "Show solution",
    markUnsolved: "Mark as unsolved",
    markSolved: "Mark as solved",
  },
  es: {
    solvedCount: (done: number, total: number) => `${done}/${total} resueltos`,
    categorySolved: (label: string) => `${label}: resueltos`,
    allLevels: "Todos los niveles",
    hideSolved: "Ocultar resueltos",
    random: "Brain teaser al azar",
    empty: "No queda nada aquí. Quita un filtro para ver más brain teasers.",
    solved: "Resuelto",
    answerTo: (title: string) => `Tu respuesta a ${title}`,
    yourAnswer: "Tu respuesta",
    decimalNote: "Usa el punto para decimales (p. ej. 2.5)" as string | null,
    check: "Comprobar",
    notQuite: "No exactamente. Vuelve a intentarlo o pide una pista.",
    correct: "Correcto: ",
    answer: "Respuesta: ",
    hint: "Pista",
    showSolution: "Ver solución",
    markUnsolved: "Marcar como no resuelto",
    markSolved: "Marcar como resuelto",
  },
} satisfies Record<Lang, Record<string, unknown>>;

const DIFF_TONE: Record<TeaserDifficulty, "success" | "neutral" | "outline"> = { Easy: "success", Medium: "neutral", Hard: "outline" };

export function BrainTeasers() {
  const state = useStore();
  const hydrated = useHydrated();
  const lang = useLang();
  const tx = TEXT[lang];
  const [category, setCategory] = useState<TeaserCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<TeaserDifficulty | "all">("all");
  const [hideSolved, setHideSolved] = useState(false);
  const [spotlight, setSpotlight] = useState<string | null>(null);

  const solved = useMemo(() => new Set(hydrated ? state.teasersSolved : []), [hydrated, state.teasersSolved]);
  const list = TEASERS.filter(
    (t) => (category === "all" || t.category === category) && (difficulty === "all" || t.difficulty === difficulty) && (!hideSolved || !solved.has(t.id)),
  );

  const random = () => {
    const pool = TEASERS.filter((t) => !solved.has(t.id));
    const pick = (pool.length ? pool : TEASERS)[Math.floor(Math.random() * (pool.length || TEASERS.length))];
    setCategory("all");
    setDifficulty("all");
    setHideSolved(false);
    setSpotlight(pick.id);
    requestAnimationFrame(() => document.getElementById(pick.id)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  return (
    <div className="space-y-8">
      {/* Categories */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEASER_CATEGORY_IDS.map((c) => {
          const items = TEASERS.filter((t) => t.category === c);
          const done = items.filter((t) => solved.has(t.id)).length;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(category === c ? "all" : c)}
              aria-pressed={category === c}
              className={cn(
                "rounded-2xl border bg-white p-4 text-left shadow-card transition-colors",
                category === c ? "border-navy ring-2 ring-navy/20" : "border-line hover:border-navy/40",
              )}
            >
              <p className="font-serif text-xl text-navy">{TEASER_CATEGORIES[c].label[lang]}</p>
              <p className="mt-0.5 text-sm text-ink-muted">{TEASER_CATEGORIES[c].blurb[lang]}</p>
              <ProgressBar value={items.length ? done / items.length : 0} className="mt-3" label={tx.categorySolved(TEASER_CATEGORIES[c].label[lang])} />
              <p className="mt-1 text-xs text-ink-muted">{tx.solvedCount(done, items.length)}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Chip active={difficulty === "all"} onClick={() => setDifficulty("all")}>
            {tx.allLevels}
          </Chip>
          {TEASER_DIFFICULTIES.map((d) => (
            <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
              {TEASER_DIFFICULTY_LABELS[d][lang]}
            </Chip>
          ))}
          <Chip active={hideSolved} onClick={() => setHideSolved((h) => !h)}>
            {tx.hideSolved}
          </Chip>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-ink-muted">{tx.solvedCount(solved.size, TEASERS.length)}</p>
          <Button variant="secondary" size="sm" onClick={random}>
            <Shuffle className="h-4 w-4" /> {tx.random}
          </Button>
        </div>
      </div>

      {/* Teasers */}
      {list.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((t) => (
            <TeaserCard key={t.id} teaser={t} solved={solved.has(t.id)} highlighted={spotlight === t.id} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-ink-muted">{tx.empty}</Card>
      )}
    </div>
  );
}

function TeaserCard({ teaser: t, solved, highlighted }: { teaser: Teaser; solved: boolean; highlighted: boolean }) {
  const lang = useLang();
  const tx = TEXT[lang];
  const [given, setGiven] = useState("");
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [hint, setHint] = useState(false);
  const [reveal, setReveal] = useState(false);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (!t.answer) return;
    const value = parseNumericInput(given);
    const right = value !== null && isWithinTolerance(value, t.answer.value, t.answer.tolerance);
    setResult(right ? "right" : "wrong");
    if (right) {
      actions.setTeaserSolved(t.id, true);
      setReveal(true);
    }
  };

  return (
    <Card id={t.id} className={cn("flex scroll-mt-28 flex-col p-5 sm:p-6", highlighted && "ring-2 ring-electric", solved && "bg-success-soft/30")}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="outline">{TEASER_CATEGORIES[t.category].label[lang]}</Badge>
        <Badge tone={DIFF_TONE[t.difficulty]}>{TEASER_DIFFICULTY_LABELS[t.difficulty][lang]}</Badge>
        {solved && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-success-ink">
            <CircleCheck className="h-4 w-4" /> {tx.solved}
          </span>
        )}
      </div>
      <h3 className="mt-3 font-serif text-xl text-navy">{t.title[lang]}</h3>
      <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink">{t.prompt[lang]}</p>

      {t.answer && !reveal && (
        <form onSubmit={check} className="mt-4 flex flex-wrap items-center gap-2">
          <input
            value={given}
            onChange={(e) => {
              setGiven(e.target.value);
              setResult(null);
            }}
            inputMode="decimal"
            autoComplete="off"
            aria-label={tx.answerTo(t.title[lang])}
            placeholder={tx.yourAnswer}
            className="h-10 w-36 rounded-xl border border-line-strong bg-white px-3 text-sm text-navy outline-none focus:border-electric"
          />
          {t.answer.unit && <span className="text-sm text-ink-muted">{teaserUnitLabel(t.answer.unit, lang)}</span>}
          <Button type="submit" size="sm" disabled={!given.trim()}>
            {tx.check}
          </Button>
          {tx.decimalNote && <p className="w-full text-xs text-ink-muted">{tx.decimalNote}</p>}
        </form>
      )}
      {result === "wrong" && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-error-ink">
          <CircleX className="h-4 w-4" /> {tx.notQuite}
        </p>
      )}

      {hint && !reveal && (
        <p className="mt-3 flex gap-2 rounded-xl bg-warning-soft p-3 text-sm text-warning-ink">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" /> {t.hint[lang]}
        </p>
      )}

      {reveal && (
        <div className={cn("mt-4 rounded-xl p-4", result === "right" ? "bg-success-soft" : "bg-ice-soft/70")}>
          <p className={cn("flex items-center gap-1.5 font-semibold", result === "right" ? "text-success-ink" : "text-navy")}>
            {result === "right" && <CircleCheck className="h-4 w-4" />}
            {result === "right" ? tx.correct : tx.answer}
            {t.answerText[lang]}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">{t.solution[lang]}</p>
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {!reveal && !hint && (
          <Button variant="ghost" size="sm" onClick={() => setHint(true)}>
            <Lightbulb className="h-4 w-4" /> {tx.hint}
          </Button>
        )}
        {!reveal && (
          <Button variant="ghost" size="sm" onClick={() => setReveal(true)}>
            <Eye className="h-4 w-4" /> {tx.showSolution}
          </Button>
        )}
        {(!t.answer || reveal) && (
          <Button variant={solved ? "ghost" : "subtle"} size="sm" onClick={() => actions.setTeaserSolved(t.id, !solved)}>
            <CircleCheck className="h-4 w-4" /> {solved ? tx.markUnsolved : tx.markSolved}
          </Button>
        )}
      </div>
    </Card>
  );
}
