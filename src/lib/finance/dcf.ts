/**
 * Unlevered DCF with a Gordon-growth terminal value.
 * Currency amounts are in whatever unit the caller uses (FinanceGo uses $m).
 */

export interface DcfInputs {
  /** Revenue in the last actual year (year 0). */
  baseRevenue: number;
  /** Revenue growth for each forecast year; its length sets the forecast horizon. */
  revenueGrowth: number[];
  /** EBIT / revenue, applied to every forecast year. */
  ebitMargin: number;
  taxRate: number;
  /** D&A / revenue. */
  daPctRevenue: number;
  /** Capex / revenue. */
  capexPctRevenue: number;
  /** Net working capital / revenue. The cash flow impact is NWC% × change in revenue. */
  nwcPctRevenue: number;
  wacc: number;
  terminalGrowth: number;
  /** Debt + preferred + minority interest − cash. */
  netDebt: number;
  /** Optional; when > 0 an implied value per share is returned. */
  sharesOutstanding?: number;
  /** Discount each year's cash flow at t − 0.5 instead of t. */
  midYear?: boolean;
}

export interface DcfYear {
  year: number;
  revenue: number;
  ebit: number;
  ebitda: number;
  taxes: number;
  nopat: number;
  da: number;
  capex: number;
  changeInNwc: number;
  fcf: number;
  discountFactor: number;
  pvFcf: number;
}

export interface DcfResult {
  years: DcfYear[];
  sumPvFcf: number;
  terminalValue: number;
  pvTerminalValue: number;
  enterpriseValue: number;
  equityValue: number;
  valuePerShare: number | null;
  /** Share of enterprise value that comes from the terminal value. */
  terminalValueShare: number;
  /** Terminal value ÷ final-year EBITDA: a sanity check against trading multiples. */
  impliedExitMultiple: number;
}

export class DcfInputError extends Error {}

export function runDcf(inputs: DcfInputs): DcfResult {
  if (inputs.wacc <= inputs.terminalGrowth) {
    throw new DcfInputError("WACC must be higher than the terminal growth rate.");
  }
  if (inputs.revenueGrowth.length === 0) {
    throw new DcfInputError("The forecast needs at least one year.");
  }

  const years: DcfYear[] = [];
  let prevRevenue = inputs.baseRevenue;

  inputs.revenueGrowth.forEach((growth, i) => {
    const year = i + 1;
    const revenue = prevRevenue * (1 + growth);
    const ebit = revenue * inputs.ebitMargin;
    const taxes = ebit * inputs.taxRate;
    const nopat = ebit - taxes;
    const da = revenue * inputs.daPctRevenue;
    const capex = revenue * inputs.capexPctRevenue;
    const changeInNwc = (revenue - prevRevenue) * inputs.nwcPctRevenue;
    const fcf = nopat + da - capex - changeInNwc;
    const t = inputs.midYear ? year - 0.5 : year;
    const discountFactor = 1 / Math.pow(1 + inputs.wacc, t);
    years.push({
      year,
      revenue,
      ebit,
      ebitda: ebit + da,
      taxes,
      nopat,
      da,
      capex,
      changeInNwc,
      fcf,
      discountFactor,
      pvFcf: fcf * discountFactor,
    });
    prevRevenue = revenue;
  });

  const last = years[years.length - 1];
  const sumPvFcf = years.reduce((s, y) => s + y.pvFcf, 0);
  const terminalValue = (last.fcf * (1 + inputs.terminalGrowth)) / (inputs.wacc - inputs.terminalGrowth);
  // The terminal value is a value as at the end of the final year (or mid-year, consistently).
  const tvDiscountT = inputs.midYear ? last.year - 0.5 : last.year;
  const pvTerminalValue = terminalValue / Math.pow(1 + inputs.wacc, tvDiscountT);
  const enterpriseValue = sumPvFcf + pvTerminalValue;
  const equityValue = enterpriseValue - inputs.netDebt;
  const shares = inputs.sharesOutstanding ?? 0;

  return {
    years,
    sumPvFcf,
    terminalValue,
    pvTerminalValue,
    enterpriseValue,
    equityValue,
    valuePerShare: shares > 0 ? equityValue / shares : null,
    terminalValueShare: enterpriseValue !== 0 ? pvTerminalValue / enterpriseValue : 0,
    impliedExitMultiple: last.ebitda !== 0 ? terminalValue / last.ebitda : 0,
  };
}

/**
 * Two-way sensitivity of a DCF output to WACC (rows) and terminal growth (columns).
 * Cells where WACC ≤ g are returned as null.
 */
export function dcfSensitivity(
  inputs: DcfInputs,
  waccs: number[],
  growths: number[],
  pick: (r: DcfResult) => number = (r) => r.enterpriseValue,
): (number | null)[][] {
  return waccs.map((w) =>
    growths.map((g) => {
      if (w <= g) return null;
      return pick(runDcf({ ...inputs, wacc: w, terminalGrowth: g }));
    }),
  );
}

/** Value of a firm growing at g forever: NOPAT₁ × (1 − g / RONIC) / (WACC − g). */
export function valueDriverValue(nopatNextYear: number, growth: number, ronic: number, waccRate: number): number {
  if (waccRate <= growth) return Number.POSITIVE_INFINITY;
  const reinvestmentRate = ronic === 0 ? Number.POSITIVE_INFINITY : growth / ronic;
  return (nopatNextYear * (1 - reinvestmentRate)) / (waccRate - growth);
}
