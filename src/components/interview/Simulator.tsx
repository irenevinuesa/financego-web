"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BookOpen, Check, CircleCheck, CircleX, Clock, Flag, Info, MessagesSquare, Play, RotateCcw, Send, SkipForward, Target } from "lucide-react";
import { itemsForScope, type InterviewScope } from "@/content/interview";
import { getCourse, lessonHref } from "@/content/courses";
import { DIFFICULTIES, INTERVIEW_TRACK_IDS, TOPICS, TRACKS } from "@/content/taxonomy";
import type { Difficulty, InterviewItem, Lang, TopicId, TrackId } from "@/content/types";
import { actions, uid, useHydrated, useStore } from "@/lib/store";
import { evaluateAnswer, PHRASES, selectItems, summarize, type InterviewConfig, type InterviewType, type Turn } from "@/lib/interview";
import { fmtDuration, fmtRelative } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge, Card, Chip, Label, ProgressBar, Select, Textarea } from "@/components/ui/primitives";
import { StudyTimer } from "@/components/learn/LessonClient";

/* ───────────── UI strings ───────────── */

const UI = {
  en: {
    you: "You",
    interviewer: "Interviewer",
    placeholder: "Type your answer as you would say it. Lead with the answer, then the reasoning. (⌘/Ctrl + Enter to send)",
    send: "Send answer",
    skip: "I'd rather skip",
    end: "End interview",
    question: (i: number, n: number) => `Question ${i} of ${n}`,
    followUp: "Follow-up",
    typing: "Interviewer is typing…",
    confirmEnd: "End the interview now? Your answers so far will be scored.",
    skipped: "(skipped)",
  },
  es: {
    you: "Tú",
    interviewer: "Entrevistador",
    placeholder: "Escribe tu respuesta como la dirías. Primero la respuesta, después el razonamiento. (⌘/Ctrl + Enter para enviar)",
    send: "Enviar respuesta",
    skip: "Prefiero saltarla",
    end: "Terminar entrevista",
    question: (i: number, n: number) => `Pregunta ${i} de ${n}`,
    followUp: "Repregunta",
    typing: "El entrevistador está escribiendo…",
    confirmEnd: "¿Terminar la entrevista ahora? Se puntuarán las respuestas dadas.",
    skipped: "(sin respuesta)",
  },
};

const TYPES: { id: InterviewType; label: string; hint: string }[] = [
  { id: "technical", label: "Technical", hint: "Financial knowledge and reasoning" },
  { id: "case", label: "Case", hint: "A business or investment problem" },
  { id: "market", label: "Market discussion", hint: "Macro, rates, equities and scenarios" },
  { id: "pitch", label: "Investment pitch", hint: "Defend a stock or trade idea" },
  { id: "mixed", label: "Mixed", hint: "Technical, analytical and behavioural" },
];

const LENGTHS: { n: 3 | 5 | 8; label: string }[] = [
  { n: 3, label: "Short · 3 questions (~10 min)" },
  { n: 5, label: "Standard · 5 questions (~20 min)" },
  { n: 8, label: "Long · 8 questions (~30 min)" },
];

const TOPIC_CHOICES: TopicId[] = ["accounting", "valuation", "corporate-finance", "ma", "lbo", "markets", "fixed-income", "derivatives", "macro", "credit-risk", "quant", "strategy"];

/* ───────────── Setup ───────────── */

