/**
 * The public address of the site, for links in the sitemap and social previews.
 * Set NEXT_PUBLIC_SITE_URL in the host's environment (e.g. https://financego-olive.vercel.app).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://financego-olive.vercel.app").replace(/\/$/, "");
