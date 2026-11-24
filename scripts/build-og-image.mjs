// Generates public/og-image.png (1200×630), the preview shown when a FinanceGo link is shared.
// Run with: node scripts/build-og-image.mjs
import { readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const logo = `data:image/png;base64,${(await readFile(new URL("../public/brand/logo-mark.png", import.meta.url))).toString("base64")}`;
const pattern = `data:image/svg+xml;base64,${(await readFile(new URL("../public/patterns/alps.svg", import.meta.url))).toString("base64")}`;

const image = new ImageResponse(
  h(
    "div",
    { style: { width: "100%", height: "100%", display: "flex", position: "relative", background: "#114779", color: "#ffffff", fontFamily: "sans-serif" } },
    h("img", { src: pattern, width: 1200, height: 630, style: { position: "absolute", inset: 0, opacity: 0.18, objectFit: "cover" } }),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", width: "100%" } },
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 24 } },
        h("img", { src: logo, width: 96, height: 96, style: { borderRadius: 22, border: "3px solid rgba(255,255,255,0.25)" } }),
        h("div", { style: { fontSize: 56, fontWeight: 700, letterSpacing: -1 } }, "FinanceGo"),
      ),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 18 } },
        h("div", { style: { fontSize: 66, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5, maxWidth: 980 } }, "Learn finance. Ace the interview."),
        h("div", { style: { fontSize: 30, color: "#a9d2e8", maxWidth: 980 } }, "Courses · 500 practice questions · Mock interview · Brain teasers · Tools · Daily markets news"),
      ),
      h("div", { style: { fontSize: 26, color: "#e4f1f8" } }, "Aprende finanzas · Prepara tus entrevistas · EN / ES"),
    ),
  ),
  { width: 1200, height: 630 },
);

await writeFile(new URL("../public/og-image.png", import.meta.url), Buffer.from(await image.arrayBuffer()));
console.log("Wrote public/og-image.png");
