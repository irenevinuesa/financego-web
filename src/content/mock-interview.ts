/**
 * Mock interview: 50 short numeric questions in 5 levels of 10.
 * Every answer is a single number, so grading is simply right or wrong
 * (within a small tolerance). Each question has its own time limit.
 * Level titles, prompts and explanations are bilingual (EN/ES).
 */
import type { Bilingual, Lang } from "./types";

export interface MockQuestion {
  id: string;
  prompt: Bilingual;
  /** The correct answer, in the units shown next to the input. */
  answer: number;
  /** Absolute tolerance accepted around the answer. */
  tolerance: number;
  unit?: string;
  /** Seconds allowed for this question. */
  seconds: number;
  explanation: Bilingual;
}

export interface MockLevel {
  level: number;
  title: Bilingual;
  blurb: Bilingual;
  questions: MockQuestion[];
}

/** How a unit is written next to the answer box, per language. */
export const MOCK_UNIT_LABELS: Record<string, Bilingual> = {
  years: { en: "years", es: "años" },
};

export function mockUnitLabel(unit: string, lang: Lang): string {
  return MOCK_UNIT_LABELS[unit]?.[lang] ?? unit;
}

const q = (id: string, prompt: Bilingual, answer: number, seconds: number, explanation: Bilingual, unit?: string, tolerance = 0): MockQuestion => ({
  id,
  prompt,
  answer,
  tolerance,
  unit,
  seconds,
  explanation,
});

