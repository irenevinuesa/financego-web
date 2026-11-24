"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTool } from "@/content/tools";
import { minimumVarianceWeight, sharpeRatio, twoAssetReturn, twoAssetVolatility } from "@/lib/finance/portfolio";
import { fmtNumber, fmtPct } from "@/lib/format";
import { NumberField, Slider } from "@/components/ui/Slider";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";
import { Interpretation, Notes, Panel, ResultGrid, ToolActions, Warning, downloadCsv } from "./ToolKit";

const DEFAULTS = { r1: 8, vol1: 18, r2: 4, vol2: 6, corr: 0.2, w1: 60, rf: 2 };
type Key = keyof typeof DEFAULTS;

export function PortfolioTool() {
  const [v, setV] = useState(DEFAULTS);
  const set = (k: Key) => (x: number) => setV((p) => ({ ...p, [k]: x }));

  const errors: Partial<Record<Key, string>> = {};
  const check = (k: Key, lo: number, hi: number, msg: string) => {
    if (!Number.isFinite(v[k]) || v[k] < lo || v[k] > hi) errors[k] = msg;
  };
  check("r1", -50, 100, "Enter a return between −50% and 100%.");
  check("r2", -50, 100, "Enter a return between −50% and 100%.");
  check("vol1", 0, 150, "Enter a volatility between 0% and 150%.");
  check("vol2", 0, 150, "Enter a volatility between 0% and 150%.");
  check("rf", -5, 30, "Enter a rate between −5% and 30%.");
  const valid = Object.keys(errors).length === 0;

  const s1 = v.vol1 / 100;
  const s2 = v.vol2 / 100;
  const w = v.w1 / 100;
  const ret = twoAssetReturn(w, v.r1 / 100, v.r2 / 100);
  const vol = twoAssetVolatility(w, s1, s2, v.corr);
  const naiveVol = w * s1 + (1 - w) * s2;
  const sharpe = sharpeRatio(ret, v.rf / 100, vol);

  const wMinRaw = minimumVarianceWeight(s1, s2, v.corr);
  const wMin = Math.min(1, Math.max(0, wMinRaw));
  const minVol = twoAssetVolatility(wMin, s1, s2, v.corr);
  const minRet = twoAssetReturn(wMin, v.r1 / 100, v.r2 / 100);

  const curve = useMemo(
    () =>
      Array.from({ length: 21 }, (_, i) => {
        const x = i / 20;
        return { w: x * 100, vol: twoAssetVolatility(x, s1, s2, v.corr) * 100, ret: twoAssetReturn(x, v.r1 / 100, v.r2 / 100) * 100 };
      }),
    [s1, s2, v.corr, v.r1, v.r2],
  );
  const best = curve.reduce((b, p) => {
    const sh = p.vol > 0 ? (p.ret - v.rf) / p.vol : Number.NEGATIVE_INFINITY;
    return sh > b.sh ? { w: p.w, sh } : b;
  }, { w: 0, sh: Number.NEGATIVE_INFINITY });

  const tool = getTool("portfolio-analytics")!;
  const exportCsv = () =>
    downloadCsv("financego-portfolio.csv", [
      ["Weight in asset A (%)", "Expected return (%)", "Volatility (%)", "Sharpe"],
      ...curve.map((p) => [p.w, p.ret.toFixed(3), p.vol.toFixed(3), p.vol > 0 ? ((p.ret - v.rf) / p.vol).toFixed(3) : ""]),
    ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Panel title="Inputs" action={<ToolActions onReset={() => setV(DEFAULTS)} onExport={exportCsv} />}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">Asset A (e.g. equities)</p>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Expected return" value={v.r1} onChange={set("r1")} unit="%" step={0.5} error={errors.r1} />
            <NumberField label="Volatility" value={v.vol1} onChange={set("vol1")} unit="%" step={1} error={errors.vol1} />
          </div>
          <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-ink-muted">Asset B (e.g. bonds)</p>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Expected return" value={v.r2} onChange={set("r2")} unit="%" step={0.5} error={errors.r2} />
            <NumberField label="Volatility" value={v.vol2} onChange={set("vol2")} unit="%" step={1} error={errors.vol2} />
          </div>
          <div className="mt-5 space-y-4">
            <Slider label="Correlation" value={v.corr} min={-1} max={1} step={0.05} onChange={set("corr")} format={(x) => x.toFixed(2)} hint="−1 moves opposite, +1 moves together" />
            <Slider label="Weight in asset A" value={v.w1} min={0} max={100} step={5} onChange={set("w1")} format={(x) => `${x}% A / ${100 - x}% B`} />
            <NumberField label="Risk-free rate" value={v.rf} onChange={set("rf")} unit="%" step={0.25} error={errors.rf} />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Your portfolio">
            {valid ? (
              <ResultGrid
                items={[
                  { label: "Expected return", value: fmtPct(ret, 2), strong: true, hint: `${v.w1}% × ${v.r1}% + ${100 - v.w1}% × ${v.r2}%` },
                  { label: "Volatility", value: fmtPct(vol, 2), strong: true, hint: `vs ${fmtPct(naiveVol, 2)} if the assets moved together` },
                  { label: "Sharpe ratio", value: Number.isFinite(sharpe) ? fmtNumber(sharpe, 2) : "—", hint: "Excess return per unit of risk" },
                  { label: "Diversification benefit", value: fmtPct(naiveVol - vol, 2), hint: "Volatility removed by imperfect correlation" },
                  { label: "Minimum-risk mix", value: `${fmtNumber(wMin * 100, 0)}% A`, hint: `${fmtPct(minVol, 2)} volatility, ${fmtPct(minRet, 2)} return` },
                  { label: "Highest-Sharpe mix", value: `${best.w}% A`, hint: Number.isFinite(best.sh) ? `Sharpe ${fmtNumber(best.sh, 2)} (in 5% steps)` : undefined },
                ]}
              />
            ) : (
              <Warning>Fix the highlighted inputs to see results.</Warning>
            )}
          </Panel>

          {valid && (
            <Panel title="Risk and return across every mix">
              <ChartFrame
                title="Expected return against volatility, from 100% B to 100% A"
                subtitle="The curve bends left because of diversification; the lower the correlation, the more it bends."
                legend={[
                  { label: "All mixes of A and B", color: C.s1, shape: "line" },
                  { label: "Your mix", color: C.s2, shape: "dot" },
                  { label: "Minimum risk", color: C.s3, shape: "dot" },
                ]}
                table={{ headers: ["Weight in A", "Volatility", "Return"], rows: curve.map((p) => [`${p.w}%`, `${p.vol.toFixed(2)}%`, `${p.ret.toFixed(2)}%`]) }}
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curve} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid {...gridProps} />
                      <XAxis dataKey="vol" type="number" domain={[0, "dataMax"]} {...axisProps} tickFormatter={(x) => `${Number(x).toFixed(0)}%`} />
                      <YAxis dataKey="ret" type="number" domain={["auto", "auto"]} {...axisProps} width={48} tickFormatter={(x) => `${Number(x).toFixed(1)}%`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0].payload as (typeof curve)[number];
                          return (
                            <TooltipBox
                              title={`${p.w}% A / ${100 - p.w}% B`}
                              rows={[
                                { label: "return", value: `${p.ret.toFixed(2)}%`, color: C.s1 },
                                { label: "volatility", value: `${p.vol.toFixed(2)}%`, color: C.s1 },
                              ]}
                            />
                          );
                        }}
                      />
                      <Line type="monotone" dataKey="ret" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
                      <ReferenceDot x={minVol * 100} y={minRet * 100} r={6} fill={C.s3} stroke={C.surface} strokeWidth={2} />
                      <ReferenceDot x={vol * 100} y={ret * 100} r={7} fill={C.s2} stroke={C.surface} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartFrame>
            </Panel>
          )}

          {valid && (
            <Interpretation
              points={[
                <>
                  With a correlation of <strong>{v.corr.toFixed(2)}</strong>, mixing the two assets removes <strong>{fmtPct(naiveVol - vol, 2)}</strong> of volatility at no cost in
                  expected return: the return is just the weighted average, the risk is not.
                </>,
                <>
                  The lowest-risk portfolio holds <strong>{fmtNumber(wMin * 100, 0)}%</strong> in A
                  {wMinRaw < 0 || wMinRaw > 1 ? " (it would need shorting to go further, which this long-only view does not allow)" : ""}. Any mix with less A than that is
                  inefficient: you could get more return for the same risk.
                </>,
                <>At a correlation of −1 the two assets can cancel out completely; at +1 there is no diversification at all. Try both with the slider.</>,
              ]}
            />
          )}
        </div>
      </div>
      <Notes
        tool={tool}
        assumptions={[
          "Expected returns, volatilities and the correlation are your forward-looking estimates, not historical facts.",
          "Long-only: weights stay between 0% and 100%, with no leverage.",
          "Volatility is the standard deviation of annual returns; it treats upside and downside surprises alike.",
          "The Sharpe ratio uses the risk-free rate you enter.",
        ]}
        formulas={[
          { label: "Portfolio return", tex: String.raw`E[R_p] = w\,E[R_A] + (1-w)\,E[R_B]` },
          { label: "Portfolio volatility", tex: String.raw`\sigma_p = \sqrt{w^2\sigma_A^2 + (1-w)^2\sigma_B^2 + 2w(1-w)\rho\,\sigma_A\sigma_B}` },
          { label: "Minimum-variance weight", tex: String.raw`w^* = \frac{\sigma_B^2 - \rho\,\sigma_A\sigma_B}{\sigma_A^2 + \sigma_B^2 - 2\rho\,\sigma_A\sigma_B}` },
        ]}
      />
    </div>
  );
}
