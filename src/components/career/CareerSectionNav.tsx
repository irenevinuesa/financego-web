"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface NavSection {
  id: string;
  label: string;
}

/** Sections whose top has passed this line (px from the viewport top) count as "current". */
const ACTIVE_LINE = 150;

/**
 * In-page navigation for a career guide. Below lg it is a sticky, horizontally scrollable
 * chip bar under the site header; from lg it is a sticky vertical list in the left column.
 * Place it as a direct child of the guide's layout wrapper so it can stick on mobile.
 */
export function CareerSectionNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const listRef = useRef<HTMLUListElement>(null);
  const key = sections.map((s) => s.id).join("|");

  useEffect(() => {
    const ids = key.split("|");
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_LINE) current = id;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) current = ids[ids.length - 1];
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [key]);

  // Keep the active chip visible in the horizontal bar (no-op for the vertical list).
  useEffect(() => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const chip = list.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!chip) return;
    const listBox = list.getBoundingClientRect();
    const chipBox = chip.getBoundingClientRect();
    if (chipBox.left >= listBox.left && chipBox.right <= listBox.right) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ left: list.scrollLeft + chipBox.left - listBox.left - 16, behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-16 z-30 -mx-4 border-b border-line bg-white/95 backdrop-blur-md sm:-mx-6 lg:top-24 lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:backdrop-blur-none"
    >
      <p className="eyebrow mb-3 hidden lg:block">On this page</p>
      <ul
        ref={listRef}
        className="flex gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] sm:px-6 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l lg:border-line lg:p-0 [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                data-section={s.id}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "block whitespace-nowrap rounded-full border px-3 py-1 text-sm transition-colors",
                  "lg:-ml-px lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 lg:py-1.5 lg:whitespace-normal",
                  isActive
                    ? "border-electric bg-electric text-white lg:border-electric lg:bg-transparent lg:font-medium lg:text-electric"
                    : "border-line bg-white text-ink-muted hover:border-electric/50 hover:text-electric lg:border-transparent lg:bg-transparent",
                )}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