function Setup({ onStart, scope }: { onStart: (c: InterviewConfig) => void; scope: InterviewScope }) {
  const params = useSearchParams();
  const state = useStore();
  const hydrated = useHydrated();
  const presetTrack = params.get("track") as TrackId | null;
  const presetType = params.get("type") as InterviewType | null;
  const [track, setTrack] = useState<TrackId>(presetTrack && INTERVIEW_TRACK_IDS.includes(presetTrack) ? presetTrack : "investment-banking");
  const [difficulty, setDifficulty] = useState<Difficulty>("Intermediate");
  const [length, setLength] = useState<3 | 5 | 8>(5);
  const [type, setType] = useState<InterviewType>(presetType && TYPES.some((t) => t.id === presetType) ? presetType : "technical");
  const [topics, setTopics] = useState<TopicId[]>([]);
  const [lang, setLang] = useState<Lang>("en");
  const [timer, setTimer] = useState(true);

  // Default the language and track to the learner's profile once it is readable.
  const applied = useRef(false);
  useEffect(() => {
    if (!hydrated || applied.current) return;
    applied.current = true;
    setLang(state.profile.interviewLang);
    if (!presetTrack && state.profile.track && INTERVIEW_TRACK_IDS.includes(state.profile.track as TrackId)) setTrack(state.profile.track as TrackId);
  }, [hydrated, state.profile, presetTrack]);

  const available = useMemo(() => itemsForScope(scope).filter((i) => i.tracks === "all" || i.tracks.includes(track)).length, [track, scope]);

  return (
    <Card className="p-5 sm:p-8">
      <h2 className="font-serif text-2xl">Set up your interview</h2>
      <p className="mt-1 text-sm text-ink-muted">{available} scripted questions are available for this track.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="iv-track">Career track</Label>
          <Select id="iv-track" value={track} onChange={(e) => setTrack(e.target.value as TrackId)}>
            {INTERVIEW_TRACK_IDS.map((t) => (
              <option key={t} value={t}>
                {TRACKS[t].label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="iv-length">Interview duration</Label>
          <Select id="iv-length" value={length} onChange={(e) => setLength(Number(e.target.value) as 3 | 5 | 8)}>
            {LENGTHS.map((l) => (
              <option key={l.n} value={l.n}>
                {l.label}
              </option>
            ))}
          </Select>
        </div>
        {scope === "technical" && (
        <div className="md:col-span-2">
          <Label>Interview type</Label>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                aria-pressed={type === t.id}
                className={cn("rounded-xl border px-3 py-2.5 text-left transition-colors", type === t.id ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-electric")}
              >
                <span className="block text-sm font-semibold">{t.label}</span>
                <span className={cn("block text-xs", type === t.id ? "text-ice-soft" : "text-ink-muted")}>{t.hint}</span>
              </button>
            ))}
          </div>
        </div>
        )}
        {scope === "technical" && (
        <div>
          <Label>Difficulty</Label>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
                {d}
              </Chip>
            ))}
          </div>
        </div>
        )}
        <div>
          <Label>Language</Label>
          <div className="flex flex-wrap gap-2">
            <Chip active={lang === "en"} onClick={() => setLang("en")}>
              English
            </Chip>
            <Chip active={lang === "es"} onClick={() => setLang("es")}>
              Español
            </Chip>
          </div>
        </div>
        {scope === "technical" && (
        <div className="md:col-span-2">
          <Label hint="Optional. Leave empty for a balanced mix">Technical topics</Label>
          <div className="flex flex-wrap gap-2">
            {TOPIC_CHOICES.map((t) => (
              <Chip key={t} active={topics.includes(t)} onClick={() => setTopics((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}>
                {TOPICS[t].label}
              </Chip>
            ))}
          </div>
        </div>
        )}
        <label className="flex items-center gap-3 text-sm text-ink md:col-span-2">
          <input type="checkbox" checked={timer} onChange={(e) => setTimer(e.target.checked)} className="h-4 w-4 accent-[#114779]" />
          Show a timer (about two minutes per answer is a good target)
        </label>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button
          size="lg"
          onClick={() =>
            onStart({ scope, track, difficulty, length, type: scope === "behavioural" ? "behavioral" : type, topics: scope === "behavioural" ? [] : topics, lang, timer })
          }
        >
          <Play className="h-4 w-4" /> Start interview
        </Button>
        <p className="text-xs text-ink-muted">Answers stay in this browser. Only the scores and topics are saved to your dashboard, not your written answers.</p>
      </div>
    </Card>
  );
}

/* ───────────── Interview room ───────────── */

interface Message {
  from: "interviewer" | "you";
  text: string;
  tag?: string;
}

function Room({ config, items, relaxed, onFinish }: { config: InterviewConfig; items: InterviewItem[]; relaxed: string[]; onFinish: (turns: Turn[], seconds: number) => void }) {
  const t = UI[config.lang];
  const [itemIdx, setItemIdx] = useState(0);
  const [stage, setStage] = useState<"main" | "followup">("main");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [answer, setAnswer] = useState("");
  const [typing, setTyping] = useState(false);
  const [followKind, setFollowKind] = useState<"deeper" | "probe">("deeper");
  const [messages, setMessages] = useState<Message[]>(() => [
    { from: "interviewer", text: PHRASES.intro[config.lang](TRACKS[config.track].label, items.length) },
    { from: "interviewer", text: items[0].prompt[config.lang], tag: t.question(1, items.length) },
  ]);
  const started = useRef(Date.now());
  const questionStarted = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, typing]);

  const item = items[itemIdx];

  const interviewerSays = (msgs: Message[], after?: () => void) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, ...msgs]);
      questionStarted.current = Date.now();
      after?.();
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 700);
  };

  const advance = (allTurns: Turn[]) => {
    if (itemIdx + 1 >= items.length) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages((m) => [...m, { from: "interviewer", text: PHRASES.outro[config.lang] }]);
        setTimeout(() => onFinish(allTurns, Math.round((Date.now() - started.current) / 1000)), 900);
      }, 600);
      return;
    }
    const next = items[itemIdx + 1];
    const phrase = PHRASES.next[config.lang][(itemIdx + 1) % PHRASES.next[config.lang].length];
    interviewerSays([{ from: "interviewer", text: `${phrase} ${next.prompt[config.lang]}`, tag: t.question(itemIdx + 2, items.length) }], () => {
      setItemIdx((i) => i + 1);
      setStage("main");
    });
  };

  const submit = (skip = false) => {
    if (typing) return;
    const text = skip ? "" : answer.trim();
    if (!skip && !text) return;
    const isMain = stage === "main";
    const evaluation = isMain
      ? evaluateAnswer(text, item.concepts, item.minConcepts, item.numeric)
      : evaluateAnswer(text, item.followUp.concepts, item.followUp.minConcepts, item.followUp.numeric);
    const question = isMain ? item.prompt[config.lang] : (followKind === "deeper" ? item.followUp.deeper : item.followUp.probe)[config.lang];
    const turn: Turn = { itemId: item.id, stage, question, answer: text, evaluation, followKind: isMain ? undefined : followKind, skipped: skip };
    const allTurns = [...turns, turn];
    setTurns(allTurns);
    setMessages((m) => [...m, { from: "you", text: skip ? t.skipped : text }]);
    setAnswer("");

    if (isMain && !skip) {
      const kind = evaluation.strong ? "deeper" : "probe";
      setFollowKind(kind);
      const lead = kind === "probe" ? (item.numeric && evaluation.numericCorrect === false ? PHRASES.numericWrong[config.lang] : PHRASES.partial[config.lang]) + " " : "";
      interviewerSays([{ from: "interviewer", text: lead + item.followUp[kind][config.lang], tag: t.followUp }], () => setStage("followup"));
    } else if (isMain && skip) {
      // Skipping the main question skips its follow-up too.
      advance([...allTurns, { ...turn, stage: "followup", question: item.followUp.probe[config.lang], skipped: true }]);
      setTurns((p) => [...p, { ...turn, stage: "followup", question: item.followUp.probe[config.lang], skipped: true }]);
    } else {
      advance(allTurns);
    }
  };

  const elapsed = Math.round((now - started.current) / 1000);
  const onQuestion = Math.round((now - questionStarted.current) / 1000);
  const mainAnswered = turns.filter((x) => x.stage === "main").length;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <StudyTimer />
      <Card className="flex min-h-[32rem] flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cream/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">IV</span>
            <div>
              <p className="text-sm font-semibold text-navy">
                {t.interviewer} · {TRACKS[config.track].label}
              </p>
              <p className="text-xs text-ink-muted">{t.question(Math.min(itemIdx + 1, items.length), items.length)}</p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm(t.confirmEnd)) onFinish(turns, elapsed);
            }}
          >
            <Flag className="h-4 w-4" /> {t.end}
          </Button>
        </div>
        <ProgressBar value={mainAnswered / items.length} className="rounded-none" label="Interview progress" />

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
          {relaxed.length > 0 && (
            <p className="rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning-ink">
              Not enough scripted questions matched every filter, so related questions were added (relaxed: {relaxed.join(", ")}).
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.from === "you" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[88%] rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed sm:max-w-[80%]", m.from === "you" ? "rounded-tr-sm bg-electric text-white" : "rounded-tl-sm bg-ice-soft/70 text-ink")}>
                {m.tag && <p className={cn("mb-1 text-[0.7rem] font-semibold uppercase tracking-wider", m.from === "you" ? "text-ice-soft" : "text-electric")}>{m.tag}</p>}
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {typing && <p className="text-sm italic text-ink-muted">{t.typing}</p>}
          <div ref={endRef} />
        </div>

        <div className="border-t border-line p-3 sm:p-4">
          <Textarea
            ref={inputRef}
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={t.placeholder}
            disabled={typing}
            aria-label={t.send}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => submit(true)} disabled={typing}>
              <SkipForward className="h-4 w-4" /> {t.skip}
            </Button>
            <Button onClick={() => submit()} disabled={typing || !answer.trim()}>
              <Send className="h-4 w-4" /> {t.send}
            </Button>
          </div>
        </div>
      </Card>

      <aside className="space-y-4">
        {config.timer && (
          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <Clock className="h-3.5 w-3.5" /> Timer
            </p>
            <p className="figure mt-1 text-2xl font-semibold text-navy">{fmtDuration(elapsed)}</p>
            <p className={cn("mt-1 text-xs", onQuestion > 150 ? "text-warning-ink" : "text-ink-muted")}>
              This answer: {onQuestion}s {onQuestion > 150 ? "· try to wrap up" : ""}
            </p>
          </Card>
        )}
        <Card className="p-4 text-sm">
          <p className="font-semibold text-navy">How to answer well</p>
          <ul className="mt-2 space-y-1.5 text-ink-muted">
            {config.scope === "behavioural" ? (
              <>
                <li>Use STAR: Situation, Task, Action, Result.</li>
                <li>Spend most of your time on what you did.</li>
                <li>Give a concrete result, with a number if you have one.</li>
                <li>End with what you learned.</li>
              </>
            ) : (
              <>
                <li>Give the answer first, then explain why.</li>
                <li>Use structure: “First… Second…”.</li>
                <li>Show numbers when you calculate.</li>
                <li>It is fine to say what you would check.</li>
              </>
            )}
          </ul>
        </Card>
        <Card className="p-4 text-xs text-ink-muted">
          <p className="flex items-center gap-1.5 font-semibold text-navy">
            <Info className="h-3.5 w-3.5" /> How follow-ups work
          </p>
          <p className="mt-1.5">
            This MVP interviewer is scripted. It checks your answer for key concepts and numbers, then asks a deeper follow-up if they are there, or a probing one if they are
            not. It does not understand free text like a human. AI-driven interviews are planned for Version 2.
          </p>
        </Card>
      </aside>
    </div>
  );
}

