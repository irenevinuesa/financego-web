/**
 * Rule-based interview engine (MVP). Everything here is transparent pattern
 * matching and arithmetic. It does not understand language. The UI says so
 * plainly, and the scores are labelled as indicators, not expert assessments.
 */

import { INTERVIEW_ITEMS } from "@/content/interview/items";
import type { Bilingual, Difficulty, InterviewConcept, InterviewFormat, InterviewItem, Lang, TopicId, TrackId } from "@/content/types";
import { isWithinTolerance } from "./format";
import { normalize } from "./text";

export { normalize };

export function matchConcept(normalizedText: string, concept: InterviewConcept): boolean {
  return concept.patterns.some((p) => {
    try {
      return new RegExp(p, "i").test(normalizedText);
    } catch {
      return normalizedText.includes(p);
    }
  });
}

/**
 * Pulls every number out of free text, in English or Spanish notation.
 * "2,6" is 2.6 and "1,250,000" is 1250000. A single three-digit group such as
 * "1.000" or "1,000" is ambiguous (one thousand in one convention, one in the
 * other), so both readings are returned.
 */
export function extractNumbers(text: string): number[] {
  const out: number[] = [];
  const re = /-?\d+(?:[.,]\d+)*/g;
  const t = text.replace(/[−–]/g, "-");
  for (const m of t.matchAll(re)) {
    const raw = m[0];
    const candidates: string[] = [];
    if (/^-?\d{1,3}[.,]\d{3}$/.test(raw)) {
      candidates.push(raw.replace(/[.,]/, ""), raw.replace(",", "."));
    } else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(raw)) {
      candidates.push(raw.replace(/,/g, ""));
    } else if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(raw)) {
      candidates.push(raw.replace(/\./g, "").replace(",", "."));
    } else {
      candidates.push(raw.replace(",", "."));
    }
    for (const c of candidates) {
      const n = Number(c);
      if (Number.isFinite(n) && !out.includes(n)) out.push(n);
    }
  }
  return out;
}

export interface AnswerEval {
  hits: string[];
  missing: string[];
  numericCorrect: boolean | null;
  strong: boolean;
  /** 0–1 share of the expected concepts covered (or numeric correctness for numeric items). */
  technical: number;
  structure: number;
  clarity: number;
  words: number;
}

