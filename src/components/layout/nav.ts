import { BookOpen, Calculator, ChartColumn, Compass, MessagesSquare, Target, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/learn/", label: "Learn", description: "Structured courses from fundamentals to advanced", icon: BookOpen },
  { href: "/practice/", label: "Practice", description: "Question bank with instant feedback", icon: Target },
  { href: "/interview/", label: "Interview", description: "Scripted technical interview simulator", icon: MessagesSquare },
  { href: "/tools/", label: "Tools", description: "Working calculators and models", icon: Calculator },
  { href: "/tracker/", label: "Tracker", description: "Progress, skills and applications", icon: ChartColumn },
  { href: "/career/", label: "Career", description: "Career guides and recruiting prep", icon: Compass },
];

export const SECONDARY_NAV = [
  { href: "/dashboard/", label: "Dashboard" },
  { href: "/search/", label: "Search" },
  { href: "/about/", label: "About" },
  { href: "/help/", label: "Help & feedback" },
  { href: "/settings/", label: "Settings & data" },
];
