/**
 * Time value of money. Rates are decimals (0.05 = 5%), periods are in years
 * unless stated otherwise.
 */

export function discountFactor(rate: number, t: number): number {
  return 1 / Math.pow(1 + rate, t);
}

export function presentValue(futureValue: number, rate: number, t: number): number {
  return futureValue * discountFactor(rate, t);
}

export function futureValue(presentAmount: number, rate: number, t: number): number {
  return presentAmount * Math.pow(1 + rate, t);
}

/** NPV where cashFlows[0] occurs today (t = 0), cashFlows[1] at t = 1, … */
export function npv(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((sum, cf, t) => sum + cf * discountFactor(rate, t), 0);
}

/**
 * IRR by bisection on NPV(rate) = 0. Requires a sign change in the cash flows.
 * Returns null when no root is bracketed between -99% and 1,000%.
 */
export function irr(cashFlows: number[], tolerance = 1e-10): number | null {
  let lo = -0.99;
  let hi = 10;
  let fLo = npv(lo, cashFlows);
  const fHi = npv(hi, cashFlows);
  if (Number.isNaN(fLo) || Number.isNaN(fHi) || fLo * fHi > 0) return null;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid, cashFlows);
    if (Math.abs(fMid) < tolerance || hi - lo < tolerance) return mid;
    if (fLo * fMid < 0) {
      hi = mid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return (lo + hi) / 2;
}

/** Present value of an ordinary annuity: `payment` at the end of each of `n` periods. */
export function annuityPV(payment: number, rate: number, n: number): number {
  if (rate === 0) return payment * n;
  return (payment * (1 - Math.pow(1 + rate, -n))) / rate;
}

/** Present value of a growing perpetuity whose first cash flow arrives in one period. */
export function growingPerpetuityPV(nextCashFlow: number, rate: number, growth: number): number {
  if (rate <= growth) return Number.POSITIVE_INFINITY;
  return nextCashFlow / (rate - growth);
}
