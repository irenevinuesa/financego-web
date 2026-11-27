"use client";

import Link from "@/components/i18n/Link";
import { useMemo } from "react";
import { ArrowRight, BookOpen, Briefcase, CalendarDays, Check, CircleCheck, CircleDashed, Flame, MessagesSquare, Newspaper, NotebookPen, Puzzle, Settings, Target, Trophy } from "lucide-react";
import { COURSES, lessonHref } from "@/content/courses";
import { TOPICS } from "@/content/taxonomy";
import { BQ_CATEGORIES } from "@/content/behaviourals/questions";
import { actions, localDate, useHydrated, useStore, type SavedPlan } from "@/lib/store";
import { buildPlan, daysBetween, parseDate } from "@/lib/planner";
import { MOCK_LEVELS } from "@/content/mock-interview";
import { MOCK_PASS_MARK, mockLevelsPassed } from "@/lib/mock-interview";
import { TEASERS } from "@/content/brain-teasers";
import { cn } from "@/lib/cn";
import { courseProgress, hasAnyProgress, nextLesson, practiceStats, recentActivity, streak, weakestTopic } from "@/lib/progress";
import { challengeProgress } from "@/lib/challenge";
import { STORY_CATEGORIES } from "@/components/behaviourals/StoryBank";
import { fmtRelative } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader, LocalDataNote, ProgressBar } from "@/components/ui/primitives";
import { useLang } from "@/components/i18n/LangProvider";
import { LOCALES, type Lang } from "@/lib/i18n";

const KIND_ICON = { lesson: BookOpen, practice: Target, interview: MessagesSquare, application: Briefcase, assessment: Trophy, plan: CalendarDays };

const pct = (x: number) => Math.round(x * 100);

