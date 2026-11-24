"use client";

import Link from "@/components/i18n/Link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  MessagesSquare,
  Plus,
  RotateCcw,
  Star,
  Target,
  Trash2,
  Trophy,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { TRACKS, TRACK_IDS } from "@/content/taxonomy";
import type { TrackId } from "@/content/types";
import {
  addDays,
  buildPlan,
  daysBetween,
  MAX_DAYS_AHEAD,
  MIN_DAYS_AHEAD,
  parseDate,
  PHASES_BY_LANG,
  planToIcs,
  toIso,
  validatePlanInput,
  type PlanDay,
  type PlanFocus,
  type PlanLevel,
  type PlanPhase,
  type PlanTask,
  type TaskKind,
} from "@/lib/planner";
import { actions, localDate, useHydrated, useStore, type SavedPlan } from "@/lib/store";
import { BASE_PATH } from "@/lib/base-path";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Card, Chip, Input, Label, ProgressBar, Select } from "@/components/ui/primitives";
import { useLang } from "@/components/i18n/LangProvider";
import { LOCALES, type Lang } from "@/lib/i18n";

const KIND: Record<TaskKind, { icon: LucideIcon; label: Record<Lang, string> }> = {
  learn: { icon: BookOpen, label: { en: "Learn", es: "Learn" } },
  practice: { icon: Target, label: { en: "Practice", es: "Practice" } },
  challenge: { icon: Trophy, label: { en: "500 Challenge", es: "500 Challenge" } },
  mock: { icon: MessagesSquare, label: { en: "Mock interview", es: "Mock interview" } },
  behavioural: { icon: UsersRound, label: { en: "Behavioural", es: "Behaviourals" } },
  career: { icon: Briefcase, label: { en: "Career", es: "Career" } },
  review: { icon: RotateCcw, label: { en: "Review", es: "Repaso" } },
  interview: { icon: Star, label: { en: "Interview", es: "Entrevista" } },
};

