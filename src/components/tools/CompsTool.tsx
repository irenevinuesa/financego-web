"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getTool } from "@/content/tools";
import { impliedPriceFromEvMultiple, impliedPriceFromPe, mean, median, percentile } from "@/lib/finance/comps";
import { fmtMoney, fmtMultiple } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/ui/Slider";
import { Interpretation, Notes, Panel, ToolActions, Warning, downloadCsv } from "./ToolKit";

interface Peer {
  id: number;
  name: string;
  ev: number;
  equity: number;
  revenue: number;
  ebitda: number;
  netIncome: number;
}

/** Illustrative peers, not real companies. */
const DEFAULT_PEERS: Peer[] = [
  { id: 1, name: "Peer A", ev: 4200, equity: 3600, revenue: 2100, ebitda: 420, netIncome: 210 },
  { id: 2, name: "Peer B", ev: 6100, equity: 5000, revenue: 2700, ebitda: 610, netIncome: 300 },
  { id: 3, name: "Peer C", ev: 2900, equity: 2300, revenue: 1600, ebitda: 330, netIncome: 140 },
  { id: 4, name: "Peer D", ev: 8800, equity: 7900, revenue: 3900, ebitda: 800, netIncome: 450 },
  { id: 5, name: "Peer E", ev: 3500, equity: 2600, revenue: 2000, ebitda: 300, netIncome: 120 },
];
const DEFAULT_TARGET = { revenue: 1800, ebitda: 340, netIncome: 160, netDebt: 500, shares: 100 };

type Metric = "evRevenue" | "evEbitda" | "pe";
const METRICS: { key: Metric; label: string }[] = [
  { key: "evRevenue", label: "EV / Revenue" },
  { key: "evEbitda", label: "EV / EBITDA" },
  { key: "pe", label: "P / E" },
];

const multiples = (p: Peer): Record<Metric, number> => ({
  evRevenue: p.revenue > 0 ? p.ev / p.revenue : Number.NaN,
  evEbitda: p.ebitda > 0 ? p.ev / p.ebitda : Number.NaN,
  pe: p.netIncome > 0 ? p.equity / p.netIncome : Number.NaN,
});

const cellBase = "h-9 w-full rounded-lg border border-line-strong bg-white px-2 text-sm text-navy outline-none focus:border-electric";
const cellInput = `${cellBase} min-w-[4.5rem] text-right tabular-nums`;

