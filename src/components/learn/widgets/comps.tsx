"use client";

import { useState } from "react";
import { impliedPriceFromEvMultiple, impliedPriceFromPe, mean, median, percentile } from "@/lib/finance/comps";
import { fmtMoney, fmtMultiple, fmtPct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Chip } from "@/components/ui/primitives";
import { C, ChartFrame } from "@/components/charts/ChartKit";
import { KpiRow, WidgetShell } from "./WidgetShell";

/* Illustrative peer set ($m, next-twelve-months figures). Not real companies. */
const PEERS = [
  { id: "A", ev: 1800, revenue: 1125, ebitda: 200, equity: 1350, netIncome: 90, growth: 0.06 },
  { id: "B", ev: 960, revenue: 750, ebitda: 120, equity: 675, netIncome: 50, growth: 0.04 },
  { id: "C", ev: 2500, revenue: 1400, ebitda: 250, equity: 2040, netIncome: 120, growth: 0.08 },
  { id: "D", ev: 680, revenue: 570, ebitda: 80, equity: 504, netIncome: 36, growth: 0.03 },
  { id: "E", ev: 4800, revenue: 1370, ebitda: 300, equity: 4500, netIncome: 150, growth: 0.18 },
  { id: "F", ev: 1330, revenue: 875, ebitda: 140, equity: 1120, netIncome: 70, growth: 0.05 },
].map((p) => ({ ...p, evRev: p.ev / p.revenue, evEbitda: p.ev / p.ebitda, pe: p.equity / p.netIncome, margin: p.ebitda / p.revenue }));

const TARGET = { revenue: 1000, ebitda: 150, netIncome: 70, netDebt: 300, shares: 60, price: 17 };

type MultipleKey = "evRev" | "evEbitda" | "pe";
const MULTIPLES: { key: MultipleKey; label: string; metric: string }[] = [
  { key: "evRev", label: "EV / Revenue", metric: "Revenue $1,000m" },
  { key: "evEbitda", label: "EV / EBITDA", metric: "EBITDA $150m" },
  { key: "pe", label: "P / E", metric: "Net income $70m" },
];

function priceAt(key: MultipleKey, multiple: number) {
  if (key === "pe") return impliedPriceFromPe(multiple, TARGET.netIncome, TARGET.shares);
  return impliedPriceFromEvMultiple(multiple, key === "evRev" ? TARGET.revenue : TARGET.ebitda, TARGET.netDebt, TARGET.shares);
}

const usd = (v: number) => fmtMoney(v, { decimals: 2 });