const TEXT = {
  en: {
    newPlan: "New plan",
    formTitle: "Build your interview plan",
    formIntro: "Tell us about the interview. We turn the time you have into a day-by-day calendar of what to study on FinanceGo.",
    interviewDate: "Interview date",
    role: "Role",
    optional: "Optional",
    firm: "Firm",
    firmPlaceholder: "e.g. the bank or fund you are interviewing with",
    daysPerWeek: "Study days per week",
    daysOption: (n: number) => `${n} days${n === 5 ? " (weekdays)" : n === 7 ? " (every day)" : ""}`,
    timePerDay: "Time per study day",
    startingFrom: "Where are you starting from?",
    levels: { new: "New to finance", some: "I know the basics", strong: "Just need revision" } as Record<PlanLevel, string>,
    covers: "What will the interview cover?",
    focuses: { both: "Technical and behavioural", technical: "Technical only", behavioural: "Behavioural only" } as Record<PlanFocus, string>,
    create: "Create my plan",
    cancel: "Cancel",
    atAGlance: "Your plan at a glance",
    days: (n: number) => `${n} days`,
    until: (d: string) => `until ${d}`,
    studyDays: (n: number) => `${n} study days`,
    tasksAcross: "tasks across lessons, practice, the 500 Challenge, the mock interview and your stories.",
    skipped: (n: number) => `${n} lesson${n === 1 ? "" : "s"} did not fit. Add study days or time per day to cover the full theory.`,
    pickDate: (n: number) => `Pick an interview date at least ${n} days away.`,
    daysToGo: (n: number) => (n > 1 ? `${n} days to go.` : n === 1 ? "Tomorrow." : n === 0 ? "Today. Good luck." : "This interview has passed."),
    tasksDone: (done: number, total: number) => `${done} of ${total} tasks done.`,
    planProgress: "Plan progress",
    addToCalendar: "Add to my calendar",
    deletePlan: "Delete plan",
    confirmDelete: (title: string) => `Delete the plan for your ${title}? Your ticked tasks for this plan will be lost.`,
    overdue: (n: number) => `task${n === 1 ? "" : "s"} from earlier days still open. Fit them in when you can, starting with`,
    showDay: "Show day",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    tasks: (n: number) => `${n} task${n === 1 ? "" : "s"}`,
    more: (n: number) => `+${n} more`,
    today: "Today",
    tomorrow: "Tomorrow",
    totalMinutes: (n: number) => `About ${n} minutes in total.`,
    restDay: "A rest day. Nothing scheduled.",
    nothing: "Nothing scheduled on this day.",
    markUndone: (t: string) => `Mark "${t}" as not done`,
    markDone: (t: string) => `Mark "${t}" as done`,
    open: "Open",
    firmInterview: (f: string) => `${f} interview`,
    trackInterview: (t: string) => `${t} interview`,
  },
  es: {
    newPlan: "Nuevo plan",
    formTitle: "Crea tu plan de entrevista",
    formIntro: "Cuéntanos cómo es la entrevista. Convertimos el tiempo que tienes en un calendario día a día de lo que estudiar en FinanceGo.",
    interviewDate: "Fecha de la entrevista",
    role: "Puesto",
    optional: "Opcional",
    firm: "Empresa",
    firmPlaceholder: "p. ej., el banco o fondo con el que tienes la entrevista",
    daysPerWeek: "Días de estudio por semana",
    daysOption: (n: number) => `${n} días${n === 5 ? " (entre semana)" : n === 7 ? " (todos los días)" : ""}`,
    timePerDay: "Tiempo por día de estudio",
    startingFrom: "¿Desde qué nivel empiezas?",
    levels: { new: "Soy nuevo en finanzas", some: "Conozco lo básico", strong: "Solo necesito repasar" } as Record<PlanLevel, string>,
    covers: "¿Qué cubrirá la entrevista?",
    focuses: { both: "Técnica y behavioural", technical: "Solo técnica", behavioural: "Solo behavioural" } as Record<PlanFocus, string>,
    create: "Crear mi plan",
    cancel: "Cancelar",
    atAGlance: "Tu plan de un vistazo",
    days: (n: number) => `${n} días`,
    until: (d: string) => `hasta el ${d}`,
    studyDays: (n: number) => `${n} días de estudio`,
    tasksAcross: "tareas entre lecciones, práctica, el 500 Challenge, el Mock interview y tus historias.",
    skipped: (n: number) =>
      `${n} ${n === 1 ? "lección no cabe" : "lecciones no caben"} en el plan. Añade días de estudio o más tiempo al día para cubrir toda la teoría.`,
    pickDate: (n: number) => `Elige una fecha de entrevista dentro de al menos ${n} días.`,
    daysToGo: (n: number) => (n > 1 ? `Quedan ${n} días.` : n === 1 ? "Mañana." : n === 0 ? "Hoy. ¡Mucha suerte!" : "Esta entrevista ya ha pasado."),
    tasksDone: (done: number, total: number) => `${done} de ${total} tareas hechas.`,
    planProgress: "Progreso del plan",
    addToCalendar: "Añadir a mi calendario",
    deletePlan: "Eliminar plan",
    confirmDelete: (title: string) => `¿Eliminar el plan de «${title}»? Perderás las tareas que hayas marcado en este plan.`,
    overdue: (n: number) =>
      n === 1 ? "tarea de días anteriores sigue pendiente. Hazla cuando puedas, empezando por" : "tareas de días anteriores siguen pendientes. Hazlas cuando puedas, empezando por",
    showDay: "Ver día",
    prevMonth: "Mes anterior",
    nextMonth: "Mes siguiente",
    tasks: (n: number) => `${n} tarea${n === 1 ? "" : "s"}`,
    more: (n: number) => `+${n} más`,
    today: "Hoy",
    tomorrow: "Mañana",
    totalMinutes: (n: number) => `Unos ${n} minutos en total.`,
    restDay: "Día de descanso. Nada programado.",
    nothing: "Nada programado este día.",
    markUndone: (t: string) => `Marcar «${t}» como no hecha`,
    markDone: (t: string) => `Marcar «${t}» como hecha`,
    open: "Abrir",
    firmInterview: (f: string) => `Entrevista en ${f}`,
    trackInterview: (t: string) => `Entrevista de ${t}`,
  },
} satisfies Record<Lang, Record<string, unknown>>;

const PHASE_STYLE: Record<PlanPhase, { dot: string; cell: string }> = {
  foundations: { dot: "bg-ice", cell: "bg-ice-soft/70" },
  practice: { dot: "bg-navy/55", cell: "bg-ice/40" },
  final: { dot: "bg-navy", cell: "bg-navy/15" },
  eve: { dot: "bg-success", cell: "bg-success-soft" },
  interview: { dot: "bg-error", cell: "bg-error-soft" },
};