/** Capitalises the first letter: Spanish weekday names come in lower case. */
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const TEXT = {
  en: {
    yourDashboard: "Your dashboard",
    greeting: (name: string, fresh: boolean) => (name ? `Welcome back, ${name}.` : fresh ? "Welcome to FinanceGo." : "Welcome back."),
    intro: (fresh: boolean) =>
      fresh ? "Here is where your progress will live. Start anywhere: a lesson, a practice set or the 500 Challenge." : "Here is where you are and what to do next.",
    profile: "Profile & data",
    addName: "Add your name",
    continueLearning: "Continue learning",
    continue: "Continue",
    start: "Start",
    recommended: "Recommended practice",
    lowest: (p: number) => `Your lowest-accuracy topic so far (${p}%).`,
    practiseIt: "Practise it",
    quickPractice: "Quick Practice",
    quickBlurb: "Five mixed questions. A recommendation appears once you have answered a few in each topic.",
    questionsAnswered: "Questions answered",
    accuracy: (p: number) => `${p}% accuracy`,
    streak: "Streak",
    days: (n: number) => `${n} days`,
    best: (n: number) => `Best ${n}`,
    toRepeat: (n: number) => `${n} to repeat`,
    levelsPassed: "levels passed",
    teasers: "Brain teasers",
    solved: "solved",
    learningProgress: "Learning progress",
    allCourses: "All courses",
    courseProgress: (c: string) => `${c} progress`,
    open: "Open",
    answered: (n: number) => ` / ${n} answered`,
    challengeProgress: "500 Challenge progress",
    challengeSummary: (acc: number | null, missed: number) =>
      `${acc === null ? "No answers yet." : `${acc}% correct so far.`} ${missed} missed question${missed === 1 ? "" : "s"} to repeat.`,
    repeatMissed: "Repeat missed",
    stories: (n: number) => `${n} stor${n === 1 ? "y" : "ies"} in your story bank`,
    addStory: "Add a story",
    firstStory: "Write your first story",
    level: (n: number, title: string) => `Level ${n}: ${title}`,
    bestScore: (n: number) => `best ${n}/10`,
    beatBest: "Beat your best",
    nextLevel: "Play the next level",
    solvedOf: (n: number) => ` / ${n} solved`,
    teasersSolved: "Brain teasers solved",
    teasersBlurb: "Probability, expected value, mental maths, logic, sequences and estimation.",
    solveAnother: "Solve another",
    firstTeaser: "Try your first teaser",
    news: "Markets news",
    newsTime: "A selection of market headlines",
    newsBlurb: "Pick a story and practise explaining what it means for equities, bonds and the dollar, the way interviewers ask.",
    headlines: "Read the headlines",
    recentActivity: "Recent activity",
    noActivity: "Nothing yet. Your lessons and practice will appear here.",
    comingUp: "Have an interview coming up?",
    comingUpBlurb: "Enter the date and get a day-by-day plan of what to study on FinanceGo.",
    planMyPrep: "Plan my prep",
    firmInterview: (f: string) => `${f} interview`,
    yourInterview: "Your interview",
    yourPlan: "Your interview plan",
    left: (n: number) => (n === 0 ? "today" : n === 1 ? "tomorrow" : `${n} days to go`),
    planProgress: "Plan progress",
    tasksDone: (d: number, t: number) => `${d} of ${t} tasks done`,
    openCalendar: "Open the calendar",
    today: "Today",
    nextDay: (d: string) => `Next study day: ${d}`,
    nothing: "Nothing scheduled",
    markUndone: (t: string) => `Mark "${t}" as not done`,
    markDone: (t: string) => `Mark "${t}" as done`,
  },
  es: {
    yourDashboard: "Tu Dashboard",
    greeting: (name: string, fresh: boolean) => (name ? `Hola de nuevo, ${name}.` : fresh ? "Te damos la bienvenida a FinanceGo." : "Hola de nuevo."),
    intro: (fresh: boolean) =>
      fresh
        ? "Aquí verás tu progreso. Empieza por donde quieras: una lección, una serie de práctica o el 500 Challenge."
        : "Aquí ves dónde estás y qué hacer a continuación.",
    profile: "Perfil y datos",
    addName: "Añade tu nombre",
    continueLearning: "Sigue aprendiendo",
    continue: "Continuar",
    start: "Empezar",
    recommended: "Práctica recomendada",
    lowest: (p: number) => `Tu tema con menor porcentaje de aciertos hasta ahora (${p}%).`,
    practiseIt: "Practícalo",
    quickPractice: "Quick Practice",
    quickBlurb: "Cinco preguntas variadas. Verás una recomendación cuando hayas respondido unas cuantas de cada tema.",
    questionsAnswered: "Preguntas respondidas",
    accuracy: (p: number) => `${p}% de aciertos`,
    streak: "Racha",
    days: (n: number) => `${n} días`,
    best: (n: number) => `Mejor: ${n}`,
    toRepeat: (n: number) => `${n} por repetir`,
    levelsPassed: "niveles superados",
    teasers: "Brain Teasers",
    solved: "resueltos",
    learningProgress: "Progreso de aprendizaje",
    allCourses: "Todos los cursos",
    courseProgress: (c: string) => `Progreso de ${c}`,
    open: "Abrir",
    answered: (n: number) => ` / ${n} respondidas`,
    challengeProgress: "Progreso del 500 Challenge",
    challengeSummary: (acc: number | null, missed: number) =>
      `${acc === null ? "Aún no hay respuestas." : `${acc}% de aciertos hasta ahora.`} ${missed} ${missed === 1 ? "pregunta fallada" : "preguntas falladas"} por repetir.`,
    repeatMissed: "Repetir falladas",
    stories: (n: number) => `${n} historia${n === 1 ? "" : "s"} en tu banco de historias`,
    addStory: "Añadir una historia",
    firstStory: "Escribe tu primera historia",
    level: (n: number, title: string) => `Nivel ${n}: ${title}`,
    bestScore: (n: number) => `mejor ${n}/10`,
    beatBest: "Supera tu mejor puntuación",
    nextLevel: "Juega el siguiente nivel",
    solvedOf: (n: number) => ` / ${n} resueltos`,
    teasersSolved: "Brain Teasers resueltos",
    teasersBlurb: "Probabilidad, valor esperado, cálculo mental, lógica, secuencias y estimaciones.",
    solveAnother: "Resuelve otro",
    firstTeaser: "Prueba tu primer teaser",
    news: "Noticias de mercados",
    newsTime: "Una selección de titulares de mercados",
    newsBlurb: "Elige una noticia y practica explicar qué significa para equity, bonos y el dólar, como te lo preguntarán en la entrevista.",
    headlines: "Lee los titulares",
    recentActivity: "Actividad reciente",
    noActivity: "Todavía nada. Aquí aparecerán tus lecciones y tu práctica.",
    comingUp: "¿Tienes una entrevista próximamente?",
    comingUpBlurb: "Indica la fecha y obtén un plan día a día de lo que estudiar en FinanceGo.",
    planMyPrep: "Planificar mi preparación",
    firmInterview: (f: string) => `Entrevista en ${f}`,
    yourInterview: "Tu entrevista",
    yourPlan: "Tu plan de entrevista",
    left: (n: number) => (n === 0 ? "hoy" : n === 1 ? "mañana" : `quedan ${n} días`),
    planProgress: "Progreso del plan",
    tasksDone: (d: number, t: number) => `${d} de ${t} tareas hechas`,
    openCalendar: "Abrir el calendario",
    today: "Hoy",
    nextDay: (d: string) => `Próximo día de estudio: ${d}`,
    nothing: "Nada programado",
    markUndone: (t: string) => `Marcar «${t}» como no hecha`,
    markDone: (t: string) => `Marcar «${t}» como hecha`,
  },
} satisfies Record<Lang, Record<string, unknown>>;

