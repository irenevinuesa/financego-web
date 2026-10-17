"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTool } from "@/content/tools";
import { compoundGrowth, doublingTime } from "@/lib/finance/compound";
import { fmtMoney, fmtMoneyCompact, fmtNumber, fmtPct } from "@/lib/format";
import { NumberField } from "@/components/ui/Slider";
import { Label, Select } from "@/components/ui/primitives";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";
import { Interpretation, Notes, Panel, ResultGrid, ToolActions, Warning, downloadCsv } from "./ToolKit";

const DEFAULTS = { principal: 5000, contribution: 200, contribFreq: 12, rate: 6, compounding: 12, years: 20, timing: "end" as "end" | "begin", inflation: 2 };

export function CompoundTool() {
  const [v, setV] = useState(DEFAULTS);
  const set = (k: "principal" | "contribution" | "rate" | "years" | "inflation") => (x: number) => setV((p) => ({ ...p, [k]: x }));

  const errors: Record<string, string> = {};
  if (!Number.isFinite(v.principal) || v.principal < 0) errors.principal = "Enter 0 or more.";
  if (!Number.isFinite(v.contribution) || v.contribution < 0) errors.contribution = "Enter 0 or more.";
  if (!Number.isFinite(v.rate) || v.rate < -10 || v.rate > 50) errors.rate = "Enter −10% to 50%.";
  if (!Number.isFinite(v.years) || v.years < 1 || v.years > 80 || !Number.isInteger(v.years)) errors.years = "Whole years, 1 to 80.";
  if (!Number.isFinite(v.inflation) || v.inflation < -5 || v.inflation > 30) errors.inflation = "Enter −5% to 30%.";
  const valid = Object.keys(errors).length === 0;

  const r = valid
    ? compoundGrowth({
        principal: v.principal,
        annualRate: v.rate / 100,
        years: v.years,
        compoundsPerYear: v.compounding,
        contribution: v.contribution,
        contributionsPerYear: v.contribFreq,
        timing: v.timing,
        inflation: v.inflation / 100,
      })
    : null;

  const tool = getTool("compound-interest")!;
  const exportCsv = () => {
    if (!r) return;
    downloadCsv("financego-compound-interest.csv", [
      ["Year", "Balance", "Total contributed", "Total growth", "Balance in today's money"],
      ...r.schedule.map((y) => [y.year, y.balance.toFixed(2), y.totalContributed.toFixed(2), y.totalGrowth.toFixed(2), y.realBalance.toFixed(2)]),
    ]);
  };

  const growthShare = r && r.finalBalance > 0 ? r.totalGrowth / r.finalBalance : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Panel title="Inputs" action={<ToolActions onReset={() => setV(DEFAULTS)} onExport={exportCsv} />}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <NumberField label="Starting amount" value={v.principal} onChange={set("principal")} prefix="$" error={errors.principal} />
            </div>
            <NumberField label="Regular contribution" value={v.contribution} onChange={set("contribution")} prefix="$" error={errors.contribution} />
            <div>
              <Label htmlFor="cf">Contribution frequency</Label>
              <Select id="cf" value={v.contribFreq} onChange={(e) => setV((p) => ({ ...p, contribFreq: Number(e.target.value) }))}>
                <option value={12}>Monthly</option>
                <option value={1}>Annually</option>
              </Select>
            </div>
            <NumberField label="Annual interest rate" value={v.rate} onChange={set("rate")} unit="%" step={0.1} error={errors.rate} />
            <div>
              <Label htmlFor="cp">Compounding</Label>
              <Select id="cp" value={v.compounding} onChange={(e) => setV((p) => ({ ...p, compounding: Number(e.target.value) }))}>
                <option value={1}>Annually</option>
                <option value={4}>Quarterly</option>
                <option value={12}>Monthly</option>
                <option value={365}>Daily</option>
              </Select>
            </div>
            <NumberField label="Years" value={v.years} onChange={set("years")} step={1} error={errors.years} />
            <div>
              <Label htmlFor="tm">Contributions made</Label>
              <Select id="tm" value={v.timing} onChange={(e) => setV((p) => ({ ...p, timing: e.target.value as "end" | "begin" }))}>
                <option value="end">End of period</option>
                <option value="begin">Start of period</option>
              </Select>
            </div>
            <div className="col-span-2">
              <NumberField label="Expected inflation (for today's money)" value={v.inflation} onChange={set("inflation")} unit="%" step={0.1} error={errors.inflation} />
            </div>
          </div>
        </Panel>

        <div className="min-w-0 space-y-6">
          <Panel title="Results">
            {r ? (
              <ResultGrid
                items={[
                  { label: `Balance after ${v.years} years`, value: fmtMoney(r.finalBalance), strong: true },
                  { label: "Total contributed", value: fmtMoney(r.totalContributed) },
                  { label: "Growth earned", value: fmtMoney(r.totalGrowth), hint: `${fmtPct(growthShare, 0)} of the final balance` },
                  { label: "In today's money", value: fmtMoney(r.realFinalBalance), hint: `at ${v.inflation}% inflation` },
                  { label: "Effective annual rate", value: fmtPct(r.effectiveAnnualRate) },
                  { label: "Doubling time", value: v.rate > 0 ? `${fmtNumber(doublingTime(r.effectiveAnnualRate), 1)} years` : "n/a" },
                ]}
              />
            ) : (
              <Warning>Fix the highlighted inputs to see results.</Warning>
            )}
          </Panel>
          {r && (
            <Panel title="Growth over time">
              <ChartFrame
                title="Balance split into what you put in and what it earned"
                legend={[
                  { label: "Contributions", color: C.s1 },
                  { label: "Growth", color: C.s3 },
                ]}
                table={{ headers: ["Year", "Contributed", "Growth", "Balance"], rows: r.schedule.map((y) => [y.year, fmtMoney(y.totalContributed), fmtMoney(y.totalGrowth), fmtMoney(y.balance)]) }}
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={r.schedule} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid {...gridProps} />
                      <XAxis dataKey="year" {...axisProps} />
                      <YAxis {...axisProps} width={56} tickFormatter={(x) => fmtMoneyCompact(x)} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload as (typeof r.schedule)[number];
                          return (
                            <TooltipBox
                              title={`Year ${d.year}: ${fmtMoney(d.balance)}`}
                              rows={[
                                { label: "contributed", value: fmtMoney(d.totalContributed), color: C.s1 },
                                { label: "growth", value: fmtMoney(d.totalGrowth), color: C.s3 },
                              ]}
                            />
                          );
                        }}
                      />
                      <Area type="monotone" dataKey="totalContributed" stackId="1" stroke={C.s1} strokeWidth={2} fill={C.s1} fillOpacity={0.12} isAnimationActive={false} />
                      <Area type="monotone" dataKey="totalGrowth" stackId="1" stroke={C.s3} strokeWidth={2} fill={C.s3} fillOpacity={0.12} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartFrame>
            </Panel>
          )}
          {r && (
            <Interpretation
              points={[
                <>
                  {fmtPct(growthShare, 0)} of the final balance is growth rather than contributions. The longer the horizon, the larger that share, which is why starting early matters.
                </>,
                <>Compounding {v.compounding === 1 ? "annually" : v.compounding === 4 ? "quarterly" : v.compounding === 12 ? "monthly" : "daily"} turns a {v.rate}% nominal rate into an effective {fmtPct(r.effectiveAnnualRate)} a year.</>,
                <>Inflation of {v.inflation}% a year means the balance buys about what {fmtMoney(r.realFinalBalance)} buys today.</>,
              ]}
            />
          )}
        </div>
      </div>
      <Notes
        tool={tool}
        assumptions={[
          "A constant rate of return every year. Real investments fluctuate, and the order of returns matters when you contribute or withdraw.",
          "No taxes, fees or charges are deducted.",
          "Mixed frequencies are handled by converting the nominal rate into an equivalent rate per contribution period.",
          "This is an educational illustration, not a forecast of any investment's return.",
        ]}
        formulas={[
          { label: "Future value of a lump sum", tex: String.raw`FV = PV\left(1+\tfrac{r}{m}\right)^{mn}` },
          { label: "Effective annual rate", tex: String.raw`\text{EAR} = \left(1+\tfrac{r}{m}\right)^{m}-1` },
          { label: "Doubling time", tex: String.raw`n = \frac{\ln 2}{\ln(1+\text{EAR})}` },
        ]}
      />
    </div>
  );
}
