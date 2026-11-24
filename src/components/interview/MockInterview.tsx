"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, CircleCheck, CircleX, Clock, Lock, RotateCcw, Timer, Trophy } from "lucide-react";
import { MOCK_LEVELS, mockUnitLabel, type MockLevel, type MockQuestion } from "@/content/mock-interview";
import { gradeMock, isMockLevelUnlocked, MOCK_PASS_MARK, mockTimeRange } from "@/lib/mock-interview";
import { actions, useHydrated, useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Badge, Card, ProgressBar } from "@/components/ui/primitives";
import { useLang } from "@/components/i18n/LangProvider";
import type { Lang } from "@/lib/i18n";

const TEXT = {
  en: {
    level: (n: number) => `Level ${n}`,
    passed: "Passed",
    questionsEach: (count: number, min: number, max: number) => `${count} questions · ${min}–${max} seconds each`,
    bestLast: (best: number, last: number, attempts: number) => `Best ${best}/10 · last ${last}/10 · ${attempts} attempt${attempts === 1 ? "" : "s"}`,
    playAgain: "Play again",
    start: "Start",
    toUnlock: (mark: number, prev: number) => `Score ${mark}/10 in level ${prev} to unlock.`,
    questionOf: (i: number, total: number) => `Question ${i} of ${total}`,
    correctSoFar: (n: number) => `${n} correct so far`,
    quit: "Quit",
    progress: "Mock interview progress",
    interviewer: "Interviewer",
    yourAnswer: "Your answer",
    decimalNote: null as string | null,
    submit: "Submit",
    correct: "Correct",
    timesUp: (a: string) => `Time's up. The answer is ${a}`,
    wrong: (a: string) => `Wrong. The answer is ${a}`,
    seeScore: "See your score",
    nextQuestion: "Next question",
    passedNext: (n: number) => `Passed. Level ${n} is unlocked.`,
    passedAll: "Passed. You have cleared every level.",
    needToPass: (mark: number) => `You need ${mark}/10 to pass. Try again.`,
    startLevel: (n: number) => `Start level ${n}`,
    retryLevel: (n: number) => `Retry level ${n}`,
    allLevels: "All levels",
    answerLine: (a: string) => `Answer ${a}`,
    ranOut: "ran out of time",
    youSaid: (g: string) => `you said ${g}`,
  },
  es: {
    level: (n: number) => `Nivel ${n}`,
    passed: "Superado",
    questionsEach: (count: number, min: number, max: number) => `${count} preguntas · ${min}–${max} segundos cada una`,
    bestLast: (best: number, last: number, attempts: number) => `Mejor ${best}/10 · último ${last}/10 · ${attempts} intento${attempts === 1 ? "" : "s"}`,
    playAgain: "Jugar otra vez",
    start: "Empezar",
    toUnlock: (mark: number, prev: number) => `Saca ${mark}/10 en el nivel ${prev} para desbloquearlo.`,
    questionOf: (i: number, total: number) => `Pregunta ${i} de ${total}`,
    correctSoFar: (n: number) => `${n} correcta${n === 1 ? "" : "s"} hasta ahora`,
    quit: "Salir",
    progress: "Progreso del Mock interview",
    interviewer: "Entrevistador",
    yourAnswer: "Tu respuesta",
    decimalNote: "Usa el punto para decimales (p. ej. 2.5)" as string | null,
    submit: "Enviar",
    correct: "Correcto",
    timesUp: (a: string) => `Se acabó el tiempo. La respuesta es ${a}`,
    wrong: (a: string) => `Incorrecto. La respuesta es ${a}`,
    seeScore: "Ver tu puntuación",
    nextQuestion: "Siguiente pregunta",
    passedNext: (n: number) => `Superado. El nivel ${n} está desbloqueado.`,
    passedAll: "Superado. Has completado todos los niveles.",
    needToPass: (mark: number) => `Necesitas ${mark}/10 para superarlo. Inténtalo de nuevo.`,
    startLevel: (n: number) => `Empezar el nivel ${n}`,
    retryLevel: (n: number) => `Repetir el nivel ${n}`,
    allLevels: "Todos los niveles",
    answerLine: (a: string) => `Respuesta ${a}`,
    ranOut: "se acabó el tiempo",
    youSaid: (g: string) => `respondiste ${g}`,
  },
} satisfies Record<Lang, Record<string, unknown>>;

