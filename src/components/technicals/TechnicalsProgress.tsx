"use client";

import { useMemo } from "react";
import { COURSES } from "@/content/courses";
import { QUESTIONS } from "@/content/questions";
import { useHydrated, useStore } from "@/lib/store";
import { courseProgress, latestAttempts } from "@/lib/progress";
import { challengeProgress } from "@/lib/challenge";
import { MOCK_LEVELS } from "@/content/mock-interview";
import { mockLevelsPassed } from "@/lib/mock-interview";
import { useLang } from "@/components/i18n/LangProvider";

const TEXT = {
  en: {
    lessons: (done: number, total: number) => `${done}/${total} lessons complete`,
    questions: (n: number, total: number) => `${n}/${total} questions answered`,
    challenge: (n: number, total: number, missed: number) => `${n}/${total} · ${missed} to repeat`,
    levels: (n: number, total: number) => `${n}/${total} levels passed`,
  },
  es: {
    lessons: (done: number, total: number) => `${done}/${total} lecciones completadas`,
    questions: (n: number, total: number) => `${n}/${total} preguntas respondidas`,
    challenge: (n: number, total: number, missed: number) => `${n}/${total} · ${missed} por repetir`,
    levels: (n: number, total: number) => `${n}/${total} niveles superados`,
  },
};

/** One line of live progress for each Technicals area, shown on the hub cards. */
export function TechnicalsProgress({ area }: { area: "learn" | "practice" | "challenge" | "interview" }) {
  const state = useStore();
  const hydrated = useHydrated();
  const tx = TEXT[useLang()];
  const text = useMemo(() => {
    if (area === "learn") {
      const done = COURSES.reduce((s, c) => s + courseProgress(state, c).completed, 0);
      const total = COURSES.reduce((s, c) => s + c.lessons.length, 0);
      return { value: total ? done / total : 0, label: tx.lessons(done, total) };
    }
    if (area === "practice") {
      const bank = new Set(QUESTIONS.map((q) => q.id));
      const answered = [...latestAttempts(state).keys()].filter((id) => bank.has(id)).length;
      return { value: QUESTIONS.length ? answered / QUESTIONS.length : 0, label: tx.questions(answered, QUESTIONS.length) };
    }
    if (area === "challenge") {
      const p = challengeProgress(state.challenge);
      return { value: p.total ? p.answered / p.total : 0, label: tx.challenge(p.answered, p.total, p.missed.length) };
    }
    const passed = mockLevelsPassed(state.mock);
    return { value: passed / MOCK_LEVELS.length, label: tx.levels(passed, MOCK_LEVELS.length) };
  }, [area, state, tx]);

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
