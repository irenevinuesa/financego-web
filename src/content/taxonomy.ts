import type { CategoryId, SceneName, SkillId, TopicId, TrackId } from "./types";

export const TOPICS: Record<TopicId, { label: string; skill: SkillId | null }> = {
  accounting: { label: "Accounting", skill: "accounting" },
  "corporate-finance": { label: "Corporate Finance", skill: "valuation" },
  valuation: { label: "Valuation", skill: "valuation" },
  ma: { label: "M&A", skill: "ma" },
  lbo: { label: "Private Equity & LBO", skill: "lbo" },
  markets: { label: "Financial Markets", skill: "macro" },
  "fixed-income": { label: "Fixed Income", skill: "fixed-income" },
  derivatives: { label: "Derivatives", skill: "derivatives" },
  macro: { label: "Macroeconomics", skill: "macro" },
  "credit-risk": { label: "Credit & Risk", skill: "fixed-income" },
  quant: { label: "Quantitative Finance", skill: "quant" },
  "brain-teasers": { label: "Brain Teasers", skill: "quant" },
  strategy: { label: "Consulting & Business Cases", skill: null },
  "capital-markets": { label: "Capital Markets", skill: "fixed-income" },
  industries: { label: "Industries", skill: "valuation" },
  restructuring: { label: "Restructuring", skill: "fixed-income" },
};

export const TOPIC_IDS = Object.keys(TOPICS) as TopicId[];

export const SKILLS: Record<SkillId, { label: string; short: string }> = {
  accounting: { label: "Accounting", short: "Accounting" },
  valuation: { label: "Valuation & Corporate Finance", short: "Valuation" },
  ma: { label: "M&A", short: "M&A" },
  lbo: { label: "LBO", short: "LBO" },
  "fixed-income": { label: "Fixed Income & Credit", short: "Fixed Inc." },
  derivatives: { label: "Derivatives", short: "Derivatives" },
  macro: { label: "Macro & Markets", short: "Macro" },
  quant: { label: "Quantitative Finance", short: "Quant" },
};

export const SKILL_IDS = Object.keys(SKILLS) as SkillId[];

export const TRACKS: Record<TrackId, { label: string; short: string }> = {
  "investment-banking": { label: "Investment Banking", short: "IB" },
  "private-equity": { label: "Private Equity", short: "PE" },
  "sales-trading": { label: "Sales & Trading", short: "S&T" },
  "hedge-funds": { label: "Hedge Funds", short: "HF" },
  "equity-research": { label: "Equity Research", short: "ER" },
  "asset-management": { label: "Asset Management", short: "AM" },
  consulting: { label: "Consulting", short: "Consulting" },
  "risk-management": { label: "Risk Management", short: "Risk" },
  "quant-finance": { label: "Quantitative Finance", short: "Quant" },
  "corporate-finance": { label: "Corporate Finance", short: "CorpFin" },
};

export const TRACK_IDS = Object.keys(TRACKS) as TrackId[];

/** Career tracks used by Interview Preparation practice (the spec lists nine). */
export const INTERVIEW_TRACK_IDS: TrackId[] = [
  "investment-banking",
  "private-equity",
  "sales-trading",
  "hedge-funds",
  "equity-research",
  "asset-management",
  "consulting",
  "risk-management",
  "quant-finance",
];

export const CATEGORIES: Record<CategoryId, { label: string; blurb: string; scene: SceneName }> = {
  foundations: {
    label: "Finance Foundations",
    blurb: "The language of finance: statements, time value of money and the core ratios.",
    scene: "trail",
  },
  "corporate-finance": {
    label: "Corporate Finance",
    blurb: "How companies fund themselves, invest capital and create value.",
    scene: "campus",
  },
  valuation: {
    label: "Valuation",
    blurb: "DCF, multiples and the bridge from enterprise value to the share price.",
    scene: "alps",
  },
  "ib-ma": {
    label: "Investment Banking & M&A",
    blurb: "Deal mechanics: mergers, accretion/dilution, synergies and buyouts.",
    scene: "nyc",
  },
  markets: {
    label: "Markets & Trading",
    blurb: "Equities, rates, FX, commodities and derivatives, and how they trade.",
    scene: "london",
  },
  macro: {
    label: "Macroeconomics",
    blurb: "Inflation, interest rates, policy and the cycle that moves every asset.",
    scene: "lake",
  },
  "pe-hf": {
    label: "Private Equity & Hedge Funds",
    blurb: "Fund economics, LBO analysis and building an investment process.",
    scene: "summit",
  },
  quant: {
    label: "Quantitative Finance",
    blurb: "Probability, portfolio optimisation, risk metrics and option pricing.",
    scene: "lake",
  },
};

export const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[];

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