interface Answer {
  question: MockQuestion;
  given: string;
  correct: boolean;
  timedOut: boolean;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const fmtAnswer = (q: MockQuestion, lang: Lang) => {
  const n = q.answer.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (q.unit === "$" || q.unit === "€") return `${q.unit}${n}`;
  if (q.unit === "%" || q.unit === "x") return `${n}${q.unit}`;
  return q.unit ? `${n} ${mockUnitLabel(q.unit, lang)}` : n;
};

/** Level picker, then a timed run of 10 numeric questions, then the score. */
export function MockInterview() {
  const state = useStore();
  const hydrated = useHydrated();
  const lang = useLang();
  const tx = TEXT[lang];
  const [run, setRun] = useState<{ id: number; level: MockLevel; order: MockQuestion[] } | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const start = (level: MockLevel) => {
    setAnswers([]);
    setRun((r) => ({ id: (r?.id ?? 0) + 1, level, order: shuffle(level.questions) }));
  };

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />;

  if (run && answers.length === run.order.length) {
    return <Results level={run.level} answers={answers} onRetry={() => start(run.level)} onNext={(l) => start(l)} onExit={() => setRun(null)} />;
  }

  if (run) {
    return (
      <Run
        key={run.id}
        level={run.level}
        order={run.order}
        onDone={(a) => {
          actions.recordMockRun(run.level.level, a.filter((x) => x.correct).length);
          setAnswers(a);
        }}
        onExit={() => setRun(null)}
      />
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {MOCK_LEVELS.map((l) => {
        const unlocked = isMockLevelUnlocked(state.mock, l.level);
        const result = state.mock[String(l.level)];
        const passed = (result?.best ?? 0) >= MOCK_PASS_MARK;
        const [min, max] = mockTimeRange(l.level);
        return (
          <Card key={l.level} className={cn("flex flex-col p-6", !unlocked && "opacity-60")}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{tx.level(l.level)}</p>
              {passed ? <Badge tone="success">{tx.passed}</Badge> : !unlocked ? <Lock className="h-4 w-4 text-ink-muted" /> : null}
            </div>
            <h2 className="mt-2 font-serif text-2xl text-navy">{l.title[lang]}</h2>
            <p className="mt-1 text-sm text-ink">{l.blurb[lang]}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
              <Clock className="h-3.5 w-3.5" /> {tx.questionsEach(l.questions.length, min, max)}
            </p>
            {result && (
              <p className="mt-1 text-xs text-ink-muted">{tx.bestLast(result.best, result.last, result.attempts)}</p>
            )}
            <div className="mt-auto pt-5">
              {unlocked ? (
                <Button onClick={() => start(l)}>
                  {result ? tx.playAgain : tx.start} <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <p className="text-sm text-ink-muted">{tx.toUnlock(MOCK_PASS_MARK, l.level - 1)}</p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Run({ level, order, onDone, onExit }: { level: MockLevel; order: MockQuestion[]; onDone: (a: Answer[]) => void; onExit: () => void }) {
  const lang = useLang();
  const tx = TEXT[lang];
  const [index, setIndex] = useState(0);
  const [given, setGiven] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [deadline, setDeadline] = useState(() => Date.now() + order[0].seconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const question = order[index];
  const current = answers[index];
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));

  const submit = useCallback(
    (timedOut: boolean) => {
      if (answers[index]) return;
      const correct = !timedOut && gradeMock(question, given);
      setAnswers((a) => [...a, { question, given: timedOut ? "" : given, correct, timedOut }]);
    },
    [answers, index, question, given],
  );

  // Tick while the question is open; run out of time = wrong.
  useEffect(() => {
    if (current) return;
    const t = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(t);
  }, [current]);

  useEffect(() => {
    if (!current && now >= deadline) submit(true);
  }, [now, deadline, current, submit]);

  useEffect(() => {
    if (current) nextRef.current?.focus();
    else inputRef.current?.focus();
  }, [current, index]);

  const next = () => {
    if (index + 1 >= order.length) {
      onDone(answers);
      return;
    }
    setIndex(index + 1);
    setGiven("");
    const t = Date.now();
    setNow(t);
    setDeadline(t + order[index + 1].seconds * 1000);
  };

  const frac = remaining / question.seconds;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-navy">{tx.questionOf(index + 1, order.length)}</p>
            <p className="text-xs text-ink-muted">
              {tx.level(level.level)}: {level.title[lang]} · {tx.correctSoFar(answers.filter((a) => a.correct).length)}
            </p>
          </div>
          <button type="button" onClick={onExit} className="text-sm font-medium text-navy hover:underline">
            {tx.quit}
          </button>
        </div>
        <ProgressBar value={answers.length / order.length} className="mt-3" label={tx.progress} />
      </Card>

      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">{tx.interviewer}</p>
          <p
            className={cn(
              "flex items-center gap-1.5 font-mono text-lg font-semibold tabular-nums",
              current ? "text-ink-muted" : frac <= 0.25 ? "text-error-ink" : "text-navy",
            )}
            aria-live="off"
          >
            <Timer className="h-5 w-5" /> {current ? "—" : `${remaining}s`}
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ice-soft">
          <div
            className={cn("h-full rounded-full transition-[width] duration-200 ease-linear", frac <= 0.25 ? "bg-error" : "bg-navy")}
            style={{ width: `${current ? 0 : frac * 100}%` }}
          />
        </div>

        <p className="mt-5 text-lg font-medium leading-snug text-navy sm:text-xl">{question.prompt[lang]}</p>

        <form
          className="mt-5 flex flex-wrap items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!current && given.trim()) submit(false);
          }}
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={given}
              onChange={(e) => setGiven(e.target.value)}
              disabled={Boolean(current)}
              inputMode="decimal"
              autoComplete="off"
              aria-label={tx.yourAnswer}
              placeholder={tx.yourAnswer}
              className="h-11 w-44 rounded-xl border border-line-strong bg-white px-3 text-base text-navy outline-none focus:border-electric disabled:bg-cream"
            />
            {question.unit && <span className="text-sm text-ink-muted">{mockUnitLabel(question.unit, lang)}</span>}
          </div>
          {!current && (
            <Button type="submit" disabled={!given.trim()}>
              {tx.submit}
            </Button>
          )}
        </form>
        {!current && tx.decimalNote && <p className="mt-2 text-xs text-ink-muted">{tx.decimalNote}</p>}

        {current && (
          <div className={cn("mt-5 rounded-2xl p-4", current.correct ? "bg-success-soft" : "bg-error-soft")}>
            <p className={cn("flex items-center gap-2 font-semibold", current.correct ? "text-success-ink" : "text-error-ink")}>
              {current.correct ? <CircleCheck className="h-5 w-5" /> : <CircleX className="h-5 w-5" />}
              {current.correct ? tx.correct : current.timedOut ? tx.timesUp(fmtAnswer(question, lang)) : tx.wrong(fmtAnswer(question, lang))}
            </p>
            <p className="mt-1.5 text-sm text-ink">{question.explanation[lang]}</p>
          </div>
        )}
      </Card>

      {current && (
        <div className="flex justify-end">
          <Button ref={nextRef} onClick={next}>
            {index + 1 >= order.length ? tx.seeScore : tx.nextQuestion} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function Results({
  level,
  answers,
  onRetry,
  onNext,
  onExit,
}: {
  level: MockLevel;
  answers: Answer[];
  onRetry: () => void;
  onNext: (l: MockLevel) => void;
  onExit: () => void;
}) {
  const lang = useLang();
  const tx = TEXT[lang];
  const score = answers.filter((a) => a.correct).length;
  const passed = score >= MOCK_PASS_MARK;
  const nextLevel = MOCK_LEVELS.find((l) => l.level === level.level + 1);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="p-8 text-center">
        <Trophy className={cn("mx-auto h-10 w-10", passed ? "text-navy" : "text-ink-muted")} />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {tx.level(level.level)}: {level.title[lang]}
        </p>
        <h2 className="mt-1 font-serif text-4xl text-navy">{score}/10</h2>
        <p className="mt-2 text-ink-muted">
          {passed
            ? nextLevel
              ? tx.passedNext(nextLevel.level)
              : tx.passedAll
            : tx.needToPass(MOCK_PASS_MARK)}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {passed && nextLevel ? (
            <Button onClick={() => onNext(nextLevel)}>
              {tx.startLevel(nextLevel.level)} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : null}
          <Button variant={passed && nextLevel ? "secondary" : "primary"} onClick={onRetry}>
            <RotateCcw className="h-4 w-4" /> {tx.retryLevel(level.level)}
          </Button>
          <Button variant="ghost" onClick={onExit}>
            {tx.allLevels}
          </Button>
        </div>
      </Card>

      <Card className="divide-y divide-line">
        {answers.map((a, i) => (
          <div key={a.question.id} className="flex items-start gap-3 p-4">
            {a.correct ? <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" /> : <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-error" />}
            <div className="min-w-0">
              <p className="text-sm font-medium text-navy">
                {i + 1}. {a.question.prompt[lang]}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {tx.answerLine(fmtAnswer(a.question, lang))} · {a.timedOut ? tx.ranOut : tx.youSaid(a.given)}
              </p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
