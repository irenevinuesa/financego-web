import type { LessonRef, TopicId } from "./types";

export type ToolCategory = "Valuation" | "Fixed income" | "Growth & personal finance" | "Portfolio" | "Deals & advanced";

export interface ToolMeta {
  slug: string;
  title: string;
  category: ToolCategory;
  summary: string;
  status: "available" | "planned";
  /** Roadmap version for planned tools, when the spec assigns one. */
  planned?: "V2" | "V3";
  lesson?: LessonRef;
  practiceTopic?: TopicId;
}

export const TOOLS: ToolMeta[] = [
  {
    slug: "wacc",
    title: "WACC Calculator",
    category: "Valuation",
    summary: "Cost of equity with CAPM, after-tax cost of debt and WACC, with a sensitivity chart.",
    status: "available",
    lesson: { courseId: "dcf", lessonId: "wacc" },
    practiceTopic: "valuation",
  },
  {
    slug: "dcf",
    title: "DCF Builder",
    category: "Valuation",
    summary: "Five-year unlevered DCF: free cash flow, terminal value, enterprise and equity value, value per share and a sensitivity table.",
    status: "available",
    lesson: { courseId: "dcf", lessonId: "dcf-intuition" },
    practiceTopic: "valuation",
  },
  {
    slug: "compound-interest",
    title: "Compound Interest Calculator",
    category: "Growth & personal finance",
    summary: "Grow a lump sum and regular contributions, with any compounding frequency and an inflation adjustment.",
    status: "available",
    lesson: { courseId: "finance-101", lessonId: "time-value-of-money" },
    practiceTopic: "corporate-finance",
  },
  {
    slug: "bond-pricing",
    title: "Bond Pricing Calculator",
    category: "Fixed income",
    summary: "Price, Macaulay and modified duration, convexity, DV01 and the price-yield curve.",
    status: "available",
    lesson: { courseId: "finance-101", lessonId: "time-value-of-money" },
    practiceTopic: "fixed-income",
  },
  { slug: "trading-comps", title: "Trading Comparables", category: "Valuation", summary: "Enter peer data manually to compute EV/Revenue, EV/EBITDA, P/E and an implied valuation range.", status: "planned" },
  { slug: "portfolio-analytics", title: "Portfolio Analytics", category: "Portfolio", summary: "Weights, historical return, volatility, Sharpe ratio, drawdown and correlations from return series you enter.", status: "planned", planned: "V2" },
  { slug: "investment-return", title: "Investment Return Calculator", category: "Growth & personal finance", summary: "CAGR, IRR and money multiple for a series of cash flows.", status: "planned" },
  { slug: "break-even", title: "Break-even Analysis", category: "Growth & personal finance", summary: "Contribution margin, break-even volume and margin of safety.", status: "planned" },
  { slug: "lbo-simulator", title: "LBO Simulator", category: "Deals & advanced", summary: "Sources and uses, debt schedule, and sponsor IRR and MOIC.", status: "planned", planned: "V3" },
  { slug: "accretion-dilution", title: "Accretion / Dilution Calculator", category: "Deals & advanced", summary: "Pro forma EPS for cash, stock and debt-funded acquisitions.", status: "planned", planned: "V3" },
  { slug: "option-pricing", title: "Option Pricing Calculator", category: "Deals & advanced", summary: "Black–Scholes prices and Greeks for European options.", status: "planned", planned: "V3" },
  { slug: "statement-analyzer", title: "Financial Statement Analyzer", category: "Deals & advanced", summary: "Ratios, margins and cash conversion from statements you enter.", status: "planned", planned: "V3" },
];

export const TOOL_CATEGORIES: ToolCategory[] = ["Valuation", "Fixed income", "Growth & personal finance", "Portfolio", "Deals & advanced"];

export function getTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}
