import { BQ_CATEGORIES, type BQCategory } from "@/content/behaviourals/questions";
import { CAREER_GUIDES } from "@/content/careers/guides";
import { TEASERS } from "@/content/brain-teasers";
import { COURSES, lessonHref } from "@/content/courses";
import { MOCK_LEVELS } from "@/content/mock-interview";
import { QUESTIONS } from "@/content/questions";
import { INTERVIEW_TRACK_IDS, TOPICS, TRACKS } from "@/content/taxonomy";
import type { Lang, TopicId, TrackId } from "@/content/types";

/* ───────────── Inputs ───────────── */

export type PlanFocus = "both" | "technical" | "behavioural";
export type PlanLevel = "new" | "some" | "strong";

/** What the learner tells us. The tasks are generated from this, so they never need storing. */
export interface PlanInput {
  /** First day of the plan, YYYY-MM-DD (the day it was created). */
  startDate: string;
  /** Day of the interview, YYYY-MM-DD. */
  interviewDate: string;
  track: TrackId;
  firm: string;
  /** Study days per week, 3–7. */
  daysPerWeek: number;
  /** Minutes available on each study day. */
  minutesPerDay: number;
  focus: PlanFocus;
  level: PlanLevel;
}

/* ───────────── Output ───────────── */

export type TaskKind = "learn" | "practice" | "challenge" | "mock" | "behavioural" | "career" | "review" | "interview";
export type PlanPhase = "foundations" | "practice" | "final" | "eve" | "interview";

export interface PlanTask {
  /** Stable for the same input: `${date}#${n}`. */
  id: string;
  date: string;
  kind: TaskKind;
  phase: PlanPhase;
  title: string;
  detail: string;
  href: string;
  minutes: number;
}

export interface PlanDay {
  date: string;
  phase: PlanPhase;
  tasks: PlanTask[];
}

export interface Plan {
  days: PlanDay[];
  tasks: PlanTask[];
  /** Lessons that did not fit in the time available. */
  skippedLessons: number;
}

export const PHASES: Record<PlanPhase, { title: string; blurb: string }> = {
  foundations: { title: "Foundations", blurb: "Learn the theory your interview will test." },
  practice: { title: "Practice", blurb: "Drill questions, the 500 Challenge and the mock interview." },
  final: { title: "Final stretch", blurb: "Interview-style questions, your weak spots and your stories." },
  eve: { title: "Day before", blurb: "Light review and rest." },
  interview: { title: "Interview day", blurb: "Good luck." },
};

const PHASES_ES: Record<PlanPhase, { title: string; blurb: string }> = {
  foundations: { title: "Fundamentos", blurb: "Aprende la teoría que te van a preguntar en la entrevista." },
  practice: { title: "Práctica", blurb: "Preguntas de práctica, el 500 Challenge y el Mock interview." },
  final: { title: "Recta final", blurb: "Preguntas tipo entrevista, tus puntos débiles y tus historias." },
  eve: { title: "Día anterior", blurb: "Repaso ligero y descanso." },
  interview: { title: "Día de la entrevista", blurb: "¡Mucha suerte!" },
};

/** Phase titles and blurbs in the given language. */
export const PHASES_BY_LANG: Record<Lang, Record<PlanPhase, { title: string; blurb: string }>> = { en: PHASES, es: PHASES_ES };

