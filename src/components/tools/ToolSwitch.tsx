"use client";

import { AccretionTool } from "./AccretionTool";
import { BondTool } from "./BondTool";
import { BreakEvenTool } from "./BreakEvenTool";
import { CompsTool } from "./CompsTool";
import { CompoundTool } from "./CompoundTool";
import { DcfTool } from "./DcfTool";
import { OptionTool } from "./OptionTool";
import { PaperLboTool } from "./PaperLboTool";
import { PortfolioTool } from "./PortfolioTool";
import { ReturnTool } from "./ReturnTool";
import { WaccTool } from "./WaccTool";

export function ToolSwitch({ slug }: { slug: string }) {
  switch (slug) {
    case "wacc":
      return <WaccTool />;
    case "dcf":
      return <DcfTool />;
    case "compound-interest":
      return <CompoundTool />;
    case "bond-pricing":
      return <BondTool />;
    case "paper-lbo":
      return <PaperLboTool />;
    case "accretion-dilution":
      return <AccretionTool />;
    case "trading-comps":
      return <CompsTool />;
    case "investment-return":
      return <ReturnTool />;
    case "option-pricing":
      return <OptionTool />;
    case "break-even":
      return <BreakEvenTool />;
    case "portfolio-analytics":
      return <PortfolioTool />;
    default:
      return null;
  }
}
