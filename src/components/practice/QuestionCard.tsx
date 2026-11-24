"use client";

import Link from "@/components/i18n/Link";
import { useRef, useState } from "react";
import { ArrowRight, BookOpen, Check, CircleCheck, CircleX, Lightbulb, MessageSquare, TriangleAlert } from "lucide-react";
import type { Question, QuestionStep } from "@/content/types";
import { getCourse, lessonHref } from "@/content/courses";
import { TOPICS } from "@/content/taxonomy";
import { QUESTION_TYPE_LABELS } from "@/content/questions";
import { actions, type AttemptResult, type AttemptSource } from "@/lib/store";
import { isWithinTolerance, parseNumericInput } from "@/lib/format";
import { cn } from "@/lib/cn";
import { RichText } from "@/components/math/RichText";
import { Tex } from "@/components/math/Tex";
import { Button } from "@/components/ui/Button";
import { Badge, DifficultyBadge, Input, Textarea } from "@/components/ui/primitives";

export interface QuestionOutcome {
  result: AttemptResult;
  selfScore?: number;
}

interface Props {
  question: Question;
  source: AttemptSource;
  /** Compact cards (lesson checks) hide metadata and the longer feedback sections. */
  compact?: boolean;
  /** Assessments hide the explanation until the end. */
  deferFeedback?: boolean;
  onAnswered?: (outcome: QuestionOutcome) => void;
  number?: number;
}

function formatLabel(q: Question) {
  if (q.kinds?.includes("trap")) return QUESTION_TYPE_LABELS.trap;
  if (q.kinds?.includes("scenario")) return QUESTION_TYPE_LABELS.scenario;
  return QUESTION_TYPE_LABELS[q.format];
}

/* ───────────── Single-answer inputs ───────────── */

function OptionList({
  name,
  options,
  selected,
  onSelect,
  answer,
  revealed,
}: {
  name: string;
  options: string[];
  selected: number | null;
  onSelect: (i: number) => void;
  answer: number;
  revealed: boolean;
}) {
  return (
    <div role="radiogroup" className="grid gap-2">
      {options.map((opt, i) => {
        const isCorrect = revealed && i === answer;
        const isWrongPick = revealed && selected === i && i !== answer;
        return (
          <label
            key={i}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
              !revealed && selected === i && "border-electric bg-ice-soft/60",
              !revealed && selected !== i && "border-line hover:border-electric/60",
              isCorrect && "border-success bg-success-soft",
              isWrongPick && "border-error bg-error-soft",
              revealed && !isCorrect && !isWrongPick && "border-line opacity-70",
              revealed && "cursor-default",
            )}
          >
            <input type="radio" name={name} className="sr-only" checked={selected === i} disabled={revealed} onChange={() => onSelect(i)} />
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.7rem] font-semibold",
                selected === i && !revealed ? "border-electric bg-electric text-white" : "border-line-strong text-ink-muted",
                isCorrect && "border-success bg-success text-white",
                isWrongPick && "border-error bg-error text-white",
              )}
              aria-hidden
            >
              {isCorrect ? <Check className="h-3 w-3" /> : isWrongPick ? "✕" : String.fromCharCode(65 + i)}
            </span>
            <span className="text-ink">
              <RichText text={opt} />
            </span>
          </label>
        );
      })}
    </div>
  );
}

function NumericField({ id, unit, value, onChange, disabled, onEnter }: { id: string; unit?: string; value: string; onChange: (v: string) => void; disabled: boolean; onEnter: () => void }) {
  const prefix = unit === "$" || unit === "$m" || unit === "$k" ? "$" : null;
  const suffix = unit === "$m" ? "m" : unit === "$k" ? "k" : unit && unit !== "$" ? unit : null;
  return (
    <div className="flex max-w-xs items-center gap-2">
      {prefix && <span className="text-sm font-medium text-ink-muted">{prefix}</span>}
      <Input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter();
        }}
        placeholder="Your answer"
        className="figure"
        aria-label="Numerical answer"
      />
      {suffix && <span className="text-sm font-medium text-ink-muted">{suffix}</span>}
    </div>
  );
}

