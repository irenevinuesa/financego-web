import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";

/** Two-column interactive panel: controls on the left, live results on the right. */
export function WidgetShell({ title, controls, children }: { title: string; controls: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ice bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-line bg-ice-soft/50 px-4 py-2.5">
        <SlidersHorizontal className="h-4 w-4 text-electric" />
        <p className="text-sm font-semibold text-navy">{title}</p>
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[0.7rem] font-medium text-electric ring-1 ring-ice">Interactive</span>
      </div>
      <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <div className="space-y-4">{controls}</div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function KpiRow({ items }: { items: { label: string; value: ReactNode; hint?: string }[] }) {
  return (
    <dl className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl bg-cream/70 px-3 py-2.5">
          <dt className="text-xs text-ink-muted">{it.label}</dt>
          <dd className="mt-0.5 text-lg font-semibold tracking-tight text-navy">{it.value}</dd>
          {it.hint && <dd className="text-[0.7rem] text-ink-muted">{it.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}
