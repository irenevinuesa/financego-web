/** Return measures for an investment's cash flows. */

/** Compound annual growth rate from a start value to an end value over `years`. */
export function cagr(start: number, end: number, years: number): number {
  if (!(start > 0) || !(years > 0) || end < 0) return Number.NaN;
  return Math.pow(end / start, 1 / years) - 1;
}

/** Multiple on invested capital: everything received ÷ everything invested. */
export function moic(cashFlows: number[]): number {
  const invested = cashFlows.filter((c) => c < 0).reduce((s, c) => s - c, 0);
  const received = cashFlows.filter((c) => c > 0).reduce((s, c) => s + c, 0);
  return invested > 0 ? received / invested : Number.NaN;
}

/** Years until cumulative cash flow turns non-negative, interpolating within the year. Null if it never does. */
export function paybackPeriod(cashFlows: number[]): number | null {
  let cum = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    const prev = cum;
    cum += cashFlows[t];
    if (cum >= 0 && prev < 0) return t - 1 + -prev / cashFlows[t];
    if (t === 0 && cum >= 0) return 0;
  }
  return null;
}
