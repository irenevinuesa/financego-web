import type { Metadata } from "next";
import "./globals.css";
import { BASE_PATH } from "@/lib/base-path";

export const metadata: Metadata = { title: "Page not found · FinanceGo" };

/** 404 for URLs outside /en/ and /es/. Pages inside a language use [lang]/not-found.tsx. */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream antialiased">
        <main className="mx-auto max-w-xl px-6 py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">404</p>
          <h1 className="mt-3 text-4xl font-semibold text-navy">Off the trail · Fuera de ruta</h1>
          <p className="mt-4 text-ink-muted">This page does not exist. · Esta página no existe.</p>
          <p className="mt-8 flex justify-center gap-4">
            <a href={`${BASE_PATH}/en/`} className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white">
              FinanceGo (English)
            </a>
            <a href={`${BASE_PATH}/es/`} className="rounded-full border border-navy px-5 py-2.5 text-sm font-medium text-navy">
              FinanceGo (Español)
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
