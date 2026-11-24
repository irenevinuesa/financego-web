import { describe, expect, it } from "vitest";
import { blackScholes, normCdf, payoffAtExpiry, putCallParityGap } from "./options";
import { breakEven, profitAt } from "./breakeven";
import { cagr, moic, paybackPeriod } from "./returns";
import { minimumVarianceWeight, sharpeRatio, twoAssetVolatility } from "./portfolio";
import { irr } from "./tvm";

describe("Black–Scholes", () => {
  const base = { spot: 100, strike: 100, rate: 0.05, volatility: 0.2, time: 1 };

  it("normal CDF matches known values", () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 7);
    expect(normCdf(1.96)).toBeCloseTo(0.9750021, 6);
    expect(normCdf(-1)).toBeCloseTo(0.1586553, 6);
  });

  it("prices the textbook at-the-money option", () => {
    const r = blackScholes(base);
    expect(r.call.price).toBeCloseTo(10.4506, 3);
    expect(r.put.price).toBeCloseTo(5.5735, 3);
    expect(r.d1).toBeCloseTo(0.35, 10);
    expect(r.call.delta).toBeCloseTo(0.6368, 3);
    expect(r.put.delta).toBeCloseTo(-0.3632, 3);
    expect(r.call.gamma).toBeCloseTo(0.018762, 5);
    expect(r.call.vega).toBeCloseTo(37.524, 2);
    expect(r.call.theta).toBeCloseTo(-6.414, 2);
    expect(r.call.rho).toBeCloseTo(53.232, 2);
  });

  it("satisfies put–call parity, with and without dividends", () => {
    for (const q of [0, 0.03]) {
      const i = { ...base, spot: 110, dividendYield: q };
      const r = blackScholes(i);
      expect(putCallParityGap(i, r.call.price, r.put.price)).toBeCloseTo(0, 6);
    }
  });

  it("approaches intrinsic value near expiry", () => {
    const r = blackScholes({ ...base, spot: 120, time: 1e-6 });
    expect(r.call.price).toBeCloseTo(20, 3);
    expect(payoffAtExpiry("call", 120, 100)).toBe(20);
    expect(payoffAtExpiry("put", 120, 100)).toBe(0);
  });
});

describe("break-even", () => {
  const i = { price: 50, variableCost: 30, fixedCosts: 100_000, volume: 8_000, targetProfit: 20_000 };

  it("finds the break-even point and margin of safety", () => {
    const r = breakEven(i);
    expect(r.contributionMargin).toBe(20);
    expect(r.contributionMarginRatio).toBeCloseTo(0.4, 10);
    expect(r.breakEvenUnits).toBe(5_000);
    expect(r.breakEvenRevenue).toBe(250_000);
    expect(r.profit).toBe(60_000);
    expect(r.marginOfSafety).toBeCloseTo(0.375, 10);
    expect(r.operatingLeverage).toBeCloseTo(160_000 / 60_000, 10);
    expect(r.unitsForTarget).toBe(6_000);
    expect(profitAt(i, r.breakEvenUnits)).toBeCloseTo(0, 10);
  });

  it("never breaks even when price does not cover variable cost", () => {
    expect(breakEven({ ...i, price: 30 }).breakEvenUnits).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("returns", () => {
  it("computes CAGR, MOIC and payback", () => {
    expect(cagr(100, 200, 5)).toBeCloseTo(Math.pow(2, 0.2) - 1, 12);
    expect(cagr(100, 121, 2)).toBeCloseTo(0.1, 12);
    expect(moic([-100, 20, 20, 160])).toBeCloseTo(2, 12);
    expect(paybackPeriod([-100, 40, 40, 40])).toBeCloseTo(2.5, 12);
    expect(paybackPeriod([-100, 10, 10])).toBeNull();
  });

  it("agrees with IRR for a single entry and exit", () => {
    expect(irr([-100, 0, 0, 0, 0, 200])!).toBeCloseTo(cagr(100, 200, 5), 8);
  });
});

describe("portfolio", () => {
  it("finds the minimum-variance weight", () => {
    const w = minimumVarianceWeight(0.2, 0.1, 0);
    expect(w).toBeCloseTo(0.2, 10);
    // It really is the minimum.
    const v = (x: number) => twoAssetVolatility(x, 0.2, 0.1, 0);
    expect(v(w)).toBeLessThan(v(w + 0.01));
    expect(v(w)).toBeLessThan(v(w - 0.01));
    expect(minimumVarianceWeight(0.2, 0.2, -1)).toBeCloseTo(0.5, 10);
  });

  it("computes the Sharpe ratio", () => {
    expect(sharpeRatio(0.1, 0.02, 0.16)).toBeCloseTo(0.5, 12);
  });
});
