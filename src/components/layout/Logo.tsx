import Link from "next/link";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#123a80" />
      <path d="M5 24 L12.5 13 L16.5 18.5 L20 14 L27 24 Z" fill="#a9c8e8" />
      <path d="M12.5 13 L14.6 16.1 L13.4 15.6 L12 16.6 L10.9 15.4 Z" fill="#fff" />
      <path d="M20 14 L21.8 16.6 L20.6 16.2 L19.4 17.1 L18.6 16.2 Z" fill="#fff" />
      <path d="M8 10.5 L13 8 L17 10 L24 6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21.2 5.6 L24.3 5.8 L23.6 8.8" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="FinanceGo home">
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className={cn("font-serif text-[1.45rem] leading-none tracking-tight", light ? "text-white" : "text-navy")}>
        Finance<span className={light ? "text-ice" : "text-electric"}>Go</span>
      </span>
    </Link>
  );
}
