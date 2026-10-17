"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { debtToEquityFromWeight, leverBeta } from "@/lib/finance/wacc";
import { dcfSensitivity, runDcf, type DcfInputs } from "@/lib/finance/dcf";
import { fmtMoney, fmtMultiple, fmtNumber, fmtPct, fmtSignedPct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { NumberField, Slider } from "@/components/ui/Slider";
import { Chip } from "@/components/ui/primitives";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";
import { Waterfall } from "@/components/charts/Waterfall";
import { KpiRow, WidgetShell } from "./WidgetShell";

const m = (v: number) => fmtMoney(v, { unit: "m" });
const m1 = (v: number) => fmtMoney(v, { decimals: 1, unit: "m" });

/* ───────────── FCF build ───────────── */

export function FcfBuild() {
  const revenue = 1000;
  const [margin, setMargin] = useState(0.2);
  const [tax, setTax] = useState(0.25);
  const [da, setDa] = useState(0.04);
  const [capex, setCapex] = useState(0.05);
  const [dNwc, setDNwc] = useState(10);

  const ebit = revenue * margin;
  const taxes = ebit * tax;
  const nopat = ebit - taxes;
  const daAmt = revenue * da;
  const capexAmt = revenue * capex;
  const fcf = nopat + daAmt - capexAmt - dNwc;

  return (
    <WidgetShell
      title="From revenue to unlevered free cash flow"
      controls={
        <>
          <p className="text-sm text-ink">
            Revenue: <span className="figure font-semibold text-navy">$1,000m</span>
          </p>
          <Slider label="EBIT margin" value={margin} min={0.05} max={0.35} step={0.01} onChange={setMargin} format={(v) => fmtPct(v, 0)} />
          <Slider label="Tax rate" value={tax} min={0} max={0.4} step={0.01} onChange={setTax} format={(v) => fmtPct(v, 0)} />
          <Slider label="D&A (% of revenue)" value={da} min={0} max={0.1} step={0.005} onChange={setDa} format={(v) => fmtPct(v, 1)} />
          <Slider label="Capex (% of revenue)" value={capex} min={0} max={0.15} step={0.005} onChange={setCapex} format={(v) => fmtPct(v, 1)} />
          <Slider label="Increase in NWC" value={dNwc} min={-20} max={50} step={1} onChange={setDNwc} format={(v) => m(v)} />
        </>
      }
    >
      <KpiRow
        items={[
          { label: "Unlevered FCF", value: m1(fcf) },
          { label: "FCF margin", value: fmtPct(fcf / revenue, 1) },
          { label: "FCF / EBITDA", value: fmtPct(fcf / (ebit + daAmt || 1), 0), hint: "cash conversion" },
        ]}
      />
      <Waterfall
        format={(v) => fmtMoney(v)}
        steps={[
          { label: "EBIT", value: ebit, total: true },
          { label: "Taxes", value: -taxes },
          { label: "NOPAT", value: nopat, total: true },
          { label: "D&A", value: daAmt },
          { label: "Capex", value: -capexAmt },
          { label: "ΔNWC", value: -dNwc },
          { label: "UFCF", value: fcf, total: true },
        ]}
      />
    </WidgetShell>
  );
}

/* ───────────── WACC → enterprise value ───────────── */

interface WaccState {
  rf: number;
  erp: number;
  betaU: number;
  dv: number;
  kd: number;
  tax: number;
}

const FCF1 = 100;
const G = 0.025;

function compute(s: WaccState) {
  const de = debtToEquityFromWeight(s.dv);
  const betaL = leverBeta(s.betaU, de, s.tax);
  const ke = s.rf + betaL * s.erp;
  const kdat = s.kd * (1 - s.tax);
  const w = (1 - s.dv) * ke + s.dv * kdat;
  const ev = w > G ? FCF1 / (w - G) : Number.NaN;
  return { betaL, ke, kdat, wacc: w, ev };
}

const DEFAULT_WACC: WaccState = { rf: 0.04, erp: 0.055, betaU: 1.0, dv: 0.3, kd: 0.06, tax: 0.25 };

export function WaccEv({ compact = false }: { compact?: boolean }) {
  const [s, setS] = useState<WaccState>(DEFAULT_WACC);
  const set = (k: keyof WaccState) => (v: number) => setS((p) => ({ ...p, [k]: v }));
  const r = compute(s);

  const tornado = useMemo(() => {
    const base = compute(s).ev;
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
    const tests: { label: string; up: Partial<WaccState>; down: Partial<WaccState> }[] = [
      { label: "Risk-free rate ±1 pt", up: { rf: s.rf + 0.01 }, down: { rf: Math.max(0, s.rf - 0.01) } },
      { label: "Equity risk premium ±1 pt", up: { erp: s.erp + 0.01 }, down: { erp: Math.max(0, s.erp - 0.01) } },
      { label: "Unlevered beta ±0.2", up: { betaU: s.betaU + 0.2 }, down: { betaU: Math.max(0.1, s.betaU - 0.2) } },
      { label: "Debt / capital ±10 pts", up: { dv: clamp(s.dv + 0.1, 0, 0.8) }, down: { dv: clamp(s.dv - 0.1, 0, 0.8) } },
      { label: "Cost of debt ±1 pt", up: { kd: s.kd + 0.01 }, down: { kd: Math.max(0, s.kd - 0.01) } },
      { label: "Tax rate ±5 pts", up: { tax: clamp(s.tax + 0.05, 0, 0.6) }, down: { tax: clamp(s.tax - 0.05, 0, 0.6) } },
    ];
    return tests
      .map((t) => {
        const up = compute({ ...s, ...t.up }).ev;
        const down = compute({ ...s, ...t.down }).ev;
        return { label: t.label, up: (up / base - 1) * 100, down: (down / base - 1) * 100 };
      })
      .filter((t) => Number.isFinite(t.up) && Number.isFinite(t.down))
      .sort((a, b) => Math.max(Math.abs(b.up), Math.abs(b.down)) - Math.max(Math.abs(a.up), Math.abs(a.down)));
  }, [s]);

  const curve = useMemo(() => {
    const pts = [];
    for (let w = 0.04; w <= 0.14 + 1e-9; w += 0.0025) pts.push({ w: w * 100, ev: FCF1 / (w - G) });
    return pts;
  }, []);

  const invalid = !(r.wacc > G);

  const controls = (
    <>
      <Slider label="Risk-free rate" value={s.rf} min={0} max={0.08} step={0.0025} onChange={set("rf")} format={(v) => fmtPct(v, 2)} />
      {!compact && <Slider label="Equity risk premium" value={s.erp} min={0.03} max={0.08} step={0.0025} onChange={set("erp")} format={(v) => fmtPct(v, 2)} />}
      <Slider label="Unlevered beta" value={s.betaU} min={0.5} max={2} step={0.05} onChange={set("betaU")} format={(v) => v.toFixed(2)} />
      <Slider label="Debt / (debt + equity)" value={s.dv} min={0} max={0.7} step={0.01} onChange={set("dv")} format={(v) => fmtPct(v, 0)} />
      {!compact && <Slider label="Pre-tax cost of debt" value={s.kd} min={0.02} max={0.12} step={0.0025} onChange={set("kd")} format={(v) => fmtPct(v, 2)} />}
      <Slider label="Tax rate" value={s.tax} min={0} max={0.4} step={0.01} onChange={set("tax")} format={(v) => fmtPct(v, 0)} />
      <button type="button" onClick={() => setS(DEFAULT_WACC)} className="text-xs font-medium text-electric hover:underline">
        Reset inputs
      </button>
    </>
  );

  return (
    <WidgetShell title={compact ? "Try it: what moves a company's value?" : "WACC and enterprise value"} controls={controls}>
      <KpiRow
        items={[
          { label: "Levered beta", value: r.betaL.toFixed(2) },
          { label: "Cost of equity", value: fmtPct(r.ke, 2) },
          { label: "WACC", value: fmtPct(r.wacc, 2) },
          ...(compact ? [] : [{ label: "After-tax cost of debt", value: fmtPct(r.kdat, 2) }]),
          { label: "Enterprise value", value: invalid ? "n/a" : m(r.ev), hint: "FCF $100m growing 2.5%" },
          ...(compact ? [] : [{ label: "EV / next-year FCF", value: invalid ? "n/a" : fmtMultiple(r.ev / FCF1) }]),
        ]}
      />
      {invalid ? (
        <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning-ink">WACC must be above the 2.5% growth rate for the perpetuity formula to work.</p>
      ) : compact ? (
        <ChartFrame title="Enterprise value at different WACCs" table={{ headers: ["WACC", "EV ($m)"], rows: curve.filter((_, i) => i % 4 === 0).map((p) => [`${p.w.toFixed(2)}%`, fmtNumber(p.ev)]) }}>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="w" type="number" domain={[4, 14]} ticks={[4, 6, 8, 10, 12, 14]} {...axisProps} tickFormatter={(v) => `${v}%`} />
                <YAxis {...axisProps} width={56} domain={[0, 7000]} allowDataOverflow tickFormatter={(v) => fmtMoney(v)} />
                <Tooltip content={({ active, payload }) => (active && payload?.length ? <TooltipBox title={`WACC ${(payload[0].payload as { w: number }).w.toFixed(2)}%`} rows={[{ label: "EV", value: m((payload[0].payload as { ev: number }).ev), color: C.s1 }]} /> : null)} />
                <Line type="monotone" dataKey="ev" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
                <ReferenceDot x={r.wacc * 100} y={Math.min(r.ev, 7000)} r={6} fill={C.s1} stroke={C.surface} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>
      ) : (
        <ChartFrame
          title="How much each input moves enterprise value"
          subtitle="Change in EV when one input moves up or down, others held constant"
          legend={[
            { label: "Input raised", color: C.s1 },
            { label: "Input lowered", color: C.s2 },
          ]}
          table={{ headers: ["Input", "Raised", "Lowered"], rows: tornado.map((t) => [t.label, fmtSignedPct(t.up / 100), fmtSignedPct(t.down / 100)]) }}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tornado} layout="vertical" stackOffset="sign" margin={{ top: 4, right: 16, left: 4, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid stroke={C.grid} horizontal={false} />
                <XAxis type="number" {...axisProps} tickFormatter={(v) => `${v > 0 ? "+" : ""}${Math.round(v)}%`} />
                <YAxis type="category" dataKey="label" {...axisProps} width={128} tick={{ ...axisProps.tick, fontSize: 11 }} />
                <ReferenceLine x={0} stroke={C.axis} />
                <Tooltip
                  cursor={{ fill: "rgba(29,112,176,0.06)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as (typeof tornado)[number];
                    return (
                      <TooltipBox
                        title={d.label}
                        rows={[
                          { label: "raised", value: fmtSignedPct(d.up / 100), color: C.s1 },
                          { label: "lowered", value: fmtSignedPct(d.down / 100), color: C.s2 },
                        ]}
                      />
                    );
                  }}
                />
                <Bar dataKey="up" stackId="t" fill={C.s1} radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} />
                <Bar dataKey="down" stackId="t" fill={C.s2} radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>
      )}
    </WidgetShell>
  );
}

/* ───────────── Terminal value ───────────── */

export function TerminalValue() {
  const [wacc, setWacc] = useState(0.09);
  const [g, setG] = useState(0.03);
  const fcfN = 150;
  const ebitdaN = 250;
  const n = 5;
  const pvForecast = 1000;
  const gEff = Math.min(g, wacc - 0.005);
  const tv = (fcfN * (1 + gEff)) / (wacc - gEff);
  const pvTv = tv / Math.pow(1 + wacc, n);
  const ev = pvForecast + pvTv;

  const data = useMemo(() => {
    const pts = [];
    for (let w = 0.06; w <= 0.14 + 1e-9; w += 0.0025) {
      if (w - gEff < 0.005) continue;
      pts.push({ w: w * 100, pv: (fcfN * (1 + gEff)) / (w - gEff) / Math.pow(1 + w, n) });
    }
    return pts;
  }, [gEff]);

  const tvUp = (fcfN * (1 + gEff)) / (wacc + 0.01 - gEff);
  const pvUp = tvUp / Math.pow(1 + wacc + 0.01, n);

  return (
    <WidgetShell
      title="Terminal value sensitivity"
      controls={
        <>
          <Slider label="WACC" value={wacc} min={0.06} max={0.14} step={0.0025} onChange={setWacc} format={(v) => fmtPct(v, 2)} />
          <Slider label="Terminal growth" value={gEff} min={0} max={0.04} step={0.0025} onChange={setG} format={(v) => fmtPct(v, 2)} hint="Kept at least 0.5 pt below WACC" />
          <p className="text-xs text-ink-muted">Final-year UFCF $150m · EBITDA $250m · 5-year forecast · PV of forecast cash flows $1,000m.</p>
        </>
      }
    >
      <KpiRow
        items={[
          { label: "Terminal value (year 5)", value: m(tv) },
          { label: "PV of terminal value", value: m(pvTv) },
          { label: "Share of enterprise value", value: fmtPct(pvTv / ev, 0) },
          { label: "Implied exit multiple", value: fmtMultiple(tv / ebitdaN), hint: "TV ÷ final-year EBITDA" },
          { label: "Enterprise value", value: m(ev) },
          { label: "PV of TV if WACC +1 pt", value: fmtSignedPct(pvUp / pvTv - 1) },
        ]}
      />
      <ChartFrame
        title="Present value of the terminal value as WACC changes"
        subtitle={`Terminal growth held at ${fmtPct(gEff, 2)}`}
        table={{ headers: ["WACC", "PV of TV ($m)"], rows: data.filter((_, i) => i % 4 === 0).map((d) => [`${d.w.toFixed(2)}%`, fmtNumber(d.pv)]) }}
      >
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="w" type="number" domain={[6, 14]} ticks={[6, 8, 10, 12, 14]} {...axisProps} tickFormatter={(v) => `${v}%`} />
              <YAxis {...axisProps} width={56} domain={[0, "auto"]} allowDataOverflow tickFormatter={(v) => fmtMoney(v)} />
              <Tooltip content={({ active, payload }) => (active && payload?.length ? <TooltipBox title={`WACC ${(payload[0].payload as { w: number }).w.toFixed(2)}%`} rows={[{ label: "PV of TV", value: m((payload[0].payload as { pv: number }).pv), color: C.s1 }]} /> : null)} />
              <Line type="monotone" dataKey="pv" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
              <ReferenceDot x={wacc * 100} y={pvTv} r={6} fill={C.s1} stroke={C.surface} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
    </WidgetShell>
  );
}

/* ───────────── EV → equity bridge ───────────── */

export function EvBridge() {
  const [ev, setEv] = useState(2000);
  const [debt, setDebt] = useState(500);
  const [cash, setCash] = useState(150);
  const [pref, setPref] = useState(0);
  const [mi, setMi] = useState(50);
  const [inv, setInv] = useState(0);
  const [shares, setShares] = useState(100);
  const num = (v: number) => (Number.isFinite(v) ? v : 0);
  const equity = num(ev) - num(debt) + num(cash) - num(pref) - num(mi) + num(inv);
  const perShare = num(shares) > 0 ? equity / num(shares) : null;

  return (
    <WidgetShell
      title="Enterprise value to equity value"
      controls={
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Enterprise value" value={ev} onChange={setEv} prefix="$" unit="m" />
          <NumberField label="Debt" value={debt} onChange={setDebt} prefix="$" unit="m" min={0} />
          <NumberField label="Cash" value={cash} onChange={setCash} prefix="$" unit="m" min={0} />
          <NumberField label="Preferred" value={pref} onChange={setPref} prefix="$" unit="m" min={0} />
          <NumberField label="Minority interest" value={mi} onChange={setMi} prefix="$" unit="m" min={0} />
          <NumberField label="Investments" value={inv} onChange={setInv} prefix="$" unit="m" min={0} hint="e.g. associates" />
          <div className="col-span-2">
            <NumberField label="Diluted shares" value={shares} onChange={setShares} unit="m" min={0} />
          </div>
        </div>
      }
    >
      <KpiRow
        items={[
          { label: "Equity value", value: m(equity) },
          { label: "Value per share", value: perShare === null ? "n/a" : fmtMoney(perShare, { decimals: 2 }) },
          { label: "Net debt", value: m(num(debt) - num(cash)) },
        ]}
      />
      <Waterfall
        format={(v) => fmtMoney(v)}
        steps={[
          { label: "EV", value: num(ev), total: true },
          { label: "Debt", value: -num(debt) },
          { label: "Cash", value: num(cash) },
          { label: "Pref.", value: -num(pref) },
          { label: "Minority", value: -num(mi) },
          { label: "Invest.", value: num(inv) },
          { label: "Equity", value: equity, total: true },
        ]}
      />
    </WidgetShell>
  );
}

/* ───────────── Sensitivity grid ───────────── */

const SENS_BASE: DcfInputs = {
  baseRevenue: 1000,
  revenueGrowth: [0.06, 0.06, 0.06, 0.06, 0.06],
  ebitMargin: 0.2,
  taxRate: 0.25,
  daPctRevenue: 0.04,
  capexPctRevenue: 0.05,
  nwcPctRevenue: 0.1,
  wacc: 0.09,
  terminalGrowth: 0.025,
  netDebt: 300,
  sharesOutstanding: 100,
};

const WACCS = [0.07, 0.08, 0.09, 0.1, 0.11];
const GROWTHS = [0.015, 0.02, 0.025, 0.03, 0.035];

export function SensitivityGrid() {
  const [margin, setMargin] = useState(0.2);
  const [output, setOutput] = useState<"ev" | "price">("price");
  const inputs = { ...SENS_BASE, ebitMargin: margin };
  const pick = output === "ev" ? (r: ReturnType<typeof runDcf>) => r.enterpriseValue : (r: ReturnType<typeof runDcf>) => r.valuePerShare ?? 0;
  const grid = dcfSensitivity(inputs, WACCS, GROWTHS, pick);
  const base = pick(runDcf(inputs));
  const fmt = (v: number) => (output === "ev" ? fmtMoney(v) : fmtMoney(v, { decimals: 2 }));
  const all = grid.flat().filter((v): v is number => v !== null);
  const maxDev = Math.max(...all.map((v) => Math.abs(v / base - 1)), 0.01);

  const tint = (v: number) => {
    const dev = v / base - 1;
    const a = Math.min(0.42, (Math.abs(dev) / maxDev) * 0.42);
    return dev >= 0 ? `rgba(29,112,176,${a})` : `rgba(235,104,52,${a})`;
  };

  return (
    <WidgetShell
      title="Two-way sensitivity table"
      controls={
        <>
          <div>
            <p className="mb-2 text-sm text-ink">Show</p>
            <div className="flex gap-2">
              <Chip active={output === "price"} onClick={() => setOutput("price")}>
                Value per share
              </Chip>
              <Chip active={output === "ev"} onClick={() => setOutput("ev")}>
                Enterprise value
              </Chip>
            </div>
          </div>
          <Slider label="EBIT margin (all years)" value={margin} min={0.1} max={0.3} step={0.01} onChange={setMargin} format={(v) => fmtPct(v, 0)} />
          <p className="text-xs text-ink-muted">Base case: WACC 9.0%, terminal growth 2.5%. Values in $ (per share) or $m (EV).</p>
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[26rem] border-separate border-spacing-1 text-sm">
          <caption className="mb-2 text-left text-xs text-ink-muted">Rows: WACC · Columns: terminal growth rate</caption>
          <thead>
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium text-ink-muted">WACC \ g</th>
              {GROWTHS.map((g) => (
                <th key={g} className="px-2 py-1 text-xs font-semibold text-navy">
                  {fmtPct(g, 1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WACCS.map((w, i) => (
              <tr key={w}>
                <th className="px-2 py-1 text-left text-xs font-semibold text-navy">{fmtPct(w, 1)}</th>
                {grid[i].map((v, j) => {
                  const isBase = w === 0.09 && GROWTHS[j] === 0.025;
                  return (
                    <td
                      key={j}
                      className={cn("figure rounded-md px-2 py-2 text-center text-ink", isBase && "font-bold ring-2 ring-navy")}
                      style={{ background: v === null ? undefined : tint(v) }}
                      title={isBase ? "Base case" : undefined}
                    >
                      {v === null ? "—" : fmt(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ background: "rgba(29,112,176,0.35)" }} /> Above base case
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ background: "rgba(235,104,52,0.35)" }} /> Below base case
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm ring-2 ring-navy" /> Base case
        </span>
      </div>
      <p className="mt-3 text-sm text-ink">
        Range across the table: <span className="figure font-semibold">{fmt(Math.min(...all))}</span> to <span className="figure font-semibold">{fmt(Math.max(...all))}</span>, versus a base case of{" "}
        <span className="figure font-semibold">{fmt(base)}</span>.
      </p>
    </WidgetShell>
  );
}
