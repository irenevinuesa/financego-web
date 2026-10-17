import katex from "katex";

/** Renders TeX with KaTeX. Content is FinanceGo's own static strings, never user input. */
export function Tex({ tex, block = false, className }: { tex: string; block?: boolean; className?: string }) {
  const html = katex.renderToString(tex, { displayMode: block, throwOnError: false, output: "htmlAndMathml", strict: "ignore" });
  const Tag = block ? "div" : "span";
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
