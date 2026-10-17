"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { accretionDilution, acquirerValueCreated, synergyValue } from "@/lib/finance/ma";
import { fmtMoney, fmtMultiple, fmtNumber, fmtPct, fmtSignedPct } from "@/lib/format";
import { Slider } from "@/components/ui/Slider";
import { Chip } from "@/components/ui/primitives";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";
import { Waterfall } from "@/components/charts/Waterfall";
import { KpiRow, WidgetShell } from "./WidgetShell";

const m = (v: number) => fmtMoney(v, { unit: "m" });
const signedM = (v: number) => `${v > 0.5 ? "+" : v < -0.5 ? "−" : ""}${fmtMoney(Math.abs(v), { unit: "m" })}`;
const TAX = 0.25;

/* ───────────── Who captures the value of a deal? ───────────── */

const STANDALONE = 1000;

export function DealValue() {
  const [premium, setPremium] = useState(0.3);
  const [synergies, setSynergies] = useState(50);
  const [rate, setRate] = useState(0.1);
  const [costs, setCosts] = useState(60);

  const grossSynergies = synergyValue(synergies, TAX, rate);
  const afterTaxCosts = costs * (1 - TAX);
  const netSynergies = grossSynergies - afterTaxCosts;
  const price = STANDALONE * (1 + premium);
  const created = acquirerValueCreated(STANDALONE, netSynergies, price);
  const premiumPaid = price - STANDALONE;
  const walkAway = netSynergies / STANDALONE;

  return (
    <WidgetShell
      title="Who captures the value of a deal?"
      controls={
        <>
          <Slider label="Premium paid" value={premium} min={0} max={0.6} step={0.01} onChange={setPremium} format={(v) => fmtPct(v, 0)} />
          <Slider label="Run-rate cost synergies (pre-tax, a year)" value={synergies} min={0} max={150} step={5} onChange={setSynergies} format={m} />
          <Slider label="Discount rate for synergies" value={rate} min={0.06} max={0.14} step={0.005} onChange={setRate} format={(v) => fmtPct(v, 1)} />
          <Slider label="One-off integration costs (pre-tax)" value={costs} min={0} max={150} step={5} onChange={setCosts} format={m} />
          <p className="text-xs text-ink-muted">Target&apos;s unaffected equity value: $1,000m. Tax rate 25%. Synergies (after tax) are valued as a level perpetuity, ignoring phasing; integration costs are after tax. “Gain” is the value created for the acquirer.</p>
        </>
      }
    >
      <KpiRow
        items={[
          { label: "Value of synergies, net of costs", value: m(netSynergies) },
          { label: "Premium paid to target holders", value: m(premiumPaid) },
          { label: "Value created for acquirer", value: signedM(created), hint: created >= 0 ? "price below standalone + synergies" : "the acquirer overpays" },
          { label: "Walk-away premium", value: fmtPct(Math.max(0, walkAway), 0), hint: "premium that pays away every synergy" },
          { label: "Share of synergies paid away", value: netSynergies > 0 ? fmtPct(premiumPaid / netSynergies, 0) : "n/a" },
        ]}
      />
      <Waterfall
        title="Target's value to the buyer, less the price paid ($m)"
        format={(v) => fmtNumber(v)}
        steps={[
          { label: "Target", value: STANDALONE, total: true },
          { label: "Synergy", value: grossSynergies },
          { label: "Costs", value: -afterTaxCosts },
          { label: "Worth", value: STANDALONE + netSynergies, total: true },
          { label: "Price", value: -price },
          { label: "Gain", value: created, total: true },
        ]}
      />
    </WidgetShell>
  );
}

/* ───────────── Accretion / dilution ───────────── */

const ACQ = { netIncome: 500, shares: 100, price: 100 };
const TARGET_NI = 80;
const v2pe = (price: number) => price / TARGET_NI;

