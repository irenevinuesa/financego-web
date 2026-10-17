import type { CourseMeta } from "../types";

/**
 * Courses that are still in development. They appear in the catalog with an
 * "In development" status and their planned outline, and never pretend to have lessons.
 */
export const PLANNED_COURSES: CourseMeta[] = [
  // Finance Foundations
  { id: "financial-statements", title: "Financial Statements in Depth", category: "foundations", summary: "Read a real annual report: revenue quality, segment data, footnotes and the items analysts adjust.", difficulty: "Intermediate", minutes: 120, lessonCount: 6, scene: "trail", status: "planned", plannedOutline: ["Reading an annual report", "Revenue recognition in practice", "Leases, pensions and provisions", "Non-GAAP adjustments", "Quality of earnings"] },
  { id: "time-value-of-money", title: "Time Value of Money", category: "foundations", summary: "Compounding, discounting, annuities and perpetuities, practised until they become second nature.", difficulty: "Beginner", minutes: 75, lessonCount: 5, scene: "trail", status: "planned", plannedOutline: ["Compounding frequencies", "Annuities and loan schedules", "Perpetuities", "Nominal vs real rates", "NPV and IRR"] },
  { id: "financial-ratios", title: "Financial Ratios", category: "foundations", summary: "Profitability, efficiency, liquidity and leverage ratios, and what they really tell you.", difficulty: "Beginner", minutes: 80, lessonCount: 5, scene: "trail", status: "planned", plannedOutline: ["Margins and returns (ROE, ROIC)", "DuPont analysis", "Liquidity and solvency", "Efficiency ratios", "Ratio pitfalls"] },
  { id: "financial-mathematics", title: "Financial Mathematics", category: "foundations", summary: "The maths toolkit behind finance: logs, growth rates, series and basic statistics.", difficulty: "Intermediate", minutes: 90, lessonCount: 5, scene: "trail", status: "planned" },

  // Corporate Finance
  { id: "capital-structure", title: "Capital Structure", category: "corporate-finance", summary: "Modigliani–Miller, the tax shield, distress costs and how firms choose their leverage.", difficulty: "Intermediate", minutes: 90, lessonCount: 5, scene: "campus", status: "planned", plannedOutline: ["Modigliani–Miller without taxes", "The interest tax shield", "Costs of financial distress", "Pecking order and signalling", "Choosing a target structure"] },
  { id: "cost-of-capital", title: "Cost of Capital", category: "corporate-finance", summary: "Estimating the cost of equity and debt with real-world judgement, not just formulas.", difficulty: "Intermediate", minutes: 80, lessonCount: 5, scene: "campus", status: "planned" },
  { id: "wacc-course", title: "WACC in Practice", category: "corporate-finance", summary: "Betas, risk premiums, country risk and target weights. (The DCF course already covers WACC fundamentals.)", difficulty: "Intermediate", minutes: 70, lessonCount: 4, scene: "campus", status: "planned" },
  { id: "capital-budgeting", title: "Capital Budgeting", category: "corporate-finance", summary: "NPV, IRR, payback and how companies decide which projects to fund.", difficulty: "Beginner", minutes: 75, lessonCount: 5, scene: "campus", status: "planned" },
  { id: "working-capital-management", title: "Working Capital Management", category: "corporate-finance", summary: "Receivables, inventory and payables as levers on cash generation.", difficulty: "Intermediate", minutes: 60, lessonCount: 4, scene: "campus", status: "planned" },
  { id: "corporate-strategy", title: "Corporate Financial Strategy", category: "corporate-finance", summary: "Dividends, buybacks, M&A and capital allocation through the CFO's eyes.", difficulty: "Advanced", minutes: 90, lessonCount: 5, scene: "campus", status: "planned" },

  // Valuation
  { id: "precedent-transactions", title: "Precedent Transactions", category: "valuation", summary: "Using past deals to value a company, and why control premiums matter.", difficulty: "Intermediate", minutes: 60, lessonCount: 4, scene: "alps", status: "planned" },
  { id: "ev-vs-equity", title: "Enterprise Value vs Equity Value", category: "valuation", summary: "A deep dive on the bridge: diluted shares, leases, pensions and associates.", difficulty: "Intermediate", minutes: 60, lessonCount: 4, scene: "alps", status: "planned" },
  { id: "terminal-value-course", title: "Terminal Value", category: "valuation", summary: "Gordon growth vs exit multiples, steady-state assumptions and cross-checks.", difficulty: "Advanced", minutes: 50, lessonCount: 3, scene: "alps", status: "planned" },
  { id: "sensitivity-analysis", title: "Sensitivity & Scenario Analysis", category: "valuation", summary: "Data tables, scenario toggles and football-field charts.", difficulty: "Intermediate", minutes: 50, lessonCount: 3, scene: "alps", status: "planned" },

  // IB & M&A
  { id: "ma-private-equity", title: "M&A and Private Equity", category: "ib-ma", summary: "A survey course: why companies merge, how sponsors buy them, and how deals are valued.", difficulty: "Intermediate", minutes: 110, lessonCount: 6, scene: "nyc", status: "planned", plannedOutline: ["Strategic vs financial buyers", "The M&A process", "Accretion / dilution", "LBO intuition", "Returns: IRR and MOIC", "Exit routes"] },
  { id: "accretion-dilution", title: "Accretion / Dilution", category: "ib-ma", summary: "EPS impact of cash, stock and debt-funded deals, and the cost of each currency.", difficulty: "Intermediate", minutes: 70, lessonCount: 4, scene: "nyc", status: "planned" },
  { id: "merger-models", title: "Merger Models", category: "ib-ma", summary: "Purchase price allocation, goodwill and combining the statements.", difficulty: "Advanced", minutes: 120, lessonCount: 6, scene: "nyc", status: "planned" },
  { id: "transaction-structures", title: "Transaction Structures", category: "ib-ma", summary: "Asset vs share deals, earn-outs, tender offers and their trade-offs.", difficulty: "Advanced", minutes: 60, lessonCount: 4, scene: "nyc", status: "planned" },
  { id: "synergies", title: "Synergies", category: "ib-ma", summary: "Revenue and cost synergies, phasing, costs to achieve and how much to pay away.", difficulty: "Intermediate", minutes: 45, lessonCount: 3, scene: "nyc", status: "planned" },
  { id: "leveraged-buyouts", title: "Leveraged Buyouts", category: "ib-ma", summary: "Sources and uses, debt schedules and the drivers of sponsor returns.", difficulty: "Advanced", minutes: 120, lessonCount: 6, scene: "nyc", status: "planned" },

  // Markets & Trading
  { id: "financial-markets", title: "Financial Markets", category: "markets", summary: "A survey of how equity, bond, FX and commodity markets work and who trades in them.", difficulty: "Beginner", minutes: 100, lessonCount: 6, scene: "london", status: "planned", plannedOutline: ["Market participants", "Primary vs secondary markets", "Equities", "Rates and credit", "FX and commodities", "How prices react to news"] },
  { id: "equities", title: "Equities", category: "markets", summary: "Equity market structure, indices, sectors and what drives returns.", difficulty: "Beginner", minutes: 70, lessonCount: 5, scene: "london", status: "planned" },
  { id: "foreign-exchange", title: "Foreign Exchange", category: "markets", summary: "Spot, forwards, interest rate parity and the drivers of currencies.", difficulty: "Intermediate", minutes: 60, lessonCount: 4, scene: "london", status: "planned" },
  { id: "commodities", title: "Commodities", category: "markets", summary: "Futures curves, contango, backwardation and physical market dynamics.", difficulty: "Intermediate", minutes: 50, lessonCount: 3, scene: "london", status: "planned" },
  { id: "derivatives-course", title: "Derivatives", category: "markets", summary: "Forwards, futures, swaps and options, with payoffs and hedging.", difficulty: "Intermediate", minutes: 100, lessonCount: 6, scene: "london", status: "planned" },
  { id: "market-microstructure", title: "Market Microstructure", category: "markets", summary: "Order books, liquidity, bid-ask spreads and market impact.", difficulty: "Advanced", minutes: 60, lessonCount: 4, scene: "london", status: "planned" },

  // Macroeconomics
  { id: "inflation", title: "Inflation", category: "macro", summary: "Measuring inflation, its causes and how it hits different assets.", difficulty: "Beginner", minutes: 50, lessonCount: 4, scene: "lake", status: "planned" },
  { id: "interest-rates", title: "Interest Rates", category: "macro", summary: "Nominal vs real rates, term premia and how rates propagate through markets.", difficulty: "Intermediate", minutes: 60, lessonCount: 4, scene: "lake", status: "planned" },
  { id: "monetary-policy", title: "Monetary Policy", category: "macro", summary: "Central bank mandates, policy tools, QE and transmission mechanisms.", difficulty: "Intermediate", minutes: 60, lessonCount: 4, scene: "lake", status: "planned" },
  { id: "fiscal-policy", title: "Fiscal Policy", category: "macro", summary: "Deficits, debt sustainability and the interaction with monetary policy.", difficulty: "Intermediate", minutes: 50, lessonCount: 3, scene: "lake", status: "planned" },
  { id: "yield-curves", title: "Yield Curves", category: "macro", summary: "Shapes, inversions, steepeners and flatteners, and what they signal.", difficulty: "Intermediate", minutes: 50, lessonCount: 3, scene: "lake", status: "planned" },
  { id: "economic-cycles", title: "Economic Cycles", category: "macro", summary: "Expansions, recessions, leading indicators and sector rotation.", difficulty: "Beginner", minutes: 50, lessonCount: 3, scene: "lake", status: "planned" },

  // PE & HF
  { id: "pe-fundamentals", title: "Private Equity Fundamentals", category: "pe-hf", summary: "How funds raise capital, invest, create value and exit.", difficulty: "Beginner", minutes: 70, lessonCount: 5, scene: "summit", status: "planned" },
  { id: "lbo-analysis", title: "LBO Analysis", category: "pe-hf", summary: "Paper LBOs, full LBO models and value-creation attribution.", difficulty: "Advanced", minutes: 110, lessonCount: 6, scene: "summit", status: "planned" },
  { id: "fund-economics", title: "Fund Economics", category: "pe-hf", summary: "Management fees, carry, hurdles, waterfalls and LP returns.", difficulty: "Intermediate", minutes: 50, lessonCount: 3, scene: "summit", status: "planned" },
  { id: "long-short-equity", title: "Long/Short Equity", category: "pe-hf", summary: "Building a book: idea generation, sizing, shorting and risk.", difficulty: "Advanced", minutes: 70, lessonCount: 4, scene: "summit", status: "planned" },
  { id: "investment-research", title: "Investment Research", category: "pe-hf", summary: "From a question to a thesis: research process, variant perception and catalysts.", difficulty: "Intermediate", minutes: 70, lessonCount: 4, scene: "summit", status: "planned" },
  { id: "portfolio-construction", title: "Portfolio Construction", category: "pe-hf", summary: "Position sizing, diversification, exposures and drawdown control.", difficulty: "Advanced", minutes: 60, lessonCount: 4, scene: "summit", status: "planned" },

  // Quantitative Finance
  { id: "probability-statistics", title: "Probability & Statistics", category: "quant", summary: "Distributions, expectation, variance, conditional probability and regression.", difficulty: "Intermediate", minutes: 100, lessonCount: 6, scene: "lake", status: "planned" },
  { id: "portfolio-optimization", title: "Portfolio Optimization", category: "quant", summary: "Mean-variance, the efficient frontier and why optimisers love estimation error.", difficulty: "Advanced", minutes: 70, lessonCount: 4, scene: "lake", status: "planned" },
  { id: "factor-models", title: "Factor Models", category: "quant", summary: "CAPM, Fama–French and risk models used by asset managers.", difficulty: "Advanced", minutes: 60, lessonCount: 4, scene: "lake", status: "planned" },
  { id: "risk-metrics", title: "Risk Metrics", category: "quant", summary: "Volatility, VaR, expected shortfall, drawdowns and stress tests.", difficulty: "Intermediate", minutes: 60, lessonCount: 4, scene: "lake", status: "planned" },
  { id: "options-pricing", title: "Options Pricing", category: "quant", summary: "Binomial trees, Black–Scholes, the Greeks and implied volatility.", difficulty: "Advanced", minutes: 100, lessonCount: 6, scene: "lake", status: "planned" },
  { id: "quantitative-trading", title: "Quantitative Trading", category: "quant", summary: "Signals, backtests, overfitting and transaction costs.", difficulty: "Advanced", minutes: 80, lessonCount: 5, scene: "lake", status: "planned" },
];
