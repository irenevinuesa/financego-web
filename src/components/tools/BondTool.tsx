"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTool } from "@/content/tools";
import { analyzeBond, bondPrice, estimatedPriceChangePct, type BondInputs } from "@/lib/finance/bond";
import { fmtNumber, fmtPct, fmtSignedPct } from "@/lib/format";
import { NumberField } from "@/components/ui/Slider";
import { Label, Select } from "@/components/ui/primitives";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";
import { Interpretation, Notes, Panel, ResultGrid, ToolActions, Warning, downloadCsv } from "./ToolKit";

const DEFAULTS = { face: 100, coupon: 4, ytm: 5, years: 10, freq: 2 as BondInputs["frequency"] };

export function BondTool() {
  const [v, setV] = useState(DEFAULTS);
  const set = (k: "face" | "coupon" | "ytm" | "years") => (x: number) => setV((p) => ({ ...p, [k]: x }));

  const errors: Record<string, string> = {};
  if (!Number.isFinite(v.face) || v.face <= 0) errors.face = "Must be positive.";
  if (!Number.isFinite(v.coupon) || v.coupon < 0 || v.coupon > 30) errors.coupon = "Enter 0% to 30%.";
  if (!Number.isFinite(v.ytm) || v.ytm <= -1 || v.ytm > 30) errors.ytm = "Enter −1% to 30%.";
  if (!Number.isFinite(v.years) || v.years <= 0 || v.years > 100) errors.years = "Enter 0 to 100 years.";
  else if (Math.abs(v.years * v.freq - Math.round(v.years * v.freq)) > 1e-9) errors.years = "Maturity must be a whole number of coupon periods.";
  const valid = Object.keys(errors).length === 0;

  const inputs: BondInputs = { faceValue: v.face, couponRate: v.coupon / 100, yieldToMaturity: v.ytm / 100, years: v.years, frequency: v.freq };
  const r = valid ? analyzeBond(inputs) : null;

  const curve = useMemo(() => {
    if (!r) return [];
    const pts = [];
    const lo = Math.max(-0.5, v.ytm - 4);
    for (let y = lo; y <= v.ytm + 4 + 1e-9; y += 0.25) {
      const dy = (y - v.ytm) / 100;
      pts.push({
        y: Number(y.toFixed(2)),
        price: bondPrice({ ...inputs, yieldToMaturity: y / 100 }),
        durationOnly: r.price * (1 - r.modifiedDuration * dy),
      });
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r?.price, v]);

  const shocks = r
    ? [-1, 1].map((bp) => {
        const dy = bp / 100;
        const actual = bondPrice({ ...inputs, yieldToMaturity: inputs.yieldToMaturity + dy }) / r.price - 1;
        return { bp: bp * 100, durOnly: -r.modifiedDuration * dy, withConvexity: estimatedPriceChangePct(r.modifiedDuration, r.convexity, dy), actual };
      })
    : [];

  const tool = getTool("bond-pricing")!;
  const exportCsv = () => {
    if (!r) return;
    downloadCsv("financego-bond.csv", [
      ["Period", "Time (years)", "Cash flow", "Present value"],
      ...r.cashFlows.map((c) => [c.period, c.time.toFixed(4), c.cashFlow.toFixed(4), c.pv.toFixed(4)]),
      [],
      ["Price", r.price.toFixed(4)],
      ["Macaulay duration (years)", r.macaulayDuration.toFixed(4)],
      ["Modified duration", r.modifiedDuration.toFixed(4)],
      ["Convexity", r.convexity.toFixed(4)],
      ["DV01", r.dv01.toFixed(6)],
    ]);
  };

  const status = r ? (Math.abs(r.price - v.face) < 1e-6 ? "at par" : r.price > v.face ? "at a premium" : "at a discount") : "";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Panel title="Inputs" action={<ToolActions onReset={() => setV(DEFAULTS)} onExport={exportCsv} />}>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Face value" value={v.face} onChange={set("face")} error={errors.face} />
            <NumberField label="Annual coupon rate" value={v.coupon} onChange={set("coupon")} unit="%" step={0.125} error={errors.coupon} />
            <NumberField label="Yield to maturity" value={v.ytm} onChange={set("ytm")} unit="%" step={0.05} error={errors.ytm} />
            <NumberField label="Years to maturity" value={v.years} onChange={set("years")} step={0.5} error={errors.years} />
            <div className="col-span-2">
              <Label htmlFor="freq">Coupon frequency</Label>
              <Select id="freq" value={v.freq} onChange={(e) => setV((p) => ({ ...p, freq: Number(e.target.value) as BondInputs["frequency"] }))}>
                <option value={1}>Annual</option>
                <option value={2}>Semi-annual</option>
                <option value={4}>Quarterly</option>
                <option value={12}>Monthly</option>
              </Select>
            </div>
          </div>
        </Panel>

        <div className="min-w-0 space-y-6">
          <Panel title="Results">
            {r ? (
              <ResultGrid
                items={[
                  { label: "Price", value: fmtNumber(r.price, 3), strong: true, hint: `${fmtNumber((r.price / v.face) * 100, 2)}% of face · ${status}` },
                  { label: "Macaulay duration", value: `${fmtNumber(r.macaulayDuration, 2)} yrs` },
                  { label: "Modified duration", value: fmtNumber(r.modifiedDuration, 2), hint: "% price change per 1% yield move" },
                  { label: "Convexity", value: fmtNumber(r.convexity, 2) },
                  { label: "DV01", value: fmtNumber(r.dv01, 4), hint: "price change per 1bp, per bond" },
                  { label: "Coupon per period", value: fmtNumber(r.couponPayment, 3), hint: `${r.periods} payments` },
                ]}
              />
            ) : (
              <Warning>Fix the highlighted inputs to see results.</Warning>
            )}
          </Panel>

          {r && (
            <Panel title="Yield sensitivity">
              <ChartFrame
                title="Price-yield curve"
                subtitle="The curve bends (convexity); duration alone gives the straight-line estimate."
                legend={[
                  { label: "Actual price", color: C.s1, shape: "line" },
                  { label: "Duration estimate", color: C.s2, shape: "line" },
                ]}
                table={{ headers: ["Yield", "Price", "Duration estimate"], rows: curve.filter((_, i) => i % 4 === 0).map((p) => [`${p.y.toFixed(2)}%`, fmtNumber(p.price, 2), fmtNumber(p.durationOnly, 2)]) }}
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curve} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid {...gridProps} />
                      <XAxis dataKey="y" type="number" domain={["dataMin", "dataMax"]} {...axisProps} tickFormatter={(x) => `${x}%`} />
                      <YAxis {...axisProps} width={48} domain={["auto", "auto"]} tickFormatter={(x) => fmtNumber(x, 0)} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0].payload as (typeof curve)[number];
                          return (
                            <TooltipBox
                              title={`Yield ${p.y.toFixed(2)}%`}
                              rows={[
                                { label: "actual", value: fmtNumber(p.price, 2), color: C.s1 },
                                { label: "duration est.", value: fmtNumber(p.durationOnly, 2), color: C.s2 },
                              ]}
                            />
                          );
                        }}
                      />
                      <Line type="monotone" dataKey="price" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="linear" dataKey="durationOnly" stroke={C.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
                      <ReferenceDot x={v.ytm} y={r.price} r={6} fill={C.s1} stroke={C.surface} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartFrame>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[28rem] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-ink-muted">
                      <th className="py-2 font-medium">Yield shock</th>
                      <th className="py-2 font-medium">Duration only</th>
                      <th className="py-2 font-medium">Duration + convexity</th>
                      <th className="py-2 font-medium">Actual (repriced)</th>
                    </tr>
                  </thead>
                  <tbody className="figure">
                    {shocks.map((s) => (
                      <tr key={s.bp} className="border-b border-line last:border-0">
                        <td className="py-2 font-sans font-medium text-navy">{s.bp > 0 ? `+${s.bp}` : s.bp} bp</td>
                        <td className="py-2">{fmtSignedPct(s.durOnly, 2)}</td>
                        <td className="py-2">{fmtSignedPct(s.withConvexity, 2)}</td>
                        <td className="py-2 font-semibold text-navy">{fmtSignedPct(s.actual, 2)}</td>
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
                  The bond trades {status} because its {v.coupon}% coupon is {v.coupon > v.ytm ? "above" : v.coupon < v.ytm ? "below" : "equal to"} the {v.ytm}% yield the market requires.
                </>,
                <>
                  A 1-point rise in yields lowers the price by about <strong>{fmtPct(r.modifiedDuration / 100, 2)}</strong> (modified duration). Convexity makes the actual loss slightly
                  smaller and the gain from a fall in yields slightly larger.
                </>,
                <>Longer maturities and lower coupons raise duration, so they are more sensitive to interest rates.</>,
              ]}
            />
          )}
        </div>
      </div>
      <Notes
        tool={tool}
        assumptions={[
          "Priced on a coupon date: no accrued interest, and the clean and dirty prices are equal.",
          "A single flat yield discounts every cash flow (no term structure).",
          "Fixed-rate, option-free bond held to maturity; default risk is reflected only through the yield you enter.",
          "Duration and convexity are annualised from the periodic calculation.",
        ]}
        formulas={[
          { label: "Price", tex: String.raw`P = \sum_{k=1}^{n}\frac{CF_k}{(1+y/f)^{k}}` },
          { label: "Modified duration", tex: String.raw`D_{\text{mod}} = \frac{D_{\text{Mac}}}{1+y/f}` },
          { label: "Price change estimate", tex: String.raw`\tfrac{\Delta P}{P} \approx -D_{\text{mod}}\Delta y + \tfrac12 C(\Delta y)^2` },
        ]}
      />
    </div>
  );
}
