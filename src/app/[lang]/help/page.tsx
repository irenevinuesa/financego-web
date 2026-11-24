import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "@/components/i18n/Link";
import { Mail } from "lucide-react";
import { SITE } from "@/content/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/primitives";
import { getLang } from "@/lib/server-lang";
import type { Lang } from "@/lib/i18n";

const TEXT = {
  en: {
    metaTitle: "Help & feedback",
    metaDescription: "Answers to common questions about FinanceGo, and how to get in touch.",
    eyebrow: "Help",
    title: "Help and feedback",
    home: "Home",
    faq: "Frequently asked questions",
    contact: "Contact and feedback",
    emailBefore: "Found a mistake or have a suggestion? Email",
    emailAfter: ". Please do not include personal financial information.",
    noEmail:
      "A feedback channel is not connected in this MVP yet, so there is no form here that would silently go nowhere. Once the site owner adds a contact address it will appear here.",
  },
  es: {
    metaTitle: "Ayuda y sugerencias",
    metaDescription: "Respuestas a las preguntas frecuentes sobre FinanceGo y cómo ponerte en contacto.",
    eyebrow: "Ayuda",
    title: "Ayuda y sugerencias",
    home: "Inicio",
    faq: "Preguntas frecuentes",
    contact: "Contacto y sugerencias",
    emailBefore: "¿Has encontrado un error o tienes una sugerencia? Escribe a",
    emailAfter: ". Por favor, no incluyas información financiera personal.",
    noEmail:
      "Todavía no hay un canal de sugerencias conectado en este MVP, así que aquí no hay ningún formulario que se perdería sin llegar a nadie. Cuando el titular del sitio añada una dirección de contacto, aparecerá aquí.",
  },
};

