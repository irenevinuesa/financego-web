"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { presentValue } from "@/lib/finance/tvm";
import { twoAssetReturn, twoAssetVolatility } from "@/lib/finance/portfolio";
import { valueDriverValue } from "@/lib/finance/dcf";
import { fmtMoney, fmtNumber, fmtPct } from "@/lib/format";
import { Slider, NumberField } from "@/components/ui/Slider";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";
import { KpiRow, WidgetShell } from "./WidgetShell";

/* ───────────── Present value explorer ───────────── */

export function PvExplorer() {
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(0.06);
  const [years, setYears] = useState(5);
  const amt = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const pv = presentValue(amt, rate, years);
  const pvUp = presentValue(amt, rate + 0.02, years);

  const data = useMemo(
    () =>
      Array.from({ length: 41 }, (_, t) => ({
        t,
        base: presentValue(amt, rate, t),
        up: presentValue(amt, rate + 0.02, t),
      })),
    [amt, rate],
  );

  return (
    <WidgetShell
      title="Present value explorer"
      controls={
        <>
          <NumberField label="Amount received" value={amount} onChange={setAmount} prefix="$" min={0} />
          <Slider label="Discount rate" value={rate} min={0} max={0.15} step={0.0025} onChange={setRate} format={(v) => fmtPct(v, 2)} />
          <Slider label="Years until received" value={years} min={1} max={40} step={1} onChange={setYears} format={(v) => `${v} yr`} />
        </>
      }
    >
      <KpiRow
        items={[
          { label: "Present value", value: fmtMoney(pv, { decimals: 2 }) },
          { label: "Discount factor", value: fmtNumber(1 / Math.pow(1 + rate, years), 4) },
          { label: "If the rate rises 2 points", value: `${fmtNumber(((pvUp - pv) / (pv || 1)) * 100, 1)}%`, hint: "change in PV" },
        ]}
      />
      <ChartFrame
        title="Today's value of the amount, by year received"
        legend={[
          { label: `At ${fmtPct(rate, 2)}`, color: C.s1, shape: "line" },
          { label: `At ${fmtPct(rate + 0.02, 2)}`, color: C.s2, shape: "line" },
        ]}
        table={{ headers: ["Year", `PV at ${fmtPct(rate, 2)}`, `PV at ${fmtPct(rate + 0.02, 2)}`], rows: data.filter((d) => d.t % 5 === 0).map((d) => [d.t, fmtMoney(d.base, { decimals: 0 }), fmtMoney(d.up, { decimals: 0 })]) }}
      >
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="t" type="number" domain={[0, 40]} ticks={[0, 10, 20, 30, 40]} {...axisProps} />
              <YAxis {...axisProps} width={52} tickFormatter={(v) => fmtMoney(v)} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as (typeof data)[number];
                  return (
                    <TooltipBox
                      title={`Received in year ${d.t}`}
                      rows={[
                        { label: `at ${fmtPct(rate, 2)}`, value: fmtMoney(d.base, { decimals: 0 }), color: C.s1 },
                        { label: `at ${fmtPct(rate + 0.02, 2)}`, value: fmtMoney(d.up, { decimals: 0 }), color: C.s2 },
                      ]}
                    />
                  );
                }}
              />
              <Line type="monotone" dataKey="base" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="up" stroke={C.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
              <ReferenceDot x={years} y={pv} r={5} fill={C.s1} stroke={C.surface} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
    </WidgetShell>
  );
}

/* ───────────── Diversification ───────────── */

const A = { r: 0.08, vol: 0.15 };
const B = { r: 0.12, vol: 0.25 };

export function Diversification() {
  const [wA, setWA] = useState(0.5);
  const [rho, setRho] = useState(0.2);

  const curve = useMemo(
    () =>
      Array.from({ length: 51 }, (_, i) => {
        const w = 1 - i / 50;
        return { w, vol: twoAssetVolatility(w, A.vol, B.vol, rho) * 100, ret: twoAssetReturn(w, A.r, B.r) * 100 };
      }),
    [rho],
  );
  const vol = twoAssetVolatility(wA, A.vol, B.vol, rho);
  const ret = twoAssetReturn(wA, A.r, B.r);
  const naive = wA * A.vol + (1 - wA) * B.vol;
  const minVol = curve.reduce((m, p) => (p.vol < m.vol ? p : m), curve[0]);

  return (
    <WidgetShell
      title="Diversification explorer"
      controls={
        <>
          <Slider label="Weight in asset A" value={wA} min={0} max={1} step={0.01} onChange={setWA} format={(v) => `${Math.round(v * 100)}% A / ${Math.round((1 - v) * 100)}% B`} />
          <Slider label="Correlation between A and B" value={rho} min={-1} max={1} step={0.05} onChange={setRho} format={(v) => v.toFixed(2)} />
          <p className="text-xs text-ink-muted">Asset A: 8% expected return, 15% volatility. Asset B: 12% and 25%.</p>
        </>
      }
    >
      <KpiRow
        items={[
          { label: "Expected return", value: fmtPct(ret, 1) },
          { label: "Portfolio volatility", value: fmtPct(vol, 1) },
          { label: "Risk removed by diversification", value: fmtPct(naive - vol, 1), hint: "vs weighted-average volatility" },
        ]}
      />
      <ChartFrame
        title="Every possible mix of A and B"
        subtitle={`Lowest-risk mix: ${Math.round(minVol.w * 100)}% A, ${minVol.vol.toFixed(1)}% volatility`}
        table={{ headers: ["Weight in A", "Volatility", "Expected return"], rows: curve.filter((_, i) => i % 5 === 0).map((p) => [`${Math.round(p.w * 100)}%`, `${p.vol.toFixed(1)}%`, `${p.ret.toFixed(1)}%`]) }}
      >
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 8, right: 16, left: 0, bottom: 14 }}>
              <CartesianGrid {...gridProps} vertical />
              <XAxis dataKey="vol" type="number" domain={[0, 30]} ticks={[0, 5, 10, 15, 20, 25, 30]} {...axisProps} tickFormatter={(v) => `${v}%`} label={{ value: "Volatility", position: "insideBottom", offset: -8, fill: C.tick, fontSize: 11 }} />
              <YAxis dataKey="ret" type="number" domain={[7, 13]} {...axisProps} width={44} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as (typeof curve)[number];
                  return (
                    <TooltipBox
                      title={`${Math.round(p.w * 100)}% A / ${Math.round((1 - p.w) * 100)}% B`}
                      rows={[
                        { label: "return", value: `${p.ret.toFixed(1)}%` },
                        { label: "volatility", value: `${p.vol.toFixed(1)}%` },
                      ]}
                    />
                  );
                }}
              />
              <Line type="linear" dataKey="ret" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
              <ReferenceDot x={vol * 100} y={ret * 100} r={6} fill={C.s1} stroke={C.surface} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
    </WidgetShell>
  );
}

