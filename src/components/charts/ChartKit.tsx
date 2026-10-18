"use client";

import { useState, type ReactNode } from "react";
import { Table2 } from "lucide-react";
import { cn } from "@/lib/cn";

/* Shared chart styling (validated palette: blue / orange / aqua on white). */
export const C = {
  s1: "#114779",
  s2: "#eb6834",
  s3: "#1baf7a",
  navy: "#114779",
  grid: "#e8ecf0",
  axis: "#cdd5dc",
  tick: "#5a6a78",
  surface: "#ffffff",
};

export const axisProps = {
  stroke: C.axis,
  tick: { fill: C.tick, fontSize: 12 },
  tickLine: false,
  axisLine: { stroke: C.axis },
} as const;

export const gridProps = { stroke: C.grid, vertical: false } as const;

export interface LegendItem {
  label: string;
  color: string;
  shape?: "line" | "rect" | "dot";
}

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          {it.shape === "line" ? (
            <span className="h-0.5 w-4 rounded-full" style={{ background: it.color }} />
          ) : it.shape === "dot" ? (
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: it.color }} />
          ) : (
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} />
          )}
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/** Tooltip body: value first (strong), series name second, line keys. */
export function TooltipBox({ title, rows }: { title?: ReactNode; rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lift">
      {title && <p className="mb-1 font-medium text-ink-muted">{title}</p>}
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-2">
          {r.color && <span className="h-0.5 w-3 rounded-full" style={{ background: r.color }} />}
          <span className="figure font-semibold text-navy">{r.value}</span>
          <span className="text-ink-muted">{r.label}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Frame for every chart: title, legend, the chart itself, and a table view
 * so no value is reachable only by hovering.
 */
export function ChartFrame({
  title,
  subtitle,
  legend,
  table,
  children,
  className,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  legend?: LegendItem[];
  table?: { headers: string[]; rows: (string | number)[][] };
  children: ReactNode;
  className?: string;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <figure className={cn("min-w-0", className)}>
      {(title || table) && (
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            {title && <figcaption className="text-sm font-semibold text-navy">{title}</figcaption>}
            {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
          </div>
          {table && (
            <button
              type="button"
              onClick={() => setShowTable((s) => !s)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs text-ink-muted hover:border-electric hover:text-electric"
              aria-pressed={showTable}
            >
              <Table2 className="h-3.5 w-3.5" />
              {showTable ? "Chart" : "Table"}
            </button>
          )}
        </div>
      )}
      {legend && legend.length > 1 && <div className="mb-2">{<Legend items={legend} />}</div>}
      {showTable && table ? (
        <div className="max-h-72 overflow-auto rounded-lg border border-line">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-cream">
              <tr>
                {table.headers.map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-navy">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r, i) => (
                <tr key={i} className="border-t border-line">
                  {r.map((c, j) => (
                    <td key={j} className="figure px-3 py-1.5 text-ink">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </figure>
  );
}
