import type { SceneName, TopicId, TrackId } from "../types";

export interface CareerGuide {
  slug: string;
  title: string;
  tagline: string;
  scene: SceneName;
  /** Track used to pre-select the Interview Simulator. */
  track: TrackId;
  whatTheyDo: string;
  responsibilities: string[];
  skills: string[];
  process: { step: string; detail: string }[];
  interviewTopics: string[];
  courses: string[];
  practiceTopics: TopicId[];
  roadmap: { phase: string; items: string[] }[];
}

const COMMON_PROCESS_NOTE =
  "Processes vary by firm, region and year. Always confirm dates and steps on each firm's official careers page.";

export const CAREER_NOTE = COMMON_PROCESS_NOTE;

export const CAREER_GUIDES: CareerGuide[] = [
  {
    slug: "investment-banking",
    title: "Investment Banking",
    tagline: "Advise companies on mergers, acquisitions and raising capital.",
    scene: "nyc",
    track: "investment-banking",
    whatTheyDo:
      "Investment bankers advise companies, governments and investors on strategic transactions (buying or selling businesses, mergers, restructurings) and help them raise capital by issuing shares or debt. Analysts and associates do much of the financial analysis, valuation work and preparation of materials such as pitch books, information memoranda and models.",
    responsibilities: [
      "Build valuation analyses: trading comparables, precedent transactions and DCFs",
      "Prepare pitch books and client presentations",
      "Build and maintain financial models (merger, LBO and operating models)",
      "Run due diligence processes and coordinate data rooms",
      "Research industries, companies and potential buyers or targets",
    ],
    skills: ["Accounting and the three statements", "Valuation (DCF, comps, precedents)", "M&A and LBO mechanics", "Excel modelling and PowerPoint", "Attention to detail under time pressure"],
    process: [
      { step: "Online application", detail: "CV, sometimes a cover letter, and screening questions." },
      { step: "Online assessments", detail: "Numerical or logical tests, situational judgement, and often a recorded video interview." },
      { step: "First round", detail: "Behavioural (“Why banking?”, “Why this firm?”) and technical questions on accounting and valuation." },
      { step: "Final round / assessment centre", detail: "Several back-to-back interviews, sometimes a case study or modelling test." },
    ],
    interviewTopics: ["Walk me through the three statements", "Walk me through a DCF", "EV vs equity value", "WACC and its drivers", "Accretion / dilution", "Why might you pay a premium?", "A deal you have followed"],
    courses: ["accounting-fundamentals", "dcf", "finance-101", "ma-fundamentals", "accretion-dilution"],
    practiceTopics: ["accounting", "valuation", "ma", "lbo"],
    roadmap: [
      { phase: "Foundations", items: ["Complete Accounting Fundamentals", "Complete the DCF course", "Learn the core multiples"] },
      { phase: "Technical depth", items: ["Practise accounting and valuation questions until you score 80%+", "Build a DCF in the FinanceGo tool and explain every input"] },
      { phase: "Story", items: ["Write your “Why banking?” answer", "Prepare two deals you can discuss in detail"] },
      { phase: "Interview readiness", items: ["Run three Investment Banking mock interviews", "Track applications in the Tracker"] },
    ],
  },
  {
    slug: "private-equity",
    title: "Private Equity",
    tagline: "Buy companies, improve them and sell them, usually with leverage.",
    scene: "summit",
    track: "private-equity",
    whatTheyDo:
      "Private equity firms raise money from investors (limited partners) into funds and use it, typically alongside debt, to acquire stakes in private companies. They work with management to improve performance over several years and then exit through a sale or listing. Junior investment professionals screen opportunities, build LBO models, conduct due diligence and support portfolio companies.",
    responsibilities: [
      "Screen and evaluate investment opportunities",
      "Build LBO models and returns analyses",
      "Conduct commercial, financial and legal due diligence with advisers",
      "Write investment committee memos",
      "Monitor portfolio companies and support value-creation plans",
    ],
    skills: ["LBO modelling", "Valuation and accounting", "Commercial judgement: is this a good business?", "Due diligence and structured thinking", "Clear investment writing"],
    process: [
      { step: "Headhunter or direct application", detail: "Many roles for experienced hires run through specialist recruiters; graduate roles are rarer." },
      { step: "Technical interviews", detail: "LBO concepts, accounting, valuation and deal discussions." },
      { step: "Modelling test", detail: "Often a timed LBO model built from a case pack." },
      { step: "Case study", detail: "Assess a business and recommend whether to invest, sometimes as a written memo." },
    ],
    interviewTopics: ["Paper LBO", "What makes a good LBO candidate?", "Drivers of returns", "Walk me through a deal", "Would you invest in this company?", "Debt structures"],
    courses: ["dcf", "accounting-fundamentals", "leveraged-buyouts", "pe-fundamentals", "lbo-analysis"],
    practiceTopics: ["lbo", "valuation", "accounting", "ma"],
    roadmap: [
      { phase: "Foundations", items: ["Master accounting and DCF", "Learn LBO intuition: sources and uses, debt paydown, IRR and MOIC"] },
      { phase: "Commercial sense", items: ["Practise assessing business quality: market, moat, unit economics", "Write a one-page investment memo on a company you know"] },
      { phase: "Technical", items: ["Practise paper LBOs until you can do them mentally", "Learn the IRR rules of thumb"] },
      { phase: "Interview readiness", items: ["Run Private Equity mock interviews", "Prepare two deals or companies you can discuss as an investor"] },
    ],
  },
  {
    slug: "hedge-funds",
    title: "Hedge Funds",
    tagline: "Generate returns across markets with a wide range of strategies.",
    scene: "london",
    track: "hedge-funds",
    whatTheyDo:
      "Hedge funds manage pooled capital using strategies such as long/short equity, global macro, credit, event-driven and quantitative trading. Analysts research investment ideas and pitch them to portfolio managers, who decide on positions and manage risk. The common thread is a disciplined process for finding mispriced assets and sizing positions.",
    responsibilities: [
      "Generate and research investment ideas",
      "Build financial models and valuation views",
      "Monitor news, earnings and data relevant to positions",
      "Pitch ideas to portfolio managers and defend them",
      "Track risk, exposures and the thesis of each position",
    ],
    skills: ["Valuation and accounting", "Independent research and variant perception", "Markets and macro intuition", "Risk management and position sizing", "Clear, concise argument"],
    process: [
      { step: "Application or referral", detail: "Many funds hire experienced candidates; graduate programmes exist at larger funds." },
      { step: "Stock or trade pitch", detail: "Expect to pitch an idea and defend it under questioning." },
      { step: "Technical and market questions", detail: "Valuation, accounting and current market topics." },
      { step: "Case or take-home", detail: "Research a company and produce a recommendation in a set time." },
    ],
    interviewTopics: ["Pitch me a stock", "What does the market misunderstand?", "How do you size a position?", "A market development you follow", "Short thesis risks"],
    courses: ["dcf", "accounting-fundamentals", "long-short-equity", "investment-research", "financial-markets"],
    practiceTopics: ["valuation", "markets", "macro", "accounting"],
    roadmap: [
      { phase: "Foundations", items: ["Master valuation and accounting", "Follow markets daily and keep a journal of what moved and why"] },
      { phase: "Process", items: ["Write up two stock pitches: one long, one short", "Practise explaining what the market misses"] },
      { phase: "Interview readiness", items: ["Run Hedge Fund mock interviews (pitch format)", "Prepare for deep follow-up questions on your ideas"] },
    ],
  },
  {
    slug: "asset-management",
    title: "Asset Management",
    tagline: "Invest money on behalf of clients over the long term.",
    scene: "lake",
    track: "asset-management",
    whatTheyDo:
      "Asset managers invest on behalf of pension funds, insurers, foundations and individuals across equities, bonds, multi-asset and alternative strategies. Roles include research analysts, portfolio managers, risk and client-facing positions. Long-term thinking, portfolio construction and understanding client objectives sit at the core of the job.",
    responsibilities: [
      "Research companies, sectors or asset classes",
      "Contribute to portfolio construction and risk decisions",
      "Monitor holdings and markets",
      "Prepare client reports and investment commentary",
      "Analyse performance relative to benchmarks",
    ],
    skills: ["Valuation and financial analysis", "Portfolio theory and diversification", "Macro and market understanding", "Communication with clients", "Patience and process"],
    process: [
      { step: "Application", detail: "Graduate programmes often rotate across investment, risk and distribution teams." },
      { step: "Assessments", detail: "Numerical tests and sometimes written exercises." },
      { step: "Interviews", detail: "Motivation, market views, a stock or asset pitch, and portfolio concepts." },
      { step: "Assessment centre", detail: "Group exercises, presentations and interviews." },
    ],
    interviewTopics: ["How would you invest €1m for a client?", "Diversification and correlation", "Active vs passive", "A stock or fund you like", "How rates affect asset classes"],
    courses: ["finance-101", "dcf", "portfolio-construction", "financial-markets", "risk-metrics"],
    practiceTopics: ["markets", "quant", "macro", "valuation"],
    roadmap: [
      { phase: "Foundations", items: ["Complete Finance 101 (risk and return)", "Learn how bonds, equities and alternatives behave"] },
      { phase: "Investment views", items: ["Prepare a stock pitch and a macro view", "Practise portfolio questions (Sharpe, diversification)"] },
      { phase: "Interview readiness", items: ["Run Asset Management mock interviews", "Prepare questions about the firm's investment philosophy"] },
    ],
  },
  {
    slug: "sales-and-trading",
    title: "Sales & Trading",
    tagline: "Make markets, manage risk and serve institutional clients.",
    scene: "london",
    track: "sales-trading",
    whatTheyDo:
      "Sales & trading teams at banks buy and sell securities and derivatives for institutional clients. Traders make markets, quoting prices and managing the resulting risk; salespeople build client relationships, share market views and bring flow to the desk; structurers design tailored products. Desks are organised by asset class: rates, credit, FX, equities and commodities.",
    responsibilities: [
      "Quote prices and manage the desk's risk positions (traders)",
      "Communicate market colour and trade ideas to clients (sales)",
      "Monitor news and data that move markets",
      "Analyse flows, positioning and relative value",
      "Support risk management and P&L reporting",
    ],
    skills: ["Market intuition and macro knowledge", "Quick mental maths and probability", "Fixed income and derivatives basics", "Composure under pressure", "Communication"],
    process: [
      { step: "Application and online tests", detail: "Numerical reasoning and sometimes market-knowledge tests." },
      { step: "First round", detail: "Motivation, market questions and mental maths." },
      { step: "Final round", detail: "Several interviews across desks: pitch a trade, market discussion, brain teasers." },
    ],
    interviewTopics: ["Pitch me a trade", "What happens if a central bank hikes unexpectedly?", "Duration and convexity", "Options and volatility", "Mental maths and probability"],
    courses: ["financial-markets", "fixed-income-course", "derivatives-course", "interest-rates", "finance-101"],
    practiceTopics: ["markets", "fixed-income", "derivatives", "macro", "brain-teasers"],
    roadmap: [
      { phase: "Foundations", items: ["Learn bond pricing and duration (use the Bond Pricing tool)", "Learn option payoffs and the drivers of option prices"] },
      { phase: "Market fluency", items: ["Follow rates, FX and equity moves daily", "Prepare one trade idea with a clear risk plan"] },
      { phase: "Interview readiness", items: ["Practise brain teasers and mental maths", "Run Sales & Trading mock interviews"] },
    ],
  },
  {
    slug: "equity-research",
    title: "Equity Research",
    tagline: "Analyse companies and publish investment recommendations.",
    scene: "campus",
    track: "equity-research",
    whatTheyDo:
      "Equity research analysts cover a set of listed companies in one sector. On the sell side they publish research and ratings for institutional clients; on the buy side they support their own firm's portfolio managers. The work combines financial modelling, industry knowledge and communicating a view clearly.",
    responsibilities: [
      "Build and update company earnings models",
      "Write research notes around results and news",
      "Develop valuations and price targets",
      "Speak with company management and industry experts",
      "Communicate views to clients or portfolio managers",
    ],
    skills: ["Accounting and modelling", "Valuation", "Sector expertise", "Writing", "Forming and defending a view"],
    process: [
      { step: "Application", detail: "Often through bank graduate programmes or direct hire." },
      { step: "Interviews", detail: "Accounting, valuation, a stock pitch and sector knowledge." },
      { step: "Written exercise", detail: "Sometimes a short research note or earnings preview." },
    ],
    interviewTopics: ["Pitch a stock in our sector", "Walk me through a DCF", "EV/EBITDA vs P/E", "How do you value a loss-making company?", "What drives this industry?"],
    courses: ["accounting-fundamentals", "dcf", "trading-comps", "investment-research", "financial-statements"],
    practiceTopics: ["valuation", "accounting", "markets"],
    roadmap: [
      { phase: "Foundations", items: ["Complete Accounting Fundamentals and DCF", "Read annual reports in a sector you like"] },
      { phase: "Output", items: ["Write a two-page research note with a valuation", "Practise explaining your model's key drivers"] },
      { phase: "Interview readiness", items: ["Run Equity Research mock interviews", "Prepare a long and a short idea in one sector"] },
    ],
  },
  {
    slug: "quantitative-trading",
    title: "Quantitative Trading",
    tagline: "Use mathematics, statistics and code to find and trade signals.",
    scene: "lake",
    track: "quant-finance",
    whatTheyDo:
      "Quantitative traders and researchers build systematic strategies: they find statistical patterns in data, test them rigorously, and trade them at scale while controlling risk and transaction costs. Roles range from researchers (models and signals) to traders (execution and risk) and developers (infrastructure).",
    responsibilities: [
      "Research and test trading signals",
      "Build and validate statistical models",
      "Analyse execution and transaction costs",
      "Monitor live strategies and risk",
      "Write production-quality code for research and trading",
    ],
    skills: ["Probability and statistics", "Programming (often Python and/or C++)", "Linear algebra and optimisation", "Scepticism about backtests", "Quick, accurate mental maths"],
    process: [
      { step: "Online assessment", detail: "Maths, probability and coding tests." },
      { step: "Technical interviews", detail: "Probability puzzles, statistics and coding." },
      { step: "Final round", detail: "Deeper problem solving, sometimes market-making games." },
    ],
    interviewTopics: ["Expected value puzzles", "Conditional probability and Bayes", "Statistics and regression", "Overfitting", "Coding"],
    courses: ["probability-statistics", "quantitative-trading", "options-pricing", "risk-metrics"],
    practiceTopics: ["quant", "brain-teasers", "derivatives"],
    roadmap: [
      { phase: "Foundations", items: ["Probability: expectation, conditional probability, Bayes", "Statistics: distributions and regression"] },
      { phase: "Practice", items: ["Do probability brain teasers daily", "Code small backtests and learn why they mislead"] },
      { phase: "Interview readiness", items: ["Run Quantitative Finance mock interviews", "Practise mental maths under time pressure"] },
    ],
  },
  {
    slug: "risk-management",
    title: "Risk Management",
    tagline: "Measure, monitor and limit the risks a financial firm takes.",
    scene: "alps",
    track: "risk-management",
    whatTheyDo:
      "Risk managers identify, measure and control risks across a financial institution: market risk (losses from price moves), credit risk (borrowers not paying), liquidity risk and operational risk. They set and monitor limits, build risk models, run stress tests and challenge the business when risks look too large.",
    responsibilities: [
      "Measure exposures, VaR and stress-test results",
      "Monitor limits and escalate breaches",
      "Assess counterparty and credit risk",
      "Validate and challenge risk models",
      "Report risk to management and regulators",
    ],
    skills: ["Statistics and risk metrics", "Fixed income, credit and derivatives", "Financial regulation awareness", "Independent judgement", "Clear reporting"],
    process: [
      { step: "Application and tests", detail: "Numerical and sometimes technical tests." },
      { step: "Interviews", detail: "Risk concepts (VaR, credit metrics), market questions and motivation." },
      { step: "Assessment centre", detail: "Case exercises and presentations at some firms." },
    ],
    interviewTopics: ["What is VaR and what are its limits?", "How would you assess credit risk?", "Duration and convexity", "Stress testing", "A recent market risk event"],
    courses: ["risk-metrics", "fixed-income-course", "derivatives-course", "finance-101"],
    practiceTopics: ["credit-risk", "fixed-income", "quant", "derivatives"],
    roadmap: [
      { phase: "Foundations", items: ["Risk and return (Finance 101)", "Bond maths and duration"] },
      { phase: "Risk metrics", items: ["Learn VaR, expected shortfall and stress testing", "Practise credit and risk questions"] },
      { phase: "Interview readiness", items: ["Run Risk Management mock interviews"] },
    ],
  },
  {
    slug: "consulting",
    title: "Consulting",
    tagline: "Solve business problems for clients with structured analysis.",
    scene: "campus",
    track: "consulting",
    whatTheyDo:
      "Management consultants help organisations solve strategic and operational problems: growth strategy, market entry, cost reduction, pricing, M&A support and transformations. Junior consultants gather and analyse data, interview experts and clients, build analyses and communicate findings in structured presentations.",
    responsibilities: [
      "Structure problems into testable hypotheses",
      "Collect and analyse data; build Excel models",
      "Interview clients, customers and experts",
      "Build slides that communicate findings",
      "Support implementation of recommendations",
    ],
    skills: ["Structured, hypothesis-driven thinking", "Mental maths and estimation", "Business intuition", "Communication and synthesis", "Teamwork with clients"],
    process: [
      { step: "Application and online tests", detail: "Problem-solving tests or online case games at some firms." },
      { step: "Case interviews", detail: "Interviewer-led or candidate-led business cases with market sizing and maths." },
      { step: "Fit / behavioural", detail: "Leadership, teamwork and impact stories, often in detail." },
    ],
    interviewTopics: ["Profitability cases", "Market entry", "Market sizing", "Break-even and pricing", "Leadership and teamwork stories"],
    courses: ["finance-101", "corporate-strategy", "capital-budgeting"],
    practiceTopics: ["strategy", "brain-teasers", "corporate-finance"],
    roadmap: [
      { phase: "Foundations", items: ["Learn the profit tree and market-entry frameworks", "Practise mental maths daily"] },
      { phase: "Cases", items: ["Practise market sizing and profitability cases", "Write STAR stories for leadership and teamwork"] },
      { phase: "Interview readiness", items: ["Run Consulting mock interviews (case format)"] },
    ],
  },
  {
    slug: "corporate-finance",
    title: "Corporate Finance",
    tagline: "Run the finances of a company from the inside.",
    scene: "trail",
    track: "corporate-finance",
    whatTheyDo:
      "Corporate finance professionals work inside companies on financial planning and analysis (FP&A), treasury, corporate development (M&A) and investor relations. They forecast performance, allocate capital, manage funding and liquidity, and evaluate investments and acquisitions.",
    responsibilities: [
      "Build budgets, forecasts and variance analyses",
      "Evaluate investment projects (NPV, IRR)",
      "Manage cash, funding and financial risk (treasury)",
      "Support acquisitions and divestitures (corporate development)",
      "Prepare materials for management and investors",
    ],
    skills: ["Accounting", "Capital budgeting and valuation", "Excel and financial planning", "Business partnering", "Communication with non-finance teams"],
    process: [
      { step: "Application", detail: "Graduate programmes often rotate through finance functions." },
      { step: "Tests and interviews", detail: "Numerical tests, accounting and motivation questions." },
      { step: "Case exercise", detail: "Sometimes a budgeting or investment-appraisal case." },
    ],
    interviewTopics: ["NPV vs IRR", "Working capital", "How do the statements link?", "Dividend vs buyback", "Evaluate this investment"],
    courses: ["finance-101", "accounting-fundamentals", "capital-budgeting", "working-capital-management", "dcf"],
    practiceTopics: ["corporate-finance", "accounting", "valuation", "strategy"],
    roadmap: [
      { phase: "Foundations", items: ["Finance 101 and Accounting Fundamentals", "Working capital and cash conversion"] },
      { phase: "Decision tools", items: ["Practise NPV and capital budgeting questions", "Use the DCF and WACC tools on a real-world style case"] },
      { phase: "Interview readiness", items: ["Run Corporate Finance-focused mock interviews (technical and case)"] },
    ],
  },
];

export function getCareer(slug: string) {
  return CAREER_GUIDES.find((g) => g.slug === slug);
}
