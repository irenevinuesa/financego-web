"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, Download, RotateCcw, Target } from "lucide-react";
import type { ToolMeta } from "@/content/tools";
import { getCourse, lessonHref } from "@/content/courses";
import { TOPICS } from "@/content/taxonomy";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/primitives";
import { Tex } from "@/components/math/Tex";

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ToolActions({ onReset, onExport }: { onReset: () => void; onExport: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" onClick={onReset}>
        <RotateCcw className="h-4 w-4" /> Reset
      </Button>
      <Button variant="secondary" size="sm" onClick={onExport}>
        <Download className="h-4 w-4" /> Export CSV
      </Button>
    </div>
  );
}

export function Panel({ title, children, action, className }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <Card className={`p-5 sm:p-6 ${className ?? ""}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-navy">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function ResultGrid({ items }: { items: { label: string; value: ReactNode; hint?: ReactNode; strong?: boolean }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className={`rounded-xl px-4 py-3 ${it.strong ? "bg-navy text-white" : "bg-cream/70"}`}>
          <dt className={`text-xs ${it.strong ? "text-ice-soft" : "text-ink-muted"}`}>{it.label}</dt>
          <dd className={`mt-0.5 text-xl font-semibold tracking-tight ${it.strong ? "text-white" : "text-navy"}`}>{it.value}</dd>
          {it.hint && <dd className={`text-xs ${it.strong ? "text-ice-soft/80" : "text-ink-muted"}`}>{it.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function Notes({ assumptions, formulas, tool }: { assumptions: string[]; formulas: { label: string; tex: string }[]; tool: ToolMeta }) {
  const course = tool.lesson ? getCourse(tool.lesson.courseId) : undefined;
  const lesson = course?.lessons.find((l) => l.id === tool.lesson?.lessonId);
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel title="Assumptions & limitations">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink">
          {assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Panel>
      <Panel title="Formulas used">
        <div className="space-y-3">
          {formulas.map((f) => (
            <div key={f.label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{f.label}</p>
              <Tex tex={f.tex} block className="text-navy" />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Learn & practise">
        <ul className="space-y-3 text-sm">
          {course && lesson && (
            <li>
              <Link href={lessonHref(course.id, lesson.id)} className="flex items-center gap-2 text-electric hover:underline">
                <BookOpen className="h-4 w-4" /> Lesson: {lesson.title}
              </Link>
            </li>
          )}
          {tool.practiceTopic && (
            <li>
              <Link href={`/practice/session/?mode=topic&topic=${tool.practiceTopic}`} className="flex items-center gap-2 text-electric hover:underline">
                <Target className="h-4 w-4" /> Practise {TOPICS[tool.practiceTopic].label} questions
              </Link>
            </li>
          )}
        </ul>
        <p className="mt-4 text-xs text-ink-muted">Educational tool. Results depend entirely on your inputs and are not investment advice.</p>
      </Panel>
    </div>
  );
}

export function Interpretation({ points }: { points: ReactNode[] }) {
  return (
    <div className="rounded-2xl border border-ice bg-ice-soft/40 p-5">
      <p className="text-sm font-semibold text-navy">How to read this</p>
      <ul className="mt-2 space-y-1.5 text-sm text-ink">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Warning({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-warning-soft px-4 py-2.5 text-sm text-warning-ink">{children}</p>;
}
