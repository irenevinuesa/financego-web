import Link from "@/components/i18n/Link";
import { getLang } from "@/lib/server-lang";
import type { Lang } from "@/lib/i18n";
import { Logo } from "./Logo";

type Bi = Record<Lang, string>;

const COLUMNS: { title: Bi; links: { href: string; label: Bi }[] }[] = [
  {
    title: { en: "Technicals", es: "Technicals" },
    links: [
      { href: "/learn/", label: { en: "Learn", es: "Learn" } },
      { href: "/practice/", label: { en: "Practice", es: "Practice" } },
      { href: "/challenge/", label: { en: "500 Challenge", es: "500 Challenge" } },
      { href: "/technicals/interview/", label: { en: "Mock interview", es: "Mock interview" } },
    ],
  },
  {
    title: { en: "Prepare", es: "Prepárate" },
    links: [
      { href: "/behaviourals/", label: { en: "Behaviourals", es: "Behaviourals" } },
      { href: "/brain-teasers/", label: { en: "Brain teasers", es: "Brain teasers" } },
      { href: "/tools/", label: { en: "Tools", es: "Tools" } },
      { href: "/planner/", label: { en: "Planner", es: "Planner" } },
      { href: "/news/", label: { en: "Markets news", es: "Noticias de mercados" } },
      { href: "/career/", label: { en: "Career", es: "Career" } },
      { href: "/dashboard/", label: { en: "Dashboard", es: "Dashboard" } },
      { href: "/settings/", label: { en: "Settings & data", es: "Ajustes y datos" } },
    ],
  },
  {
    title: { en: "FinanceGo", es: "FinanceGo" },
    links: [
      { href: "/about/", label: { en: "About", es: "Sobre FinanceGo" } },
      { href: "/help/", label: { en: "Help & contact", es: "Ayuda y contacto" } },
      { href: "/privacy/", label: { en: "Privacy Policy", es: "Política de privacidad" } },
      { href: "/terms/", label: { en: "Terms", es: "Términos de uso" } },
      { href: "/disclaimer/", label: { en: "Educational disclaimer", es: "Aviso educativo" } },
    ],
  },
];

const TEXT = {
  en: {
    tagline: "Learn Finance. Think Bigger. Go Further.",
    blurb: "Interactive finance education and career preparation for students and young analysts.",
    edu: "Educational use only.",
    disclaimer: "FinanceGo teaches financial concepts. Nothing here is investment, legal, tax or career advice, and calculator outputs depend entirely on the assumptions you enter.",
    read: "Read the full disclaimer",
  },
  es: {
    tagline: "Aprende finanzas. Piensa en grande. Llega más lejos.",
    blurb: "Formación interactiva en finanzas y preparación de entrevistas para estudiantes y analistas junior.",
    edu: "Solo con fines educativos.",
    disclaimer: "FinanceGo enseña conceptos financieros. Nada de lo que hay aquí es asesoramiento de inversión, legal, fiscal ni profesional, y los resultados de las herramientas dependen por completo de los supuestos que introduzcas.",
    read: "Leer el aviso completo",
  },
};

export async function Footer() {
  const lang = await getLang();
  const tx = TEXT[lang];
  return (
    <footer className="mt-24 bg-navy text-ice-soft">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Logo light />
          <p className="mt-4 font-serif text-2xl leading-snug text-white">{tx.tagline}</p>
          <p className="mt-3 text-sm leading-relaxed text-ice-soft/75">{tx.blurb}</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title.en}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ice">{col.title[lang]}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ice-soft/85 transition-colors hover:text-white">
                    {l.label[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs leading-relaxed text-ice-soft/70 md:flex-row md:items-start md:justify-between">
          <p className="max-w-3xl">
            <strong className="font-semibold text-ice-soft">{tx.edu}</strong> {tx.disclaimer}{" "}
            <Link href="/disclaimer/" className="underline underline-offset-2 hover:text-white">
              {tx.read}
            </Link>
            .
          </p>
          <p className="shrink-0">© {new Date().getFullYear()} FinanceGo</p>
        </div>
      </div>
    </footer>
  );
}
