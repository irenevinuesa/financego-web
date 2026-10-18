import { Briefcase, Building, ChartLine, Compass, FileText, Globe, Landmark, LayoutGrid, Layers, Mountain, Percent, Puzzle, Scale, Shield, Sigma, TrendingUp, type LucideIcon } from "lucide-react";

/** Icon per Practice section (topic id). Unknown sections fall back to a generic icon. */
const ICONS: Record<string, LucideIcon> = {
  accounting: FileText,
  "corporate-finance": Building,
  valuation: ChartLine,
  ma: Briefcase,
  lbo: Mountain,
  "capital-markets": Landmark,
  industries: LayoutGrid,
  restructuring: Scale,
  markets: TrendingUp,
  "fixed-income": Percent,
  derivatives: Layers,
  macro: Globe,
  "credit-risk": Shield,
  quant: Sigma,
  "brain-teasers": Puzzle,
  strategy: Compass,
};

export function sectionIcon(topic: string): LucideIcon {
  return ICONS[topic] ?? FileText;
}

/** Display order for sections: core IB technicals first, then markets, then quantitative and cases. */
export const SECTION_ORDER = [
  "accounting",
  "valuation",
  "corporate-finance",
  "ma",
  "lbo",
  "capital-markets",
  "industries",
  "restructuring",
  "markets",
  "fixed-income",
  "derivatives",
  "macro",
  "credit-risk",
  "quant",
  "brain-teasers",
  "strategy",
];
