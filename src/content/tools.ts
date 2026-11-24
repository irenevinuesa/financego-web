import type { Lang, LessonRef, TopicId } from "./types";

export type ToolCategory = "Valuation" | "Fixed income" | "Growth & personal finance" | "Portfolio" | "Deals & advanced";

export interface ToolMeta {
  slug: string;
  title: Record<Lang, string>;
  category: ToolCategory;
  summary: Record<Lang, string>;
  status: "available" | "planned";
  /** Roadmap version for planned tools, when the spec assigns one. */
  planned?: "V2" | "V3";
  lesson?: LessonRef;
  practiceTopic?: TopicId;
}

export const TOOLS: ToolMeta[] = [
  {
    slug: "wacc",
    title: { en: "WACC Calculator", es: "Calculadora de WACC" },
    category: "Valuation",
    summary: { en: "Cost of equity with CAPM, after-tax cost of debt and WACC, with a sensitivity chart.", es: "Coste del equity con CAPM, coste de la deuda después de impuestos y WACC, con un gráfico de sensibilidad." },
    status: "available",
    lesson: { courseId: "dcf", lessonId: "wacc" },
    practiceTopic: "valuation",
  },
  {
    slug: "dcf",
    title: { en: "DCF Builder", es: "Constructor de DCF" },
    category: "Valuation",
    summary: { en: "Five-year unlevered DCF: free cash flow, terminal value, enterprise and equity value, value per share and a sensitivity table.", es: "DCF unlevered a cinco años: free cash flow, valor terminal, enterprise value y equity value, valor por acción y una tabla de sensibilidad." },
    status: "available",
    lesson: { courseId: "dcf", lessonId: "dcf-intuition" },
    practiceTopic: "valuation",
  },
  {
    slug: "compound-interest",
    title: { en: "Compound Interest Calculator", es: "Calculadora de interés compuesto" },
    category: "Growth & personal finance",
    summary: { en: "Grow a lump sum and regular contributions, with any compounding frequency and an inflation adjustment.", es: "Haz crecer un capital inicial y aportaciones periódicas, con cualquier frecuencia de capitalización y ajuste por inflación." },
    status: "available",
    lesson: { courseId: "finance-101", lessonId: "time-value-of-money" },
    practiceTopic: "corporate-finance",
  },
  {
    slug: "bond-pricing",
    title: { en: "Bond Pricing Calculator", es: "Calculadora de precio de bonos" },
    category: "Fixed income",
    summary: { en: "Price, Macaulay and modified duration, convexity, DV01 and the price-yield curve.", es: "Precio, duración de Macaulay y modificada, convexidad, DV01 y la curva precio-rentabilidad." },
    status: "available",
    lesson: { courseId: "finance-101", lessonId: "time-value-of-money" },
    practiceTopic: "fixed-income",
  },
  {
    slug: "paper-lbo",
    title: { en: "Paper LBO", es: "Paper LBO" },
    category: "Deals & advanced",
    summary: { en: "The buyout you are asked to run by hand in PE interviews: free cash flow, debt paydown, exit equity, MOIC, IRR and the maximum price for a target return.", es: "El buyout que te piden resolver a mano en entrevistas de PE: free cash flow, amortización de deuda, equity a la salida, MOIC, IRR y el precio máximo para una rentabilidad objetivo." },
    status: "available",
    practiceTopic: "lbo",
  },
  {
    slug: "trading-comps",
    title: { en: "Trading Comparables", es: "Trading comps" },
    category: "Valuation",
    summary: { en: "An editable peer table with EV/Revenue, EV/EBITDA and P/E, their quartiles, and the implied share price range for a target.", es: "Una tabla editable de comparables con EV/Revenue, EV/EBITDA y P/E, sus cuartiles y el rango de precio por acción implícito para una target." },
    status: "available",
    lesson: { courseId: "trading-comps", lessonId: "implied-valuation" },
    practiceTopic: "valuation",
  },
  {
    slug: "portfolio-analytics",
    title: { en: "Portfolio Risk & Return", es: "Riesgo y rentabilidad de cartera" },
    category: "Portfolio",
    summary: { en: "Mix two assets and see expected return, volatility, the diversification benefit, the minimum-risk mix and the Sharpe ratio.", es: "Combina dos activos y observa la rentabilidad esperada, la volatilidad, el beneficio de la diversificación, la combinación de mínimo riesgo y el ratio de Sharpe." },
    status: "available",
    practiceTopic: "quant",
  },
  {
    slug: "investment-return",
    title: { en: "Investment Return Calculator", es: "Calculadora de rentabilidad de inversiones" },
    category: "Growth & personal finance",
    summary: { en: "IRR, NPV, MOIC, CAGR and payback for any series of cash flows.", es: "IRR, NPV, MOIC, CAGR y payback para cualquier serie de flujos de caja." },
    status: "available",
    lesson: { courseId: "finance-101", lessonId: "time-value-of-money" },
    practiceTopic: "corporate-finance",
  },
  {
    slug: "break-even",
    title: { en: "Break-even Analysis", es: "Análisis del punto muerto" },
    category: "Growth & personal finance",
    summary: { en: "Contribution margin, break-even volume and revenue, margin of safety, operating leverage and a cost–volume–profit chart.", es: "Margen de contribución, volumen e ingresos de punto muerto, margen de seguridad, apalancamiento operativo y un gráfico coste–volumen–beneficio." },
    status: "available",
    practiceTopic: "corporate-finance",
  },
  { slug: "lbo-simulator", title: { en: "LBO Simulator", es: "Simulador de LBO" }, category: "Deals & advanced", summary: { en: "Sources and uses, debt schedule, and sponsor IRR and MOIC.", es: "Sources and uses, calendario de deuda e IRR y MOIC del sponsor." }, status: "planned", planned: "V3" },
  {
    slug: "accretion-dilution",
    title: { en: "Accretion / Dilution Calculator", es: "Calculadora de accretion / dilution" },
    category: "Deals & advanced",
    summary: { en: "Pro forma EPS for stock, debt and cash-funded acquisitions, with synergies and the synergies needed to break even.", es: "EPS pro forma para adquisiciones financiadas con acciones, deuda o caja, con sinergias y las sinergias necesarias para el break-even." },
    status: "available",
    lesson: { courseId: "ma-fundamentals", lessonId: "accretion-dilution" },
    practiceTopic: "ma",
  },
  {
    slug: "option-pricing",
    title: { en: "Option Pricing Calculator", es: "Calculadora de valoración de opciones" },
    category: "Deals & advanced",
    summary: { en: "Black–Scholes call and put prices, the Greeks, put–call parity and the payoff at expiry.", es: "Precios de calls y puts con Black–Scholes, las griegas, la paridad put–call y el payoff al vencimiento." },
    status: "available",
    practiceTopic: "derivatives",
  },
  { slug: "statement-analyzer", title: { en: "Financial Statement Analyzer", es: "Analizador de estados financieros" }, category: "Deals & advanced", summary: { en: "Ratios, margins and cash conversion from statements you enter.", es: "Ratios, márgenes y conversión de caja a partir de los estados financieros que introduzcas." }, status: "planned", planned: "V3" },
];

export const TOOL_CATEGORIES: ToolCategory[] = ["Valuation", "Fixed income", "Growth & personal finance", "Portfolio", "Deals & advanced"];

/** Display labels for the categories (the ids above stay English in code). */
export const TOOL_CATEGORY_LABELS: Record<ToolCategory, Record<Lang, string>> = {
  Valuation: { en: "Valuation", es: "Valoración" },
  "Fixed income": { en: "Fixed income", es: "Renta fija" },
  "Growth & personal finance": { en: "Growth & personal finance", es: "Crecimiento y finanzas personales" },
  Portfolio: { en: "Portfolio", es: "Carteras" },
  "Deals & advanced": { en: "Deals & advanced", es: "Deals y avanzado" },
};

export function getTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}
