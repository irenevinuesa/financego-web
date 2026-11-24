/**
 * Paper LBO: the simplified buyout model interviewers ask you to run by hand.
 * All rates are decimals and money is in one unit (e.g. $m).
 */

export interface LboInputs {
  /** EBITDA in the year before the deal (year 0). */
  entryEbitda: number;
  /** Purchase EV / EBITDA. */
  entryMultiple: number;
  /** Debt raised at entry, as a multiple of entry EBITDA. */
  debtMultiple: number;
  /** Interest rate on the debt, charged on the opening balance each year. */
  interestRate: number;
  /** Annual EBITDA growth. */
  ebitdaGrowth: number;
  taxRate: number;
  /** D&A as a share of EBITDA (tax-deductible, non-cash). */
  daPctEbitda: number;
  /** Capex as a share of EBITDA. */
  capexPctEbitda: number;
  /** Transaction fees as a share of the purchase EV, paid by the sponsor. */
  feesPct: number;
  exitMultiple: number;
  years: number;
}

export interface LboYear {
  year: number;
  ebitda: number;
  interest: number;
  taxes: number;
  capex: number;
  fcf: number;
  /** Debt and cash at the end of the year. */
  debt: number;
  cash: number;
}

export interface LboResult {
  entryEv: number;
  fees: number;
  entryDebt: number;
  entryEquity: number;
  schedule: LboYear[];
  exitEbitda: number;
  exitEv: number;
  exitNetDebt: number;
  exitEquity: number;
  moic: number;
  /** Null when exit equity is zero or negative. */
  irr: number | null;
  /** Equity gain split into its sources; the parts sum to exitEquity − entryEquity. */
  bridge: { ebitdaGrowth: number; multiple: number; deleveraging: number; fees: number };
}

export function paperLbo(i: LboInputs): LboResult {
  const years = Math.max(1, Math.round(i.years));
  const entryEv = i.entryEbitda * i.entryMultiple;
  const fees = entryEv * i.feesPct;
  const entryDebt = Math.min(i.entryEbitda * i.debtMultiple, entryEv + fees);
  const entryEquity = entryEv + fees - entryDebt;

  const schedule: LboYear[] = [];
  let debt = entryDebt;
  let cash = 0;
  let ebitda = i.entryEbitda;
  for (let y = 1; y <= years; y++) {
    ebitda *= 1 + i.ebitdaGrowth;
    const interest = debt * i.interestRate;
    const da = ebitda * i.daPctEbitda;
    const taxes = Math.max(0, (ebitda - da - interest) * i.taxRate);
    const capex = ebitda * i.capexPctEbitda;
    const fcf = ebitda - interest - taxes - capex;
    // Cash sweep: free cash flow repays debt first; anything left builds cash.
    const repay = Math.min(debt, Math.max(0, fcf));
    debt -= repay;
    cash += fcf - repay;
    schedule.push({ year: y, ebitda, interest, taxes, capex, fcf, debt, cash });
  }

  const exitEbitda = ebitda;
  const exitEv = exitEbitda * i.exitMultiple;
  const exitNetDebt = debt - cash;
  const exitEquity = exitEv - exitNetDebt;
  const moic = entryEquity > 0 ? exitEquity / entryEquity : Number.NaN;
  const irr = entryEquity > 0 && exitEquity > 0 ? Math.pow(moic, 1 / years) - 1 : null;

  return {
    entryEv,
    fees,
    entryDebt,
    entryEquity,
    schedule,
    exitEbitda,
    exitEv,
    exitNetDebt,
    exitEquity,
    moic,
    irr,
    bridge: {
      ebitdaGrowth: (exitEbitda - i.entryEbitda) * i.entryMultiple,
      multiple: (i.exitMultiple - i.entryMultiple) * exitEbitda,
      deleveraging: entryDebt - exitNetDebt,
      fees: -fees,
    },
  };
}

/**
 * The highest entry multiple that still earns the target IRR, with the exit multiple
 * and debt quantum held as entered. Returns null when even a very low price misses it.
 */
export function maxEntryMultiple(i: LboInputs, targetIrr: number): number | null {
  const irrAt = (m: number) => paperLbo({ ...i, entryMultiple: m }).irr ?? -1;
  // Just above the price at which the debt would fund the whole deal (equity of zero).
  let lo = i.debtMultiple / (1 + i.feesPct) + 0.05;
  let hi = 40;
  if (irrAt(lo) < targetIrr) return null;
  if (irrAt(hi) >= targetIrr) return hi;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (irrAt(mid) >= targetIrr) lo = mid;
    else hi = mid;
  }
  return lo;
}
