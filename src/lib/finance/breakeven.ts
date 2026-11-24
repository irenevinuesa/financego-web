/** Cost–volume–profit analysis for a single product. */

export interface BreakEvenInputs {
  price: number;
  variableCost: number;
  fixedCosts: number;
  /** Expected units sold. */
  volume: number;
  /** Optional profit target, used for the units needed to reach it. */
  targetProfit?: number;
}

export interface BreakEvenResult {
  contributionMargin: number;
  /** Contribution margin as a share of price. */
  contributionMarginRatio: number;
  /** Infinity when each unit loses money (price ≤ variable cost). */
  breakEvenUnits: number;
  breakEvenRevenue: number;
  revenue: number;
  profit: number;
  /** (expected − break-even) ÷ expected units. Negative when below break-even. */
  marginOfSafety: number;
  /** Contribution ÷ operating profit: % change in profit for a 1% change in volume. Null at zero profit. */
  operatingLeverage: number | null;
  unitsForTarget: number;
}

export function profitAt(i: Pick<BreakEvenInputs, "price" | "variableCost" | "fixedCosts">, units: number): number {
  return (i.price - i.variableCost) * units - i.fixedCosts;
}

export function breakEven(i: BreakEvenInputs): BreakEvenResult {
  const cm = i.price - i.variableCost;
  const breakEvenUnits = cm > 0 ? i.fixedCosts / cm : Number.POSITIVE_INFINITY;
  const profit = profitAt(i, i.volume);
  return {
    contributionMargin: cm,
    contributionMarginRatio: i.price > 0 ? cm / i.price : Number.NaN,
    breakEvenUnits,
    breakEvenRevenue: breakEvenUnits * i.price,
    revenue: i.price * i.volume,
    profit,
    marginOfSafety: i.volume > 0 && Number.isFinite(breakEvenUnits) ? (i.volume - breakEvenUnits) / i.volume : Number.NaN,
    operatingLeverage: Math.abs(profit) > 1e-12 ? (cm * i.volume) / profit : null,
    unitsForTarget: cm > 0 ? (i.fixedCosts + (i.targetProfit ?? 0)) / cm : Number.POSITIVE_INFINITY,
  };
}
