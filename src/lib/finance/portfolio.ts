/** Two-asset portfolio volatility: σp = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂). */
export function twoAssetVolatility(w1: number, vol1: number, vol2: number, correlation: number): number {
  const w2 = 1 - w1;
  const variance = w1 * w1 * vol1 * vol1 + w2 * w2 * vol2 * vol2 + 2 * w1 * w2 * correlation * vol1 * vol2;
  return Math.sqrt(Math.max(0, variance));
}

export function twoAssetReturn(w1: number, r1: number, r2: number): number {
  return w1 * r1 + (1 - w1) * r2;
}

/** Two-asset weight in asset 1 with the lowest variance (unconstrained; may fall outside 0–1). */
export function minimumVarianceWeight(vol1: number, vol2: number, correlation: number): number {
  const denom = vol1 * vol1 + vol2 * vol2 - 2 * correlation * vol1 * vol2;
  if (Math.abs(denom) < 1e-15) return 0.5;
  return (vol2 * vol2 - correlation * vol1 * vol2) / denom;
}

/** Excess return per unit of volatility. */
export function sharpeRatio(expectedReturn: number, riskFreeRate: number, volatility: number): number {
  return volatility > 0 ? (expectedReturn - riskFreeRate) / volatility : Number.NaN;
}
