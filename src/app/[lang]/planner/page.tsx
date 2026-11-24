import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Planner } from "@/components/planner/Planner";
import { getLang } from "@/lib/server-lang";
import type { Lang } from "@/lib/i18n";

const TEXT = {
  en: {
    metaTitle: "Interview planner",
    metaDescription: "Turn the time until your interview into a day-by-day calendar of lessons, practice, mock interviews and behavioural prep on FinanceGo.",
    title: "Your calendar to interview day",
    intro:
      "Enter your interview date, role and the time you have. FinanceGo builds a day-by-day plan: the lessons to learn first, the sections to drill, the 500 Challenge and mock interview levels to hit, and your behavioural stories. Tick tasks off as you go and add the plan to your own calendar.",
    home: "Home",
  },
  es: {
    metaTitle: "Planner de entrevistas",
    metaDescription: "Convierte el tiempo que te queda hasta la entrevista en un calendario día a día de lecciones, práctica, mock interviews y preparación de Behaviourals en FinanceGo.",
    title: "Tu calendario hasta el día de la entrevista",
    intro:
      "Indica la fecha de tu entrevista, el puesto y el tiempo del que dispones. FinanceGo crea un plan día a día: las lecciones que debes aprender primero, las secciones que practicar, los niveles del 500 Challenge y del Mock interview que alcanzar y tus historias de Behaviourals. Marca las tareas a medida que avanzas y añade el plan a tu propio calendario.",
    home: "Inicio",
  },
} satisfies Record<Lang, Record<string, string>>;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: TEXT[lang].metaTitle, description: TEXT[lang].metaDescription };
}

export default async function PlannerPage() {
  const lang = await getLang();
  const tx = TEXT[lang];
  return (
    <>
      <PageHeader
        eyebrow="Planner"
        title={tx.title}
        description={<p>{tx.intro}</p>}
        crumbs={[{ href: "/", label: tx.home }, { label: "Planner" }]}
        scene="summit"
      />
      <div className="container-page mt-10">
        <Planner />
      </div>
    </>
  );
}
