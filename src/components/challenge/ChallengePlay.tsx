"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CircleCheck, Lock, Repeat, Trophy } from "lucide-react";
import { actions, useHydrated, useStore } from "@/lib/store";
import { CHALLENGE, challengePosition, challengeProgress, STAGES, STAGE_SIZE } from "@/lib/challenge";
import { QuestionCard, type QuestionOutcome } from "@/components/practice/QuestionCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, EmptyState, ProgressBar } from "@/components/ui/primitives";
import { StudyTimer } from "@/components/learn/LessonClient";

/**
 * Plays the challenge. The question on screen is frozen in local state, so
 * answering (which unlocks the next one in the store) never swaps it out
 * before the learner has read the feedback.
 */
export function ChallengePlay() {
  const params = useSearchParams();
  const state = useStore();
  const hydrated = useHydrated();
  const mode = params.get("mode") === "missed" ? "missed" : "path";
  const requested = params.get("q");
  const [qid, setQid] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  // True when the answer given on this visit was the question's first answer, so the label doesn't flip to "retrying".
  const [answeredFirst, setAnsweredFirst] = useState(false);
  const [round, setRound] = useState(0);

  const p = useMemo(() => challengeProgress(state.challenge), [state.challenge]);

  // Choose the question once the saved state is readable, and again on "Next".
  useEffect(() => {
    // null = not chosen yet; "" = chosen, and there is nothing left to show.
    if (!hydrated || qid !== null) return;
    if (requested) setQid(requested);
    else if (mode === "missed") setQid(p.missed[0]?.id ?? "");
    else setQid(CHALLENGE[p.currentIndex]?.id ?? "");
  }, [hydrated, qid, requested, mode, p]);

  if (!hydrated || qid === null) return <div className="h-80 animate-pulse rounded-2xl bg-cream" />;

  const index = qid ? challengePosition(qid) : undefined;
  const question = index !== undefined ? CHALLENGE[index] : undefined;

  if (!question) {
    if (mode === "missed") {
      return (
        <EmptyState icon={<CircleCheck className="h-5 w-5" />} title="Nothing left to repeat" action={<ButtonLink href="/challenge/">Back to the challenge</ButtonLink>}>
          Every question you missed has now been answered correctly.
        </EmptyState>
      );
    }
    return (
      <Card className="p-8 text-center">
        <Trophy className="mx-auto h-10 w-10 text-navy" />
        <h2 className="mt-4 font-serif text-3xl">You finished all {CHALLENGE.length} questions</h2>
        <p className="mt-2 text-ink-muted">{p.missed.length ? `Repeat the ${p.missed.length} you missed to lock everything in.` : "Every question answered. Superday ready."}</p>
        <div className="mt-6 flex justify-center gap-3">
          {p.missed.length > 0 && <ButtonLink href="/challenge/play/?mode=missed">Repeat missed</ButtonLink>}
          <ButtonLink href="/challenge/" variant="secondary">
            See your map
          </ButtonLink>
        </div>
      </Card>
    );
  }

  const first = state.challenge.answers[question.id];
  const locked = !first && index! > p.currentIndex;
  const isRetry = Boolean(first) && !answeredFirst && p.missed.some((q) => q.id === question.id);
  const practisingAgain = Boolean(first) && !answeredFirst && !isRetry;
  const stage = Math.floor(index! / STAGE_SIZE);

  if (locked) {
    return (
      <EmptyState icon={<Lock className="h-5 w-5" />} title={`Question ${index! + 1} is still locked`} action={<ButtonLink href="/challenge/play/">Go to question {p.currentIndex + 1}</ButtonLink>}>
        Questions unlock one at a time. Answer question {p.currentIndex + 1} first.
      </EmptyState>
    );
  }

  const onAnswered = (o: QuestionOutcome) => {
    if (!first) actions.answerChallenge(question.id, o);
    else actions.retryChallenge(question.id, o);
    setAnsweredFirst(!first);
    setAnswered(true);
  };

  const goNext = () => {
    setAnswered(false);
    setAnsweredFirst(false);
    setRound((r) => r + 1);
    if (mode === "missed") {
      const rest = challengeProgress(state.challenge).missed.filter((q) => q.id !== question.id);
      setQid(rest[0]?.id ?? "");
    } else {
      const next = CHALLENGE[challengeProgress(state.challenge).currentIndex];
      setQid(next?.id ?? "");
    }
  };

  return (
    <div className="space-y-5">
      <StudyTimer />
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-navy">
              {mode === "missed" ? `Repeating missed · ${p.missed.length} left` : `Question ${index! + 1} of ${CHALLENGE.length}`}
            </p>
            <p className="text-xs text-ink-muted">
              Stage {stage + 1}: {STAGES[stage]?.title} {isRetry && mode !== "missed" ? "· retrying a question you missed" : practisingAgain ? "· already answered, practising again" : ""}
            </p>
          </div>
          <Link href="/challenge/" className="inline-flex items-center gap-1 text-sm font-medium text-navy hover:underline">
            <ArrowLeft className="h-4 w-4" /> Map
          </Link>
        </div>
        <ProgressBar value={p.answered / Math.max(1, CHALLENGE.length)} className="mt-3" label="Challenge progress" />
      </Card>

      <QuestionCard key={`${question.id}-${round}`} question={question} source="challenge" onAnswered={onAnswered} />

      {answered && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">{first ? "Saved." : `Question ${index! + 2 <= CHALLENGE.length ? index! + 2 : index! + 1} is now unlocked.`}</p>
          <Button onClick={goNext}>
            {mode === "missed" ? (
              <>
                <Repeat className="h-4 w-4" /> Next missed
              </>
            ) : (
              <>
                Next question <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
