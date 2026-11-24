/* Number formatting used across tools, lessons and dashboards. */

export function fmtNumber(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Currency in the caller's unit, e.g. fmtMoney(1234.5, { unit: "m" }) → "$1,234.5m". */
export function fmtMoney(value: number, opts: { decimals?: number; unit?: string; symbol?: string } = {}): string {
  if (!Number.isFinite(value)) return "—";
  const { decimals = 0, unit = "", symbol = "$" } = opts;
  const sign = value < 0 ? "−" : "";
  return `${sign}${symbol}${fmtNumber(Math.abs(value), decimals)}${unit}`;
}

/** Compact currency: $1.2K, $3.4M, $1.1B. */
export function fmtMoneyCompact(value: number, symbol = "$"): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1e9) return `${sign}${symbol}${(abs / 1e9).toFixed(abs >= 1e10 ? 0 : 1)}B`;
  if (abs >= 1e6) return `${sign}${symbol}${(abs / 1e6).toFixed(abs >= 1e7 ? 0 : 1)}M`;
  if (abs >= 1e3) return `${sign}${symbol}${(abs / 1e3).toFixed(abs >= 1e4 ? 0 : 1)}K`;
  return `${sign}${symbol}${abs.toFixed(0)}`;
}

/** Decimal → percent string: fmtPct(0.0877) → "8.77%". */
export function fmtPct(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function fmtMultiple(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(decimals)}x`;
}

export function fmtSignedPct(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "—";
  const s = (value * 100).toFixed(decimals);
  return value > 0 ? `+${s}%` : value < 0 ? `−${s.replace("-", "")}%` : `${s}%`;
}

export function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }, locale = "en-GB") {
  if (!iso) return "—";
  // YYYY-MM-DD strings are local calendar dates; parse them without a timezone shift.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale, opts);
}

export function fmtRelative(iso: string, now = new Date(), lang: "en" | "es" = "en"): string {
  const d = new Date(iso);
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (lang === "es") {
    if (diff < 60) return "ahora mismo";
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    const days = Math.floor(diff / 86400);
    if (days === 1) return "ayer";
    if (days < 7) return `hace ${days} días`;
    return fmtDate(iso, undefined, "es-ES");
  }
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return fmtDate(iso);
}

/**
 * Parses what a learner types into a numeric answer box.
 * Accepts "1,250", "$1,250", "8.5%", "12x", "−3" and returns null for anything else.
 */
export function parseNumericInput(raw: string): number | null {
  const cleaned = raw
    .trim()
    .replace(/[−–]/g, "-")
    .replace(/[$€£,\s]/g, "")
    .replace(/(%|x|bps?|m|bn|years?|yrs?)$/i, "");
  if (cleaned === "" || !/^-?\d*\.?\d+(e-?\d+)?$/i.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function isWithinTolerance(input: number, expected: number, tolerance: number): boolean {
  return Math.abs(input - expected) <= tolerance + 1e-9;
}
