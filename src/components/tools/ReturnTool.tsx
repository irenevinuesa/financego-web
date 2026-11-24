"use client";

import { useState } from "react";
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Minus, Plus } from "lucide-react";
import { getTool } from "@/content/tools";
import { irr, npv } from "@/lib/finance/tvm";
import { cagr, moic, paybackPeriod } from "@/lib/finance/returns";
import { fmtMoney, fmtMultiple, fmtNumber, fmtPct } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/ui/Slider";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";
import { Interpretation, Notes, Panel, ResultGrid, ToolActions, Warning, downloadCsv } from "./ToolKit";

const DEFAULT_FLOWS = [-1000, 100, 150, 200, 250, 1200];
const DEFAULT_RATE = 10;

export function ReturnTool() {
  const [flows, setFlows] = useState(DEFAULT_FLOWS);
  const [rate, setRate] = useState(DEFAULT_RATE);

  const setFlow = (i: number) => (x: number) => setFlows((f) => f.map((c, j) => (j === i ? x : c)));
  const valid = flows.every(Number.isFinite) && Number.isFinite(rate) && rate > -99;
  const hasOut = flows.some((c) => c < 0);
  const hasIn = flows.some((c) => c > 0);

  const r =
    valid && hasOut && hasIn
      ? (() => {
          const invested = flows.filter((c) => c < 0).reduce((s, c) => s - c, 0);
          const received = flows.filter((c) => c > 0).reduce((s, c) => s + c, 0);
          const years = flows.length - 1;
          return {
            irr: irr(flows),
            npv: npv(rate / 100, flows),
            moic: moic(flows),
            cagr: cagr(invested, received, years),
            payback: paybackPeriod(flows),
            profit: received - invested,
            years,
          };
        })()
      : null;

  let cum = 0;
  const chart = flows.map((c, t) => {
    cum += c;
    return { t, flow: c, cumulative: cum };
  });

  const tool = getTool("investment-return")!;
  const exportCsv = () =>
    downloadCsv("financego-investment-return.csv", [
      ["Year", "Cash flow", "Cumulative"],
      ...chart.map((p) => [p.t, p.flow, p.cumulative]),
      [],
      ["IRR (%)", r?.irr === null || !r ? "" : (r.irr * 100).toFixed(3)],
      [`NPV at ${rate}%`, r ? r.npv.toFixed(2) : ""],
      ["MOIC", r ? r.moic.toFixed(3) : ""],
    ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Panel
          title="Cash flows"
          action={
            <ToolActions
              onReset={() => {
                setFlows(DEFAULT_FLOWS);
                setRate(DEFAULT_RATE);
              }}
              onExport={exportCsv}
            />
          }
        >
          <p className="mb-3 text-sm text-ink-muted">Money you put in is negative; money you get back is positive. Year 0 is today.</p>
          <div className="grid grid-cols-2 gap-3">
            {flows.map((c, i) => (
              <NumberField key={i} label={`Year ${i}`} value={c} onChange={setFlow(i)} prefix="$" step={50} />
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" disabled={flows.length >= 21} onClick={() => setFlows((f) => [...f, 0])}>
              <Plus className="h-4 w-4" /> Add year
            </Button>
            <Button variant="ghost" size="sm" disabled={flows.length <= 2} onClick={() => setFlows((f) => f.slice(0, -1))}>
              <Minus className="h-4 w-4" /> Remove last
            </Button>
          </div>
          <div className="mt-5">
            <NumberField label="Discount rate for NPV" value={rate} onChange={setRate} unit="%" step={0.5} hint="Your required return or cost of capital" />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Results">
            {r ? (
              <ResultGrid
                items={[
                  { label: "IRR", value: r.irr === null ? "—" : fmtPct(r.irr, 2), strong: true, hint: r.irr === null ? "No single rate makes NPV zero" : "Rate at which NPV = 0" },
                  { label: `NPV at ${rate}%`, value: fmtMoney(r.npv, { decimals: 0 }), strong: true, hint: r.npv >= 0 ? "Beats your required return" : "Falls short of your required return" },
                  { label: "MOIC", value: fmtMultiple(r.moic, 2), hint: `${fmtMoney(r.profit)} profit in total` },
                  { label: "CAGR", value: fmtPct(r.cagr, 2), hint: `Total in to total out over ${r.years} years` },
                  { label: "Payback", value: r.payback === null ? "Never" : `${fmtNumber(r.payback, 1)} years`, hint: "When cumulative cash turns positive" },
                ]}
              />
            ) : (
              <Warning>Enter at least one negative and one positive cash flow.</Warning>
            )}
          </Panel>

          <Panel title="Cash flows over time">
            <ChartFrame
              title="Each year's cash flow and the running total"
              legend={[
                { label: "Cash flow", color: C.s1, shape: "rect" },
                { label: "Cumulative", color: C.s2, shape: "line" },
              ]}
              table={{ headers: ["Year", "Cash flow", "Cumulative"], rows: chart.map((p) => [p.t, fmtMoney(p.flow), fmtMoney(p.cumulative)]) }}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chart} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="t" {...axisProps} tickFormatter={(x) => `Y${x}`} />
                    <YAxis {...axisProps} width={64} tickFormatter={(x) => fmtMoney(Number(x))} />
                    <ReferenceLine y={0} stroke={C.axis} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0].payload as (typeof chart)[number];
                        return (
                          <TooltipBox
                            title={`Year ${p.t}`}
                            rows={[
                              { label: "cash flow", value: fmtMoney(p.flow), color: C.s1 },
                              { label: "cumulative", value: fmtMoney(p.cumulative), color: C.s2 },
                            ]}
                          />
                        );
                      }}
                    />
                    <Bar dataKey="flow" isAnimationActive={false} radius={[3, 3, 0, 0]}>
                      {chart.map((p) => (
                        <Cell key={p.t} fill={p.flow < 0 ? "#c74a4a" : C.s1} />
                      ))}
                    </Bar>
                    <Line type="monotone" dataKey="cumulative" stroke={C.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </ChartFrame>
          </Panel>

          {r && r.irr !== null && (
            <Interpretation
              points={[
                <>
                  The IRR of <strong>{fmtPct(r.irr, 1)}</strong> is {r.irr > rate / 100 ? "above" : "below"} your {rate}% required return, which is why the NPV is{" "}
                  {r.npv >= 0 ? "positive" : "negative"}. IRR and NPV agree on accept-or-reject for conventional cash flows like these.
                </>,
                <>
                  CAGR ({fmtPct(r.cagr, 1)}) ignores timing: it treats all the money as going in at the start and coming out at the end. IRR rewards getting cash back earlier.
                </>,
                <>MOIC says how much you made; IRR says how fast. Investors look at both: a 3x over ten years is a lower IRR than a 2x over three.</>,
              ]}
            />
          )}
        </div>
      </div>
      <Notes
        tool={tool}
        assumptions={[
          "Cash flows arrive at the end of each year; year 0 is today and is not discounted.",
          "IRR is found by bisection between −99% and 1,000%. Cash flows that change sign more than once can have several IRRs; the tool returns one.",
          "IRR assumes interim cash is reinvested at the IRR itself; NPV assumes it is reinvested at the discount rate.",
          "CAGR compares total money in with total money out over the full period.",
        ]}
        formulas={[
          { label: "NPV", tex: String.raw`\text{NPV} = \sum_{t=0}^{N} \frac{CF_t}{(1+r)^t}` },
          { label: "IRR", tex: String.raw`\sum_{t=0}^{N} \frac{CF_t}{(1+\text{IRR})^t} = 0` },
          { label: "MOIC and CAGR", tex: String.raw`\text{MOIC} = \frac{\sum CF^+}{\sum |CF^-|},\quad \text{CAGR} = \text{MOIC}^{1/N} - 1` },
        ]}
      />
    </div>
  );
}
