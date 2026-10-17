import type { SceneName } from "@/content/types";
import { cn } from "@/lib/cn";
import { Scene } from "./Scene";

export function Polaroid({
  scene,
  caption,
  rotate = 0,
  className,
}: {
  scene: SceneName;
  caption: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <figure
      className={cn("bg-white p-2.5 pb-0 shadow-polaroid transition-transform duration-300 hover:rotate-0", className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="aspect-square overflow-hidden bg-ice-soft">
        <Scene name={scene} className="h-full w-full" />
      </div>
      <figcaption className="py-2 text-center font-hand text-xl leading-none text-navy">{caption}</figcaption>
    </figure>
  );
}

/** A small hand-drawn arrow that pairs with handwritten annotations. */
export function HandArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} fill="none" aria-hidden>
      <path d="M6 10 C 30 50, 70 54, 108 36" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M96 28 L109 36 L97 46" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
