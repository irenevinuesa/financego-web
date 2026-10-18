import {
  BookOpen,
  Calculator,
  Compass,
  GraduationCap,
  Library,
  MessagesSquare,
  NotebookPen,
  Target,
  Trophy,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface NavGroup extends NavLink {
  /** Pages grouped under this item, shown in a dropdown on desktop. */
  children?: NavLink[];
}

export const TECHNICALS_LINKS: NavLink[] = [
  { href: "/learn/", label: "Learn", description: "Theory courses, from fundamentals to advanced", icon: BookOpen },
  { href: "/practice/", label: "Practice", description: "Questions by section, with instant feedback", icon: Target },
  { href: "/challenge/", label: "500 Challenge", description: "500 questions that unlock one by one", icon: Trophy },
  { href: "/technicals/interview/", label: "Mock interview", description: "Technical interview simulator", icon: MessagesSquare },
];

export const BEHAVIOURALS_LINKS: NavLink[] = [
  { href: "/behaviourals/", label: "Guide", description: "What interviewers test, and how to answer", icon: Compass },
  { href: "/behaviourals/questions/", label: "Question library", description: "The questions you will be asked, by category", icon: Library },
  { href: "/behaviourals/stories/", label: "Story bank", description: "Build your STAR stories once, reuse them", icon: NotebookPen },
  { href: "/behaviourals/interview/", label: "Mock interview", description: "Behavioural interview simulator", icon: UsersRound },
];

export const MAIN_NAV: NavGroup[] = [
  { href: "/technicals/", label: "Technicals", description: "Learn, Practice, the 500 Challenge and mock interviews", icon: GraduationCap, children: TECHNICALS_LINKS },
  { href: "/behaviourals/", label: "Behaviourals", description: "Stories, answers and mock interviews", icon: Users, children: BEHAVIOURALS_LINKS },
  { href: "/tools/", label: "Tools", description: "Working calculators and models", icon: Calculator },
  { href: "/career/", label: "Career", description: "Career guides and recruiting prep", icon: Compass },
];

export const SECONDARY_NAV = [
  { href: "/dashboard/", label: "Dashboard" },
  { href: "/search/", label: "Search" },
  { href: "/about/", label: "About" },
  { href: "/help/", label: "Help & feedback" },
  { href: "/settings/", label: "Settings & data" },
];

/** True when the pathname belongs to this group (its hub or any of its pages). */
export function isGroupActive(group: NavGroup, pathname: string) {
  const hrefs = [group.href, ...(group.children ?? []).map((c) => c.href)];
  return hrefs.some((h) => pathname === h || pathname.startsWith(h));
}
