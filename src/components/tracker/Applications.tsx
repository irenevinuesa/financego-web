"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Briefcase, Kanban, MapPin, Pencil, Plus, Search, Table2, Trash, X } from "lucide-react";
import { actions, APP_STAGES, localDate, STAGE_LABELS, uid, useHydrated, useStore, type AppStage, type Application } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Chip, EmptyState, Input, Label, LocalDataNote, Select, Textarea } from "@/components/ui/primitives";

type Draft = Omit<Application, "createdAt" | "updatedAt">;

const EMPTY: Draft = { id: "", company: "", role: "", division: "", location: "", appliedOn: "", stage: "interested", nextInterview: "", notes: "", outcome: "" };

const STAGE_TONE: Record<AppStage, "neutral" | "blue" | "success" | "error" | "warning" | "outline" | "navy"> = {
  interested: "outline",
  applied: "neutral",
  "online-assessment": "blue",
  "first-round": "blue",
  "final-round": "navy",
  offer: "success",
  rejected: "error",
  withdrawn: "warning",
};

/* ───────────── Form ───────────── */

function AppForm({ initial, onClose }: { initial: Draft; onClose: () => void }) {
  const [d, setD] = useState<Draft>(initial);
  const [error, setError] = useState("");
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.company.trim() || !d.role.trim()) return setError("Company and role are required.");
    actions.upsertApplication({ ...d, id: d.id || uid(), company: d.company.trim(), role: d.role.trim() });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy-deep/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
      <form
        onSubmit={save}
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift animate-pop sm:rounded-3xl"
        aria-label={initial.id ? "Edit application" : "Add application"}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">{initial.id ? "Edit application" : "Add an application"}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-cream" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="a-company">Company *</Label>
            <Input id="a-company" value={d.company} onChange={(e) => set("company", e.target.value)} maxLength={80} autoFocus />
          </div>
          <div>
            <Label htmlFor="a-role">Role *</Label>
            <Input id="a-role" value={d.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Summer Analyst" maxLength={80} />
          </div>
          <div>
            <Label htmlFor="a-div">Division</Label>
            <Input id="a-div" value={d.division} onChange={(e) => set("division", e.target.value)} placeholder="e.g. M&A, Leveraged Finance" maxLength={80} />
          </div>
          <div>
            <Label htmlFor="a-loc">Location</Label>
            <Input id="a-loc" value={d.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Madrid" maxLength={60} />
          </div>
          <div>
            <Label htmlFor="a-date">Application date</Label>
            <Input id="a-date" type="date" value={d.appliedOn} onChange={(e) => set("appliedOn", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="a-stage">Current stage</Label>
            <Select id="a-stage" value={d.stage} onChange={(e) => set("stage", e.target.value as AppStage)}>
              {APP_STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="a-next">Next interview date</Label>
            <Input id="a-next" type="date" value={d.nextInterview} onChange={(e) => set("nextInterview", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="a-outcome">Outcome</Label>
            <Input id="a-outcome" value={d.outcome} onChange={(e) => set("outcome", e.target.value)} placeholder="e.g. Offer accepted" maxLength={80} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="a-notes">Notes</Label>
            <Textarea id="a-notes" rows={4} value={d.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Contacts, interview topics, follow-ups…" maxLength={2000} />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-error-ink">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{initial.id ? "Save changes" : "Add application"}</Button>
        </div>
        <LocalDataNote className="mt-4" />
      </form>
    </div>
  );
}

/* ───────────── Main ───────────── */

type SortKey = "company" | "stage" | "appliedOn" | "nextInterview" | "updatedAt";

export function Applications() {
  const state = useStore();
  const hydrated = useHydrated();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [stageFilter, setStageFilter] = useState<AppStage | "">("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "updatedAt", dir: -1 });
  const [dragId, setDragId] = useState<string | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return state.applications
      .filter((a) => (!stageFilter || a.stage === stageFilter) && (!term || `${a.company} ${a.role} ${a.division} ${a.location}`.toLowerCase().includes(term)))
      .sort((a, b) => {
        const k = sort.key;
        const va = k === "stage" ? APP_STAGES.indexOf(a.stage) : (a[k] || (sort.dir === 1 ? "~" : ""));
        const vb = k === "stage" ? APP_STAGES.indexOf(b.stage) : (b[k] || (sort.dir === 1 ? "~" : ""));
        return va < vb ? -sort.dir : va > vb ? sort.dir : 0;
      });
  }, [state.applications, stageFilter, q, sort]);

  if (!hydrated) return <div className="h-96 animate-pulse rounded-3xl bg-white/60" />;

  const today = localDate();
  const sortBy = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : 1 }));
  const remove = (a: Application) => window.confirm(`Delete ${a.company} – ${a.role}? This cannot be undone.`) && actions.deleteApplication(a.id);

  const header = (key: SortKey, label: string) => (
    <th className="px-4 py-2.5 font-medium">
      <button type="button" onClick={() => sortBy(key)} className="inline-flex items-center gap-1 hover:text-electric" aria-label={`Sort by ${label}`}>
        {label}
        <ArrowDownUp className={cn("h-3 w-3", sort.key === key ? "text-electric" : "opacity-40")} />
      </button>
    </th>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="h-4 w-4" /> Add application
        </Button>
        <div className="flex rounded-full border border-line-strong bg-white p-0.5" role="tablist" aria-label="View">
          <button type="button" role="tab" aria-selected={view === "table"} onClick={() => setView("table")} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm", view === "table" ? "bg-navy text-white" : "text-ink")}>
            <Table2 className="h-4 w-4" /> Table
          </button>
          <button type="button" role="tab" aria-selected={view === "kanban"} onClick={() => setView("kanban")} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm", view === "kanban" ? "bg-navy text-white" : "text-ink")}>
            <Kanban className="h-4 w-4" /> Kanban
          </button>
        </div>
        <div className="relative ml-auto min-w-[12rem] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company, role…" aria-label="Search applications" className="h-10 w-full rounded-full border border-line-strong bg-white pl-9 pr-3 text-sm focus:border-electric focus:outline-none" />
        </div>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <Chip active={!stageFilter} onClick={() => setStageFilter("")}>
          All stages ({state.applications.length})
        </Chip>
        {APP_STAGES.map((s) => {
          const n = state.applications.filter((a) => a.stage === s).length;
          return (
            <Chip key={s} active={stageFilter === s} onClick={() => setStageFilter(s)} className="shrink-0">
              {STAGE_LABELS[s]} ({n})
            </Chip>
          );
        })}
      </div>

      <div className="mt-6">
        {state.applications.length === 0 ? (
          <EmptyState icon={<Briefcase className="h-5 w-5" />} title="Track your first application" action={<Button onClick={() => setEditing({ ...EMPTY })}>Add application</Button>}>
            Record the company, role, stage and next interview date. Upcoming interviews feed your dashboard and calendar.
          </EmptyState>
        ) : view === "table" ? (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-sm">
              <thead>
                <tr className="border-b border-line bg-cream/60 text-left text-xs text-ink-muted">
                  {header("company", "Company / role")}
                  <th className="px-4 py-2.5 font-medium">Division · location</th>
                  {header("stage", "Stage")}
                  {header("appliedOn", "Applied")}
                  {header("nextInterview", "Next interview")}
                  <th className="px-4 py-2.5 font-medium">Outcome / notes</th>
                  <th className="px-2 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((a) => (
                  <tr key={a.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">{a.company}</p>
                      <p className="text-ink-muted">{a.role}</p>
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {a.division || "—"}
                      {a.location && <span className="block text-xs text-ink-muted">{a.location}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Select value={a.stage} onChange={(e) => actions.setApplicationStage(a.id, e.target.value as AppStage)} className="h-8 w-40 text-xs" aria-label={`Stage for ${a.company}`}>
                        {APP_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {STAGE_LABELS[s]}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink">{fmtDate(a.appliedOn)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {a.nextInterview ? <span className={cn(a.nextInterview < today ? "text-ink-muted" : "font-medium text-electric")}>{fmtDate(a.nextInterview)}</span> : "—"}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-xs text-ink-muted">
                      {a.outcome && <p className="font-medium text-ink">{a.outcome}</p>}
                      <p className="line-clamp-2">{a.notes}</p>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3">
                      <button type="button" onClick={() => setEditing(a)} className="rounded-full p-1.5 text-ink-muted hover:bg-ice-soft hover:text-electric" aria-label={`Edit ${a.company}`}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => remove(a)} className="rounded-full p-1.5 text-ink-muted hover:bg-error-soft hover:text-error-ink" aria-label={`Delete ${a.company}`}>
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && <p className="p-6 text-center text-sm text-ink-muted">No applications match these filters.</p>}
          </Card>
        ) : (
          <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
            <div className="flex gap-4" style={{ minWidth: `${(stageFilter ? 1 : APP_STAGES.length) * 17}rem` }}>
              {APP_STAGES.filter((s) => !stageFilter || s === stageFilter).map((s) => {
                const cards = list.filter((a) => a.stage === s);
                return (
                  <div
                    key={s}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragId) actions.setApplicationStage(dragId, s);
                      setDragId(null);
                    }}
                    className={cn("w-64 shrink-0 rounded-2xl border border-line bg-cream-deep/50 p-3", dragId && "border-dashed border-electric/50")}
                  >
                    <div className="mb-3 flex items-center justify-between px-1">
                      <Badge tone={STAGE_TONE[s]}>{STAGE_LABELS[s]}</Badge>
                      <span className="text-xs text-ink-muted">{cards.length}</span>
                    </div>
                    <div className="min-h-24 space-y-2">
                      {cards.map((a) => (
                        <div
                          key={a.id}
                          draggable
                          onDragStart={() => setDragId(a.id)}
                          onDragEnd={() => setDragId(null)}
                          className="cursor-grab rounded-xl border border-line bg-white p-3 shadow-card active:cursor-grabbing"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-navy">{a.company}</p>
                              <p className="truncate text-xs text-ink-muted">{a.role}</p>
                            </div>
                            <button type="button" onClick={() => setEditing(a)} className="rounded-full p-1 text-ink-muted hover:text-electric" aria-label={`Edit ${a.company}`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {a.location && (
                            <p className="mt-2 flex items-center gap-1 text-xs text-ink-muted">
                              <MapPin className="h-3 w-3" /> {a.location}
                            </p>
                          )}
                          {a.nextInterview && a.nextInterview >= today && <p className="mt-1 text-xs font-medium text-electric">Interview {fmtDate(a.nextInterview, { day: "numeric", month: "short" })}</p>}
                          <Select value={a.stage} onChange={(e) => actions.setApplicationStage(a.id, e.target.value as AppStage)} className="mt-2 h-8 text-xs" aria-label={`Move ${a.company} to stage`}>
                            {APP_STAGES.map((st) => (
                              <option key={st} value={st}>
                                {STAGE_LABELS[st]}
                              </option>
                            ))}
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <LocalDataNote className="mt-6" />
      {editing && <AppForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
