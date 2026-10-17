"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CircleCheck, CircleDot, CircleX, RotateCcw } from "lucide-react";
import { QUESTIONS, QUESTION_TYPE_LABELS, type QuestionTypeFilter } from "@/content/questions";
import { DIFFICULTIES, TOPICS, TOPIC_IDS, TRACKS, TRACK_IDS } from "@/content/taxonomy";
import type { Difficulty, TopicId, TrackId } from "@/content/types";
import { useHydrated, useStore } from "@/lib/store";
import { latestAttempts } from "@/lib/progress";
import { applyFilters, type BankFilters } from "@/lib/practice";
import { buttonClasses } from "@/components/ui/Button";
import { Badge, Chip, DifficultyBadge, EmptyState, Select } from "@/components/ui/primitives";

function toQuery(f: BankFilters) {
  const p = new URLSearchParams({ mode: "custom" });
  Object.entries(f).forEach(([k, v]) => {
    if (v !== "" && v !== undefined && v !== 0) p.set(k, String(v));
  });
  return p.toString();
}

export function PracticeBank() {
  const state = useStore();
  const hydrated = useHydrated();
  const latest = useMemo(() => latestAttempts(state), [state]);
  const [f, setF] = useState<BankFilters>({ topic: "", difficulty: "", type: "", track: "", maxMinutes: 0, status: "" });
  const set = <K extends keyof BankFilters>(k: K, v: BankFilters[K]) => setF((p) => ({ ...p, [k]: v }));
  const list = useMemo(() => applyFilters(QUESTIONS, f, hydrated ? latest : new Map()), [f, latest, hydrated]);
  const active = Object.values(f).some((v) => v !== "" && v !== 0);

  return (
    <div>
      <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={f.topic} onChange={(e) => set("topic", e.target.value as TopicId | "")} aria-label="Topic">
            <option value="">All topics</option>
            {TOPIC_IDS.map((t) => (
              <option key={t} value={t}>
                {TOPICS[t].label}
              </option>
            ))}
          </Select>
          <Select value={f.type} onChange={(e) => set("type", e.target.value as QuestionTypeFilter | "")} aria-label="Question type">
            <option value="">All question types</option>
            {(Object.keys(QUESTION_TYPE_LABELS) as QuestionTypeFilter[]).map((t) => (
              <option key={t} value={t}>
                {QUESTION_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
          <Select value={f.track} onChange={(e) => set("track", e.target.value as TrackId | "")} aria-label="Career track">
            <option value="">All career tracks</option>
            {TRACK_IDS.map((t) => (
              <option key={t} value={t}>
                {TRACKS[t].label}
              </option>
            ))}
          </Select>
          <Select value={String(f.maxMinutes ?? 0)} onChange={(e) => set("maxMinutes", Number(e.target.value))} aria-label="Estimated time">
            <option value="0">Any length</option>
            <option value="1">1 minute or less</option>
            <option value="2">2 minutes or less</option>
            <option value="4">4 minutes or less</option>
          </Select>
          <Select value={f.status} onChange={(e) => set("status", e.target.value as BankFilters["status"])} aria-label="Status">
            <option value="">All statuses</option>
            <option value="unanswered">Unanswered</option>
            <option value="completed">Answered before</option>
            <option value="incorrect">Previously incorrect</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Chip active={!f.difficulty} onClick={() => set("difficulty", "")}>
            All levels
          </Chip>
          {DIFFICULTIES.map((d) => (
            <Chip key={d} active={f.difficulty === d} onClick={() => set("difficulty", d as Difficulty)}>
              {d}
            </Chip>
          ))}
          {active && (
            <button type="button" onClick={() => setF({ topic: "", difficulty: "", type: "", track: "", maxMinutes: 0, status: "" })} className="ml-auto inline-flex items-center gap-1 text-sm text-ink-muted hover:text-electric">
              <RotateCcw className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {list.length} question{list.length === 1 ? "" : "s"}
          {active ? " match your filters" : " in the bank"}
        </p>
        {list.length > 0 && (
          <Link href={`/practice/session/?${toQuery(f)}`} className={buttonClasses("primary", "sm")}>
            Practise {Math.min(list.length, 20)} of these <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {list.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No questions match">Loosen a filter. For example, “Previously incorrect” only shows questions you have answered wrongly.</EmptyState>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {list.map((q) => {
            const a = hydrated ? latest.get(q.id) : undefined;
            return (
              <li key={q.id}>
                <Link href={`/practice/q/${q.id}/`} className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-cream/70 sm:px-5">
                  <span className="mt-0.5 shrink-0" title={a ? (a.result === "correct" ? "Last answer correct" : a.result === "incorrect" ? "Last answer incorrect" : "Self-assessed") : "Not answered yet"}>
                    {a?.result === "correct" ? (
                      <CircleCheck className="h-5 w-5 text-success" />
                    ) : a?.result === "incorrect" ? (
                      <CircleX className="h-5 w-5 text-error" />
                    ) : a ? (
                      <CircleDot className="h-5 w-5 text-electric" />
                    ) : (
                      <span className="block h-5 w-5 rounded-full border-2 border-line-strong" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium text-navy">{q.prompt}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge tone="blue">{TOPICS[q.topic].label}</Badge>
                      <Badge tone="outline">{q.kinds?.includes("trap") ? "Interview trap" : QUESTION_TYPE_LABELS[q.format]}</Badge>
                      <DifficultyBadge level={q.difficulty} />
                      <span className="text-xs text-ink-muted">~{q.minutes} min</span>
                    </span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-muted" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
