import type { Metadata, Viewport } from "next";
import { Caveat, DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "../globals.css";
import { asset } from "@/lib/base-path";
import { LANGS, LOCALES, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/server-lang";
import { SITE_URL } from "@/lib/site-url";
import { LangProvider } from "@/components/i18n/LangProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EnglishOnlyNotice } from "@/components/i18n/EnglishOnlyNotice";

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const hand = Caveat({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-caveat", display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

const META: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "FinanceGo — Learn Finance. Think Bigger. Go Further.",
    description:
      "Interactive finance education and interview preparation: courses, 500 practice questions, a timed mock interview, brain teasers, working financial tools, an interview planner, daily markets news and career guides.",
  },
  es: {
    title: "FinanceGo — Aprende finanzas. Piensa en grande. Llega más lejos.",
    description:
      "Formación en finanzas y preparación de entrevistas: cursos, 500 preguntas de práctica, mock interview con tiempo, brain teasers, herramientas financieras, planificador de entrevistas, noticias de mercados y guías de carrera.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: META[lang].title, template: "%s · FinanceGo" },
    description: META[lang].description,
    openGraph: {
      type: "website",
      siteName: "FinanceGo",
      title: META[lang].title,
      description: META[lang].description,
      locale: LOCALES[lang].replace("-", "_"),
      images: [{ url: asset("/og-image.png"), width: 1200, height: 630, alt: "FinanceGo" }],
    },
    twitter: { card: "summary_large_image", title: META[lang].title, description: META[lang].description, images: [asset("/og-image.png")] },
    icons: {
      icon: [
        { url: asset("/favicon-32.png"), sizes: "32x32", type: "image/png" },
        { url: asset("/icon-192.png"), sizes: "192x192", type: "image/png" },
      ],
      apple: { url: asset("/apple-touch-icon.png"), sizes: "180x180" },
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f7f4ee",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${serif.variable} ${sans.variable} ${mono.variable} ${hand.variable}`}>
      <body className="min-h-screen antialiased">
        <LangProvider lang={lang}>
          <Header />
          <main id="main" className="min-h-[60vh]">
            <EnglishOnlyNotice />
            {children}
          </main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