/** Every piece of text the plan generates. Only the text changes between languages, never the tasks or ids. */
const TX_EN = {
    noDate: "Choose the date of your interview.",
    tooSoon: (n: number) => `The interview needs to be at least ${n} days away to build a plan.`,
    tooFar: "Pick a date within the next year.",
    review: (t: string) => `Review: ${t}`,
    lessonDetail: (course: string, i: number, n: number) => `${course} · lesson ${i} of ${n}`,
    practiceSet: (topic: string, round: number) => `${topic} practice${round > 1 ? ` (round ${round})` : ""}`,
    practiceSetDetail: "10 questions with instant feedback.",
    challenge: "500 Challenge: 15 questions",
    challengeDetail: "Carry on along the path; missed questions go to your repeat list.",
    mock: (level: number, title: string) => `Mock interview level ${level}: ${title}`,
    mockDetail: "10 timed numeric questions. Score 7/10 to pass.",
    prep: (track: string) => `Interview Preparation: ${track}`,
    prepDetail: "Interview-style questions weighted towards traps, cases and open answers.",
    reviewMissed: "Review questions you got wrong",
    reviewMissedDetail: "Redo your incorrect practice answers until they stick.",
    story: (cat: string) => `Write a STAR story: ${cat}`,
    storyDetail: "Add it to your story bank.",
    guide: (track: string) => `Read the ${track} career guide`,
    guideDetail: "The role, the recruiting process and what interviewers expect.",
    behavGuide: "Read the behavioural guide",
    behavGuideDetail: "What interviewers test and how STAR answers work.",
    teasers: (n: number) => `Brain teasers: solve ${n}`,
    teasersDetail: "Probability, expected value, mental maths and logic puzzles. Think out loud.",
    library: "Behavioural question library",
    libraryDetail: "Read five questions and outline an answer to each from your stories.",
    research: (firm: string) => `Research ${firm}`,
    researchDetail: "Recent deals and news, the team and why you want to join them.",
    beatBest: "Mock interview: beat your best score",
    beatBestDetail: "Replay your highest unlocked level against the clock.",
    rehearse: "Rehearse your stories out loud",
    rehearseDetail: "Time each one: two minutes, Situation to Result.",
    checklist: "Run through the first-round checklist",
    checklistDetail: "CV walk-through, your stories, questions for the interviewer.",
    lightMock: "One light mock interview level",
    lightMockDetail: "A warm-up you know you can pass. Then stop and rest.",
    interviewAt: (firm: string) => `Interview at ${firm}`,
    trackInterview: (track: string) => `${track} interview`,
    interviewDetail: "Arrive early, breathe, and walk them through your thinking.",
    icsTasks: (title: string, n: number) => `${title}: ${n} task${n === 1 ? "" : "s"}`,
};

type Tx = typeof TX_EN;

const TX: Record<Lang, Tx> = {
  en: TX_EN,
  es: {
    noDate: "Elige la fecha de tu entrevista.",
    tooSoon: (n: number) => `La entrevista tiene que ser dentro de al menos ${n} días para crear un plan.`,
    tooFar: "Elige una fecha dentro del próximo año.",
    review: (t: string) => `Repaso: ${t}`,
    lessonDetail: (course: string, i: number, n: number) => `${course} · lección ${i} de ${n}`,
    practiceSet: (topic: string, round: number) => `Práctica de ${topic}${round > 1 ? ` (ronda ${round})` : ""}`,
    practiceSetDetail: "10 preguntas con corrección al instante.",
    challenge: "500 Challenge: 15 preguntas",
    challengeDetail: "Sigue avanzando por el camino; las preguntas falladas van a tu lista de repaso.",
    mock: (level: number, title: string) => `Mock interview nivel ${level}: ${title}`,
    mockDetail: "10 preguntas numéricas cronometradas. Necesitas 7/10 para aprobar.",
    prep: (track: string) => `Interview Preparation: ${track}`,
    prepDetail: "Preguntas tipo entrevista, con más peso en trampas, casos y respuestas abiertas.",
    reviewMissed: "Repasa las preguntas que fallaste",
    reviewMissedDetail: "Rehaz tus respuestas incorrectas hasta que se te queden.",
    story: (cat: string) => `Escribe una historia STAR: ${cat}`,
    storyDetail: "Añádela a tu banco de historias.",
    guide: (track: string) => `Lee la guía de carrera de ${track}`,
    guideDetail: "El puesto, el proceso de selección y lo que esperan los entrevistadores.",
    behavGuide: "Lee la guía de Behaviourals",
    behavGuideDetail: "Qué evalúan los entrevistadores y cómo funcionan las respuestas STAR.",
    teasers: (n: number) => `Brain Teasers: resuelve ${n}`,
    teasersDetail: "Probabilidad, valor esperado, cálculo mental y acertijos lógicos. Piensa en voz alta.",
    library: "Biblioteca de preguntas de Behaviourals",
    libraryDetail: "Lee cinco preguntas y esboza una respuesta a cada una con tus historias.",
    research: (firm: string) => `Investiga ${firm}`,
    researchDetail: "Deals y noticias recientes, el equipo y por qué quieres unirte a ellos.",
    beatBest: "Mock interview: supera tu mejor puntuación",
    beatBestDetail: "Repite tu nivel desbloqueado más alto contra el reloj.",
    rehearse: "Ensaya tus historias en voz alta",
    rehearseDetail: "Cronometra cada una: dos minutos, de la Situación al Resultado.",
    checklist: "Repasa la checklist de primera ronda",
    checklistDetail: "Repaso del CV, tus historias y preguntas para el entrevistador.",
    lightMock: "Un nivel suave del Mock interview",
    lightMockDetail: "Un calentamiento que sabes que vas a aprobar. Después para y descansa.",
    interviewAt: (firm: string) => `Entrevista en ${firm}`,
    trackInterview: (track: string) => `Entrevista de ${track}`,
    interviewDetail: "Llega con tiempo, respira y explícales cómo razonas.",
    icsTasks: (title: string, n: number) => `${title}: ${n} tarea${n === 1 ? "" : "s"}`,
  },
};

