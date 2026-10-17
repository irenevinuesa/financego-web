import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Educational disclaimer" };

export default function DisclaimerPage() {
  return (
    <LegalPage eyebrow="Legal" title="Educational disclaimer" updated="17 October 2026">
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
      <h2>Interview Simulator</h2>
      <p>
        Scores are rule-based practice indicators from keyword, number and structure checks. They are not expert assessments and do not predict the outcome of any real
        recruitment process.
      </p>
      <h2>Career information</h2>
      <p>Career guides describe roles and processes in general terms. Recruiting steps and timelines vary by firm, region and year; always confirm details on each firm&apos;s official channels.</p>
    </LegalPage>
  );
}
