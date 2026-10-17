import { describe, expect, it } from "vitest";
import { annuityPV, discountFactor, futureValue, growingPerpetuityPV, irr, npv, presentValue } from "./tvm";
import { afterTaxCostOfDebt, costOfEquityCAPM, debtToEquityFromWeight, leverBeta, unleverBeta, wacc } from "./wacc";
import { DcfInputError, dcfSensitivity, runDcf, valueDriverValue, type DcfInputs } from "./dcf";
import { analyzeBond, bondPrice, bondYield, currentYield, estimatedPriceChangePct } from "./bond";
import { expectedLoss, forwardRate, priceWithSpotRates, spotDiscountFactor, spreadPriceChangePct } from "./rates";
import { compoundGrowth, doublingTime, effectiveAnnualRate } from "./compound";
import { twoAssetReturn, twoAssetVolatility } from "./portfolio";
import { accretionDilution, acquirerValueCreated, exchangeRatio, offerPremium, synergyValue, type AccretionInputs } from "./ma";
import { calendarise, enterpriseValueFromEquity, impliedPriceFromEvMultiple, impliedPriceFromPe, lastTwelveMonths, linearFit, mean, median, percentile } from "./comps";

describe("time value of money", () => {
  it("discounts and compounds symmetrically", () => {
    expect(presentValue(110, 0.1, 1)).toBeCloseTo(100, 10);
    expect(futureValue(1000, 0.05, 10)).toBeCloseTo(1628.894627, 5);
    expect(discountFactor(0.08, 0)).toBe(1);
  });

  it("computes NPV with the first cash flow at t = 0", () => {
    expect(npv(0.1, [-100, 110])).toBeCloseTo(0, 10);
    expect(npv(0.1, [-1000, 300, 400, 500])).toBeCloseTo(-21.0368, 3);
  });

  it("finds the IRR", () => {
    expect(irr([-100, 110])).toBeCloseTo(0.1, 8);
    // 2.0x money multiple over 5 years ≈ 14.87% IRR
    expect(irr([-100, 0, 0, 0, 0, 200])).toBeCloseTo(Math.pow(2, 1 / 5) - 1, 8);
    expect(irr([100, 50])).toBeNull();
  });

  it("values annuities and growing perpetuities", () => {
    expect(annuityPV(100, 0.05, 10)).toBeCloseTo(772.1735, 3);
    expect(annuityPV(100, 0, 10)).toBe(1000);
    expect(growingPerpetuityPV(100, 0.08, 0.03)).toBeCloseTo(2000, 8);
    expect(growingPerpetuityPV(100, 0.03, 0.03)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("cost of capital", () => {
  it("computes CAPM, after-tax debt and WACC", () => {
    expect(costOfEquityCAPM(0.04, 1.2, 0.055)).toBeCloseTo(0.106, 10);
    expect(afterTaxCostOfDebt(0.06, 0.25)).toBeCloseTo(0.045, 10);
    const r = wacc({
      riskFreeRate: 0.04,
      equityRiskPremium: 0.055,
      beta: 1.2,
      preTaxCostOfDebt: 0.06,
      taxRate: 0.25,
      debtWeight: 0.3,
    });
    expect(r.equityWeight).toBeCloseTo(0.7, 10);
    expect(r.wacc).toBeCloseTo(0.0877, 10);
  });

  it("levers and unlevers beta (Hamada)", () => {
    expect(leverBeta(1, 0.5, 0.25)).toBeCloseTo(1.375, 10);
    expect(unleverBeta(1.375, 0.5, 0.25)).toBeCloseTo(1, 10);
    expect(debtToEquityFromWeight(0.2)).toBeCloseTo(0.25, 10);
  });
});

const baseDcf: DcfInputs = {
  baseRevenue: 1000,
  revenueGrowth: [0.03, 0.03, 0.03, 0.03, 0.03],
  ebitMargin: 0.2,
  taxRate: 0.25,
  daPctRevenue: 0.04,
  capexPctRevenue: 0.05,
  nwcPctRevenue: 0.1,
  wacc: 0.09,
  terminalGrowth: 0.03,
  netDebt: 300,
  sharesOutstanding: 100,
};

describe("DCF", () => {
  it("builds unlevered free cash flow line by line", () => {
    const y1 = runDcf(baseDcf).years[0];
    expect(y1.revenue).toBeCloseTo(1030, 10);
    expect(y1.ebit).toBeCloseTo(206, 10);
    expect(y1.nopat).toBeCloseTo(154.5, 10);
    expect(y1.changeInNwc).toBeCloseTo(3, 10);
    // 154.5 + 41.2 − 51.5 − 3
    expect(y1.fcf).toBeCloseTo(141.2, 10);
    expect(y1.ebitda).toBeCloseTo(247.2, 10);
  });

  it("collapses to the Gordon growth model when growth is constant", () => {
    const r = runDcf(baseDcf);
    const fcf1 = r.years[0].fcf;
    expect(r.enterpriseValue).toBeCloseTo(fcf1 / (0.09 - 0.03), 6);
    expect(r.equityValue).toBeCloseTo(r.enterpriseValue - 300, 10);
    expect(r.valuePerShare).toBeCloseTo(r.equityValue / 100, 10);
  });

  it("reports terminal value share and implied exit multiple", () => {
    const r = runDcf(baseDcf);
    expect(r.terminalValueShare).toBeGreaterThan(0.6);
    expect(r.terminalValueShare).toBeLessThan(1);
    const last = r.years[r.years.length - 1];
    expect(r.impliedExitMultiple).toBeCloseTo(r.terminalValue / last.ebitda, 10);
  });

  it("raises value with the mid-year convention", () => {
    expect(runDcf({ ...baseDcf, midYear: true }).enterpriseValue).toBeCloseTo(
      runDcf(baseDcf).enterpriseValue * Math.sqrt(1.09),
      6,
    );
  });

  it("rejects WACC at or below terminal growth", () => {
    expect(() => runDcf({ ...baseDcf, wacc: 0.03 })).toThrow(DcfInputError);
  });

  it("builds a sensitivity grid that falls as WACC rises", () => {
    const grid = dcfSensitivity(baseDcf, [0.08, 0.09, 0.1], [0.02, 0.03]);
    expect(grid[0][0]!).toBeGreaterThan(grid[1][0]!);
    expect(grid[1][1]!).toBeCloseTo(runDcf(baseDcf).enterpriseValue, 8);
    expect(dcfSensitivity(baseDcf, [0.02], [0.03])[0][0]).toBeNull();
  });

  it("values growth only when returns exceed the cost of capital", () => {
    const noGrowth = valueDriverValue(100, 0, 0.15, 0.1);
    expect(noGrowth).toBeCloseTo(1000, 8);
    expect(valueDriverValue(100, 0.04, 0.15, 0.1)).toBeGreaterThan(noGrowth);
    expect(valueDriverValue(100, 0.04, 0.1, 0.1)).toBeCloseTo(noGrowth, 8);
    expect(valueDriverValue(100, 0.04, 0.06, 0.1)).toBeLessThan(noGrowth);
  });
});

describe("bonds", () => {
  it("prices at par when coupon equals yield", () => {
    expect(bondPrice({ faceValue: 100, couponRate: 0.05, yieldToMaturity: 0.05, years: 10, frequency: 1 })).toBeCloseTo(100, 8);
    expect(bondPrice({ faceValue: 100, couponRate: 0.05, yieldToMaturity: 0.05, years: 10, frequency: 2 })).toBeCloseTo(100, 8);
  });

  it("prices a semiannual discount bond", () => {
    // 2-year 6% semiannual coupon at an 8% yield
    expect(bondPrice({ faceValue: 100, couponRate: 0.06, yieldToMaturity: 0.08, years: 2, frequency: 2 })).toBeCloseTo(96.3701, 3);
  });

  it("computes duration and convexity", () => {
    const r = analyzeBond({ faceValue: 100, couponRate: 0.1, yieldToMaturity: 0.1, years: 3, frequency: 1 });
    expect(r.price).toBeCloseTo(100, 8);
    expect(r.macaulayDuration).toBeCloseTo(2.7355, 4);
    expect(r.modifiedDuration).toBeCloseTo(2.4869, 4);
    expect(r.convexity).toBeCloseTo(8.7562, 3);
    expect(r.dv01).toBeCloseTo(0.024869, 5);
  });

  it("gives a zero-coupon bond a Macaulay duration equal to its maturity", () => {
    const r = analyzeBond({ faceValue: 100, couponRate: 0, yieldToMaturity: 0.06, years: 7, frequency: 1 });
    expect(r.macaulayDuration).toBeCloseTo(7, 10);
  });

  it("approximates price changes with duration and convexity", () => {
    const inputs = { faceValue: 100, couponRate: 0.04, yieldToMaturity: 0.05, years: 10, frequency: 2 as const };
    const r = analyzeBond(inputs);
    const actual = bondPrice({ ...inputs, yieldToMaturity: 0.06 }) / r.price - 1;
    const estimate = estimatedPriceChangePct(r.modifiedDuration, r.convexity, 0.01);
    expect(Math.abs(actual - estimate)).toBeLessThan(0.001);
  });
  it("solves for yield to maturity and current yield", () => {
    const terms = { faceValue: 100, couponRate: 0.04, years: 5, frequency: 1 as const };
    const price = bondPrice({ ...terms, yieldToMaturity: 0.05 });
    expect(price).toBeCloseTo(95.6705, 4);
    expect(bondYield(price, terms)).toBeCloseTo(0.05, 8);
    expect(bondYield(100, { ...terms, frequency: 2 })).toBeCloseTo(0.04, 8);
    // 3-year zero priced at 86.38 yields 5%
    expect(bondYield(86.38, { faceValue: 100, couponRate: 0, years: 3, frequency: 1 })).toBeCloseTo(0.05, 4);
    expect(bondYield(0, terms)).toBeNull();
    expect(currentYield(100, 0.04, price)).toBeCloseTo(0.04181, 5);
  });
});

describe("term structure and credit", () => {
  it("derives forward rates from spot rates", () => {
    expect(forwardRate(0.04, 1, 0.05, 2)).toBeCloseTo(0.060096, 6);
    expect(forwardRate(0.03, 1, 0.04, 2)).toBeCloseTo(0.050097, 6);
    expect(forwardRate(0.045, 2, 0.05, 3)).toBeCloseTo(0.060072, 6);
    // A flat curve implies flat forwards
    expect(forwardRate(0.05, 1, 0.05, 5)).toBeCloseTo(0.05, 10);
    expect(() => forwardRate(0.05, 2, 0.05, 1)).toThrow();
  });

  it("prices a bond off a spot curve", () => {
    expect(spotDiscountFactor(0.05, 2)).toBeCloseTo(1 / 1.1025, 12);
    const p = priceWithSpotRates([5, 105], [0.04, 0.05]);
    expect(p).toBeCloseTo(100.0458, 4);
    // Its single yield sits between the two spot rates
    expect(bondYield(p, { faceValue: 100, couponRate: 0.05, years: 2, frequency: 1 })).toBeCloseTo(0.049754, 5);
  });

  it("computes expected loss and spread moves", () => {
    expect(expectedLoss(0.02, 0.4)).toBeCloseTo(0.012, 12);
    expect(expectedLoss(0.03, 0.4)).toBeCloseTo(0.018, 12);
    expect(spreadPriceChangePct(5, 0.004)).toBeCloseTo(-0.02, 12);
    expect(spreadPriceChangePct(6.5, -0.002)).toBeCloseTo(0.013, 12);
  });

  it("matches the lesson's convexity example", () => {
    const r = analyzeBond({ faceValue: 100, couponRate: 0.05, yieldToMaturity: 0.05, years: 10, frequency: 1 });
    expect(r.macaulayDuration).toBeCloseTo(8.1078, 4);
    expect(r.modifiedDuration).toBeCloseTo(7.7217, 4);
    expect(r.convexity).toBeCloseTo(74.998, 3);
    expect(estimatedPriceChangePct(r.modifiedDuration, r.convexity, 0.01)).toBeCloseTo(-0.073467, 5);
    expect(bondPrice({ faceValue: 100, couponRate: 0.05, yieldToMaturity: 0.06, years: 10, frequency: 1 }) / 100 - 1).toBeCloseTo(-0.073601, 5);
  });
});

describe("compound growth", () => {
  it("compounds a lump sum", () => {
    const r = compoundGrowth({
      principal: 1000,
      annualRate: 0.05,
      years: 10,
      compoundsPerYear: 1,
      contribution: 0,
      contributionsPerYear: 12,
      timing: "end",
    });
    expect(r.finalBalance).toBeCloseTo(1628.894627, 5);
    expect(r.totalGrowth).toBeCloseTo(628.894627, 5);
  });

  it("matches the annuity future-value formula for monthly contributions", () => {
    const i = 0.06 / 12;
    const n = 120;
    const expected = 100 * ((Math.pow(1 + i, n) - 1) / i);
    const r = compoundGrowth({
      principal: 0,
      annualRate: 0.06,
      years: 10,
      compoundsPerYear: 12,
      contribution: 100,
      contributionsPerYear: 12,
      timing: "end",
    });
    expect(r.finalBalance).toBeCloseTo(expected, 6);
    const due = compoundGrowth({
      principal: 0,
      annualRate: 0.06,
      years: 10,
      compoundsPerYear: 12,
      contribution: 100,
      contributionsPerYear: 12,
      timing: "begin",
    });
    expect(due.finalBalance).toBeCloseTo(expected * (1 + i), 6);
  });

  it("deflates to today's money", () => {
    const r = compoundGrowth({
      principal: 1000,
      annualRate: 0.05,
      years: 10,
      compoundsPerYear: 1,
      contribution: 0,
      contributionsPerYear: 1,
      timing: "end",
      inflation: 0.05,
    });
    expect(r.realFinalBalance).toBeCloseTo(1000, 8);
  });

  it("computes the effective annual rate and doubling time", () => {
    expect(effectiveAnnualRate(0.12, 12)).toBeCloseTo(0.126825, 6);
    expect(doublingTime(0.07)).toBeCloseTo(10.2448, 4);
  });
});

describe("portfolio", () => {
  it("diversifies when correlation is below one", () => {
    expect(twoAssetVolatility(0.5, 0.2, 0.2, 1)).toBeCloseTo(0.2, 10);
    expect(twoAssetVolatility(0.5, 0.2, 0.2, 0)).toBeCloseTo(0.1414214, 6);
    expect(twoAssetVolatility(0.5, 0.2, 0.2, -1)).toBeCloseTo(0, 10);
    expect(twoAssetReturn(0.6, 0.08, 0.03)).toBeCloseTo(0.06, 10);
  });
});

describe("trading comparables", () => {
  const evEbitda = [9.0, 8.0, 10.0, 8.5, 16.0, 9.5];

  it("summarises a peer set like a comps table", () => {
    expect(mean(evEbitda)).toBeCloseTo(10.1667, 4);
    expect(median(evEbitda)).toBeCloseTo(9.25, 10);
    // Excel PERCENTILE.INC conventions
    expect(percentile(evEbitda, 0.25)).toBeCloseTo(8.625, 10);
    expect(percentile(evEbitda, 0.75)).toBeCloseTo(9.875, 10);
    const withoutOutlier = evEbitda.filter((m) => m !== 16);
    expect(median(withoutOutlier)).toBe(9);
    expect(percentile(withoutOutlier, 0.25)).toBe(8.5);
    expect(percentile(withoutOutlier, 0)).toBe(8);
    expect(percentile(withoutOutlier, 1)).toBe(10);
    expect(median([7.5, 8, 9, 11, 20])).toBe(9);
    expect(Number.isNaN(mean([]))).toBe(true);
  });

  it("builds LTM and calendar-year figures", () => {
    expect(lastTwelveMonths(1000, 540, 500)).toBe(1040);
    expect(lastTwelveMonths(800, 650, 600)).toBe(850);
    // Fiscal year ending March: 3 months of FY ending in the year, 9 of the next
    expect(calendarise(200, 240, 3)).toBeCloseTo(230, 10);
    expect(calendarise(120, 140, 9)).toBeCloseTo(125, 10);
    expect(calendarise(400, 440, 3)).toBeCloseTo(430, 10);
    // December year-end needs no adjustment
    expect(calendarise(500, 999, 12)).toBe(500);
  });

  it("computes enterprise value and implied share prices", () => {
    expect(enterpriseValueFromEquity({ equityValue: 2000, debt: 600, cash: 150, minorityInterest: 50, investments: 100 })).toBe(2400);
    expect(enterpriseValueFromEquity({ equityValue: 2000, debt: 500, cash: 200, minorityInterest: 30 })).toBe(2330);
    expect(impliedPriceFromEvMultiple(8.5, 150, 300, 60)).toBeCloseTo(16.25, 10);
    expect(impliedPriceFromEvMultiple(9.5, 150, 300, 60)).toBeCloseTo(18.75, 10);
    expect(impliedPriceFromEvMultiple(11, 120, 270, 30)).toBeCloseTo(35, 10);
    expect(impliedPriceFromPe(15, 70, 60)).toBeCloseTo(17.5, 10);
    expect(impliedPriceFromPe(12.5, 64, 40)).toBeCloseTo(20, 10);
    expect(Number.isNaN(impliedPriceFromPe(15, 70, 0))).toBe(true);
  });

  it("fits a multiple-versus-growth line", () => {
    const { slope, intercept } = linearFit([6, 4, 8, 3, 5], [9, 8, 10, 8.5, 9.5]);
    expect(slope).toBeCloseTo(0.337838, 6);
    expect(intercept + slope * 5).toBeCloseTo(8.9324, 4);
  });
});

describe("M&A", () => {
  it("computes premiums, exchange ratios and synergy value", () => {
    expect(offerPremium(52, 40)).toBeCloseTo(0.3, 10);
    expect(offerPremium(32, 25)).toBeCloseTo(0.28, 10);
    expect(exchangeRatio(30, 60)).toBeCloseTo(0.5, 10);
    expect(exchangeRatio(36, 48)).toBeCloseTo(0.75, 10);
    expect(synergyValue(50, 0.25, 0.1)).toBeCloseTo(375, 8);
    expect(synergyValue(50, 0.25, 0.1, 60)).toBeCloseTo(330, 8);
    expect(acquirerValueCreated(1000, 400, 1300)).toBeCloseTo(100, 10);
    expect(acquirerValueCreated(2000, 600, 2500)).toBeCloseTo(100, 10);
  });

  const base: AccretionInputs = {
    acquirerNetIncome: 500,
    acquirerShares: 100,
    acquirerSharePrice: 100,
    targetNetIncome: 80,
    purchasePrice: 1200,
    stockPct: 0,
    debtPct: 0,
    cashPct: 0,
    costOfDebt: 0.06,
    interestOnCash: 0.03,
    taxRate: 0.25,
  };

  it("matches the lesson's accretion / dilution example for each currency", () => {
    const stock = accretionDilution({ ...base, stockPct: 1 });
    expect(stock.newShares).toBeCloseTo(12, 10);
    expect(stock.proFormaEps).toBeCloseTo(5.1786, 4);
    expect(stock.accretion).toBeCloseTo(0.035714, 6);
    expect(stock.breakevenSynergies).toBe(0);
    const debt = accretionDilution({ ...base, debtPct: 1 });
    expect(debt.proFormaNetIncome).toBeCloseTo(526, 10);
    expect(debt.accretion).toBeCloseTo(0.052, 10);
    const cash = accretionDilution({ ...base, cashPct: 1 });
    expect(cash.proFormaEps).toBeCloseTo(5.53, 10);
    expect(cash.accretion).toBeCloseTo(0.106, 10);
  });

  it("finds breakeven synergies for a dilutive deal", () => {
    const r = accretionDilution({ ...base, purchasePrice: 2000, stockPct: 1 });
    expect(r.accretion).toBeCloseTo(-1 / 30, 10);
    expect(r.breakevenSynergies).toBeCloseTo(26.6667, 4);
    const fixed = accretionDilution({ ...base, purchasePrice: 2000, stockPct: 1, synergies: r.breakevenSynergies });
    expect(fixed.accretion).toBeCloseTo(0, 10);
    const a5 = accretionDilution({ ...base, acquirerNetIncome: 400, acquirerSharePrice: 60, targetNetIncome: 60, stockPct: 1 });
    expect(a5.accretion).toBeCloseTo(-0.041667, 6);
    expect(a5.breakevenSynergies).toBeCloseTo(26.6667, 4);
  });

  it("follows the P/E rule in all-stock deals", () => {
    // Acquirer at 20x buying at 15x is accretive; at 25x it is dilutive
    expect(accretionDilution({ ...base, stockPct: 1 }).accretion).toBeGreaterThan(0);
    expect(accretionDilution({ ...base, purchasePrice: 80 * 25, stockPct: 1 }).accretion).toBeLessThan(0);
    expect(accretionDilution({ ...base, purchasePrice: 80 * 20, stockPct: 1 }).accretion).toBeCloseTo(0, 10);
  });
});
