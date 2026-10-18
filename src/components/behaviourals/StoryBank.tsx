"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleCheck, CircleDashed, NotebookPen, Pencil, Plus, Trash2 } from "lucide-react";
import { BQ_CATEGORIES, type BQCategory } from "@/content/behaviourals/questions";
import { actions, uid, useHydrated, useStore, type Story } from "@/lib/store";
import { fmtRelative } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Chip, EmptyState, Input, Label, LocalDataNote, Textarea } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

/** Categories that are answered with a story (the rest are pitches or questions). */
export const STORY_CATEGORIES: BQCategory[] = ["teamwork", "leadership", "failure", "conflict", "pressure", "ethics", "strengths", "motivation"];

const FIELDS = [
  { key: "situation", label: "Situation", hint: "1–2 sentences of context", rows: 2 },
  { key: "task", label: "Task", hint: "What was your responsibility?", rows: 2 },
  { key: "action", label: "Action", hint: "What you did, step by step, in the first person", rows: 5 },
  { key: "result", label: "Result", hint: "The outcome, with a number if you have one", rows: 3 },
  { key: "learning", label: "What you learned", hint: "And what you would do differently", rows: 2 },
] as const;

type Draft = Pick<Story, "id" | "title" | "situation" | "task" | "action" | "result" | "learning" | "categories">;

function emptyDraft(category?: string): Draft {
  return { id: uid(), title: "", situation: "", task: "", action: "", result: "", learning: "", categories: category ? [category] : [] };
}

function words(d: Pick<Story, "situation" | "task" | "action" | "result" | "learning">) {
  return [d.situation, d.task, d.action, d.result, d.learning].join(" ").split(/\s+/).filter(Boolean).length;
}

/** About 130 spoken words per minute. */
function speakingTime(n: number) {
  const s = Math.round((n / 130) * 60);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

function initialCategory(raw: string | null): string | undefined {
  return raw && raw in BQ_CATEGORIES ? raw : undefined;
}

export function StoryBank() {
  const state = useStore();
  const hydrated = useHydrated();
  const params = useSearchParams();
  const preset = initialCategory(params.get("category"));
  const [draft, setDraft] = useState<Draft | null>(() => (preset ? emptyDraft(preset) : null));
  const [error, setError] = useState("");

  const coverage = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of state.stories) for (const c of s.categories) m.set(c, (m.get(c) ?? 0) + 1);
    return m;
  }, [state.stories]);

  function save() {
    if (!draft) return;
    if (!draft.title.trim()) return setError("Give the story a short title.");
    if (!draft.action.trim()) return setError("Write at least the Action: it is the part interviewers judge.");
    if (draft.categories.length === 0) return setError("Pick at least one question category this story answers.");
    actions.upsertStory({ ...draft, title: draft.title.trim() });
    setDraft(null);
    setError("");
  }

  function edit(s: Story) {
    setDraft({ id: s.id, title: s.title, situation: s.situation, task: s.task, action: s.action, result: s.result, learning: s.learning, categories: s.categories });
    setError("");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function remove(s: Story) {
    if (window.confirm(`Delete “${s.title}”? This cannot be undone.`)) actions.deleteStory(s.id);
  }

  const n = draft ? words(draft) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-6">
        {draft ? (
          <Card className="border-navy/30 p-5 sm:p-6">
            <h2 className="font-serif text-2xl text-navy">{state.stories.some((s) => s.id === draft.id) ? "Edit story" : "New story"}</h2>
            <form
              className="mt-5 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <div>
                <Label htmlFor="story-title" hint="Only you see this">
                  Title
                </Label>
                <Input id="story-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Rescuing the club's pitch competition" maxLength={120} />
              </div>
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-ink">Questions it answers</legend>
                <div className="flex flex-wrap gap-2">
                  {STORY_CATEGORIES.map((c) => {
                    const on = draft.categories.includes(c);
                    return (
                      <Chip key={c} active={on} onClick={() => setDraft({ ...draft, categories: on ? draft.categories.filter((x) => x !== c) : [...draft.categories, c] })}>
                        {BQ_CATEGORIES[c]}
                      </Chip>
                    );
                  })}
                </div>
              </fieldset>
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <Label htmlFor={`story-${f.key}`} hint={f.hint}>
                    {f.label}
                  </Label>
                  <Textarea id={`story-${f.key}`} rows={f.rows} value={draft[f.key]} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
                </div>
              ))}
              <p className={cn("text-sm", n > 330 ? "text-warning-ink" : "text-ink-muted")}>
                {n} words · about {speakingTime(n)} spoken{n > 330 ? ". Aim for under two and a half minutes: cut the Situation first." : ""}
              </p>
              {error && (
                <p role="alert" className="rounded-xl bg-error-soft px-4 py-2.5 text-sm text-error-ink">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button type="submit">Save story</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDraft(null);
                    setError("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-navy">Your stories</h2>
            <Button onClick={() => setDraft(emptyDraft())}>
              <Plus className="h-4 w-4" /> New story
            </Button>
          </div>
        )}

        {!hydrated ? (
          <div className="h-40 animate-pulse rounded-2xl border border-line bg-white" />
        ) : state.stories.length === 0 ? (
          !draft && (
            <EmptyState icon={<NotebookPen className="h-5 w-5" />} title="No stories yet" action={<Button onClick={() => setDraft(emptyDraft())}>Write your first story</Button>}>
              Start with the experience you are proudest of. Most good stories can answer two or three categories.
            </EmptyState>
          )
        ) : (
          <ul className="space-y-3">
            {[...state.stories].reverse().map((s) => (
              <li key={s.id}>
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{s.title}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {words(s)} words · about {speakingTime(words(s))} · updated {fmtRelative(s.updatedAt)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => edit(s)} aria-label={`Edit ${s.title}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(s)} aria-label={`Delete ${s.title}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.categories.map((c) => (
                      <Badge key={c} tone="blue">
                        {BQ_CATEGORIES[c as BQCategory] ?? c}
                      </Badge>
                    ))}
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    {FIELDS.filter((f) => s[f.key].trim()).map((f) => (
                      <div key={f.key} className={f.key === "action" ? "sm:col-span-2" : undefined}>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{f.label}</dt>
                        <dd className="mt-1 whitespace-pre-line text-ink">{s[f.key]}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              </li>
            ))}
          </ul>
        )}
        <LocalDataNote />
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <Card className="p-5">
          <p className="font-semibold text-navy">Category coverage</p>
          <p className="mt-1 text-sm text-ink-muted">Aim for at least one story in each.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {STORY_CATEGORIES.map((c) => {
              const k = hydrated ? (coverage.get(c) ?? 0) : 0;
              return (
                <li key={c} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-ink">
                    {k > 0 ? <CircleCheck className="h-4 w-4 text-success" /> : <CircleDashed className="h-4 w-4 text-line-strong" />}
                    {BQ_CATEGORIES[c]}
                  </span>
                  <span className="text-ink-muted">{k}</span>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="bg-navy p-5 text-white">
          <p className="font-semibold">STAR in one line</p>
          <p className="mt-2 text-sm leading-relaxed text-ice-soft/90">
            Short Situation and Task, most of your time on the Action, a concrete Result, and one sentence on what you learned.
          </p>
        </Card>
      </aside>
    </div>
  );
}
