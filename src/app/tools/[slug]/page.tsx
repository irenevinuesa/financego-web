import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, TOOLS } from "@/content/tools";
import { PageHeader } from "@/components/layout/PageHeader";
import { ToolSwitch } from "@/components/tools/ToolSwitch";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.filter((t) => t.status === "available").map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = getTool(slug);
  return { title: t?.title ?? "Tool", description: t?.summary };
}

const INTROS: Record<string, string> = {
  wacc: "The weighted average cost of capital is the blended return a company's investors require. It is the discount rate in an unlevered DCF, so small changes here move valuations a lot.",
  dcf: "Build a five-year unlevered DCF: forecast free cash flow, add a terminal value, discount at WACC, and bridge to equity value per share. Then stress-test it.",
  "compound-interest": "See how a starting amount and regular contributions grow when returns compound, and what the result is worth after inflation.",
  "bond-pricing": "Price a fixed-coupon bond from its yield, then measure its interest-rate sensitivity with duration, convexity and DV01.",
};

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool || tool.status !== "available") notFound();
  return (
    <>
      <PageHeader
        eyebrow={`Tools · ${tool.category}`}
        title={tool.title}
        description={<p>{INTROS[slug]}</p>}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/tools/", label: "Tools" },
          { label: tool.title },
        ]}
      />
      <div className="container-page mt-10">
        <ToolSwitch slug={slug} />
      </div>
    </>
  );
}