export function AccretionDilution() {
  const [purchasePrice, setPurchasePrice] = useState(1200);
  const [stockPct, setStockPct] = useState(1);
  const [other, setOther] = useState<"debt" | "cash">("debt");
  const [costOfDebt, setCostOfDebt] = useState(0.06);
  const [cashRate, setCashRate] = useState(0.03);
  const [synergies, setSynergies] = useState(0);

  const run = (stock: number) =>
    accretionDilution({
      acquirerNetIncome: ACQ.netIncome,
      acquirerShares: ACQ.shares,
      acquirerSharePrice: ACQ.price,
      targetNetIncome: TARGET_NI,
      purchasePrice,
      stockPct: stock,
      debtPct: other === "debt" ? 1 - stock : 0,
      cashPct: other === "cash" ? 1 - stock : 0,
      costOfDebt,
      interestOnCash: cashRate,
      taxRate: TAX,
      synergies,
    });
  const r = run(stockPct);
  const acquirerPe = ACQ.price / (ACQ.netIncome / ACQ.shares);
  const targetYield = TARGET_NI / purchasePrice;
  const otherCost = (other === "debt" ? costOfDebt : cashRate) * (1 - TAX);
  const blendedCost = stockPct * (1 / acquirerPe) + (1 - stockPct) * otherCost;

  const curve = useMemo(
    () =>
      Array.from({ length: 21 }, (_, i) => {
        const s = i / 20;
        const x = accretionDilution({
          acquirerNetIncome: ACQ.netIncome,
          acquirerShares: ACQ.shares,
          acquirerSharePrice: ACQ.price,
          targetNetIncome: TARGET_NI,
          purchasePrice,
          stockPct: s,
          debtPct: other === "debt" ? 1 - s : 0,
          cashPct: other === "cash" ? 1 - s : 0,
          costOfDebt,
          interestOnCash: cashRate,
          taxRate: TAX,
          synergies,
        });
        return { s: s * 100, acc: x.accretion * 100 };
      }),
    [purchasePrice, other, costOfDebt, cashRate, synergies],
  );

  const accretive = r.accretion > 0.00005;
  const dilutive = r.accretion < -0.00005;

  return (
    <WidgetShell
      title="Accretion / dilution"
      controls={
        <>
          <Slider label="Price for target equity" value={purchasePrice} min={800} max={2400} step={50} onChange={setPurchasePrice} format={m} hint={`${fmtMultiple(v2pe(purchasePrice))} the target's earnings`} />
          <Slider label="Paid in new acquirer shares" value={stockPct} min={0} max={1} step={0.05} onChange={setStockPct} format={(v) => fmtPct(v, 0)} />
          <div>
            <p className="mb-2 text-sm text-ink">The rest is funded with</p>
            <div className="flex gap-2">
              <Chip active={other === "debt"} onClick={() => setOther("debt")}>
                New debt
              </Chip>
              <Chip active={other === "cash"} onClick={() => setOther("cash")}>
                Cash on hand
              </Chip>
            </div>
          </div>
          {other === "debt" ? (
            <Slider label="Pre-tax cost of new debt" value={costOfDebt} min={0.02} max={0.1} step={0.0025} onChange={setCostOfDebt} format={(v) => fmtPct(v, 2)} />
          ) : (
            <Slider label="Pre-tax interest earned on cash" value={cashRate} min={0} max={0.06} step={0.0025} onChange={setCashRate} format={(v) => fmtPct(v, 2)} />
          )}
          <Slider label="Pre-tax synergies (a year)" value={synergies} min={0} max={100} step={5} onChange={setSynergies} format={m} />
          <p className="text-xs text-ink-muted">Acquirer: net income $500m, 100m shares at $100 (EPS $5.00, P/E 20x). Target net income $80m. Tax 25%. Ignores fees and purchase accounting adjustments.</p>
        </>
      }
    >
      <KpiRow
        items={[
          { label: "Pro forma EPS", value: fmtMoney(r.proFormaEps, { decimals: 2 }), hint: "standalone $5.00" },
          { label: "Accretion / (dilution)", value: fmtSignedPct(r.accretion, 1) },
          { label: "Breakeven synergies", value: r.breakevenSynergies > 0 ? m(r.breakevenSynergies) : "None needed", hint: "pre-tax, for EPS-neutral" },
          { label: "New shares issued", value: `${fmtNumber(r.newShares, 1)}m` },
          { label: "Target earnings yield", value: fmtPct(targetYield, 2), hint: "target NI ÷ price paid" },
          { label: "After-tax cost of funding", value: fmtPct(blendedCost, 2), hint: `stock ${fmtPct(1 / acquirerPe, 1)} · ${other} ${fmtPct(otherCost, 2)}` },
        ]}
      />
      <p className={`mb-3 rounded-lg px-3 py-2 text-sm font-medium ${accretive ? "bg-success-soft text-success-ink" : dilutive ? "bg-error-soft text-error-ink" : "bg-cream text-ink"}`}>
        {synergies > 0
          ? accretive
            ? "Accretive, including synergies."
            : dilutive
              ? "Dilutive even after synergies."
              : "Roughly EPS-neutral."
          : accretive
            ? "Accretive: the target's earnings yield is above the after-tax cost of the funding used."
            : dilutive
              ? "Dilutive: the funding costs more, after tax, than the target's earnings yield."
              : "EPS-neutral: the target's earnings yield equals the cost of the funding."}
      </p>
      <ChartFrame
        title="Accretion / (dilution) by funding mix"
        subtitle={`Price ${m(purchasePrice)}; the rest funded with ${other === "debt" ? "new debt" : "cash on hand"}`}
        table={{ headers: ["Paid in stock", "Accretion / (dilution)"], rows: curve.filter((_, i) => i % 2 === 0).map((d) => [`${d.s.toFixed(0)}%`, fmtSignedPct(d.acc / 100, 1)]) }}
      >
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="s" type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} {...axisProps} tickFormatter={(v) => `${v}%`} />
              <YAxis {...axisProps} width={52} domain={["auto", "auto"]} tickFormatter={(v) => `${Number(v).toFixed(1)}%`} />
              <ReferenceLine y={0} stroke={C.axis} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as (typeof curve)[number];
                  return <TooltipBox title={`${d.s.toFixed(0)}% paid in stock`} rows={[{ label: "accretion", value: fmtSignedPct(d.acc / 100, 1), color: C.s1 }]} />;
                }}
              />
              <Line type="monotone" dataKey="acc" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
              <ReferenceDot x={stockPct * 100} y={r.accretion * 100} r={6} fill={C.s1} stroke={C.surface} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
    </WidgetShell>
  );
}
