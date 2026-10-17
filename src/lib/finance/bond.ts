/**
 * Plain-vanilla fixed-coupon bond maths, priced on a coupon date (no accrued interest).
 * couponRate and yieldToMaturity are annual decimals; frequency is payments per year.
 */

export interface BondInputs {
  faceValue: number;
  couponRate: number;
  yieldToMaturity: number;
  years: number;
  frequency: 1 | 2 | 4 | 12;
}

export interface BondCashFlow {
  period: number;
  time: number;
  cashFlow: number;
  pv: number;
}

export interface BondResult {
  price: number;
  periods: number;
  couponPayment: number;
  macaulayDuration: number;
  modifiedDuration: number;
  convexity: number;
  /** Price change for a 1bp fall in yield, per bond. */
  dv01: number;
  cashFlows: BondCashFlow[];
}

export function bondCashFlows(inputs: BondInputs): { period: number; time: number; cashFlow: number }[] {
  const n = Math.max(1, Math.round(inputs.years * inputs.frequency));
  const coupon = (inputs.faceValue * inputs.couponRate) / inputs.frequency;
  return Array.from({ length: n }, (_, i) => {
    const period = i + 1;
    return {
      period,
      time: period / inputs.frequency,
      cashFlow: coupon + (period === n ? inputs.faceValue : 0),
    };
  });
}

export function bondPrice(inputs: BondInputs): number {
  const y = inputs.yieldToMaturity / inputs.frequency;
  return bondCashFlows(inputs).reduce((s, cf) => s + cf.cashFlow / Math.pow(1 + y, cf.period), 0);
}

export function analyzeBond(inputs: BondInputs): BondResult {
  const y = inputs.yieldToMaturity / inputs.frequency;
  const f = inputs.frequency;
  const flows = bondCashFlows(inputs);
  const cashFlows: BondCashFlow[] = flows.map((cf) => ({
    ...cf,
    pv: cf.cashFlow / Math.pow(1 + y, cf.period),
  }));
  const price = cashFlows.reduce((s, cf) => s + cf.pv, 0);
  const macaulayDuration = cashFlows.reduce((s, cf) => s + cf.time * cf.pv, 0) / price;
  const modifiedDuration = macaulayDuration / (1 + y);
  // Convexity in periods², converted to years² by dividing by f².
  const convexityPeriods =
    cashFlows.reduce((s, cf) => s + (cf.cashFlow * cf.period * (cf.period + 1)) / Math.pow(1 + y, cf.period + 2), 0) /
    price;
  const convexity = convexityPeriods / (f * f);

  return {
    price,
    periods: cashFlows.length,
    couponPayment: (inputs.faceValue * inputs.couponRate) / f,
    macaulayDuration,
    modifiedDuration,
    convexity,
    dv01: modifiedDuration * price * 0.0001,
    cashFlows,
  };
}

/** Second-order (duration + convexity) estimate of the % price change for a yield change Δy. */
export function estimatedPriceChangePct(modifiedDuration: number, convexity: number, deltaYield: number): number {
  return -modifiedDuration * deltaYield + 0.5 * convexity * deltaYield * deltaYield;
}

/** Annual coupon divided by price. Ignores the gain or loss as the bond pulls to par. */
export function currentYield(faceValue: number, couponRate: number, price: number): number {
  return (faceValue * couponRate) / price;
}

/**
 * Yield to maturity: the yield that makes the bond's price equal `price` (solved by bisection).
 * Returns null when no yield between −50% and 100% fits.
 */
export function bondYield(price: number, inputs: Omit<BondInputs, "yieldToMaturity">, tolerance = 1e-10): number | null {
  const at = (y: number) => bondPrice({ ...inputs, yieldToMaturity: y }) - price;
  let lo = -0.5;
  let hi = 1;
  if (!(price > 0) || at(lo) < 0 || at(hi) > 0) return null;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    const f = at(mid);
    if (Math.abs(f) < tolerance || hi - lo < tolerance) return mid;
    // Price falls as yield rises, so a positive gap means the yield is still too low.
    if (f > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
