"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { getQuestion } from "@/content/questions";
import { useHydrated, useStore } from "@/lib/store";
import { fmtRelative } from "@/lib/format";
import { QuestionCard } from "./QuestionCard";
import { Button } from "@/components/ui/Button";
import { StudyTimer } from "@/components/learn/LessonClient";

export function SingleQuestion({ id }: { id: string }) {
  const q = getQuestion(id)!;
  const state = useStore();
  const hydrated = useHydrated();
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const history = useMemo(() => state.attempts.filter((a) => a.qid === id).slice(-5).reverse(), [state, id]);

  return (
    <div className="space-y-4">
      <StudyTimer />
      <QuestionCard key={round} question={q} source="practice" onAnswered={() => setDone(true)} />
      {done && (
        <Button
          variant="ghost"
          onClick={() => {
            setRound((r) => r + 1);
            setDone(false);
          }}
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
      )}
      {hydrated && history.length > 0 && (
        <div className="rounded-2xl border border-line bg-white p-4 text-sm">
          <p className="font-semibold text-navy">Your history with this question</p>
          <ul className="mt-2 space-y-1 text-ink-muted">
            {history.map((a) => (
              <li key={a.at}>
                {fmtRelative(a.at)}:{" "}
                <span className={a.result === "correct" ? "text-success-ink" : a.result === "incorrect" ? "text-error-ink" : "text-navy"}>
                  {a.result === "self" ? `self-assessed (${Math.round((a.selfScore ?? 0) * 100)}% of key points)` : a.result}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
