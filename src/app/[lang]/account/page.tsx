import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/primitives";
import { getLang } from "@/lib/server-lang";

const TEXT = {
  en: {
    metaTitle: "Accounts",
    metaDescription: "Login and sign-up are planned for FinanceGo Version 2.",
    eyebrow: "Login / Sign up",
    title: "Accounts are coming in Version 2",
    home: "Home",
    crumb: "Accounts",
    heading: "No sign-up needed today",
    p1: "In this version FinanceGo has no login. Everything works without an account, and your progress, practice history, interviews, applications and goals are saved privately in this browser.",
    p2: "Version 2 will add secure sign-up and login, persistent progress across devices, and per-user privacy controls, including account deletion.",
    dashboard: "Go to my dashboard",
    backup: "Back up my data",
  },
  es: {
    metaTitle: "Cuentas",
    metaDescription: "El inicio de sesión y el registro están previstos para la Versión 2 de FinanceGo.",
    eyebrow: "Iniciar sesión / Registrarse",
    title: "Las cuentas llegarán en la Versión 2",
    home: "Inicio",
    crumb: "Cuentas",
    heading: "Hoy no necesitas registrarte",
    p1: "En esta versión FinanceGo no tiene inicio de sesión. Todo funciona sin cuenta, y tu progreso, tu historial de práctica, tus entrevistas, candidaturas y objetivos se guardan de forma privada en este navegador.",
    p2: "La Versión 2 añadirá registro e inicio de sesión seguros, progreso sincronizado entre dispositivos y controles de privacidad para cada usuario, incluida la eliminación de la cuenta.",
    dashboard: "Ir a mi Dashboard",
    backup: "Hacer copia de mis datos",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const tx = TEXT[await getLang()];
  return { title: tx.metaTitle, description: tx.metaDescription };
}

export default async function AccountPage() {
  const tx = TEXT[await getLang()];
  return (
    <>
      <PageHeader eyebrow={tx.eyebrow} title={tx.title} crumbs={[{ href: "/", label: tx.home }, { label: tx.crumb }]} />
      <div className="container-page mt-10 max-w-3xl">
        <Card className="p-6 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ice-soft text-electric">
            <Lock className="h-6 w-6" />
          </span>
          <h2 className="mt-5 font-serif text-2xl">{tx.heading}</h2>
          <p className="mt-3 text-ink">{tx.p1}</p>
          <p className="mt-3 text-ink">{tx.p2}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/dashboard/">{tx.dashboard}</ButtonLink>
            <ButtonLink href="/settings/" variant="secondary">
              {tx.backup}
            </ButtonLink>
          </div>
        </Card>
      </div>
    </>
  );
}
