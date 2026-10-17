import { describe, expect, it } from "vitest";
import { fmtMoney, fmtPct, isWithinTolerance, parseNumericInput } from "./format";

describe("numeric answer parsing", () => {
  it("accepts the ways people type numbers", () => {
    expect(parseNumericInput("1,250")).toBe(1250);
    expect(parseNumericInput("$1,250.5")).toBe(1250.5);
    expect(parseNumericInput("8.5%")).toBe(8.5);
    expect(parseNumericInput("12x")).toBe(12);
    expect(parseNumericInput("−3")).toBe(-3);
    expect(parseNumericInput(" 25 bps")).toBe(25);
    expect(parseNumericInput(".5")).toBe(0.5);
  });

  it("rejects text that is not a number", () => {
    expect(parseNumericInput("")).toBeNull();
    expect(parseNumericInput("abc")).toBeNull();
    expect(parseNumericInput("1.2.3")).toBeNull();
  });

  it("checks tolerance inclusively", () => {
    expect(isWithinTolerance(8.77, 8.77, 0)).toBe(true);
    expect(isWithinTolerance(8.8, 8.77, 0.05)).toBe(true);
    expect(isWithinTolerance(8.9, 8.77, 0.05)).toBe(false);
  });
});

describe("formatting", () => {
  it("formats money and percentages", () => {
    expect(fmtMoney(1234.56, { decimals: 1, unit: "m" })).toBe("$1,234.6m");
    expect(fmtMoney(-50)).toBe("−$50");
    expect(fmtPct(0.0877)).toBe("8.77%");
  });
});
