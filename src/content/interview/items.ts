import type { Bilingual, InterviewConcept, InterviewItem } from "../types";

/*
 * Scripted interview items for the MVP simulator. Each item has a main question,
 * concept patterns used for transparent rule-based checks, and two scripted
 * follow-ups: a deeper one when the first answer covers the key ideas, and a
 * probing one when it does not. Patterns are matched against the answer in
 * lower case with accents removed, so Spanish patterns are written without accents.
 */

const b = (en: string, es: string): Bilingual => ({ en, es });
const c = (id: string, en: string, es: string, patterns: string[], key = false): InterviewConcept => ({
  id,
  label: b(en, es),
  patterns,
  key,
});

const DOWN = ["decreas", "fall", "lower", "drop", "declin", "reduc", "go(es)? down", "less", "baja", "disminu", "\\bcae", "caer", "menor", "descien", "desciend"];
const UP = ["increas", "\\brise", "\\brises", "higher", "go(es)? up", "grow", "sube", "subir", "aument", "mayor", "crece", "incremen"];
const BECAUSE_DISCOUNT = ["discount", "present value", "\\bpv\\b", "denominator", "descuent", "valor presente", "valor actual", "actualiz", "denominador"];

export const INTERVIEW_ITEMS: InterviewItem[] = [
  /* ───────────── Valuation & corporate finance ───────────── */
  {
    id: "iv-dcf-wacc",
    format: "technical",
    topics: ["valuation"],
    tracks: ["investment-banking", "private-equity", "equity-research", "hedge-funds", "asset-management", "corporate-finance"],
    difficulty: "Beginner",
    prompt: b("What happens to a DCF valuation if the WACC increases?", "¿Qué le ocurre a una valoración por DCF si aumenta el WACC?"),
    concepts: [
      c("direction", "Valuation decreases", "La valoración disminuye", DOWN, true),
      c("discounting", "Higher discount rate lowers present values", "Una tasa de descuento mayor reduce el valor presente", BECAUSE_DISCOUNT),
      c("terminal", "Terminal value is hit hardest", "El valor terminal es el más afectado", ["terminal", "perpetu", "gordon"]),
    ],
    minConcepts: 1,
    followUp: {
      deeper: b(
        "Correct. Why might a 100-basis-point increase in WACC produce a disproportionately large decline in terminal value?",
        "Correcto. ¿Por qué un aumento de 100 puntos básicos en el WACC puede provocar una caída desproporcionada del valor terminal?",
      ),
      probe: b(
        "Let's think it through. In a DCF, how is the WACC used, and what does a higher rate do to the present value of each future cash flow?",
        "Pensémoslo. En un DCF, ¿cómo se usa el WACC y qué efecto tiene una tasa más alta sobre el valor presente de cada flujo futuro?",
      ),
      concepts: [
        c("spread", "TV depends on the small spread WACC − g", "El VT depende del pequeño diferencial WACC − g", ["spread", "wacc ?- ?g", "minus g", "denominator", "diferencial", "denominador", "menos g", "1 ?/ ?\\(?wacc"], true),
        c("compound", "TV is also discounted over the whole forecast", "El VT además se descuenta durante todo el horizonte", ["discount", "years", "compound", "descuent", "anos", "periodo", "horizonte"]),
        c("share", "TV is usually most of enterprise value", "El VT suele ser la mayor parte del valor empresa", ["most of", "majority", "large (share|part|portion)", "% of (the )?(ev|value)", "mayor parte", "mayoria", "gran parte", "porcentaje"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "The valuation falls. The WACC is the discount rate, so a higher WACC lowers the present value of every future cash flow, and the effect grows with distance, so the terminal value is hit hardest.",
      "La valoración cae. El WACC es la tasa de descuento, así que un WACC mayor reduce el valor presente de todos los flujos futuros, y el efecto crece con la distancia, por lo que el valor terminal es el más afectado.",
    ),
    followUpModelAnswer: b(
      "Terminal value under the Gordon growth method is FCF × (1 + g) / (WACC − g). The spread WACC − g is small, say 9% − 3% = 6%, so a 1-point increase to 7% cuts TV by about 14% from the denominator alone. The higher rate then also discounts that smaller TV over every year of the forecast, and since TV is often 60–80% of EV, the total valuation falls sharply.",
      "Con el método de Gordon, el valor terminal es FCF × (1 + g) / (WACC − g). El diferencial WACC − g es pequeño, por ejemplo 9% − 3% = 6%, así que subir un punto hasta el 7% reduce el VT un 14% solo por el denominador. Además, la tasa más alta descuenta ese VT menor durante todos los años de la proyección, y como el VT suele ser el 60–80% del valor empresa, la valoración cae con fuerza.",
    ),
    lesson: { courseId: "dcf", lessonId: "terminal-value" },
  },
  {
    id: "iv-walk-dcf",
    format: "technical",
    topics: ["valuation"],
    tracks: ["investment-banking", "private-equity", "equity-research", "corporate-finance", "hedge-funds"],
    difficulty: "Beginner",
    prompt: b("Walk me through a DCF.", "Explícame cómo se hace un DCF."),
    concepts: [
      c("forecast", "Project the operating forecast", "Proyectar el negocio", ["project", "forecast", "5.?(to|-).?10 years", "five", "proyect", "prevision", "estimar"], true),
      c("fcf", "Unlevered free cash flow", "Flujo de caja libre (no apalancado)", ["free cash flow", "fcf", "ufcf", "unlevered", "flujo de caja libre", "flujos de caja", "fclo"], true),
      c("wacc", "Discount at the WACC", "Descontar al WACC", ["wacc", "cost of capital", "coste de capital", "costo de capital"]),
      c("tv", "Terminal value (growth or exit multiple)", "Valor terminal (crecimiento o múltiplo)", ["terminal", "perpetu", "gordon", "exit multiple", "multiplo de salida"]),
      c("bridge", "Bridge to equity value per share", "Puente a valor del equity por acción", ["net debt", "equity value", "per share", "deuda neta", "valor del equity", "valor de las acciones", "por accion", "fondos propios"]),
    ],
    minConcepts: 4,
    followUp: {
      deeper: b(
        "Good structure. When would you use an exit multiple for the terminal value rather than the perpetuity growth method?",
        "Buena estructura. ¿Cuándo usarías un múltiplo de salida para el valor terminal en lugar del método de crecimiento a perpetuidad?",
      ),
      probe: b(
        "You've covered part of it. How do you capture the value of the business beyond the forecast period, and how do you get from enterprise value to a share price?",
        "Has cubierto una parte. ¿Cómo capturas el valor del negocio más allá del periodo de proyección y cómo pasas del valor empresa al precio por acción?",
      ),
      concepts: [
        c("market", "Market-based / comparables", "Basado en mercado / comparables", ["market", "comparable", "comps", "peers", "precedent", "mercado", "comparables", "transacciones"], true),
        c("crosscheck", "Cross-check implied growth or multiple", "Contrastar crecimiento o múltiplo implícito", ["implied", "cross.?check", "sanity", "implicit", "contrast", "comprobar"]),
        c("tv-bridge", "Terminal value and net debt bridge", "Valor terminal y puente de deuda neta", ["terminal", "net debt", "deuda neta", "per share", "por accion"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Project the company's unlevered free cash flows for five to ten years from assumptions on growth, margins and reinvestment. Discount them at the WACC. Estimate a terminal value with the perpetuity growth method or an exit multiple and discount it back. The sum is enterprise value; subtract net debt and other claims to get equity value, and divide by diluted shares.",
      "Se proyectan los flujos de caja libres no apalancados durante cinco a diez años a partir de hipótesis de crecimiento, márgenes y reinversión. Se descuentan al WACC. Se estima un valor terminal con crecimiento a perpetuidad o un múltiplo de salida y se descuenta. La suma es el valor empresa; restando la deuda neta y otros pasivos se obtiene el valor del equity, que se divide entre las acciones diluidas.",
    ),
    followUpModelAnswer: b(
      "Exit multiples are common in banking and private equity because they anchor the terminal value to what the market pays for similar businesses, especially in mature sectors with good comparables. The trade-off is that it imports today's market pricing into an intrinsic model, so I would always cross-check: an exit multiple implies a perpetual growth rate, and that rate should be sensible.",
      "El múltiplo de salida es habitual en banca y private equity porque ancla el valor terminal a lo que el mercado paga por negocios similares, sobre todo en sectores maduros con buenos comparables. La contrapartida es que introduce precios de mercado actuales en un modelo intrínseco, así que siempre contrastaría: un múltiplo de salida implica una tasa de crecimiento perpetuo que debe ser razonable.",
    ),
    lesson: { courseId: "dcf", lessonId: "dcf-intuition" },
  },
  {
    id: "iv-depreciation-10",
    format: "technical",
    topics: ["accounting"],
    tracks: ["investment-banking", "private-equity", "equity-research", "corporate-finance", "hedge-funds"],
    difficulty: "Beginner",
    prompt: b(
      "Depreciation goes up by $10. Walk me through the three statements, assuming a 25% tax rate.",
      "La amortización aumenta en 10 $. Explícame el efecto en los tres estados financieros, con un tipo impositivo del 25%.",
    ),
    concepts: [
      c("ni", "Net income falls by $7.50", "El beneficio neto cae 7,50 $", ["7[.,]5"], true),
      c("cash", "Cash rises by $2.50 (tax shield)", "La caja sube 2,50 $ (escudo fiscal)", ["2[.,]5"], true),
      c("ppe", "PP&E falls by $10", "El inmovilizado cae 10 $", ["pp&?e", "property", "fixed asset", "inmovilizado", "activo fijo", "activos fijos"]),
      c("balance", "Both sides fall by $7.50 and balance", "Ambos lados caen 7,50 $ y cuadra", ["balance", "retained earnings", "equity", "cuadra", "reservas", "patrimonio", "beneficios retenidos"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("Good. Now what changes if that depreciation were not tax-deductible?", "Bien. ¿Y qué cambia si esa amortización no fuera deducible fiscalmente?"),
      probe: b(
        "Let's focus on cash. Depreciation is a non-cash expense, so why does cash change at all?",
        "Centrémonos en la caja. La amortización no supone salida de caja, así que ¿por qué cambia la caja?",
      ),
      concepts: [
        c("tax", "Taxes change: the tax shield", "Cambian los impuestos: escudo fiscal", ["tax", "impuest", "fiscal"], true),
        c("result", "Without deductibility: NI −$10, cash unchanged", "Sin deducibilidad: beneficio −10 $, caja sin cambio", ["unchanged", "no change", "doesn.?t change", "zero", "sin cambio", "no cambia", "igual", "-?10"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Income statement: EBIT falls by $10, taxes fall by $2.50, net income falls by $7.50. Cash flow statement: net income −$7.50, add back $10 of non-cash depreciation, so cash from operations rises by $2.50. Balance sheet: cash +$2.50 and PP&E −$10, so assets fall by $7.50; retained earnings fall by $7.50. It balances.",
      "Cuenta de resultados: el EBIT cae 10 $, los impuestos bajan 2,50 $ y el beneficio neto cae 7,50 $. Estado de flujos: beneficio −7,50 $, se suma la amortización de 10 $ (no caja), así que el flujo operativo sube 2,50 $. Balance: caja +2,50 $ e inmovilizado −10 $, el activo cae 7,50 $; las reservas caen 7,50 $. Cuadra.",
    ),
    followUpModelAnswer: b(
      "If it is not deductible, taxes do not change: net income falls by the full $10, the $10 add-back leaves cash unchanged, PP&E falls by $10 and retained earnings fall by $10. Cash only moved before because of the tax saving.",
      "Si no es deducible, los impuestos no cambian: el beneficio neto cae los 10 $, al sumar los 10 $ la caja no cambia, el inmovilizado baja 10 $ y las reservas 10 $. Antes la caja solo se movía por el ahorro fiscal.",
    ),
    lesson: { courseId: "accounting-fundamentals", lessonId: "linking-statements" },
  },
  {
    id: "iv-ev-vs-equity",
    format: "technical",
    topics: ["valuation"],
    tracks: ["investment-banking", "private-equity", "equity-research", "hedge-funds", "asset-management", "corporate-finance"],
    difficulty: "Beginner",
    prompt: b("What is the difference between enterprise value and equity value?", "¿Cuál es la diferencia entre valor empresa (EV) y valor del equity?"),
    concepts: [
      c("ev", "EV: value of the operating business to all capital providers", "EV: valor del negocio para todos los financiadores", ["all (capital|investors|providers|stakeholders)", "whole (business|company)", "operating", "debt and equity", "todos los", "negocio", "operativ", "deuda y"], true),
      c("equity", "Equity value: value to shareholders only", "Valor del equity: solo para accionistas", ["shareholder", "equity holder", "market cap", "accionista", "capitalizacion"], true),
      c("bridge", "Bridge: net debt, preferred, minority interest", "Puente: deuda neta, preferentes, minoritarios", ["net debt", "cash", "minorit", "preferred", "deuda neta", "caja", "preferent"]),
    ],
    minConcepts: 2,
    followUp: {
      deeper: b("Good. Can enterprise value be lower than equity value? When?", "Bien. ¿Puede el valor empresa ser menor que el valor del equity? ¿Cuándo?"),
      probe: b("How exactly do you get from enterprise value to equity value?", "¿Cómo se pasa exactamente del valor empresa al valor del equity?"),
      concepts: [
        c("netcash", "When the company has net cash (cash > debt)", "Cuando la empresa tiene caja neta (caja > deuda)", ["net cash", "more cash than debt", "cash (exceeds|greater|>)", "caja neta", "mas caja que deuda", "caja mayor"], true),
        c("subtract", "Subtract debt, add cash, subtract other claims", "Restar deuda, sumar caja, restar otros pasivos", ["subtract", "minus", "less debt", "add (back )?cash", "restar", "menos", "sumar"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Enterprise value is the value of the operating business to all capital providers, debt and equity alike. Equity value is the part that belongs to shareholders. To bridge: equity value = EV − debt + cash − preferred − minority interest (plus non-operating assets).",
      "El valor empresa es el valor del negocio operativo para todos los financiadores, deuda y accionistas. El valor del equity es la parte que corresponde a los accionistas. Puente: equity = EV − deuda + caja − preferentes − minoritarios (más activos no operativos).",
    ),
    followUpModelAnswer: b(
      "Yes, when the company holds more cash than debt (net cash). EV = equity value + debt − cash, so net cash makes EV smaller than equity value. Technology companies with large cash balances are common examples.",
      "Sí, cuando la empresa tiene más caja que deuda (caja neta). EV = equity + deuda − caja, así que con caja neta el EV es menor que el valor del equity. Es habitual en tecnológicas con mucha caja.",
    ),
    lesson: { courseId: "dcf", lessonId: "ev-to-equity" },
  },
  {
    id: "iv-wacc-leverage",
    format: "technical",
    topics: ["corporate-finance", "valuation"],
    tracks: ["investment-banking", "private-equity", "corporate-finance", "equity-research"],
    difficulty: "Intermediate",
    prompt: b("What happens to a company's WACC as it takes on more debt?", "¿Qué le ocurre al WACC de una empresa a medida que se endeuda más?"),
    concepts: [
      c("falls", "Falls at first: cheaper debt and tax shield", "Al principio baja: deuda más barata y escudo fiscal", ["cheaper", "tax (shield|deduct)", "lower cost", "mas barat", "escudo fiscal", "deducib"], true),
      c("ke-up", "Cost of equity rises with financial risk", "El coste del equity sube por el riesgo financiero", ["cost of equity (rises|increases|goes up)", "equity.{0,25}(riskier|more risk)", "beta (rises|increases|goes up)", "coste del equity", "costo del capital", "beta (sube|aumenta)", "mas riesgo"]),
      c("u-shape", "Eventually rises: distress and higher cost of debt", "Al final sube: riesgo de quiebra y deuda más cara", ["distress", "bankrupt", "default", "eventually", "too much debt", "u.?shape", "quiebra", "insolven", "impago", "demasiada deuda", "al final"]),
    ],
    minConcepts: 2,
    followUp: {
      deeper: b("Good. How would you think about the optimal capital structure in practice?", "Bien. ¿Cómo enfocarías en la práctica la estructura de capital óptima?"),
      probe: b("Start with the basics: why is debt usually cheaper than equity?", "Empecemos por lo básico: ¿por qué la deuda suele ser más barata que el equity?"),
      concepts: [
        c("tradeoff", "Trade-off: tax shield vs distress costs", "Equilibrio: escudo fiscal vs costes de insolvencia", ["trade.?off", "tax shield", "distress", "balance", "equilibr", "escudo fiscal", "insolven"], true),
        c("practice", "Ratings, cash-flow stability, peers", "Rating, estabilidad de flujos, comparables", ["rating", "stab", "peer", "covenant", "comparab", "estab", "flexib"]),
        c("senior", "Debt is senior and interest deductible", "La deuda es senior y los intereses deducibles", ["senior", "priority", "deduct", "prioridad", "deducib"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "At first WACC falls, because debt is cheaper than equity and interest is tax-deductible. But more debt makes equity riskier, so the cost of equity rises and partly offsets this. Beyond some point the cost of debt rises and distress risk appears, so WACC starts to increase: it is roughly U-shaped.",
      "Al principio el WACC baja, porque la deuda es más barata que el equity y los intereses son deducibles. Pero más deuda hace el equity más arriesgado, así que su coste sube y compensa en parte. A partir de cierto punto sube el coste de la deuda y aparece el riesgo de insolvencia, y el WACC empieza a subir: tiene forma de U.",
    ),
    followUpModelAnswer: b(
      "Conceptually, it balances the value of the tax shield against expected distress costs. In practice companies target a credit rating or leverage range, look at cash-flow stability and peers, and keep flexibility for downturns and acquisitions.",
      "Conceptualmente, equilibra el valor del escudo fiscal con los costes esperados de insolvencia. En la práctica, las empresas fijan un rating o rango de apalancamiento objetivo, miran la estabilidad de sus flujos y a sus comparables, y mantienen flexibilidad para crisis y adquisiciones.",
    ),
    lesson: { courseId: "dcf", lessonId: "wacc" },
  },
  {
    id: "iv-ev-ebitda-pe",
    format: "technical",
    topics: ["valuation"],
    tracks: ["investment-banking", "private-equity", "equity-research", "hedge-funds", "asset-management"],
    difficulty: "Intermediate",
    prompt: b(
      "A company trades at 8x EV/EBITDA but 25x P/E. What might explain the difference?",
      "Una empresa cotiza a 8x EV/EBITDA pero a 25x PER. ¿Qué puede explicar la diferencia?",
    ),
    concepts: [
      c("leverage", "Leverage: high interest expense", "Apalancamiento: gastos financieros altos", ["leverage", "interest", "debt", "apalanca", "interes", "deuda"], true),
      c("da", "Large D&A", "Amortizaciones elevadas", ["d&a", "depreciation", "amorti", "capital intensive", "intensiv"]),
      c("tax", "High tax rate or one-off items", "Tipo impositivo alto o extraordinarios", ["tax", "one.?off", "impairment", "non.?recurring", "impuest", "extraordinari", "deterioro"]),
      c("ev-equity", "EV includes net debt; P/E is equity only", "El EV incluye deuda neta; el PER solo equity", ["net debt", "enterprise", "equity value", "market cap", "deuda neta", "capitalizacion"]),
    ],
    minConcepts: 2,
    followUp: {
      deeper: b(
        "Good. For a capital-intensive business, which multiple would you prefer and why?",
        "Bien. Para un negocio intensivo en capital, ¿qué múltiplo preferirías y por qué?",
      ),
      probe: b("Walk down from EBITDA to net income. What sits in between?", "Baja desde el EBITDA hasta el beneficio neto. ¿Qué hay entre medias?"),
      concepts: [
        c("ebit", "EV/EBIT or EV/(EBITDA − capex)", "EV/EBIT o EV/(EBITDA − capex)", ["ev ?/ ?ebit\\b", "ebit\\b", "capex", "ebitda ?- ?capex"], true),
        c("why", "Because D&A / capex is a real cost", "Porque la amortización / capex es un coste real", ["real cost", "capex", "reinvest", "coste real", "costo real"]),
        c("walk", "D&A, interest and taxes", "Amortización, intereses e impuestos", ["interest", "tax", "interes", "impuest"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "EV/EBITDA is pre-financing and capital-structure neutral; P/E is after interest, D&A and taxes. A big gap means much of EBITDA disappears before net income: high leverage and interest expense, heavy D&A, a high tax rate or one-off charges. EV also includes net debt while market cap does not.",
      "El EV/EBITDA es previo a la financiación y neutral a la estructura de capital; el PER es después de intereses, amortizaciones e impuestos. Una gran diferencia indica que buena parte del EBITDA desaparece antes del beneficio neto: mucho apalancamiento e intereses, amortizaciones elevadas, impuestos altos o extraordinarios. Además, el EV incluye la deuda neta y la capitalización no.",
    ),
    followUpModelAnswer: b(
      "EV/EBIT or EV/(EBITDA − capex), because in capital-intensive businesses depreciation reflects real reinvestment needs. EV/EBITDA would make them look artificially cheap compared with asset-light peers.",
      "EV/EBIT o EV/(EBITDA − capex), porque en negocios intensivos en capital la amortización refleja necesidades reales de reinversión. El EV/EBITDA los haría parecer artificialmente baratos frente a negocios con pocos activos.",
    ),
    lesson: { courseId: "dcf", lessonId: "ev-to-equity" },
  },
  {
    id: "iv-accretion",
    format: "technical",
    topics: ["ma"],
    tracks: ["investment-banking", "corporate-finance", "private-equity"],
    difficulty: "Intermediate",
    prompt: b(
      "An acquirer trading at 20x P/E buys a target for 12x earnings, paying entirely in stock. Is the deal accretive or dilutive, ignoring synergies?",
      "Un comprador que cotiza a 20x PER adquiere una empresa por 12x beneficios, pagando íntegramente en acciones. Sin sinergias, ¿la operación es acretiva o dilutiva?",
    ),
    concepts: [
      c("accretive", "Accretive", "Acretiva", ["accretive", "acretiv", "accretion"], true),
      c("reason", "Acquirer's P/E is higher than the P/E paid", "El PER del comprador es mayor que el pagado", ["p/?e (is )?higher", "higher p/?e", "earnings yield", "cheaper currency", "20.{0,15}12", "per (mayor|mas alto)", "rentabilidad por beneficio", "5%.{0,30}8"]),
    ],
    minConcepts: 2,
    followUp: {
      deeper: b(
        "Right. Now it funds the same deal with debt at 8% pre-tax, with a 25% tax rate. Still accretive?",
        "Correcto. Ahora financia la misma operación con deuda al 8% antes de impuestos y un tipo impositivo del 25%. ¿Sigue siendo acretiva?",
      ),
      probe: b(
        "Think about the cost of each currency. What is the acquirer's 'cost' of issuing stock at a 20x P/E, and what earnings yield does it buy at 12x?",
        "Piensa en el coste de cada forma de pago. ¿Cuál es el 'coste' para el comprador de emitir acciones a 20x PER y qué rentabilidad por beneficio compra a 12x?",
      ),
      concepts: [
        c("yes", "Yes, accretive", "Sí, acretiva", ["accretive", "acretiv", "\\byes\\b", "\\bsi\\b"], true),
        c("math", "After-tax cost 6% < target earnings yield 8.3%", "Coste después de impuestos 6% < rentabilidad 8,3%", ["6 ?%", "8[.,]3", "1/12", "5 ?%"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Accretive. In a stock deal the acquirer's cost is its earnings yield, 1/20 = 5%, and it buys earnings at 1/12 = 8.3%. Buying a higher earnings yield with a cheaper currency increases EPS.",
      "Acretiva. En una operación en acciones el coste para el comprador es su rentabilidad por beneficio, 1/20 = 5%, y compra beneficios al 1/12 = 8,3%. Comprar una rentabilidad mayor con una moneda más barata aumenta el BPA.",
    ),
    followUpModelAnswer: b(
      "Yes. The after-tax cost of debt is 8% × (1 − 25%) = 6%, still below the 8.3% earnings yield, so it remains accretive, though less so than the stock deal. Accretion is not value creation, though: that depends on the price versus standalone value plus synergies.",
      "Sí. El coste de la deuda después de impuestos es 8% × (1 − 25%) = 6%, todavía por debajo del 8,3%, así que sigue siendo acretiva, aunque menos que en acciones. Aun así, acreción no es creación de valor: eso depende del precio frente al valor intrínseco más sinergias.",
    ),
  },
  {
    id: "iv-paper-lbo",
    format: "case",
    topics: ["lbo"],
    tracks: ["private-equity", "investment-banking"],
    difficulty: "Intermediate",
    prompt: b(
      "A sponsor buys a company for $500m with 50% debt. Five years later it sells for $750m, with $100m of debt remaining. What is the MOIC?",
      "Un fondo compra una empresa por 500 M$ con un 50% de deuda. Cinco años después la vende por 750 M$ y quedan 100 M$ de deuda. ¿Cuál es el MOIC?",
    ),
    numeric: { value: 2.6, tolerance: 0.05, unit: "x" },
    concepts: [
      c("equity-in", "Equity invested: $250m", "Equity invertido: 250 M$", ["250"]),
      c("equity-out", "Equity at exit: $650m", "Equity a la salida: 650 M$", ["650"]),
    ],
    minConcepts: 0,
    followUp: {
      deeper: b(
        "Correct. Roughly what IRR is that, and what drove the returns?",
        "Correcto. ¿Qué TIR aproximada supone y qué impulsó la rentabilidad?",
      ),
      probe: b(
        "Remember to work with equity, not enterprise value. How much equity did the sponsor put in, and how much did it get back at exit?",
        "Recuerda trabajar con el equity, no con el valor empresa. ¿Cuánto equity aportó el fondo y cuánto recuperó a la salida?",
      ),
      concepts: [
        c("irr", "About 21% IRR", "TIR de en torno al 21%", ["\\b2[01]([.,]\\d+)? ?%", "\\b2[01] percent", "\\b2[01] por ciento"], true),
        c("drivers", "EV growth and debt paydown", "Crecimiento del EV y amortización de deuda", ["paydown", "pay down", "repa", "delever", "ebitda", "multiple", "growth", "amortiz", "desapalanc", "crecimiento", "multiplo"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Equity in: 50% × $500m = $250m. Equity out: $750m − $100m = $650m. MOIC = 650 / 250 = 2.6x.",
      "Equity aportado: 50% × 500 M$ = 250 M$. Equity a la salida: 750 M$ − 100 M$ = 650 M$. MOIC = 650 / 250 = 2,6x.",
    ),
    followUpModelAnswer: b(
      "2.6^(1/5) − 1 ≈ 21%. Of the $400m equity gain, $250m came from the higher enterprise value (EBITDA growth and/or multiple expansion) and $150m from paying debt down from $250m to $100m.",
      "2,6^(1/5) − 1 ≈ 21%. De los 400 M$ de ganancia, 250 M$ vienen del mayor valor empresa (crecimiento del EBITDA y/o expansión de múltiplo) y 150 M$ de reducir la deuda de 250 M$ a 100 M$.",
    ),
  },
  {
    id: "iv-lbo-candidate",
    format: "technical",
    topics: ["lbo"],
    tracks: ["private-equity", "investment-banking"],
    difficulty: "Beginner",
    prompt: b("What makes a good LBO candidate?", "¿Qué hace que una empresa sea buena candidata para un LBO?"),
    concepts: [
      c("cash", "Stable, predictable cash flows", "Flujos de caja estables y predecibles", ["stable", "predictab", "recurring", "cash flow", "estable", "predecib", "recurrent", "flujo"], true),
      c("capex", "Low capex needs", "Poco capex", ["capex", "capital (expenditure|intensity)", "asset.?light", "inversion"]),
      c("position", "Strong market position", "Posición de mercado sólida", ["market (position|leader|share)", "moat", "competitive", "lider", "posicion", "ventaja competitiva"]),
      c("debt", "Low existing debt", "Poca deuda actual", ["low (existing )?(debt|leverage)", "unlevered", "poca deuda", "bajo apalanca"]),
      c("upside", "Operational improvement / exit options", "Mejoras operativas / opciones de salida", ["cost", "improve", "operational", "exit", "efficien", "mejora", "costes", "salida"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("Why do stable cash flows matter so much in an LBO?", "¿Por qué importan tanto los flujos de caja estables en un LBO?"),
      probe: b(
        "Think about how the deal is financed. What does all that debt need from the business?",
        "Piensa en cómo se financia la operación. ¿Qué necesita toda esa deuda del negocio?",
      ),
      concepts: [
        c("service", "To service and repay the debt", "Para pagar intereses y devolver la deuda", ["service", "repay", "interest", "pay (down|back)", "intereses", "devolver", "pagar"], true),
        c("capacity", "Lenders lend more against stable cash flow", "Los bancos prestan más con flujos estables", ["lender", "more debt", "leverage", "banks", "prestamistas", "bancos", "mas deuda"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Stable and predictable cash flows, low capital intensity, a strong market position, low existing leverage, and room for operational improvements, plus a clear exit route.",
      "Flujos de caja estables y predecibles, poca intensidad de capital, una posición de mercado sólida, poco endeudamiento previo, margen de mejora operativa y una vía de salida clara.",
    ),
    followUpModelAnswer: b(
      "The company must pay interest and repay a large debt load from its own cash flow. Stable cash flows let lenders provide more debt on better terms, reduce the risk of breaching covenants, and protect the equity in a downturn.",
      "La empresa debe pagar intereses y devolver mucha deuda con su propio flujo de caja. Los flujos estables permiten más deuda en mejores condiciones, reducen el riesgo de incumplir covenants y protegen el equity en una crisis.",
    ),
  },
  {
    id: "iv-pe-value-creation",
    format: "technical",
    topics: ["lbo"],
    tracks: ["private-equity"],
    difficulty: "Intermediate",
    prompt: b("How does a private equity firm create value in a portfolio company?", "¿Cómo crea valor un fondo de private equity en una empresa participada?"),
    concepts: [
      c("ops", "Operational improvements and margins", "Mejoras operativas y de márgenes", ["operational", "margin", "cost", "efficien", "pricing", "operativ", "margen", "costes", "eficien"], true),
      c("growth", "Revenue growth, organic or buy-and-build", "Crecimiento orgánico o buy-and-build", ["growth", "buy.?and.?build", "add.?on", "acquisition", "crecimiento", "adquisicion"]),
      c("multiple", "Multiple expansion", "Expansión de múltiplo", ["multiple", "multiplo"]),
      c("delever", "Debt paydown", "Desapalancamiento", ["debt", "delever", "paydown", "deuda", "desapalanc"]),
      c("governance", "Governance and management incentives", "Gobierno corporativo e incentivos", ["governance", "incentive", "management", "board", "gobierno", "incentiv", "directiv"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("Which of those levers is the least reliable, and why?", "¿Cuál de esas palancas es la menos fiable y por qué?"),
      probe: b(
        "Use the returns formula: exit equity = exit EV − net debt. Which levers move each part?",
        "Usa la fórmula de rentabilidad: equity a la salida = EV de salida − deuda neta. ¿Qué palancas mueven cada parte?",
      ),
      concepts: [
        c("multiple", "Multiple expansion depends on the market", "La expansión de múltiplo depende del mercado", ["multiple", "multiplo"], true),
        c("why", "Outside the sponsor's control", "Fuera del control del fondo", ["market", "control", "cycle", "rates", "mercado", "ciclo", "tipos"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Through EBITDA growth (operational improvements, pricing, cost efficiency, organic growth and add-on acquisitions), multiple expansion at exit, and debt paydown, supported by stronger governance and aligned management incentives.",
      "Mediante el crecimiento del EBITDA (mejoras operativas, precios, eficiencia, crecimiento orgánico y adquisiciones), la expansión del múltiplo a la salida y la amortización de deuda, apoyados en un mejor gobierno corporativo e incentivos alineados.",
    ),
    followUpModelAnswer: b(
      "Multiple expansion, because exit multiples depend largely on market conditions and interest rates at the time of sale, which the sponsor cannot control. Strong funds underwrite deals assuming flat or lower exit multiples.",
      "La expansión de múltiplo, porque depende sobre todo de las condiciones de mercado y los tipos de interés en el momento de la venta, que el fondo no controla. Los buenos fondos suponen múltiplos de salida iguales o menores.",
    ),
  },

  /* ───────────── Markets, S&T, HF, AM ───────────── */
  {
    id: "iv-surprise-hike",
    format: "market",
    topics: ["markets", "macro", "fixed-income"],
    tracks: ["sales-trading", "hedge-funds", "asset-management", "risk-management"],
    difficulty: "Intermediate",
    prompt: b(
      "A central bank raises rates by more than the market expected. What happens to government bonds, equities and the currency?",
      "Un banco central sube los tipos más de lo que esperaba el mercado. ¿Qué les ocurre a los bonos soberanos, la renta variable y la divisa?",
    ),
    concepts: [
      c("bonds", "Bond yields up, prices down", "Suben las rentabilidades, bajan los precios de los bonos", ["yields? (rise|go up|up|increase)", "bond prices? (fall|drop|down|decline)", "prices? (fall|drop).{0,20}bond", "rentabilidad(es)? (sube|suben)", "(sube|suben).{0,20}rentabilidad", "precio.{0,20}bonos? (baja|cae)", "(caen|bajan).{0,25}(bonos|precio)", "bonos? (bajan|caen)"], true),
      c("equities", "Equities fall, especially long-duration", "Cae la renta variable, sobre todo la de larga duración", ["equit.{0,30}(fall|down|drop|decline)", "stocks? (fall|drop|down)", "growth stocks", "bolsa (cae|baja)", "acciones (caen|bajan)", "renta variable"]),
      c("fx", "Currency strengthens", "La divisa se aprecia", ["currency (strengthen|appreciat|rise)", "strengthen", "apprecia", "stronger", "se aprecia", "apreci", "se fortalece", "mas fuerte"]),
      c("surprise", "Reaction is to the surprise vs expectations", "El mercado reacciona a la sorpresa", ["expect", "surprise", "priced", "esperab", "sorpresa", "descontad"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b(
        "Which part of the yield curve moves most, and what happens to its shape?",
        "¿Qué parte de la curva de tipos se mueve más y qué ocurre con su forma?",
      ),
      probe: b("Start with bonds: how are bond yields and prices related?", "Empieza por los bonos: ¿cómo se relacionan la rentabilidad y el precio de un bono?"),
      concepts: [
        c("front", "The front end moves most", "Se mueve más el tramo corto", ["front end", "short end", "short.?(term|dated)", "2.?year", "tramo corto", "corto plazo"], true),
        c("flatten", "The curve flattens", "La curva se aplana", ["flatten", "aplan", "invert"]),
        c("inverse", "Prices and yields move inversely", "Precio y rentabilidad se mueven a la inversa", ["invers", "opposite", "contrari"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Markets reprice the expected path of policy rates. Government bond yields rise and prices fall, especially at the short end. Equities generally fall as discount rates rise, with long-duration growth stocks hit hardest. The currency usually strengthens as higher expected yields attract capital. The size of each move depends on the surprise relative to expectations.",
      "El mercado ajusta la senda esperada de tipos. Suben las rentabilidades de los bonos soberanos y caen sus precios, sobre todo en el tramo corto. La bolsa suele caer al subir las tasas de descuento, especialmente los valores de crecimiento. La divisa suele apreciarse al atraer capital. La magnitud depende de la sorpresa frente a lo esperado.",
    ),
    followUpModelAnswer: b(
      "The front end, because short-dated yields track expected policy rates most directly. The curve typically flattens (a bear flattener), and if markets expect the tightening to slow growth, longer yields may rise much less or even fall.",
      "El tramo corto, porque las rentabilidades a corto plazo siguen más directamente a los tipos oficiales esperados. La curva suele aplanarse, y si el mercado espera que el endurecimiento frene el crecimiento, los plazos largos pueden subir mucho menos o incluso bajar.",
    ),
  },
  {
    id: "iv-duration",
    format: "technical",
    topics: ["fixed-income"],
    tracks: ["sales-trading", "asset-management", "risk-management", "quant-finance"],
    difficulty: "Beginner",
    prompt: b(
      "A bond has a modified duration of 6. Yields fall by 25 basis points. Approximately how much does its price change, in percent?",
      "Un bono tiene una duración modificada de 6. Las rentabilidades bajan 25 puntos básicos. ¿Cuánto cambia aproximadamente su precio, en porcentaje?",
    ),
    numeric: { value: 1.5, tolerance: 0.05, unit: "%" },
    concepts: [c("up", "Price rises", "El precio sube", UP)],
    minConcepts: 0,
    followUp: {
      deeper: b(
        "Right, about +1.5%. Would convexity make the actual gain larger or smaller than that estimate?",
        "Correcto, en torno a +1,5%. ¿La convexidad haría que la ganancia real fuera mayor o menor que esa estimación?",
      ),
      probe: b(
        "Use ΔP/P ≈ −D × Δy. What is Δy here, and what sign does the price change have?",
        "Usa ΔP/P ≈ −D × Δy. ¿Cuánto vale Δy aquí y qué signo tiene el cambio de precio?",
      ),
      concepts: [
        c("larger", "Larger: convexity adds to gains", "Mayor: la convexidad suma a las ganancias", ["larger", "bigger", "more", "higher", "mayor", "mas"], true),
        c("formula", "−6 × −0.25% = +1.5%", "−6 × −0,25% = +1,5%", ["1[.,]5", "0[.,]25"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b("ΔP/P ≈ −6 × (−0.25%) = +1.5%. The price rises by about 1.5%.", "ΔP/P ≈ −6 × (−0,25%) = +1,5%. El precio sube en torno a un 1,5%."),
    followUpModelAnswer: b(
      "Larger. Positive convexity means the price-yield curve bends upward, so duration underestimates gains when yields fall and overestimates losses when they rise.",
      "Mayor. Con convexidad positiva la curva precio-rentabilidad se curva hacia arriba, así que la duración subestima las ganancias cuando bajan los tipos y sobrestima las pérdidas cuando suben.",
    ),
  },
  {
    id: "iv-trade-pitch",
    format: "pitch",
    topics: ["markets", "macro"],
    tracks: ["sales-trading", "hedge-funds"],
    difficulty: "Advanced",
    prompt: b(
      "Pitch me a trade based on a macro view you hold. You don't need live prices; I'm interested in the logic and the risk management.",
      "Preséntame una operación basada en una visión macro que tengas. No necesitas precios en tiempo real; me interesa la lógica y la gestión del riesgo.",
    ),
    concepts: [
      c("view", "A clear view / thesis", "Una tesis clara", ["\\bview", "thesis", "believe", "expect", "tesis", "creo", "espero", "vision"], true),
      c("instrument", "How to express it (instrument)", "Cómo expresarla (instrumento)", ["long", "short", "futures", "option", "swap", "etf", "bond", "curve", "largo", "corto", "futuro", "opcion", "bono", "curva"], true),
      c("catalyst", "Catalyst / timing", "Catalizador / horizonte", ["catalyst", "timing", "horizon", "data release", "meeting", "catalizador", "horizonte", "reunion", "dato"]),
      c("risk", "Risks and stop-loss", "Riesgos y stop-loss", ["risk", "stop", "invalidat", "downside", "riesgo", "perdida"]),
      c("sizing", "Sizing / risk-reward", "Tamaño / relación riesgo-rentabilidad", ["siz", "risk.?reward", "asymmetr", "carry", "tamano", "asimetr"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("What would make you close the trade, at a gain or a loss?", "¿Qué te haría cerrar la operación, con ganancia o con pérdida?"),
      probe: b(
        "What is the main risk to your trade, and how would you manage it?",
        "¿Cuál es el principal riesgo de tu operación y cómo lo gestionarías?",
      ),
      concepts: [
        c("exit", "Pre-defined stop-loss and target", "Stop-loss y objetivo predefinidos", ["stop", "target", "take profit", "level", "objetivo", "nivel"], true),
        c("invalidation", "Thesis invalidated by new information", "Tesis invalidada por nueva información", ["wrong", "invalid", "thesis", "changes", "equivoc", "tesis", "cambia"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "A good pitch states the view and why the market is mispricing it, picks the cleanest instrument to express it, names the catalyst and time horizon, quantifies risk-reward, and defines in advance the stop-loss level and the evidence that would prove the thesis wrong.",
      "Una buena propuesta expone la tesis y por qué el mercado la valora mal, elige el instrumento más limpio para expresarla, identifica el catalizador y el horizonte, cuantifica la relación riesgo-rentabilidad y define de antemano el stop-loss y qué evidencia invalidaría la tesis.",
    ),
    followUpModelAnswer: b(
      "Close at a pre-defined target or stop-loss level set when the trade was put on, or immediately if the thesis is invalidated, for example a data release that contradicts the view, even if the stop has not been hit.",
      "Cerraría al llegar al objetivo o al stop-loss fijados al abrir la operación, o de inmediato si la tesis queda invalidada, por ejemplo por un dato que contradiga la visión, aunque no se haya tocado el stop.",
    ),
  },
  {
    id: "iv-option-vol",
    format: "technical",
    topics: ["derivatives"],
    tracks: ["sales-trading", "quant-finance", "hedge-funds", "risk-management"],
    difficulty: "Intermediate",
    prompt: b(
      "What happens to the price of a call option when implied volatility increases? And to a put?",
      "¿Qué le ocurre al precio de una opción call cuando aumenta la volatilidad implícita? ¿Y al de una put?",
    ),
    concepts: [
      c("both", "Both increase", "Ambas suben", ["both", "ambas", "las dos", "call and put", "tanto"], true),
      c("why", "Asymmetric payoff: limited downside", "Pago asimétrico: pérdida limitada", ["asymmetr", "limited", "capped", "premium", "vega", "asimetr", "limitad", "prima"]),
    ],
    minConcepts: 1,
    followUp: {
      deeper: b("Which option is most sensitive to volatility: in, at or out of the money?", "¿Qué opción es más sensible a la volatilidad: dentro, en o fuera del dinero?"),
      probe: b(
        "Think about the payoff. If the stock moves a lot, what is the most an option holder can lose?",
        "Piensa en el pago. Si la acción se mueve mucho, ¿qué es lo máximo que puede perder el tenedor de la opción?",
      ),
      concepts: [
        c("atm", "At the money", "En el dinero (ATM)", ["at.?the.?money", "\\batm\\b", "en el dinero"], true),
        c("premium", "Loss limited to the premium", "Pérdida limitada a la prima", ["premium", "prima"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Both rise. Options have asymmetric payoffs: higher volatility increases the chance of large favourable moves while the loss is capped at the premium. Calls and puts both have positive vega.",
      "Ambas suben. Las opciones tienen pagos asimétricos: más volatilidad aumenta la probabilidad de movimientos favorables grandes mientras la pérdida se limita a la prima. Calls y puts tienen vega positiva.",
    ),
    followUpModelAnswer: b(
      "At-the-money options have the highest vega in absolute terms, because their value depends most on whether the price ends above or below the strike.",
      "Las opciones en el dinero (ATM) tienen la vega más alta en términos absolutos, porque su valor depende más de si el precio acaba por encima o por debajo del strike.",
    ),
  },
  {
    id: "iv-stock-pitch",
    format: "pitch",
    topics: ["valuation", "strategy"],
    tracks: ["hedge-funds", "equity-research", "asset-management", "private-equity"],
    difficulty: "Advanced",
    prompt: b(
      "Pitch me a stock, long or short. You don't need live prices; focus on the thesis, valuation and risks.",
      "Preséntame una acción, a largo o a corto. No necesitas precios en tiempo real; céntrate en la tesis, la valoración y los riesgos.",
    ),
    concepts: [
      c("thesis", "Clear thesis", "Tesis clara", ["thesis", "long", "short", "recommend", "tesis", "largo", "corto", "recomiendo"], true),
      c("variant", "Variant perception: what the market misses", "Qué no ve el mercado", ["market (is )?(missing|underestimat|overlook)", "consensus", "mispric", "misunderst", "el mercado no", "consenso", "infravalor", "sobrevalor"]),
      c("valuation", "Valuation and upside", "Valoración y potencial", ["valuation", "multiple", "dcf", "upside", "target", "p/?e", "ev/", "valoracion", "multiplo", "potencial", "objetivo"], true),
      c("catalyst", "Catalysts", "Catalizadores", ["catalyst", "catalizador", "earnings", "resultados"]),
      c("risks", "Key risks", "Riesgos clave", ["risk", "downside", "bear case", "riesgo"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b(
        "What does the market believe that you don't, and why are you right?",
        "¿Qué cree el mercado que tú no crees, y por qué tienes razón?",
      ),
      probe: b(
        "How would you value it, and how much upside do you see?",
        "¿Cómo la valorarías y cuánto potencial ves?",
      ),
      concepts: [
        c("evidence", "Evidence for the variant view", "Evidencia para tu visión", ["data", "evidence", "channel check", "because", "datos", "evidencia", "porque"], true),
        c("consensus", "Contrast with consensus", "Contraste con el consenso", ["consensus", "market", "street", "consenso", "mercado"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "A strong pitch gives the recommendation in one line, explains what the market is missing (the variant perception) with evidence, values the company with a clear method and upside to a target, names the catalysts that will close the gap, and lays out the main risks and what would change your mind.",
      "Una buena propuesta da la recomendación en una frase, explica qué no está viendo el mercado con evidencias, valora la empresa con un método claro y un potencial hasta un objetivo, identifica los catalizadores y expone los riesgos principales y qué te haría cambiar de opinión.",
    ),
    followUpModelAnswer: b(
      "State the consensus view explicitly, then the specific evidence that contradicts it (data, unit economics, channel checks, management actions) and why the market has not priced it yet.",
      "Expón explícitamente la visión de consenso y después la evidencia concreta que la contradice (datos, economía unitaria, comprobaciones de canal, decisiones de la dirección) y por qué el mercado aún no la ha descontado.",
    ),
  },
  {
    id: "iv-negative-earnings",
    format: "technical",
    topics: ["valuation"],
    tracks: ["equity-research", "hedge-funds", "asset-management", "investment-banking", "private-equity"],
    difficulty: "Intermediate",
    prompt: b("How would you value a company with negative earnings?", "¿Cómo valorarías una empresa con beneficios negativos?"),
    concepts: [
      c("revenue", "Revenue or other top-line multiples", "Múltiplos de ingresos u otros", ["revenue", "sales", "ev ?/ ?s", "gross profit", "ingresos", "ventas", "margen bruto"], true),
      c("dcf", "Longer DCF to a steady state", "DCF más largo hasta estado estable", ["dcf", "steady state", "long(er)? forecast", "normali", "estado estable", "proyeccion larga"]),
      c("scenarios", "Scenarios", "Escenarios", ["scenario", "probabil", "escenario"]),
      c("unit", "Unit economics / market size", "Economía unitaria / tamaño de mercado", ["unit economics", "ltv", "cac", "tam", "market size", "economia unitaria", "tamano de mercado"]),
    ],
    minConcepts: 2,
    followUp: {
      deeper: b("What is the main weakness of EV/Revenue?", "¿Cuál es la principal debilidad del EV/Ventas?"),
      probe: b("If earnings are negative, can you use P/E? What would you use instead?", "Si los beneficios son negativos, ¿puedes usar el PER? ¿Qué usarías en su lugar?"),
      concepts: [
        c("margin", "Ignores profitability / margins", "Ignora rentabilidad y márgenes", ["margin", "profitab", "cost", "margen", "rentabilidad"], true),
        c("no-pe", "P/E is meaningless with negative earnings", "El PER no tiene sentido con pérdidas", ["meaningless", "negative", "no sentido", "negativ", "\\bno\\b"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "P/E is meaningless, so use revenue (or gross-profit) multiples against peers, a longer DCF that runs until the business reaches steady-state margins, and probability-weighted scenarios. Cross-check against the addressable market and unit economics.",
      "El PER no sirve, así que usaría múltiplos de ingresos (o margen bruto) frente a comparables, un DCF más largo hasta que el negocio alcance márgenes estables y escenarios ponderados por probabilidad, contrastando con el mercado potencial y la economía unitaria.",
    ),
    followUpModelAnswer: b(
      "It ignores profitability: two companies with the same revenue can have very different margins and cash generation. A revenue multiple implicitly assumes a future margin, so you should state it.",
      "Ignora la rentabilidad: dos empresas con los mismos ingresos pueden tener márgenes y generación de caja muy distintos. Un múltiplo de ingresos asume implícitamente un margen futuro, y hay que explicitarlo.",
    ),
    lesson: { courseId: "dcf", lessonId: "sensitivity" },
  },
  {
    id: "iv-diversification",
    format: "technical",
    topics: ["quant", "markets"],
    tracks: ["asset-management", "risk-management", "quant-finance", "hedge-funds"],
    difficulty: "Beginner",
    prompt: b("Why does diversification reduce risk, and what risk remains?", "¿Por qué la diversificación reduce el riesgo y qué riesgo permanece?"),
    concepts: [
      c("correlation", "Imperfect correlation: movements offset", "Correlación imperfecta: los movimientos se compensan", ["correlat", "offset", "cancel", "correlac", "compensan"], true),
      c("idio", "Idiosyncratic risk is diversified away", "Se elimina el riesgo idiosincrático", ["idiosyncratic", "specific", "unsystematic", "idiosincrat", "especifico"]),
      c("systematic", "Systematic (market) risk remains", "Permanece el riesgo sistemático", ["systematic", "market risk", "sistematic", "riesgo de mercado"], true),
    ],
    minConcepts: 2,
    followUp: {
      deeper: b("What tends to happen to diversification benefits during a market crisis?", "¿Qué suele ocurrir con los beneficios de la diversificación durante una crisis?"),
      probe: b("What role does correlation play?", "¿Qué papel juega la correlación?"),
      concepts: [
        c("corr-up", "Correlations rise towards one", "Las correlaciones aumentan hacia uno", ["correlations? (rise|increase|go up|spike)", "go(es)? to (one|1)", "move together", "correlaciones? (suben|aumentan)", "se mueven juntos"], true),
        c("less1", "Correlation below one gives the benefit", "Correlación menor que uno", ["less than (one|1)", "below (one|1)", "menor que (uno|1)", "inferior a"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Because assets are not perfectly correlated, their idiosyncratic movements partly offset, so portfolio volatility is below the weighted average. Company-specific risk can be diversified away; systematic market risk cannot, which is why only systematic risk earns a premium.",
      "Como los activos no están perfectamente correlacionados, sus movimientos específicos se compensan en parte y la volatilidad de la cartera es menor que la media ponderada. El riesgo específico se diversifica; el sistemático no, por eso solo este último tiene prima.",
    ),
    followUpModelAnswer: b(
      "Correlations between risky assets tend to rise sharply in crises, so diversification works least when it is needed most. That is why investors also hold assets that tend to rally in stress, such as high-quality government bonds, or use explicit hedges.",
      "En las crisis las correlaciones entre activos de riesgo tienden a dispararse, así que la diversificación funciona peor justo cuando más se necesita. Por eso se mantienen activos que suelen subir en momentos de estrés, como deuda pública de calidad, o coberturas explícitas.",
    ),
    lesson: { courseId: "finance-101", lessonId: "risk-and-return" },
  },
  {
    id: "iv-sharpe",
    format: "technical",
    topics: ["quant"],
    tracks: ["asset-management", "hedge-funds", "quant-finance"],
    difficulty: "Beginner",
    prompt: b(
      "A portfolio returned 12% with 16% volatility. The risk-free rate was 4%. What is its Sharpe ratio?",
      "Una cartera rentó un 12% con una volatilidad del 16%. El tipo libre de riesgo fue del 4%. ¿Cuál es su ratio de Sharpe?",
    ),
    numeric: { value: 0.5, tolerance: 0.01, unit: "" },
    concepts: [],
    minConcepts: 0,
    followUp: {
      deeper: b("Correct, 0.5. Why might a high Sharpe ratio be misleading?", "Correcto, 0,5. ¿Por qué un Sharpe alto puede ser engañoso?"),
      probe: b("The Sharpe ratio is excess return divided by volatility. What is the excess return here?", "El Sharpe es la rentabilidad en exceso entre la volatilidad. ¿Cuál es aquí la rentabilidad en exceso?"),
      concepts: [
        c("tails", "Tail risk / non-normal returns", "Riesgo de cola / rendimientos no normales", ["tail", "option", "skew", "non.?normal", "crash", "cola", "asimetr", "opciones"], true),
        c("other", "Smoothing, illiquidity or short track record", "Suavizado, iliquidez o poco historial", ["smooth", "illiquid", "short (track|history)", "leverage", "suaviz", "iliquid", "historial", "apalanca"]),
        c("excess", "Excess return 8%", "Rentabilidad en exceso del 8%", ["\\b8 ?%", "\\b8 (percent|por ciento)"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b("Sharpe = (12% − 4%) / 16% = 0.5.", "Sharpe = (12% − 4%) / 16% = 0,5."),
    followUpModelAnswer: b(
      "Volatility misses tail risk: strategies that sell options can show smooth returns and a high Sharpe until a crash. Illiquid assets with smoothed prices understate volatility, and short track records make the estimate noisy.",
      "La volatilidad no capta el riesgo de cola: estrategias que venden opciones pueden mostrar rendimientos suaves y un Sharpe alto hasta un crash. Los activos ilíquidos con precios suavizados subestiman la volatilidad, y con poco historial la estimación es ruidosa.",
    ),
  },

  /* ───────────── Risk & quant ───────────── */
  {
    id: "iv-var",
    format: "technical",
    topics: ["credit-risk"],
    tracks: ["risk-management", "quant-finance", "sales-trading"],
    difficulty: "Intermediate",
    prompt: b("What is Value at Risk, and what are its limitations?", "¿Qué es el Value at Risk (VaR) y cuáles son sus limitaciones?"),
    concepts: [
      c("definition", "Loss threshold at a confidence level over a horizon", "Pérdida umbral con un nivel de confianza y horizonte", ["confidence", "99", "95", "horizon", "threshold", "probabil", "confianza", "horizonte", "umbral"], true),
      c("tail", "Says nothing about losses beyond it", "No dice nada de la pérdida más allá", ["tail", "beyond", "not the (max|worst)", "severity", "cola", "mas alla", "no es la (maxima|peor)"], true),
      c("model", "Model / distribution assumptions", "Supuestos de modelo y distribución", ["normal", "assum", "historical", "model", "supuest", "historic", "modelo"]),
      c("es", "Expected shortfall as a complement", "Expected shortfall como complemento", ["expected shortfall", "cvar", "conditional"]),
    ],
    minConcepts: 2,
    followUp: {
      deeper: b("How would you complement VaR in a risk report?", "¿Cómo complementarías el VaR en un informe de riesgos?"),
      probe: b(
        "If a desk's one-day 99% VaR is $1m, what exactly does that tell you, and what does it not tell you?",
        "Si el VaR diario al 99% de una mesa es de 1 M$, ¿qué te dice exactamente y qué no te dice?",
      ),
      concepts: [
        c("es", "Expected shortfall", "Expected shortfall", ["expected shortfall", "cvar", "conditional"], true),
        c("stress", "Stress tests and scenarios", "Pruebas de estrés y escenarios", ["stress", "scenario", "estres", "escenario"]),
        c("one-in-100", "Losses exceed it about 1 day in 100", "Se supera ~1 día de cada 100", ["1 (day )?(in|out of) 100", "1 ?%", "uno de cada 100", "1 de cada 100"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "VaR is the loss threshold that should only be exceeded with a given probability over a given horizon, e.g. one-day 99% VaR. It does not say how large losses are beyond that threshold, depends on distributional and historical assumptions, and is not always subadditive.",
      "El VaR es la pérdida umbral que solo debería superarse con cierta probabilidad en un horizonte dado, por ejemplo el VaR diario al 99%. No indica la magnitud de las pérdidas más allá del umbral, depende de supuestos de distribución e históricos y no siempre es subaditivo.",
    ),
    followUpModelAnswer: b(
      "With expected shortfall (the average loss beyond VaR), stress tests and scenario analysis for historical or hypothetical shocks, plus concentration and liquidity limits.",
      "Con el expected shortfall (pérdida media más allá del VaR), pruebas de estrés y análisis de escenarios históricos o hipotéticos, además de límites de concentración y liquidez.",
    ),
  },
  {
    id: "iv-credit-assessment",
    format: "technical",
    topics: ["credit-risk"],
    tracks: ["risk-management", "asset-management", "investment-banking", "private-equity"],
    difficulty: "Intermediate",
    prompt: b("How would you assess a company's credit risk?", "¿Cómo evaluarías el riesgo de crédito de una empresa?"),
    concepts: [
      c("leverage", "Leverage: debt / EBITDA", "Apalancamiento: deuda / EBITDA", ["leverage", "debt ?/ ?ebitda", "apalanca", "deuda ?/ ?ebitda"], true),
      c("coverage", "Interest coverage", "Cobertura de intereses", ["coverage", "interest", "cobertura", "intereses"]),
      c("liquidity", "Liquidity and maturities", "Liquidez y vencimientos", ["liquidity", "maturit", "refinanc", "liquidez", "vencimiento"]),
      c("business", "Business risk and cash flow stability", "Riesgo de negocio y estabilidad de flujos", ["business", "cyclical", "stab", "industry", "negocio", "ciclic", "sector", "estab"]),
      c("structure", "Seniority, security and covenants", "Prelación, garantías y covenants", ["senior", "secur", "covenant", "collateral", "garantia", "prelacion"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("In a downturn, which matters more: leverage or liquidity?", "En una crisis, ¿qué importa más: el apalancamiento o la liquidez?"),
      probe: b("Which two or three ratios would you calculate first?", "¿Qué dos o tres ratios calcularías primero?"),
      concepts: [
        c("liquidity", "Liquidity: companies default when they cannot pay", "Liquidez: se impaga cuando no se puede pagar", ["liquidity", "liquidez", "cash", "caja"], true),
        c("ratios", "Debt/EBITDA and interest coverage", "Deuda/EBITDA y cobertura", ["ebitda", "coverage", "cobertura"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Start with business risk: industry, competitive position and cash-flow stability. Then leverage (net debt / EBITDA), coverage (EBITDA / interest) and free cash flow to debt. Check liquidity and the maturity profile, the structure (seniority, security, covenants) and financial policy, and stress the numbers in a downside case.",
      "Empezaría por el riesgo de negocio: sector, posición competitiva y estabilidad de los flujos. Después apalancamiento (deuda neta / EBITDA), cobertura (EBITDA / intereses) y flujo de caja libre sobre deuda. Revisaría la liquidez y los vencimientos, la estructura (prelación, garantías, covenants) y la política financiera, y estresaría las cifras en un escenario adverso.",
    ),
    followUpModelAnswer: b(
      "Liquidity in the short run: highly levered companies can survive if they have cash and no near-term maturities, while moderately levered ones can default if they cannot refinance. Leverage determines how much cushion there is over time.",
      "A corto plazo, la liquidez: empresas muy apalancadas pueden sobrevivir si tienen caja y no tienen vencimientos próximos, mientras que otras moderadamente endeudadas pueden impagar si no refinancian. El apalancamiento determina el colchón a medio plazo.",
    ),
  },
  {
    id: "iv-bayes",
    format: "technical",
    topics: ["quant", "brain-teasers"],
    tracks: ["quant-finance", "risk-management", "hedge-funds", "sales-trading"],
    difficulty: "Advanced",
    prompt: b(
      "1% of people have a condition. A test detects it 99% of the time, but gives a false positive for 5% of healthy people. Someone tests positive. What is the probability, in percent, that they have it?",
      "El 1% de las personas tiene una condición. Un test la detecta el 99% de las veces, pero da falso positivo en el 5% de las personas sanas. Alguien da positivo. ¿Qué probabilidad hay, en porcentaje, de que la tenga?",
    ),
    numeric: { value: 16.7, tolerance: 0.4, unit: "%" },
    concepts: [c("bayes", "Bayes' rule / base rate", "Regla de Bayes / tasa base", ["bayes", "base rate", "prior", "tasa base", "a priori"])],
    minConcepts: 0,
    followUp: {
      deeper: b("Correct, about 16.7%. Why is it so low when the test is 99% accurate?", "Correcto, en torno al 16,7%. ¿Por qué es tan bajo si el test acierta el 99%?"),
      probe: b(
        "Use Bayes' rule. First, what is the overall probability of testing positive?",
        "Usa la regla de Bayes. Primero, ¿cuál es la probabilidad total de dar positivo?",
      ),
      concepts: [
        c("base", "Low base rate: most positives are false", "Tasa base baja: la mayoría de positivos son falsos", ["base rate", "rare", "false positive", "most positives", "tasa base", "poco frecuente", "falsos positivos", "rara"], true),
        c("total", "P(positive) = 5.94%", "P(positivo) = 5,94%", ["5[.,]94", "0[.,]0594"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "P(+) = 0.01 × 0.99 + 0.99 × 0.05 = 0.0594. P(condition | +) = 0.0099 / 0.0594 ≈ 16.7%.",
      "P(+) = 0,01 × 0,99 + 0,99 × 0,05 = 0,0594. P(condición | +) = 0,0099 / 0,0594 ≈ 16,7%.",
    ),
    followUpModelAnswer: b(
      "Because the condition is rare: among 10,000 people, about 99 true positives compare with about 495 false positives from the healthy 9,900, so most positives are false.",
      "Porque la condición es poco frecuente: de 10.000 personas, unos 99 positivos verdaderos frente a unos 495 falsos positivos de las 9.900 sanas, así que la mayoría de positivos son falsos.",
    ),
  },
  {
    id: "iv-dice-max",
    format: "technical",
    topics: ["quant", "brain-teasers"],
    tracks: ["quant-finance", "sales-trading", "hedge-funds"],
    difficulty: "Advanced",
    prompt: b(
      "You roll two fair dice. What is the expected value of the higher of the two numbers? (Two decimals.)",
      "Lanzas dos dados equilibrados. ¿Cuál es el valor esperado del mayor de los dos números? (Dos decimales.)",
    ),
    numeric: { value: 4.47, tolerance: 0.02, unit: "" },
    concepts: [c("method", "P(max ≤ k) = (k/6)²", "P(máx ≤ k) = (k/6)²", ["k ?/ ?6", "\\^ ?2", "squared", "al cuadrado", "36"])],
    minConcepts: 0,
    followUp: {
      deeper: b("Correct, 161/36 ≈ 4.47. What is the expected value of the lower number?", "Correcto, 161/36 ≈ 4,47. ¿Cuál es el valor esperado del menor?"),
      probe: b(
        "Try this: what is the probability that the maximum is at most k? From there, find P(max = k).",
        "Prueba así: ¿cuál es la probabilidad de que el máximo sea como mucho k? A partir de ahí, calcula P(máx = k).",
      ),
      concepts: [
        c("min", "E[min] = 7 − 4.47 ≈ 2.53", "E[mín] = 7 − 4,47 ≈ 2,53", ["2[.,]53", "91 ?/ ?36", "7 ?- ?4[.,]47"], true),
        c("cdf", "P(max ≤ k) = (k/6)²", "P(máx ≤ k) = (k/6)²", ["k ?/ ?6", "squared", "cuadrado"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "P(max ≤ k) = (k/6)², so P(max = k) = (2k − 1)/36. E[max] = Σ k(2k − 1)/36 = 161/36 ≈ 4.47.",
      "P(máx ≤ k) = (k/6)², así que P(máx = k) = (2k − 1)/36. E[máx] = Σ k(2k − 1)/36 = 161/36 ≈ 4,47.",
    ),
    followUpModelAnswer: b(
      "max + min = sum of the two dice, whose expectation is 7, so E[min] = 7 − 161/36 = 91/36 ≈ 2.53.",
      "máx + mín = suma de los dos dados, cuya esperanza es 7, así que E[mín] = 7 − 161/36 = 91/36 ≈ 2,53.",
    ),
  },

  /* ───────────── Consulting cases ───────────── */
  {
    id: "iv-airline-profit",
    format: "case",
    topics: ["strategy"],
    tracks: ["consulting", "corporate-finance"],
    difficulty: "Intermediate",
    prompt: b(
      "Our client, a regional airline, has seen profits fall despite record passenger numbers. How would you approach this?",
      "Nuestro cliente, una aerolínea regional, ha visto caer sus beneficios a pesar de un número récord de pasajeros. ¿Cómo lo abordarías?",
    ),
    concepts: [
      c("tree", "Profit = revenue − costs", "Beneficio = ingresos − costes", ["revenue", "cost", "profit (tree|=)", "ingresos", "costes", "costos"], true),
      c("price", "Price / yield per passenger and mix", "Precio por pasajero y mix", ["price", "yield", "fare", "ticket", "mix", "precio", "tarifa", "billete"]),
      c("costs", "Cost drivers: fuel, labour, fees", "Costes: combustible, personal, tasas", ["fuel", "labou?r", "staff", "airport", "maintenance", "combustible", "personal", "tasas", "mantenimiento"]),
      c("capacity", "Capacity and load factor", "Capacidad y factor de ocupación", ["capacity", "load factor", "seats", "routes", "capacidad", "ocupacion", "asientos", "rutas"]),
      c("benchmark", "Benchmark competitors", "Comparar con competidores", ["competitor", "benchmark", "industry", "competencia", "competidores", "sector"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b(
        "Data shows fuel costs rose 35% while average fares were flat. What would you recommend?",
        "Los datos muestran que el combustible subió un 35% mientras las tarifas medias se mantuvieron. ¿Qué recomendarías?",
      ),
      probe: b(
        "Start from the profit equation. If passenger volumes are up, where could the problem be?",
        "Parte de la ecuación de beneficio. Si los pasajeros aumentan, ¿dónde puede estar el problema?",
      ),
      concepts: [
        c("levers", "Pricing, hedging, efficiency and route cuts", "Precios, coberturas, eficiencia y rutas", ["price", "surcharge", "hedg", "fuel.?efficien", "fleet", "route", "precio", "recargo", "cobertura", "flota", "rutas"], true),
        c("prioritise", "Prioritise by impact and feasibility", "Priorizar por impacto y viabilidad", ["prioriti", "impact", "quick win", "short.?term", "long.?term", "priorizar", "impacto", "corto plazo", "largo plazo"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Profit = revenue − costs. Revenue: more passengers, so check average fare (yield), route and customer mix, and ancillary revenue. Costs: split into fuel, labour, airport fees, maintenance and leases, and look at cost per available seat. Check capacity and load factor, then benchmark competitors to see whether the problem is industry-wide (e.g. fuel prices) or company-specific.",
      "Beneficio = ingresos − costes. Ingresos: hay más pasajeros, así que revisaría la tarifa media, el mix de rutas y clientes y los ingresos complementarios. Costes: combustible, personal, tasas, mantenimiento y arrendamientos, y el coste por asiento disponible. Revisaría capacidad y ocupación, y compararía con competidores para ver si es un problema del sector (p. ej., el combustible) o propio.",
    ),
    followUpModelAnswer: b(
      "Short term: pass through part of the cost with pricing or fuel surcharges where demand allows, and review the fuel-hedging policy. Medium term: improve fuel efficiency (fleet, routes, operations) and cut or re-price unprofitable routes. Prioritise by impact and feasibility.",
      "A corto plazo: trasladar parte del coste a precios o recargos donde la demanda lo permita y revisar la política de coberturas de combustible. A medio plazo: mejorar la eficiencia (flota, rutas, operaciones) y eliminar o reajustar rutas no rentables. Priorizar por impacto y viabilidad.",
    ),
  },
  {
    id: "iv-coffee-sizing",
    format: "case",
    topics: ["strategy", "brain-teasers"],
    tracks: ["consulting"],
    difficulty: "Beginner",
    prompt: b(
      "Estimate the annual revenue from coffee sold in cafés in Madrid. Talk me through your structure and assumptions.",
      "Estima los ingresos anuales por café vendido en cafeterías de Madrid. Explícame tu estructura y tus hipótesis.",
    ),
    concepts: [
      c("population", "Start from population", "Partir de la población", ["population", "million", "people", "inhabitants", "poblacion", "millones", "habitantes", "personas"], true),
      c("frequency", "Share who drink coffee out and frequency", "Porcentaje que toma café fuera y frecuencia", ["per (day|week)", "frequency", "percent", "share", "%", "al dia", "a la semana", "frecuencia", "porcentaje"], true),
      c("price", "Price per cup", "Precio por taza", ["price", "per cup", "€", "euro", "precio", "por cafe", "por taza"]),
      c("check", "Sanity check / tourists and commuters", "Comprobación / turistas y trabajadores", ["sanity", "check", "tourist", "commut", "comprob", "turista", "trabajadores"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b(
        "Which assumption is your estimate most sensitive to, and how would you test it?",
        "¿A qué hipótesis es más sensible tu estimación y cómo la comprobarías?",
      ),
      probe: b(
        "Break it into population × share who buy coffee out × cups per year × price. What is your first assumption?",
        "Descomponlo en población × porcentaje que toma café fuera × tazas al año × precio. ¿Cuál es tu primera hipótesis?",
      ),
      concepts: [
        c("sensitive", "Frequency or price", "Frecuencia o precio", ["frequency", "price", "cups", "frecuencia", "precio", "tazas"], true),
        c("test", "Test with data: surveys, café counts, observation", "Comprobar con datos: encuestas, conteos", ["survey", "data", "observ", "count", "encuesta", "datos", "contar"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Population of the city is roughly 3.3–3.5 million (more if you include the metro area and commuters). Assume half of adults buy coffee out, around 4 times a week, so about 200 cups a year each; with roughly 1.4 million such buyers that is about 280 million cups. At about €1.50–2 a cup, revenue is roughly €450–550 million. Then sanity-check with a bottom-up view, such as number of cafés × cups sold per day, and adjust for tourists and commuters.",
      "La ciudad tiene unos 3,3–3,5 millones de habitantes (más con el área metropolitana y quienes vienen a trabajar). Supongo que la mitad de los adultos toma café fuera unas 4 veces por semana, unas 200 tazas al año; con ~1,4 millones de compradores son unos 280 millones de tazas. A 1,50–2 € por taza, los ingresos rondan 450–550 millones de €. Después lo contrastaría de abajo arriba (número de cafeterías × tazas al día) y ajustaría por turistas y trabajadores.",
    ),
    followUpModelAnswer: b(
      "Frequency and price drive the result most. I would test them with a quick bottom-up check (cafés in a district × cups per day from observation) or survey data, and present a range rather than a point estimate.",
      "La frecuencia y el precio son los que más influyen. Los comprobaría con un cálculo de abajo arriba (cafeterías de un distrito × tazas al día por observación) o con encuestas, y presentaría un rango en vez de un número.",
    ),
  },
  {
    id: "iv-break-even",
    format: "case",
    topics: ["strategy"],
    tracks: ["consulting", "corporate-finance"],
    difficulty: "Beginner",
    prompt: b(
      "A gym has fixed costs of €40,000 a month. Membership is €50 a month and the variable cost per member is €10. How many members does it need to break even?",
      "Un gimnasio tiene costes fijos de 40.000 € al mes. La cuota es de 50 € al mes y el coste variable por socio es de 10 €. ¿Cuántos socios necesita para cubrir costes?",
    ),
    numeric: { value: 1000, tolerance: 0, unit: "members" },
    concepts: [c("margin", "Contribution margin €40", "Margen de contribución 40 €", ["\\b40\\b", "contribution", "contribucion"])],
    minConcepts: 0,
    followUp: {
      deeper: b(
        "Correct, 1,000 members. The owner wants to break even with 20% fewer members. What levers could get there?",
        "Correcto, 1.000 socios. El propietario quiere cubrir costes con un 20% menos de socios. ¿Qué palancas podría usar?",
      ),
      probe: b("What is the contribution margin per member?", "¿Cuál es el margen de contribución por socio?"),
      concepts: [
        c("levers", "Raise price, cut variable or fixed costs, upsell", "Subir precio, bajar costes, vender servicios extra", ["price", "fixed cost", "variable", "upsell", "personal training", "precio", "costes fijos", "variable", "servicios"], true),
        c("math", "800 members needs €50 margin (e.g. €60 price)", "800 socios requiere 50 € de margen", ["800", "\\b50\\b", "\\b60\\b", "32[.,]?000"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Contribution margin = €50 − €10 = €40 per member. Break-even = €40,000 / €40 = 1,000 members.",
      "Margen de contribución = 50 € − 10 € = 40 € por socio. Punto muerto = 40.000 € / 40 € = 1.000 socios.",
    ),
    followUpModelAnswer: b(
      "At 800 members the margin must be €50 (€40,000 / 800), so raise the price to €60, cut variable cost to €0, reduce fixed costs to €32,000, or combine levers, for example a modest price rise plus paid add-ons such as personal training.",
      "Con 800 socios el margen debe ser de 50 € (40.000 € / 800): subir la cuota a 60 €, reducir el coste variable a 0 €, bajar los fijos a 32.000 € o combinar palancas, por ejemplo una subida moderada de precio y servicios adicionales de pago.",
    ),
  },
  {
    id: "iv-market-entry",
    format: "case",
    topics: ["strategy"],
    tracks: ["consulting", "corporate-finance", "investment-banking"],
    difficulty: "Intermediate",
    prompt: b(
      "A Spanish bank wants to enter the Portuguese market. How would you structure the decision?",
      "Un banco español quiere entrar en el mercado portugués. ¿Cómo estructurarías la decisión?",
    ),
    concepts: [
      c("market", "Market attractiveness: size, growth, profitability", "Atractivo del mercado: tamaño, crecimiento, rentabilidad", ["size", "growth", "profitab", "attractive", "tamano", "crecimiento", "rentab", "atractiv"], true),
      c("competition", "Competitive landscape", "Competencia", ["compet", "incumbent", "share", "competencia", "cuota"]),
      c("capability", "Can we win: capabilities and advantage", "Capacidad para ganar", ["capabilit", "advantage", "win", "synerg", "capacidad", "ventaja", "sinergia", "ganar"]),
      c("mode", "Entry mode: organic, acquisition, partnership", "Modo de entrada: orgánico, adquisición, alianza", ["organic", "acqui", "partner", "joint venture", "organico", "adquisi", "alianza"]),
      c("risk", "Economics, regulation and risks", "Economía, regulación y riesgos", ["regulat", "risk", "capital", "return", "regulac", "riesgo", "retorno"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("Would you recommend organic entry or an acquisition? Why?", "¿Recomendarías entrar de forma orgánica o mediante una adquisición? ¿Por qué?"),
      probe: b("Before deciding how to enter, what do we need to know about the market itself?", "Antes de decidir cómo entrar, ¿qué necesitamos saber del propio mercado?"),
      concepts: [
        c("tradeoff", "Speed vs cost and integration risk", "Rapidez frente a coste y riesgo de integración", ["speed", "fast", "premium", "integration", "cost", "rapid", "prima", "integracion", "coste"], true),
        c("control", "Control, customers and licences", "Control, clientes y licencias", ["control", "customer", "licen", "brand", "clientes", "licencia", "marca"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Two questions: is the market attractive (size, growth, profitability, competition, regulation) and can we win there (capabilities, synergies with the Spanish business, customer proposition)? Then compare entry modes, organic, acquisition or partnership, on cost, speed, risk and expected return on capital.",
      "Dos preguntas: ¿es atractivo el mercado (tamaño, crecimiento, rentabilidad, competencia, regulación) y podemos ganar en él (capacidades, sinergias con el negocio en España, propuesta al cliente)? Después compararía los modos de entrada (orgánico, adquisición o alianza) por coste, rapidez, riesgo y rentabilidad esperada del capital.",
    ),
    followUpModelAnswer: b(
      "Banking scale matters and organic customer acquisition is slow, so an acquisition gives immediate customers, deposits and licences, at the cost of a premium and integration risk. Organic entry is cheaper and more controlled but slow. A niche digital-first organic entry or a partnership can be middle grounds.",
      "En banca la escala importa y captar clientes orgánicamente es lento, así que una adquisición da clientes, depósitos y licencias de inmediato, a cambio de una prima y riesgo de integración. La entrada orgánica es más barata y controlada pero lenta. Una entrada digital en un nicho o una alianza pueden ser términos medios.",
    ),
  },

  /* ───────────── Behavioural ───────────── */
  {
    id: "iv-why-career",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Beginner",
    prompt: b("Why this career path, and why now?", "¿Por qué esta carrera profesional y por qué ahora?"),
    concepts: [
      c("specific", "Specific, genuine interest", "Interés concreto y genuino", ["interest", "fascinat", "passion", "enjoy", "interes", "me apasiona", "me gusta", "disfruto"], true),
      c("evidence", "Evidence: internship, project, club", "Evidencia: prácticas, proyecto, club", ["internship", "project", "club", "competition", "course", "experience", "practicas", "proyecto", "competicion", "experiencia", "curso"], true),
      c("role", "Understanding of the role", "Entender el puesto", ["role", "day.?to.?day", "analyst", "clients", "deals", "puesto", "analista", "clientes", "operaciones"]),
      c("fit", "Skills fit and long-term goal", "Encaje de habilidades y objetivo a largo plazo", ["skill", "strength", "long.?term", "learn", "goal", "habilidad", "fortaleza", "largo plazo", "aprender", "objetivo"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("What do you expect to be the hardest part of the job for you, personally?", "¿Qué esperas que sea lo más difícil del trabajo para ti, personalmente?"),
      probe: b("Can you give me a concrete experience that sparked or confirmed that interest?", "¿Puedes darme una experiencia concreta que despertara o confirmara ese interés?"),
      concepts: [
        c("honest", "Honest, specific challenge", "Reto honesto y concreto", ["challeng", "difficult", "hard", "weak", "reto", "dificil", "debilidad"], true),
        c("plan", "Plan to handle it", "Plan para gestionarlo", ["plan", "prepar", "learn", "improv", "already", "preparar", "aprender", "mejorar", "ya estoy"]),
        c("example", "Concrete example", "Ejemplo concreto", ["when i", "for example", "during", "cuando", "por ejemplo", "durante"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "A strong answer connects a genuine, specific interest to concrete evidence (an internship, a project, an investment club, a competition), shows understanding of what the job involves day to day, and explains why your skills fit and how the role fits your longer-term goals. Avoid generic answers about money or prestige.",
      "Una buena respuesta conecta un interés genuino y concreto con evidencias (prácticas, un proyecto, un club de inversión, una competición), demuestra que entiendes el día a día del puesto y explica por qué encajan tus habilidades y cómo encaja el puesto en tus objetivos a largo plazo. Evita respuestas genéricas sobre dinero o prestigio.",
    ),
    followUpModelAnswer: b(
      "Name a real challenge (long hours, attention to detail under time pressure, learning modelling quickly), show self-awareness, and describe what you are already doing about it.",
      "Menciona un reto real (las horas, la atención al detalle bajo presión, aprender a modelizar rápido), demuestra autoconocimiento y explica qué estás haciendo ya para afrontarlo.",
    ),
  },
  {
    id: "iv-teamwork",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Beginner",
    prompt: b("Tell me about a time you worked in a team under pressure.", "Cuéntame una ocasión en la que trabajaste en equipo bajo presión."),
    concepts: [
      c("situation", "Situation and task", "Situación y tarea", ["deadline", "project", "team", "situation", "plazo", "proyecto", "equipo", "situacion"], true),
      c("action", "What you personally did", "Lo que hiciste tú", ["\\bi (organi|took|led|proposed|decided|built|split|created)", "my role", "\\byo\\b", "mi papel", "organice", "propuse", "decidi", "lidere"], true),
      c("result", "Result, ideally quantified", "Resultado, idealmente cuantificado", ["result", "deliver", "won", "achiev", "on time", "resultado", "entregamos", "ganamos", "conseguimos", "a tiempo"]),
      c("learning", "What you learned", "Qué aprendiste", ["learn", "lesson", "next time", "aprendi", "leccion", "la proxima vez"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("Looking back, what would you do differently?", "Mirando atrás, ¿qué harías de otra manera?"),
      probe: b("What specifically did *you* do, and what was the outcome?", "¿Qué hiciste *tú* exactamente y cuál fue el resultado?"),
      concepts: [
        c("reflection", "Specific reflection", "Reflexión concreta", ["differently", "would have", "earlier", "next time", "de otra manera", "habria", "antes", "la proxima vez"], true),
        c("result", "Outcome", "Resultado", ["result", "outcome", "resultado"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Use STAR: the Situation and Task in one or two sentences, then most of the time on the Actions you personally took (not “we”), the Result, quantified if possible, and a short reflection on what you learned.",
      "Usa el método STAR: Situación y Tarea en una o dos frases, y la mayor parte del tiempo en las Acciones que tomaste tú (no “nosotros”), el Resultado, cuantificado si es posible, y una breve reflexión sobre lo aprendido.",
    ),
    followUpModelAnswer: b(
      "Give a specific, credible improvement, such as aligning on roles earlier or flagging a risk sooner, rather than a generic “I'd communicate more”.",
      "Da una mejora concreta y creíble, como repartir roles antes o avisar antes de un riesgo, en lugar de un genérico “me comunicaría más”.",
    ),
  },
  {
    id: "iv-market-development",
    format: "market",
    topics: ["markets", "macro"],
    tracks: ["sales-trading", "hedge-funds", "asset-management", "equity-research", "risk-management"],
    difficulty: "Intermediate",
    prompt: b(
      "Tell me about a market development you've been following recently and why it matters.",
      "Háblame de algún acontecimiento de mercado que hayas seguido recientemente y por qué es importante.",
    ),
    concepts: [
      c("what", "What happened, precisely", "Qué ocurrió, con precisión", ["announce", "rose", "fell", "decision", "data", "report", "anuncio", "subio", "cayo", "decision", "dato"], true),
      c("why", "Drivers / why it happened", "Por qué ocurrió", ["because", "driven", "due to", "reason", "porque", "debido", "causa", "motivo"], true),
      c("impact", "Impact on assets or sectors", "Impacto en activos o sectores", ["bond", "equit", "currency", "sector", "yield", "spread", "bonos", "bolsa", "divisa", "sector", "rentabilidad"]),
      c("view", "Your own view", "Tu propia opinión", ["i think", "i believe", "my view", "in my opinion", "creo", "en mi opinion", "pienso"]),
      c("risks", "What would change your mind", "Qué te haría cambiar de opinión", ["risk", "change my mind", "uncertain", "riesgo", "cambiar de opinion", "incertidumbre"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("How would you position a portfolio for that, and what would prove you wrong?", "¿Cómo posicionarías una cartera ante eso y qué demostraría que te equivocas?"),
      probe: b("Why does it matter for markets? Which assets does it affect and how?", "¿Por qué importa para los mercados? ¿A qué activos afecta y cómo?"),
      concepts: [
        c("position", "Concrete positioning", "Posicionamiento concreto", ["long", "short", "overweight", "underweight", "hedge", "largo", "corto", "sobreponder", "infraponder", "cobertura"], true),
        c("wrong", "Signals that invalidate the view", "Señales que invalidan la visión", ["wrong", "if .* then", "signal", "data", "equivoc", "senal", "dato"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Pick something you genuinely follow. State precisely what happened, explain the drivers, trace the impact on specific assets or sectors, give your own view, and say what would change your mind. Interviewers check that you follow markets and can reason from cause to effect; they will probe the details, so choose a topic you know well.",
      "Elige algo que sigas de verdad. Explica con precisión qué ocurrió, sus causas, el impacto en activos o sectores concretos, tu opinión y qué te haría cambiar de opinión. El entrevistador comprueba que sigues los mercados y razonas de causa a efecto; preguntará detalles, así que elige un tema que domines.",
    ),
    followUpModelAnswer: b(
      "Translate the view into a position (for example overweight or underweight an asset, or a relative-value trade), size it sensibly, and name the data or events that would invalidate it.",
      "Traduce la visión en una posición (por ejemplo, sobreponderar o infraponderar un activo, o una operación de valor relativo), dimensiónala con sensatez y señala qué datos o acontecimientos la invalidarían.",
    ),
  },
  {
    id: "iv-rates-equity",
    format: "market",
    topics: ["macro", "valuation"],
    tracks: ["asset-management", "equity-research", "hedge-funds", "investment-banking"],
    difficulty: "Intermediate",
    prompt: b("How do higher interest rates affect equity valuations?", "¿Cómo afectan unos tipos de interés más altos a la valoración de las acciones?"),
    concepts: [
      c("discount", "Higher discount rate lowers present values", "Mayor tasa de descuento, menor valor presente", [...BECAUSE_DISCOUNT, "wacc", "cost of equity", "coste del equity"], true),
      c("duration", "Long-duration / growth stocks hit hardest", "Más afectadas las de crecimiento / larga duración", ["growth", "duration", "far in the future", "crecimiento", "duracion", "lejan"]),
      c("cashflow", "Cash flows: interest costs, demand", "Flujos: costes financieros, demanda", ["interest (cost|expense)", "demand", "borrowing", "refinanc", "gastos financieros", "demanda", "financiacion"]),
      c("winners", "Some sectors benefit (e.g. banks)", "Algunos sectores ganan (p. ej., bancos)", ["bank", "financials", "cash.?rich", "banco", "financier"]),
    ],
    minConcepts: 2,
    followUp: {
      deeper: b("Why are growth stocks more sensitive to rates than value stocks?", "¿Por qué las acciones de crecimiento son más sensibles a los tipos que las de valor?"),
      probe: b("Think about a DCF: which input do interest rates change directly?", "Piensa en un DCF: ¿qué variable cambian directamente los tipos de interés?"),
      concepts: [
        c("future", "More of their value lies far in the future", "Más valor muy lejos en el futuro", ["future", "later", "terminal", "duration", "futuro", "lejan", "terminal", "duracion"], true),
        c("rate", "Discount rate / risk-free rate", "Tasa de descuento / tipo libre de riesgo", ["discount", "risk.?free", "wacc", "descuento", "libre de riesgo"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Two channels. Discount rates: higher risk-free rates raise the cost of equity and WACC, lowering the present value of future cash flows. Cash flows: higher borrowing costs and weaker demand can reduce earnings. Long-duration growth stocks suffer most, while some sectors, such as banks, may benefit from wider margins.",
      "Dos vías. Tasa de descuento: tipos libres de riesgo más altos elevan el coste del equity y el WACC, reduciendo el valor presente de los flujos futuros. Flujos: más gastos financieros y menor demanda pueden reducir beneficios. Las de crecimiento sufren más, mientras que algunos sectores, como la banca, pueden beneficiarse de mayores márgenes.",
    ),
    followUpModelAnswer: b(
      "Growth companies earn most of their cash flows far in the future, so they have long duration, like a long bond. The discount factor 1/(1+r)ⁿ is most sensitive to r when n is large.",
      "Las empresas de crecimiento generan la mayor parte de sus flujos muy lejos en el futuro, así que tienen una duración larga, como un bono largo. El factor de descuento 1/(1+r)ⁿ es más sensible a r cuando n es grande.",
    ),
    lesson: { courseId: "finance-101", lessonId: "time-value-of-money" },
  },
];