/* ───────────── Dates ───────────── */

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(iso: string, n: number): string {
  const d = parseDate(iso);
  d.setDate(d.getDate() + n);
  return toIso(d);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000);
}

/** Weekdays (0 = Sunday) used for each number of study days per week. */
const STUDY_WEEKDAYS: Record<number, number[]> = {
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export const MIN_DAYS_AHEAD = 2;
export const MAX_DAYS_AHEAD = 365;

/** Returns an error message, or null when the input can make a plan. */
export function validatePlanInput(input: Pick<PlanInput, "startDate" | "interviewDate">, lang: Lang = "en"): string | null {
  const tx = TX[lang];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.interviewDate)) return tx.noDate;
  const ahead = daysBetween(input.startDate, input.interviewDate);
  if (ahead < MIN_DAYS_AHEAD) return tx.tooSoon(MIN_DAYS_AHEAD);
  if (ahead > MAX_DAYS_AHEAD) return tx.tooFar;
  return null;
}

/* ───────────── Building blocks ───────────── */

type Draft = Omit<PlanTask, "id" | "date" | "phase">;

const MIN_QUESTIONS_FOR_SET = 5;

function practiceTopicsFor(track: TrackId): TopicId[] {
  const guide = CAREER_GUIDES.find((g) => g.track === track);
  const wanted = (guide?.practiceTopics ?? ["accounting", "valuation"]) as TopicId[];
  const counts = new Map<string, number>();
  for (const q of QUESTIONS) counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1);
  const usable = wanted.filter((t) => (counts.get(t) ?? 0) >= MIN_QUESTIONS_FOR_SET && t in TOPICS);
  return usable.length ? usable : (["accounting", "valuation"] as TopicId[]);
}

function coursesFor(track: TrackId, level: PlanLevel) {
  const guide = CAREER_GUIDES.find((g) => g.track === track);
  const ids = new Set(guide?.courses ?? []);
  let picked = COURSES.filter((c) => ids.has(c.id));
  // Every track gets at least the core of accounting and valuation.
  for (const core of ["accounting-fundamentals", "dcf"]) {
    if (picked.length < 3 && !picked.some((c) => c.id === core)) picked.push(COURSES.find((c) => c.id === core)!);
  }
  picked = COURSES.filter((c) => picked.includes(c)); // keep the recommended order
  if (level !== "new") picked = picked.filter((c) => c.id !== "finance-101");
  return picked;
}

