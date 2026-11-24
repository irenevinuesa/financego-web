"use client";

import { useRef, useState } from "react";
import { CircleCheck, Download, HardDrive, Trash, Upload } from "lucide-react";
import { INTERVIEW_TRACK_IDS, TRACKS } from "@/content/taxonomy";
import type { Lang, TrackId } from "@/content/types";
import { actions, isStorageAvailable, localDate, STORAGE_KEY, useHydrated, useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, Input, Label, Select } from "@/components/ui/primitives";
import { useLang } from "@/components/i18n/LangProvider";

const TEXT = {
  en: {
    downloaded: "Backup downloaded.",
    confirmImport: "Importing replaces all FinanceGo data in this browser with the backup. Continue?",
    restored: "Backup restored.",
    notBackup: "That file is not a FinanceGo backup (version 1).",
    unreadable: "Could not read that file. Choose a .json backup exported from FinanceGo.",
    profile: "Profile",
    profileDescription: "Used to personalise your dashboard. Stored only in this browser.",
    profileSaved: "Profile saved.",
    firstName: "First name",
    optional: "Optional",
    track: "Target career track",
    notDecided: "Not decided yet",
    interviewLang: "Interview language",
    saveName: "Save name",
    yourData: "Your data",
    yourDataDescription: "FinanceGo has no accounts in this version. Everything lives in your browser's local storage.",
    stored: "KB stored",
    lessons: "lessons",
    answers: "answers",
    applications: "applications",
    goals: "goals",
    blocked: "Your browser is blocking local storage (for example in a private window). Progress will be lost when you close the tab.",
    fresh:
      "Clearing your browser's site data, using a private window or switching device means starting fresh. Export a backup regularly; you can restore it here or in another browser. Storage key:",
    exportBackup: "Export backup (.json)",
    importBackup: "Import backup",
    confirmDelete: "Delete all FinanceGo data in this browser: progress, answers, interviews, applications and goals? This cannot be undone.",
    deleted: "All local data deleted.",
    deleteAll: "Delete all my data",
    accounts: "Accounts",
    accountsDescription: "Planned for Version 2",
    accountsBody:
      "Sign-up, login and cross-device sync are planned for Version 2, with secure authentication and private, per-user storage. Until then, there is nothing to sign in to, which also means nothing about you is stored on a server.",
  },
  es: {
    downloaded: "Copia de seguridad descargada.",
    confirmImport: "Al importar se sustituyen todos los datos de FinanceGo de este navegador por los de la copia de seguridad. ¿Quieres continuar?",
    restored: "Copia de seguridad restaurada.",
    notBackup: "Ese archivo no es una copia de seguridad de FinanceGo (versión 1).",
    unreadable: "No se ha podido leer ese archivo. Elige una copia de seguridad .json exportada desde FinanceGo.",
    profile: "Perfil",
    profileDescription: "Se usa para personalizar tu Dashboard. Solo se guarda en este navegador.",
    profileSaved: "Perfil guardado.",
    firstName: "Nombre",
    optional: "Opcional",
    track: "Carrera objetivo",
    notDecided: "Aún sin decidir",
    interviewLang: "Idioma de la entrevista",
    saveName: "Guardar nombre",
    yourData: "Tus datos",
    yourDataDescription: "FinanceGo no tiene cuentas en esta versión. Todo se guarda en el almacenamiento local de tu navegador.",
    stored: "KB guardados",
    lessons: "lecciones",
    answers: "respuestas",
    applications: "candidaturas",
    goals: "objetivos",
    blocked: "Tu navegador está bloqueando el almacenamiento local (por ejemplo, en una ventana privada). El progreso se perderá al cerrar la pestaña.",
    fresh:
      "Si borras los datos del sitio en tu navegador, usas una ventana privada o cambias de dispositivo, empezarás de cero. Exporta una copia de seguridad con regularidad; puedes restaurarla aquí o en otro navegador. Clave de almacenamiento:",
    exportBackup: "Exportar copia (.json)",
    importBackup: "Importar copia",
    confirmDelete: "¿Borrar todos los datos de FinanceGo de este navegador: progreso, respuestas, entrevistas, candidaturas y objetivos? No se puede deshacer.",
    deleted: "Se han borrado todos los datos locales.",
    deleteAll: "Borrar todos mis datos",
    accounts: "Cuentas",
    accountsDescription: "Previstas para la Versión 2",
    accountsBody:
      "El registro, el inicio de sesión y la sincronización entre dispositivos están previstos para la Versión 2, con autenticación segura y almacenamiento privado para cada usuario. Hasta entonces no hay nada en lo que iniciar sesión, lo que también significa que no se guarda nada sobre ti en ningún servidor.",
  },
};

