"use client";

import { useState } from "react";
import { getTool } from "@/content/tools";
import { accretionDilution, offerPremium } from "@/lib/finance/ma";
import { fmtMoney, fmtNumber, fmtPct, fmtSignedPct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { NumberField, Slider } from "@/components/ui/Slider";
import { Interpretation, Notes, Panel, ResultGrid, ToolActions, Warning, downloadCsv } from "./ToolKit";

const DEFAULTS = {
  acqNi: 500,
  acqShares: 100,
  acqPrice: 80,
  tgtNi: 60,
  tgtShares: 20,
  tgtPrice: 40,
  premium: 25,
  stock: 50,
  debt: 30,
  kd: 6,
  cashYield: 3,
  tax: 25,
  synergies: 20,
};
type Key = keyof typeof DEFAULTS;

const money = (x: number) => fmtMoney(x, { decimals: 1, unit: "m" });

export function AccretionTool() {
  const [v, setV] = useState(DEFAULTS);
  const set = (k: Key) => (x: number) => setV((p) => ({ ...p, [k]: x }));
  const cash = 100 - v.stock - v.debt;

  // Moving one funding slider takes the difference out of cash first, then the other slider.
  const setMix = (k: "stock" | "debt") => (x: number) =>
    setV((p) => {
      const other = k === "stock" ? "debt" : "stock";
      const next = { ...p, [k]: x };
      if (next.stock + next.debt > 100) next[other] = 100 - x;
      return next;
    });

  const errors: Partial<Record<Key, string>> = {};
  const check = (k: Key, lo: number, hi: number, msg: string) => {
    if (!Number.isFinite(v[k]) || v[k] < lo || v[k] > hi) errors[k] = msg;
  };
  check("acqNi", 0.01, 1e7, "Enter a positive net income.");
  check("acqShares", 0.01, 1e7, "Enter a positive share count.");
  check("acqPrice", 0.01, 1e6, "Enter a positive share price.");
  check("tgtNi", -1e7, 1e7, "Enter the target's net income.");
  check("tgtShares", 0.01, 1e7, "Enter a positive share count.");
  check("tgtPrice", 0.01, 1e6, "Enter a positive share price.");
  check("premium", 0, 200, "Enter a premium between 0% and 200%.");
  check("kd", 0, 30, "Enter a rate between 0% and 30%.");
  check("cashYield", 0, 30, "Enter a rate between 0% and 30%.");
  check("tax", 0, 60, "Enter a tax rate between 0% and 60%.");
  check("synergies", 0, 1e7, "Enter zero or more.");
  const valid = Object.keys(errors).length === 0;

  const offerPrice = v.tgtPrice * (1 + v.premium / 100);
  const purchasePrice = offerPrice * v.tgtShares;
  const base = {
    acquirerNetIncome: v.acqNi,
    acquirerShares: v.acqShares,
    acquirerSharePrice: v.acqPrice,
    targetNetIncome: v.tgtNi,
    purchasePrice,
    stockPct: v.stock / 100,
    debtPct: v.debt / 100,
    cashPct: cash / 100,
    costOfDebt: v.kd / 100,
    interestOnCash: v.cashYield / 100,
    taxRate: v.tax / 100,
  };
  const r = valid ? accretionDilution({ ...base, synergies: v.synergies }) : null;
  const noSyn = valid ? accretionDilution(base) : null;

  // The same deal paid entirely in each currency.
  const pure = valid
    ? (
        [
          ["All stock", { stockPct: 1, debtPct: 0, cashPct: 0 }],
          ["All debt", { stockPct: 0, debtPct: 1, cashPct: 0 }],
          ["All cash", { stockPct: 0, debtPct: 0, cashPct: 1 }],
        ] as const
      ).map(([label, mix]) => ({ label, accretion: accretionDilution({ ...base, ...mix, synergies: v.synergies }).accretion }))
    : [];

  const acquirerPe = v.acqPrice / (v.acqNi / v.acqShares);
  const offerPe = v.tgtNi > 0 ? purchasePrice / v.tgtNi : Number.NaN;

  const tool = getTool("accretion-dilution")!;
  const exportCsv = () =>
    r &&
    downloadCsv("financego-accretion-dilution.csv", [
      ["Item", "Value"],
      ["Offer price per target share", offerPrice.toFixed(2)],
      ["Purchase price ($m)", purchasePrice.toFixed(2)],
      ["Funding: stock / debt / cash (%)", `${v.stock} / ${v.debt} / ${cash}`],
      ["New shares issued (m)", r.newShares.toFixed(3)],
      ["Pro forma net income ($m)", r.proFormaNetIncome.toFixed(2)],
      ["Standalone EPS", r.standaloneEps.toFixed(4)],
      ["Pro forma EPS", r.proFormaEps.toFixed(4)],
      ["Accretion / (dilution) (%)", (r.accretion * 100).toFixed(2)],
      ["Breakeven synergies, pre-tax ($m)", noSyn!.breakevenSynergies.toFixed(2)],
    ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Panel title="Inputs" action={<ToolActions onReset={() => setV(DEFAULTS)} onExport={exportCsv} />}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">Acquirer</p>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Net income" value={v.acqNi} onChange={set("acqNi")} prefix="$" unit="m" step={10} error={errors.acqNi} />
            <NumberField label="Shares" value={v.acqShares} onChange={set("acqShares")} unit="m" step={1} error={errors.acqShares} />
            <NumberField label="Share price" value={v.acqPrice} onChange={set("acqPrice")} prefix="$" step={1} error={errors.acqPrice} />
          </div>
          <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-ink-muted">Target</p>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Net income" value={v.tgtNi} onChange={set("tgtNi")} prefix="$" unit="m" step={5} error={errors.tgtNi} />
            <NumberField label="Shares" value={v.tgtShares} onChange={set("tgtShares")} unit="m" step={1} error={errors.tgtShares} />
            <NumberField label="Unaffected price" value={v.tgtPrice} onChange={set("tgtPrice")} prefix="$" step={1} error={errors.tgtPrice} />
            <NumberField label="Offer premium" value={v.premium} onChange={set("premium")} unit="%" step={5} error={errors.premium} />
          </div>
          <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-ink-muted">Funding</p>
          <div className="space-y-3">
            <Slider label="Stock" value={v.stock} min={0} max={100} step={5} onChange={setMix("stock")} format={(x) => `${x}%`} />
            <Slider label="New debt" value={v.debt} min={0} max={100} step={5} onChange={setMix("debt")} format={(x) => `${x}%`} />
            <p className="text-sm text-ink">
              Cash on hand: <strong className="text-navy">{cash}%</strong>
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <NumberField label="Cost of debt" value={v.kd} onChange={set("kd")} unit="%" step={0.5} error={errors.kd} />
            <NumberField label="Yield on cash" value={v.cashYield} onChange={set("cashYield")} unit="%" step={0.5} error={errors.cashYield} />
            <NumberField label="Tax rate" value={v.tax} onChange={set("tax")} unit="%" step={1} error={errors.tax} />
            <NumberField label="Synergies (pre-tax)" value={v.synergies} onChange={set("synergies")} prefix="$" unit="m" step={5} error={errors.synergies} />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Results">
            {r && noSyn ? (
              <ResultGrid
                items={[
                  { label: "Offer price", value: fmtMoney(offerPrice, { decimals: 2 }), hint: `${fmtPct(offerPremium(offerPrice, v.tgtPrice), 0)} premium · ${money(purchasePrice)} in total` },
                  { label: "New shares issued", value: `${fmtNumber(r.newShares, 2)}m`, hint: `${fmtPct(r.newShares / r.proFormaShares, 1)} of the combined company` },
                  { label: "Pro forma net income", value: money(r.proFormaNetIncome), hint: "After interest, lost interest on cash and synergies" },
                  { label: "Standalone EPS", value: fmtMoney(r.standaloneEps, { decimals: 2 }) },
                  { label: "Pro forma EPS", value: fmtMoney(r.proFormaEps, { decimals: 2 }), strong: true },
                  {
                    label: r.accretion >= 0 ? "Accretion" : "Dilution",
                    value: fmtSignedPct(r.accretion, 1),
                    strong: true,
                    hint: noSyn.breakevenSynergies > 0 ? `Needs ${money(noSyn.breakevenSynergies)} of pre-tax synergies to break even` : "Accretive even without synergies",
                  },
                ]}
              />
            ) : (
              <Warning>Fix the highlighted inputs to see results.</Warning>
            )}
          </Panel>

          {r && (
            <Panel title="The same deal in each currency">
              <ul className="space-y-3">
                {pure.map((p) => {
                  const width = Math.min(100, (Math.abs(p.accretion) / Math.max(0.0001, ...pure.map((x) => Math.abs(x.accretion)))) * 100);
                  return (
                    <li key={p.label} className="grid grid-cols-[6rem_1fr_4.5rem] items-center gap-3 text-sm">
                      <span className="text-ink">{p.label}</span>
                      <span className="relative h-3 rounded-full bg-cream">
                        <span className={cn("absolute inset-y-0 left-0 rounded-full", p.accretion >= 0 ? "bg-navy" : "bg-error")} style={{ width: `${width}%` }} />
                      </span>
                      <span className={cn("text-right font-semibold tabular-nums", p.accretion >= 0 ? "text-navy" : "text-error-ink")}>{fmtSignedPct(p.accretion, 1)}</span>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}

          {r && (
            <Interpretation
              points={[
                <>
                  Stock is cheap for the acquirer when its P/E is high. Your P/E is <strong>{acquirerPe.toFixed(1)}x</strong>, so its stock costs{" "}
                  <strong>{fmtPct(1 / acquirerPe, 1)}</strong> of earnings yield; the target is being bought at{" "}
                  <strong>{Number.isFinite(offerPe) ? `${offerPe.toFixed(1)}x` : "—"}</strong> its earnings.
                </>,
                <>
                  Debt costs <strong>{fmtPct((v.kd / 100) * (1 - v.tax / 100), 1)}</strong> after tax and cash <strong>{fmtPct((v.cashYield / 100) * (1 - v.tax / 100), 1)}</strong> in lost
                  interest. A deal is accretive when the target&apos;s earnings yield beats the weighted cost of what you pay with.
                </>,
                <>Accretion is not value creation: a deal can raise EPS and still destroy value if the price is above what the target and its synergies are worth.</>,
              ]}
            />
          )}
        </div>
      </div>
      <Notes
        tool={tool}
        assumptions={[
          "Earnings are a full year of each company's net income; the deal closes at the start of the year.",
          "New shares are issued at the acquirer's current share price; there is no issuance discount or fees.",
          "Debt and cash costs are pre-tax rates applied to the part of the price they fund, then taxed.",
          "No purchase-price allocation: new D&A from write-ups and amortisation of intangibles is ignored.",
        ]}
        formulas={[
          { label: "Pro forma EPS", tex: String.raw`\text{EPS}_{PF} = \frac{NI_A + NI_T - \text{after-tax interest} + \text{after-tax synergies}}{\text{Shares}_A + \text{New shares}}` },
          { label: "New shares", tex: String.raw`\text{New shares} = \frac{\text{Price} \times \%\text{stock}}{P_A}` },
          { label: "Accretion", tex: String.raw`\frac{\text{EPS}_{PF}}{\text{EPS}_A} - 1` },
        ]}
      />
    </div>
  );
}
