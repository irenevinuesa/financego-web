"use client";

import type { WidgetId } from "@/content/types";
import { CashConversion, DepreciationWalk } from "./widgets/accounting";
import { CompsRange } from "./widgets/comps";
import { PriceYield, RateShock, YieldCurve } from "./widgets/fixed-income";
import { Diversification, PvExplorer, RoicGrowth } from "./widgets/foundations";
import { AccretionDilution, DealValue } from "./widgets/ma";
import { EvBridge, FcfBuild, SensitivityGrid, TerminalValue, WaccEv } from "./widgets/valuation";

const WIDGETS: Record<WidgetId, () => React.JSX.Element> = {
  "pv-explorer": PvExplorer,
  diversification: Diversification,
  "roic-growth": RoicGrowth,
  "depreciation-walk": DepreciationWalk,
  "cash-conversion": CashConversion,
  "fcf-build": FcfBuild,
  "wacc-ev": () => <WaccEv />,
  "terminal-value": TerminalValue,
  "ev-bridge": EvBridge,
  "sensitivity-grid": SensitivityGrid,
  "price-yield": PriceYield,
  "rate-shock": RateShock,
  "yield-curve": YieldCurve,
  "comps-range": CompsRange,
  "deal-value": DealValue,
  "accretion-dilution": AccretionDilution,
};

export function LessonWidget({ id }: { id: WidgetId }) {
  const W = WIDGETS[id];
  return <W />;
}
