/**
 * European option pricing with Black–Scholes(–Merton). Rates, volatility and dividend
 * yield are decimals; time is in years.
 */

/** Standard normal density. */
export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** Standard normal CDF (Abramowitz & Stegun 26.2.17; absolute error below 7.5e-8). */
export function normCdf(x: number): number {
  if (x < 0) return 1 - normCdf(-x);
  const t = 1 / (1 + 0.2316419 * x);
  const poly = t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return 1 - normPdf(x) * poly;
}

export interface OptionInputs {
  spot: number;
  strike: number;
  /** Continuously compounded risk-free rate. */
  rate: number;
  volatility: number;
  /** Years to expiry. */
  time: number;
  /** Continuous dividend yield. */
  dividendYield?: number;
}

export interface OptionGreeks {
  price: number;
  delta: number;
  gamma: number;
  /** Per 1.00 (100 points) of volatility. */
  vega: number;
  /** Per year. */
  theta: number;
  /** Per 1.00 (100 points) of interest rate. */
  rho: number;
}

export interface BlackScholesResult {
  d1: number;
  d2: number;
  call: OptionGreeks;
  put: OptionGreeks;
}

export function blackScholes(i: OptionInputs): BlackScholesResult {
  const { spot: S, strike: K, rate: r, volatility: v, time: T } = i;
  const q = i.dividendYield ?? 0;
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + (v * v) / 2) * T) / (v * sqrtT);
  const d2 = d1 - v * sqrtT;
  const dfR = Math.exp(-r * T);
  const dfQ = Math.exp(-q * T);
  const nd1 = normPdf(d1);
  const gamma = (dfQ * nd1) / (S * v * sqrtT);
  const vega = S * dfQ * nd1 * sqrtT;
  const decay = -(S * dfQ * nd1 * v) / (2 * sqrtT);

  return {
    d1,
    d2,
    call: {
      price: S * dfQ * normCdf(d1) - K * dfR * normCdf(d2),
      delta: dfQ * normCdf(d1),
      gamma,
      vega,
      theta: decay - r * K * dfR * normCdf(d2) + q * S * dfQ * normCdf(d1),
      rho: K * T * dfR * normCdf(d2),
    },
    put: {
      price: K * dfR * normCdf(-d2) - S * dfQ * normCdf(-d1),
      delta: dfQ * (normCdf(d1) - 1),
      gamma,
      vega,
      theta: decay + r * K * dfR * normCdf(-d2) - q * S * dfQ * normCdf(-d1),
      rho: -K * T * dfR * normCdf(-d2),
    },
  };
}

/** C − P − (S·e^(−qT) − K·e^(−rT)); zero when put–call parity holds. */
export function putCallParityGap(i: OptionInputs, call: number, put: number): number {
  const q = i.dividendYield ?? 0;
  return call - put - (i.spot * Math.exp(-q * i.time) - i.strike * Math.exp(-i.rate * i.time));
}

/** Payoff at expiry of a long call or put, before the premium. */
export function payoffAtExpiry(kind: "call" | "put", spotAtExpiry: number, strike: number): number {
  return kind === "call" ? Math.max(0, spotAtExpiry - strike) : Math.max(0, strike - spotAtExpiry);
}
