"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTool } from "@/content/tools";
import { breakEven, profitAt } from "@/lib/finance/breakeven";
import { fmtMoney, fmtNumber, fmtPct } from "@/lib/format";
import { NumberField } from "@/components/ui/Slider";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";
import { Interpretation, Notes, Panel, ResultGrid, ToolActions, Warning, downloadCsv } from "./ToolKit";

const DEFAULTS = { price: 50, variableCost: 30, fixedCosts: 100000, volume: 8000, targetProfit: 20000 };
type Key = keyof typeof DEFAULTS;

const units = (x: number) => (Number.isFinite(x) ? `${fmtNumber(Math.ceil(x))} units` : "Never");

export function BreakEvenTool() {
  const [v, setV] = useState(DEFAULTS);
  const set = (k: Key) => (x: number) => setV((p) => ({ ...p, [k]: x }));

  const errors: Partial<Record<Key, string>> = {};
  const check = (k: Key, lo: number, hi: number, msg: string) => {
    if (!Number.isFinite(v[k]) || v[k] < lo || v[k] > hi) errors[k] = msg;
  };
  check("price", 0.01, 1e9, "Enter a positive price.");
  check("variableCost", 0, 1e9, "Enter zero or more.");
  check("fixedCosts", 0, 1e12, "Enter zero or more.");
  check("volume", 0, 1e12, "Enter zero or more.");
  check("targetProfit", 0, 1e12, "Enter zero or more.");
  const valid = Object.keys(errors).length === 0;
  const r = valid ? breakEven(v) : null;
  const losesPerUnit = r ? r.contributionMargin <= 0 : false;

  const curve = useMemo(() => {
    if (!r) return [];
    const top = Math.max(v.volume, Number.isFinite(r.breakEvenUnits) ? r.breakEvenUnits : 0) * 1.5 || 100;
    return Array.from({ length: 31 }, (_, i) => {
      const q = (top * i) / 30;
      return { q, revenue: v.price * q, cost: v.fixedCosts + v.variableCost * q, profit: profitAt(v, q) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, v]);

  const tool = getTool("break-even")!;
  const exportCsv = () =>
    r &&
    downloadCsv("financego-break-even.csv", [
      ["Item", "Value"],
      ["Price per unit", v.price],
      ["Variable cost per unit", v.variableCost],
      ["Fixed costs", v.fixedCosts],
      ["Expected volume", v.volume],
      ["Contribution margin per unit", r.contributionMargin],
      ["Contribution margin ratio (%)", (r.contributionMarginRatio * 100).toFixed(2)],
      ["Break-even units", Number.isFinite(r.breakEvenUnits) ? r.breakEvenUnits.toFixed(2) : "n/a"],
      ["Break-even revenue", Number.isFinite(r.breakEvenRevenue) ? r.breakEvenRevenue.toFixed(2) : "n/a"],
      ["Profit at expected volume", r.profit.toFixed(2)],
      ["Margin of safety (%)", Number.isFinite(r.marginOfSafety) ? (r.marginOfSafety * 100).toFixed(2) : "n/a"],
    ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Panel title="Inputs" action={<ToolActions onReset={() => setV(DEFAULTS)} onExport={exportCsv} />}>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Price per unit" value={v.price} onChange={set("price")} prefix="$" step={1} error={errors.price} />
            <NumberField label="Variable cost per unit" value={v.variableCost} onChange={set("variableCost")} prefix="$" step={1} error={errors.variableCost} />
            <NumberField label="Fixed costs per year" value={v.fixedCosts} onChange={set("fixedCosts")} prefix="$" step={5000} error={errors.fixedCosts} />
            <NumberField label="Expected units sold" value={v.volume} onChange={set("volume")} step={500} error={errors.volume} />
            <NumberField label="Target profit" value={v.targetProfit} onChange={set("targetProfit")} prefix="$" step={5000} error={errors.targetProfit} hint="Optional" />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Results">
            {r ? (
              <>
                {losesPerUnit && <Warning>Each unit costs more to make than it sells for, so more volume only deepens the loss. Raise the price or cut variable costs.</Warning>}
                <div className={losesPerUnit ? "mt-4" : undefined}>
                  <ResultGrid
                    items={[
                      { label: "Contribution per unit", value: fmtMoney(r.contributionMargin, { decimals: 2 }), hint: `${fmtPct(r.contributionMarginRatio, 1)} of the price` },
                      { label: "Break-even volume", value: units(r.breakEvenUnits), strong: true, hint: Number.isFinite(r.breakEvenRevenue) ? `${fmtMoney(r.breakEvenRevenue)} of revenue` : undefined },
                      { label: "Profit at expected volume", value: fmtMoney(r.profit), strong: true, hint: `${fmtMoney(r.revenue)} revenue` },
                      { label: "Margin of safety", value: Number.isFinite(r.marginOfSafety) ? fmtPct(r.marginOfSafety, 1) : "—", hint: "How far sales can fall before a loss" },
                      { label: "Operating leverage", value: r.operatingLeverage === null ? "—" : `${fmtNumber(r.operatingLeverage, 2)}x`, hint: "% change in profit for a 1% change in volume" },
                      { label: "Units for target profit", value: units(r.unitsForTarget), hint: `To earn ${fmtMoney(v.targetProfit)}` },
                    ]}
                  />
                </div>
              </>
            ) : (
              <Warning>Fix the highlighted inputs to see results.</Warning>
            )}
          </Panel>

          {r && !losesPerUnit && (
            <Panel title="Cost–volume–profit chart">
              <ChartFrame
                title="Revenue, total cost and profit by volume"
                subtitle="Below the break-even point the cost line is above revenue; above it, every unit adds its contribution to profit."
                legend={[
                  { label: "Revenue", color: C.s1, shape: "line" },
                  { label: "Total cost", color: C.s2, shape: "line" },
                  { label: "Profit", color: C.s3, shape: "line" },
                ]}
                table={{ headers: ["Units", "Revenue", "Total cost", "Profit"], rows: curve.map((p) => [Math.round(p.q), fmtMoney(p.revenue), fmtMoney(p.cost), fmtMoney(p.profit)]) }}
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curve} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
                      <CartesianGrid {...gridProps} />
                      <XAxis dataKey="q" type="number" domain={[0, "dataMax"]} {...axisProps} tickFormatter={(x) => fmtNumber(Number(x))} />
                      <YAxis {...axisProps} width={72} tickFormatter={(x) => fmtMoney(Number(x))} />
                      <ReferenceLine y={0} stroke={C.axis} />
                      <ReferenceLine x={v.volume} stroke={C.tick} strokeDasharray="4 4" />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0].payload as (typeof curve)[number];
                          return (
                            <TooltipBox
                              title={`${fmtNumber(Math.round(p.q))} units`}
                              rows={[
                                { label: "revenue", value: fmtMoney(p.revenue), color: C.s1 },
                                { label: "total cost", value: fmtMoney(p.cost), color: C.s2 },
                                { label: "profit", value: fmtMoney(p.profit), color: C.s3 },
                              ]}
                            />
                          );
                        }}
                      />
                      <Line type="linear" dataKey="revenue" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="linear" dataKey="cost" stroke={C.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="linear" dataKey="profit" stroke={C.s3} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                      {Number.isFinite(r.breakEvenUnits) && (
                        <ReferenceDot x={r.breakEvenUnits} y={r.breakEvenRevenue} r={6} fill={C.s1} stroke={C.surface} strokeWidth={2} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartFrame>
            </Panel>
          )}

          {r && !losesPerUnit && (
            <Interpretation
              points={[
                <>
                  Every unit sold adds <strong>{fmtMoney(r.contributionMargin, { decimals: 2 })}</strong> towards the <strong>{fmtMoney(v.fixedCosts)}</strong> of fixed costs, so it takes{" "}
                  <strong>{units(r.breakEvenUnits)}</strong> to cover them.
                </>,
                <>
                  {Number.isFinite(r.marginOfSafety) && r.marginOfSafety >= 0 ? (
                    <>
                      Sales can fall <strong>{fmtPct(r.marginOfSafety, 1)}</strong> before the business makes a loss.
                    </>
                  ) : (
                    <>Expected sales are below break-even, so the business loses money at this volume.</>
                  )}
                </>,
                <>
                  High fixed costs mean high operating leverage: profits rise fast once you pass break-even, and fall just as fast when volume drops. That is why airlines and
                  software companies are so sensitive to volume.
                </>,
              ]}
            />
          )}
        </div>
      </div>
      <Notes
        tool={tool}
        assumptions={[
          "One product, or a constant sales mix, at a constant price per unit.",
          "Variable cost per unit and total fixed costs do not change with volume within the range shown.",
          "Profit is operating profit before interest and tax.",
          "Break-even volume is rounded up to whole units in the results.",
        ]}
        formulas={[
          { label: "Break-even units", tex: String.raw`Q^* = \frac{\text{Fixed costs}}{P - V}` },
          { label: "Margin of safety", tex: String.raw`\frac{Q - Q^*}{Q}` },
          { label: "Operating leverage", tex: String.raw`\text{DOL} = \frac{(P - V)\,Q}{(P - V)\,Q - F}` },
        ]}
      />
    </div>
  );
}
