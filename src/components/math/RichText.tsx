import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Tex } from "./Tex";

/**
 * A tiny inline formatter for FinanceGo's own content strings:
 *   **bold**  *italic*  `code`  [[inline TeX]]  [link text](/internal/path)
 * Dollar signs are left alone so "$10 of depreciation" reads naturally.
 */
const TOKEN = /(\[\[[\s\S]+?\]\]|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

export function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  const nodes: ReactNode[] = parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("[[") && part.endsWith("]]")) return <Tex key={i} tex={part.slice(2, -2)} />;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="rounded bg-cream-deep px-1 py-0.5 font-mono text-[0.9em] text-navy">
          {part.slice(1, -1)}
        </code>
      );
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      return (
        <Link key={i} href={href} className="font-medium text-electric underline decoration-electric/30 underline-offset-2 hover:decoration-electric">
          {label}
        </Link>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
  return <>{nodes}</>;
}
