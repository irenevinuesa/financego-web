import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FinanceGo",
  robots: { index: false, follow: true },
};

/** Minimal root layout for "/", which only forwards visitors to /en/ or /es/. */
export default function RedirectLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f7f4ee", color: "#114779" }}>{children}</body>
    </html>
  );
}
