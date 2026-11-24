"use client";

import Link from "@/components/i18n/Link";
import { useMemo } from "react";
import { ArrowRight, Flame, MessagesSquare, Target, Trophy } from "lucide-react";
import { COURSES, lessonHref } from "@/content/courses";
import { questionOfTheDay } from "@/content/questions";
import { localDate, useHydrated, useStore } from "@/lib/store";
import { courseProgress, hasAnyProgress, nextLesson, practiceStats, streak } from "@/lib/progress";
import { challengeProgress } from "@/lib/challenge";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card, ProgressBar } from "@/components/ui/primitives";
import { useLang } from "@/components/i18n/LangProvider";
import { LOCALES, type Lang } from "@/lib/i18n";

const TEXT = {
  en: {
    loadingQuestion: "Loading today's question",
    yourProgress: "Your progress",
    startTracking: "Start tracking. No sign-up needed.",
    startTrackingBody:
      "Complete a lesson or answer a question and FinanceGo starts building your dashboard: courses in progress, accuracy by section, your 500 Challenge progress and your interview stories. Everything is saved privately in this browser.",
    startFirstLesson: "Start your first lesson",
    startChallenge: "Start the 500 Challenge",
    v2: "{tx.v2}",
    features: ["Courses in progress", "Questions answered and accuracy", "500 Challenge progress", "Behavioural story bank", "Recommended next lesson"],
    recommended: "Recommended next lesson",
    continueLearning: "Continue learning",
    startLesson: "Start lesson",
    progressOf: (title: string) => `${title} progress`,
    lessons: "lessons",
    questionsAnswered: "Questions answered",
    noGraded: "No graded answers yet",
    accuracy: (pct: number) => `${pct}% accuracy`,
    streak: "Learning streak",
    days: (n: number) => `${n} day${n === 1 ? "" : "s"}`,
    best: "Best",
    challengeProgress: "500 Challenge progress",
    toRepeat: (n: number) => `${n} to repeat`,
    correct: (pct: number) => `${pct}% correct`,
    continue: "Continue",
    start: "Start",
    interviewPrep: "Interview prep",
  },
  es: {
    loadingQuestion: "Cargando la pregunta de hoy",
    yourProgress: "Tu progreso",
    startTracking: "Empieza a registrar tu progreso. Sin registro.",
    startTrackingBody:
      "Completa una lección o responde una pregunta y FinanceGo empezará a crear tu Dashboard: cursos en curso, acierto por sección, tu progreso en el 500 Challenge y tus historias para entrevistas. Todo se guarda de forma privada en este navegador.",
    startFirstLesson: "Empieza tu primera lección",
    startChallenge: "Empieza el 500 Challenge",
    v2: "Las cuentas con sincronización entre dispositivos están previstas para la versión 2.",
    features: ["Cursos en curso", "Preguntas respondidas y porcentaje de acierto", "Progreso en el 500 Challenge", "Banco de historias para Behaviourals", "Próxima lección recomendada"],
    recommended: "Próxima lección recomendada",
    continueLearning: "Seguir aprendiendo",
    startLesson: "Empezar lección",
    progressOf: (title: string) => `Progreso de ${title}`,
    lessons: "lecciones",
    questionsAnswered: "Preguntas respondidas",
    noGraded: "Aún no hay respuestas corregidas",
    accuracy: (pct: number) => `${pct}% de acierto`,
    streak: "Racha de estudio",
    days: (n: number) => `${n} día${n === 1 ? "" : "s"}`,
    best: "Mejor",
    challengeProgress: "Progreso en el 500 Challenge",
    toRepeat: (n: number) => `${n} por repetir`,
    correct: (pct: number) => `${pct}% correctas`,
    continue: "Continuar",
    start: "Empezar",
    interviewPrep: "Interview Preparation",
  },
} satisfies Record<Lang, unknown>;

