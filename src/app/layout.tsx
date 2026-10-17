import type { Metadata, Viewport } from "next";
import { Caveat, DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const hand = Caveat({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "FinanceGo — Learn Finance. Think Bigger. Go Further.",
    template: "%s · FinanceGo",
  },
  description:
    "Interactive finance education and career preparation: structured courses, a technical question bank, a scripted interview simulator, working financial tools and a personal tracker.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f7f4ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable} ${hand.variable}`}>
      <body className="min-h-screen antialiased">
        <Header />
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
