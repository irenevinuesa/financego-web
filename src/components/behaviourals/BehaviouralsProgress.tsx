"use client";

import { useMemo } from "react";
import { BEHAVIOURAL_QUESTIONS, BQ_CATEGORY_IDS } from "@/content/behaviourals/questions";
import { useHydrated, useStore } from "@/lib/store";

/** One line of live progress for each Behaviourals area, shown on the hub cards. */
export function BehaviouralsProgress({ area }: { area: "guide" | "questions" | "stories" | "interview" }) {
  const state = useStore();
  const hydrated = useHydrated();
  const text = useMemo(() => {
    const covered = new Set(state.stories.flatMap((s) => s.categories));
    if (area === "guide") return null;
    if (area === "questions") {
      const n = BQ_CATEGORY_IDS.filter((c) => covered.has(c)).length;
      return { value: n / BQ_CATEGORY_IDS.length, label: `${n}/${BQ_CATEGORY_IDS.length} categories covered by your stories · ${BEHAVIOURAL_QUESTIONS.length} questions` };
    }
    if (area === "stories") {
      const n = state.stories.length;
      return { value: Math.min(1, n / 8), label: `${n} stor${n === 1 ? "y" : "ies"} saved · aim for 6–8` };
    }
    const n = state.interviews.filter((r) => r.format === "behavioral").length;
    return { value: Math.min(1, n / 5), label: `${n} behavioural mock interview${n === 1 ? "" : "s"} done` };
  }, [area, state]);

  if (!text) return null;
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
