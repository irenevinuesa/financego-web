"use client";

import { useMemo } from "react";
import { COURSES } from "@/content/courses";
import { QUESTIONS } from "@/content/questions";
import { useHydrated, useStore } from "@/lib/store";
import { courseProgress, latestAttempts } from "@/lib/progress";
import { challengeProgress } from "@/lib/challenge";

/** One line of live progress for each Technicals area, shown on the hub cards. */
export function TechnicalsProgress({ area }: { area: "learn" | "practice" | "challenge" | "interview" }) {
  const state = useStore();
  const hydrated = useHydrated();
  const text = useMemo(() => {
    if (area === "learn") {
      const done = COURSES.reduce((s, c) => s + courseProgress(state, c).completed, 0);
      const total = COURSES.reduce((s, c) => s + c.lessons.length, 0);
      return { value: total ? done / total : 0, label: `${done}/${total} lessons complete` };
    }
    if (area === "practice") {
      const bank = new Set(QUESTIONS.map((q) => q.id));
      const answered = [...latestAttempts(state).keys()].filter((id) => bank.has(id)).length;
      return { value: QUESTIONS.length ? answered / QUESTIONS.length : 0, label: `${answered}/${QUESTIONS.length} questions answered` };
    }
    if (area === "challenge") {
      const p = challengeProgress(state.challenge);
      return { value: p.total ? p.answered / p.total : 0, label: `${p.answered}/${p.total} · ${p.missed.length} to repeat` };
    }
    const n = state.interviews.filter((r) => r.format !== "behavioral").length;
    return { value: Math.min(1, n / 5), label: `${n} technical mock interview${n === 1 ? "" : "s"} done` };
  }, [area, state]);

  if (!hydrated) return <div className="mt-4 h-6" />;
  return (
    <div className="mt-4">
      <div className="h-1.5 overflow-hidden rounded-full bg-ice-soft">
        <div className="h-full rounded-full bg-navy transition-[width] duration-500" style={{ width: `${text.value * 100}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-ink-muted">{text.label}</p>
    </div>
  );
}
