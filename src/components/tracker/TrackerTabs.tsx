"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/tracker/", label: "Overview" },
  { href: "/tracker/applications/", label: "Applications" },
  { href: "/tracker/goals/", label: "Goals" },
];

export function TrackerTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Tracker sections" className="flex gap-1 overflow-x-auto rounded-full border border-line bg-white p-1 shadow-card sm:inline-flex">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname === t.href.slice(0, -1);
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} className={cn("shrink-0 rounded-full px-4 py-1.5 text-sm font-medium", active ? "bg-navy text-white" : "text-ink hover:text-electric")}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