/* ───────────── ROIC, growth and value ───────────── */

export function RoicGrowth() {
  const [wacc, setWacc] = useState(0.1);
  const [ronic, setRonic] = useState(0.15);
  const [g, setG] = useState(0.04);
  const nopat = 100;
  const gMax = Math.max(0, wacc - 0.01);
  const growth = Math.min(g, gMax);
  const value = valueDriverValue(nopat, growth, ronic, wacc);
  const noGrowth = nopat / wacc;

  const data = useMemo(() => {
    const pts = [];
    for (let x = 0; x <= gMax + 1e-9; x += 0.0025) pts.push({ g: x * 100, v: valueDriverValue(nopat, x, ronic, wacc) });
    return pts;
  }, [gMax, ronic, wacc]);

  const created = value - noGrowth;
  const verdict = Math.abs(ronic - wacc) < 0.0001 ? "Growth adds nothing: RONIC equals WACC." : ronic > wacc ? "Growth creates value: RONIC is above WACC." : "Growth destroys value: RONIC is below WACC.";

  return (
    <WidgetShell
      title="Does growth create value?"
      controls={
        <>
          <Slider label="WACC" value={wacc} min={0.06} max={0.14} step={0.0025} onChange={setWacc} format={(v) => fmtPct(v, 2)} />
          <Slider label="Return on new invested capital (RONIC)" value={ronic} min={0.02} max={0.3} step={0.005} onChange={setRonic} format={(v) => fmtPct(v, 1)} />
          <Slider label="Growth rate" value={growth} min={0} max={gMax} step={0.0025} onChange={setG} format={(v) => fmtPct(v, 2)} hint="Capped 1 point below WACC" />
          <p className="text-xs text-ink-muted">Next year&apos;s NOPAT: $100m.</p>
        </>
      }
    >
      <KpiRow
        items={[
          { label: "Value", value: fmtMoney(value, { unit: "m" }) },
          { label: "Value with no growth", value: fmtMoney(noGrowth, { unit: "m" }) },
          { label: "Value created by growth", value: `${created >= 0 ? "+" : "−"}${fmtMoney(Math.abs(created), { unit: "m" })}` },
        ]}
      />
      <p className={`mb-3 rounded-lg px-3 py-2 text-sm font-medium ${ronic > wacc + 0.0001 ? "bg-success-soft text-success-ink" : ronic < wacc - 0.0001 ? "bg-error-soft text-error-ink" : "bg-cream text-ink"}`}>{verdict}</p>
      <ChartFrame
        title="Company value as growth increases"
        legend={[
          { label: `RONIC ${fmtPct(ronic, 1)}`, color: C.s1, shape: "line" },
          { label: "No-growth value", color: C.tick, shape: "line" },
        ]}
        table={{ headers: ["Growth", "Value ($m)"], rows: data.filter((_, i) => i % 4 === 0).map((d) => [`${d.g.toFixed(2)}%`, fmtNumber(d.v, 0)]) }}
      >
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="g" type="number" domain={[0, gMax * 100]} {...axisProps} tickFormatter={(v) => `${Number(v).toFixed(0)}%`} />
              <YAxis {...axisProps} width={52} domain={["auto", "auto"]} tickFormatter={(v) => fmtNumber(v)} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as (typeof data)[number];
                  return <TooltipBox title={`Growth ${d.g.toFixed(2)}%`} rows={[{ label: "value", value: fmtMoney(d.v, { unit: "m" }), color: C.s1 }]} />;
                }}
              />
              <ReferenceLine y={noGrowth} stroke={C.tick} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="v" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
              <ReferenceDot x={growth * 100} y={value} r={5} fill={C.s1} stroke={C.surface} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
    </WidgetShell>
  );
}
