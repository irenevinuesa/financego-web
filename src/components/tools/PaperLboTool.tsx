"use client";

import { useMemo, useState } from "react";
import { getTool } from "@/content/tools";
import { maxEntryMultiple, paperLbo, type LboInputs, type LboYear } from "@/lib/finance/lbo";
import { fmtMoney, fmtMultiple, fmtNumber, fmtPct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { NumberField } from "@/components/ui/Slider";
import { Interpretation, Notes, Panel, ResultGrid, ToolActions, Warning, downloadCsv } from "./ToolKit";

const DEFAULTS = {
  ebitda: 100,
  entry: 10,
  debt: 5,
  rate: 8,
  growth: 5,
  tax: 25,
  da: 20,
  capex: 20,
  fees: 2,
  exit: 10,
  years: 5,
  target: 20,
};
type Key = keyof typeof DEFAULTS;

const m = (x: number) => fmtMoney(x, { decimals: 1, unit: "m" });

export function PaperLboTool() {
  const [v, setV] = useState(DEFAULTS);
  const set = (k: Key) => (x: number) => setV((p) => ({ ...p, [k]: x }));

  const errors: Partial<Record<Key, string>> = {};
  const check = (k: Key, lo: number, hi: number, msg: string) => {
    if (!Number.isFinite(v[k]) || v[k] < lo || v[k] > hi) errors[k] = msg;
  };
  check("ebitda", 0.1, 1e6, "Enter a positive EBITDA.");
  check("entry", 1, 40, "Enter a multiple between 1x and 40x.");
  check("debt", 0, 15, "Enter between 0x and 15x EBITDA.");
  check("rate", 0, 30, "Enter a rate between 0% and 30%.");
  check("growth", -30, 50, "Enter growth between −30% and 50%.");
  check("tax", 0, 60, "Enter a tax rate between 0% and 60%.");
  check("da", 0, 100, "Enter between 0% and 100%.");
  check("capex", 0, 100, "Enter between 0% and 100%.");
  check("fees", 0, 10, "Enter fees between 0% and 10%.");
  check("exit", 1, 40, "Enter a multiple between 1x and 40x.");
  check("years", 1, 10, "Enter a holding period of 1 to 10 years.");
  check("target", 1, 100, "Enter a target IRR between 1% and 100%.");
  if (!errors.debt && !errors.entry && v.debt >= v.entry * (1 + v.fees / 100)) errors.debt = "Debt must be less than the purchase price.";
  const valid = Object.keys(errors).length === 0;

  const inputs: LboInputs = {
    entryEbitda: v.ebitda,
    entryMultiple: v.entry,
    debtMultiple: v.debt,
    interestRate: v.rate / 100,
    ebitdaGrowth: v.growth / 100,
    taxRate: v.tax / 100,
    daPctEbitda: v.da / 100,
    capexPctEbitda: v.capex / 100,
    feesPct: v.fees / 100,
    exitMultiple: v.exit,
    years: Math.round(v.years),
  };
  const r = valid ? paperLbo(inputs) : null;
  const maxEntry = useMemo(() => (valid ? maxEntryMultiple(inputs, v.target / 100) : null), [valid, v]); // eslint-disable-line react-hooks/exhaustive-deps

  const tool = getTool("paper-lbo")!;
  const exportCsv = () => {
    if (!r) return;
    downloadCsv("financego-paper-lbo.csv", [
      ["Year", "EBITDA", "Interest", "Taxes", "Capex", "Free cash flow", "Debt (end)", "Cash (end)"],
      ...r.schedule.map((y) => [y.year, y.ebitda.toFixed(2), y.interest.toFixed(2), y.taxes.toFixed(2), y.capex.toFixed(2), y.fcf.toFixed(2), y.debt.toFixed(2), y.cash.toFixed(2)]),
      [],
      ["Entry EV", r.entryEv.toFixed(2)],
      ["Entry equity", r.entryEquity.toFixed(2)],
      ["Exit EV", r.exitEv.toFixed(2)],
      ["Exit equity", r.exitEquity.toFixed(2)],
      ["MOIC", r.moic.toFixed(3)],
      ["IRR (%)", r.irr === null ? "" : (r.irr * 100).toFixed(2)],
    ]);
  };

  const gain = r ? r.exitEquity - r.entryEquity : 0;
  const bridge = r
    ? [
        { label: "EBITDA growth", value: r.bridge.ebitdaGrowth },
        { label: "Multiple change", value: r.bridge.multiple },
        { label: "Debt paydown and cash", value: r.bridge.deleveraging },
        { label: "Transaction fees", value: r.bridge.fees },
      ]
    : [];
  const maxAbs = Math.max(1, ...bridge.map((b) => Math.abs(b.value)));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Panel title="Inputs" action={<ToolActions onReset={() => setV(DEFAULTS)} onExport={exportCsv} />}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">Entry</p>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="EBITDA (year 0)" value={v.ebitda} onChange={set("ebitda")} prefix="$" unit="m" step={10} error={errors.ebitda} />
            <NumberField label="Entry multiple" value={v.entry} onChange={set("entry")} unit="x" step={0.5} error={errors.entry} />
            <NumberField label="Debt (x EBITDA)" value={v.debt} onChange={set("debt")} unit="x" step={0.5} error={errors.debt} />
            <NumberField label="Fees (% of EV)" value={v.fees} onChange={set("fees")} unit="%" step={0.5} error={errors.fees} />
          </div>
          <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-ink-muted">Operations</p>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="EBITDA growth / yr" value={v.growth} onChange={set("growth")} unit="%" step={1} error={errors.growth} />
            <NumberField label="Interest rate" value={v.rate} onChange={set("rate")} unit="%" step={0.5} error={errors.rate} />
            <NumberField label="D&A (% EBITDA)" value={v.da} onChange={set("da")} unit="%" step={1} error={errors.da} />
            <NumberField label="Capex (% EBITDA)" value={v.capex} onChange={set("capex")} unit="%" step={1} error={errors.capex} />
            <NumberField label="Tax rate" value={v.tax} onChange={set("tax")} unit="%" step={1} error={errors.tax} />
          </div>
          <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-ink-muted">Exit</p>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Exit multiple" value={v.exit} onChange={set("exit")} unit="x" step={0.5} error={errors.exit} />
            <NumberField label="Holding period" value={v.years} onChange={set("years")} unit="yrs" step={1} error={errors.years} />
            <NumberField label="Target IRR" value={v.target} onChange={set("target")} unit="%" step={1} error={errors.target} hint="Used for the maximum price" />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Returns">
            {r ? (
              <ResultGrid
                items={[
                  { label: "Entry equity", value: m(r.entryEquity), hint: `${m(r.entryEv)} EV + ${m(r.fees)} fees − ${m(r.entryDebt)} debt` },
                  { label: "Exit equity", value: m(r.exitEquity), hint: `${m(r.exitEv)} EV − ${m(r.exitNetDebt)} net debt` },
                  { label: "MOIC", value: fmtMultiple(r.moic, 2), strong: true, hint: `over ${inputs.years} year${inputs.years === 1 ? "" : "s"}` },
                  { label: "IRR", value: r.irr === null ? "—" : fmtPct(r.irr, 1), strong: true, hint: "MOIC^(1/years) − 1" },
                  { label: "Exit EBITDA", value: m(r.exitEbitda), hint: `${v.growth}% a year for ${inputs.years} years` },
                  {
                    label: `Max entry multiple for ${v.target}% IRR`,
                    value: maxEntry === null ? "—" : fmtMultiple(maxEntry, 1),
                    hint: maxEntry === null ? "Not reachable with this debt and exit" : `${m(maxEntry * v.ebitda)} EV`,
                  },
                ]}
              />
            ) : (
              <Warning>Fix the highlighted inputs to see results.</Warning>
            )}
          </Panel>

          {r && (
            <Panel title="Where the return comes from">
              <p className="mb-4 text-sm text-ink-muted">
                The sponsor&apos;s equity grows by <strong className="text-navy">{m(gain)}</strong>. These four sources add up to it.
              </p>
              <ul className="space-y-3">
                {bridge.map((b) => (
                  <li key={b.label} className="grid grid-cols-[9.5rem_1fr_5.5rem] items-center gap-3 text-sm">
                    <span className="text-ink">{b.label}</span>
                    <span className="relative h-3 rounded-full bg-cream">
                      <span
                        className={cn("absolute inset-y-0 left-0 rounded-full", b.value >= 0 ? "bg-navy" : "bg-error")}
                        style={{ width: `${(Math.abs(b.value) / maxAbs) * 100}%` }}
                      />
                    </span>
                    <span className={cn("text-right font-semibold tabular-nums", b.value >= 0 ? "text-navy" : "text-error-ink")}>{m(b.value)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {r && (
            <Panel title="Year by year">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-right text-sm tabular-nums">
                  <thead>
                    <tr className="border-b border-line text-xs text-ink-muted">
                      <th className="py-2 text-left font-medium">$m</th>
                      <th className="py-2 font-medium">Entry</th>
                      {r.schedule.map((y) => (
                        <th key={y.year} className="py-2 font-medium">
                          Year {y.year}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-ink">
                    {(
                      [
                        ["EBITDA", v.ebitda, (y) => y.ebitda],
                        ["− Interest", null, (y) => -y.interest],
                        ["− Taxes", null, (y) => -y.taxes],
                        ["− Capex", null, (y) => -y.capex],
                        ["Free cash flow", null, (y) => y.fcf],
                        ["Debt (end)", r.entryDebt, (y) => y.debt],
                        ["Cash (end)", 0, (y) => y.cash],
                      ] as [string, number | null, (y: LboYear) => number][]
                    ).map(([label, entry, get]) => (
                      <tr key={label} className={cn("border-b border-line/60", label === "Free cash flow" && "font-semibold text-navy")}>
                        <td className="py-1.5 text-left">{label}</td>
                        <td className="py-1.5 text-ink-muted">{entry === null ? "" : fmtNumber(entry, 1)}</td>
                        {r.schedule.map((y) => (
                          <td key={y.year} className="py-1.5">
                            {fmtNumber(get(y), 1)}
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
                  Rules of thumb to check your mental maths: <strong>2x in 3 years ≈ 26%</strong>, <strong>2x in 5 years ≈ 15%</strong>, <strong>3x in 5 years ≈ 25%</strong>.
                </>,
                <>
                  Leverage turns a {fmtPct(r.exitEv / r.entryEv - 1, 0)} rise in enterprise value into a {fmtPct(r.moic - 1, 0)} gain on the equity, because the debt
                  does not share in the upside.
                </>,
                <>
                  {r.bridge.multiple === 0
                    ? "Exiting at the entry multiple is the standard conservative assumption: the return then comes only from growth and paying down debt."
                    : r.bridge.multiple > 0
                      ? "Part of this return relies on selling at a higher multiple than you paid. Interviewers will push on whether that is realistic."
                      : "Exiting below the entry multiple drags on returns; growth and debt paydown have to make up for it."}
                </>,
              ]}
            />
          )}
        </div>
      </div>
      <Notes
        tool={tool}
        assumptions={[
          "One tranche of debt; interest is charged on the opening balance each year, so there is no circularity.",
          "Every dollar of free cash flow repays debt until it is gone, then builds cash (a 100% cash sweep).",
          "No working capital changes, dividends, management equity or minimum cash.",
          "Taxes are never negative (no tax losses carried forward), and fees are paid by the sponsor and not amortised.",
          "IRR assumes a single entry and a single exit with no interim cash to the sponsor.",
        ]}
        formulas={[
          { label: "Free cash flow", tex: String.raw`\text{FCF} = \text{EBITDA} - \text{Interest} - \text{Taxes} - \text{Capex}` },
          { label: "Exit equity", tex: String.raw`E_{exit} = \text{EBITDA}_N \times m_{exit} - (\text{Debt}_N - \text{Cash}_N)` },
          { label: "Returns", tex: String.raw`\text{MOIC} = \tfrac{E_{exit}}{E_{entry}},\quad \text{IRR} = \text{MOIC}^{1/N} - 1` },
        ]}
      />
    </div>
  );
}
