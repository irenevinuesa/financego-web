import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { SITE } from "@/content/site";
import { LegalPage } from "@/components/layout/LegalPage";
import { getLang } from "@/lib/server-lang";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: lang === "es" ? "Política de privacidad" : "Privacy Policy" };
}

export default async function PrivacyPage() {
  const lang = await getLang();
  const mail = (
    <a href={`mailto:${SITE.contactEmail}`} className="text-electric hover:underline">
      {SITE.contactEmail}
    </a>
  );
  if (lang === "es") {
    return (
      <LegalPage eyebrow="Legal" title="Política de privacidad" updated="24 de noviembre de 2026">
        <p>
          Esta política explica cómo trata FinanceGo la información. En resumen: <strong>no hay cuentas y tus datos de aprendizaje se quedan en tu navegador</strong>.
          FinanceGo no los recoge, no los ve y no los comparte.
        </p>

        <h2>Responsable</h2>
        <p>FinanceGo lo gestiona su titular, con quien puedes contactar en {mail} para cualquier pregunta sobre privacidad o sobre esta política.</p>

        <h2>Qué se guarda en tu navegador</h2>
        <p>Para guardar tu progreso, FinanceGo conserva lo siguiente en el almacenamiento local de tu navegador, solo en tu dispositivo:</p>
        <ul>
          <li>Las lecciones completadas, los resultados de práctica y de las evaluaciones, y tu recorrido en el 500 Challenge.</li>
          <li>Las puntuaciones del Mock interview por nivel y los brain teasers que has resuelto.</li>
          <li>Tus planes de entrevista en el Planner (fecha de la entrevista, puesto, nombre de la empresa opcional, tiempo de estudio) y las tareas que marcas.</li>
          <li>Tus historias STAR, candidaturas, objetivos, casillas marcadas en las listas de comprobación, tiempo de estudio y un nombre de pila opcional.</li>
        </ul>
        <p>
          Nada de esto se envía a FinanceGo ni a nadie más. No es una cookie y no se usa para hacer seguimiento. Como solo está en tu dispositivo, no está disponible en otros
          dispositivos ni navegadores.
        </p>

        <h2>Qué no hace FinanceGo</h2>
        <ul>
          <li>No hay cuentas, ni registro, ni cookies de seguimiento.</li>
          <li>No hay analítica, ni publicidad, ni venta o cesión de datos.</li>
          <li>Las fuentes tipográficas y las imágenes se sirven con el propio sitio, no se cargan desde terceros.</li>
        </ul>

        <h2>Alojamiento</h2>
        <p>
          El sitio está alojado en Vercel. Como cualquier proveedor de alojamiento web, Vercel trata datos técnicos necesarios para servir las páginas, como tu dirección IP y el
          tipo de navegador, en registros del servidor de corta duración, por seguridad y para mantener el servicio en funcionamiento. FinanceGo no usa estos registros para
          identificarte. Consulta la política de privacidad de Vercel para más detalles.
        </p>

        <h2>Noticias de mercados y enlaces externos</h2>
        <p>
          La página de Noticias muestra titulares de fuentes públicas de editores externos. Se recopilan cuando se genera el sitio, no desde tu navegador. Si sigues un enlace a
          un artículo, o cualquier otro enlace externo, sales de FinanceGo y se aplica la política de privacidad de ese sitio.
        </p>

        <h2>Si nos escribes</h2>
        <p>
          Si escribes a {mail}, usamos tu dirección de correo y tu mensaje solo para responderte, y los borramos cuando ya no son necesarios. Te pedimos que no envíes
          información financiera personal.
        </p>

        <h2>Tus opciones y derechos</h2>
        <ul>
          <li>
            Exporta, importa o borra de forma permanente todos tus datos de FinanceGo en{" "}
            <Link href="/settings/" className="text-electric hover:underline">
              Ajustes
            </Link>
            . Borrar los datos del sitio en tu navegador también los elimina.
          </li>
          <li>
            Conforme a la normativa de protección de datos (incluido el RGPD), puedes preguntar por cualquier dato personal tuyo que tengamos y pedirnos que lo rectifiquemos o
            suprimamos, escribiendo a {mail}. También puedes presentar una reclamación ante tu autoridad de protección de datos (en España, la Agencia Española de Protección de
            Datos, AEPD).
          </li>
        </ul>

        <h2>Cambios</h2>
        <p>
          Si FinanceGo añade cuentas o cualquier función que envíe datos a un servidor, esta política se actualizará antes para explicar qué se guarda, dónde, durante cuánto
          tiempo y cómo borrarlo.
        </p>
      </LegalPage>
    );
  }
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="24 November 2026">
      <p>
        This policy explains how FinanceGo handles information. In short: <strong>there are no accounts, and your learning data stays in your browser</strong>. FinanceGo
        does not collect it, see it or share it.
      </p>

      <h2>Who is responsible</h2>
      <p>FinanceGo is run by its owner, who can be reached at {mail} for any question about privacy or this policy.</p>

      <h2>What is stored in your browser</h2>
      <p>To save your progress, FinanceGo keeps the following in your browser&apos;s local storage, on your device only:</p>
      <ul>
        <li>Lessons completed, practice and assessment results, and your 500 Challenge path.</li>
        <li>Mock interview scores by level and the brain teasers you have solved.</li>
        <li>Your interview plans in the Planner (interview date, role, optional firm name, study time) and the tasks you tick.</li>
        <li>Your STAR stories, applications, goals, checklist ticks, study time and an optional first name.</li>
      </ul>
      <p>
        None of this is sent to FinanceGo or anyone else. It is not a cookie and is not used for tracking. Because it lives only on your device, it is not available on other
        devices or browsers.
      </p>

      <h2>What FinanceGo does not do</h2>
      <ul>
        <li>No accounts, no sign-up and no tracking cookies.</li>
        <li>No analytics, no advertising and no selling or sharing of data.</li>
        <li>Fonts and images are served with the site, not loaded from third parties.</li>
      </ul>

      <h2>Hosting</h2>
      <p>
        The site is hosted by Vercel. Like any web host, Vercel processes technical data needed to deliver pages, such as your IP address and browser type, in short-lived
        server logs, for security and to keep the service running. FinanceGo does not use these logs to identify you. See Vercel&apos;s own privacy policy for details.
      </p>

      <h2>Markets news and external links</h2>
      <p>
        The News page shows headlines from public feeds of third-party publishers. They are collected when the site is built, not from your browser. If you follow a link to
        an article, or any other external link, you leave FinanceGo and that site&apos;s own privacy policy applies.
      </p>

      <h2>If you email us</h2>
      <p>
        If you write to {mail}, we use your email address and message only to reply, and delete them when they are no longer needed. Please do not send personal financial
        information.
      </p>

      <h2>Your controls and rights</h2>
      <ul>
        <li>
          Export, import or permanently delete all your FinanceGo data in{" "}
          <Link href="/settings/" className="text-electric hover:underline">
            Settings
          </Link>
          . Clearing your browser&apos;s site data also deletes it.
        </li>
        <li>
          Under data protection law (including the GDPR) you can ask about any personal data we hold about you, and ask us to correct or delete it, by writing to {mail}. You
          can also complain to your data protection authority (in Spain, the Agencia Española de Protección de Datos).
        </li>
      </ul>

      <h2>Changes</h2>
      <p>
        If FinanceGo adds accounts or any feature that sends data to a server, this policy will be updated first to explain what is stored, where, for how long and how to
        delete it.
      </p>
    </LegalPage>
  );
}
