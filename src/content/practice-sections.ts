import type { LessonRef } from "./types";

/**
 * Practice sections: one per topic. Keyed by topic id (string, so sections can
 * be added in the taxonomy without touching this file first).
 */
export interface SectionInfo {
  intro: string;
  focus: string[];
  lessons: LessonRef[];
}

const L = (courseId: string, lessonId: string): LessonRef => ({ courseId, lessonId });

export const SECTION_INFO: Record<string, SectionInfo> = {
  accounting: {
    intro: "The three statements, how they link and how individual transactions flow through them. Every technical interview starts here.",
    focus: ["Walking changes through the statements", "Accruals and working capital", "Deferred taxes, leases, goodwill and SBC"],
    lessons: [L("accounting-fundamentals", "three-statements"), L("accounting-fundamentals", "linking-statements"), L("accounting-fundamentals", "working-capital"), L("accounting-fundamentals", "accruals")],
  },
  "corporate-finance": {
    intro: "How companies decide what to invest in and how to fund it: NPV and IRR, capital structure and payout policy.",
    focus: ["NPV vs IRR", "Capital structure and the cost of capital", "Dividends and buybacks"],
    lessons: [L("finance-101", "time-value-of-money"), L("finance-101", "value-creation"), L("dcf", "wacc")],
  },
  valuation: {
    intro: "Intrinsic and relative valuation: DCF, WACC, terminal value, multiples and the bridge from enterprise value to equity value.",
    focus: ["Walk me through a DCF", "EV vs equity value", "Choosing and reading multiples"],
    lessons: [L("dcf", "dcf-intuition"), L("dcf", "unlevered-fcf"), L("dcf", "terminal-value"), L("dcf", "ev-to-equity"), L("trading-comps", "multiples"), L("trading-comps", "implied-valuation")],
  },
  ma: {
    intro: "Why companies merge, how deals are valued and paid for, and the EPS maths of accretion and dilution.",
    focus: ["Deal rationale and synergies", "Stock vs cash vs debt consideration", "Accretion / dilution"],
    lessons: [L("ma-fundamentals", "deal-rationale"), L("ma-fundamentals", "deal-valuation"), L("ma-fundamentals", "deal-consideration"), L("ma-fundamentals", "accretion-dilution")],
  },
  lbo: {
    intro: "How private equity funds buy companies with leverage, create value and earn their returns: paper LBOs, IRR and MOIC.",
    focus: ["Sources and uses", "Drivers of returns", "What makes a good LBO candidate"],
    lessons: [L("finance-101", "value-creation"), L("dcf", "ev-to-equity")],
  },
  "capital-markets": {
    intro: "How companies raise money: equity offerings and IPOs, high-yield bonds and leveraged loans, and the terms that come with them.",
    focus: ["The IPO process", "High yield vs leveraged loans", "Covenants and call protection"],
    lessons: [L("fixed-income-course", "bond-yields"), L("fixed-income-course", "credit-spreads")],
  },
  industries: {
    intro: "Sector-specific metrics and valuation habits: SaaS, banks and insurers, REITs, energy, consumer, healthcare and more.",
    focus: ["Why banks are valued on equity metrics", "SaaS metrics", "Sector multiples"],
    lessons: [L("trading-comps", "peer-group"), L("trading-comps", "multiples")],
  },
  restructuring: {
    intro: "What happens when companies can't pay their debts: priority of claims, Chapter 11, DIP financing and recovery analysis.",
    focus: ["Absolute priority", "The fulcrum security", "Recovery analysis"],
    lessons: [L("fixed-income-course", "credit-spreads"), L("dcf", "ev-to-equity")],
  },
  markets: {
    intro: "How markets work and react to news, plus the sales & trading and hedge fund concepts interviewers expect you to know.",
    focus: ["How assets react to rate and data surprises", "Market structure and liquidity", "Hedge fund strategies"],
    lessons: [L("finance-101", "risk-and-return")],
  },
  "fixed-income": {
    intro: "Bond pricing, yields, duration and convexity, curve shapes and credit spreads.",
    focus: ["Price and yield", "Duration and convexity", "Curves and spreads"],
    lessons: [L("fixed-income-course", "bond-basics"), L("fixed-income-course", "bond-yields"), L("fixed-income-course", "duration"), L("fixed-income-course", "convexity"), L("fixed-income-course", "spot-forward-rates")],
  },
  derivatives: {
    intro: "Forwards, futures, swaps and options: payoffs, no-arbitrage pricing, put-call parity and the Greeks.",
    focus: ["Payoffs and parity", "Forward pricing", "The Greeks and volatility"],
    lessons: [L("finance-101", "time-value-of-money")],
  },
  macro: {
    intro: "Inflation, interest rates, central banks, currencies and the cycle, and how they move every asset class.",
    focus: ["Real vs nominal rates", "Monetary policy", "Yield curves and the cycle"],
    lessons: [L("finance-101", "time-value-of-money"), L("fixed-income-course", "spot-forward-rates")],
  },
  "credit-risk": {
    intro: "Assessing whether borrowers will pay: leverage and coverage, default and recovery, and how risk is measured.",
    focus: ["Credit ratios", "Expected loss", "VaR and its limits"],
    lessons: [L("fixed-income-course", "credit-spreads"), L("finance-101", "risk-and-return")],
  },
  quant: {
    intro: "Probability, expected value, statistics and portfolio maths, as used in quant, risk and trading interviews.",
    focus: ["Conditional probability", "Expected value", "Diversification maths"],
    lessons: [L("finance-101", "risk-and-return")],
  },
  "brain-teasers": {
    intro: "Logic puzzles and mental maths of the kind used in trading and quant interviews. Talk through your reasoning.",
    focus: ["Probability puzzles", "Mental maths", "Estimation"],
    lessons: [],
  },
  strategy: {
    intro: "Consulting-style business cases: profitability, market entry, sizing, pricing and break-even.",
    focus: ["Profit trees", "Market sizing", "Break-even and pricing"],
    lessons: [L("finance-101", "value-creation")],
  },
};

export function sectionInfo(topic: string): SectionInfo {
  return SECTION_INFO[topic] ?? { intro: "", focus: [], lessons: [] };
}
