import { Globe, Lightbulb, MessagesSquare, TriangleAlert } from "lucide-react";
import type { Block, CalloutVariant } from "@/content/types";
import { RichText } from "@/components/math/RichText";
import { Tex } from "@/components/math/Tex";
import { LessonWidget } from "./LessonWidget";
import { cn } from "@/lib/cn";

const CALLOUTS: Record<CalloutVariant, { icon: typeof Lightbulb; label: string; className: string; iconClass: string }> = {
  insight: { icon: Lightbulb, label: "Key insight", className: "border-ice bg-ice-soft/50", iconClass: "text-electric" },
  interview: { icon: MessagesSquare, label: "In the interview", className: "border-navy/20 bg-white", iconClass: "text-navy" },
  mistake: { icon: TriangleAlert, label: "Watch out", className: "border-warning-ink/20 bg-warning-soft/60", iconClass: "text-warning-ink" },
  "real-world": { icon: Globe, label: "Real-world application", className: "border-success/25 bg-success-soft/50", iconClass: "text-success-ink" },
};

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-[1.05rem] leading-[1.8] text-ink">
          <RichText text={block.text} />
        </p>
      );
    case "h":
      return <h2 className="pt-4 font-serif text-2xl text-navy sm:text-[1.7rem]">{block.text}</h2>;
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag className={cn("space-y-2 pl-6 text-[1.05rem] leading-relaxed text-ink", block.ordered ? "list-decimal" : "list-disc marker:text-electric")}>
          {block.items.map((it, i) => (
            <li key={i} className="pl-1">
              <RichText text={it} />
            </li>
          ))}
        </Tag>
      );
    }
    case "formula":
      return (
        <figure className="rounded-2xl border border-line bg-white px-4 py-3 shadow-card sm:px-6">
          {block.caption && <figcaption className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{block.caption}</figcaption>}
          <Tex tex={block.tex} block className="py-1 text-navy" />
          {block.where && (
            <dl className="mt-1 grid gap-x-6 gap-y-1 border-t border-line pt-3 text-sm sm:grid-cols-2">
              {block.where.map(([sym, meaning]) => (
                <div key={sym} className="flex items-baseline gap-2">
                  <dt className="shrink-0 text-navy">
                    <Tex tex={sym} />
                  </dt>
                  <dd className="text-ink-muted">{meaning}</dd>
                </div>
              ))}
            </dl>
          )}
        </figure>
      );
    case "example":
      return (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <p className="border-b border-line bg-cream/70 px-5 py-2.5 text-sm">
            <span className="font-semibold text-electric">Worked example · </span>
            <span className="font-medium text-navy">{block.title}</span>
          </p>
          <div className="space-y-3 px-5 py-4">
            {block.setup && (
              <p className="text-sm text-ink">
                <RichText text={block.setup} />
              </p>
            )}
            <ol className="space-y-2.5">
              {block.steps.map((s, i) => (
                <li key={i} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <span className="text-sm font-medium text-ink-muted">
                    {i + 1}. {s.label}
                  </span>
                  <span className="min-w-0 overflow-x-auto text-sm text-ink">{s.tex ? <Tex tex={s.tex} /> : <RichText text={s.text ?? ""} />}</span>
                </li>
              ))}
            </ol>
            <p className="rounded-xl bg-ice-soft/60 px-4 py-2.5 text-sm font-medium text-navy">
              <RichText text={block.result} />
            </p>
          </div>
        </div>
      );
    case "widget":
      return (
        <figure>
          <LessonWidget id={block.widget} />
          {block.caption && <figcaption className="mt-2 text-xs text-ink-muted">{block.caption}</figcaption>}
        </figure>
      );
    case "callout": {
      const c = CALLOUTS[block.variant];
      const Icon = c.icon;
      return (
        <aside className={cn("rounded-2xl border px-5 py-4", c.className)}>
          <p className={cn("mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider", c.iconClass)}>
            <Icon className="h-4 w-4" /> {c.label}
          </p>
          <p className="font-semibold text-navy">
            <RichText text={block.title} />
          </p>
          <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink">
            <RichText text={block.text} />
          </p>
        </aside>
      );
    }
    case "table":
      return (
        <figure className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full min-w-[32rem] text-sm">
            {block.caption && <caption className="px-4 pt-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">{block.caption}</caption>}
            <thead>
              <tr className="border-b border-line">
                {block.headers.map((hd, i) => (
                  <th key={i} className="px-4 py-2.5 text-left font-semibold text-navy">
                    {hd}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className={cn("px-4 py-2.5 align-top text-ink", j === 0 && "font-medium text-navy")}>
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      );
  }
}

export function LessonBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-lesson space-y-6">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </div>
  );
}
