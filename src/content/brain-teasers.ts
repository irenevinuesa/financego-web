/**
 * Brain teasers: the puzzles trading, quant and consulting interviewers use to see how you think.
 * Teasers with a single numeric answer can be checked; the rest reveal a worked solution.
 * All learner-facing text is bilingual (EN/ES).
 */
import type { Bilingual, Lang } from "./types";

export const TEASER_CATEGORIES = {
  probability: {
    label: { en: "Probability", es: "Probabilidad" },
    blurb: { en: "Coins, dice, cards and conditional probability.", es: "Monedas, dados, cartas y probabilidad condicionada." },
  },
  "expected-value": {
    label: { en: "Expected value", es: "Valor esperado" },
    blurb: { en: "Games, payouts and how many tries it takes.", es: "Juegos, pagos y cuántos intentos hacen falta." },
  },
  "mental-maths": {
    label: { en: "Mental maths", es: "Cálculo mental" },
    blurb: { en: "Fast arithmetic without a calculator.", es: "Aritmética rápida sin calculadora." },
  },
  logic: {
    label: { en: "Logic puzzles", es: "Acertijos de lógica" },
    blurb: { en: "Classic puzzles with a clever trick.", es: "Acertijos clásicos con un truco ingenioso." },
  },
  sequences: {
    label: { en: "Sequences", es: "Secuencias" },
    blurb: { en: "Spot the pattern and find the next term.", es: "Encuentra el patrón y el siguiente término." },
  },
  estimation: {
    label: { en: "Estimation", es: "Estimación" },
    blurb: { en: "Market sizing: structure beats precision.", es: "Market sizing: la estructura importa más que la precisión." },
  },
} as const satisfies Record<string, { label: Bilingual; blurb: Bilingual }>;

export type TeaserCategory = keyof typeof TEASER_CATEGORIES;
export const TEASER_CATEGORY_IDS = Object.keys(TEASER_CATEGORIES) as TeaserCategory[];

export type TeaserDifficulty = "Easy" | "Medium" | "Hard";
export const TEASER_DIFFICULTIES: TeaserDifficulty[] = ["Easy", "Medium", "Hard"];
/** How each difficulty is shown in the UI. */
export const TEASER_DIFFICULTY_LABELS: Record<TeaserDifficulty, Bilingual> = {
  Easy: { en: "Easy", es: "Fácil" },
  Medium: { en: "Medium", es: "Media" },
  Hard: { en: "Hard", es: "Difícil" },
};

/** How a unit is written next to the answer box, per language. */
export const TEASER_UNIT_LABELS: Record<string, Bilingual> = {
  cents: { en: "cents", es: "céntimos" },
  day: { en: "day", es: "día" },
};

export function teaserUnitLabel(unit: string, lang: Lang): string {
  return TEASER_UNIT_LABELS[unit]?.[lang] ?? unit;
}

export interface Teaser {
  id: string;
  category: TeaserCategory;
  difficulty: TeaserDifficulty;
  title: Bilingual;
  prompt: Bilingual;
  hint: Bilingual;
  /** Present when the answer is one number the learner can type. */
  answer?: { value: number; tolerance: number; unit?: string };
  /** The answer in words, shown when revealed. */
  answerText: Bilingual;
  solution: Bilingual;
}

const n = (value: number, unit?: string, tolerance = 0) => ({ value, unit, tolerance });

