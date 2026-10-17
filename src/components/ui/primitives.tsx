import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ───────────── Card ───────────── */

export function Card({ className, ...props }: ComponentProps<"div">) {
  // min-w-0 lets cards shrink inside grid and flex layouts instead of being pushed wide by charts or formulas.
  return <div className={cn("min-w-0 rounded-2xl border border-line bg-white shadow-card", className)} {...props} />;
}

export function CardHeader({ title, description, action, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-navy">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ───────────── Badge ───────────── */

type BadgeTone = "neutral" | "blue" | "success" | "error" | "warning" | "outline" | "navy";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-cream-deep text-ink",
  blue: "bg-ice-soft text-navy",
  success: "bg-success-soft text-success-ink",
  error: "bg-error-soft text-error-ink",
  warning: "bg-warning-soft text-warning-ink",
  outline: "border border-line-strong text-ink-muted bg-white",
  navy: "bg-navy text-white",
};

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

export function DifficultyBadge({ level }: { level: "Beginner" | "Intermediate" | "Advanced" }) {
  const dots = level === "Beginner" ? 1 : level === "Intermediate" ? 2 : 3;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted" title={`Difficulty: ${level}`}>
      <span className="inline-flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i <= dots ? "bg-electric" : "bg-line-strong")} />
        ))}
      </span>
      {level}
    </span>
  );
}

/* ───────────── Progress ───────────── */

export function ProgressBar({ value, className, label, tone = "blue" }: { value: number; className?: string; label?: string; tone?: "blue" | "success" }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-ice-soft", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
    >
      <div className={cn("h-full rounded-full transition-[width] duration-500", tone === "success" ? "bg-success" : "bg-electric")} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ───────────── Stat tile ───────────── */

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-ink-muted">{label}</p>
        {icon && <span className="text-electric">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-navy sm:text-[1.75rem]">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </Card>
  );
}

/* ───────────── Form fields ───────────── */

export function Label({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-medium text-ink">
      <span>{children}</span>
      {hint && <span className="text-xs font-normal text-ink-muted">{hint}</span>}
    </label>
  );
}

const fieldBase =
  "w-full rounded-xl border border-line-strong bg-white px-3.5 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20 disabled:bg-cream-deep";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-10", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(fieldBase, "h-10 appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235a6578' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "py-2.5 leading-relaxed", className)} {...props} />;
}

/* ───────────── Chips (toggle filters) ───────────── */

export function Chip({ active, className, ...props }: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm transition-colors",
        active ? "border-navy bg-navy text-white" : "border-line-strong bg-white text-ink hover:border-electric hover:text-electric",
        className,
      )}
      {...props}
    />
  );
}

/* ───────────── Empty state ───────────── */

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-white/60 px-6 py-10 text-center">
      {icon && <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-ice-soft text-electric">{icon}</div>}
      <p className="font-semibold text-navy">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm text-ink-muted">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ───────────── Section heading ───────────── */

export function SectionHeading({ eyebrow, title, description, action, className }: { eyebrow?: string; title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-serif text-3xl leading-tight sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-base leading-relaxed text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ───────────── Local-data notice ───────────── */

export function LocalDataNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-ink-muted", className)}>
      Saved only in this browser. Clearing your browser data deletes it. You can export a backup in{" "}
      <Link href="/settings/" className="font-medium text-electric underline-offset-2 hover:underline">
        Settings
      </Link>
      .
    </p>
  );
}
