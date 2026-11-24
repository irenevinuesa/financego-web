import { describe, expect, it } from "vitest";
import { maxEntryMultiple, paperLbo, type LboInputs } from "./lbo";

const base: LboInputs = {
  entryEbitda: 100,
  entryMultiple: 10,
  debtMultiple: 5,
  interestRate: 0.08,
  ebitdaGrowth: 0.05,
  taxRate: 0.25,
  daPctEbitda: 0.2,
  capexPctEbitda: 0.2,
  feesPct: 0.02,
  exitMultiple: 10,
  years: 5,
};

describe("paper LBO", () => {
  it("sizes the deal at entry", () => {
    const r = paperLbo(base);
    expect(r.entryEv).toBe(1000);
    expect(r.fees).toBe(20);
    expect(r.entryDebt).toBe(500);
    expect(r.entryEquity).toBe(520);
  });

  it("matches a hand calculation for year 1", () => {
    // EBITDA 105; interest 8% × 500 = 40; taxes 25% × (105 − 21 − 40) = 11; capex 21; FCF = 105 − 40 − 11 − 21 = 33.
    const y1 = paperLbo(base).schedule[0];
    expect(y1.ebitda).toBeCloseTo(105, 10);
    expect(y1.interest).toBeCloseTo(40, 10);
    expect(y1.taxes).toBeCloseTo(11, 10);
    expect(y1.fcf).toBeCloseTo(33, 10);
    expect(y1.debt).toBeCloseTo(467, 10);
  });

  it("textbook case: no growth, no fees, no cash flow, flat multiple returns 1x", () => {
    const r = paperLbo({ ...base, ebitdaGrowth: 0, feesPct: 0, interestRate: 0, taxRate: 0, capexPctEbitda: 1 });
    expect(r.moic).toBeCloseTo(1, 10);
    expect(r.irr).toBeCloseTo(0, 10);
  });

  it("computes IRR from MOIC and the bridge adds up to the equity gain", () => {
    const r = paperLbo(base);
    expect(r.irr!).toBeCloseTo(Math.pow(r.moic, 1 / 5) - 1, 12);
    const b = r.bridge;
    expect(b.ebitdaGrowth + b.multiple + b.deleveraging + b.fees).toBeCloseTo(r.exitEquity - r.entryEquity, 8);
    expect(r.moic).toBeGreaterThan(1.5);
    expect(r.moic).toBeLessThan(3);
  });

  it("builds cash once the debt is repaid", () => {
    const r = paperLbo({ ...base, debtMultiple: 1, years: 8 });
    const last = r.schedule.at(-1)!;
    expect(last.debt).toBe(0);
    expect(last.cash).toBeGreaterThan(0);
    expect(r.exitNetDebt).toBeCloseTo(-last.cash, 10);
  });

  it("finds the maximum entry multiple for a target IRR", () => {
    const m = maxEntryMultiple(base, 0.2)!;
    expect(paperLbo({ ...base, entryMultiple: m }).irr!).toBeCloseTo(0.2, 4);
    expect(m).toBeLessThan(10); // the base case earns less than 20%
    expect(maxEntryMultiple({ ...base, ebitdaGrowth: -0.3, exitMultiple: 2 }, 0.5)).toBeNull();
  });
});
