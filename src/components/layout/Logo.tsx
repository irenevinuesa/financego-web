import Link from "@/components/i18n/Link";
import { asset } from "@/lib/base-path";
import { cn } from "@/lib/cn";

/**
 * The FG monogram. The file is the solid navy square cropped from the original
 * logo (assets/brand/financego-logo-original.webp); CSS rounds the corners so it
 * sits cleanly on any background.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset("/brand/logo-mark.png")} alt="" aria-hidden width={160} height={160} className={cn("rounded-[22%]", className)} />
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="FinanceGo home">
      <LogoMark className="h-9 w-9 shrink-0" />
      <span className={cn("font-serif text-[1.45rem] leading-none tracking-tight", light ? "text-white" : "text-navy")}>
        Finance<span className={light ? "text-ice" : "text-electric"}>Go</span>
      </span>
    </Link>
  );
}
