"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LayoutDashboard, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { MAIN_NAV, SECONDARY_NAV } from "./nav";

// Loaded on first open so the search index does not weigh down every page.
const SearchDialog = dynamic(() => import("./SearchDialog").then((m) => m.SearchDialog), { ssr: false });

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close the mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // ⌘K / Ctrl+K and "/" open search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <>
      <a href="#main" className="sr-only z-[60] rounded-md bg-navy px-3 py-2 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-line/80 bg-cream/85 backdrop-blur-md supports-[backdrop-filter]:bg-cream/75">
        <div className="container-page flex h-16 items-center gap-4">
          <Logo />

          <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive(item.href) ? "bg-white text-navy shadow-card" : "text-ink hover:text-electric",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 items-center gap-2 rounded-full border border-line-strong bg-white pl-3 pr-2 text-sm text-ink-muted transition-colors hover:border-electric sm:inline-flex"
              aria-label="Search FinanceGo"
            >
              <Search className="h-4 w-4" />
              <span className="pr-4">Search</span>
              <kbd className="rounded-md border border-line bg-cream px-1.5 py-0.5 font-sans text-[0.7rem] text-ink-muted">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-ice-soft sm:hidden"
              aria-label="Search FinanceGo"
            >
              <Search className="h-5 w-5" />
            </button>
            {/* Wrapper controls visibility: the button's own inline-flex would override "hidden". */}
            <span className="hidden sm:block">
              <Link href="/dashboard/" className={buttonClasses("primary", "sm")}>
                <LayoutDashboard className="h-4 w-4" />
                My dashboard
              </Link>
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-ice-soft lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

      </header>
      {/* Outside <header>: its backdrop-filter would make it the containing block for this fixed panel. */}
      {menuOpen && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-line bg-cream animate-fade-up lg:hidden">
          <nav aria-label="Mobile" className="container-page py-4">
            <ul className="grid gap-2 sm:grid-cols-2">
              {MAIN_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border p-3.5 transition-colors",
                        isActive(item.href) ? "border-electric bg-white" : "border-line bg-white/70 hover:border-electric",
                      )}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ice-soft text-electric">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-semibold text-navy">{item.label}</span>
                        <span className="block text-sm text-ink-muted">{item.description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-line pt-4 text-sm">
              {SECONDARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-lg px-2 py-2 text-ink hover:bg-white hover:text-electric">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      {searchOpen && <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