export function CompsTool() {
  const [peers, setPeers] = useState(DEFAULT_PEERS);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const nextId = Math.max(0, ...peers.map((p) => p.id)) + 1;

  const updatePeer = (id: number, key: keyof Peer, raw: string) =>
    setPeers((ps) => ps.map((p) => (p.id !== id ? p : { ...p, [key]: key === "name" ? raw : raw === "" ? Number.NaN : Number(raw) })));
  const setT = (k: keyof typeof DEFAULT_TARGET) => (x: number) => setTarget((t) => ({ ...t, [k]: x }));

  const rows = peers.map((p) => ({ peer: p, m: multiples(p) }));
  const stats = METRICS.map(({ key, label }) => {
    const values = rows.map((r) => r.m[key]).filter((x) => Number.isFinite(x) && x > 0);
    return { key, label, n: values.length, p25: percentile(values, 0.25), median: median(values), mean: mean(values), p75: percentile(values, 0.75) };
  });

  const targetValid = target.shares > 0 && Number.isFinite(target.netDebt);
  const implied = stats.map((s) => {
    const price = (mult: number) =>
      s.key === "pe" ? impliedPriceFromPe(mult, target.netIncome, target.shares) : impliedPriceFromEvMultiple(mult, s.key === "evRevenue" ? target.revenue : target.ebitda, target.netDebt, target.shares);
    return { ...s, low: price(s.p25), mid: price(s.median), high: price(s.p75) };
  });
  const usable = implied.filter((x) => x.n >= 2 && Number.isFinite(x.low) && Number.isFinite(x.high));
  const scaleMax = Math.max(1, ...usable.map((x) => x.high)) * 1.1;
  const ebitdaRow = implied.find((x) => x.key === "evEbitda");

  const tool = getTool("trading-comps")!;
  const exportCsv = () =>
    downloadCsv("financego-trading-comps.csv", [
      ["Company", "EV", "Equity value", "Revenue", "EBITDA", "Net income", "EV/Revenue", "EV/EBITDA", "P/E"],
      ...rows.map(({ peer: p, m }) => [p.name, p.ev, p.equity, p.revenue, p.ebitda, p.netIncome, m.evRevenue.toFixed(2), m.evEbitda.toFixed(2), m.pe.toFixed(2)]),
      [],
      ["Multiple", "25th percentile", "Median", "Mean", "75th percentile", "Implied price low", "Implied price mid", "Implied price high"],
      ...implied.map((s) => [s.label, s.p25.toFixed(2), s.median.toFixed(2), s.mean.toFixed(2), s.p75.toFixed(2), s.low.toFixed(2), s.mid.toFixed(2), s.high.toFixed(2)]),
    ]);

  return (
    <div className="space-y-6">
      <Panel
        title="Peer group ($m)"
        action={
          <ToolActions
            onReset={() => {
              setPeers(DEFAULT_PEERS);
              setTarget(DEFAULT_TARGET);
            }}
            onExport={exportCsv}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-muted">
                <th className="py-2 pr-2 text-left font-medium">Company</th>
                <th className="px-1 py-2 text-right font-medium">EV</th>
                <th className="px-1 py-2 text-right font-medium">Equity value</th>
                <th className="px-1 py-2 text-right font-medium">Revenue</th>
                <th className="px-1 py-2 text-right font-medium">EBITDA</th>
                <th className="px-1 py-2 text-right font-medium">Net income</th>
                {METRICS.map((m) => (
                  <th key={m.key} className="px-2 py-2 text-right font-medium">
                    {m.label}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ peer: p, m }) => (
                <tr key={p.id} className="border-b border-line/60">
                  <td className="py-1.5 pr-2">
                    <input value={p.name} onChange={(e) => updatePeer(p.id, "name", e.target.value)} aria-label="Company name" className={`${cellBase} min-w-[7rem]`} />
                  </td>
                  {(["ev", "equity", "revenue", "ebitda", "netIncome"] as const).map((k) => (
                    <td key={k} className="px-1 py-1.5">
                      <input
                        type="number"
                        value={Number.isFinite(p[k]) ? p[k] : ""}
                        onChange={(e) => updatePeer(p.id, k, e.target.value)}
                        aria-label={`${p.name} ${k}`}
                        className={cellInput}
                      />
                    </td>
                  ))}
                  {METRICS.map(({ key }) => (
                    <td key={key} className="px-2 py-1.5 text-right tabular-nums text-ink">
                      {Number.isFinite(m[key]) ? fmtMultiple(m[key]) : "n.m."}
                    </td>
                  ))}
                  <td className="pl-1">
                    <Button variant="ghost" size="sm" aria-label={`Remove ${p.name}`} disabled={peers.length <= 2} onClick={() => setPeers((ps) => ps.filter((x) => x.id !== p.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-sm">
              {(["p75", "mean", "median", "p25"] as const).map((k) => (
                <tr key={k} className={k === "median" ? "font-semibold text-navy" : "text-ink-muted"}>
                  <td colSpan={6} className="py-1.5 text-right">
                    {{ p75: "75th percentile", mean: "Mean", median: "Median", p25: "25th percentile" }[k]}
                  </td>
                  {stats.map((s) => (
                    <td key={s.key} className="px-2 py-1.5 text-right tabular-nums">
                      {s.n ? fmtMultiple(s[k]) : "—"}
                    </td>
                  ))}
                  <td />
                </tr>
              ))}
            </tfoot>
          </table>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          disabled={peers.length >= 12}
          onClick={() => setPeers((ps) => [...ps, { id: nextId, name: `Peer ${String.fromCharCode(64 + nextId)}`, ev: Number.NaN, equity: Number.NaN, revenue: Number.NaN, ebitda: Number.NaN, netIncome: Number.NaN }])}
        >
          <Plus className="h-4 w-4" /> Add peer
        </Button>
        <p className="mt-2 text-xs text-ink-muted">Illustrative numbers. Multiples with a zero or negative denominator show as n.m. (not meaningful) and are left out of the statistics.</p>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Panel title="Target company">
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Revenue" value={target.revenue} onChange={setT("revenue")} prefix="$" unit="m" step={50} />
            <NumberField label="EBITDA" value={target.ebitda} onChange={setT("ebitda")} prefix="$" unit="m" step={10} />
            <NumberField label="Net income" value={target.netIncome} onChange={setT("netIncome")} prefix="$" unit="m" step={10} />
            <NumberField label="Net debt" value={target.netDebt} onChange={setT("netDebt")} prefix="$" unit="m" step={50} hint="Debt − cash + other claims" />
            <NumberField label="Diluted shares" value={target.shares} onChange={setT("shares")} unit="m" step={5} error={target.shares > 0 ? undefined : "Enter a positive share count."} />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Implied share price: 25th to 75th percentile">
            {targetValid && usable.length ? (
              <div className="space-y-4">
                {usable.map((s) => (
                  <div key={s.key}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-navy">{s.label}</span>
                      <span className="tabular-nums text-ink">
                        {fmtMoney(s.low, { decimals: 2 })} – {fmtMoney(s.high, { decimals: 2 })} <span className="text-ink-muted">(median {fmtMoney(s.mid, { decimals: 2 })})</span>
                      </span>
                    </div>
                    <div className="relative mt-1.5 h-5 rounded-full bg-cream">
                      <span
                        className="absolute inset-y-0 rounded-full bg-navy/80"
                        style={{ left: `${(Math.max(0, s.low) / scaleMax) * 100}%`, width: `${(Math.max(0, s.high - Math.max(0, s.low)) / scaleMax) * 100}%` }}
                      />
                      <span className="absolute inset-y-[-3px] w-0.5 rounded bg-error" style={{ left: `${(Math.max(0, s.mid) / scaleMax) * 100}%` }} title="Median" />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-ink-muted">Bars show the 25th–75th percentile range; the red line marks the median.</p>
              </div>
            ) : (
              <Warning>Enter at least two peers with positive figures and a positive share count.</Warning>
            )}
          </Panel>

          {ebitdaRow && Number.isFinite(ebitdaRow.mid) && (
            <Interpretation
              points={[
                <>
                  At the median EV/EBITDA of <strong>{fmtMultiple(ebitdaRow.median)}</strong>, the target&apos;s EV is{" "}
                  <strong>{fmtMoney(ebitdaRow.median * target.ebitda, { decimals: 0, unit: "m" })}</strong>, and after <strong>{fmtMoney(target.netDebt, { unit: "m" })}</strong> of net debt
                  each share is worth about <strong>{fmtMoney(ebitdaRow.mid, { decimals: 2 })}</strong>.
                </>,
                <>The median is less sensitive than the mean to one unusually cheap or expensive peer, which is why bankers quote it first.</>,
                <>Where in the range the target belongs depends on how it compares on growth, margins and risk, so benchmark those before choosing a multiple.</>,
              ]}
            />
          )}
        </div>
      </div>

      <Notes
        tool={tool}
        assumptions={[
          "Enter peer figures on the same basis: all LTM or all next-year, in one currency and unit.",
          "Equity value means fully diluted market capitalisation; EV adds net debt and other claims.",
          "EV multiples are applied to the target's EBITDA or revenue and bridged to equity with its net debt; P/E is applied to net income directly.",
          "Percentiles use linear interpolation (like Excel's PERCENTILE.INC). Small peer groups make them unstable.",
        ]}
        formulas={[
          { label: "Implied price (EV multiple)", tex: String.raw`P = \frac{m \times \text{EBITDA} - \text{Net debt}}{\text{Diluted shares}}` },
          { label: "Implied price (P/E)", tex: String.raw`P = \frac{(P/E) \times \text{Net income}}{\text{Diluted shares}}` },
        ]}
      />
    </div>
  );
}