export const TEASERS: Teaser[] = [
  /* ───────────── Probability ───────────── */
  {
    id: "bt-three-coins",
    category: "probability",
    difficulty: "Easy",
    title: { en: "Three coins", es: "Tres monedas" },
    prompt: {
      en: "You flip three fair coins. What is the probability of exactly two heads? (in %)",
      es: "Lanzas tres monedas equilibradas. ¿Cuál es la probabilidad de sacar exactamente dos caras? (en %)",
    },
    hint: {
      en: "Count the outcomes: how many of the 8 have exactly two heads?",
      es: "Cuenta los resultados: ¿cuántos de los 8 tienen exactamente dos caras?",
    },
    answer: n(37.5, "%", 0.1),
    answerText: { en: "3/8 = 37.5%", es: "3/8 = 37.5%" },
    solution: {
      en: "There are 2³ = 8 equally likely outcomes. Exactly two heads happens in HHT, HTH and THH: 3 outcomes. 3/8 = 37.5%.",
      es: "Hay 2³ = 8 resultados igual de probables. Exactamente dos caras se da en CCX, CXC y XCC (C = cara, X = cruz): 3 resultados. 3/8 = 37.5%.",
    },
  },
  {
    id: "bt-two-children",
    category: "probability",
    difficulty: "Medium",
    title: { en: "Two children", es: "Dos hijos" },
    prompt: {
      en: "A family has two children and at least one of them is a boy. What is the probability that both are boys? (in %, one decimal)",
      es: "Una familia tiene dos hijos y al menos uno es niño. ¿Cuál es la probabilidad de que los dos sean niños? (en %, un decimal)",
    },
    hint: {
      en: "List the equally likely families, then remove the ones the information rules out.",
      es: "Enumera las familias igual de probables y quita las que descarta la información.",
    },
    answer: n(33.3, "%", 0.2),
    answerText: { en: "1/3 ≈ 33.3%", es: "1/3 ≈ 33.3%" },
    solution: {
      en: "The four equally likely families are BB, BG, GB, GG. 'At least one boy' rules out GG, leaving three. Only BB has two boys: 1/3. Most people say 1/2 because they forget BG and GB are different families.",
      es: "Las cuatro familias igual de probables son NN, NA, AN, AA (N = niño, A = niña). «Al menos un niño» descarta AA y quedan tres. Solo NN tiene dos niños: 1/3. Casi todo el mundo dice 1/2 porque olvida que NA y AN son familias distintas.",
    },
  },
  {
    id: "bt-same-suit",
    category: "probability",
    difficulty: "Easy",
    title: { en: "Same suit", es: "Mismo palo" },
    prompt: {
      en: "You draw two cards from a shuffled 52-card deck. What is the probability they are the same suit? (in %, one decimal)",
      es: "Sacas dos cartas de una baraja francesa de 52 cartas bien mezclada. ¿Cuál es la probabilidad de que sean del mismo palo? (en %, un decimal)",
    },
    hint: {
      en: "The first card can be anything. What has to happen with the second?",
      es: "La primera carta puede ser cualquiera. ¿Qué tiene que pasar con la segunda?",
    },
    answer: n(23.5, "%", 0.2),
    answerText: { en: "12/51 ≈ 23.5%", es: "12/51 ≈ 23.5%" },
    solution: {
      en: "Whatever the first card is, 12 of the remaining 51 cards share its suit. 12/51 = 4/17 ≈ 23.5%.",
      es: "Sea cual sea la primera carta, 12 de las 51 restantes son de su mismo palo. 12/51 = 4/17 ≈ 23.5%.",
    },
  },
  {
    id: "bt-three-dice-different",
    category: "probability",
    difficulty: "Medium",
    title: { en: "All different", es: "Todos distintos" },
    prompt: {
      en: "You roll three fair dice. What is the probability that all three show different numbers? (in %, one decimal)",
      es: "Lanzas tres dados equilibrados. ¿Cuál es la probabilidad de que los tres muestren números distintos? (en %, un decimal)",
    },
    hint: {
      en: "Count the ways the second and third dice can avoid what came before.",
      es: "Cuenta de cuántas formas el segundo y el tercer dado pueden evitar lo que ya ha salido.",
    },
    answer: n(55.6, "%", 0.2),
    answerText: { en: "120/216 = 5/9 ≈ 55.6%", es: "120/216 = 5/9 ≈ 55.6%" },
    solution: {
      en: "The first die can be anything, the second must avoid one value (5/6) and the third must avoid two (4/6). 1 × 5/6 × 4/6 = 20/36 = 5/9 ≈ 55.6%.",
      es: "El primer dado puede ser cualquiera, el segundo debe evitar un valor (5/6) y el tercero dos (4/6). 1 × 5/6 × 4/6 = 20/36 = 5/9 ≈ 55.6%.",
    },
  },
  {
    id: "bt-birthday-23",
    category: "probability",
    difficulty: "Hard",
    title: { en: "The birthday problem", es: "El problema del cumpleaños" },
    prompt: {
      en: "Roughly what is the probability that at least two people in a room of 23 share a birthday? (in %, ignore leap years)",
      es: "¿Cuál es, aproximadamente, la probabilidad de que en una sala con 23 personas al menos dos cumplan años el mismo día? (en %, ignora los años bisiestos)",
    },
    hint: {
      en: "Work out the probability that nobody shares, then take it away from 1.",
      es: "Calcula la probabilidad de que nadie coincida y réstala de 1.",
    },
    answer: n(50.7, "%", 1.5),
    answerText: { en: "About 50.7%", es: "Alrededor del 50.7%" },
    solution: {
      en: "P(no shared birthday) = 365/365 × 364/365 × … × 343/365 ≈ 0.493, so the answer is about 1 − 0.493 = 50.7%. The intuition: 23 people make 253 pairs, and each pair has a 1/365 chance of matching.",
      es: "P(ningún cumpleaños compartido) = 365/365 × 364/365 × … × 343/365 ≈ 0.493, así que la respuesta es alrededor de 1 − 0.493 = 50.7%. La intuición: 23 personas forman 253 parejas, y cada pareja tiene una probabilidad de 1/365 de coincidir.",
    },
  },
  {
    id: "bt-bag-of-balls",
    category: "probability",
    difficulty: "Easy",
    title: { en: "Two red balls", es: "Dos bolas rojas" },
    prompt: {
      en: "A bag has 3 red and 2 blue balls. You draw two without replacement. What is the probability both are red? (in %)",
      es: "Una bolsa tiene 3 bolas rojas y 2 azules. Sacas dos sin reemplazo. ¿Cuál es la probabilidad de que las dos sean rojas? (en %)",
    },
    hint: {
      en: "Multiply the probability of red on the first draw by red on the second, given the first was red.",
      es: "Multiplica la probabilidad de roja en la primera extracción por la de roja en la segunda, sabiendo que la primera fue roja.",
    },
    answer: n(30, "%", 0.1),
    answerText: { en: "3/10 = 30%", es: "3/10 = 30%" },
    solution: {
      en: "3/5 for the first red, then 2/4 for the second: 3/5 × 2/4 = 6/20 = 30%.",
      es: "3/5 para la primera roja y luego 2/4 para la segunda: 3/5 × 2/4 = 6/20 = 30%.",
    },
  },
  {
    id: "bt-broken-stick",
    category: "probability",
    difficulty: "Hard",
    title: { en: "The broken stick", es: "El palo roto" },
    prompt: {
      en: "A stick is broken at two points chosen uniformly at random. What is the probability that the three pieces can form a triangle? (in %)",
      es: "Se rompe un palo por dos puntos elegidos al azar de forma uniforme. ¿Cuál es la probabilidad de que los tres trozos puedan formar un triángulo? (en %)",
    },
    hint: {
      en: "A triangle needs every piece shorter than half the stick.",
      es: "Para formar un triángulo, cada trozo tiene que medir menos de la mitad del palo.",
    },
    answer: n(25, "%", 0.5),
    answerText: { en: "1/4 = 25%", es: "1/4 = 25%" },
    solution: {
      en: "The pieces form a triangle only if none is longer than half the stick. Plotting the two break points on a unit square, the region where all three pieces are under 1/2 is a quarter of the area: 25%.",
      es: "Los trozos forman un triángulo solo si ninguno mide más de la mitad del palo. Si representas los dos puntos de rotura en un cuadrado unidad, la región donde los tres trozos miden menos de 1/2 es una cuarta parte del área: 25%.",
    },
  },
  {
    id: "bt-first-heads",
    category: "probability",
    difficulty: "Easy",
    title: { en: "Waiting for heads", es: "Esperando la cara" },
    prompt: {
      en: "You flip a fair coin until you get heads. What is the probability that it takes more than three flips? (in %)",
      es: "Lanzas una moneda equilibrada hasta que sale cara. ¿Cuál es la probabilidad de que necesites más de tres lanzamientos? (en %)",
    },
    hint: {
      en: "'More than three flips' means the first three were all tails.",
      es: "«Más de tres lanzamientos» significa que los tres primeros fueron cruz.",
    },
    answer: n(12.5, "%", 0.1),
    answerText: { en: "1/8 = 12.5%", es: "1/8 = 12.5%" },
    solution: {
      en: "It takes more than three flips only if the first three are tails: (1/2)³ = 1/8 = 12.5%.",
      es: "Hacen falta más de tres lanzamientos solo si los tres primeros son cruz: (1/2)³ = 1/8 = 12.5%.",
    },
  },

  /* ───────────── Expected value ───────────── */
  {
    id: "bt-ev-first-heads",
    category: "expected-value",
    difficulty: "Easy",
    title: { en: "Flips to heads", es: "Lanzamientos hasta cara" },
    prompt: {
      en: "On average, how many flips of a fair coin does it take to get the first heads?",
      es: "De media, ¿cuántos lanzamientos de una moneda equilibrada hacen falta para sacar la primera cara?",
    },
    hint: {
      en: "For an event with probability p each try, the expected number of tries is 1/p.",
      es: "Para un suceso con probabilidad p en cada intento, el número esperado de intentos es 1/p.",
    },
    answer: n(2),
    answerText: { en: "2 flips", es: "2 lanzamientos" },
    solution: {
      en: "Each flip succeeds with probability 1/2, so the expected wait is 1/(1/2) = 2.",
      es: "Cada lanzamiento tiene éxito con probabilidad 1/2, así que la espera esperada es 1/(1/2) = 2.",
    },
  },
  {
    id: "bt-ev-square",
    category: "expected-value",
    difficulty: "Easy",
    title: { en: "Paid the square", es: "Te pagan el cuadrado" },
    prompt: {
      en: "You roll a fair die and are paid the square of the number, in dollars. What is the expected payout? (in $, two decimals)",
      es: "Lanzas un dado equilibrado y te pagan el cuadrado del número, en dólares. ¿Cuál es el pago esperado? (en $, dos decimales)",
    },
    hint: { en: "Add up 1², 2², … 6² and divide by 6.", es: "Suma 1², 2², … 6² y divide entre 6." },
    answer: n(15.17, "$", 0.01),
    answerText: { en: "$91/6 ≈ $15.17", es: "$91/6 ≈ $15.17" },
    solution: {
      en: "1 + 4 + 9 + 16 + 25 + 36 = 91, and 91/6 ≈ $15.17. Note it is more than 3.5² = 12.25: E[X²] ≥ (E[X])².",
      es: "1 + 4 + 9 + 16 + 25 + 36 = 91, y 91/6 ≈ $15.17. Fíjate en que es más que 3.5² = 12.25: E[X²] ≥ (E[X])².",
    },
  },
  {
    id: "bt-ev-all-faces",
    category: "expected-value",
    difficulty: "Hard",
    title: { en: "Collect every face", es: "Todas las caras del dado" },
    prompt: {
      en: "On average, how many rolls of a fair die does it take to see all six faces at least once? (one decimal)",
      es: "De media, ¿cuántas tiradas de un dado equilibrado hacen falta para ver las seis caras al menos una vez? (un decimal)",
    },
    hint: {
      en: "Split it into stages: waiting for a new face when you already have k of them.",
      es: "Divídelo en etapas: esperar una cara nueva cuando ya tienes k.",
    },
    answer: n(14.7, undefined, 0.1),
    answerText: { en: "14.7 rolls", es: "14.7 tiradas" },
    solution: {
      en: "With k faces seen, a new one comes with probability (6 − k)/6, so that stage takes 6/(6 − k) rolls on average. Total = 6 × (1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6) = 6 × 2.45 = 14.7.",
      es: "Con k caras vistas, sale una nueva con probabilidad (6 − k)/6, así que esa etapa dura de media 6/(6 − k) tiradas. Total = 6 × (1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6) = 6 × 2.45 = 14.7.",
    },
  },
  {
    id: "bt-ev-fair-price",
    category: "expected-value",
    difficulty: "Easy",
    title: { en: "A fair price", es: "Un precio justo" },
    prompt: {
      en: "A game pays $10 on heads and nothing on tails. What is the most a risk-neutral player should pay to play? (in $)",
      es: "Un juego paga $10 si sale cara y nada si sale cruz. ¿Cuánto debería pagar como máximo un jugador neutral al riesgo por jugar? (en $)",
    },
    hint: { en: "A fair price equals the expected payout.", es: "Un precio justo es igual al pago esperado." },
    answer: n(5, "$"),
    answerText: { en: "$5", es: "$5" },
    solution: {
      en: "Expected payout = 0.5 × $10 + 0.5 × $0 = $5. Paying less than $5 has positive expected value.",
      es: "Pago esperado = 0.5 × $10 + 0.5 × $0 = $5. Pagar menos de $5 tiene un valor esperado positivo.",
    },
  },
  {
    id: "bt-ev-min-two-dice",
    category: "expected-value",
    difficulty: "Hard",
    title: { en: "The lower die", es: "El dado más bajo" },
    prompt: {
      en: "You roll two fair dice and are paid the lower of the two numbers. What is the expected payout? (in $, two decimals)",
      es: "Lanzas dos dados equilibrados y te pagan el menor de los dos números. ¿Cuál es el pago esperado? (en $, dos decimales)",
    },
    hint: {
      en: "Use E[X] = sum over k of P(X ≥ k). The minimum is at least k only if both dice are.",
      es: "Usa E[X] = suma sobre k de P(X ≥ k). El mínimo es al menos k solo si los dos dados lo son.",
    },
    answer: n(2.53, "$", 0.01),
    answerText: { en: "$91/36 ≈ $2.53", es: "$91/36 ≈ $2.53" },
    solution: {
      en: "P(min ≥ k) = ((7 − k)/6)². Summing for k = 1 to 6: (36 + 25 + 16 + 9 + 4 + 1)/36 = 91/36 ≈ 2.53. Together with the maximum (161/36), the two add to 7, as they must.",
      es: "P(mín ≥ k) = ((7 − k)/6)². Sumando de k = 1 a 6: (36 + 25 + 16 + 9 + 4 + 1)/36 = 91/36 ≈ 2.53. Junto con el máximo (161/36), los dos suman 7, como debe ser.",
    },
  },
  {
    id: "bt-ev-head-tail",
    category: "expected-value",
    difficulty: "Medium",
    title: { en: "Heads then tails", es: "Cara y luego cruz" },
    prompt: {
      en: "On average, how many flips of a fair coin does it take to see heads followed immediately by tails?",
      es: "De media, ¿cuántos lanzamientos de una moneda equilibrada hacen falta para ver una cara seguida inmediatamente de una cruz?",
    },
    hint: {
      en: "First wait for a heads. After that, the first tails completes the pattern.",
      es: "Primero espera a que salga una cara. A partir de ahí, la primera cruz completa el patrón.",
    },
    answer: n(4),
    answerText: { en: "4 flips", es: "4 lanzamientos" },
    solution: {
      en: "Waiting for the first H takes 2 flips on average. After that, every further H keeps you 'one away', so you just wait for the first T: 2 more flips. Total 4. Compare with HH, which takes 6, because a T sends you back to the start.",
      es: "Esperar la primera cara lleva 2 lanzamientos de media. Después, cada nueva cara te deja «a uno» del objetivo, así que solo esperas la primera cruz: 2 lanzamientos más. Total, 4. Compáralo con cara-cara, que lleva 6, porque una cruz te devuelve al principio.",
    },
  },
  {
    id: "bt-ev-dice-sum",
    category: "expected-value",
    difficulty: "Easy",
    title: { en: "Ten dice", es: "Diez dados" },
    prompt: { en: "You roll ten fair dice. What is the expected total?", es: "Lanzas diez dados equilibrados. ¿Cuál es la suma esperada?" },
    hint: {
      en: "Expectations add, even when you would not want to list the outcomes.",
      es: "Las esperanzas se suman, aunque no quieras enumerar todos los resultados.",
    },
    answer: n(35),
    answerText: { en: "35", es: "35" },
    solution: {
      en: "Each die averages 3.5, and the expectation of a sum is the sum of the expectations: 10 × 3.5 = 35.",
      es: "Cada dado tiene una media de 3.5, y la esperanza de una suma es la suma de las esperanzas: 10 × 3.5 = 35.",
    },
  },

  /* ───────────── Mental maths ───────────── */
  {
    id: "bt-mm-37x43",
    category: "mental-maths",
    difficulty: "Easy",
    title: { en: "37 × 43", es: "37 × 43" },
    prompt: { en: "Without a calculator: what is 37 × 43?", es: "Sin calculadora: ¿cuánto es 37 × 43?" },
    hint: { en: "Both numbers are the same distance from 40.", es: "Los dos números están a la misma distancia de 40." },
    answer: n(1591),
    answerText: { en: "1,591", es: "1,591" },
    solution: { en: "(40 − 3)(40 + 3) = 40² − 3² = 1,600 − 9 = 1,591.", es: "(40 − 3)(40 + 3) = 40² − 3² = 1,600 − 9 = 1,591." },
  },
  {
    id: "bt-mm-65sq",
    category: "mental-maths",
    difficulty: "Easy",
    title: { en: "65 squared", es: "65 al cuadrado" },
    prompt: { en: "Without a calculator: what is 65²?", es: "Sin calculadora: ¿cuánto es 65²?" },
    hint: {
      en: "For a number ending in 5: multiply the first digit by the next number up, then append 25.",
      es: "Para un número que acaba en 5: multiplica la primera cifra por el número siguiente y añade 25 al final.",
    },
    answer: n(4225),
    answerText: { en: "4,225", es: "4,225" },
    solution: { en: "6 × 7 = 42, then append 25: 4,225.", es: "6 × 7 = 42 y añades 25 al final: 4,225." },
  },
  {
    id: "bt-mm-125x48",
    category: "mental-maths",
    difficulty: "Easy",
    title: { en: "125 × 48", es: "125 × 48" },
    prompt: { en: "Without a calculator: what is 125 × 48?", es: "Sin calculadora: ¿cuánto es 125 × 48?" },
    hint: { en: "125 × 8 is a round number.", es: "125 × 8 da un número redondo." },
    answer: n(6000),
    answerText: { en: "6,000", es: "6,000" },
    solution: {
      en: "48 = 8 × 6, and 125 × 8 = 1,000, so the answer is 1,000 × 6 = 6,000.",
      es: "48 = 8 × 6, y 125 × 8 = 1,000, así que la respuesta es 1,000 × 6 = 6,000.",
    },
  },
  {
    id: "bt-mm-99sq",
    category: "mental-maths",
    difficulty: "Medium",
    title: { en: "99 squared", es: "99 al cuadrado" },
    prompt: { en: "Without a calculator: what is 99²?", es: "Sin calculadora: ¿cuánto es 99²?" },
    hint: { en: "Write 99 as 100 − 1.", es: "Escribe 99 como 100 − 1." },
    answer: n(9801),
    answerText: { en: "9,801", es: "9,801" },
    solution: { en: "(100 − 1)² = 10,000 − 200 + 1 = 9,801.", es: "(100 − 1)² = 10,000 − 200 + 1 = 9,801." },
  },
  {
    id: "bt-mm-odd-sum",
    category: "mental-maths",
    difficulty: "Medium",
    title: { en: "Odd numbers", es: "Números impares" },
    prompt: { en: "What is the sum of all the odd numbers from 1 to 99?", es: "¿Cuánto suman todos los números impares del 1 al 99?" },
    hint: { en: "Try 1, 1 + 3, 1 + 3 + 5… do you see a pattern?", es: "Prueba 1, 1 + 3, 1 + 3 + 5… ¿ves un patrón?" },
    answer: n(2500),
    answerText: { en: "2,500", es: "2,500" },
    solution: {
      en: "The sum of the first k odd numbers is k². There are 50 odd numbers from 1 to 99, so the sum is 50² = 2,500.",
      es: "La suma de los k primeros números impares es k². Hay 50 impares del 1 al 99, así que la suma es 50² = 2,500.",
    },
  },
  {
    id: "bt-mm-seven-eighths",
    category: "mental-maths",
    difficulty: "Easy",
    title: { en: "Seven eighths", es: "Siete octavos" },
    prompt: { en: "What is 7/8 as a percentage?", es: "¿Cuánto es 7/8 en porcentaje?" },
    hint: { en: "1/8 is 12.5%.", es: "1/8 es el 12.5%." },
    answer: n(87.5, "%", 0.01),
    answerText: { en: "87.5%", es: "87.5%" },
    solution: {
      en: "1/8 = 12.5%, so 7/8 = 7 × 12.5% = 87.5%. Knowing the eighths by heart saves time in every interview.",
      es: "1/8 = 12.5%, así que 7/8 = 7 × 12.5% = 87.5%. Saberte los octavos de memoria te ahorra tiempo en cualquier entrevista.",
    },
  },
  {
    id: "bt-mm-2-to-10",
    category: "mental-maths",
    difficulty: "Easy",
    title: { en: "Powers of two", es: "Potencias de dos" },
    prompt: { en: "What is 2 to the power of 10?", es: "¿Cuánto es 2 elevado a 10?" },
    hint: { en: "Keep doubling from 2.", es: "Ve duplicando a partir de 2." },
    answer: n(1024),
    answerText: { en: "1,024", es: "1,024" },
    solution: {
      en: "2, 4, 8, 16, 32, 64, 128, 256, 512, 1,024. Handy rule: 2¹⁰ ≈ 1,000, so 2²⁰ ≈ 1 million.",
      es: "2, 4, 8, 16, 32, 64, 128, 256, 512, 1,024. Regla útil: 2¹⁰ ≈ 1,000, así que 2²⁰ ≈ 1 millón.",
    },
  },

  /* ───────────── Logic puzzles ───────────── */
  {
    id: "bt-lg-switches",
    category: "logic",
    difficulty: "Medium",
    title: { en: "Three switches", es: "Tres interruptores" },
    prompt: {
      en: "Three switches outside a closed room control one light bulb inside. You can flip the switches as you like, but you may enter the room only once. How do you find which switch controls the bulb?",
      es: "Tres interruptores fuera de una habitación cerrada controlan una bombilla que hay dentro. Puedes accionar los interruptores como quieras, pero solo puedes entrar en la habitación una vez. ¿Cómo averiguas qué interruptor controla la bombilla?",
    },
    hint: { en: "A bulb gives you more information than on or off.", es: "Una bombilla te da más información que encendida o apagada." },
    answerText: { en: "Use the heat of the bulb.", es: "Usa el calor de la bombilla." },
    solution: {
      en: "Turn switch 1 on for a few minutes, then turn it off and turn switch 2 on. Walk in. If the bulb is on, it is switch 2. If it is off but warm, it is switch 1. If it is off and cold, it is switch 3.",
      es: "Enciende el interruptor 1 unos minutos, luego apágalo y enciende el 2. Entra. Si la bombilla está encendida, es el 2. Si está apagada pero caliente, es el 1. Si está apagada y fría, es el 3.",
    },
  },
  {
    id: "bt-lg-lockers",
    category: "logic",
    difficulty: "Hard",
    title: { en: "100 lockers", es: "100 taquillas" },
    prompt: {
      en: "100 lockers start closed. Person 1 opens every locker, person 2 toggles every 2nd locker, person 3 every 3rd, and so on up to person 100. How many lockers are open at the end?",
      es: "Hay 100 taquillas cerradas. La persona 1 abre todas, la persona 2 cambia el estado de una de cada 2, la persona 3 de una de cada 3, y así hasta la persona 100. ¿Cuántas taquillas quedan abiertas al final?",
    },
    hint: {
      en: "A locker is toggled once for each of its divisors. Which numbers have an odd number of divisors?",
      es: "Cada taquilla cambia de estado una vez por cada uno de sus divisores. ¿Qué números tienen un número impar de divisores?",
    },
    answer: n(10),
    answerText: { en: "10 (the perfect squares)", es: "10 (los cuadrados perfectos)" },
    solution: {
      en: "Locker n is toggled once per divisor of n. Divisors come in pairs (d and n/d) except when d = n/d, which only happens for perfect squares. So only squares have an odd number of toggles: 1, 4, 9, …, 100. That is 10 lockers.",
      es: "La taquilla n cambia de estado una vez por cada divisor de n. Los divisores van por parejas (d y n/d) salvo cuando d = n/d, lo que solo ocurre con los cuadrados perfectos. Así que solo los cuadrados cambian un número impar de veces: 1, 4, 9, …, 100. Son 10 taquillas.",
    },
  },
  {
    id: "bt-lg-ropes",
    category: "logic",
    difficulty: "Medium",
    title: { en: "Burning ropes", es: "Cuerdas que arden" },
    prompt: {
      en: "You have two ropes that each take exactly 60 minutes to burn, but they burn unevenly. How do you measure 45 minutes?",
      es: "Tienes dos cuerdas que tardan exactamente 60 minutos en quemarse cada una, pero arden de forma irregular. ¿Cómo mides 45 minutos?",
    },
    hint: {
      en: "Lighting a rope at both ends halves its time, whatever its shape.",
      es: "Encender una cuerda por los dos extremos reduce su tiempo a la mitad, arda como arda.",
    },
    answerText: {
      en: "Light rope A at both ends and rope B at one end.",
      es: "Enciende la cuerda A por los dos extremos y la cuerda B por uno.",
    },
    solution: {
      en: "Light rope A at both ends and rope B at one end at the same time. Rope A burns out after 30 minutes. At that moment, light the other end of rope B: its remaining 30 minutes now burn in 15. When B goes out, 45 minutes have passed.",
      es: "Enciende a la vez la cuerda A por los dos extremos y la cuerda B por uno. La cuerda A se consume a los 30 minutos. En ese momento, enciende el otro extremo de la B: los 30 minutos que le quedaban arden ahora en 15. Cuando la B se apaga, han pasado 45 minutos.",
    },
  },
  {
    id: "bt-lg-bat-ball",
    category: "logic",
    difficulty: "Easy",
    title: { en: "Bat and ball", es: "Bate y pelota" },
    prompt: {
      en: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost? (in cents)",
      es: "Un bate y una pelota cuestan $1.10 en total. El bate cuesta $1.00 más que la pelota. ¿Cuánto cuesta la pelota? (en céntimos)",
    },
    hint: {
      en: "Ten cents is the fast answer, and it is wrong. Check it.",
      es: "Diez céntimos es la respuesta rápida, y es incorrecta. Compruébalo.",
    },
    answer: n(5, "cents"),
    answerText: { en: "5 cents", es: "5 céntimos" },
    solution: {
      en: "If the ball is x, the bat is x + 1.00, so 2x + 1.00 = 1.10 and x = 0.05. With a 10-cent ball the bat would be $1.10 and the total $1.20.",
      es: "Si la pelota cuesta x, el bate cuesta x + 1.00, así que 2x + 1.00 = 1.10 y x = 0.05. Con una pelota de 10 céntimos, el bate costaría $1.10 y el total sería $1.20.",
    },
  },
  {
    id: "bt-lg-twelve-coins",
    category: "logic",
    difficulty: "Hard",
    title: { en: "Twelve coins", es: "Doce monedas" },
    prompt: {
      en: "You have 12 coins. One is counterfeit and is either heavier or lighter than the rest, you do not know which. What is the minimum number of weighings on a balance scale that always finds it and says whether it is heavy or light?",
      es: "Tienes 12 monedas. Una es falsa y pesa más o menos que las demás, pero no sabes cuál de las dos cosas. ¿Cuál es el número mínimo de pesadas en una balanza de platillos que siempre la encuentra y dice si pesa más o menos?",
    },
    hint: {
      en: "Each weighing has three outcomes. How many possibilities do you need to tell apart?",
      es: "Cada pesada tiene tres resultados posibles. ¿Cuántas posibilidades necesitas distinguir?",
    },
    answer: n(3),
    answerText: { en: "3 weighings", es: "3 pesadas" },
    solution: {
      en: "There are 24 possibilities (12 coins × heavy or light). Two weighings give only 3² = 9 outcomes, which is not enough; three give 27, which is. Start with 4 against 4: if they balance, the fake is among the other 4; if not, you know which side was heavy, and a careful second weighing that moves coins between sides leaves at most 3 candidates for the third.",
      es: "Hay 24 posibilidades (12 monedas × más pesada o más ligera). Dos pesadas dan solo 3² = 9 resultados, que no bastan; tres dan 27, que sí. Empieza con 4 contra 4: si se equilibran, la falsa está entre las otras 4; si no, sabes qué lado pesaba más, y una segunda pesada bien pensada, moviendo monedas entre lados, deja como mucho 3 candidatas para la tercera.",
    },
  },
  {
    id: "bt-lg-monty-hall",
    category: "logic",
    difficulty: "Medium",
    title: { en: "Monty Hall", es: "Monty Hall" },
    prompt: {
      en: "There are three doors: a car is behind one and goats behind the other two. You pick a door. The host, who knows where the car is, opens another door to show a goat and offers you a switch. What is your probability of winning if you switch? (in %, one decimal)",
      es: "Hay tres puertas: detrás de una hay un coche y detrás de las otras dos, cabras. Eliges una puerta. El presentador, que sabe dónde está el coche, abre otra puerta, muestra una cabra y te ofrece cambiar. ¿Cuál es tu probabilidad de ganar si cambias? (en %, un decimal)",
    },
    hint: {
      en: "What was the probability that your first pick was right? Does the host's action change it?",
      es: "¿Qué probabilidad había de que tu primera elección fuera la buena? ¿La cambia lo que hace el presentador?",
    },
    answer: n(66.7, "%", 0.2),
    answerText: { en: "2/3 ≈ 66.7%", es: "2/3 ≈ 66.7%" },
    solution: {
      en: "Your first pick is right 1/3 of the time and nothing the host does changes that. The other 2/3 is now concentrated on the one closed door the host left, so switching wins 2/3 of the time.",
      es: "Tu primera elección acierta 1/3 de las veces y nada de lo que haga el presentador lo cambia. Los otros 2/3 se concentran ahora en la única puerta cerrada que ha dejado el presentador, así que cambiar gana 2/3 de las veces.",
    },
  },
  {
    id: "bt-lg-chessboard",
    category: "logic",
    difficulty: "Medium",
    title: { en: "Squares on a chessboard", es: "Cuadrados en un tablero de ajedrez" },
    prompt: {
      en: "How many squares of any size are there on an 8 × 8 chessboard?",
      es: "¿Cuántos cuadrados de cualquier tamaño hay en un tablero de ajedrez de 8 × 8?",
    },
    hint: {
      en: "Count the 1 × 1 squares, then the 2 × 2, and so on.",
      es: "Cuenta los cuadrados de 1 × 1, luego los de 2 × 2, y así sucesivamente.",
    },
    answer: n(204),
    answerText: { en: "204", es: "204" },
    solution: {
      en: "There are (9 − k)² squares of size k × k: 64 + 49 + 36 + 25 + 16 + 9 + 4 + 1 = 204.",
      es: "Hay (9 − k)² cuadrados de tamaño k × k: 64 + 49 + 36 + 25 + 16 + 9 + 4 + 1 = 204.",
    },
  },
  {
    id: "bt-lg-snail",
    category: "logic",
    difficulty: "Medium",
    title: { en: "The snail in the well", es: "El caracol en el pozo" },
    prompt: {
      en: "A snail is at the bottom of a 10 m well. Each day it climbs 3 m and each night it slides back 2 m. On which day does it reach the top?",
      es: "Un caracol está en el fondo de un pozo de 10 m. Cada día sube 3 m y cada noche resbala 2 m. ¿Qué día llega arriba?",
    },
    hint: {
      en: "On the last day it climbs out and does not slide back.",
      es: "El último día sale del pozo y ya no resbala.",
    },
    answer: n(8, "day"),
    answerText: { en: "Day 8", es: "El día 8" },
    solution: {
      en: "After each full day and night it has gained 1 m, so it starts day 8 at 7 m. That day it climbs 3 m to reach 10 m and is out before night falls. The trap is answering 10.",
      es: "Tras cada día y noche completos ha ganado 1 m, así que empieza el día 8 a 7 m. Ese día sube 3 m, llega a los 10 m y sale antes de que caiga la noche. La trampa es responder 10.",
    },
  },
  {
    id: "bt-lg-handshakes",
    category: "logic",
    difficulty: "Easy",
    title: { en: "Handshakes", es: "Apretones de manos" },
    prompt: {
      en: "Ten people meet and everyone shakes hands with everyone else once. How many handshakes are there?",
      es: "Se reúnen diez personas y cada una da la mano una vez a todas las demás. ¿Cuántos apretones de manos hay?",
    },
    hint: { en: "Each handshake is a pair of people.", es: "Cada apretón de manos es una pareja de personas." },
    answer: n(45),
    answerText: { en: "45", es: "45" },
    solution: {
      en: "The number of pairs from 10 people is 10 × 9 / 2 = 45.",
      es: "El número de parejas que se pueden formar con 10 personas es 10 × 9 / 2 = 45.",
    },
  },
  {
    id: "bt-lg-jugs",
    category: "logic",
    difficulty: "Medium",
    title: { en: "Two jugs", es: "Dos jarras" },
    prompt: {
      en: "You have a 3-litre jug and a 5-litre jug and unlimited water. How do you measure exactly 4 litres?",
      es: "Tienes una jarra de 3 litros, otra de 5 litros y agua ilimitada. ¿Cómo mides exactamente 4 litros?",
    },
    hint: {
      en: "Fill the big jug and use the small one to take water out of it.",
      es: "Llena la jarra grande y usa la pequeña para sacarle agua.",
    },
    answerText: {
      en: "Fill 5, pour into 3, empty 3, pour the 2 across, fill 5, top up the 3.",
      es: "Llena la de 5, vierte en la de 3, vacía la de 3, pasa los 2 litros, llena la de 5 y completa la de 3.",
    },
    solution: {
      en: "Fill the 5 L jug and pour it into the 3 L jug, leaving 2 L. Empty the 3 L jug and pour the 2 L into it. Fill the 5 L jug again and top up the 3 L jug, which takes 1 L. 4 L are left in the big jug.",
      es: "Llena la jarra de 5 L y viértela en la de 3 L: quedan 2 L. Vacía la de 3 L y echa en ella esos 2 L. Vuelve a llenar la de 5 L y completa la de 3 L, que admite 1 L más. En la jarra grande quedan 4 L.",
    },
  },

  /* ───────────── Sequences ───────────── */
  {
    id: "bt-sq-pronic",
    category: "sequences",
    difficulty: "Easy",
    title: { en: "2, 6, 12, 20, 30…", es: "2, 6, 12, 20, 30…" },
    prompt: { en: "What comes next: 2, 6, 12, 20, 30, ?", es: "¿Qué número sigue: 2, 6, 12, 20, 30, ?" },
    hint: {
      en: "Look at the gaps between the terms, or try n × (n + 1).",
      es: "Fíjate en las diferencias entre términos, o prueba con n × (n + 1).",
    },
    answer: n(42),
    answerText: { en: "42", es: "42" },
    solution: {
      en: "The gaps are 4, 6, 8, 10, so the next is 12 more: 42. Equivalently, the terms are 1×2, 2×3, 3×4, 4×5, 5×6, then 6×7 = 42.",
      es: "Las diferencias son 4, 6, 8, 10, así que el siguiente es 12 más: 42. Dicho de otra forma, los términos son 1×2, 2×3, 3×4, 4×5, 5×6 y luego 6×7 = 42.",
    },
  },
  {
    id: "bt-sq-primes",
    category: "sequences",
    difficulty: "Easy",
    title: { en: "2, 3, 5, 7, 11, 13…", es: "2, 3, 5, 7, 11, 13…" },
    prompt: { en: "What comes next: 2, 3, 5, 7, 11, 13, ?", es: "¿Qué número sigue: 2, 3, 5, 7, 11, 13, ?" },
    hint: { en: "What do these numbers have in common?", es: "¿Qué tienen en común estos números?" },
    answer: n(17),
    answerText: { en: "17", es: "17" },
    solution: {
      en: "These are the prime numbers. The next prime after 13 is 17.",
      es: "Son los números primos. El siguiente primo después de 13 es 17.",
    },
  },
  {
    id: "bt-sq-cubes",
    category: "sequences",
    difficulty: "Easy",
    title: { en: "0, 1, 8, 27, 64…", es: "0, 1, 8, 27, 64…" },
    prompt: { en: "What comes next: 0, 1, 8, 27, 64, ?", es: "¿Qué número sigue: 0, 1, 8, 27, 64, ?" },
    hint: { en: "Each term is a power of 0, 1, 2, 3, 4.", es: "Cada término es una potencia de 0, 1, 2, 3, 4." },
    answer: n(125),
    answerText: { en: "125", es: "125" },
    solution: {
      en: "These are cubes: 0³, 1³, 2³, 3³, 4³, so the next is 5³ = 125.",
      es: "Son cubos: 0³, 1³, 2³, 3³, 4³, así que el siguiente es 5³ = 125.",
    },
  },
  {
    id: "bt-sq-look-say",
    category: "sequences",
    difficulty: "Hard",
    title: { en: "1, 11, 21, 1211…", es: "1, 11, 21, 1211…" },
    prompt: { en: "What comes next: 1, 11, 21, 1211, 111221, ?", es: "¿Qué número sigue: 1, 11, 21, 1211, 111221, ?" },
    hint: {
      en: "Read each term out loud, describing the one before it.",
      es: "Lee cada término en voz alta, describiendo el anterior.",
    },
    answer: n(312211),
    answerText: { en: "312211", es: "312211" },
    solution: {
      en: "Each term describes the previous one: 111221 is 'three 1s, two 2s, one 1', which is written 312211.",
      es: "Cada término describe el anterior: 111221 es «tres 1, dos 2, un 1», que se escribe 312211.",
    },
  },
  {
    id: "bt-sq-doubling-plus",
    category: "sequences",
    difficulty: "Medium",
    title: { en: "1, 3, 7, 15, 31…", es: "1, 3, 7, 15, 31…" },
    prompt: { en: "What comes next: 1, 3, 7, 15, 31, ?", es: "¿Qué número sigue: 1, 3, 7, 15, 31, ?" },
    hint: { en: "Compare each term with a power of two.", es: "Compara cada término con una potencia de dos." },
    answer: n(63),
    answerText: { en: "63", es: "63" },
    solution: {
      en: "Each term is double the previous plus one (or 2ⁿ − 1): 31 × 2 + 1 = 63.",
      es: "Cada término es el doble del anterior más uno (o 2ⁿ − 1): 31 × 2 + 1 = 63.",
    },
  },
  {
    id: "bt-sq-triangular",
    category: "sequences",
    difficulty: "Medium",
    title: { en: "1, 3, 6, 10, 15…", es: "1, 3, 6, 10, 15…" },
    prompt: { en: "What is the 10th term of 1, 3, 6, 10, 15, …?", es: "¿Cuál es el 10.º término de 1, 3, 6, 10, 15, …?" },
    hint: { en: "The n-th term is 1 + 2 + … + n.", es: "El término n-ésimo es 1 + 2 + … + n." },
    answer: n(55),
    answerText: { en: "55", es: "55" },
    solution: {
      en: "These are triangular numbers, n(n + 1)/2. The 10th is 10 × 11 / 2 = 55.",
      es: "Son los números triangulares, n(n + 1)/2. El 10.º es 10 × 11 / 2 = 55.",
    },
  },

  /* ───────────── Estimation ───────────── */
  {
    id: "bt-es-piano-tuners",
    category: "estimation",
    difficulty: "Medium",
    title: { en: "Piano tuners", es: "Afinadores de pianos" },
    prompt: { en: "How many piano tuners are there in Chicago?", es: "¿Cuántos afinadores de pianos hay en Chicago?" },
    hint: {
      en: "Start from the population, get to the number of pianos, then to the tuning work a year and what one tuner can do.",
      es: "Parte de la población, llega al número de pianos, luego al trabajo de afinación anual y a lo que puede hacer un afinador.",
    },
    answerText: { en: "Roughly 50 to 150.", es: "Entre 50 y 150, aproximadamente." },
    solution: {
      en: "About 3 million people in around 1.2 million households. If 1 in 20 households has a piano, plus schools and venues, that is about 70,000 pianos. Each is tuned about once a year. A tuner does about 4 a day, 250 days a year: 1,000 a year. 70,000 / 1,000 ≈ 70, so somewhere around 100 once you allow for travel and busier periods. The structure is what is being tested, not the number.",
      es: "Unos 3 millones de personas en alrededor de 1.2 millones de hogares. Si 1 de cada 20 hogares tiene piano, más colegios y salas, salen unos 70,000 pianos. Cada uno se afina más o menos una vez al año. Un afinador hace unos 4 al día, 250 días al año: 1,000 al año. 70,000 / 1,000 ≈ 70, así que alrededor de 100 si tienes en cuenta los desplazamientos y las épocas de más trabajo. Lo que se evalúa es la estructura, no el número.",
    },
  },
  {
    id: "bt-es-golf-balls",
    category: "estimation",
    difficulty: "Medium",
    title: { en: "Golf balls in a plane", es: "Pelotas de golf en un avión" },
    prompt: { en: "How many golf balls fit inside a Boeing 747?", es: "¿Cuántas pelotas de golf caben dentro de un Boeing 747?" },
    hint: {
      en: "Estimate the volume of the cabin and of one golf ball, then allow for the gaps between spheres.",
      es: "Estima el volumen de la cabina y el de una pelota de golf, y luego ten en cuenta los huecos entre esferas.",
    },
    answerText: { en: "Around 10 to 20 million.", es: "Entre 10 y 20 millones, aproximadamente." },
    solution: {
      en: "Treat the cabin as a tube about 60 m long and 6 m wide: roughly 60 × π × 3² ≈ 1,700 m³, so call it 1,000 m³ once seats and fittings are taken out. A golf ball is about 4 cm across, so about 40 cm³. Spheres pack at about 65% efficiency. 1,000 m³ = 10⁹ cm³; × 0.65 / 40 ≈ 16 million.",
      es: "Trata la cabina como un tubo de unos 60 m de largo y 6 m de ancho: aproximadamente 60 × π × 3² ≈ 1,700 m³; digamos 1,000 m³ descontando asientos y equipamiento. Una pelota de golf mide unos 4 cm de diámetro, así que ocupa unos 40 cm³. Las esferas se empaquetan con una eficiencia de alrededor del 65%. 1,000 m³ = 10⁹ cm³; × 0.65 / 40 ≈ 16 millones.",
    },
  },
  {
    id: "bt-es-coffee-shop",
    category: "estimation",
    difficulty: "Easy",
    title: { en: "A station coffee shop", es: "Una cafetería en una estación" },
    prompt: {
      en: "Estimate the annual revenue of a coffee shop in a busy train station.",
      es: "Estima las ventas anuales de una cafetería en una estación de tren con mucho tráfico.",
    },
    hint: {
      en: "Customers per hour × average ticket × opening hours × days.",
      es: "Clientes por hora × ticket medio × horas de apertura × días.",
    },
    answerText: { en: "Roughly $1–2 million a year.", es: "Entre $1 y 2 millones al año, aproximadamente." },
    solution: {
      en: "Peak hours (say 4 a day) at 100 customers an hour and 12 off-peak hours at 30 an hour: about 760 customers a day. At around $5 each that is about $3,800 a day, or about $1.4 million a year over 360 days. Sense-check: a busy shop with two or three tills could serve that.",
      es: "Horas punta (digamos 4 al día) a 100 clientes por hora y 12 horas valle a 30 por hora: unos 760 clientes al día. A unos $5 cada uno son unos $3,800 al día, o alrededor de $1.4 millones al año en 360 días. Comprobación: una cafetería concurrida con dos o tres cajas podría atender ese volumen.",
    },
  },
  {
    id: "bt-es-heathrow",
    category: "estimation",
    difficulty: "Medium",
    title: { en: "Flights from Heathrow", es: "Vuelos desde Heathrow" },
    prompt: {
      en: "How many flights take off from London Heathrow each day?",
      es: "¿Cuántos vuelos despegan cada día del aeropuerto de Londres Heathrow?",
    },
    hint: {
      en: "Think about runways, operating hours and how often a plane can take off.",
      es: "Piensa en las pistas, las horas de operación y cada cuánto puede despegar un avión.",
    },
    answerText: { en: "Around 600 to 700 departures.", es: "Entre 600 y 700 salidas, aproximadamente." },
    solution: {
      en: "Heathrow runs one runway for departures for about 17 hours a day. A take-off every 90 seconds or so is about 40 an hour: 40 × 17 ≈ 680 departures a day. Splitting by passengers works too: about 80 million passengers a year, half departing, at about 170 per flight gives roughly 650 a day.",
      es: "Heathrow usa una pista para salidas durante unas 17 horas al día. Un despegue cada 90 segundos más o menos son unos 40 por hora: 40 × 17 ≈ 680 salidas al día. También funciona partir de los pasajeros: unos 80 millones al año, la mitad saliendo, a unos 170 por vuelo, da alrededor de 650 al día.",
    },
  },
  {
    id: "bt-es-phones-spain",
    category: "estimation",
    difficulty: "Easy",
    title: { en: "Smartphones sold in Spain", es: "Smartphones vendidos en España" },
    prompt: { en: "How many smartphones are sold in Spain each year?", es: "¿Cuántos smartphones se venden en España cada año?" },
    hint: {
      en: "Population × share with a smartphone ÷ how many years people keep a phone.",
      es: "Población × porcentaje con smartphone ÷ cuántos años se conserva un móvil.",
    },
    answerText: { en: "Roughly 12 to 15 million.", es: "Entre 12 y 15 millones, aproximadamente." },
    solution: {
      en: "About 48 million people. Around 85% have a smartphone: about 40 million users. People replace phones every 3 years or so, giving roughly 13 million a year, plus a little for second phones and replacements after damage.",
      es: "Unos 48 millones de personas. Alrededor del 85% tiene smartphone: unos 40 millones de usuarios. La gente cambia de móvil cada 3 años más o menos, lo que da unos 13 millones al año, más algo por segundos móviles y sustituciones por roturas.",
    },
  },
];

export function getTeaser(id: string) {
  return TEASERS.find((t) => t.id === id);
}
