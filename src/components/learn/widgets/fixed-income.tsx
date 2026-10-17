"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analyzeBond, bondPrice, currentYield, type BondInputs } from "@/lib/finance/bond";
import { forwardRate } from "@/lib/finance/rates";
import { fmtNumber, fmtPct, fmtSignedPct } from "@/lib/format";
import { Slider } from "@/components/ui/Slider";
import { Chip } from "@/components/ui/primitives";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";
import { KpiRow, WidgetShell } from "./WidgetShell";

const px = (v: number) => fmtNumber(v, 2);
const bp = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Math.round(v))}bp`;

/* ───────────── Price and yield ───────────── */

export function PriceYield() {
  const [coupon, setCoupon] = useState(0.04);
  const [years, setYears] = useState(5);
  const [ytm, setYtm] = useState(0.05);
  const [freq, setFreq] = useState<1 | 2>(1);
  const terms = { faceValue: 100, couponRate: coupon, years, frequency: freq };
  const price = bondPrice({ ...terms, yieldToMaturity: ytm });
  const gap = price - 100;
  const status = Math.abs(gap) < 0.005 ? "At par" : gap > 0 ? "Premium" : "Discount";

  const curve = useMemo(() => {
    const pts = [];
    for (let y = 0.005; y <= 0.12 + 1e-9; y += 0.0025) pts.push({ y: y * 100, p: bondPrice({ faceValue: 100, couponRate: coupon, years, frequency: freq, yieldToMaturity: y }) });
    return pts;
  }, [coupon, years, freq]);

  return (
    <WidgetShell
      title="Bond price and yield"
      controls={
        <>
          <Slider label="Coupon rate" value={coupon} min={0} max={0.1} step={0.0025} onChange={setCoupon} format={(v) => fmtPct(v, 2)} />
          <Slider label="Years to maturity" value={years} min={1} max={30} step={1} onChange={setYears} format={(v) => `${v} yr`} />
          <Slider label="Yield to maturity" value={ytm} min={0.005} max={0.12} step={0.0025} onChange={setYtm} format={(v) => fmtPct(v, 2)} />
          <div>
            <p className="mb-2 text-sm text-ink">Coupons paid</p>
            <div className="flex gap-2">
              <Chip active={freq === 1} onClick={() => setFreq(1)}>
                Annually
              </Chip>
              <Chip active={freq === 2} onClick={() => setFreq(2)}>
                Semi-annually
              </Chip>
            </div>
          </div>
          <p className="text-xs text-ink-muted">Face value 100, priced on a coupon date.</p>
        </>
      }
    >
      <KpiRow
        items={[
          { label: "Price", value: px(price), hint: "per 100 face" },
          { label: "Trades at", value: status, hint: status === "At par" ? "coupon = yield" : status === "Premium" ? "coupon above yield" : "coupon below yield" },
          { label: "Current yield", value: fmtPct(currentYield(100, coupon, price), 2), hint: "annual coupon ÷ price" },
        ]}
      />
      <ChartFrame
        title="Price at every yield"
        subtitle={`${fmtPct(coupon, 2)} coupon, ${years}-year bond. The curve crosses par where the yield equals the coupon.`}
        table={{ headers: ["Yield", "Price"], rows: curve.filter((_, i) => i % 4 === 2).map((d) => [`${d.y.toFixed(2)}%`, px(d.p)]) }}
      >
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="y" type="number" domain={[0, 12]} ticks={[0, 2, 4, 6, 8, 10, 12]} {...axisProps} tickFormatter={(v) => `${v}%`} />
              <YAxis {...axisProps} width={44} domain={["auto", "auto"]} tickFormatter={(v) => fmtNumber(v)} />
              <Tooltip content={({ active, payload }) => (active && payload?.length ? <TooltipBox title={`Yield ${(payload[0].payload as { y: number }).y.toFixed(2)}%`} rows={[{ label: "price", value: px((payload[0].payload as { p: number }).p), color: C.s1 }]} /> : null)} />
              <ReferenceLine y={100} stroke={C.tick} strokeDasharray="4 4" label={{ value: "Par", position: "insideTopRight", fill: C.tick, fontSize: 11 }} />
              <Line type="monotone" dataKey="p" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
              <ReferenceDot x={ytm * 100} y={price} r={6} fill={C.s1} stroke={C.surface} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
    </WidgetShell>
  );
}

/* ───────────── Duration and convexity under a rate shock ───────────── */

export function RateShock() {
  const [coupon, setCoupon] = useState(0.05);
  const [years, setYears] = useState(10);
  const [ytm, setYtm] = useState(0.05);
  const [shock, setShock] = useState(100);
  const inputs: BondInputs = { faceValue: 100, couponRate: coupon, years, frequency: 1, yieldToMaturity: ytm };
  const r = analyzeBond(inputs);
  const dy = shock / 10000;
  const newYield = Math.max(-0.0099, ytm + dy);
  const actual = bondPrice({ ...inputs, yieldToMaturity: newYield }) / r.price - 1;
  const durOnly = -r.modifiedDuration * dy;
  const withConv = durOnly + 0.5 * r.convexity * dy * dy;
  // Errors in percentage points of price.
  const durError = Math.abs(durOnly - actual) * 100;
  const convError = Math.abs(withConv - actual) * 100;
  const pts = (v: number) => `${fmtNumber(v, 2)} pts`;

  const curve = useMemo(() => {
    const pts = [];
    const lo = Math.max(0, ytm - 0.04);
    for (let y = lo; y <= ytm + 0.04 + 1e-9; y += 0.0025) {
      pts.push({
        y: y * 100,
        actual: bondPrice({ faceValue: 100, couponRate: coupon, years, frequency: 1, yieldToMaturity: y }),
        duration: r.price * (1 - r.modifiedDuration * (y - ytm)),
      });
    }
    return pts;
  }, [coupon, years, ytm, r.price, r.modifiedDuration]);

  return (
    <WidgetShell
      title="Duration, convexity and a rate shock"
      controls={
        <>
          <Slider label="Coupon rate (annual)" value={coupon} min={0} max={0.1} step={0.0025} onChange={setCoupon} format={(v) => fmtPct(v, 2)} />
          <Slider label="Years to maturity" value={years} min={1} max={30} step={1} onChange={setYears} format={(v) => `${v} yr`} />
          <Slider label="Starting yield" value={ytm} min={0.01} max={0.1} step={0.0025} onChange={setYtm} format={(v) => fmtPct(v, 2)} />
          <Slider label="Yield shock" value={shock} min={-300} max={300} step={25} onChange={setShock} format={bp} />
        </>
      }
    >
      <KpiRow
        items={[
          { label: "Modified duration", value: fmtNumber(r.modifiedDuration, 2), hint: `Macaulay ${fmtNumber(r.macaulayDuration, 2)} yrs` },
          { label: "Convexity", value: fmtNumber(r.convexity, 1) },
          { label: "DV01 per 100 face", value: fmtNumber(r.dv01, 4), hint: "price gain if yield falls 1bp" },
          { label: "Actual price change", value: fmtSignedPct(actual, 2) },
          { label: "Duration estimate", value: fmtSignedPct(durOnly, 2), hint: `error ${pts(durError)}` },
          { label: "Duration + convexity", value: fmtSignedPct(withConv, 2), hint: `error ${pts(convError)}` },
        ]}
      />
      <ChartFrame
        title="Actual price versus the duration line"
        subtitle="The gap between the curve and the straight line is convexity"
        legend={[
          { label: "Actual price", color: C.s1, shape: "line" },
          { label: "Duration estimate (tangent)", color: C.s2, shape: "line" },
        ]}
        table={{ headers: ["Yield", "Actual price", "Duration estimate"], rows: curve.filter((_, i) => i % 4 === 0).map((d) => [`${d.y.toFixed(2)}%`, px(d.actual), px(d.duration)]) }}
      >
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="y" type="number" domain={["dataMin", "dataMax"]} {...axisProps} tickFormatter={(v) => `${Number(v).toFixed(0)}%`} />
              <YAxis {...axisProps} width={44} domain={["auto", "auto"]} tickFormatter={(v) => fmtNumber(v)} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as (typeof curve)[number];
                  return (
                    <TooltipBox
                      title={`Yield ${d.y.toFixed(2)}%`}
                      rows={[
                        { label: "actual", value: px(d.actual), color: C.s1 },
                        { label: "duration line", value: px(d.duration), color: C.s2 },
                      ]}
                    />
                  );
                }}
              />
              <Line type="monotone" dataKey="actual" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="linear" dataKey="duration" stroke={C.s2} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
              <ReferenceDot x={ytm * 100} y={r.price} r={5} fill={C.navy} stroke={C.surface} strokeWidth={2} />
              <ReferenceDot x={newYield * 100} y={r.price * (1 + actual)} r={6} fill={C.s1} stroke={C.surface} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
      <p className="mt-3 text-sm text-ink">
        {shock === 0
          ? "Move the shock slider: duration alone always predicts a lower price than the bond actually reaches, whichever way yields move."
          : shock > 0
            ? `Duration alone overstates the fall by ${pts(durError)}; adding convexity cuts the error to ${pts(convError)}.`
            : `Duration alone understates the gain by ${pts(durError)}; adding convexity cuts the error to ${pts(convError)}.`}
      </p>
    </WidgetShell>
  );
}

/* ───────────── Yield curve: spot and forward rates ───────────── */

type CurvePreset = "normal" | "flat" | "inverted" | "humped";

const PRESETS: Record<CurvePreset, { label: string; short: number; long: number; hump: number }> = {
  normal: { label: "Upward sloping", short: 0.035, long: 0.045, hump: 0 },
  flat: { label: "Flat", short: 0.04, long: 0.04, hump: 0 },
  inverted: { label: "Inverted", short: 0.05, long: 0.038, hump: 0 },
  humped: { label: "Humped", short: 0.035, long: 0.038, hump: 0.008 },
};

const TENORS = Array.from({ length: 10 }, (_, i) => i + 1);

/** Smooth illustrative curve from a 1-year rate, a 10-year rate and a hump that peaks in the middle. */
function spotAt(t: number, short: number, long: number, hump: number) {
  const w = (1 - Math.exp(-(t - 1) / 3)) / (1 - Math.exp(-3));
  return short + (long - short) * w + hump * 4 * w * (1 - w);
}

export function YieldCurve() {
  const [short, setShort] = useState(PRESETS.normal.short);
  const [long, setLong] = useState(PRESETS.normal.long);
  const [hump, setHump] = useState(PRESETS.normal.hump);
  const apply = (k: CurvePreset) => {
    setShort(PRESETS[k].short);
    setLong(PRESETS[k].long);
    setHump(PRESETS[k].hump);
  };
  const active = (Object.keys(PRESETS) as CurvePreset[]).find((k) => Math.abs(PRESETS[k].short - short) < 1e-9 && Math.abs(PRESETS[k].long - long) < 1e-9 && Math.abs(PRESETS[k].hump - hump) < 1e-9);

  const data = TENORS.map((t) => {
    const s = spotAt(t, short, long, hump);
    const prev = t > 1 ? spotAt(t - 1, short, long, hump) : null;
    return { t, spot: s * 100, fwd: prev === null ? s * 100 : forwardRate(prev, t - 1, s, t) * 100 };
  });
  const s2 = data[1].spot / 100;
  const s10 = data[9].spot / 100;
  const spread = (s10 - s2) * 10000;
  const shape = Math.abs(spread) < 10 && hump < 0.002 ? "Flat" : hump >= 0.002 && Math.max(...data.map((d) => d.spot)) > Math.max(data[0].spot, data[9].spot) + 0.05 ? "Humped" : spread > 0 ? "Upward sloping" : "Inverted";
  const fwd1y1y = forwardRate(data[0].spot / 100, 1, s2, 2);

  return (
    <WidgetShell
      title="Spot rates and forward rates"
      controls={
        <>
          <div>
            <p className="mb-2 text-sm text-ink">Start from a shape</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PRESETS) as CurvePreset[]).map((k) => (
                <Chip key={k} active={active === k} onClick={() => apply(k)}>
                  {PRESETS[k].label}
                </Chip>
              ))}
            </div>
          </div>
          <Slider label="1-year spot rate" value={short} min={0} max={0.08} step={0.0025} onChange={setShort} format={(v) => fmtPct(v, 2)} />
          <Slider label="10-year spot rate" value={long} min={0} max={0.08} step={0.0025} onChange={setLong} format={(v) => fmtPct(v, 2)} />
          <Slider label="Hump in the middle" value={hump} min={-0.01} max={0.015} step={0.001} onChange={setHump} format={(v) => fmtSignedPct(v, 1).replace("%", " pt")} />
          <p className="text-xs text-ink-muted">Illustrative annually compounded rates, not market data.</p>
        </>
      }
    >
      <KpiRow
        items={[
          { label: "Shape", value: shape },
          { label: "2s10s spread", value: bp(spread), hint: "10-year minus 2-year spot" },
          { label: "1-year rate in 1 year", value: fmtPct(fwd1y1y, 2), hint: "the 1y1y forward" },
        ]}
      />
      <ChartFrame
        title="Spot curve and 1-year forward rates"
        subtitle="Each forward is the one-year rate from year t − 1 to year t that the spot curve locks in"
        legend={[
          { label: "Spot (zero) rate", color: C.s1, shape: "line" },
          { label: "1-year forward rate", color: C.s2, shape: "line" },
        ]}
        table={{ headers: ["Maturity", "Spot", "1-year forward ending then"], rows: data.map((d) => [`${d.t} yr`, `${d.spot.toFixed(2)}%`, d.t === 1 ? "—" : `${d.fwd.toFixed(2)}%`]) }}
      >
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="t" type="number" domain={[1, 10]} ticks={TENORS} {...axisProps} tickFormatter={(v) => `${v}y`} />
              <YAxis {...axisProps} width={48} domain={["auto", "auto"]} tickFormatter={(v) => `${Number(v).toFixed(1)}%`} />
              <Tooltip
                content={({ active: a, payload }) => {
                  if (!a || !payload?.length) return null;
                  const d = payload[0].payload as (typeof data)[number];
                  return (
                    <TooltipBox
                      title={`${d.t}-year`}
                      rows={[
                        { label: "spot", value: `${d.spot.toFixed(2)}%`, color: C.s1 },
                        ...(d.t > 1 ? [{ label: "forward", value: `${d.fwd.toFixed(2)}%`, color: C.s2 }] : []),
                      ]}
                    />
                  );
                }}
              />
              <Line type="monotone" dataKey="spot" stroke={C.s1} strokeWidth={2} dot={{ r: 2.5 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="fwd" stroke={C.s2} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 2.5 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
      <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-sm text-ink">
        {spread > 10
          ? "Forwards sit above spot rates: an upward-sloping curve prices in higher short rates later (plus any term premium)."
          : spread < -10
            ? "Forwards sit below spot rates: an inverted curve prices in falling short rates, often read as expected rate cuts."
            : "On a flat curve, forwards are close to spot: the market prices in roughly unchanged short rates."}
      </p>
    </WidgetShell>
  );
}
