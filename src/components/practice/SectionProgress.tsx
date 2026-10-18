"use client";

import { useMemo } from "react";
import { QUESTIONS } from "@/content/questions";
import { useHydrated, useStore } from "@/lib/store";
import { latestAttempts } from "@/lib/progress";
import { ProgressBar } from "@/components/ui/primitives";

/** How much of a section the learner has answered, and how accurately (latest answer per question). */
export function useSectionStats(topic: string) {
  const state = useStore();
  return useMemo(() => {
    const ids = new Set(QUESTIONS.filter((q) => q.topic === topic).map((q) => q.id));
    const latest = [...latestAttempts(state).values()].filter((a) => ids.has(a.qid));
    const graded = latest.filter((a) => a.result !== "self");
    const correct = graded.filter((a) => a.result === "correct").length;
    return {
      total: ids.size,
      answered: latest.length,
      accuracy: graded.length ? correct / graded.length : null,
      missed: graded.length - correct,
    };
  }, [state, topic]);
}

export function SectionProgress({ topic, variant = "card" }: { topic: string; variant?: "card" | "full" }) {
  const hydrated = useHydrated();
  const s = useSectionStats(topic);
  if (!hydrated) return <div className="mt-3 h-6" />;
  if (variant === "card") {
    return (
      <div className="mt-4">
        <ProgressBar value={s.total ? s.answered / s.total : 0} label="Section progress" />
        <p className="mt-1.5 flex justify-between text-xs text-ink-muted">
          <span>
            {s.answered}/{s.total} answered
          </span>
          <span>{s.accuracy === null ? "" : `${Math.round(s.accuracy * 100)}% correct`}</span>
        </p>
      </div>
    );
  }
  return (
    <dl className="grid grid-cols-3 gap-3">
      {[
        ["Answered", `${s.answered}/${s.total}`],
        ["Accuracy", s.accuracy === null ? "—" : `${Math.round(s.accuracy * 100)}%`],
        ["To repeat", String(s.missed)],
      ].map(([k, v]) => (
        <div key={k} className="rounded-xl bg-ice-soft px-3 py-2.5">
          <dt className="text-xs text-ink-muted">{k}</dt>
          <dd className="mt-0.5 text-xl font-semibold text-navy">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