export function Dashboard() {
  const lang = useLang();
  const tx = TEXT[lang];
  const state = useStore();
  const hydrated = useHydrated();
  const d = useMemo(
    () => ({
      next: nextLesson(state),
      stats: practiceStats(state),
      streak: streak(state),
      challenge: challengeProgress(state.challenge),
      covered: new Set(state.stories.flatMap((x) => x.categories)),
      activity: recentActivity(state, 8, lang),
      weak: weakestTopic(state),
      courses: COURSES.map((c) => ({ c, p: courseProgress(state, c) })),
      mockPassed: mockLevelsPassed(state.mock),
      plan: [...state.plans].filter((p) => p.interviewDate >= localDate()).sort((a, b) => a.interviewDate.localeCompare(b.interviewDate))[0],
    }),
    [state, lang],
  );

  if (!hydrated) return <div className="h-96 animate-pulse rounded-3xl bg-white/60" />;
  const name = state.profile.name.trim();
  const fresh = !hasAnyProgress(state);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{tx.yourDashboard}</p>
          <h1 className="font-serif text-4xl sm:text-5xl">{tx.greeting(name, fresh)}</h1>
          <p className="mt-2 text-ink-muted">{tx.intro(fresh)}</p>
        </div>
        <Link href="/settings/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-electric">
          <Settings className="h-4 w-4" /> {name ? tx.profile : tx.addName}
        </Link>
      </div>

      <PlanToday plan={d.plan} />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <p className="eyebrow mb-2">{tx.continueLearning}</p>
          <h2 className="font-serif text-2xl">{d.next.lesson.title}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {d.next.course.title} · {d.next.lesson.minutes} min
          </p>
          <p className="mt-3 text-sm text-ink">{d.next.lesson.summary}</p>
          <ButtonLink href={lessonHref(d.next.course.id, d.next.lesson.id)} className="mt-5">
            {d.next.resume ? tx.continue : tx.start} <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Card>
        <Card className="p-6">
          <p className="eyebrow mb-2">{tx.recommended}</p>
          {d.weak ? (
            <>
              <h2 className="text-lg font-semibold text-navy">{TOPICS[d.weak.topic].label}</h2>
              <p className="mt-1 text-sm text-ink-muted">{tx.lowest(pct(d.weak.accuracy))}</p>
              <ButtonLink href={`/practice/session/?mode=topic&topic=${d.weak.topic}`} variant="secondary" className="mt-4">
                {tx.practiseIt}
              </ButtonLink>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-navy">{tx.quickPractice}</h2>
              <p className="mt-1 text-sm text-ink-muted">{tx.quickBlurb}</p>
              <ButtonLink href="/practice/session/?mode=quick" variant="secondary" className="mt-4">
                {tx.start}
              </ButtonLink>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Target className="h-4 w-4" /> {tx.questionsAnswered}
          </p>
          <p className="mt-1 text-2xl font-semibold text-navy">{d.stats.attempted}</p>
          <p className="text-xs text-ink-muted">{d.stats.accuracy === null ? "—" : tx.accuracy(pct(d.stats.accuracy))}</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Flame className="h-4 w-4" /> {tx.streak}
          </p>
          <p className="mt-1 text-2xl font-semibold text-navy">{tx.days(d.streak.current)}</p>
          <p className="text-xs text-ink-muted">{tx.best(d.streak.best)}</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Trophy className="h-4 w-4" /> 500 Challenge
          </p>
          <p className="mt-1 text-2xl font-semibold text-navy">
            {d.challenge.answered}/{d.challenge.total}
          </p>
          <p className="text-xs text-ink-muted">{tx.toRepeat(d.challenge.missed.length)}</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <MessagesSquare className="h-4 w-4" /> Mock interview
          </p>
          <p className="mt-1 text-2xl font-semibold text-navy">
            {d.mockPassed}/{MOCK_LEVELS.length}
          </p>
          <p className="text-xs text-ink-muted">{tx.levelsPassed}</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Puzzle className="h-4 w-4" /> {tx.teasers}
          </p>
          <p className="mt-1 text-2xl font-semibold text-navy">
            {state.teasersSolved.length}/{TEASERS.length}
          </p>
          <p className="text-xs text-ink-muted">{tx.solved}</p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6">
          <CardHeader title={tx.learningProgress} action={<Link href="/learn/" className="text-sm text-electric hover:underline">{tx.allCourses}</Link>} />
          <ul className="mt-4 space-y-4">
            {d.courses.map(({ c, p }) => (
              <li key={c.id}>
                <div className="flex justify-between text-sm">
                  <Link href={`/learn/${c.id}/`} className="truncate text-ink hover:text-electric">
                    {c.title}
                  </Link>
                  <span className="figure shrink-0 pl-2 text-ink-muted">
                    {p.completed}/{p.total}
                  </span>
                </div>
                <ProgressBar value={p.pct} tone={p.pct === 1 ? "success" : "blue"} className="mt-1.5" label={tx.courseProgress(c.title)} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <CardHeader title="500 Challenge" action={<Link href="/challenge/" className="text-sm text-electric hover:underline">{tx.open}</Link>} />
          <p className="mt-4 text-3xl font-semibold text-navy">
            {d.challenge.answered}
            <span className="text-base font-normal text-ink-muted">{tx.answered(d.challenge.total)}</span>
          </p>
          <ProgressBar value={d.challenge.total ? d.challenge.answered / d.challenge.total : 0} className="mt-3" label={tx.challengeProgress} />
          <p className="mt-2 text-sm text-ink-muted">
            {tx.challengeSummary(d.challenge.accuracy === null ? null : pct(d.challenge.accuracy), d.challenge.missed.length)}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href={d.challenge.done ? "/challenge/" : "/challenge/play/"} size="sm">
              {d.challenge.answered ? tx.continue : tx.start} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            {d.challenge.missed.length > 0 && (
              <ButtonLink href="/challenge/play/?mode=missed" variant="secondary" size="sm">
                {tx.repeatMissed}
              </ButtonLink>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader title="Behaviourals" action={<Link href="/behaviourals/" className="text-sm text-electric hover:underline">{tx.open}</Link>} />
          <p className="mt-4 flex items-center gap-2 text-sm text-ink">
            <NotebookPen className="h-4 w-4 text-electric" /> {tx.stories(state.stories.length)}
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            {STORY_CATEGORIES.map((c) => (
              <li key={c} className="flex items-center gap-1.5 text-ink">
                {d.covered.has(c) ? <CircleCheck className="h-3.5 w-3.5 shrink-0 text-success" /> : <CircleDashed className="h-3.5 w-3.5 shrink-0 text-line-strong" />}
                <span className="truncate">{BQ_CATEGORIES[c]}</span>
              </li>
            ))}
          </ul>
          <ButtonLink href="/behaviourals/stories/" variant="secondary" size="sm" className="mt-4">
            {state.stories.length ? tx.addStory : tx.firstStory}
          </ButtonLink>
        </Card>

        <Card className="p-6">
          <CardHeader title="Mock interview" action={<Link href="/technicals/interview/" className="text-sm text-electric hover:underline">{tx.open}</Link>} />
          <ul className="mt-4 space-y-2.5">
            {MOCK_LEVELS.map((l) => {
              const r = state.mock[String(l.level)];
              const passed = (r?.best ?? 0) >= MOCK_PASS_MARK;
              return (
                <li key={l.level} className="flex items-center gap-2 text-sm">
                  {passed ? <CircleCheck className="h-4 w-4 shrink-0 text-success" /> : <CircleDashed className="h-4 w-4 shrink-0 text-line-strong" />}
                  <span className="flex-1 truncate text-ink">
                    {tx.level(l.level, l.title[lang])}
                  </span>
                  <span className="figure text-xs text-ink-muted">{r ? tx.bestScore(r.best) : "—"}</span>
                </li>
              );
            })}
          </ul>
          <ButtonLink href="/technicals/interview/" variant="secondary" size="sm" className="mt-4">
            {d.mockPassed === MOCK_LEVELS.length ? tx.beatBest : tx.nextLevel}
          </ButtonLink>
        </Card>

        <Card className="p-6">
          <CardHeader title={tx.teasers} action={<Link href="/brain-teasers/" className="text-sm text-electric hover:underline">{tx.open}</Link>} />
          <p className="mt-4 text-3xl font-semibold text-navy">
            {state.teasersSolved.length}
            <span className="text-base font-normal text-ink-muted">{tx.solvedOf(TEASERS.length)}</span>
          </p>
          <ProgressBar value={state.teasersSolved.length / TEASERS.length} className="mt-3" label={tx.teasersSolved} />
          <p className="mt-2 text-sm text-ink-muted">{tx.teasersBlurb}</p>
          <ButtonLink href="/brain-teasers/" variant="secondary" size="sm" className="mt-4">
            {state.teasersSolved.length ? tx.solveAnother : tx.firstTeaser}
          </ButtonLink>
        </Card>

        <Card className="p-6">
          <CardHeader title={tx.news} action={<Link href="/news/" className="text-sm text-electric hover:underline">{tx.open}</Link>} />
          <p className="mt-4 flex items-center gap-2 text-sm text-ink">
            <Newspaper className="h-4 w-4 text-electric" /> {tx.newsTime}
          </p>
          <p className="mt-2 text-sm text-ink-muted">{tx.newsBlurb}</p>
          <ButtonLink href="/news/" variant="secondary" size="sm" className="mt-4">
            {tx.headlines}
          </ButtonLink>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader title={tx.recentActivity} />
        {d.activity.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">{tx.noActivity}</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {d.activity.map((a, i) => {
              const Icon = KIND_ICON[a.kind];
              return (
                <li key={i}>
                  <Link href={a.href} className="flex items-center gap-3 py-2.5 text-sm hover:text-electric">
                    <Icon className="h-4 w-4 shrink-0 text-electric" />
                    <span className="flex-1 text-ink">{a.label}</span>
                    <span className="shrink-0 text-xs text-ink-muted">{fmtRelative(a.at, undefined, lang)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <LocalDataNote />
    </div>
  );
}

/** The nearest upcoming interview plan: days left, progress and today's tasks to tick off. */
function PlanToday({ plan }: { plan?: SavedPlan }) {
  const lang = useLang();
  const tx = TEXT[lang];
  const today = localDate();
  const built = useMemo(() => (plan ? buildPlan(plan, lang) : null), [plan, lang]);

  if (!plan || !built) {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-4 border-navy/20 bg-ice-soft/50 p-5">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 shrink-0 text-navy" />
          <div>
            <p className="font-semibold text-navy">{tx.comingUp}</p>
            <p className="text-sm text-ink-muted">{tx.comingUpBlurb}</p>
          </div>
        </div>
        <ButtonLink href="/planner/" size="sm">
          {tx.planMyPrep} <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </Card>
    );
  }

  const done = new Set(plan.done);
  const work = built.tasks.filter((t) => t.kind !== "interview");
  const completed = work.filter((t) => done.has(t.id)).length;
  const day = built.days.find((x) => x.date >= today);
  const isToday = day?.date === today;
  const left = daysBetween(today, plan.interviewDate);
  const title = plan.firm.trim() ? tx.firmInterview(plan.firm.trim()) : tx.yourInterview;

  return (
    <Card className="grid gap-6 p-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div>
        <p className="eyebrow mb-2">{tx.yourPlan}</p>
        <h2 className="font-serif text-2xl text-navy">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {cap(parseDate(plan.interviewDate).toLocaleDateString(LOCALES[lang], { weekday: "long", day: "numeric", month: "long" }))} · {tx.left(left)}
        </p>
        <ProgressBar value={work.length ? completed / work.length : 0} className="mt-4" label={tx.planProgress} />
        <p className="mt-1.5 text-xs text-ink-muted">
          {tx.tasksDone(completed, work.length)}
        </p>
        <ButtonLink href="/planner/" variant="secondary" size="sm" className="mt-4">
          {tx.openCalendar}
        </ButtonLink>
      </div>
      <div>
        <p className="text-sm font-semibold text-navy">
          {isToday ? tx.today : day ? tx.nextDay(parseDate(day.date).toLocaleDateString(LOCALES[lang], { weekday: "long", day: "numeric", month: "short" })) : tx.nothing}
        </p>
        {day && (
          <ul className="mt-3 space-y-2">
            {day.tasks.map((t) => {
              const ticked = done.has(t.id);
              return (
                <li key={t.id} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3">
                  {t.kind === "interview" ? (
                    <span className="h-5 w-5 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => actions.togglePlanTask(plan.id, t.id)}
                      aria-pressed={ticked}
                      aria-label={ticked ? tx.markUndone(t.title) : tx.markDone(t.title)}
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                        ticked ? "border-success bg-success text-white" : "border-line-strong hover:border-electric",
                      )}
                    >
                      {ticked && <Check className="h-3.5 w-3.5" />}
                    </button>
                  )}
                  <Link href={t.href} className={cn("min-w-0 flex-1 truncate text-sm hover:text-electric", ticked ? "text-ink-muted line-through" : "text-ink")}>
                    {t.title}
                  </Link>
                  {t.minutes > 0 && <span className="shrink-0 text-xs text-ink-muted">{t.minutes} min</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
