"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CircleCheck, Minus, Pencil, Plus, Target, Trash, X } from "lucide-react";
import { COURSES, getCourse } from "@/content/courses";
import { TOPICS, TOPIC_IDS } from "@/content/taxonomy";
import type { TopicId } from "@/content/types";
import { actions, localDate, uid, useHydrated, useStore, type Goal, type GoalType } from "@/lib/store";
import { goalProgress } from "@/lib/progress";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Badge, Card, EmptyState, Input, Label, LocalDataNote, ProgressBar, Select } from "@/components/ui/primitives";

type Draft = Omit<Goal, "createdAt"> & { createdAt?: string };

const blank = (): Draft => ({ id: "", title: "", type: "questions", target: 50, courseId: COURSES[0].id, topic: "valuation", manualProgress: 0, deadline: "" });

function autoTitle(d: Draft) {
  if (d.type === "course") return `Complete ${getCourse(d.courseId ?? "")?.title ?? "a course"}`;
  if (d.type === "questions") return `Answer ${d.target} ${d.topic && d.topic !== "any" ? TOPICS[d.topic].label : ""} questions`.replace(/\s+/g, " ");
  if (d.type === "interviews") return `Finish ${d.target} mock interview${d.target === 1 ? "" : "s"}`;
  return d.title;
}

const TEMPLATES: { label: string; draft: Partial<Draft> }[] = [
  { label: "Complete the DCF course", draft: { type: "course", courseId: "dcf" } },
  { label: "Answer 50 valuation questions", draft: { type: "questions", target: 50, topic: "valuation" } },
  { label: "Finish five mock interviews", draft: { type: "interviews", target: 5 } },
  { label: "Prepare for an upcoming technical interview", draft: { type: "custom", title: "Prepare for my technical interview", target: 10 } },
];

