"use client";

import { useRef, useState } from "react";
import { CircleCheck, Download, HardDrive, Trash, Upload } from "lucide-react";
import { INTERVIEW_TRACK_IDS, TRACKS } from "@/content/taxonomy";
import type { Lang, TrackId } from "@/content/types";
import { actions, isStorageAvailable, localDate, STORAGE_KEY, useHydrated, useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, Input, Label, Select } from "@/components/ui/primitives";

export function Settings() {
  const state = useStore();
  const hydrated = useHydrated();
  const [name, setName] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!hydrated) return <div className="h-96 animate-pulse rounded-3xl bg-white/60" />;

  const shownName = name ?? state.profile.name;
  const bytes = new Blob([JSON.stringify(state)]).size;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financego-backup-${localDate()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage({ tone: "ok", text: "Backup downloaded." });
  };

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (!window.confirm("Importing replaces all FinanceGo data in this browser with the backup. Continue?")) return;
      const ok = actions.importState(parsed);
      setMessage(ok ? { tone: "ok", text: "Backup restored." } : { tone: "error", text: "That file is not a FinanceGo backup (version 1)." });
    } catch {
      setMessage({ tone: "error", text: "Could not read that file. Choose a .json backup exported from FinanceGo." });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardHeader title="Profile" description="Used to personalise your dashboard and pre-fill the Interview Simulator. Stored only in this browser." />
        <form
          className="mt-5 grid gap-4 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            actions.setProfile({ name: shownName.trim().slice(0, 60) });
            setName(null);
            setMessage({ tone: "ok", text: "Profile saved." });
          }}
        >
          <div>
            <Label htmlFor="p-name">First name</Label>
            <Input id="p-name" value={shownName} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Optional" />
          </div>
          <div>
            <Label htmlFor="p-track">Target career track</Label>
            <Select id="p-track" value={state.profile.track} onChange={(e) => actions.setProfile({ track: e.target.value as TrackId | "" })}>
              <option value="">Not decided yet</option>
              {INTERVIEW_TRACK_IDS.map((t) => (
                <option key={t} value={t}>
                  {TRACKS[t].label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="p-lang">Interview language</Label>
            <Select id="p-lang" value={state.profile.interviewLang} onChange={(e) => actions.setProfile({ interviewLang: e.target.value as Lang })}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </Select>
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" variant="secondary">
              Save name
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <CardHeader title="Your data" description="FinanceGo has no accounts in this version. Everything lives in your browser's local storage." />
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <p className="flex items-center gap-2 rounded-xl bg-cream px-4 py-3 text-ink">
            <HardDrive className="h-4 w-4 text-electric" /> {(bytes / 1024).toFixed(1)} KB stored
          </p>
          <p className="rounded-xl bg-cream px-4 py-3 text-ink">
            {Object.keys(state.lessons).length} lessons · {state.attempts.length} answers
          </p>
          <p className="rounded-xl bg-cream px-4 py-3 text-ink">
            {state.applications.length} applications · {state.goals.length} goals
          </p>
        </div>
        {!isStorageAvailable() && (
          <p className="mt-4 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning-ink">
            Your browser is blocking local storage (for example in a private window). Progress will be lost when you close the tab.
          </p>
        )}
        <p className="mt-4 text-sm text-ink-muted">
          Clearing your browser&apos;s site data, using a private window or switching device means starting fresh. Export a backup regularly; you can restore it here or in another
          browser. Storage key: <code className="rounded bg-cream px-1 font-mono text-xs">{STORAGE_KEY}</code>.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={exportData}>
            <Download className="h-4 w-4" /> Export backup (.json)
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importData(f);
              e.target.value = "";
            }}
          />
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm("Delete all FinanceGo data in this browser: progress, answers, interviews, applications and goals? This cannot be undone.")) {
                actions.resetAll();
                setMessage({ tone: "ok", text: "All local data deleted." });
              }
            }}
          >
            <Trash className="h-4 w-4" /> Delete all my data
          </Button>
        </div>
        {message && (
          <p role="status" className={`mt-4 flex items-center gap-2 text-sm ${message.tone === "ok" ? "text-success-ink" : "text-error-ink"}`}>
            {message.tone === "ok" && <CircleCheck className="h-4 w-4" />} {message.text}
          </p>
        )}
      </Card>

      <Card className="p-6">
        <CardHeader title="Accounts" description="Planned for Version 2" />
        <p className="mt-3 text-sm text-ink">
          Sign-up, login and cross-device sync are planned for Version 2, with secure authentication and private, per-user storage. Until then, there is nothing to sign in to,
          which also means nothing about you is stored on a server.
        </p>
      </Card>
    </div>
  );
}
