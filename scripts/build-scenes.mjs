// Renders FinanceGo's vector landscapes to static SVG files in public/scenes/.
// Usage: npm run scenes
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "src/components/art/SceneSvg.tsx"), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});

// Write the compiled module inside node_modules so "react" resolves normally.
const cacheDir = join(root, "node_modules/.cache/financego");
mkdirSync(cacheDir, { recursive: true });
const compiled = join(cacheDir, "scene-svg.mjs");
writeFileSync(compiled, outputText);

const { SceneSvg } = await import(pathToFileURL(compiled).href);
const { createElement } = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");

const names = ["alps", "lake", "summit", "trail", "nyc", "london", "campus"];
const outDir = join(root, "public/scenes");
mkdirSync(outDir, { recursive: true });
for (const name of names) {
  const svg = renderToStaticMarkup(createElement(SceneSvg, { name }));
  writeFileSync(join(outDir, `${name}.svg`), `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`);
  console.log(`scenes/${name}.svg  ${(svg.length / 1024).toFixed(1)} KB`);
}
