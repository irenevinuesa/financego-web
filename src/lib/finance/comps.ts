/**
 * Trading comparables: summary statistics, LTM and calendarisation, and implied values.
 * Amounts are in any consistent unit (for example $m); multiples are plain ratios (9.0 = 9.0x).
 */

export function mean(values: number[]): number {
  if (values.length === 0) return Number.NaN;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/** Percentile with linear interpolation between ranks (the same as Excel's PERCENTILE.INC). p is 0–1. */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.min(1, Math.max(0, p)) * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.min(lo + 1, sorted.length - 1);
  return sorted[lo] + (rank - lo) * (sorted[hi] - sorted[lo]);
}

export function median(values: number[]): number {
  return percentile(values, 0.5);
}

/** Last twelve months: last full fiscal year + current year-to-date − prior year-to-date. */
export function lastTwelveMonths(lastFiscalYear: number, ytdCurrent: number, ytdPrior: number): number {
  return lastFiscalYear + ytdCurrent - ytdPrior;
}

/**
 * Calendar-year figure for a company whose fiscal year ends in month `fyEndMonth` (1–12).
 * `fyEndingInYear` is the fiscal year that ends inside the calendar year, `fyEndingNextYear` the one after.
 */
export function calendarise(fyEndingInYear: number, fyEndingNextYear: number, fyEndMonth: number): number {
  const w = fyEndMonth / 12;
  return w * fyEndingInYear + (1 - w) * fyEndingNextYear;
}

export interface EquityToEvInputs {
  equityValue: number;
  debt: number;
  cash: number;
  preferred?: number;
  minorityInterest?: number;
  /** Non-operating investments such as associates, whose profits are not in EBITDA. */
  investments?: number;
}

/** Enterprise value from equity value: + debt − cash + preferred + minority interest − investments. */
export function enterpriseValueFromEquity(i: EquityToEvInputs): number {
  return i.equityValue + i.debt - i.cash + (i.preferred ?? 0) + (i.minorityInterest ?? 0) - (i.investments ?? 0);
}

/**
 * Implied value per share from an EV multiple: (multiple × metric − net claims) / diluted shares,
 * where net claims = everything between EV and equity value (net debt, preferred, minority interest…).
 */
export function impliedPriceFromEvMultiple(multiple: number, metric: number, netClaims: number, dilutedShares: number): number {
  if (!(dilutedShares > 0)) return Number.NaN;
  return (multiple * metric - netClaims) / dilutedShares;
}

/** Implied value per share from a P/E multiple. */
export function impliedPriceFromPe(pe: number, netIncome: number, dilutedShares: number): number {
  if (!(dilutedShares > 0)) return Number.NaN;
  return (pe * netIncome) / dilutedShares;
}

/** Ordinary least squares line through (x, y) points. */
export function linearFit(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  xs.forEach((x, i) => {
    sxy += (x - mx) * (ys[i] - my);
    sxx += (x - mx) * (x - mx);
  });
  const slope = sxx === 0 ? 0 : sxy / sxx;
  return { slope, intercept: my - slope * mx };
}