const REASONING = /\b(because|since|therefore|so that|as a result|which means|due to|this means|hence|thus|porque|ya que|por lo tanto|por tanto|lo que significa|debido a|asi que|por eso|de modo que)\b/;
const ORDERING = /\b(first|second|third|finally|then|firstly|secondly|on the other hand|primero|segundo|tercero|por ultimo|luego|en primer lugar|por otro lado|despues)\b|(^|\s)(1\)|2\)|1\.|2\.|- )/;
const HEDGES = /\b(maybe|i guess|kind of|sort of|i'm not sure|not sure|probably|quizas|tal vez|no estoy seguro|supongo|creo que no se)\b/g;

function sentences(text: string): string[] {
  return text
    .split(/[.!?;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 2);
}

/** Heuristic: does the answer give reasons and some ordering? */
export function structureScore(text: string): number {
  const n = normalize(text);
  const words = n.split(/\s+/).filter(Boolean).length;
  let score = 0;
  if (REASONING.test(n)) score += 0.4;
  if (ORDERING.test(n) || sentences(n).length >= 2) score += 0.3;
  if (words >= 12) score += 0.3;
  return Math.min(1, score);
}

/** Heuristic: is the answer a readable length, with sentences of reasonable size and few hedges? */
export function clarityScore(text: string): number {
  const n = normalize(text);
  const words = n.split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  let score = 0;
  if (words >= 12 && words <= 220) score += 0.5;
  else if (words > 220) score += 0.3;
  else score += 0.5 * (words / 12);
  const sents = sentences(n);
  const avg = sents.length ? words / sents.length : words;
  if (avg <= 28) score += 0.3;
  const hedges = (n.match(HEDGES) ?? []).length;
  if (hedges <= 1) score += 0.2;
  return Math.min(1, score);
}

export function evaluateAnswer(
  text: string,
  concepts: InterviewConcept[],
  minConcepts: number,
  numeric?: { value: number; tolerance: number },
): AnswerEval {
  const n = normalize(text);
  const hits = concepts.filter((c) => matchConcept(n, c)).map((c) => c.id);
  const missing = concepts.filter((c) => !hits.includes(c.id)).map((c) => c.id);
  const keyOk = concepts.filter((c) => c.key).every((c) => hits.includes(c.id));

  let numericCorrect: boolean | null = null;
  if (numeric) {
    numericCorrect = extractNumbers(text).some((x) => isWithinTolerance(x, numeric.value, numeric.tolerance));
  }

  const target = Math.max(1, Math.min(concepts.length, minConcepts || 1));
  const conceptCoverage = concepts.length ? Math.min(1, hits.length / target) : null;

  let technical: number;
  let strong: boolean;
  if (numeric) {
    technical = conceptCoverage === null ? (numericCorrect ? 1 : 0) : (numericCorrect ? 0.75 : 0) + 0.25 * conceptCoverage;
    strong = Boolean(numericCorrect);
  } else {
    technical = conceptCoverage ?? 0;
    strong = keyOk && hits.length >= minConcepts;
  }

  return {
    hits,
    missing,
    numericCorrect,
    strong,
    technical,
    structure: structureScore(text),
    clarity: clarityScore(text),
    words: n.split(/\s+/).filter(Boolean).length,
  };
}

/* ───────────── Session setup ───────────── */

export type InterviewType = InterviewFormat | "mixed";

export interface InterviewConfig {
  track: TrackId;
  difficulty: Difficulty;
  length: 3 | 5 | 8;
  type: InterviewType;
  topics: TopicId[];
  lang: Lang;
  timer: boolean;
}

const DIFF_RANK: Record<Difficulty, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };

function shuffle<T>(arr: T[], random: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fitsTrack(item: InterviewItem, track: TrackId) {
  return item.tracks === "all" || item.tracks.includes(track);
}

/**
 * Picks items for a session. Filters are relaxed step by step (topics, then
 * difficulty, then format, then track) if too few items match; the caller is
 * told so it can explain the substitution honestly.
 */
export function selectItems(config: InterviewConfig, random: () => number = Math.random): { items: InterviewItem[]; relaxed: string[] } {
  const relaxed: string[] = [];
  const wantFormat = (i: InterviewItem) => (config.type === "mixed" ? true : i.format === config.type);
  const wantTopics = (i: InterviewItem) => config.topics.length === 0 || i.topics.some((t) => config.topics.includes(t));
  const wantDifficulty = (i: InterviewItem) => Math.abs(DIFF_RANK[i.difficulty] - DIFF_RANK[config.difficulty]) <= 1;

  const stages: { label: string; filter: (i: InterviewItem) => boolean }[] = [
    { label: "", filter: (i) => fitsTrack(i, config.track) && wantFormat(i) && wantTopics(i) && wantDifficulty(i) },
    { label: "topics", filter: (i) => fitsTrack(i, config.track) && wantFormat(i) && wantDifficulty(i) },
    { label: "difficulty", filter: (i) => fitsTrack(i, config.track) && wantFormat(i) },
    { label: "interview type", filter: (i) => fitsTrack(i, config.track) },
    { label: "career track", filter: () => true },
  ];

  const chosen: InterviewItem[] = [];
  for (const stage of stages) {
    const pool = shuffle(
      INTERVIEW_ITEMS.filter((i) => stage.filter(i) && !chosen.includes(i)),
      random,
    );
    // Mixed interviews: at most one behavioural question, and it opens the interview.
    for (const item of pool) {
      if (chosen.length >= config.length) break;
      if (config.type === "mixed" && item.format === "behavioral" && chosen.some((c) => c.format === "behavioral")) continue;
      chosen.push(item);
    }
    if (chosen.length >= config.length) break;
    const next = stages[stages.indexOf(stage) + 1];
    if (next) relaxed.push(next.label);
  }

  // Keep behavioural first, then order by difficulty so the interview builds up.
  chosen.sort((a, b) => {
    if (a.format === "behavioral" && b.format !== "behavioral") return -1;
    if (b.format === "behavioral" && a.format !== "behavioral") return 1;
    return DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty];
  });
  return { items: chosen.slice(0, config.length), relaxed };
}

/* ───────────── Interviewer phrases ───────────── */

export const PHRASES = {
  intro: {
    en: (track: string, n: number) => `Thanks for coming in. This is a ${track} interview with ${n} main questions, each with a follow-up. Answer as you would out loud: be direct, then explain your reasoning.`,
    es: (track: string, n: number) => `Gracias por venir. Es una entrevista de ${track} con ${n} preguntas principales, cada una con una repregunta. Responde como lo harías en voz alta: ve al grano y después explica tu razonamiento.`,
  },
  next: { en: ["Let's move on.", "Next question.", "OK, a different topic."], es: ["Pasemos a otra cosa.", "Siguiente pregunta.", "Bien, cambiemos de tema."] },
  numericWrong: {
    en: "I'm not sure that number is right. Let's dig into how you got there.",
    es: "No estoy seguro de que ese número sea correcto. Veamos cómo has llegado a él.",
  },
  partial: {
    en: "That's part of it. Let me push you a bit.",
    es: "Eso es una parte. Déjame apretarte un poco.",
  },
  outro: {
    en: "That's all from me. Thanks — let's look at how it went.",
    es: "Por mi parte es todo. Gracias, veamos cómo ha ido.",
  },
};

export function t(b: Bilingual, lang: Lang) {
  return b[lang];
}

/* ───────────── Summary ───────────── */

export interface Turn {
  itemId: string;
  stage: "main" | "followup";
  question: string;
  answer: string;
  evaluation: AnswerEval;
  followKind?: "deeper" | "probe";
  skipped?: boolean;
}

export interface InterviewSummary {
  technical: number;
  structure: number;
  numerical: number | null;
  clarity: number;
  answered: number;
  weakConcepts: { itemId: string; label: string }[];
  strongItems: string[];
  topics: TopicId[];
}

export function getItem(id: string): InterviewItem | undefined {
  return INTERVIEW_ITEMS.find((i) => i.id === id);
}

export function summarize(turns: Turn[], lang: Lang): InterviewSummary {
  const answered = turns.filter((t) => !t.skipped && t.answer.trim().length > 0);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const numericTurns = answered.filter((t) => t.evaluation.numericCorrect !== null);
  const weakConcepts: { itemId: string; label: string }[] = [];
  const strongItems: string[] = [];
  const topics = new Set<TopicId>();

  for (const turn of turns) {
    const item = getItem(turn.itemId);
    if (!item) continue;
    item.topics.forEach((tp) => topics.add(tp));
    const concepts = turn.stage === "main" ? item.concepts : item.followUp.concepts;
    const keyMissing = concepts.filter((c) => (c.key || turn.evaluation.hits.length === 0) && turn.evaluation.missing.includes(c.id));
    for (const c of keyMissing.slice(0, 2)) weakConcepts.push({ itemId: item.id, label: c.label[lang] });
    if (turn.stage === "main" && turn.evaluation.strong) strongItems.push(item.id);
  }

  return {
    technical: avg(turns.map((t) => (t.skipped ? 0 : t.evaluation.technical))),
    structure: avg(answered.map((t) => t.evaluation.structure)),
    numerical: numericTurns.length ? numericTurns.filter((t) => t.evaluation.numericCorrect).length / numericTurns.length : null,
    clarity: avg(answered.map((t) => t.evaluation.clarity)),
    answered: answered.length,
    weakConcepts,
    strongItems,
    topics: [...topics],
  };
}