const FAQ: Record<Lang, [string, ReactNode][]> = {
  en: [
    ["Do I need an account?", "No. FinanceGo works without sign-up. Your progress is saved in this browser's local storage. Accounts are planned for a later version."],
    [
      "Will I lose my progress?",
      <>
        Possibly, if you clear your browser data, use a private window or switch device. Export a backup from{" "}
        <Link href="/settings/" className="text-electric hover:underline">
          Settings
        </Link>{" "}
        and import it in another browser to move your progress.
      </>,
    ],
    ["How are practice answers graded?", "Multiple-choice and numerical answers are graded automatically; numerical answers accept a small tolerance stated in each question. Open-ended answers are not auto-graded: you compare with a model answer and tick the key points you covered."],
    ["Where do skill scores come from?", "Only from auto-graded answers you have actually given, in practice, lesson checks and assessments. A skill shows a score once it has at least three answers."],
    ["Are the tools accurate?", "The formulas are unit-tested. The outputs depend entirely on the assumptions you enter, and each tool lists its assumptions and limitations. FinanceGo does not provide live market data."],
    ["Why are some courses “in development”?", "Six courses are complete today. The rest of the library is listed with its planned outline so you can see what is coming, but they cannot be started until they are written."],
    ["How does the mock interview work?", "It has 50 short numeric questions in five levels. Each question has its own time limit; when it runs out, the answer counts as wrong. Score 7 out of 10 to unlock the next level."],
    ["How is my interview plan built?", "From your interview date, role, study days and daily time. It schedules lessons first, then practice, the 500 Challenge and the mock interview, then a final stretch of interview-style questions. You can add it to your own calendar."],
    ["How often is the News page updated?", "Every morning at 9:00 Madrid time, with headlines from 00:00 the day before. Headlines come from public feeds of third-party publishers and link to the original articles."],
    ["Does FinanceGo work on my phone?", "Yes. Every section is designed for phones, tablets and desktops."],
  ],
  es: [
    ["¿Necesito una cuenta?", "No. FinanceGo funciona sin registro. Tu progreso se guarda en el almacenamiento local de este navegador. Las cuentas están previstas para una versión posterior."],
    [
      "¿Perderé mi progreso?",
      <>
        Es posible, si borras los datos del navegador, usas una ventana privada o cambias de dispositivo. Exporta una copia de seguridad desde{" "}
        <Link href="/settings/" className="text-electric hover:underline">
          Ajustes
        </Link>{" "}
        e impórtala en otro navegador para trasladar tu progreso.
      </>,
    ],
    ["¿Cómo se corrigen las respuestas de práctica?", "Las respuestas de opción múltiple y numéricas se corrigen automáticamente; las numéricas admiten un pequeño margen de error que se indica en cada pregunta. Las respuestas abiertas no se corrigen automáticamente: las comparas con una respuesta modelo y marcas los puntos clave que has cubierto."],
    ["¿De dónde salen las puntuaciones por habilidad?", "Solo de respuestas corregidas automáticamente que hayas dado de verdad, en Practice, en las comprobaciones de las lecciones y en las evaluaciones. Una habilidad muestra puntuación cuando tiene al menos tres respuestas."],
    ["¿Son exactas las herramientas?", "Las fórmulas tienen pruebas unitarias. Los resultados dependen por completo de las hipótesis que introduces, y cada herramienta indica sus hipótesis y limitaciones. FinanceGo no ofrece datos de mercado en tiempo real."],
    ["¿Por qué algunos cursos están «en desarrollo»?", "Hoy hay seis cursos completos. El resto del catálogo aparece con su temario previsto para que veas lo que viene, pero no se pueden empezar hasta que estén escritos."],
    ["¿Cómo funciona el Mock interview?", "Tiene 50 preguntas numéricas breves en cinco niveles. Cada pregunta tiene su propio límite de tiempo; si se agota, la respuesta cuenta como incorrecta. Saca 7 de 10 para desbloquear el siguiente nivel."],
    ["¿Cómo se crea mi plan de entrevista?", "A partir de la fecha de tu entrevista, el puesto, los días de estudio y el tiempo diario. Programa primero las lecciones, después la práctica, el 500 Challenge y el Mock interview, y por último un tramo final de preguntas tipo entrevista. Puedes añadirlo a tu propio calendario."],
    ["¿Cada cuánto se actualiza la página de Noticias?", "Cada mañana a las 9:00, hora de Madrid, con titulares desde las 00:00 del día anterior. Los titulares proceden de fuentes públicas de editores externos y enlazan a los artículos originales."],
    ["¿Funciona FinanceGo en el móvil?", "Sí. Todas las secciones están diseñadas para móviles, tabletas y ordenadores."],
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const tx = TEXT[await getLang()];
  return { title: tx.metaTitle, description: tx.metaDescription };
}

export default async function HelpPage() {
  const lang = await getLang();
  const tx = TEXT[lang];
  return (
    <>
      <PageHeader eyebrow={tx.eyebrow} title={tx.title} crumbs={[{ href: "/", label: tx.home }, { label: tx.eyebrow }]} />
      <div className="container-page mt-10 grid max-w-6xl gap-10 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <h2 className="font-serif text-2xl">{tx.faq}</h2>
          <div className="mt-5 space-y-3">
            {FAQ[lang].map(([q, a]) => (
              <details key={q} className="group rounded-2xl border border-line bg-white p-5 open:shadow-card">
                <summary className="cursor-pointer list-none font-semibold text-navy marker:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {q}
                    <span className="text-electric transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <div className="mt-3 text-sm leading-relaxed text-ink">{a}</div>
              </details>
            ))}
          </div>
        </section>
        <aside>
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-semibold text-navy">
              <Mail className="h-5 w-5 text-electric" /> {tx.contact}
            </h2>
            {SITE.contactEmail ? (
              <p className="mt-3 text-sm text-ink">
                {tx.emailBefore}{" "}
                <a href={`mailto:${SITE.contactEmail}?subject=FinanceGo%20feedback`} className="text-electric hover:underline">
                  {SITE.contactEmail}
                </a>
                {tx.emailAfter}
              </p>
            ) : (
              <p className="mt-3 text-sm text-ink">{tx.noEmail}</p>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