export const MOCK_LEVELS: MockLevel[] = [
  {
    level: 1,
    title: { en: "Warm-up", es: "Calentamiento" },
    blurb: { en: "Percentages, returns and quick mental maths.", es: "Porcentajes, rentabilidades y cálculo mental rápido." },
    questions: [
      q("m1-01", { en: "What is 15% of 240?", es: "¿Cuánto es el 15% de 240?" }, 36, 20, { en: "10% is 24 and 5% is 12, so 24 + 12 = 36.", es: "El 10% es 24 y el 5% es 12, así que 24 + 12 = 36." }),
      q(
        "m1-02",
        { en: "A stock rises from $40 to $50. What is the return?", es: "Una acción sube de $40 a $50. ¿Cuál es la rentabilidad?" },
        25,
        20,
        { en: "(50 − 40) / 40 = 25%.", es: "(50 − 40) / 40 = 25%." },
        "%",
      ),
      q(
        "m1-03",
        { en: "A stock falls 20% and then rises 20%. What is the net change?", es: "Una acción cae un 20% y luego sube un 20%. ¿Cuál es la variación neta?" },
        -4,
        30,
        { en: "0.8 × 1.2 = 0.96, so the stock is down 4%.", es: "0.8 × 1.2 = 0.96, así que la acción ha bajado un 4%." },
        "%",
      ),
      q(
        "m1-04",
        {
          en: "You invest $1,000 at 10% a year, compounded annually. What is it worth after 2 years?",
          es: "Inviertes $1,000 al 10% anual, con capitalización anual. ¿Cuánto vale al cabo de 2 años?",
        },
        1210,
        30,
        { en: "1,000 × 1.1² = 1,000 × 1.21 = 1,210.", es: "1,000 × 1.1² = 1,000 × 1.21 = 1,210." },
        "$",
      ),
      q(
        "m1-05",
        { en: "Revenue is $500m and the EBITDA margin is 30%. What is EBITDA?", es: "Las ventas son $500m y el margen EBITDA es del 30%. ¿Cuál es el EBITDA?" },
        150,
        20,
        { en: "500 × 30% = 150.", es: "500 × 30% = 150." },
        "$m",
      ),
      q("m1-06", { en: "What is 7 × 18?", es: "¿Cuánto es 7 × 18?" }, 126, 15, { en: "7 × 18 = 7 × 20 − 7 × 2 = 140 − 14 = 126.", es: "7 × 18 = 7 × 20 − 7 × 2 = 140 − 14 = 126." }),
      q(
        "m1-07",
        {
          en: "Using the rule of 72, roughly how many years does money take to double at 8% a year?",
          es: "Con la regla del 72, ¿en cuántos años, aproximadamente, se duplica el dinero al 8% anual?",
        },
        9,
        20,
        { en: "72 / 8 = 9 years.", es: "72 / 8 = 9 años." },
        "years",
      ),
      q(
        "m1-08",
        { en: "How much is 50 basis points, in percent?", es: "¿Cuánto son 50 puntos básicos, en porcentaje?" },
        0.5,
        15,
        { en: "1 basis point is 0.01%, so 50 bps = 0.5%.", es: "1 punto básico es el 0.01%, así que 50 pb = 0.5%." },
        "%",
      ),
      q(
        "m1-09",
        { en: "A share trades at $80 and EPS is $4. What is the P/E ratio?", es: "Una acción cotiza a $80 y el BPA (EPS) es $4. ¿Cuál es el P/E?" },
        20,
        20,
        { en: "80 / 4 = 20x.", es: "80 / 4 = 20x." },
        "x",
      ),
      q(
        "m1-10",
        { en: "Sales grow from $200m to $230m. What is the growth rate?", es: "Las ventas crecen de $200m a $230m. ¿Cuál es la tasa de crecimiento?" },
        15,
        20,
        { en: "(230 − 200) / 200 = 15%.", es: "(230 − 200) / 200 = 15%." },
        "%",
      ),
    ],
  },
  {
    level: 2,
    title: { en: "Accounting", es: "Contabilidad" },
    blurb: { en: "The three statements, in numbers.", es: "Los tres estados financieros, en números." },
    questions: [
      q(
        "m2-01",
        { en: "Revenue is 1,000, COGS is 600 and SG&A is 200. What is EBIT?", es: "Las ventas son 1,000, el COGS es 600 y los SG&A son 200. ¿Cuál es el EBIT?" },
        200,
        30,
        { en: "1,000 − 600 − 200 = 200.", es: "1,000 − 600 − 200 = 200." },
      ),
      q(
        "m2-02",
        {
          en: "EBIT is 200, interest expense is 50 and the tax rate is 25%. What is net income?",
          es: "El EBIT es 200, los gastos financieros son 50 y el tipo impositivo es del 25%. ¿Cuál es el beneficio neto?",
        },
        112.5,
        40,
        {
          en: "Pre-tax income is 150; tax is 37.5; net income is 112.5.",
          es: "El beneficio antes de impuestos es 150; los impuestos, 37.5; el beneficio neto, 112.5.",
        },
        undefined,
        0.1,
      ),
      q(
        "m2-03",
        {
          en: "Depreciation rises by $10 and the tax rate is 25%. By how much does net income change?",
          es: "La amortización sube $10 y el tipo impositivo es del 25%. ¿Cuánto varía el beneficio neto?",
        },
        -7.5,
        40,
        {
          en: "Pre-tax income falls by 10; tax falls by 2.5; net income falls by 7.5.",
          es: "El beneficio antes de impuestos cae 10; los impuestos bajan 2.5; el beneficio neto cae 7.5.",
        },
        "$",
        0.1,
      ),
      q(
        "m2-04",
        {
          en: "Depreciation rises by $10 and the tax rate is 25%. By how much does cash change?",
          es: "La amortización sube $10 y el tipo impositivo es del 25%. ¿Cuánto varía la caja?",
        },
        2.5,
        45,
        {
          en: "Net income falls 7.5, but the 10 of depreciation is added back: cash rises by 2.5 (the tax saving).",
          es: "El beneficio neto cae 7.5, pero se suman de vuelta los 10 de amortización: la caja sube 2.5 (el ahorro fiscal).",
        },
        "$",
        0.1,
      ),
      q(
        "m2-05",
        {
          en: "Net income is 100, D&A is 20 and net working capital increases by 15. What is cash flow from operations?",
          es: "El beneficio neto es 100, la D&A es 20 y el capital circulante neto aumenta 15. ¿Cuál es el flujo de caja operativo?",
        },
        105,
        30,
        { en: "100 + 20 − 15 = 105.", es: "100 + 20 − 15 = 105." },
      ),
      q(
        "m2-06",
        {
          en: "Cash flow from operations is 150 and capex is 60. What is free cash flow?",
          es: "El flujo de caja operativo es 150 y el capex es 60. ¿Cuál es el free cash flow?",
        },
        90,
        20,
        { en: "150 − 60 = 90.", es: "150 − 60 = 90." },
      ),
      q(
        "m2-07",
        {
          en: "Inventory rises by $30, all else equal. By how much does cash flow from operations change?",
          es: "Las existencias suben $30, todo lo demás igual. ¿Cuánto varía el flujo de caja operativo?",
        },
        -30,
        30,
        { en: "Building inventory uses cash: CFO falls by 30.", es: "Acumular existencias consume caja: el CFO cae 30." },
        "$",
      ),
      q(
        "m2-08",
        {
          en: "Total assets are 500 and total liabilities are 300. What is shareholders' equity?",
          es: "El activo total es 500 y el pasivo total es 300. ¿Cuál es el patrimonio neto?",
        },
        200,
        20,
        {
          en: "Assets = liabilities + equity, so equity = 500 − 300 = 200.",
          es: "Activo = pasivo + patrimonio neto, así que el patrimonio neto = 500 − 300 = 200.",
        },
      ),
      q(
        "m2-09",
        { en: "Revenue is 250 and the gross margin is 40%. What is gross profit?", es: "Las ventas son 250 y el margen bruto es del 40%. ¿Cuál es el beneficio bruto?" },
        100,
        20,
        { en: "250 × 40% = 100.", es: "250 × 40% = 100." },
      ),
      q(
        "m2-10",
        {
          en: "Opening retained earnings are 200, net income is 60 and dividends are 20. What are closing retained earnings?",
          es: "Las reservas (retained earnings) iniciales son 200, el beneficio neto es 60 y los dividendos son 20. ¿Cuáles son las reservas finales?",
        },
        240,
        30,
        { en: "200 + 60 − 20 = 240.", es: "200 + 60 − 20 = 240." },
      ),
    ],
  },
  {
    level: 3,
    title: { en: "Valuation", es: "Valoración" },
    blurb: { en: "Enterprise value, multiples, WACC and DCF.", es: "Enterprise value, múltiplos, WACC y DCF." },
    questions: [
      q(
        "m3-01",
        {
          en: "Equity value is 800, debt is 300 and cash is 100. What is enterprise value?",
          es: "El equity value es 800, la deuda es 300 y la caja es 100. ¿Cuál es el enterprise value?",
        },
        1000,
        30,
        { en: "EV = equity + debt − cash = 800 + 300 − 100 = 1,000.", es: "EV = equity + deuda − caja = 800 + 300 − 100 = 1,000." },
      ),
      q(
        "m3-02",
        {
          en: "Enterprise value is 1,200 and EBITDA is 150. What is the EV/EBITDA multiple?",
          es: "El enterprise value es 1,200 y el EBITDA es 150. ¿Cuál es el múltiplo EV/EBITDA?",
        },
        8,
        30,
        { en: "1,200 / 150 = 8x.", es: "1,200 / 150 = 8x." },
        "x",
      ),
      q(
        "m3-03",
        {
          en: "Peers trade at 10x EBITDA. The target has EBITDA of 80 and net debt of 200. What is its implied equity value?",
          es: "Las comparables cotizan a 10x EBITDA. La empresa objetivo tiene un EBITDA de 80 y una deuda neta de 200. ¿Cuál es su equity value implícito?",
        },
        600,
        45,
        { en: "EV = 10 × 80 = 800; equity = 800 − 200 = 600.", es: "EV = 10 × 80 = 800; equity = 800 − 200 = 600." },
      ),
      q(
        "m3-04",
        {
          en: "Risk-free rate 4%, beta 1.2, equity risk premium 5%. What is the cost of equity (CAPM)?",
          es: "Tipo libre de riesgo 4%, beta 1.2, prima de riesgo de mercado 5%. ¿Cuál es el coste del equity (CAPM)?",
        },
        10,
        40,
        { en: "4% + 1.2 × 5% = 10%.", es: "4% + 1.2 × 5% = 10%." },
        "%",
      ),
      q(
        "m3-05",
        {
          en: "60% equity at a 10% cost, 40% debt at a 5% pre-tax cost, 25% tax rate. What is the WACC?",
          es: "60% equity con un coste del 10%, 40% deuda con un coste antes de impuestos del 5%, tipo impositivo del 25%. ¿Cuál es el WACC?",
        },
        7.5,
        60,
        { en: "0.6 × 10% + 0.4 × 5% × (1 − 25%) = 6% + 1.5% = 7.5%.", es: "0.6 × 10% + 0.4 × 5% × (1 − 25%) = 6% + 1.5% = 7.5%." },
        "%",
        0.05,
      ),
      q(
        "m3-06",
        {
          en: "Next year's free cash flow is 100, WACC is 10% and long-term growth is 2%. What is the terminal value (Gordon growth)?",
          es: "El free cash flow del próximo año es 100, el WACC es del 10% y el crecimiento a largo plazo es del 2%. ¿Cuál es el valor terminal (Gordon growth)?",
        },
        1250,
        45,
        { en: "100 / (10% − 2%) = 1,250.", es: "100 / (10% − 2%) = 1,250." },
      ),
      q(
        "m3-07",
        {
          en: "What is a perpetuity of $50 a year worth at a 5% discount rate?",
          es: "¿Cuánto vale una perpetuidad de $50 al año con una tasa de descuento del 5%?",
        },
        1000,
        30,
        { en: "50 / 5% = 1,000.", es: "50 / 5% = 1,000." },
        "$",
      ),
      q(
        "m3-08",
        {
          en: "What is the present value of $121 received in 2 years at a 10% discount rate?",
          es: "¿Cuál es el valor actual de $121 que recibirás dentro de 2 años, con una tasa de descuento del 10%?",
        },
        100,
        40,
        { en: "121 / 1.1² = 121 / 1.21 = 100.", es: "121 / 1.1² = 121 / 1.21 = 100." },
        "$",
      ),
      q(
        "m3-09",
        {
          en: "Equity value is $500m and there are 25m shares. What is the share price?",
          es: "El equity value es $500m y hay 25m de acciones. ¿Cuál es el precio por acción?",
        },
        20,
        20,
        { en: "500 / 25 = $20.", es: "500 / 25 = $20." },
        "$",
      ),
      q(
        "m3-10",
        {
          en: "Final-year EBITDA is 120 and the exit multiple is 9x. What is the terminal value?",
          es: "El EBITDA del último año es 120 y el múltiplo de salida es 9x. ¿Cuál es el valor terminal?",
        },
        1080,
        30,
        { en: "120 × 9 = 1,080.", es: "120 × 9 = 1,080." },
      ),
    ],
  },
  {
    level: 4,
    title: { en: "Deals and LBOs", es: "Operaciones y LBOs" },
    blurb: { en: "Returns, accretion/dilution and deal maths.", es: "Retornos, accretion/dilution y números de operaciones." },
    questions: [
      q(
        "m4-01",
        { en: "A sponsor invests 100 and receives 300 at exit. What is the MOIC?", es: "Un sponsor invierte 100 y recibe 300 en la salida. ¿Cuál es el MOIC?" },
        3,
        25,
        { en: "300 / 100 = 3.0x.", es: "300 / 100 = 3.0x." },
        "x",
        0.01,
      ),
      q(
        "m4-02",
        { en: "An investment returns 2x in 3 years. Roughly what is the IRR?", es: "Una inversión devuelve 2x en 3 años. ¿Cuál es, aproximadamente, la IRR?" },
        26,
        45,
        { en: "2^(1/3) ≈ 1.26, so the IRR is about 26%.", es: "2^(1/3) ≈ 1.26, así que la IRR es de alrededor del 26%." },
        "%",
        1,
      ),
      q(
        "m4-03",
        { en: "An investment returns 2x in 5 years. Roughly what is the IRR?", es: "Una inversión devuelve 2x en 5 años. ¿Cuál es, aproximadamente, la IRR?" },
        15,
        45,
        { en: "2^(1/5) ≈ 1.149, so the IRR is about 15%.", es: "2^(1/5) ≈ 1.149, así que la IRR es de alrededor del 15%." },
        "%",
        1,
      ),
      q(
        "m4-04",
        {
          en: "A company is bought for 1,000 with 60% debt. How big is the sponsor's equity cheque?",
          es: "Se compra una empresa por 1,000 con un 60% de deuda. ¿De cuánto es el equity cheque del sponsor?",
        },
        400,
        30,
        { en: "Equity = 40% × 1,000 = 400.", es: "Equity = 40% × 1,000 = 400." },
      ),
      q(
        "m4-05",
        {
          en: "Bought at 8x EBITDA of 100 with 500 of debt. Exit after 5 years at 8x EBITDA of 150 with 200 of net debt. What is the MOIC?",
          es: "Compra a 8x un EBITDA de 100 con 500 de deuda. Salida a los 5 años a 8x un EBITDA de 150 con 200 de deuda neta. ¿Cuál es el MOIC?",
        },
        3.33,
        75,
        {
          en: "Entry equity = 800 − 500 = 300. Exit equity = 1,200 − 200 = 1,000. MOIC = 1,000 / 300 ≈ 3.33x.",
          es: "Equity de entrada = 800 − 500 = 300. Equity de salida = 1,200 − 200 = 1,000. MOIC = 1,000 / 300 ≈ 3.33x.",
        },
        "x",
        0.05,
      ),
      q(
        "m4-06",
        {
          en: "An acquirer has net income of 100 and 50 shares. It issues 10 new shares to buy a target with net income of 30. What is pro forma EPS?",
          es: "Un comprador tiene un beneficio neto de 100 y 50 acciones. Emite 10 acciones nuevas para comprar una empresa con un beneficio neto de 30. ¿Cuál es el EPS pro forma?",
        },
        2.17,
        60,
        { en: "(100 + 30) / (50 + 10) = 130 / 60 ≈ 2.17.", es: "(100 + 30) / (50 + 10) = 130 / 60 ≈ 2.17." },
        "$",
        0.01,
      ),
      q(
        "m4-07",
        {
          en: "Standalone EPS is $2.00 and pro forma EPS is $2.10. What is the accretion?",
          es: "El EPS standalone es $2.00 y el EPS pro forma es $2.10. ¿Cuál es la accretion?",
        },
        5,
        30,
        { en: "(2.10 − 2.00) / 2.00 = 5%.", es: "(2.10 − 2.00) / 2.00 = 5%." },
        "%",
      ),
      q(
        "m4-08",
        {
          en: "A stock trades at $30 and the offer is $36 a share. What is the premium?",
          es: "Una acción cotiza a $30 y la oferta es de $36 por acción. ¿Cuál es la prima?",
        },
        20,
        25,
        { en: "(36 − 30) / 30 = 20%.", es: "(36 − 30) / 30 = 20%." },
        "%",
      ),
      q(
        "m4-09",
        {
          en: "Cost synergies are 20 a year before tax, the tax rate is 25% and they are capitalised at 10x. What are they worth?",
          es: "Las sinergias de costes son 20 al año antes de impuestos, el tipo impositivo es del 25% y se capitalizan a 10x. ¿Cuánto valen?",
        },
        150,
        60,
        { en: "20 × (1 − 25%) × 10 = 150.", es: "20 × (1 − 25%) × 10 = 150." },
      ),
      q(
        "m4-10",
        {
          en: "Debt of 400 costs 6% interest and the tax rate is 25%. What is the after-tax interest cost per year?",
          es: "Una deuda de 400 paga un 6% de interés y el tipo impositivo es del 25%. ¿Cuál es el coste anual de los intereses después de impuestos?",
        },
        18,
        40,
        { en: "400 × 6% = 24; after tax 24 × 0.75 = 18.", es: "400 × 6% = 24; después de impuestos, 24 × 0.75 = 18." },
      ),
    ],
  },
  {
    level: 5,
    title: { en: "Markets and quant", es: "Mercados y quant" },
    blurb: { en: "Bonds, probability and portfolio maths.", es: "Bonos, probabilidad y matemáticas de carteras." },
    questions: [
      q(
        "m5-01",
        {
          en: "A bond has a modified duration of 6. Yields rise by 50 bps. Roughly how much does its price change?",
          es: "Un bono tiene una duration modificada de 6. Las yields suben 50 pb. ¿Cuánto varía su precio, aproximadamente?",
        },
        -3,
        45,
        { en: "−6 × 0.5% = −3%.", es: "−6 × 0.5% = −3%." },
        "%",
        0.05,
      ),
      q(
        "m5-02",
        {
          en: "A 2-year zero-coupon bond has a face value of 1,000 and yields 5%. What is its price?",
          es: "Un bono cupón cero a 2 años tiene un nominal de 1,000 y una yield del 5%. ¿Cuál es su precio?",
        },
        907,
        75,
        { en: "1,000 / 1.05² = 1,000 / 1.1025 ≈ 907.", es: "1,000 / 1.05² = 1,000 / 1.1025 ≈ 907." },
        "$",
        1,
      ),
      q(
        "m5-03",
        {
          en: "A bond with a 6% coupon trades at par. What is its yield to maturity?",
          es: "Un bono con un cupón del 6% cotiza a la par. ¿Cuál es su yield to maturity?",
        },
        6,
        20,
        { en: "At par, yield to maturity equals the coupon rate: 6%.", es: "A la par, la yield to maturity es igual al cupón: 6%." },
        "%",
      ),
      q(
        "m5-04",
        {
          en: "A trade has a 30% chance of making 200 and a 70% chance of losing 50. What is its expected value?",
          es: "Una operación tiene un 30% de probabilidad de ganar 200 y un 70% de perder 50. ¿Cuál es su valor esperado?",
        },
        25,
        40,
        { en: "0.3 × 200 − 0.7 × 50 = 60 − 35 = 25.", es: "0.3 × 200 − 0.7 × 50 = 60 − 35 = 25." },
      ),
      q(
        "m5-05",
        { en: "You roll two dice. What is the probability that they sum to 7?", es: "Lanzas dos dados. ¿Cuál es la probabilidad de que sumen 7?" },
        16.67,
        45,
        {
          en: "6 of the 36 outcomes sum to 7: 6/36 = 1/6 ≈ 16.67%.",
          es: "6 de los 36 resultados suman 7: 6/36 = 1/6 ≈ 16.67%.",
        },
        "%",
        0.1,
      ),
      q(
        "m5-06",
        {
          en: "A portfolio is 60% in an asset returning 10% and 40% in one returning 5%. What is the expected return?",
          es: "Una cartera tiene un 60% en un activo que rinde un 10% y un 40% en otro que rinde un 5%. ¿Cuál es la rentabilidad esperada?",
        },
        8,
        30,
        { en: "0.6 × 10% + 0.4 × 5% = 6% + 2% = 8%.", es: "0.6 × 10% + 0.4 × 5% = 6% + 2% = 8%." },
        "%",
      ),
      q(
        "m5-07",
        {
          en: "A call costs 5, the stock is at 100, the strike is 100 and rates are zero. What is the put worth (put-call parity)?",
          es: "Una call cuesta 5, la acción está a 100, el strike es 100 y los tipos son cero. ¿Cuánto vale la put (put-call parity)?",
        },
        5,
        45,
        { en: "C − P = S − K = 0, so the put is also worth 5.", es: "C − P = S − K = 0, así que la put también vale 5." },
      ),
      q(
        "m5-08",
        {
          en: "A fund returns 12% with 20% volatility and the risk-free rate is 2%. What is its Sharpe ratio?",
          es: "Un fondo rinde un 12% con una volatilidad del 20% y el tipo libre de riesgo es del 2%. ¿Cuál es su Sharpe ratio?",
        },
        0.5,
        40,
        { en: "(12% − 2%) / 20% = 0.5.", es: "(12% − 2%) / 20% = 0.5." },
        undefined,
        0.01,
      ),
      q(
        "m5-09",
        { en: "EUR/USD is 1.10. How many euros do you get for $550?", es: "El EUR/USD está en 1.10. ¿Cuántos euros obtienes por $550?" },
        500,
        30,
        { en: "550 / 1.10 = €500.", es: "550 / 1.10 = €500." },
        "€",
      ),
      q(
        "m5-10",
        {
          en: "The nominal return is 7% and inflation is 3%. Roughly what is the real return?",
          es: "La rentabilidad nominal es del 7% y la inflación del 3%. ¿Cuál es, aproximadamente, la rentabilidad real?",
        },
        4,
        25,
        {
          en: "Approximately 7% − 3% = 4% (exactly 1.07 / 1.03 − 1 ≈ 3.9%).",
          es: "Aproximadamente 7% − 3% = 4% (exactamente, 1.07 / 1.03 − 1 ≈ 3.9%).",
        },
        "%",
        0.15,
      ),
    ],
  },
];

export const MOCK_QUESTIONS: MockQuestion[] = MOCK_LEVELS.flatMap((l) => l.questions);
