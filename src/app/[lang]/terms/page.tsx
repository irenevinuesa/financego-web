import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { SITE } from "@/content/site";
import { LegalPage } from "@/components/layout/LegalPage";
import { getLang } from "@/lib/server-lang";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: lang === "es" ? "Condiciones" : "Terms" };
}

export default async function TermsPage() {
  const lang = await getLang();
  if (lang === "es") {
    return (
      <LegalPage eyebrow="Legal" title="Condiciones de uso" updated="24 de noviembre de 2026">
        <p>Al usar FinanceGo aceptas estas condiciones. Si no estás de acuerdo, te pedimos que no uses el sitio.</p>
        <h2>Finalidad educativa</h2>
        <p>
          FinanceGo ofrece formación financiera general y preparación de entrevistas. No es asesoramiento de inversión, jurídico, fiscal, contable ni profesional. Consulta
          el{" "}
          <Link href="/disclaimer/" className="text-electric hover:underline">
            aviso educativo
          </Link>
          .
        </p>
        <h2>Exactitud</h2>
        <p>
          Trabajamos para que el contenido sea exacto y probamos nuestras fórmulas, pero no podemos garantizar que cada explicación, ejemplo, cálculo o plan esté libre de
          errores o se adapte a tu situación. Los resultados de las herramientas dependen por completo de los datos que introduces, y los planes de estudio son sugerencias, no
          una garantía de resultados.
        </p>
        <h2>Tus datos</h2>
        <p>
          Tu progreso se guarda localmente en tu navegador. Eres responsable de hacer copias de seguridad con la exportación de Ajustes; FinanceGo no puede recuperar datos
          borrados de tu navegador.
        </p>
        <h2>Noticias y enlaces de terceros</h2>
        <p>
          Los titulares de la página de Noticias y los artículos a los que enlazan pertenecen a sus editores. FinanceGo los muestra para ayudarte a seguir los mercados y no
          los redacta, verifica ni respalda. FinanceGo no se hace responsable del contenido de sitios externos.
        </p>
        <h2>Uso aceptable</h2>
        <ul>
          <li>Usa FinanceGo para tu aprendizaje y preparación personales.</li>
          <li>No intentes perturbar el funcionamiento del sitio ni presentes el contenido de FinanceGo como asesoramiento profesional.</li>
        </ul>
        <h2>Contenido</h2>
        <p>
          Las lecciones, preguntas, preguntas de entrevista, brain teasers, herramientas e ilustraciones son obra propia de FinanceGo. Te pedimos que no los vuelvas a publicar
          sin permiso.
        </p>
        <h2>Sin garantía</h2>
        <p>FinanceGo se ofrece «tal cual», sin garantías de ningún tipo, en la medida en que lo permita la ley.</p>
        <h2>Contacto</h2>
        <p>
          Preguntas sobre estas condiciones:{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-electric hover:underline">
            {SITE.contactEmail}
          </a>
          .
        </p>
      </LegalPage>
    );
  }
  return (
    <LegalPage eyebrow="Legal" title="Terms of Use" updated="24 November 2026">
      <p>By using FinanceGo you agree to these terms. If you do not agree, please do not use the site.</p>
      <h2>Educational purpose</h2>
      <p>
        FinanceGo provides general financial education and interview preparation. It is not investment, legal, tax, accounting or career advice. See the{" "}
        <Link href="/disclaimer/" className="text-electric hover:underline">
          educational disclaimer
        </Link>
        .
      </p>
      <h2>Accuracy</h2>
      <p>
        We work to keep content accurate and test our formulas, but we cannot guarantee that every explanation, example, calculation or plan is free of errors or suitable
        for your situation. Tool outputs depend entirely on the inputs you provide, and study plans are suggestions, not a guarantee of results.
      </p>
      <h2>Your data</h2>
      <p>
        Your progress is stored locally in your browser. You are responsible for backing it up with the export in Settings; FinanceGo cannot recover data deleted from your
        browser.
      </p>
      <h2>Third-party news and links</h2>
      <p>
        Headlines on the News page and the articles they link to belong to their publishers. FinanceGo shows them to help you follow the markets and does not write, check or
        endorse them. FinanceGo is not responsible for the content of external sites.
      </p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Use FinanceGo for personal learning and preparation.</li>
        <li>Do not attempt to disrupt the site or misrepresent FinanceGo content as professional advice.</li>
      </ul>
      <h2>Content</h2>
      <p>Lessons, questions, interview questions, brain teasers, tools and artwork are FinanceGo&apos;s own work. Please do not republish them without permission.</p>
      <h2>No warranty</h2>
      <p>FinanceGo is provided “as is”, without warranties of any kind, to the extent permitted by law.</p>
      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${SITE.contactEmail}`} className="text-electric hover:underline">
          {SITE.contactEmail}
        </a>
        .
      </p>
    </LegalPage>
  );
}
