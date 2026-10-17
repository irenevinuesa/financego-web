import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Accounts", description: "Login and sign-up are planned for FinanceGo Version 2." };

export default function AccountPage() {
  return (
    <>
      <PageHeader eyebrow="Login / Sign up" title="Accounts are coming in Version 2" crumbs={[{ href: "/", label: "Home" }, { label: "Accounts" }]} />
      <div className="container-page mt-10 max-w-3xl">
        <Card className="p-6 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ice-soft text-electric">
            <Lock className="h-6 w-6" />
          </span>
          <h2 className="mt-5 font-serif text-2xl">No sign-up needed today</h2>
          <p className="mt-3 text-ink">
            In this version FinanceGo has no login. Everything works without an account, and your progress, practice history, interviews, applications and goals are saved privately
            in this browser.
          </p>
          <p className="mt-3 text-ink">
            Version 2 will add secure sign-up and login, persistent progress across devices, and per-user privacy controls, including account deletion.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/dashboard/">Go to my dashboard</ButtonLink>
            <ButtonLink href="/settings/" variant="secondary">
              Back up my data
            </ButtonLink>
          </div>
        </Card>
      </div>
    </>
  );
}
