/**
 * Cost of capital. All rates and weights are decimals.
 */

export interface WaccInputs {
  riskFreeRate: number;
  equityRiskPremium: number;
  beta: number;
  preTaxCostOfDebt: number;
  taxRate: number;
  /** D / (D + E), market values. Equity weight is 1 - debtWeight. */
  debtWeight: number;
}

export interface WaccResult {
  costOfEquity: number;
  afterTaxCostOfDebt: number;
  equityWeight: number;
  debtWeight: number;
  wacc: number;
}

export function costOfEquityCAPM(riskFreeRate: number, beta: number, equityRiskPremium: number): number {
  return riskFreeRate + beta * equityRiskPremium;
}

export function afterTaxCostOfDebt(preTaxCostOfDebt: number, taxRate: number): number {
  return preTaxCostOfDebt * (1 - taxRate);
}

export function wacc(inputs: WaccInputs): WaccResult {
  const costOfEquity = costOfEquityCAPM(inputs.riskFreeRate, inputs.beta, inputs.equityRiskPremium);
  const kd = afterTaxCostOfDebt(inputs.preTaxCostOfDebt, inputs.taxRate);
  const equityWeight = 1 - inputs.debtWeight;
  return {
    costOfEquity,
    afterTaxCostOfDebt: kd,
    equityWeight,
    debtWeight: inputs.debtWeight,
    wacc: equityWeight * costOfEquity + inputs.debtWeight * kd,
  };
}

/** Hamada: levered beta from unlevered beta, D/E and tax rate (assumes debt beta of zero). */
export function leverBeta(unleveredBeta: number, debtToEquity: number, taxRate: number): number {
  return unleveredBeta * (1 + (1 - taxRate) * debtToEquity);
}

export function unleverBeta(leveredBeta: number, debtToEquity: number, taxRate: number): number {
  return leveredBeta / (1 + (1 - taxRate) * debtToEquity);
}

/** Converts D / (D + E) into D / E. */
export function debtToEquityFromWeight(debtWeight: number): number {
  if (debtWeight >= 1) return Number.POSITIVE_INFINITY;
  return debtWeight / (1 - debtWeight);
}
