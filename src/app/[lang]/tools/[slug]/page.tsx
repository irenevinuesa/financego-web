import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, TOOL_CATEGORY_LABELS, TOOLS } from "@/content/tools";
import type { Lang } from "@/lib/i18n";
import { getLang } from "@/lib/server-lang";
import { PageHeader } from "@/components/layout/PageHeader";
import { ToolSwitch } from "@/components/tools/ToolSwitch";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.filter((t) => t.status === "available").map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLang();
  const t = getTool(slug);
  return { title: t?.title[lang] ?? (lang === "es" ? "Herramienta" : "Tool"), description: t?.summary[lang] };
}

const INTROS: Record<string, Record<Lang, string>> = {
  wacc: {
    en: "The weighted average cost of capital is the blended return a company's investors require. It is the discount rate in an unlevered DCF, so small changes here move valuations a lot.",
    es: "El coste medio ponderado del capital es la rentabilidad combinada que exigen los inversores de una empresa. Es la tasa de descuento de un DCF unlevered, así que pequeños cambios aquí mueven mucho las valoraciones.",
  },
  dcf: {
    en: "Build a five-year unlevered DCF: forecast free cash flow, add a terminal value, discount at WACC, and bridge to equity value per share. Then stress-test it.",
    es: "Construye un DCF unlevered a cinco años: proyecta el free cash flow, añade un valor terminal, descuenta al WACC y llega al equity value por acción. Después, ponlo a prueba.",
  },
  "compound-interest": {
    en: "See how a starting amount and regular contributions grow when returns compound, and what the result is worth after inflation.",
    es: "Mira cómo crecen un capital inicial y unas aportaciones periódicas cuando la rentabilidad se capitaliza, y cuánto vale el resultado descontando la inflación.",
  },
  "accretion-dilution": {
    en: "Will the deal raise or lower the acquirer's earnings per share? Set the price, how it is paid for and the synergies, and see the EPS impact of each currency.",
    es: "¿La operación sube o baja el beneficio por acción del comprador? Fija el precio, cómo se paga y las sinergias, y mira el impacto en el EPS de cada forma de pago.",
  },
  "trading-comps": {
    en: "Value a company by what the market pays for similar ones. Enter a peer group, read the multiples and their quartiles, and turn them into a share price range for your target.",
    es: "Valora una empresa por lo que el mercado paga por otras similares. Introduce un grupo de comparables, lee los múltiplos y sus cuartiles y conviértelos en un rango de precio por acción para tu target.",
  },
  "investment-return": {
    en: "Enter what you invest and what you get back, year by year, to see the IRR, NPV, money multiple, CAGR and payback period.",
    es: "Introduce lo que inviertes y lo que recibes, año a año, para ver el IRR, el NPV, el múltiplo sobre el capital, el CAGR y el periodo de payback.",
  },
  "option-pricing": {
    en: "Price a European call or put with Black–Scholes, read its Greeks and see how its value changes with the stock price.",
    es: "Valora una call o una put europea con Black–Scholes, lee sus griegas y mira cómo cambia su valor con el precio de la acción.",
  },
  "break-even": {
    en: "How many units do you need to sell to cover your costs? Find the break-even point, the margin of safety and how sensitive profit is to volume.",
    es: "¿Cuántas unidades necesitas vender para cubrir tus costes? Calcula el punto muerto, el margen de seguridad y la sensibilidad del beneficio al volumen.",
  },
  "portfolio-analytics": {
    en: "Combine two assets and see why diversification lowers risk without lowering expected return, and which mix gives the lowest risk or the best Sharpe ratio.",
    es: "Combina dos activos y comprueba por qué la diversificación reduce el riesgo sin reducir la rentabilidad esperada, y qué combinación da el menor riesgo o el mejor ratio de Sharpe.",
  },
  "paper-lbo": {
    en: "A sponsor buys a company with mostly borrowed money, uses its cash flow to repay the debt and sells it a few years later. Run the numbers the way you would on paper in an interview: what the equity is worth at exit, the MOIC and the IRR.",
    es: "Un sponsor compra una empresa con mucha deuda, usa su caja para amortizarla y la vende unos años después. Haz los números como los harías en papel en una entrevista: cuánto vale el equity a la salida, el MOIC y el IRR.",
  },
  "bond-pricing": {
    en: "Price a fixed-coupon bond from its yield, then measure its interest-rate sensitivity with duration, convexity and DV01.",
    es: "Calcula el precio de un bono de cupón fijo a partir de su rentabilidad y mide su sensibilidad a los tipos de interés con la duración, la convexidad y el DV01.",
  },
};

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const tool = getTool(slug);
  if (!tool || tool.status !== "available") notFound();
  return (
    <>
      <PageHeader
        eyebrow={`Tools · ${TOOL_CATEGORY_LABELS[tool.category][lang]}`}
        title={tool.title[lang]}
        description={<p>{INTROS[slug]?.[lang]}</p>}
        crumbs={[
          { href: "/", label: lang === "es" ? "Inicio" : "Home" },
          { href: "/tools/", label: "Tools" },
          { label: tool.title[lang] },
        ]}
      />
      <div className="container-page mt-10">
        <ToolSwitch slug={slug} />
      </div>
    </>
  );
}