export function CompsRange() {
  const [included, setIncluded] = useState<Record<string, boolean>>({ A: true, B: true, C: true, D: true, E: false, F: true });
  const [basis, setBasis] = useState<"iqr" | "minmax">("iqr");
  const set = PEERS.filter((p) => included[p.id]);
  const enough = set.length >= 2;

  const stats = MULTIPLES.map((m) => {
    const xs = set.map((p) => p[m.key]);
    const lowM = basis === "iqr" ? percentile(xs, 0.25) : Math.min(...xs);
    const highM = basis === "iqr" ? percentile(xs, 0.75) : Math.max(...xs);
    const medM = median(xs);
    return { ...m, mean: mean(xs), median: medM, lowM, highM, low: priceAt(m.key, lowM), mid: priceAt(m.key, medM), high: priceAt(m.key, highM) };
  });

  const lo = enough ? Math.min(TARGET.price, ...stats.map((s) => s.low)) : 0;
  const hi = enough ? Math.max(TARGET.price, ...stats.map((s) => s.high)) : 1;
  const pad = (hi - lo) * 0.08 || 1;
  const axisLo = Math.max(0, Math.floor(lo - pad));
  const axisHi = Math.ceil(hi + pad);
  const pos = (v: number) => `${((v - axisLo) / (axisHi - axisLo)) * 100}%`;

  const ev = stats[1];
  const statRows = enough
    ? [
        { label: "Mean", f: (k: MultipleKey) => stats.find((s) => s.key === k)!.mean },
        { label: "Median", f: (k: MultipleKey) => stats.find((s) => s.key === k)!.median },
        { label: basis === "iqr" ? "25th percentile" : "Minimum", f: (k: MultipleKey) => stats.find((s) => s.key === k)!.lowM },
        { label: basis === "iqr" ? "75th percentile" : "Maximum", f: (k: MultipleKey) => stats.find((s) => s.key === k)!.highM },
      ]
    : [];

  return (
    <WidgetShell
      title="Spread the comps and value the target"
      controls={
        <>
          <div>
            <p className="mb-2 text-sm text-ink">Peers in the set</p>
            <div className="flex flex-wrap gap-2">
              {PEERS.map((p) => (
                <Chip key={p.id} active={included[p.id]} onClick={() => setIncluded((s) => ({ ...s, [p.id]: !s[p.id] }))}>
                  Peer {p.id}
                </Chip>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-muted">Peer E grows 18% a year, far faster than the rest. Switch it on to see what an outlier does.</p>
          </div>
          <div>
            <p className="mb-2 text-sm text-ink">Range to apply</p>
            <div className="flex flex-wrap gap-2">
              <Chip active={basis === "iqr"} onClick={() => setBasis("iqr")}>
                25th–75th pct
              </Chip>
              <Chip active={basis === "minmax"} onClick={() => setBasis("minmax")}>
                Min–max
              </Chip>
            </div>
          </div>
          <p className="text-xs text-ink-muted">Target: revenue $1,000m, EBITDA $150m, net income $70m, net debt $300m, 60m diluted shares, share price $17.00. All figures illustrative.</p>
        </>
      }
    >
      {!enough ? (
        <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning-ink">Include at least two peers to build a range.</p>
      ) : (
        <>
          <KpiRow
            items={[
              { label: "Median EV / EBITDA", value: fmtMultiple(ev.median), hint: `mean ${fmtMultiple(ev.mean)}` },
              { label: "Implied price (EV/EBITDA)", value: `${usd(ev.low)}–${usd(ev.high)}` },
              { label: "Price at median", value: usd(ev.mid), hint: `${fmtPct(ev.mid / TARGET.price - 1, 0)} vs $17.00` },
            ]}
          />
          <div className="mb-5 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[30rem] text-xs">
              <thead className="bg-cream">
                <tr>
                  {["Peer", "EV / Revenue", "EV / EBITDA", "P / E", "Growth", "EBITDA margin"].map((hd) => (
                    <th key={hd} className="px-2.5 py-2 text-left font-semibold text-navy">
                      {hd}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PEERS.map((p) => (
                  <tr key={p.id} className={cn("border-t border-line", !included[p.id] && "text-ink-muted line-through decoration-ink-muted/50")}>
                    <td className="px-2.5 py-1.5 font-medium">Peer {p.id}</td>
                    <td className="figure px-2.5 py-1.5">{fmtMultiple(p.evRev, 2)}</td>
                    <td className="figure px-2.5 py-1.5">{fmtMultiple(p.evEbitda)}</td>
                    <td className="figure px-2.5 py-1.5">{fmtMultiple(p.pe)}</td>
                    <td className="figure px-2.5 py-1.5">{fmtPct(p.growth, 0)}</td>
                    <td className="figure px-2.5 py-1.5">{fmtPct(p.margin, 1)}</td>
                  </tr>
                ))}
                {statRows.map((r, i) => (
                  <tr key={r.label} className={cn("bg-ice-soft/40 font-semibold text-navy", i === 0 && "border-t-2 border-line-strong")}>
                    <td className="px-2.5 py-1.5">{r.label}</td>
                    <td className="figure px-2.5 py-1.5">{fmtMultiple(r.f("evRev"), 2)}</td>
                    <td className="figure px-2.5 py-1.5">{fmtMultiple(r.f("evEbitda"), 2)}</td>
                    <td className="figure px-2.5 py-1.5">{fmtMultiple(r.f("pe"), 2)}</td>
                    <td className="px-2.5 py-1.5" />
                    <td className="px-2.5 py-1.5" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ChartFrame
            title="Football field: implied value per share"
            subtitle={`Bars span the ${basis === "iqr" ? "25th–75th percentile" : "minimum–maximum"} multiples; the tick marks the median`}
            legend={[
              { label: "Implied range", color: C.s1 },
              { label: "Current price $17.00", color: C.s2, shape: "line" },
            ]}
            table={{
              headers: ["Multiple", "Applied to", "Low", "Median", "High"],
              rows: stats.map((s) => [s.label, s.metric, usd(s.low), usd(s.mid), usd(s.high)]),
            }}
          >
            <div className="relative space-y-4 pb-6 pt-1">
              <div className="pointer-events-none absolute inset-y-0 left-[7.5rem] right-0 sm:left-[8.5rem]">
                <div className="absolute inset-y-0 w-0.5" style={{ left: pos(TARGET.price), background: C.s2 }} />
              </div>
              {stats.map((s) => (
                <div key={s.key} className="grid grid-cols-[7.5rem_1fr] items-center sm:grid-cols-[8.5rem_1fr]">
                  <div className="pr-2 text-xs">
                    <p className="font-semibold text-navy">{s.label}</p>
                    <p className="text-ink-muted">
                      {fmtMultiple(s.lowM, s.key === "evRev" ? 2 : 1)}–{fmtMultiple(s.highM, s.key === "evRev" ? 2 : 1)}
                    </p>
                  </div>
                  <div className="relative h-8 rounded-md bg-cream/70">
                    <div className="absolute inset-y-1 rounded" style={{ left: pos(s.low), width: `calc(${pos(s.high)} - ${pos(s.low)})`, background: C.s1 }} />
                    <div className="absolute inset-y-0 w-0.5 bg-white" style={{ left: pos(s.mid) }} />
                    <span className="figure absolute -bottom-4 -translate-x-full pr-1 text-[0.68rem] text-ink-muted" style={{ left: pos(s.low) }}>
                      {usd(s.low)}
                    </span>
                    <span className="figure absolute -bottom-4 pl-1 text-[0.68rem] text-ink-muted" style={{ left: pos(s.high) }}>
                      {usd(s.high)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ChartFrame>
        </>
      )}
    </WidgetShell>
  );
}