/** Today's local calendar date (YYYY-MM-DD), written out in the page language. */
function longDate(day: string, lang: Lang) {
  const d = new Date(`${day}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(LOCALES[lang], { weekday: "long", day: "numeric", month: "long" });
}

export function QuestionOfTheDay() {
  const hydrated = useHydrated();
  const today = hydrated ? localDate() : "";
  const q = useMemo(() => (today ? questionOfTheDay(today) : null), [today]);
  const lang = useLang();
  if (!q) {
    return <div className="h-72 animate-pulse rounded-2xl border border-line bg-white" aria-label={TEXT[lang].loadingQuestion} />;
  }
  return (
    <div>
      <p className="mb-3 text-sm text-ink-muted">{longDate(today, lang)}</p>
      <QuestionCard key={q.id} question={q} source="qotd" />
    </div>
  );
}

export function ProgressPreview() {
  const state = useStore();
  const hydrated = useHydrated();
  const lang = useLang();
  const tx = TEXT[lang];
  const derived = useMemo(() => {
    const stats = practiceStats(state);
    const inProgress = COURSES.map((c) => ({ c, p: courseProgress(state, c) })).filter((x) => x.p.started && x.p.pct < 1);
    return { stats, inProgress, streak: streak(state), challenge: challengeProgress(state.challenge), next: nextLesson(state) };
  }, [state]);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-3xl bg-white/60" />;

  if (!hasAnyProgress(state)) {
    return (
      <Card className="grid gap-6 overflow-hidden p-6 sm:p-8 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div>
          <p className="eyebrow mb-2">{tx.yourProgress}</p>
          <h3 className="font-serif text-3xl leading-tight">{tx.startTracking}</h3>
          <p className="mt-3 text-ink-muted">{tx.startTrackingBody}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={lessonHref(derived.next.course.id, derived.next.lesson.id)}>
              {tx.startFirstLesson} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/challenge/" variant="secondary">
              {tx.startChallenge}
            </ButtonLink>
          </div>
          <p className="mt-4 text-xs text-ink-muted">{tx.v2}</p>
        </div>
        <ul className="space-y-3 text-sm">
          {tx.features.map((t) => (
            <li key={t} className="flex items-center gap-3 rounded-xl bg-cream/70 px-4 py-3 text-ink">
              <span className="h-2 w-2 rounded-full bg-electric" /> {t}
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  const { stats, inProgress, challenge, next } = derived;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        <p className="eyebrow mb-2">{tx.recommended}</p>
        <h3 className="font-serif text-2xl">{next.lesson.title}</h3>
        <p className="mt-1 text-sm text-ink-muted">
          {next.course.title} · {next.lesson.minutes} min
        </p>
        <p className="mt-3 text-sm text-ink">{next.lesson.summary}</p>
        <ButtonLink href={lessonHref(next.course.id, next.lesson.id)} className="mt-5">
          {next.resume ? tx.continueLearning : tx.startLesson} <ArrowRight className="h-4 w-4" />
        </ButtonLink>
        {inProgress.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {inProgress.slice(0, 2).map(({ c, p }) => (
              <Link key={c.id} href={`/learn/${c.id}/`} className="rounded-xl border border-line p-3 hover:border-electric">
                <p className="text-sm font-medium text-navy">{c.title}</p>
                <ProgressBar value={p.pct} className="mt-2" label={tx.progressOf(c.title)} />
                <p className="mt-1 text-xs text-ink-muted">
                  {p.completed}/{p.total} {tx.lessons}
                </p>
              </Link>
            ))}
          </div>
        )}
      </Card>
      <div className="grid gap-4">
        <Card className="grid grid-cols-2 gap-4 p-5">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Target className="h-3.5 w-3.5" /> {tx.questionsAnswered}
            </p>
            <p className="mt-1 text-2xl font-semibold text-navy">{stats.attempted}</p>
            <p className="text-xs text-ink-muted">{stats.accuracy === null ? tx.noGraded : tx.accuracy(Math.round(stats.accuracy * 100))}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Flame className="h-3.5 w-3.5" /> {tx.streak}
            </p>
            <p className="mt-1 text-2xl font-semibold text-navy">
              {tx.days(derived.streak.current)}
            </p>
            <p className="text-xs text-ink-muted">{tx.best}: {derived.streak.best}</p>
          </div>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
            <Trophy className="h-4 w-4 text-electric" /> 500 Challenge
          </p>
          <p className="mt-2 text-2xl font-semibold text-navy">
            {challenge.answered}
            <span className="text-base font-normal text-ink-muted">/{challenge.total}</span>
          </p>
          <ProgressBar value={challenge.total ? challenge.answered / challenge.total : 0} className="mt-2" label={tx.challengeProgress} />
          <p className="mt-1.5 text-xs text-ink-muted">
            {tx.toRepeat(challenge.missed.length)}
            {challenge.accuracy === null ? "" : ` · ${tx.correct(Math.round(challenge.accuracy * 100))}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <Link href={challenge.done ? "/challenge/" : "/challenge/play/"} className="inline-flex items-center gap-1 text-sm font-medium text-electric hover:underline">
              {challenge.answered ? tx.continue : tx.start} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/practice/session/?mode=interview" className="inline-flex items-center gap-1 text-sm font-medium text-electric hover:underline">
              <MessagesSquare className="h-3.5 w-3.5" /> {tx.interviewPrep}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