function fmtExpected(v: number, unit?: string) {
  const s = Math.abs(v) >= 1000 ? v.toLocaleString("en-US") : String(v);
  if (unit === "$") return `$${s}`;
  if (unit === "$m") return `$${s}m`;
  if (unit === "$k") return `$${s}k`;
  return unit ? `${s}${unit === "%" || unit === "x" || unit === "°" ? "" : " "}${unit}` : s;
}

/* ───────────── Feedback ───────────── */

export function FeedbackPanel({ question, correct, compact, selfAssessed }: { question: Question; correct: boolean | null; compact?: boolean; selfAssessed?: boolean }) {
  const course = question.lesson ? getCourse(question.lesson.courseId) : undefined;
  const lesson = course?.lessons.find((l) => l.id === question.lesson?.lessonId);
  return (
    <div className="mt-5 space-y-4 animate-fade-up" aria-live="polite">
      {correct !== null && !selfAssessed && (
        <div className={cn("flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold", correct ? "bg-success-soft text-success-ink" : "bg-error-soft text-error-ink")}>
          {correct ? <CircleCheck className="h-5 w-5" /> : <CircleX className="h-5 w-5" />}
          {correct ? "Correct" : "Not quite"}
          {!correct && question.format === "mcq" && question.options && question.answer !== undefined && (
            <span className="font-normal text-ink">
              {" "}
              · Answer: <RichText text={question.options[question.answer]} />
            </span>
          )}
          {!correct && question.format === "numeric" && question.numeric && (
            <span className="font-normal text-ink">
              {" "}
              · Answer: <span className="figure">{fmtExpected(question.numeric.value, question.numeric.unit)}</span>
            </span>
          )}
        </div>
      )}
      <div className="text-sm leading-relaxed text-ink">
        <p className="mb-1 font-semibold text-navy">Explanation</p>
        <RichText text={question.explanation} />
      </div>
      {question.formula && (
        <div className="rounded-xl bg-cream px-4 py-2">
          <p className="pt-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">Formula</p>
          <Tex tex={question.formula} block />
        </div>
      )}
      {!compact && question.mistakes && question.mistakes.length > 0 && (
        <div className="text-sm">
          <p className="mb-1 flex items-center gap-1.5 font-semibold text-navy">
            <TriangleAlert className="h-4 w-4 text-warning-ink" /> Common mistakes
          </p>
          <ul className="list-disc space-y-1 pl-5 text-ink">
            {question.mistakes.map((m) => (
              <li key={m}>
                <RichText text={m} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {!compact && question.followUp && (
        <div className="flex gap-2 rounded-xl border border-ice bg-ice-soft/50 px-4 py-3 text-sm">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-electric" />
          <p>
            <span className="font-semibold text-navy">Follow-up an interviewer might ask: </span>
            <RichText text={question.followUp} />
          </p>
        </div>
      )}
      {!compact && course && lesson && (
        <Link href={lessonHref(course.id, lesson.id)} className="inline-flex items-center gap-2 text-sm font-medium text-electric hover:underline">
          <BookOpen className="h-4 w-4" /> Review the lesson: {lesson.title} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

/* ───────────── Multi-step ───────────── */

function StepView({
  step,
  index,
  qid,
  onDone,
}: {
  step: QuestionStep;
  index: number;
  qid: string;
  onDone: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const submit = () => {
    if (result !== null) return;
    let ok = false;
    if (step.format === "mcq") {
      if (selected === null) return setError("Choose an option first.");
      ok = selected === step.answer;
    } else {
      const n = parseNumericInput(value);
      if (n === null) return setError("Enter a number, e.g. 1,250 or 8.5.");
      ok = isWithinTolerance(n, step.numeric!.value, step.numeric!.tolerance);
    }
    setError("");
    setResult(ok);
    onDone(ok);
  };

  return (
    <div className="rounded-xl border border-line bg-cream/40 p-4">
      <p className="text-sm font-medium text-navy">
        Step {index + 1}. <RichText text={step.prompt} />
      </p>
      <div className="mt-3">
        {step.format === "mcq" ? (
          <OptionList name={`${qid}-s${index}`} options={step.options ?? []} selected={selected} onSelect={setSelected} answer={step.answer ?? -1} revealed={result !== null} />
        ) : (
          <NumericField id={`${qid}-s${index}`} unit={step.numeric?.unit} value={value} onChange={setValue} disabled={result !== null} onEnter={submit} />
        )}
      </div>
      {error && <p className="mt-2 text-sm text-error-ink">{error}</p>}
      {result === null ? (
        <Button size="sm" className="mt-3" onClick={submit}>
          Check step
        </Button>
      ) : (
        <div className={cn("mt-3 rounded-lg px-3 py-2 text-sm", result ? "bg-success-soft text-success-ink" : "bg-error-soft text-error-ink")}>
          <span className="font-semibold">{result ? "Correct. " : "Not quite. "}</span>
          {!result && step.numeric && (
            <span className="text-ink">
              Answer: <span className="figure">{fmtExpected(step.numeric.value, step.numeric.unit)}</span>.{" "}
            </span>
          )}
          <span className="text-ink">
            <RichText text={step.explanation} />
          </span>
        </div>
      )}
    </div>
  );
}

/* ───────────── Main card ───────────── */

export function QuestionCard({ question: q, source, compact, deferFeedback, onAnswered, number }: Props) {
  const started = useRef(Date.now());
  const [selected, setSelected] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [openText, setOpenText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [checkedPoints, setCheckedPoints] = useState<number[]>([]);
  const [selfSaved, setSelfSaved] = useState(false);
  const [stepResults, setStepResults] = useState<boolean[]>([]);

  const finish = (outcome: QuestionOutcome) => {
    actions.recordAttempt({
      qid: q.id,
      topic: q.topic,
      difficulty: q.difficulty,
      source,
      result: outcome.result,
      selfScore: outcome.selfScore,
      ms: Date.now() - started.current,
    });
    onAnswered?.(outcome);
  };

  const submit = () => {
    if (revealed) return;
    if (q.format === "mcq") {
      if (selected === null) return setError("Choose an option first.");
      const ok = selected === q.answer;
      setError("");
      setCorrect(ok);
      setRevealed(true);
      finish({ result: ok ? "correct" : "incorrect" });
    } else if (q.format === "numeric") {
      const n = parseNumericInput(value);
      if (n === null) return setError("Enter a number, e.g. 1,250 or −7.5. Units are optional.");
      const ok = isWithinTolerance(n, q.numeric!.value, q.numeric!.tolerance);
      setError("");
      setCorrect(ok);
      setRevealed(true);
      finish({ result: ok ? "correct" : "incorrect" });
    } else if (q.format === "open") {
      setError("");
      setRevealed(true);
    }
  };

  const onStepDone = (i: number, ok: boolean) => {
    const next = [...stepResults];
    next[i] = ok;
    setStepResults(next);
    if (next.filter((x) => x !== undefined).length === (q.steps?.length ?? 0)) {
      const allOk = next.every(Boolean);
      setCorrect(allOk);
      setRevealed(true);
      finish({ result: allOk ? "correct" : "incorrect" });
    }
  };

  const saveSelf = () => {
    const score = q.keyPoints?.length ? checkedPoints.length / q.keyPoints.length : 0;
    setSelfSaved(true);
    finish({ result: "self", selfScore: score });
  };

  const showFeedback = revealed && !deferFeedback;

  return (
    <article className={cn("rounded-2xl border border-line bg-white", compact ? "p-4 sm:p-5" : "p-5 shadow-card sm:p-7")}>
      {!compact && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge tone="blue">{TOPICS[q.topic].label}</Badge>
          <Badge tone="outline">{formatLabel(q)}</Badge>
          <DifficultyBadge level={q.difficulty} />
          <span className="text-xs text-ink-muted">~{q.minutes} min</span>
        </div>
      )}

      {q.context && (
        <div className="mb-4 rounded-xl border-l-4 border-ice bg-cream/60 px-4 py-3 text-sm leading-relaxed text-ink">
          <RichText text={q.context} />
        </div>
      )}

      <h3 className={cn("font-semibold leading-snug text-navy", compact ? "text-[0.95rem]" : "text-lg")}>
        {number !== undefined && <span className="mr-1.5 text-ink-muted">{number}.</span>}
        <RichText text={q.prompt} />
      </h3>

      <div className="mt-4">
        {q.format === "mcq" && <OptionList name={q.id} options={q.options ?? []} selected={selected} onSelect={setSelected} answer={q.answer ?? -1} revealed={revealed && !deferFeedback} />}

        {q.format === "numeric" && <NumericField id={`${q.id}-num`} unit={q.numeric?.unit} value={value} onChange={setValue} disabled={revealed} onEnter={submit} />}

        {q.format === "open" && (
          <div>
            <Textarea
              rows={6}
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
              disabled={revealed}
              placeholder="Write your answer as you would say it in an interview. Lead with the answer, then explain your reasoning."
              aria-label="Your answer"
            />
            <p className="mt-1.5 text-xs text-ink-muted">
              Open answers are not auto-graded. After you compare with the model answer, you assess yourself against the key points.
            </p>
          </div>
        )}

        {q.format === "multistep" && (
          <div className="space-y-3">
            {q.steps?.map((step, i) =>
              i <= stepResults.filter((x) => x !== undefined).length ? <StepView key={i} step={step} index={i} qid={q.id} onDone={(ok) => onStepDone(i, ok)} /> : null,
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-error-ink">{error}</p>}

      {q.format !== "multistep" && !revealed && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={submit}>{q.format === "open" ? "Compare with model answer" : "Submit answer"}</Button>
        </div>
      )}

      {deferFeedback && revealed && <p className="mt-3 text-sm font-medium text-ink-muted">Answer saved. Feedback appears at the end.</p>}

      {/* Open-ended: model answer + transparent self-assessment */}
      {q.format === "open" && revealed && (
        <div className="mt-5 space-y-4 animate-fade-up">
          <div className="rounded-xl border border-ice bg-ice-soft/40 p-4 text-sm leading-relaxed text-ink">
            <p className="mb-1 flex items-center gap-1.5 font-semibold text-navy">
              <Lightbulb className="h-4 w-4 text-electric" /> Model answer
            </p>
            <RichText text={q.modelAnswer ?? ""} />
          </div>
          {q.keyPoints && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-navy">Which key points did your answer cover?</legend>
              <div className="grid gap-2">
                {q.keyPoints.map((kp, i) => (
                  <label key={i} className={cn("flex items-start gap-3 rounded-xl border px-3 py-2 text-sm", checkedPoints.includes(i) ? "border-success bg-success-soft/60" : "border-line")}>
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-[#228565]"
                      checked={checkedPoints.includes(i)}
                      disabled={selfSaved}
                      onChange={() => setCheckedPoints((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]))}
                    />
                    <span>{kp}</span>
                  </label>
                ))}
              </div>
              {!selfSaved ? (
                <Button className="mt-3" variant="secondary" onClick={saveSelf}>
                  Save self-assessment
                </Button>
              ) : (
                <p className="mt-3 text-sm font-medium text-success-ink">
                  Saved: you covered {checkedPoints.length} of {q.keyPoints.length} key points. Self-assessed answers are tracked separately from auto-graded accuracy.
                </p>
              )}
            </fieldset>
          )}
        </div>
      )}

      {showFeedback && <FeedbackPanel question={q} correct={q.format === "open" ? null : correct} compact={compact} selfAssessed={q.format === "open"} />}
    </article>
  );
}
