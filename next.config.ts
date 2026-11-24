import type { NextConfig } from "next";

// The MVP is a fully static site: all content ships with the build and all
// user data lives in the browser (localStorage). `next build` writes it to /out.
//
// On GitHub Pages the site lives under "/<repository>", so the deploy workflow sets
// NEXT_PUBLIC_BASE_PATH. Locally it is empty and nothing changes.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // Every page lives under /en/ or /es/, so unmatched URLs get one shared 404 (app/global-not-found.tsx).
  experimental: { globalNotFound: true },
};

export default nextConfig;