export function Settings() {
  const state = useStore();
  const tx = TEXT[useLang()];
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
    setMessage({ tone: "ok", text: tx.downloaded });
  };

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (!window.confirm(tx.confirmImport)) return;
      const ok = actions.importState(parsed);
      setMessage(ok ? { tone: "ok", text: tx.restored } : { tone: "error", text: tx.notBackup });
    } catch {
      setMessage({ tone: "error", text: tx.unreadable });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardHeader title={tx.profile} description={tx.profileDescription} />
        <form
          className="mt-5 grid gap-4 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            actions.setProfile({ name: shownName.trim().slice(0, 60) });
            setName(null);
            setMessage({ tone: "ok", text: tx.profileSaved });
          }}
        >
          <div>
            <Label htmlFor="p-name">{tx.firstName}</Label>
            <Input id="p-name" value={shownName} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder={tx.optional} />
          </div>
          <div>
            <Label htmlFor="p-track">{tx.track}</Label>
            <Select id="p-track" value={state.profile.track} onChange={(e) => actions.setProfile({ track: e.target.value as TrackId | "" })}>
              <option value="">{tx.notDecided}</option>
              {INTERVIEW_TRACK_IDS.map((t) => (
                <option key={t} value={t}>
                  {TRACKS[t].label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="p-lang">{tx.interviewLang}</Label>
            <Select id="p-lang" value={state.profile.interviewLang} onChange={(e) => actions.setProfile({ interviewLang: e.target.value as Lang })}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </Select>
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" variant="secondary">
              {tx.saveName}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <CardHeader title={tx.yourData} description={tx.yourDataDescription} />
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <p className="flex items-center gap-2 rounded-xl bg-cream px-4 py-3 text-ink">
            <HardDrive className="h-4 w-4 text-electric" /> {(bytes / 1024).toFixed(1)} {tx.stored}
          </p>
          <p className="rounded-xl bg-cream px-4 py-3 text-ink">
            {Object.keys(state.lessons).length} {tx.lessons} · {state.attempts.length} {tx.answers}
          </p>
          <p className="rounded-xl bg-cream px-4 py-3 text-ink">
            {state.applications.length} {tx.applications} · {state.goals.length} {tx.goals}
          </p>
        </div>
        {!isStorageAvailable() && (
          <p className="mt-4 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning-ink">
            {tx.blocked}
          </p>
        )}
        <p className="mt-4 text-sm text-ink-muted">
          {tx.fresh} <code className="rounded bg-cream px-1 font-mono text-xs">{STORAGE_KEY}</code>.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={exportData}>
            <Download className="h-4 w-4" /> {tx.exportBackup}
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> {tx.importBackup}
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
              if (window.confirm(tx.confirmDelete)) {
                actions.resetAll();
                setMessage({ tone: "ok", text: tx.deleted });
              }
            }}
          >
            <Trash className="h-4 w-4" /> {tx.deleteAll}
          </Button>
        </div>
        {message && (
          <p role="status" className={`mt-4 flex items-center gap-2 text-sm ${message.tone === "ok" ? "text-success-ink" : "text-error-ink"}`}>
            {message.tone === "ok" && <CircleCheck className="h-4 w-4" />} {message.text}
          </p>
        )}
      </Card>

      <Card className="p-6">
        <CardHeader title={tx.accounts} description={tx.accountsDescription} />
        <p className="mt-3 text-sm text-ink">
          {tx.accountsBody}
        </p>
      </Card>
    </div>
  );
}
