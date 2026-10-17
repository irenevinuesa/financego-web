"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTool } from "@/content/tools";
import { debtToEquityFromWeight, leverBeta, unleverBeta, wacc } from "@/lib/finance/wacc";
import { fmtPct } from "@/lib/format";
import { NumberField } from "@/components/ui/Slider";
import { C, ChartFrame, TooltipBox, axisProps, gridProps } from "@/components/charts/ChartKit";
import { Interpretation, Notes, Panel, ResultGrid, ToolActions, Warning, downloadCsv } from "./ToolKit";

const DEFAULTS = { rf: 4, erp: 5.5, beta: 1.2, kd: 6, tax: 25, dw: 30 };

export function WaccTool() {
  const [v, setV] = useState(DEFAULTS);
  const set = (k: keyof typeof DEFAULTS) => (x: number) => setV((p) => ({ ...p, [k]: x }));
  const setEquityWeight = (x: number) => setV((p) => ({ ...p, dw: Number.isFinite(x) ? 100 - x : p.dw }));

  const errors: Partial<Record<keyof typeof DEFAULTS, string>> = {};
  const check = (k: keyof typeof DEFAULTS, lo: number, hi: number, msg: string) => {
    if (!Number.isFinite(v[k]) || v[k] < lo || v[k] > hi) errors[k] = msg;
  };
  check("rf", -2, 20, "Enter a rate between −2% and 20%.");
  check("erp", 0, 15, "Enter a premium between 0% and 15%.");
  check("beta", 0, 5, "Enter a beta between 0 and 5.");
  check("kd", 0, 30, "Enter a rate between 0% and 30%.");
  check("tax", 0, 60, "Enter a tax rate between 0% and 60%.");
  check("dw", 0, 95, "Debt weight must be between 0% and 95%.");
  const valid = Object.keys(errors).length === 0;

  const inputs = { riskFreeRate: v.rf / 100, equityRiskPremium: v.erp / 100, beta: v.beta, preTaxCostOfDebt: v.kd / 100, taxRate: v.tax / 100, debtWeight: v.dw / 100 };
  const r = valid ? wacc(inputs) : null;

  const curve = useMemo(() => {
    if (!valid) return [];
    const betaU = unleverBeta(v.beta, debtToEquityFromWeight(v.dw / 100), v.tax / 100);
    return Array.from({ length: 17 }, (_, i) => {
      const w = i * 0.05;
      const relevered = wacc({ ...inputs, debtWeight: w, beta: leverBeta(betaU, debtToEquityFromWeight(w), v.tax / 100) }).wacc;
      const constant = wacc({ ...inputs, debtWeight: w }).wacc;
      return { w: w * 100, relevered: relevered * 100, constant: constant * 100 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, v]);

  const tool = getTool("wacc")!;
  const exportCsv = () =>
    downloadCsv("financego-wacc.csv", [
      ["Input / output", "Value"],
      ["Risk-free rate (%)", v.rf],
      ["Equity risk premium (%)", v.erp],
      ["Levered beta", v.beta],
      ["Pre-tax cost of debt (%)", v.kd],
      ["Tax rate (%)", v.tax],
      ["Debt weight (%)", v.dw],
      ["Equity weight (%)", 100 - v.dw],
      ["Cost of equity (%)", r ? (r.costOfEquity * 100).toFixed(3) : ""],
      ["After-tax cost of debt (%)", r ? (r.afterTaxCostOfDebt * 100).toFixed(3) : ""],
      ["WACC (%)", r ? (r.wacc * 100).toFixed(3) : ""],
    ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Panel title="Inputs" action={<ToolActions onReset={() => setV(DEFAULTS)} onExport={exportCsv} />}>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Risk-free rate" value={v.rf} onChange={set("rf")} unit="%" step={0.1} error={errors.rf} />
            <NumberField label="Equity risk premium" value={v.erp} onChange={set("erp")} unit="%" step={0.1} error={errors.erp} />
            <NumberField label="Beta (levered)" value={v.beta} onChange={set("beta")} step={0.05} error={errors.beta} />
            <NumberField label="Pre-tax cost of debt" value={v.kd} onChange={set("kd")} unit="%" step={0.1} error={errors.kd} />
            <NumberField label="Tax rate" value={v.tax} onChange={set("tax")} unit="%" step={1} error={errors.tax} />
            <div />
            <NumberField label="Debt weight D/(D+E)" value={v.dw} onChange={set("dw")} unit="%" step={1} error={errors.dw} />
            <NumberField label="Equity weight E/(D+E)" value={100 - v.dw} onChange={setEquityWeight} unit="%" step={1} hint="Weights always sum to 100%" />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Results">
            {r ? (
              <ResultGrid
                items={[
                  { label: "Cost of equity (CAPM)", value: fmtPct(r.costOfEquity), hint: `${v.rf}% + ${v.beta} × ${v.erp}%` },
                  { label: "After-tax cost of debt", value: fmtPct(r.afterTaxCostOfDebt), hint: `${v.kd}% × (1 − ${v.tax}%)` },
                  { label: "WACC", value: fmtPct(r.wacc), strong: true, hint: `${100 - v.dw}% equity / ${v.dw}% debt` },
                ]}
              />
            ) : (
              <Warning>Fix the highlighted inputs to see results.</Warning>
            )}
          </Panel>
          {r && (
            <Panel title="Sensitivity to leverage">
              <ChartFrame
                title="WACC as the debt weight changes"
                subtitle="Re-levering adjusts beta for each capital structure (Hamada); the other line naively keeps your beta fixed."
                legend={[
                  { label: "Beta re-levered (correct)", color: C.s1, shape: "line" },
                  { label: "Beta held constant (naive)", color: C.s2, shape: "line" },
                ]}
                table={{ headers: ["Debt weight", "WACC (re-levered)", "WACC (beta constant)"], rows: curve.map((p) => [`${p.w}%`, `${p.relevered.toFixed(2)}%`, `${p.constant.toFixed(2)}%`]) }}
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curve} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid {...gridProps} />
                      <XAxis dataKey="w" type="number" domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} {...axisProps} tickFormatter={(x) => `${x}%`} />
                      <YAxis {...axisProps} width={48} domain={["auto", "auto"]} tickFormatter={(x) => `${Number(x).toFixed(1)}%`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0].payload as (typeof curve)[number];
                          return (
                            <TooltipBox
                              title={`Debt weight ${p.w}%`}
                              rows={[
                                { label: "re-levered", value: `${p.relevered.toFixed(2)}%`, color: C.s1 },
                                { label: "beta constant", value: `${p.constant.toFixed(2)}%`, color: C.s2 },
                              ]}
                            />
                          );
                        }}
                      />
                      <Line type="monotone" dataKey="relevered" stroke={C.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="constant" stroke={C.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
                      <ReferenceDot x={v.dw} y={r.wacc * 100} r={6} fill={C.s1} stroke={C.surface} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartFrame>
            </Panel>
          )}
          {r && (
            <Interpretation
              points={[
                <>
                  Equity contributes <strong>{fmtPct(((100 - v.dw) / 100) * r.costOfEquity)}</strong> and debt <strong>{fmtPct((v.dw / 100) * r.afterTaxCostOfDebt)}</strong> to the WACC.
                </>,
                <>
                  The interest tax shield lowers WACC by <strong>{fmtPct((v.dw / 100) * (v.kd / 100) * (v.tax / 100))}</strong> compared with using the pre-tax cost of debt.
                </>,
                <>
                  Each +0.1 of beta adds <strong>{fmtPct(((100 - v.dw) / 100) * 0.1 * (v.erp / 100))}</strong> to WACC; each +1 point on the risk-free rate adds about{" "}
                  <strong>{fmtPct(((100 - v.dw) / 100) * 0.01)}</strong> through equity alone (more if the cost of debt rises too).
                </>,
                <>Holding beta constant overstates the benefit of debt: as leverage rises, shareholders bear more risk and demand more return.</>,
              ]}
            />
          )}
        </div>
      </div>
      <Notes
        tool={tool}
        assumptions={[
          "CAPM for the cost of equity; the risk-free rate, premium and beta are your estimates.",
          "Weights should be market values at the company's target capital structure.",
          "The cost of debt is the yield the company would pay today, not the coupon on old debt.",
          "The leverage chart re-levers beta with the Hamada formula, which assumes debt carries no market risk, and keeps the cost of debt fixed, so it ignores distress costs at high leverage.",
        ]}
        formulas={[
          { label: "WACC", tex: String.raw`\text{WACC} = \tfrac{E}{D+E}k_e + \tfrac{D}{D+E}k_d(1-t)` },
          { label: "CAPM", tex: String.raw`k_e = r_f + \beta\,\text{ERP}` },
          { label: "Hamada", tex: String.raw`\beta_L = \beta_U\left[1+(1-t)\tfrac{D}{E}\right]` },
        ]}
      />
    </div>
  );
}
