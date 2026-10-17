/**
 * Term structure and credit. Rates are annual decimals with annual compounding; times are in years.
 */

/** Discount factor implied by an annually compounded spot (zero) rate. */
export function spotDiscountFactor(spot: number, t: number): number {
  return 1 / Math.pow(1 + spot, t);
}

/**
 * Forward rate between t1 and t2 implied by two spot rates, so that investing to t2 equals
 * investing to t1 and rolling over at the forward rate.
 */
export function forwardRate(spot1: number, t1: number, spot2: number, t2: number): number {
  if (t2 <= t1) throw new Error("t2 must be after t1");
  return Math.pow(Math.pow(1 + spot2, t2) / Math.pow(1 + spot1, t1), 1 / (t2 - t1)) - 1;
}

/** Prices annual cash flows (cashFlows[0] at t = 1, …) off a spot curve (spots[0] is the 1-year rate, …). */
export function priceWithSpotRates(cashFlows: number[], spots: number[]): number {
  if (spots.length < cashFlows.length) throw new Error("Need a spot rate for every cash flow");
  return cashFlows.reduce((s, cf, i) => s + cf * spotDiscountFactor(spots[i], i + 1), 0);
}

/** Annual expected loss rate: probability of default × loss given default. */
export function expectedLoss(probabilityOfDefault: number, recoveryRate: number): number {
  return probabilityOfDefault * (1 - recoveryRate);
}

/** First-order % price change for a change in credit spread (both decimals). */
export function spreadPriceChangePct(spreadDuration: number, deltaSpread: number): number {
  return -spreadDuration * deltaSpread;
}
