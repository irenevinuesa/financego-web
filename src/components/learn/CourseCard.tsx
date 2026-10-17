import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import type { CourseMeta } from "@/content/types";
import { CATEGORIES } from "@/content/taxonomy";
import { Scene } from "@/components/art/Scene";
import { Badge, DifficultyBadge } from "@/components/ui/primitives";
import { CourseProgressPill } from "./CourseProgressPill";
import { cn } from "@/lib/cn";

function fmtMinutes(m: number) {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export function CourseCard({ course, className }: { course: CourseMeta; className?: string }) {
  const planned = course.status === "planned";
  return (
    <Link
      href={`/learn/${course.id}/`}
      className={cn("group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift", className)}
    >
      <div className="relative h-36 overflow-hidden">
        <Scene name={course.scene} className={cn("h-full w-full transition-transform duration-500 group-hover:scale-105", planned && "opacity-75 saturate-50")} />
        <div className="absolute left-3 top-3 flex gap-2">
          {planned ? <Badge tone="warning">In development</Badge> : <Badge tone="navy">Available</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-electric">{CATEGORIES[course.category].label}</p>
        <h3 className="mt-1 text-lg font-semibold leading-snug text-navy group-hover:text-electric">{course.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{course.summary}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-ink-muted">
          <DifficultyBadge level={course.difficulty} />
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {fmtMinutes(course.minutes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> {course.lessonCount} lessons{planned ? " planned" : ""}
          </span>
        </div>
        {!planned && <CourseProgressPill courseId={course.id} />}
      </div>
    </Link>
  );
}

export { fmtMinutes };