/** Short weekday names, Monday first (2024-01-01 was a Monday). */
const weekdays = (lang: Lang) => Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(LOCALES[lang], { weekday: "short" }));

/** Daily study time choices, in minutes. */
const DAILY_MINUTES = [15, 20, 30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240, 300, 360, 420, 480];

function fmtMinutes(n: number, lang: Lang) {
  const h = Math.floor(n / 60);
  const m = n % 60;
  if (lang === "es") return !h ? `${m} minutos` : `${h} h${m ? ` ${m} min` : ""}`;
  if (!h) return `${m} minutes`;
  return `${h} hour${h === 1 ? "" : "s"}${m ? ` ${m} min` : ""}`;
}

const fmtDay = (iso: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) =>
  parseDate(iso).toLocaleDateString(LOCALES[lang], opts);

/** Capitalises the first letter: Spanish month and weekday names come in lower case. */
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const planTitle = (p: Pick<SavedPlan, "firm" | "track">, lang: Lang) =>
  p.firm.trim() ? TEXT[lang].firmInterview(p.firm.trim()) : TEXT[lang].trackInterview(TRACKS[p.track].label);

export function Planner() {
  const lang = useLang();
  const tx = TEXT[lang];
  const state = useStore();
  const hydrated = useHydrated();
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />;

  const plans = [...state.plans].sort((a, b) => a.interviewDate.localeCompare(b.interviewDate));
  const active = plans.find((p) => p.id === selected) ?? plans[0];

  if (creating || !active) {
    return (
      <PlanForm
        defaultTrack={state.profile.track || "investment-banking"}
        onCancel={plans.length ? () => setCreating(false) : undefined}
        onCreated={(id) => {
          setSelected(id);
          setCreating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {plans.map((p) => (
          <Chip key={p.id} active={p.id === active.id} onClick={() => setSelected(p.id)}>
            {planTitle(p, lang)} · {fmtDay(p.interviewDate, lang, { day: "numeric", month: "short" })}
          </Chip>
        ))}
        <Button variant="ghost" size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> {tx.newPlan}
        </Button>
      </div>
      <PlanView key={active.id} plan={active} />
    </div>
  );
}

/* ───────────── Form ───────────── */

function PlanForm({ defaultTrack, onCreated, onCancel }: { defaultTrack: TrackId; onCreated: (id: string) => void; onCancel?: () => void }) {
  const lang = useLang();
  const tx = TEXT[lang];
  const phases = PHASES_BY_LANG[lang];
  const today = localDate();
  const [interviewDate, setInterviewDate] = useState(addDays(today, 60));
  const [track, setTrack] = useState<TrackId>(defaultTrack);
  const [firm, setFirm] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [minutesPerDay, setMinutesPerDay] = useState(60);
  const [level, setLevel] = useState<PlanLevel>("new");
  const [focus, setFocus] = useState<PlanFocus>("both");
  const [error, setError] = useState<string | null>(null);

  const input = { startDate: today, interviewDate, track, firm: firm.slice(0, 60), daysPerWeek, minutesPerDay, level, focus };
  const problem = validatePlanInput(input, lang);
  const preview = useMemo(() => (problem ? null : buildPlan(input, lang)), [problem, lang, interviewDate, track, firm, daysPerWeek, minutesPerDay, level, focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problem) return setError(problem);
    onCreated(actions.addPlan(input));
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card className="space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="font-serif text-3xl text-navy">{tx.formTitle}</h2>
          <p className="mt-1 text-ink-muted">{tx.formIntro}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="pl-date">{tx.interviewDate}</Label>
            <Input
              id="pl-date"
              type="date"
              value={interviewDate}
              min={addDays(today, MIN_DAYS_AHEAD)}
              max={addDays(today, MAX_DAYS_AHEAD)}
              onChange={(e) => {
                setInterviewDate(e.target.value);
                setError(null);
              }}
              required
            />
          </div>
          <div>
            <Label htmlFor="pl-track">{tx.role}</Label>
            <Select id="pl-track" value={track} onChange={(e) => setTrack(e.target.value as TrackId)}>
              {TRACK_IDS.map((t) => (
                <option key={t} value={t}>
                  {TRACKS[t].label}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pl-firm" hint={tx.optional}>
              {tx.firm}
            </Label>
            <Input id="pl-firm" value={firm} maxLength={60} placeholder={tx.firmPlaceholder} onChange={(e) => setFirm(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pl-days">{tx.daysPerWeek}</Label>
            <Select id="pl-days" value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value))}>
              {[3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {tx.daysOption(n)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="pl-mins">{tx.timePerDay}</Label>
            <Select id="pl-mins" value={minutesPerDay} onChange={(e) => setMinutesPerDay(Number(e.target.value))}>
              {DAILY_MINUTES.map((n) => (
                <option key={n} value={n}>
                  {fmtMinutes(n, lang)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-navy">{tx.startingFrom}</legend>
          <div className="flex flex-wrap gap-2">
            {(["new", "some", "strong"] as const).map((v) => (
              <Chip key={v} type="button" active={level === v} onClick={() => setLevel(v)}>
                {tx.levels[v]}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-navy">{tx.covers}</legend>
          <div className="flex flex-wrap gap-2">
            {(["both", "technical", "behavioural"] as const).map((v) => (
              <Chip key={v} type="button" active={focus === v} onClick={() => setFocus(v)}>
                {tx.focuses[v]}
              </Chip>
            ))}
          </div>
        </fieldset>

        {(error ?? problem) && interviewDate && <p className="text-sm text-error-ink">{error ?? problem}</p>}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={Boolean(problem)}>
            <CalendarPlus className="h-5 w-5" /> {tx.create}
          </Button>
          {onCancel && (
            <Button variant="ghost" size="lg" onClick={onCancel}>
              {tx.cancel}
            </Button>
          )}
        </div>
      </Card>

      <Card className="h-fit p-6 lg:sticky lg:top-24">
        <p className="eyebrow">{tx.atAGlance}</p>
        {preview ? (
          <>
            <p className="mt-3 font-serif text-4xl text-navy">{tx.days(daysBetween(today, interviewDate))}</p>
            <p className="text-sm text-ink-muted">{tx.until(fmtDay(interviewDate, lang))}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {(["foundations", "practice", "final"] as const).map((ph) => {
                const days = preview.days.filter((d) => d.phase === ph);
                if (!days.length) return null;
                return (
                  <li key={ph} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-ink">
                      <span className={cn("h-2.5 w-2.5 rounded-full", PHASE_STYLE[ph].dot)} /> {phases[ph].title}
                    </span>
                    <span className="text-ink-muted">{tx.studyDays(days.length)}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-sm text-ink">
              <strong className="text-navy">{preview.tasks.length - 1}</strong> {tx.tasksAcross}
            </p>
            {preview.skippedLessons > 0 && (
              <p className="mt-3 rounded-xl bg-cream p-3 text-xs text-ink">
                {tx.skipped(preview.skippedLessons)}
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">{tx.pickDate(MIN_DAYS_AHEAD)}</p>
        )}
      </Card>
    </form>
  );
}

/* ───────────── Plan view ───────────── */

function PlanView({ plan }: { plan: SavedPlan }) {
  const lang = useLang();
  const tx = TEXT[lang];
  const phases = PHASES_BY_LANG[lang];
  const today = localDate();
  const built = useMemo(() => buildPlan(plan, lang), [plan, lang]);
  const done = useMemo(() => new Set(plan.done), [plan.done]);
  const byDate = useMemo(() => new Map(built.days.map((d) => [d.date, d])), [built]);

  const work = built.tasks.filter((t) => t.kind !== "interview");
  const completed = work.filter((t) => done.has(t.id)).length;
  const daysLeft = daysBetween(today, plan.interviewDate);
  const overdue = built.days.filter((d) => d.date < today).flatMap((d) => d.tasks).filter((t) => !done.has(t.id));
  const nextDay = built.days.find((d) => d.date >= today);
  const [selectedDate, setSelectedDate] = useState(nextDay?.date ?? built.days.at(-1)?.date ?? today);

  const months = useMemo(() => {
    const out: string[] = [];
    const first = parseDate(plan.startDate);
    const last = parseDate(plan.interviewDate);
    for (let d = new Date(first.getFullYear(), first.getMonth(), 1); d <= last; d.setMonth(d.getMonth() + 1)) out.push(toIso(d));
    return out;
  }, [plan.startDate, plan.interviewDate]);
  const [monthIndex, setMonthIndex] = useState(() => Math.max(0, months.findIndex((m) => m.slice(0, 7) === (nextDay?.date ?? today).slice(0, 7))));

  const download = () => {
    const ics = planToIcs(built, planTitle(plan, lang), window.location.origin + BASE_PATH, lang);
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `financego-${planTitle(plan, lang).toLowerCase().replace(/\W+/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = () => {
    if (window.confirm(tx.confirmDelete(planTitle(plan, lang)))) actions.deletePlan(plan.id);
  };

  const selectedDay = byDate.get(selectedDate);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="eyebrow">
            {TRACKS[plan.track].label} · {fmtDay(plan.interviewDate, lang)}
          </p>
          <h2 className="mt-1 font-serif text-3xl text-navy sm:text-4xl">{planTitle(plan, lang)}</h2>
          <p className="mt-2 text-ink-muted">
            {tx.daysToGo(daysLeft)} {tx.tasksDone(completed, work.length)}
          </p>
          <ProgressBar value={work.length ? completed / work.length : 0} className="mt-4 max-w-md" label={tx.planProgress} />
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted">
            {(["foundations", "practice", "final", "eve", "interview"] as const).map((ph) => (
              <span key={ph} className="flex items-center gap-1.5">
                <span className={cn("h-2.5 w-2.5 rounded-full", PHASE_STYLE[ph].dot)} /> {phases[ph].title}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-2 md:flex-col">
          <Button variant="secondary" onClick={download}>
            <Download className="h-4 w-4" /> {tx.addToCalendar}
          </Button>
          <Button variant="ghost" onClick={remove}>
            <Trash2 className="h-4 w-4" /> {tx.deletePlan}
          </Button>
        </div>
      </Card>

      {overdue.length > 0 && daysLeft >= 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-electric/30 bg-ice-soft/50 p-4">
          <p className="text-sm text-ink">
            <strong className="text-navy">{overdue.length}</strong> {tx.overdue(overdue.length)}{" "}
            <Link href={overdue[0].href} className="font-medium text-electric hover:underline">
              {overdue[0].title}
            </Link>
            .
          </p>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(overdue[0].date)}>
            {tx.showDay}
          </Button>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        {/* Calendar */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" aria-label={tx.prevMonth} disabled={monthIndex === 0} onClick={() => setMonthIndex((i) => i - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-serif text-2xl text-navy">{cap(fmtDay(months[monthIndex], lang, { month: "long", year: "numeric" }))}</h3>
            <Button variant="ghost" size="sm" aria-label={tx.nextMonth} disabled={monthIndex >= months.length - 1} onClick={() => setMonthIndex((i) => i + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <MonthGrid month={months[monthIndex]} byDate={byDate} done={done} today={today} selected={selectedDate} onSelect={setSelectedDate} />
        </Card>

        {/* Selected day */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <DayPanel day={selectedDay} date={selectedDate} today={today} done={done} planId={plan.id} />
        </div>
      </div>
    </div>
  );
}

function MonthGrid({
  month,
  byDate,
  done,
  today,
  selected,
  onSelect,
}: {
  month: string;
  byDate: Map<string, PlanDay>;
  done: Set<string>;
  today: string;
  selected: string;
  onSelect: (d: string) => void;
}) {
  const lang = useLang();
  const tx = TEXT[lang];
  const first = parseDate(month);
  const offset = (first.getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => toIso(new Date(first.getFullYear(), first.getMonth(), i + 1)))];
  while (cells.length % 7) cells.push(null);

  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-1 text-center text-[0.7rem] font-semibold uppercase tracking-wider text-ink-muted">
        {weekdays(lang).map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const day = byDate.get(date);
          const total = day?.tasks.filter((t) => t.kind !== "interview").length ?? 0;
          const finished = day?.tasks.filter((t) => done.has(t.id)).length ?? 0;
          const complete = total > 0 && finished === total;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              aria-pressed={selected === date}
              aria-label={`${fmtDay(date, lang)}${day ? `, ${PHASES_BY_LANG[lang][day.phase].title}, ${tx.tasks(day.tasks.length)}` : ""}`}
              className={cn(
                "flex min-h-14 flex-col rounded-lg border p-1 text-left transition-colors sm:min-h-24 sm:p-1.5",
                day ? PHASE_STYLE[day.phase].cell : "bg-white",
                selected === date ? "border-navy ring-2 ring-navy/30" : "border-transparent hover:border-line-strong",
                !day && "text-ink-muted",
              )}
            >
              <span className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    date === today ? "bg-electric text-white" : day ? "text-navy" : "",
                  )}
                >
                  {Number(date.slice(8))}
                </span>
                {complete && <Check className="h-3.5 w-3.5 text-success" />}
              </span>
              {day && (
                <>
                  <span className="mt-0.5 hidden space-y-0.5 sm:block">
                    {day.tasks.slice(0, 2).map((t) => (
                      <span key={t.id} className={cn("block truncate text-[0.68rem] leading-tight", done.has(t.id) ? "text-ink-muted line-through" : "text-ink")}>
                        {t.kind === "interview" ? <strong className="text-error-ink">{t.title}</strong> : t.title}
                      </span>
                    ))}
                    {day.tasks.length > 2 && <span className="block text-[0.68rem] text-ink-muted">{tx.more(day.tasks.length - 2)}</span>}
                  </span>
                  <span className="mt-auto flex gap-0.5 sm:hidden">
                    {day.tasks.map((t) => (
                      <span key={t.id} className={cn("h-1.5 w-1.5 rounded-full", done.has(t.id) ? "bg-success" : PHASE_STYLE[day.phase].dot)} />
                    ))}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayPanel({ day, date, today, done, planId }: { day?: PlanDay; date: string; today: string; done: Set<string>; planId: string }) {
  const lang = useLang();
  const tx = TEXT[lang];
  const phase = day ? PHASES_BY_LANG[lang][day.phase] : null;
  const label = date === today ? tx.today : date === addDays(today, 1) ? tx.tomorrow : cap(fmtDay(date, lang, { weekday: "long" }));
  return (
    <Card className="p-5 sm:p-6">
      <p className="eyebrow flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" /> {label}
      </p>
      <h3 className="mt-1 font-serif text-2xl text-navy">{fmtDay(date, lang, { day: "numeric", month: "long" })}</h3>
      {day && phase ? (
        <>
          <p className="mt-1 text-sm text-ink-muted">
            {phase.title}: {phase.blurb}
          </p>
          <ul className="mt-4 space-y-3">
            {day.tasks.map((t) => (
              <TaskRow key={t.id} task={t} done={done.has(t.id)} planId={planId} />
            ))}
          </ul>
          {day.tasks.some((t) => t.minutes > 0) && (
            <p className="mt-4 text-xs text-ink-muted">{tx.totalMinutes(day.tasks.reduce((s, t) => s + t.minutes, 0))}</p>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm text-ink-muted">{date > today ? tx.restDay : tx.nothing}</p>
      )}
    </Card>
  );
}

function TaskRow({ task, done, planId }: { task: PlanTask; done: boolean; planId: string }) {
  const lang = useLang();
  const tx = TEXT[lang];
  const { icon: Icon, label } = KIND[task.kind];
  const isInterview = task.kind === "interview";
  return (
    <li className={cn("flex items-start gap-3 rounded-xl border p-3", done ? "border-line bg-cream/60" : "border-line bg-white")}>
      {isInterview ? (
        <Star className="mt-0.5 h-5 w-5 shrink-0 text-error" />
      ) : (
        <button
          type="button"
          onClick={() => actions.togglePlanTask(planId, task.id)}
          aria-pressed={done}
          aria-label={done ? tx.markUndone(task.title) : tx.markDone(task.title)}
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
            done ? "border-success bg-success text-white" : "border-line-strong hover:border-electric",
          )}
        >
          {done && <Check className="h-3.5 w-3.5" />}
        </button>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-ink-muted">
          <Icon className="h-3 w-3" /> {label[lang]}
          {task.minutes > 0 && <span className="font-normal normal-case tracking-normal">· {task.minutes} min</span>}
        </p>
        <p className={cn("mt-0.5 text-sm font-medium", done ? "text-ink-muted line-through" : "text-navy")}>{task.title}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{task.detail}</p>
        {!isInterview && (
          <Link href={task.href} className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-electric hover:underline">
            {tx.open} <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </li>
  );
}
