import type { NextConfig } from "next";

// The MVP is a fully static site: all content ships with the build and all
// user data lives in the browser (localStorage). `next build` writes it to /out.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
