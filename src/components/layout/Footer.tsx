import Link from "next/link";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    title: "Technicals",
    links: [
      { href: "/learn/", label: "Learn" },
      { href: "/practice/", label: "Practice" },
      { href: "/challenge/", label: "500 Challenge" },
      { href: "/technicals/interview/", label: "Mock interview" },
    ],
  },
  {
    title: "Prepare",
    links: [
      { href: "/behaviourals/", label: "Behaviourals" },
      { href: "/tools/", label: "Tools" },
      { href: "/career/", label: "Career" },
      { href: "/dashboard/", label: "Dashboard" },
      { href: "/settings/", label: "Settings & data" },
    ],
  },
  {
    title: "FinanceGo",
    links: [
      { href: "/about/", label: "About" },
      { href: "/help/", label: "Help & contact" },
      { href: "/privacy/", label: "Privacy Policy" },
      { href: "/terms/", label: "Terms" },
      { href: "/disclaimer/", label: "Educational disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-navy text-ice-soft">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Logo light />
          <p className="mt-4 font-serif text-2xl leading-snug text-white">Learn Finance. Think Bigger. Go Further.</p>
          <p className="mt-3 text-sm leading-relaxed text-ice-soft/75">
            Interactive finance education and career preparation for students and young analysts.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ice">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ice-soft/85 transition-colors hover:text-white">
                    {l.label}
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
            <strong className="font-semibold text-ice-soft">Educational use only.</strong> FinanceGo teaches financial concepts. Nothing here is
            investment, legal, tax or career advice, and calculator outputs depend entirely on the assumptions you enter.{" "}
            <Link href="/disclaimer/" className="underline underline-offset-2 hover:text-white">
              Read the full disclaimer
            </Link>
            .
          </p>
          <p className="shrink-0">© {new Date().getFullYear()} FinanceGo · MVP (Version 1)</p>
        </div>
      </div>
    </footer>
  );
}
