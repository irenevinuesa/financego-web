"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "./ChartKit";

export interface WaterfallStep {
  label: string;
  /** Signed change, or the subtotal value when `total` is true. */
  value: number;
  total?: boolean;
}

/**
 * Waterfall built from stacked bars: an invisible base plus a visible delta.
 * Colours: subtotals blue, additions aqua, deductions orange (legend always shown).
 */
export function Waterfall({ steps, title, format, height = 260 }: { steps: WaterfallStep[]; title?: string; format: (v: number) => string; height?: number }) {
  let running = 0;
  const data = steps.map((s) => {
    if (s.total) {
      running = s.value;
      return { label: s.label, base: Math.min(0, s.value), delta: Math.abs(s.value), raw: s.value, kind: "total" as const };
    }
    const start = running;
    running += s.value;
    const lo = Math.min(start, running);
    return { label: s.label, base: lo, delta: Math.abs(s.value), raw: s.value, kind: s.value >= 0 ? ("add" as const) : ("sub" as const) };
  });
  const color = (k: string) => (k === "total" ? C.s1 : k === "add" ? C.s3 : C.s2);

  return (
    <ChartFrame
      title={title}
      legend={[
        { label: "Subtotal", color: C.s1 },
        { label: "Addition", color: C.s3 },
        { label: "Deduction", color: C.s2 },
      ]}
      table={{ headers: ["Step", "Amount"], rows: data.map((d) => [d.label, d.kind === "sub" ? `−${format(d.delta)}` : format(d.raw)]) }}
    >
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} interval={0} tick={{ ...axisProps.tick, fontSize: 11 }} />
            <YAxis {...axisProps} width={56} tickFormatter={(v) => format(v)} />
            <Tooltip
              cursor={{ fill: "rgba(33,101,197,0.06)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as (typeof data)[number];
                return <TooltipBox title={d.label} rows={[{ label: d.kind === "total" ? "subtotal" : d.kind === "add" ? "added" : "deducted", value: d.kind === "sub" ? `−${format(d.delta)}` : format(d.raw), color: color(d.kind) }]} />;
              }}
            />
            <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="delta" stackId="w" radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={i} fill={color(d.kind)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