function lessonTasks(track: TrackId, level: PlanLevel, tx: Tx): Draft[] {
  return coursesFor(track, level).flatMap((c) =>
    c.lessons.map((l, i) => ({
      kind: "learn" as const,
      title: level === "strong" ? tx.review(l.title) : l.title,
      detail: tx.lessonDetail(c.title, i + 1, c.lessons.length),
      href: lessonHref(c.id, l.id),
      // Strong candidates skim: half the time.
      minutes: level === "strong" ? Math.max(10, Math.round(l.minutes / 2)) : l.minutes,
    })),
  );
}

/** Tracks whose interviews regularly include brain teasers. */
const TEASER_TRACKS: TrackId[] = ["sales-trading", "quant-finance", "consulting", "hedge-funds"];
const TEASERS_PER_ROUND = 4;
const TEASER_ROUNDS = Math.ceil(TEASERS.length / TEASERS_PER_ROUND);

const STORY_ORDER: BQCategory[] = ["background", "motivation", "teamwork", "leadership", "failure", "strengths", "conflict", "pressure"];

const practiceSet = (t: TopicId, round: number, tx: Tx): Draft => ({
  kind: "practice",
  title: tx.practiceSet(TOPICS[t].label, round),
  detail: tx.practiceSetDetail,
  href: `/practice/session/?mode=standard&topic=${t}`,
  minutes: 20,
});

const challengeSession = (tx: Tx): Draft => ({
  kind: "challenge",
  title: tx.challenge,
  detail: tx.challengeDetail,
  href: "/challenge/play/",
  minutes: 20,
});

const mockLevel = (level: number, tx: Tx, lang: Lang): Draft => {
  const l = MOCK_LEVELS.find((m) => m.level === level)!;
  return {
    kind: "mock",
    title: tx.mock(level, l.title[lang]),
    detail: tx.mockDetail,
    href: "/technicals/interview/",
    minutes: 10,
  };
};

function interviewPrep(track: TrackId, tx: Tx): Draft {
  const supported = INTERVIEW_TRACK_IDS.includes(track);
  return {
    kind: "practice",
    title: tx.prep(TRACKS[track].label),
    detail: tx.prepDetail,
    href: supported ? `/practice/session/?mode=interview&track=${track}` : "/practice/session/?mode=interview",
    minutes: 25,
  };
}

const reviewMissed = (tx: Tx): Draft => ({
  kind: "review",
  title: tx.reviewMissed,
  detail: tx.reviewMissedDetail,
  href: "/practice/session/?mode=review",
  minutes: 20,
});

const storyTask = (c: BQCategory, tx: Tx): Draft => ({
  kind: "behavioural",
  title: tx.story(BQ_CATEGORIES[c]),
  detail: tx.storyDetail,
  href: `/behaviourals/stories/?category=${c}`,
  minutes: 25,
});

function careerGuide(track: TrackId, tx: Tx): Draft {
  const guide = CAREER_GUIDES.find((g) => g.track === track);
  return {
    kind: "career",
    title: tx.guide(TRACKS[track].label),
    detail: tx.guideDetail,
    href: guide ? `/career/${guide.slug}/` : "/career/",
    minutes: 20,
  };
}

/* ───────────── Scheduling ───────────── */

/** Packs tasks into days, at least one per day and otherwise up to the daily budget. Returns what did not fit. */
function pack(days: PlanDay[], queue: Draft[], budget: number, phase: PlanPhase): Draft[] {
  const rest = [...queue];
  for (const day of days) {
    let used = 0;
    while (rest.length && (day.tasks.length === 0 || used + rest[0].minutes <= budget)) {
      const t = rest.shift()!;
      used += t.minutes;
      day.tasks.push({ ...t, id: `${day.date}#${day.tasks.length}`, date: day.date, phase });
    }
  }
  return rest;
}

