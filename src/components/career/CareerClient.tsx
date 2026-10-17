"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { CHECKLISTS } from "@/content/careers/resources";
import { actions, useHydrated, useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Card, LocalDataNote, ProgressBar } from "@/components/ui/primitives";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink hover:border-electric hover:text-electric"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function Checklists() {
  const state = useStore();
  const hydrated = useHydrated();
  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2">
        {CHECKLISTS.map((list) => {
          const done = hydrated ? state.checklists[list.id] ?? [] : [];
          return (
            <Card key={list.id} className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-navy">{list.title}</h2>
                <span className="text-xs text-ink-muted">
                  {done.length}/{list.items.length}
                </span>
              </div>
              <ProgressBar value={done.length / list.items.length} tone={done.length === list.items.length ? "success" : "blue"} className="mt-3" label={`${list.title} progress`} />
              <ul className="mt-4 space-y-2">
                {list.items.map((it) => {
                  const checked = done.includes(it.id);
                  return (
                    <li key={it.id}>
                      <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors", checked ? "border-success/40 bg-success-soft/50 text-ink-muted line-through" : "border-line hover:border-electric/50")}>
                        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#228565]" checked={checked} disabled={!hydrated} onChange={() => actions.toggleChecklistItem(list.id, it.id)} />
                        <span className={checked ? "" : "text-ink"}>{it.text}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
      <LocalDataNote className="mt-5" />
    </div>
  );
}
