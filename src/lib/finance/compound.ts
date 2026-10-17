/**
 * Compound growth with optional regular contributions.
 * Mixed frequencies are handled exactly by converting the nominal annual rate
 * into an equivalent rate per contribution period.
 */

export interface CompoundInputs {
  principal: number;
  /** Nominal annual rate, decimal. */
  annualRate: number;
  years: number;
  /** Compounding periods per year (1, 4, 12, 365). */
  compoundsPerYear: number;
  /** Amount added each contribution period. */
  contribution: number;
  /** Contributions per year (1 or 12). */
  contributionsPerYear: number;
  /** "end" = ordinary annuity, "begin" = annuity due. */
  timing: "begin" | "end";
  /** Optional annual inflation used to express the final balance in today's money. */
  inflation?: number;
}

export interface CompoundYear {
  year: number;
  balance: number;
  totalContributed: number;
  totalGrowth: number;
  realBalance: number;
}

export interface CompoundResult {
  schedule: CompoundYear[];
  finalBalance: number;
  totalContributed: number;
  totalGrowth: number;
  realFinalBalance: number;
  effectiveAnnualRate: number;
}

export function effectiveAnnualRate(nominal: number, compoundsPerYear: number): number {
  return Math.pow(1 + nominal / compoundsPerYear, compoundsPerYear) - 1;
}

export function compoundGrowth(inputs: CompoundInputs): CompoundResult {
  const m = inputs.contributionsPerYear;
  const ear = effectiveAnnualRate(inputs.annualRate, inputs.compoundsPerYear);
  const ratePerContribution = Math.pow(1 + ear, 1 / m) - 1;
  const inflation = inputs.inflation ?? 0;

  let balance = inputs.principal;
  let contributed = inputs.principal;
  const schedule: CompoundYear[] = [
    { year: 0, balance, totalContributed: contributed, totalGrowth: 0, realBalance: balance },
  ];

  const wholeYears = Math.max(0, Math.round(inputs.years));
  for (let year = 1; year <= wholeYears; year++) {
    for (let p = 0; p < m; p++) {
      if (inputs.timing === "begin") {
        balance = (balance + inputs.contribution) * (1 + ratePerContribution);
      } else {
        balance = balance * (1 + ratePerContribution) + inputs.contribution;
      }
      contributed += inputs.contribution;
    }
    schedule.push({
      year,
      balance,
      totalContributed: contributed,
      totalGrowth: balance - contributed,
      realBalance: balance / Math.pow(1 + inflation, year),
    });
  }

  const last = schedule[schedule.length - 1];
  return {
    schedule,
    finalBalance: last.balance,
    totalContributed: last.totalContributed,
    totalGrowth: last.totalGrowth,
    realFinalBalance: last.realBalance,
    effectiveAnnualRate: ear,
  };
}

/** Years for money to double at a given annual rate (exact, not the Rule of 72). */
export function doublingTime(annualRate: number): number {
  return Math.log(2) / Math.log(1 + annualRate);
}