function GoalForm({ initial, onClose }: { initial: Draft; onClose: () => void }) {
  const [d, setD] = useState<Draft>(initial);
  const [customTitle, setCustomTitle] = useState(initial.type === "custom" ? initial.title : "");
  const [error, setError] = useState("");
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const title = d.type === "custom" ? customTitle.trim() : autoTitle(d);
    if (!title) return setError("Give your goal a name.");
    if (d.type !== "course" && (!Number.isFinite(d.target) || d.target < 1 || d.target > 10000)) return setError("Target must be between 1 and 10,000.");
    actions.upsertGoal({ ...d, id: d.id || uid(), title, manualProgress: Math.max(0, Math.min(d.manualProgress, d.target)) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy-deep/40 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
      <form onSubmit={save} onMouseDown={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift animate-pop sm:rounded-3xl" aria-label="Goal">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">{initial.id ? "Edit goal" : "New goal"}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-cream" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="g-type">Goal type</Label>
            <Select id="g-type" value={d.type} onChange={(e) => set("type", e.target.value as GoalType)}>
              <option value="course">Complete a course (tracked automatically)</option>
              <option value="questions">Answer a number of questions (tracked automatically)</option>
              <option value="interviews">Finish mock interviews (tracked automatically)</option>
              <option value="custom">Custom goal (you update progress)</option>
            </Select>
          </div>
          {d.type === "course" && (
            <div>
              <Label htmlFor="g-course">Course</Label>
              <Select id="g-course" value={d.courseId} onChange={(e) => set("courseId", e.target.value)}>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {d.type === "questions" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="g-topic">Topic</Label>
                <Select id="g-topic" value={d.topic} onChange={(e) => set("topic", e.target.value as TopicId | "any")}>
                  <option value="any">Any topic</option>
                  {TOPIC_IDS.map((t) => (
                    <option key={t} value={t}>
                      {TOPICS[t].label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="g-n">Number of questions</Label>
                <Input id="g-n" type="number" min={1} value={d.target} onChange={(e) => set("target", Number(e.target.value))} />
              </div>
            </div>
          )}
          {d.type === "interviews" && (
            <div>
              <Label htmlFor="g-iv">Number of mock interviews</Label>
              <Input id="g-iv" type="number" min={1} value={d.target} onChange={(e) => set("target", Number(e.target.value))} />
            </div>
          )}
          {d.type === "custom" && (
            <>
              <div>
                <Label htmlFor="g-title">Goal</Label>
                <Input id="g-title" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} maxLength={100} placeholder="e.g. Prepare for my first-round interview" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="g-target">Steps to complete</Label>
                  <Input id="g-target" type="number" min={1} value={d.target} onChange={(e) => set("target", Number(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="g-prog">Steps done</Label>
                  <Input id="g-prog" type="number" min={0} value={d.manualProgress} onChange={(e) => set("manualProgress", Number(e.target.value))} />
                </div>
              </div>
            </>
          )}
          <div>
            <Label htmlFor="g-deadline" hint="Optional">
              Deadline
            </Label>
            <Input id="g-deadline" type="date" value={d.deadline} onChange={(e) => set("deadline", e.target.value)} />
          </div>
          {d.type !== "custom" && <p className="rounded-xl bg-cream px-3 py-2 text-sm text-ink">Goal: {autoTitle(d)}</p>}
          {(d.type === "questions" || d.type === "interviews") && <p className="text-xs text-ink-muted">Progress counts activity from the moment you create the goal.</p>}
        </div>
        {error && <p className="mt-3 text-sm text-error-ink">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save goal</Button>
        </div>
      </form>
    </div>
  );
}

export function Goals() {
  const state = useStore();
  const hydrated = useHydrated();
  const [editing, setEditing] = useState<Draft | null>(null);
  const today = localDate();
  const goals = useMemo(() => state.goals.map((g) => ({ g, p: goalProgress(g, state) })), [state]);

  if (!hydrated) return <div className="h-80 animate-pulse rounded-3xl bg-white/60" />;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setEditing(blank())}>
          <Plus className="h-4 w-4" /> New goal
        </Button>
        <p className="text-sm text-ink-muted">Or start from a template:</p>
        {TEMPLATES.map((t) => (
          <button key={t.label} type="button" onClick={() => setEditing({ ...blank(), ...t.draft })} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink hover:border-electric hover:text-electric">
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {goals.length === 0 ? (
          <EmptyState icon={<Target className="h-5 w-5" />} title="Set your first goal">
            Goals tied to courses, questions or mock interviews update automatically as you study. Custom goals you update yourself.
          </EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map(({ g, p }) => {
              const overdue = g.deadline && g.deadline < today && !p.done;
              const daysLeft = g.deadline ? Math.ceil((new Date(`${g.deadline}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 86_400_000) : null;
              return (
                <Card key={g.id} className={cn("p-5", p.done && "border-success/40")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{g.title}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {g.type === "custom" ? "Custom goal" : "Tracked automatically"} · created {fmtDate(g.createdAt)}
                      </p>
                    </div>
                    {p.done ? (
                      <Badge tone="success">
                        <CircleCheck className="h-3.5 w-3.5" /> Achieved
                      </Badge>
                    ) : overdue ? (
                      <Badge tone="error">Overdue</Badge>
                    ) : (
                      <Badge tone="blue">In progress</Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="figure text-ink">
                        {p.current} / {p.target}
                      </span>
                      <span className="text-ink-muted">{Math.round(p.pct * 100)}%</span>
                    </div>
                    <ProgressBar value={p.pct} tone={p.done ? "success" : "blue"} label={`${g.title} progress`} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {g.deadline ? `${fmtDate(g.deadline)}${daysLeft !== null && !p.done ? (daysLeft >= 0 ? ` · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : "") : ""}` : "No deadline"}
                    </p>
                    <div className="flex items-center gap-1">
                      {g.type === "custom" && (
                        <>
                          <button type="button" onClick={() => actions.upsertGoal({ ...g, manualProgress: Math.max(0, g.manualProgress - 1) })} className="rounded-full p-1.5 text-ink-muted hover:bg-cream" aria-label="Decrease progress">
                            <Minus className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => actions.upsertGoal({ ...g, manualProgress: Math.min(g.target, g.manualProgress + 1) })} className="rounded-full p-1.5 text-electric hover:bg-ice-soft" aria-label="Increase progress">
                            <Plus className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button type="button" onClick={() => setEditing(g)} className="rounded-full p-1.5 text-ink-muted hover:bg-ice-soft hover:text-electric" aria-label="Edit goal">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => window.confirm("Delete this goal?") && actions.deleteGoal(g.id)} className="rounded-full p-1.5 text-ink-muted hover:bg-error-soft hover:text-error-ink" aria-label="Delete goal">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <LocalDataNote className="mt-6" />
      {editing && <GoalForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