/* ───────────── Report ───────────── */

function ScoreBar({ label, value, rule }: { label: string; value: number | null; rule: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-navy">{label}</p>
        <p className="figure text-sm font-semibold text-navy">{value === null ? "n/a" : `${Math.round(value * 100)}%`}</p>
      </div>
      <ProgressBar value={value ?? 0} className="mt-1.5 h-2" label={label} />
      <p className="mt-1 text-xs text-ink-muted">{rule}</p>
    </div>
  );
}

function Report({ config, items, turns, seconds, onRestart }: { config: InterviewConfig; items: InterviewItem[]; turns: Turn[]; seconds: number; onRestart: () => void }) {
  const lang = config.lang;
  const s = useMemo(() => summarize(turns, lang), [turns, lang]);
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    if (s.answered === 0) return;
    actions.saveInterview({
      id: uid(),
      at: new Date().toISOString(),
      track: config.track,
      format: config.type,
      difficulty: config.difficulty,
      lang,
      questionCount: items.length,
      answered: s.answered,
      durationSec: seconds,
      scores: { technical: s.technical, structure: s.structure, numerical: s.numerical, clarity: s.clarity },
      weakConcepts: s.weakConcepts.map((w) => w.label).slice(0, 8),
      topics: s.topics,
    });
  }, [s, config, items.length, lang, seconds]);

  const weakItems = items.filter((i) => !s.strongItems.includes(i.id));
  const lessons = new Map<string, { href: string; title: string }>();
  for (const i of weakItems) {
    if (!i.lesson) continue;
    const c = getCourse(i.lesson.courseId);
    const l = c?.lessons.find((x) => x.id === i.lesson!.lessonId);
    if (c && l) lessons.set(l.id, { href: lessonHref(c.id, l.id), title: l.title });
  }
  const practiceTopics = [...new Set(weakItems.flatMap((i) => i.topics))].filter((tp) => tp !== "strategy" || config.track === "consulting").slice(0, 4);

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <p className="eyebrow mb-2">Interview report</p>
        <h2 className="font-serif text-3xl">
          {TRACKS[config.track].label} · {s.answered} answer{s.answered === 1 ? "" : "s"} in {fmtDuration(seconds)}
        </h2>
        <p className="mt-3 rounded-xl bg-cream px-4 py-3 text-sm text-ink">
          <strong className="text-navy">Read these scores as practice indicators.</strong> They come from transparent rules (concept and keyword checks, numeric tolerance,
          answer length and structure words), not from an expert reviewer. They are not a prediction of any hiring outcome.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <ScoreBar
            label={config.scope === "behavioural" ? "Content coverage" : "Technical accuracy"}
            value={s.technical}
            rule={config.scope === "behavioural" ? "Share of the elements a strong answer contains (STAR structure, ownership, specifics) that your answers covered." : "Share of the expected key concepts your answers covered (numeric answers: within tolerance)."}
          />
          <ScoreBar label="Structure of reasoning" value={s.answered ? s.structure : null} rule="Do answers give reasons (because, therefore…) and an ordered structure?" />
          <ScoreBar label="Numerical precision" value={s.numerical} rule="Numeric questions answered within tolerance. n/a if none were asked." />
          <ScoreBar label="Clarity of communication" value={s.answered ? s.clarity : null} rule="Answer length in a sensible range, sentences not too long, few hedges." />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={onRestart}>
            <RotateCcw className="h-4 w-4" /> New interview
          </Button>
          <ButtonLink href="/dashboard/" variant="secondary">
            Interview history
          </ButtonLink>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="p-5">
          <p className="flex items-center gap-2 font-semibold text-navy">
            <Target className="h-4 w-4 text-electric" /> Areas for improvement
          </p>
          {s.weakConcepts.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">Your answers covered the key concepts the rules look for. Try a harder difficulty.</p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
              {[...new Set(s.weakConcepts.map((w) => w.label))].slice(0, 6).map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-2 font-semibold text-navy">
            <BookOpen className="h-4 w-4 text-electric" /> Suggested lessons
          </p>
          {lessons.size === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">No specific lessons flagged. Browse the Learn library to go deeper.</p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-sm">
              {[...lessons.values()].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-electric hover:underline">
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-2 font-semibold text-navy">
            <MessagesSquare className="h-4 w-4 text-electric" /> Recommended practice
          </p>
          {config.scope === "behavioural" ? (
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>
                <Link href="/behaviourals/questions/" className="text-electric hover:underline">
                  Behavioural question library
                </Link>
              </li>
              <li>
                <Link href="/behaviourals/stories/" className="text-electric hover:underline">
                  Build your story bank
                </Link>
              </li>
              <li>
                <Link href="/behaviourals/" className="text-electric hover:underline">
                  The STAR method guide
                </Link>
              </li>
            </ul>
          ) : (
          <ul className="mt-2 space-y-1.5 text-sm">
            {(practiceTopics.length ? practiceTopics : (["valuation"] as TopicId[])).map((tp) => (
              <li key={tp}>
                <Link href={`/practice/session/?mode=topic&topic=${tp}`} className="text-electric hover:underline">
                  {TOPICS[tp].label} questions
                </Link>
              </li>
            ))}
            <li>
              <Link href={`/practice/session/?mode=interview&track=${config.track}`} className="text-electric hover:underline">
                {TRACKS[config.track].label} practice set
              </Link>
            </li>
          </ul>
          )}
        </Card>
      </div>

      <h3 className="font-serif text-2xl">Question by question</h3>
      <div className="space-y-4">
        {items.map((item, i) => {
          const main = turns.find((x) => x.itemId === item.id && x.stage === "main");
          const fu = turns.find((x) => x.itemId === item.id && x.stage === "followup");
          if (!main) return null;
          return (
            <Card key={item.id} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="navy">Q{i + 1}</Badge>
                {item.topics.slice(0, 2).map((tp) => (
                  <Badge key={tp} tone="blue">
                    {TOPICS[tp].label}
                  </Badge>
                ))}
                {main.evaluation.strong ? <Badge tone="success">Key concepts covered</Badge> : <Badge tone="warning">Room to improve</Badge>}
              </div>
              <p className="mt-3 font-semibold text-navy">{item.prompt[lang]}</p>
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-cream px-4 py-3 text-sm text-ink">{main.skipped ? UI[lang].skipped : main.answer}</p>
              {!main.skipped && (
                <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                  {item.numeric && (
                    <li className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1", main.evaluation.numericCorrect ? "bg-success-soft text-success-ink" : "bg-error-soft text-error-ink")}>
                      {main.evaluation.numericCorrect ? <Check className="h-3 w-3" /> : <CircleX className="h-3 w-3" />} Number: {item.numeric.value}
                      {item.numeric.unit}
                    </li>
                  )}
                  {item.concepts.map((c) => (
                    <li key={c.id} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1", main.evaluation.hits.includes(c.id) ? "bg-success-soft text-success-ink" : "bg-cream-deep text-ink-muted")}>
                      {main.evaluation.hits.includes(c.id) ? <CircleCheck className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-current" />} {c.label[lang]}
                    </li>
                  ))}
                </ul>
              )}
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-medium text-electric">Model answer</summary>
                <p className="mt-2 leading-relaxed text-ink">{item.modelAnswer[lang]}</p>
              </details>
              {fu && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{UI[lang].followUp}</p>
                  <p className="mt-1 font-medium text-navy">{fu.question}</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-xl bg-cream px-4 py-3 text-sm text-ink">{fu.skipped || !fu.answer ? UI[lang].skipped : fu.answer}</p>
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer font-medium text-electric">Model answer to the follow-up</summary>
                    <p className="mt-2 leading-relaxed text-ink">{item.followUpModelAnswer[lang]}</p>
                  </details>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────── History ───────────── */

export function InterviewHistory({ scope }: { scope: InterviewScope }) {
  const state = useStore();
  const hydrated = useHydrated();
  const mine = state.interviews.filter((r) => (scope === "behavioural" ? r.format === "behavioral" : r.format !== "behavioral"));
  if (!hydrated || mine.length === 0) return null;
  const recent = [...mine].reverse().slice(0, 5);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-navy">Recent mock interviews</p>
        <Link href="/dashboard/" className="text-sm text-electric hover:underline">
          All history
        </Link>
      </div>
      <ul className="mt-3 divide-y divide-line text-sm">
        {recent.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <span className="text-ink">
              {TRACKS[r.track]?.label ?? r.track} · {r.format} · {r.answered} answers
            </span>
            <span className="text-ink-muted">
              {scope === "behavioural" ? "Content" : "Technical"} {Math.round(r.scores.technical * 100)}% · {fmtRelative(r.at)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ───────────── Orchestrator ───────────── */

export function Simulator({ scope = "technical" }: { scope?: InterviewScope }) {
  const [phase, setPhase] = useState<"setup" | "room" | "report">("setup");
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [items, setItems] = useState<InterviewItem[]>([]);
  const [relaxed, setRelaxed] = useState<string[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [seconds, setSeconds] = useState(0);

  if (phase === "room" && config) {
    return (
      <Room
        config={config}
        items={items}
        relaxed={relaxed}
        onFinish={(t, sec) => {
          setTurns(t);
          setSeconds(sec);
          setPhase("report");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }
  if (phase === "report" && config) {
    return <Report config={config} items={items} turns={turns} seconds={seconds} onRestart={() => setPhase("setup")} />;
  }
  return (
    <div className="space-y-6">
      <Setup
        scope={scope}
        onStart={(c) => {
          const sel = selectItems(c);
          setConfig(c);
          setItems(sel.items);
          setRelaxed(sel.relaxed.filter(Boolean));
          setTurns([]);
          setPhase("room");
        }}
      />
      <InterviewHistory scope={scope} />
      <p className="flex items-center gap-2 text-sm text-ink-muted">
        <ArrowRight className="h-4 w-4" /> Want to warm up first?{" "}
        {scope === "behavioural" ? (
          <Link href="/behaviourals/stories/" className="text-electric hover:underline">
            Prepare your stories in the story bank
          </Link>
        ) : (
          <Link href="/practice/session/?mode=interview" className="text-electric hover:underline">
            Try the Interview Preparation practice set
          </Link>
        )}
        .
      </p>
    </div>
  );
}
