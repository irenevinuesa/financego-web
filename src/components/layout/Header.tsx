"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { isGroupActive, MAIN_NAV, SECONDARY_NAV, type NavGroup } from "./nav";

// Loaded on first open so the search index does not weigh down every page.
const SearchDialog = dynamic(() => import("./SearchDialog").then((m) => m.SearchDialog), { ssr: false });

/** A top-level item; groups open a dropdown on hover, click or keyboard focus. */
function DesktopItem({ group, pathname, open, setOpen }: { group: NavGroup; pathname: string; open: boolean; setOpen: (v: boolean) => void }) {
  const active = isGroupActive(group, pathname);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pill = cn(
    "inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
    active ? "bg-navy text-white" : "text-ink hover:bg-ice-soft hover:text-navy",
  );

  if (!group.children) {
    return (
      <Link href={group.href} aria-current={active ? "page" : undefined} className={pill}>
        {group.label}
      </Link>
    );
  }

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={() => {
        closeTimer.current = setTimeout(() => setOpen(false), 120);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button type="button" className={pill} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)}>
        {group.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 pt-2">
          <div className="w-[23rem] overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-lift animate-pop">
            <Link href={group.href} className="mb-1 block rounded-xl bg-ice-soft px-3 py-2.5 hover:bg-ice/40">
              <span className="block text-sm font-semibold text-navy">{group.label} overview</span>
              <span className="block text-xs text-ink-muted">{group.description}</span>
            </Link>
            <ul>
              {group.children.map((c) => {
                const Icon = c.icon;
                const here = pathname === c.href || (c.href !== group.href && pathname.startsWith(c.href));
                return (
                  <li key={c.href}>
                    <Link href={c.href} aria-current={here ? "page" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors", here ? "bg-ice-soft" : "hover:bg-ice-soft")}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy text-white">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-navy">{c.label}</span>
                        <span className="block text-xs text-ink-muted">{c.description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  // ⌘K / Ctrl+K and "/" open search; Escape closes dropdowns
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
      } else if (e.key === "Escape") {
        setOpenGroup(null);
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

  return (
    <>
      <a href="#main" className="sr-only z-[60] rounded-md bg-navy px-3 py-2 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur-md supports-[backdrop-filter]:bg-cream/80">
        <div className="h-1 bg-navy" aria-hidden />
        <div className="container-page flex h-16 items-center gap-4">
          <Logo />

          <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
            {MAIN_NAV.map((g) => (
              <DesktopItem key={g.href} group={g} pathname={pathname} open={openGroup === g.href} setOpen={(v) => setOpenGroup(v ? g.href : null)} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 items-center gap-2 rounded-full border border-line-strong bg-white pl-3 pr-2 text-sm text-ink-muted transition-colors hover:border-navy sm:inline-flex"
              aria-label="Search FinanceGo"
            >
              <Search className="h-4 w-4" />
              <span className="pr-4">Search</span>
              <kbd className="rounded-md border border-line bg-ice-soft px-1.5 py-0.5 font-sans text-[0.7rem] text-ink-muted">⌘K</kbd>
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
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[4.25rem] z-40 overflow-y-auto border-t border-line bg-cream animate-fade-up lg:hidden">
          <nav aria-label="Mobile" className="container-page space-y-5 py-5">
            {MAIN_NAV.map((g) => {
              const Icon = g.icon;
              const active = isGroupActive(g, pathname);
              return (
                <div key={g.href}>
                  <Link
                    href={g.href}
                    aria-current={active && !g.children ? "page" : undefined}
                    className={cn("flex items-center gap-3 rounded-2xl p-3", active ? "bg-navy text-white" : "bg-ice-soft text-navy")}
                  >
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", active ? "bg-white/15" : "bg-navy text-white")}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-semibold">{g.label}</span>
                      <span className={cn("block text-sm", active ? "text-ice-soft" : "text-ink-muted")}>{g.description}</span>
                    </span>
                  </Link>
                  {g.children && (
                    <ul className="mt-2 grid grid-cols-2 gap-2">
                      {g.children.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            aria-current={pathname === c.href ? "page" : undefined}
                            className={cn("block rounded-xl border px-3 py-2.5 text-sm font-medium", pathname === c.href ? "border-navy text-navy" : "border-line text-ink hover:border-navy")}
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-line pt-4 text-sm">
              {SECONDARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-lg px-2 py-2 text-ink hover:bg-ice-soft hover:text-navy">
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
