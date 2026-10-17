"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTool } from "@/content/tools";
import { dcfSensitivity, runDcf, type DcfInputs, type DcfYear } from "@/lib/finance/dcf";
import { fmtMoney, fmtMultiple, fmtNumber, fmtPct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { NumberField } from "@/components/ui/Slider";
import { Chip } from "@/components/ui/primitives";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";
import { Interpretation, Notes, Panel, ResultGrid, ToolActions, Warning, downloadCsv } from "./ToolKit";

const DEFAULTS = {
  revenue: 1000,
  growth: [8, 7, 6, 5, 4],
  margin: 18,
  tax: 25,
  da: 4,
  capex: 5,
  nwc: 10,
  wacc: 9,
  g: 2.5,
  netDebt: 300,
  shares: 100,
  midYear: false,
};

type State = typeof DEFAULTS;

export function DcfTool() {
  const [v, setV] = useState<State>(DEFAULTS);
  const [sensOut, setSensOut] = useState<"price" | "ev">("price");
  const set = (k: Exclude<keyof State, "growth" | "midYear">) => (x: number) => setV((p) => ({ ...p, [k]: x }));
  const setGrowth = (i: number) => (x: number) => setV((p) => ({ ...p, growth: p.growth.map((g, j) => (j === i ? x : g)) }));

  const errors: Record<string, string> = {};
  const fin = (x: number) => Number.isFinite(x);
  if (!fin(v.revenue) || v.revenue <= 0) errors.revenue = "Revenue must be positive.";
  v.growth.forEach((g, i) => {
    if (!fin(g) || g < -50 || g > 100) errors[`g${i}`] = "−50% to 100%";
  });
  if (!fin(v.margin) || v.margin < -50 || v.margin > 80) errors.margin = "Enter −50% to 80%.";
  if (!fin(v.tax) || v.tax < 0 || v.tax > 60) errors.tax = "Enter 0% to 60%.";
  if (!fin(v.da) || v.da < 0 || v.da > 50) errors.da = "Enter 0% to 50%.";
  if (!fin(v.capex) || v.capex < 0 || v.capex > 60) errors.capex = "Enter 0% to 60%.";
  if (!fin(v.nwc) || v.nwc < -50 || v.nwc > 100) errors.nwc = "Enter −50% to 100%.";
  if (!fin(v.wacc) || v.wacc <= 0 || v.wacc > 30) errors.wacc = "Enter 0% to 30%.";
  if (!fin(v.g) || v.g < -5 || v.g > 10) errors.g = "Enter −5% to 10%.";
  else if (fin(v.wacc) && v.g >= v.wacc) errors.g = "Terminal growth must be below WACC.";
  if (!fin(v.netDebt)) errors.netDebt = "Enter a number (negative for net cash).";
  if (!fin(v.shares) || v.shares < 0) errors.shares = "Enter 0 or more.";
  const valid = Object.keys(errors).length === 0;

  const inputs: DcfInputs = {
    baseRevenue: v.revenue,
    revenueGrowth: v.growth.map((g) => g / 100),
    ebitMargin: v.margin / 100,
    taxRate: v.tax / 100,
    daPctRevenue: v.da / 100,
    capexPctRevenue: v.capex / 100,
    nwcPctRevenue: v.nwc / 100,
    wacc: v.wacc / 100,
    terminalGrowth: v.g / 100,
    netDebt: v.netDebt,
    sharesOutstanding: v.shares,
    midYear: v.midYear,
  };
  const r = valid ? runDcf(inputs) : null;

  const sens = useMemo(() => {
    if (!valid) return null;
    const waccs = [-1, -0.5, 0, 0.5, 1].map((d) => v.wacc / 100 + d / 100);
    const gs = [-0.5, -0.25, 0, 0.25, 0.5].map((d) => v.g / 100 + d / 100);
    const pick = sensOut === "ev" || !v.shares ? (x: ReturnType<typeof runDcf>) => x.enterpriseValue : (x: ReturnType<typeof runDcf>) => x.valuePerShare ?? 0;
    return { waccs, gs, grid: dcfSensitivity(inputs, waccs, gs, pick) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, v, sensOut]);

  const tool = getTool("dcf")!;
  const exportCsv = () => {
    if (!r) return;
    downloadCsv("financego-dcf.csv", [
      ["Year", ...r.years.map((y) => y.year)],
      ["Revenue", ...r.years.map((y) => y.revenue.toFixed(2))],
      ["EBIT", ...r.years.map((y) => y.ebit.toFixed(2))],
      ["Taxes", ...r.years.map((y) => (-y.taxes).toFixed(2))],
      ["NOPAT", ...r.years.map((y) => y.nopat.toFixed(2))],
      ["D&A", ...r.years.map((y) => y.da.toFixed(2))],
      ["Capex", ...r.years.map((y) => (-y.capex).toFixed(2))],
      ["Change in NWC", ...r.years.map((y) => (-y.changeInNwc).toFixed(2))],
      ["Unlevered FCF", ...r.years.map((y) => y.fcf.toFixed(2))],
      ["Discount factor", ...r.years.map((y) => y.discountFactor.toFixed(4))],
      ["PV of FCF", ...r.years.map((y) => y.pvFcf.toFixed(2))],
      [],
      ["Sum of PV of FCF", r.sumPvFcf.toFixed(2)],
      ["Terminal value", r.terminalValue.toFixed(2)],
      ["PV of terminal value", r.pvTerminalValue.toFixed(2)],
      ["Enterprise value", r.enterpriseValue.toFixed(2)],
      ["Net debt", v.netDebt],
      ["Equity value", r.equityValue.toFixed(2)],
      ["Value per share", r.valuePerShare?.toFixed(2) ?? "n/a"],
      ["WACC (%)", v.wacc],
      ["Terminal growth (%)", v.g],
    ]);
  };

  const chartData = r?.years.map((y) => ({ year: `Y${y.year}`, fcf: y.fcf, pv: y.pvFcf })) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[24rem_1fr]">
        <Panel title="Assumptions ($m)" action={<ToolActions onReset={() => setV(DEFAULTS)} onExport={exportCsv} />}>
          <div className="space-y-5">
            <NumberField label="Revenue, last actual year" value={v.revenue} onChange={set("revenue")} prefix="$" unit="m" error={errors.revenue} />
            <div>
              <p className="mb-1 text-sm text-ink">Revenue growth by year (%)</p>
              <div className="grid grid-cols-5 gap-2">
                {v.growth.map((g, i) => (
                  <NumberField key={i} label={`Y${i + 1}`} value={g} onChange={setGrowth(i)} step={0.5} error={errors[`g${i}`] ? "!" : undefined} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="EBIT margin" value={v.margin} onChange={set("margin")} unit="%" step={0.5} error={errors.margin} />
              <NumberField label="Tax rate" value={v.tax} onChange={set("tax")} unit="%" step={1} error={errors.tax} />
              <NumberField label="D&A (% revenue)" value={v.da} onChange={set("da")} unit="%" step={0.5} error={errors.da} />
              <NumberField label="Capex (% revenue)" value={v.capex} onChange={set("capex")} unit="%" step={0.5} error={errors.capex} />
              <NumberField label="NWC (% revenue)" value={v.nwc} onChange={set("nwc")} unit="%" step={0.5} error={errors.nwc} hint="Cash impact = NWC% × Δrevenue" />
              <NumberField label="WACC" value={v.wacc} onChange={set("wacc")} unit="%" step={0.25} error={errors.wacc} />
              <NumberField label="Terminal growth" value={v.g} onChange={set("g")} unit="%" step={0.25} error={errors.g} />
              <NumberField label="Net debt" value={v.netDebt} onChange={set("netDebt")} prefix="$" unit="m" error={errors.netDebt} />
              <NumberField label="Diluted shares" value={v.shares} onChange={set("shares")} unit="m" error={errors.shares} hint="Optional, for value per share" />
            </div>
            <label className="flex items-center gap-3 text-sm text-ink">
              <input type="checkbox" checked={v.midYear} onChange={(e) => setV((p) => ({ ...p, midYear: e.target.checked }))} className="h-4 w-4 accent-[#2165c5]" />
              Mid-year discounting convention
            </label>
          </div>
        </Panel>

        <div className="min-w-0 space-y-6">
          <Panel title="Valuation">
            {r ? (
              <ResultGrid
                items={[
                  { label: "Enterprise value", value: fmtMoney(r.enterpriseValue, { unit: "m" }), strong: true },
                  { label: "Equity value", value: fmtMoney(r.equityValue, { unit: "m" }) },
                  { label: "Value per share", value: r.valuePerShare === null ? "Add shares" : fmtMoney(r.valuePerShare, { decimals: 2 }) },
                  { label: "PV of forecast FCF", value: fmtMoney(r.sumPvFcf, { unit: "m" }) },
                  { label: "PV of terminal value", value: fmtMoney(r.pvTerminalValue, { unit: "m" }), hint: `${fmtPct(r.terminalValueShare, 0)} of EV` },
                  { label: "Implied exit multiple", value: fmtMultiple(r.impliedExitMultiple), hint: "TV ÷ final-year EBITDA" },
                ]}
              />
            ) : (
              <Warning>Fix the highlighted inputs to run the model. {errors.g === "Terminal growth must be below WACC." && "Terminal growth must be below WACC."}</Warning>
            )}
          </Panel>

          {r && (
            <Panel title="Free cash flow forecast">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs text-ink-muted">
                      <th className="py-2 text-left font-medium">$m</th>
                      {r.years.map((y) => (
                        <th key={y.year} className="py-2 text-right font-semibold text-navy">
                          Year {y.year}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="figure">
                    {(
                      [
                        ["Revenue", (y) => y.revenue],
                        ["EBIT", (y) => y.ebit],
                        ["− Taxes", (y) => -y.taxes],
                        ["NOPAT", (y) => y.nopat, true],
                        ["+ D&A", (y) => y.da],
                        ["− Capex", (y) => -y.capex],
                        ["− Increase in NWC", (y) => -y.changeInNwc],
                        ["Unlevered FCF", (y) => y.fcf, true],
                        ["Discount factor", (y) => y.discountFactor, false, 4],
                        ["PV of FCF", (y) => y.pvFcf, true],
                      ] as [string, (y: DcfYear) => number, boolean?, number?][]
                    ).map(([label, f, bold, dec]) => (
                      <tr key={label} className={cn("border-b border-line last:border-0", bold && "bg-cream/60 font-semibold")}>
                        <td className="py-1.5 pr-3 font-sans text-ink">{label}</td>
                        {r.years.map((y) => (
                          <td key={y.year} className="py-1.5 text-right text-ink">
                            {fmtNumber(f(y), dec ?? 1)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6">
                <ChartFrame
                  title="Unlevered FCF and its present value"
                  legend={[
                    { label: "Unlevered FCF", color: C.s1 },
                    { label: "Present value", color: C.s2 },
                  ]}
                  table={{ headers: ["Year", "UFCF ($m)", "PV ($m)"], rows: chartData.map((d) => [d.year, fmtNumber(d.fcf, 1), fmtNumber(d.pv, 1)]) }}
                >
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2} barCategoryGap="28%">
                        <CartesianGrid {...gridProps} />
                        <XAxis dataKey="year" {...axisProps} />
                        <YAxis {...axisProps} width={52} tickFormatter={(x) => fmtMoney(x)} />
                        <Tooltip
                          cursor={{ fill: "rgba(33,101,197,0.06)" }}
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload as (typeof chartData)[number];
                            return (
                              <TooltipBox
                                title={d.year}
                                rows={[
                                  { label: "UFCF", value: fmtMoney(d.fcf, { decimals: 1, unit: "m" }), color: C.s1 },
                                  { label: "PV", value: fmtMoney(d.pv, { decimals: 1, unit: "m" }), color: C.s2 },
                                ]}
                              />
                            );
                          }}
                        />
                        <Bar dataKey="fcf" fill={C.s1} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
                        <Bar dataKey="pv" fill={C.s2} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartFrame>
              </div>
            </Panel>
          )}

          {r && sens && (
            <Panel
              title="Sensitivity: WACC × terminal growth"
              action={
                <div className="flex gap-2">
                  <Chip active={sensOut === "price"} onClick={() => setSensOut("price")} disabled={!v.shares}>
                    Per share
                  </Chip>
                  <Chip active={sensOut === "ev"} onClick={() => setSensOut("ev")}>
                    EV
                  </Chip>
                </div>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] border-separate border-spacing-1 text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-medium text-ink-muted">WACC \ g</th>
                      {sens.gs.map((g) => (
                        <th key={g} className="px-2 py-1 text-xs font-semibold text-navy">
                          {fmtPct(g, 2)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sens.waccs.map((w, i) => (
                      <tr key={w}>
                        <th className="px-2 py-1 text-left text-xs font-semibold text-navy">{fmtPct(w, 2)}</th>
                        {sens.grid[i].map((val, j) => (
                          <td key={j} className={cn("figure rounded-md bg-cream/70 px-2 py-2 text-center text-ink", i === 2 && j === 2 && "bg-ice-soft font-bold ring-2 ring-navy")}>
                            {val === null ? "—" : sensOut === "ev" || !v.shares ? fmtMoney(val) : fmtMoney(val, { decimals: 2 })}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {r && (
            <Interpretation
              points={[
                <>
                  The terminal value is <strong>{fmtPct(r.terminalValueShare, 0)}</strong> of enterprise value.{" "}
                  {r.terminalValueShare > 0.8 ? "That is high: most of the answer rests on your terminal assumptions." : "The forecast period carries a reasonable share of value."}
                </>,
                <>
                  The terminal value implies <strong>{fmtMultiple(r.impliedExitMultiple)}</strong> final-year EBITDA. Compare it with where similar companies trade; a large gap means the
                  growth or WACC assumption deserves a second look.
                </>,
                <>
                  Moving WACC by ±1 point changes {sensOut === "ev" || !v.shares ? "enterprise value" : "value per share"} from{" "}
                  <strong>{fmtNumber(sens?.grid[4][2] ?? 0, 2)}</strong> to <strong>{fmtNumber(sens?.grid[0][2] ?? 0, 2)}</strong>, usually a wider range than any single operating
                  assumption.
                </>,
                ...(v.g > 4 ? [<>A terminal growth rate above about 4% exceeds what most economies sustain in the long run.</>] : []),
              ]}
            />
          )}
        </div>
      </div>
      <Notes
        tool={tool}
        assumptions={[
          "Five-year explicit forecast; margins, D&A, capex and working capital are constant percentages of revenue.",
          "Terminal value uses the Gordon growth method on final-year FCF grown at g. With the mid-year convention it is discounted at N − 0.5, consistently with the cash flows.",
          "Net debt should include debt-like items (and subtract cash); shares should be fully diluted.",
          "All inputs are yours: FinanceGo does not supply company data or market prices.",
        ]}
        formulas={[
          { label: "Unlevered FCF", tex: String.raw`\text{EBIT}(1-t) + \text{D\&A} - \text{Capex} - \Delta\text{NWC}` },
          { label: "Terminal value", tex: String.raw`TV_N = \frac{\text{FCF}_N(1+g)}{\text{WACC}-g}` },
          { label: "Equity value", tex: String.raw`EV - \text{Net debt}` },
        ]}
      />
    </div>
  );
}
