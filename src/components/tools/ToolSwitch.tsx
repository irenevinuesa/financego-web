"use client";

import { BondTool } from "./BondTool";
import { CompoundTool } from "./CompoundTool";
import { DcfTool } from "./DcfTool";
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
    default:
      return null;
  }
}
