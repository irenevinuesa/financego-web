/**
 * M&A arithmetic: premiums, exchange ratios, synergy value and EPS accretion / dilution.
 * Amounts in any consistent unit (for example $m and millions of shares); rates are decimals.
 */

/** Offer premium over the unaffected share price (before rumours or announcement). */
export function offerPremium(offerPrice: number, unaffectedPrice: number): number {
  return offerPrice / unaffectedPrice - 1;
}

/** Acquirer shares issued per target share in a stock deal. */
export function exchangeRatio(offerPricePerTargetShare: number, acquirerSharePrice: number): number {
  return offerPricePerTargetShare / acquirerSharePrice;
}

/**
 * Value of run-rate synergies treated as a level perpetuity, after tax, less after-tax one-off integration costs.
 * Ignores phasing, so it is an upper bound when synergies take time to arrive.
 */
export function synergyValue(runRatePreTax: number, taxRate: number, discountRate: number, integrationCostsPreTax = 0): number {
  return (runRatePreTax * (1 - taxRate)) / discountRate - integrationCostsPreTax * (1 - taxRate);
}

/** Value created for the acquirer's shareholders: standalone value + value of synergies − price paid. */
export function acquirerValueCreated(targetStandaloneValue: number, netSynergyValue: number, pricePaid: number): number {
  return targetStandaloneValue + netSynergyValue - pricePaid;
}

export interface AccretionInputs {
  acquirerNetIncome: number;
  acquirerShares: number;
  acquirerSharePrice: number;
  targetNetIncome: number;
  /** Price paid for the target's equity. */
  purchasePrice: number;
  /** Funding mix as fractions of the purchase price; they should sum to 1. */
  stockPct: number;
  debtPct: number;
  cashPct: number;
  /** Pre-tax interest rate on new debt. */
  costOfDebt: number;
  /** Pre-tax interest the acquirer's cash was earning. */
  interestOnCash: number;
  taxRate: number;
  /** Pre-tax run-rate synergies included in pro forma earnings. */
  synergies?: number;
}

export interface AccretionResult {
  newShares: number;
  proFormaNetIncome: number;
  proFormaShares: number;
  standaloneEps: number;
  proFormaEps: number;
  /** Pro forma EPS ÷ standalone EPS − 1. Positive = accretive. */
  accretion: number;
  /** Pre-tax synergies needed for the deal to be EPS-neutral (0 if it is already accretive without synergies). */
  breakevenSynergies: number;
}

export function accretionDilution(i: AccretionInputs): AccretionResult {
  const afterTax = 1 - i.taxRate;
  const newShares = (i.purchasePrice * i.stockPct) / i.acquirerSharePrice;
  const interestCost = i.purchasePrice * i.debtPct * i.costOfDebt * afterTax;
  const foregoneInterest = i.purchasePrice * i.cashPct * i.interestOnCash * afterTax;
  const withoutSynergies = i.acquirerNetIncome + i.targetNetIncome - interestCost - foregoneInterest;
  const proFormaNetIncome = withoutSynergies + (i.synergies ?? 0) * afterTax;
  const proFormaShares = i.acquirerShares + newShares;
  const standaloneEps = i.acquirerNetIncome / i.acquirerShares;
  const proFormaEps = proFormaNetIncome / proFormaShares;
  const shortfall = standaloneEps * proFormaShares - withoutSynergies;
  return {
    newShares,
    proFormaNetIncome,
    proFormaShares,
    standaloneEps,
    proFormaEps,
    accretion: proFormaEps / standaloneEps - 1,
    breakevenSynergies: Math.max(0, shortfall / afterTax),
  };
}
