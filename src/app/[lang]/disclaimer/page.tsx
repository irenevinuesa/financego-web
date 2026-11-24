import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { getLang } from "@/lib/server-lang";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: lang === "es" ? "Aviso educativo" : "Educational disclaimer" };
}

export default async function DisclaimerPage() {
  const lang = await getLang();
  if (lang === "es") {
    return (
      <LegalPage eyebrow="Legal" title="Aviso educativo" updated="24 de noviembre de 2026">
        <p>
          <strong>FinanceGo es una plataforma educativa.</strong> Nada de lo que aparece en este sitio es una recomendación para comprar, vender o mantener ningún valor, ni
          asesoramiento personalizado de inversión, financiero, fiscal o jurídico. FinanceGo no es un asesor autorizado.
        </p>
        <h2>Calculadoras y modelos</h2>
        <ul>
          <li>Las herramientas calculan resultados a partir de las hipótesis que introduces. Hipótesis distintas dan respuestas distintas.</li>
          <li>Cada herramienta indica sus hipótesis y limitaciones. Simplifican la complejidad del mundo real.</li>
          <li>FinanceGo no ofrece cotizaciones de mercado ni datos de empresas en tiempo real.</li>
        </ul>
        <h2>Ejemplos</h2>
        <p>
          Los ejemplos resueltos usan cifras ilustrativas elegidas para enseñar un concepto. No describen ninguna empresa real salvo que se indique expresamente y se cite la
          fuente.
        </p>
        <h2>Noticias de mercados</h2>
        <p>
          Los titulares de la página de Noticias proceden de editores externos y se muestran tal como ellos los publican. FinanceGo no los verifica y no son una recomendación
          para operar. Consulta la fuente original antes de basarte en ellos.
        </p>
        <h2>Preparación de entrevistas</h2>
        <p>
          Las puntuaciones del Mock interview, los planes de estudio y los resultados de práctica son ayudas para el aprendizaje. No predicen el resultado de ningún proceso de
          selección real.
        </p>
        <h2>Información sobre carreras</h2>
        <p>
          Las guías de carrera describen puestos y procesos en términos generales. Las fases y los plazos de selección varían según la empresa, la región y el año; confirma
          siempre los detalles en los canales oficiales de cada empresa.
        </p>
      </LegalPage>
    );
  }
  return (
    <LegalPage eyebrow="Legal" title="Educational disclaimer" updated="24 November 2026">
      <p>
        <strong>FinanceGo is an educational platform.</strong> Nothing on this site is a recommendation to buy, sell or hold any security, or personalised investment, financial,
        tax or legal advice. FinanceGo is not a licensed adviser.
      </p>
      <h2>Calculators and models</h2>
      <ul>
        <li>Tools calculate results from the assumptions you enter. Different assumptions give different answers.</li>
        <li>Each tool lists its assumptions and limitations. They simplify real-world complexity.</li>
        <li>FinanceGo does not provide live market prices or company data.</li>
      </ul>
      <h2>Examples</h2>
      <p>Worked examples use illustrative numbers chosen to teach a concept. They do not describe any real company unless explicitly stated and sourced.</p>
      <h2>Markets news</h2>
      <p>
        Headlines on the News page come from third-party publishers and are shown as they publish them. FinanceGo does not verify them, and they are not a recommendation to
        trade. Check the original source before relying on any of it.
      </p>
      <h2>Interview preparation</h2>
      <p>
        Mock interview scores, study plans and practice results are learning aids. They do not predict the outcome of any real recruitment process.
      </p>
      <h2>Career information</h2>
      <p>Career guides describe roles and processes in general terms. Recruiting steps and timelines vary by firm, region and year; always confirm details on each firm&apos;s official channels.</p>
    </LegalPage>
  );
}
