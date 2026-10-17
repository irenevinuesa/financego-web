"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { fmtMoney, fmtNumber, fmtPct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { NumberField, Slider } from "@/components/ui/Slider";
import { C } from "@/components/charts/ChartKit";
import { KpiRow, WidgetShell } from "./WidgetShell";

const signed = (v: number) => {
  if (Math.abs(v) < 0.005) return "$0.00";
  return `${v > 0 ? "+" : "−"}$${Math.abs(v).toFixed(2)}`;
};

function Statement({ title, rows }: { title: string; rows: { label: string; value: number; bold?: boolean }[] }) {
  return (
    <div className="rounded-xl border border-line">
      <p className="border-b border-line bg-cream/70 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-navy">{title}</p>
      <dl className="divide-y divide-line">
        {rows.map((r) => (
          <div key={r.label} className={cn("flex items-center justify-between gap-2 px-3 py-1.5 text-sm", r.bold && "bg-ice-soft/40 font-semibold")}>
            <dt className="text-ink">{r.label}</dt>
            <dd className={cn("figure", r.value > 0.004 ? "text-success-ink" : r.value < -0.004 ? "text-error-ink" : "text-ink-muted")}>{signed(r.value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ───────────── Depreciation walk-through ───────────── */

export function DepreciationWalk() {
  const [dep, setDep] = useState(10);
  const [tax, setTax] = useState(0.25);
  const taxes = -dep * tax;
  const ni = -dep * (1 - tax);
  const cash = dep * tax;

  return (
    <WidgetShell
      title="Walk a change through the three statements"
      controls={
        <>
          <Slider label="Change in depreciation" value={dep} min={-30} max={30} step={5} onChange={setDep} format={(v) => `${v >= 0 ? "+" : "−"}$${Math.abs(v)}`} />
          <Slider label="Tax rate" value={tax} min={0} max={0.4} step={0.05} onChange={setTax} format={(v) => fmtPct(v, 0)} />
          <p className="text-xs text-ink-muted">Read it in interview order: income statement → cash flow statement → balance sheet.</p>
        </>
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        <Statement
          title="1 · Income statement"
          rows={[
            { label: "Depreciation", value: dep },
            { label: "EBIT", value: -dep },
            { label: "Taxes", value: taxes },
            { label: "Net income", value: ni, bold: true },
          ]}
        />
        <Statement
          title="2 · Cash flow statement"
          rows={[
            { label: "Net income", value: ni },
            { label: "Add back depreciation", value: dep },
            { label: "Cash from operations", value: cash, bold: true },
            { label: "Net change in cash", value: cash, bold: true },
          ]}
        />
        <Statement
          title="3 · Balance sheet"
          rows={[
            { label: "Cash", value: cash },
            { label: "Net PP&E", value: -dep },
            { label: "Total assets", value: cash - dep, bold: true },
            { label: "Retained earnings", value: ni, bold: true },
          ]}
        />
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm text-success-ink">
        <CircleCheck className="h-4 w-4" /> Assets change by {signed(cash - dep)} and equity by {signed(ni)}: the balance sheet balances.
      </p>
      <p className="mt-2 text-sm text-ink">
        Cash moves by exactly the tax effect: {fmtMoney(Math.abs(dep))} × {fmtPct(tax, 0)} = <span className="figure font-semibold">{signed(cash)}</span>.
      </p>
    </WidgetShell>
  );
}

/* ───────────── Cash conversion cycle ───────────── */

export function CashConversion() {
  const [revenue, setRevenue] = useState(365);
  const [cogs, setCogs] = useState(219);
  const [dso, setDso] = useState(45);
  const [dio, setDio] = useState(60);
  const [dpo, setDpo] = useState(30);

  const rev = Number.isFinite(revenue) && revenue > 0 ? revenue : 0;
  const cg = Number.isFinite(cogs) && cogs > 0 ? cogs : 0;
  const ar = (rev * dso) / 365;
  const inv = (cg * dio) / 365;
  const ap = (cg * dpo) / 365;
  const nwc = ar + inv - ap;
  const ccc = dso + dio - dpo;
  const span = Math.max(dio + dso, dpo, 1);
  const pct = (d: number) => `${(d / span) * 100}%`;

  const rows = [
    { label: `Inventory held · ${dio} days`, from: 0, to: dio, color: C.s1 },
    { label: `Waiting for customers · ${dso} days`, from: dio, to: dio + dso, color: C.s3 },
    { label: `Supplier credit · ${dpo} days`, from: 0, to: dpo, color: C.s2 },
  ];

  return (
    <WidgetShell
      title="Cash conversion cycle"
      controls={
        <>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Revenue" value={revenue} onChange={setRevenue} prefix="$" unit="m" min={0} />
            <NumberField label="COGS" value={cogs} onChange={setCogs} prefix="$" unit="m" min={0} />
          </div>
          <Slider label="DSO (days sales outstanding)" value={dso} min={0} max={120} step={1} onChange={setDso} format={(v) => `${v} d`} />
          <Slider label="DIO (days inventory outstanding)" value={dio} min={0} max={180} step={1} onChange={setDio} format={(v) => `${v} d`} />
          <Slider label="DPO (days payables outstanding)" value={dpo} min={0} max={120} step={1} onChange={setDpo} format={(v) => `${v} d`} />
        </>
      }
    >
      <KpiRow
        items={[
          { label: "Cash conversion cycle", value: `${ccc} days` },
          { label: "Working capital tied up", value: fmtMoney(nwc, { decimals: 1, unit: "m" }) },
          { label: "Cash freed by collecting 10 days sooner", value: fmtMoney((rev / 365) * 10, { decimals: 1, unit: "m" }) },
        ]}
      />
      <div className="space-y-2.5" role="img" aria-label={`Inventory ${dio} days, receivables ${dso} days, payables ${dpo} days, cash gap ${ccc} days`}>
        {rows.map((r) => (
          <div key={r.label}>
            <p className="mb-1 text-xs text-ink-muted">{r.label}</p>
            <div className="relative h-3 rounded-full bg-cream">
              <div className="absolute inset-y-0 rounded-full" style={{ left: pct(r.from), width: pct(Math.max(0, r.to - r.from)), background: r.color }} />
            </div>
          </div>
        ))}
        <div>
          <p className="mb-1 text-xs font-semibold text-navy">
            Cash gap the company must finance · {ccc} days
          </p>
          <div className="relative h-3 rounded-full bg-cream">
            {ccc > 0 && <div className="absolute inset-y-0 rounded-full bg-navy" style={{ left: pct(dpo), width: pct(ccc) }} />}
          </div>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
        {[
          ["Receivables", ar],
          ["Inventory", inv],
          ["Payables", -ap],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-lg border border-line px-3 py-2">
            <dt className="text-xs text-ink-muted">{l}</dt>
            <dd className="figure font-semibold text-navy">{fmtMoney(v as number, { decimals: 1, unit: "m" })}</dd>
          </div>
        ))}
      </dl>
      {ccc < 0 && <p className="mt-3 text-sm text-success-ink">A negative cycle means suppliers finance the business: growth releases cash. ({fmtNumber(-ccc)} days)</p>}
    </WidgetShell>
  );
}
