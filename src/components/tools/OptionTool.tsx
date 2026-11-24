"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTool } from "@/content/tools";
import { blackScholes, payoffAtExpiry, putCallParityGap, type OptionInputs } from "@/lib/finance/options";
import { fmtMoney, fmtNumber } from "@/lib/format";
import { Chip } from "@/components/ui/primitives";
import { NumberField } from "@/components/ui/Slider";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";
import { Interpretation, Notes, Panel, ResultGrid, ToolActions, Warning, downloadCsv } from "./ToolKit";

const DEFAULTS = { spot: 100, strike: 100, rate: 5, vol: 20, days: 365, div: 0 };
type Key = keyof typeof DEFAULTS;

export function OptionTool() {
  const [v, setV] = useState(DEFAULTS);
  const [kind, setKind] = useState<"call" | "put">("call");
  const set = (k: Key) => (x: number) => setV((p) => ({ ...p, [k]: x }));

  const errors: Partial<Record<Key, string>> = {};
  const check = (k: Key, lo: number, hi: number, msg: string) => {
    if (!Number.isFinite(v[k]) || v[k] < lo || v[k] > hi) errors[k] = msg;
  };
  check("spot", 0.01, 1e7, "Enter a positive price.");
  check("strike", 0.01, 1e7, "Enter a positive strike.");
  check("rate", -5, 30, "Enter a rate between −5% and 30%.");
  check("vol", 1, 300, "Enter a volatility between 1% and 300%.");
  check("days", 1, 3650, "Enter between 1 day and 10 years.");
  check("div", 0, 30, "Enter a yield between 0% and 30%.");
  const valid = Object.keys(errors).length === 0;

  const inputs: OptionInputs = { spot: v.spot, strike: v.strike, rate: v.rate / 100, volatility: v.vol / 100, time: v.days / 365, dividendYield: v.div / 100 };
  const r = valid ? blackScholes(inputs) : null;
  const g = r ? r[kind] : null;

  const curve = useMemo(() => {
    if (!valid || !r) return [];
    const lo = v.strike * 0.5;
    const hi = v.strike * 1.5;
    return Array.from({ length: 41 }, (_, i) => {
      const s = lo + ((hi - lo) * i) / 40;
      const today = blackScholes({ ...inputs, spot: s })[kind].price;
      const expiry = payoffAtExpiry(kind, s, v.strike);
      return { s, today, expiry, pnl: expiry - r[kind].price };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, v, kind]);

  const tool = getTool("option-pricing")!;
  const exportCsv = () =>
    r &&
    downloadCsv("financego-option-pricing.csv", [
      ["", "Call", "Put"],
      ["Price", r.call.price.toFixed(4), r.put.price.toFixed(4)],
      ["Delta", r.call.delta.toFixed(4), r.put.delta.toFixed(4)],
      ["Gamma", r.call.gamma.toFixed(5), r.put.gamma.toFixed(5)],
      ["Vega (per 1 vol point)", (r.call.vega / 100).toFixed(4), (r.put.vega / 100).toFixed(4)],
      ["Theta (per day)", (r.call.theta / 365).toFixed(4), (r.put.theta / 365).toFixed(4)],
      ["Rho (per 1% rate)", (r.call.rho / 100).toFixed(4), (r.put.rho / 100).toFixed(4)],
      ["d1", r.d1.toFixed(4), ""],
      ["d2", r.d2.toFixed(4), ""],
    ]);

  const moneyness = v.spot > v.strike ? (kind === "call" ? "in the money" : "out of the money") : v.spot < v.strike ? (kind === "call" ? "out of the money" : "in the money") : "at the money";
  const intrinsic = payoffAtExpiry(kind, v.spot, v.strike);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Panel
          title="Inputs"
          action={
            <ToolActions
              onReset={() => {
                setV(DEFAULTS);
                setKind("call");
              }}
              onExport={exportCsv}
            />
          }
        >
          <div className="mb-4 flex gap-2">
            <Chip active={kind === "call"} onClick={() => setKind("call")}>
              Call
            </Chip>
            <Chip active={kind === "put"} onClick={() => setKind("put")}>
              Put
            </Chip>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Spot price" value={v.spot} onChange={set("spot")} prefix="$" step={1} error={errors.spot} />
            <NumberField label="Strike" value={v.strike} onChange={set("strike")} prefix="$" step={1} error={errors.strike} />
            <NumberField label="Volatility" value={v.vol} onChange={set("vol")} unit="%" step={1} error={errors.vol} />
            <NumberField label="Days to expiry" value={v.days} onChange={set("days")} unit="days" step={5} error={errors.days} />
            <NumberField label="Risk-free rate" value={v.rate} onChange={set("rate")} unit="%" step={0.25} error={errors.rate} />
            <NumberField label="Dividend yield" value={v.div} onChange={set("div")} unit="%" step={0.25} error={errors.div} />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title={`${kind === "call" ? "Call" : "Put"} value and Greeks`}>
            {r && g ? (
              <>
                <ResultGrid
                  items={[
                    { label: `${kind === "call" ? "Call" : "Put"} price`, value: fmtMoney(g.price, { decimals: 2 }), strong: true, hint: `${fmtMoney(intrinsic, { decimals: 2 })} intrinsic + ${fmtMoney(g.price - intrinsic, { decimals: 2 })} time value` },
                    { label: "Delta", value: fmtNumber(g.delta, 3), hint: "Change in price for a $1 move in the stock" },
                    { label: "Gamma", value: fmtNumber(g.gamma, 4), hint: "Change in delta for a $1 move" },
                    { label: "Vega", value: fmtNumber(g.vega / 100, 3), hint: "Per 1 point of volatility" },
                    { label: "Theta", value: fmtNumber(g.theta / 365, 3), hint: "Per calendar day" },
                    { label: "Rho", value: fmtNumber(g.rho / 100, 3), hint: "Per 1% move in rates" },
                  ]}
                />
                <p className="mt-4 text-xs text-ink-muted">
                  d₁ = {fmtNumber(r.d1, 4)}, d₂ = {fmtNumber(r.d2, 4)}. Put–call parity check: C − P − (S·e<sup>−qT</sup> − K·e<sup>−rT</sup>) ={" "}
                  {fmtNumber(Math.abs(putCallParityGap(inputs, r.call.price, r.put.price)) < 5e-7 ? 0 : putCallParityGap(inputs, r.call.price, r.put.price), 6)}. The{" "}
                  {kind === "call" ? "put" : "call"} is worth {fmtMoney(r[kind === "call" ? "put" : "call"].price, { decimals: 2 })}.
                </p>
              </>
            ) : (
              <Warning>Fix the highlighted inputs to see results.</Warning>
            )}
          </Panel>

          {r && (
            <Panel title="Value against the stock price">
              <ChartFrame
                title={`Long ${kind}: value today and payoff at expiry`}
                subtitle="The gap between the two lines is the time value, which decays as expiry approaches."
                legend={[
                  { label: "Value today (Black–Scholes)", color: C.s1, shape: "line" },
                  { label: "Payoff at expiry", color: C.s2, shape: "line" },
                  { label: "Profit at expiry after the premium", color: C.s3, shape: "line" },
                ]}
                table={{ headers: ["Spot", "Value today", "Payoff at expiry", "Profit"], rows: curve.map((p) => [p.s.toFixed(1), p.today.toFixed(2), p.expiry.toFixed(2), p.pnl.toFixed(2)]) }}
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curve} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid {...gridProps} />
                      <XAxis dataKey="s" type="number" domain={["dataMin", "dataMax"]} {...axisProps} tickFormatter={(x) => `$${Math.round(Number(x))}`} />
                      <YAxis {...axisProps} width={48} tickFormatter={(x) => `$${Math.round(Number(x))}`} />
                      <ReferenceLine y={0} stroke={C.axis} />
                      <ReferenceLine x={v.spot} stroke={C.tick} strokeDasharray="4 4" />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0].payload as (typeof curve)[number];
                          return (
                            <TooltipBox
                              title={`Stock at $${p.s.toFixed(1)}`}
                              rows={[
                                { label: "value today", value: `$${p.today.toFixed(2)}`, color: C.s1 },
                                { label: "payoff at expiry", value: `$${p.expiry.toFixed(2)}`, color: C.s2 },
                                { label: "profit at expiry", value: `$${p.pnl.toFixed(2)}`, color: C.s3 },
                              ]}
                            />
                          );
                        }}
                      />
                      <Line type="monotone" dataKey="today" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="linear" dataKey="expiry" stroke={C.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="linear" dataKey="pnl" stroke={C.s3} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartFrame>
            </Panel>
          )}

          {r && g && (
            <Interpretation
              points={[
                <>
                  This {kind} is <strong>{moneyness}</strong>. A delta of <strong>{fmtNumber(g.delta, 2)}</strong> means it moves like {fmtNumber(Math.abs(g.delta) * 100, 0)} shares per 100
                  options. It is also a rough guide to the odds of finishing in the money (the exact risk-neutral probability is N(d₂)).
                </>,
                <>
                  Each day costs about <strong>{fmtMoney(Math.abs(g.theta / 365), { decimals: 3 })}</strong> in time value, and each extra point of volatility adds about{" "}
                  <strong>{fmtMoney(g.vega / 100, { decimals: 3 })}</strong>. Long options are long volatility and short time.
                </>,
                <>Gamma is highest for at-the-money options close to expiry: that is where delta changes fastest and hedging is hardest.</>,
              ]}
            />
          )}
        </div>
      </div>
      <Notes
        tool={tool}
        assumptions={[
          "European exercise only; American options can be worth more, especially puts and calls on dividend payers.",
          "Constant volatility and interest rate, continuous dividend yield, no transaction costs.",
          "Log-normal stock prices: real markets have fatter tails and a volatility smile.",
          "Theta is shown per calendar day (annual theta ÷ 365); vega and rho per one percentage point.",
        ]}
        formulas={[
          { label: "Call", tex: String.raw`C = S e^{-qT} N(d_1) - K e^{-rT} N(d_2)` },
          { label: "d₁ and d₂", tex: String.raw`d_1 = \frac{\ln(S/K) + (r - q + \sigma^2/2)T}{\sigma\sqrt{T}},\quad d_2 = d_1 - \sigma\sqrt{T}` },
          { label: "Put–call parity", tex: String.raw`C - P = S e^{-qT} - K e^{-rT}` },
        ]}
      />
    </div>
  );
}
