import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { SceneName } from "@/content/types";
import { Cover, coverInk } from "@/components/art/Cover";
import { cn } from "@/lib/cn";

export interface Crumb {
  href?: string;
  label: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-ink-muted">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-line-strong" aria-hidden />}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="hover:text-electric">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className={i === items.length - 1 ? "text-ink" : undefined}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  scene,
  actions,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  crumbs?: Crumb[];
  scene?: SceneName;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="container-page pt-8 sm:pt-10">
      {crumbs && <Breadcrumbs items={crumbs} className="mb-6" />}
      <div className={cn("grid items-center gap-8", scene && "lg:grid-cols-[1.25fr_1fr]")}>
        <div className="max-w-3xl animate-fade-up">
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">{title}</h1>
          {description && <div className="mt-4 text-lg leading-relaxed text-ink-muted">{description}</div>}
          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {scene && (
          <div className="relative hidden h-56 overflow-hidden rounded-3xl shadow-lift lg:block">
            <Cover name={scene} className="h-full w-full">
              <span className={cn("absolute bottom-3 right-6 select-none font-serif text-8xl leading-none", coverInk(scene) === "light" ? "text-cream/25" : "text-navy/15")}>FG</span>
            </Cover>
          </div>
        )}
      </div>
      {children}
    </header>
  );
}
