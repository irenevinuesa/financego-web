/**
 * The path the site is served under. Empty locally; on GitHub Pages it is "/<repository>"
 * (set by the deploy workflow). Next adds it to <Link> and its own assets automatically;
 * use `asset()` for files in /public referenced by hand (img src, CSS url(), metadata icons).
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}
