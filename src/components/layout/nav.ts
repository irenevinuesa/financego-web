import {
  BookOpen,
  CalendarDays,
  Calculator,
  Compass,
  GraduationCap,
  Library,
  MessagesSquare,
  Newspaper,
  NotebookPen,
  Puzzle,
  Target,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Lang } from "@/lib/i18n";

/** Text in both languages. */
export type Bi = Record<Lang, string>;

export interface NavLink {
  href: string;
  label: Bi;
  description: Bi;
  icon: LucideIcon;
}

export interface NavGroup extends NavLink {
  /** Pages grouped under this item, shown in a dropdown on desktop. */
  children?: NavLink[];
}

export const TECHNICALS_LINKS: NavLink[] = [
  { href: "/learn/", label: { en: "Learn", es: "Learn" }, description: { en: "Theory courses, from fundamentals to advanced", es: "Cursos de teoría, de lo básico a lo avanzado" }, icon: BookOpen },
  { href: "/practice/", label: { en: "Practice", es: "Practice" }, description: { en: "Questions by section, with instant feedback", es: "Preguntas por sección, con corrección al momento" }, icon: Target },
  { href: "/challenge/", label: { en: "500 Challenge", es: "500 Challenge" }, description: { en: "500 questions that unlock one by one", es: "500 preguntas que se desbloquean una a una" }, icon: Trophy },
  { href: "/technicals/interview/", label: { en: "Mock interview", es: "Mock interview" }, description: { en: "Timed numeric questions in five levels", es: "Preguntas numéricas con tiempo, en cinco niveles" }, icon: MessagesSquare },
];

export const BEHAVIOURALS_LINKS: NavLink[] = [
  { href: "/behaviourals/", label: { en: "Guide", es: "Guía" }, description: { en: "What interviewers test, and how to answer", es: "Qué evalúan y cómo responder" }, icon: Compass },
  { href: "/behaviourals/questions/", label: { en: "Question library", es: "Banco de preguntas" }, description: { en: "The questions you will be asked, by category", es: "Las preguntas que te harán, por categoría" }, icon: Library },
  { href: "/behaviourals/stories/", label: { en: "Story bank", es: "Banco de historias" }, description: { en: "Build your STAR stories once, reuse them", es: "Prepara tus historias STAR una vez y reutilízalas" }, icon: NotebookPen },
];

export const MAIN_NAV: NavGroup[] = [
  { href: "/technicals/", label: { en: "Technicals", es: "Technicals" }, description: { en: "Learn, Practice, the 500 Challenge and the mock interview", es: "Learn, Practice, el 500 Challenge y el mock interview" }, icon: GraduationCap, children: TECHNICALS_LINKS },
  { href: "/behaviourals/", label: { en: "Behaviourals", es: "Behaviourals" }, description: { en: "Stories, questions and answers", es: "Historias, preguntas y respuestas" }, icon: Users, children: BEHAVIOURALS_LINKS },
  { href: "/brain-teasers/", label: { en: "Brain Teasers", es: "Brain Teasers" }, description: { en: "Puzzles, probability and mental maths", es: "Acertijos, probabilidad y cálculo mental" }, icon: Puzzle },
  { href: "/tools/", label: { en: "Tools", es: "Tools" }, description: { en: "Working calculators and models", es: "Calculadoras y modelos que funcionan" }, icon: Calculator },
  { href: "/news/", label: { en: "News", es: "Noticias" }, description: { en: "Today's market headlines", es: "Los titulares de mercados del día" }, icon: Newspaper },
  { href: "/planner/", label: { en: "Planner", es: "Planner" }, description: { en: "A day-by-day calendar to your interview", es: "Un calendario día a día hasta tu entrevista" }, icon: CalendarDays },
  { href: "/career/", label: { en: "Career", es: "Career" }, description: { en: "Career guides and recruiting prep", es: "Guías de carrera y preparación del proceso" }, icon: Compass },
];

export const SECONDARY_NAV: { href: string; label: Bi }[] = [
  { href: "/dashboard/", label: { en: "Dashboard", es: "Dashboard" } },
  { href: "/search/", label: { en: "Search", es: "Buscar" } },
  { href: "/about/", label: { en: "About", es: "Sobre FinanceGo" } },
  { href: "/help/", label: { en: "Help & feedback", es: "Ayuda y contacto" } },
  { href: "/settings/", label: { en: "Settings & data", es: "Ajustes y datos" } },
];

/** True when the pathname (without the language prefix) belongs to this group. */
export function isGroupActive(group: NavGroup, pathname: string) {
  const hrefs = [group.href, ...(group.children ?? []).map((c) => c.href)];
  return hrefs.some((h) => pathname === h || pathname.startsWith(h));
}