/** Repeats `cycle` until there is roughly enough work to fill `capacity` minutes. */
function fill(base: Draft[], cycle: (round: number) => Draft[], capacity: number): Draft[] {
  const out = [...base];
  let minutes = out.reduce((s, t) => s + t.minutes, 0);
  for (let round = 1; minutes < capacity && round < 400; round++) {
    const next = cycle(round);
    if (!next.length) break;
    for (const t of next) {
      out.push(t);
      minutes += t.minutes;
    }
  }
  return out;
}

/** Interleaves b into a: one item of b after every `every` items of a. */
function interleave<T>(a: T[], b: T[], every: number): T[] {
  const out: T[] = [];
  const rest = [...b];
  a.forEach((x, i) => {
    out.push(x);
    if ((i + 1) % every === 0 && rest.length) out.push(rest.shift()!);
  });
  return [...out, ...rest];
}

/** Builds the day-by-day plan. Pure and deterministic: the same input always gives the same tasks and ids. */
export function buildPlan(input: PlanInput, lang: Lang = "en"): Plan {
  const tx = TX[lang];
  const { startDate, interviewDate, track, focus, level, firm } = input;
  const budget = Math.max(15, input.minutesPerDay);
  const weekdays = STUDY_WEEKDAYS[Math.min(7, Math.max(3, input.daysPerWeek))];
  const eve = addDays(interviewDate, -1);
  const tech = focus !== "behavioural";
  const behav = focus !== "technical";
  const firmName = firm.trim();

  // Study days run from the start to two days before the interview.
  const study: string[] = [];
  for (let d = startDate; d < eve; d = addDays(d, 1)) {
    if (weekdays.includes(parseDate(d).getDay())) study.push(d);
  }
  // A short plan still gets every remaining day.
  if (study.length < 3) {
    study.length = 0;
    for (let d = startDate; d < eve; d = addDays(d, 1)) study.push(d);
  }

  // The last fifth is the final stretch. Before it, foundations take what they need
  // (up to 60% of those days) and practice gets everything after them.
  const n = study.length;
  const finalCount = n === 0 ? 0 : Math.max(1, Math.round(n * 0.2));
  const mainDates = study.slice(0, n - finalCount);
  const foundationMax = mainDates.length < 4 ? Math.floor(mainDates.length / 2) : Math.round(mainDates.length * 0.6);

  const mkDays = (dates: string[], phase: PlanPhase): PlanDay[] => dates.map((date) => ({ date, phase, tasks: [] }));
  const final = mkDays(study.slice(n - finalCount), "final");
  const capacity = (days: PlanDay[]) => days.length * budget;
  const topics = practiceTopicsFor(track);

  /* Foundations: lessons, with the behavioural groundwork woven in. */
  const lessons = tech ? lessonTasks(track, level, tx) : [];
  const groundwork: Draft[] = [
    careerGuide(track, tx),
    ...(behav
      ? [
          { kind: "behavioural" as const, title: tx.behavGuide, detail: tx.behavGuideDetail, href: "/behaviourals/", minutes: 25 },
          ...STORY_ORDER.slice(0, 4).map((c) => storyTask(c, tx)),
        ]
      : []),
  ];
  const foundations = mkDays(mainDates.slice(0, foundationMax), "foundations");
  const left = pack(foundations, interleave(lessons, groundwork, 3), budget, "foundations");
  const skippedLessons = left.filter((t) => t.kind === "learn").length;
  const usedFoundationDays = foundations.filter((d) => d.tasks.length > 0).length;

  /* Practice: sets by section, the challenge and the mock interview levels in order, with stories spread through. */
  const practice = mkDays(mainDates.slice(usedFoundationDays), "practice");
  const behaviouralExtras = [...left.filter((t) => t.kind !== "learn"), ...(behav ? STORY_ORDER.slice(4).map((c) => storyTask(c, tx)) : [])];
  const drills = fill(
    [],
    (round) => {
      const items: Draft[] = [];
      if (tech) {
        topics.forEach((t, i) => {
          items.push(practiceSet(t, round, tx));
          if (i % 2 === 1) items.push(challengeSession(tx));
        });
        if (round <= MOCK_LEVELS.length) items.splice(1, 0, mockLevel(round, tx, lang));
      }
      if (tech && TEASER_TRACKS.includes(track) && round <= TEASER_ROUNDS) {
        items.push({ kind: "practice", title: tx.teasers(TEASERS_PER_ROUND), detail: tx.teasersDetail, href: "/brain-teasers/", minutes: 20 });
      }
      if (behav) {
        items.push({ kind: "behavioural", title: tx.library, detail: tx.libraryDetail, href: "/behaviourals/questions/", minutes: 25 });
      }
      return items;
    },
    capacity(practice) - behaviouralExtras.reduce((s, t) => s + t.minutes, 0),
  );
  if (practice.length) pack(practice, tech ? interleave(drills, behaviouralExtras, 2) : [...behaviouralExtras, ...drills], budget, "practice");

  /* Final stretch: interview-style questions, weak spots, rehearsal and the firm. */
  const finalBase: Draft[] = [
    ...(firmName
      ? [{ kind: "career" as const, title: tx.research(firmName), detail: tx.researchDetail, href: careerGuide(track, tx).href, minutes: 30 }]
      : []),
  ];
  const finalQueue = fill(
    finalBase,
    () => [
      ...(tech ? [interviewPrep(track, tx), reviewMissed(tx)] : []),
      ...(tech ? [{ kind: "mock" as const, title: tx.beatBest, detail: tx.beatBestDetail, href: "/technicals/interview/", minutes: 10 }] : []),
      ...(behav
        ? [{ kind: "behavioural" as const, title: tx.rehearse, detail: tx.rehearseDetail, href: "/behaviourals/stories/", minutes: 25 }]
        : []),
    ],
    capacity(final),
  );
  if (final.length) pack(final, finalQueue, budget, "final");

  /* The day before and the day itself. */
  const eveDay: PlanDay = { date: eve, phase: "eve", tasks: [] };
  pack(
    [eveDay],
    [
      { kind: "review", title: tx.checklist, detail: tx.checklistDetail, href: "/career/checklists/", minutes: 20 },
      ...(tech ? [{ kind: "mock" as const, title: tx.lightMock, detail: tx.lightMockDetail, href: "/technicals/interview/", minutes: 10 }] : []),
    ],
    Number.MAX_SAFE_INTEGER,
    "eve",
  );
  const interviewDay: PlanDay = {
    date: interviewDate,
    phase: "interview",
    tasks: [
      {
        id: `${interviewDate}#0`,
        date: interviewDate,
        phase: "interview",
        kind: "interview",
        title: firmName ? tx.interviewAt(firmName) : tx.trackInterview(TRACKS[track].label),
        detail: tx.interviewDetail,
        href: "/career/checklists/",
        minutes: 0,
      },
    ],
  };

  const days = [...foundations, ...practice, ...final, eveDay, interviewDay].filter((d) => d.tasks.length > 0);
  return { days, tasks: days.flatMap((d) => d.tasks), skippedLessons };
}

/* ───────────── Calendar export ───────────── */

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** One all-day event per plan day, listing that day's tasks. */
export function planToIcs(plan: Plan, title: string, origin: string, lang: Lang = "en"): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FinanceGo//Interview planner//EN", "CALSCALE:GREGORIAN"];
  for (const day of plan.days) {
    const start = day.date.replace(/-/g, "");
    const end = addDays(day.date, 1).replace(/-/g, "");
    const summary = day.phase === "interview" ? day.tasks[0].title : TX[lang].icsTasks(title, day.tasks.length);
    const description = day.tasks.map((t) => `• ${t.title} (${origin}${t.href})`).join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${day.date}-${title.replace(/\W+/g, "-").toLowerCase()}@financego`,
      `DTSTAMP:${start}T000000Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${icsEscape(summary)}`,
      `DESCRIPTION:${icsEscape(description)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
